import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDriverWithdrawal,
  normalizeDriverPayoutAmount,
  processStripePayoutEvent,
  verifyStripePayoutWebhookSignature,
} from "../src/services/driverPayoutService";

function createSupabaseMock() {
  const state = {
    drivers: [
      {
        id: 1,
        clerk_id: "driver-1",
        email: "driver@example.com",
        first_name: "Lebo",
        last_name: "Khumalo",
        stripe_connected_account_id: "acct_123",
        stripe_account_status: "connected",
        stripe_onboarding_url: null,
      },
    ],
    driver_withdrawals: [],
    stripe_webhook_events: [],
    driver_ledger_entries: [],
  };

  const client = {
    state,
    from(table: string) {
      const rows = state[table as keyof typeof state] as any[];
      return {
        select() {
          return {
            eq(field: string, value: unknown) {
              const matches = rows.filter((row) => row[field] === value);
              return {
                maybeSingle: async () => ({ data: matches[0] ?? null, error: null }),
                in(filterField: string, values: unknown[]) {
                  const filteredMatches = matches.filter((row) => values.includes(row[filterField]));
                  return {
                    eq(nextField: string, nextValue: unknown) {
                      const finalMatch = filteredMatches.find((row) => row[nextField] === nextValue);
                      return {
                        maybeSingle: async () => ({ data: finalMatch ?? null, error: null }),
                      };
                    },
                    maybeSingle: async () => ({ data: filteredMatches[0] ?? null, error: null }),
                  };
                },
              };
            },
            maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
          };
        },
        insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
          const records = Array.isArray(payload) ? payload : [payload];
          for (const record of records) {
            rows.push({ ...record });
          }
          return {
            select() {
              return {
                single: async () => ({ data: records[0], error: null }),
              };
            },
          };
        },
        update(payload: Record<string, unknown>) {
          return {
            eq(field: string, value: unknown) {
              const row = rows.find((entry) => entry[field] === value);
              if (row) Object.assign(row, payload);
              return {
                select() {
                  return {
                    single: async () => ({ data: row ?? payload, error: null }),
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  return client;
}

describe("driver payout flow", () => {
  it("turns R50 into 5000 cents before payout creation", () => {
    assert.equal(normalizeDriverPayoutAmount(50), 5000);
    assert.throws(() => normalizeDriverPayoutAmount(0), /valid withdrawal amount/i);
  });

  it("blocks withdrawals above the connected account available balance", async () => {
    const supabase = createSupabaseMock();
    const stripe = {
      accounts: {
        retrieve: async () => ({
          id: "acct_123",
          payouts_enabled: true,
          capabilities: { transfers: "active" },
        }),
      },
      balance: {
        retrieve: async () => ({
          available: [{ currency: "zar", amount: 4000 }],
          pending: [{ currency: "zar", amount: 0 }],
        }),
      },
      payouts: {
        create: async () => ({ id: "po_456", status: "pending" }),
      },
    } as any;

    await assert.rejects(
      () => createDriverWithdrawal({ stripe, supabase: supabase as any, clerkId: "driver-1", amount: 60 }),
      /insufficient available balance/i,
    );
  });

  it("stores a pending payout and ignores a duplicate webhook event", async () => {
    const supabase = createSupabaseMock();
    const stripe = {
      accounts: {
        retrieve: async () => ({
          id: "acct_123",
          payouts_enabled: true,
          capabilities: { transfers: "active" },
        }),
      },
      balance: {
        retrieve: async () => ({
          available: [{ currency: "zar", amount: 10000 }],
          pending: [{ currency: "zar", amount: 0 }],
        }),
      },
      payouts: {
        create: async () => ({ id: "po_789", status: "paid" }),
      },
    } as any;

    const firstResult = await createDriverWithdrawal({
      stripe,
      supabase: supabase as any,
      clerkId: "driver-1",
      amount: 50,
    });

    assert.equal(firstResult.withdrawal.status, "pending");
    assert.equal(supabase.state.driver_withdrawals.length, 1);

    const event = {
      id: "evt_123",
      type: "payout.paid",
      data: {
        object: {
          id: "po_789",
          amount: 5000,
          currency: "zar",
          metadata: { driver_id: "1" },
          account: "acct_123",
          failure_code: null,
          failure_message: null,
        },
      },
    } as any;

    const processed = await processStripePayoutEvent({
      stripe: stripe as any,
      supabase: supabase as any,
      event,
    });
    assert.equal(processed.processed, true);

    const duplicate = await processStripePayoutEvent({
      stripe: stripe as any,
      supabase: supabase as any,
      event,
    });
    assert.equal(duplicate.duplicate, true);
    assert.equal(supabase.state.driver_withdrawals[0].status, "paid");
  });

  it("marks failed payouts and adds only one ledger reversal", async () => {
    const supabase = createSupabaseMock();
    const stripe = {
      accounts: {
        retrieve: async () => ({
          id: "acct_123",
          payouts_enabled: true,
          capabilities: { transfers: "active" },
        }),
      },
      balance: {
        retrieve: async () => ({
          available: [{ currency: "zar", amount: 10000 }],
          pending: [{ currency: "zar", amount: 0 }],
        }),
      },
      payouts: {
        create: async () => ({ id: "po_failed", status: "pending" }),
      },
    } as any;

    await createDriverWithdrawal({
      stripe,
      supabase: supabase as any,
      clerkId: "driver-1",
      amount: 50,
    });

    const event = {
      id: "evt_failed",
      type: "payout.failed",
      account: "acct_123",
      data: {
        object: {
          id: "po_failed",
          amount: 5000,
          currency: "zar",
          metadata: { driver_id: "1" },
          failure_code: "account_closed",
          failure_message: "The destination account is closed",
        },
      },
    } as any;

    await processStripePayoutEvent({ stripe, supabase: supabase as any, event });
    await processStripePayoutEvent({ stripe, supabase: supabase as any, event });

    assert.equal(supabase.state.driver_withdrawals[0].status, "failed");
    assert.equal(supabase.state.driver_withdrawals[0].failure_reason, "account_closed");
    assert.equal(supabase.state.driver_ledger_entries.length, 2);
    assert.equal(supabase.state.driver_ledger_entries[1].entry_type, "withdrawal_reversal");
    assert.equal(supabase.state.driver_ledger_entries[1].amount_cents, 5000);
  });

  it("rejects an invalid Stripe webhook signature", () => {
    const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    try {
      assert.throws(
        () =>
          verifyStripePayoutWebhookSignature({
            stripe: {
              webhooks: {
                constructEvent: () => {
                  throw new Error("signature verification failed");
                },
              },
            } as any,
            rawBody: Buffer.from("{}"),
            signature: "invalid",
          }),
        /signature verification failed/,
      );
    } finally {
      if (previousSecret === undefined) {
        delete process.env.STRIPE_WEBHOOK_SECRET;
      } else {
        process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
      }
    }
  });

  it("requires completed Connect onboarding before creating a payout", async () => {
    const supabase = createSupabaseMock();
    const stripe = {
      accounts: {
        retrieve: async () => ({ id: "acct_123", payouts_enabled: false }),
      },
      balance: {
        retrieve: async () => ({
          available: [{ currency: "zar", amount: 10000 }],
          pending: [{ currency: "zar", amount: 0 }],
        }),
      },
      payouts: {
        create: async () => ({ id: "po_999", status: "pending" }),
      },
    } as any;

    await assert.rejects(
      () =>
        createDriverWithdrawal({
          stripe,
          supabase: supabase as any,
          clerkId: "driver-1",
          amount: 50,
        }),
      /complete stripe connect onboarding/i,
    );
    assert.equal(supabase.state.driver_withdrawals.length, 0);
  });
});

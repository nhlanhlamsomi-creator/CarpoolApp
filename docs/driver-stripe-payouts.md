# Driver Stripe Sandbox Payout Flow

Driver withdrawals use the shared Render API and Stripe Connect in test mode. The driver app reads the connected account's Stripe balance and payout history; it does not create a local wallet or fake payout. Payout creation and webhook verification run server-side.

## Required environment variables

Add these to the backend `.env` file and Render environment:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
CLERK_SECRET_KEY=sk_...
DRIVER_CLERK_SECRET_KEY=sk_test_<driver-Clerk-instance-secret>
APP_URL=https://your-app.example.com
STRIPE_CONNECT_ACCOUNT_COUNTRY=<eligible ISO country code>
```

In the driver app's `.env`, set:

```env
EXPO_PUBLIC_RENDER_API_URL=https://your-render-api.onrender.com
```

The app only exposes the Render URL and Clerk publishable configuration. Never put a Stripe secret key, webhook secret, or Supabase service-role key in the Expo environment.

The shared Render API uses `CLERK_SECRET_KEY` for passenger and other existing routes. Since the driver app uses a separate Clerk instance, set `DRIVER_CLERK_SECRET_KEY` in Render to the **secret key from the same Clerk development/test instance** as the driver's `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. The driver wallet endpoints alone use this key; do not replace the passenger `CLERK_SECRET_KEY`. Never share or place either Clerk secret key in the Expo app.

`STRIPE_CONNECT_ACCOUNT_COUNTRY` must be a country supported for the platform's Connect configuration and the desired settlement/payout currency. Do not assume that setting `ZA` is supported: Stripe's self-serve cross-border Connect payout availability is limited to specified platform and connected-account regions. If the platform cannot use Connect payouts to the driver's country in ZAR, this exact Connect flow cannot be enabled by changing app code; confirm eligibility with Stripe before onboarding test accounts.

The linked [Global Payouts testing guide](https://docs.stripe.com/global-payouts/testing) describes Stripe's separate Global Payouts product. Its recipient accounts and test helpers are not interchangeable with Connect account payouts created through `stripe.payouts.create`.

## Stripe Connect onboarding

On the driver's Earnings screen, tap **Set up Stripe payouts** and complete the Stripe-hosted test onboarding. The server stores the connected account ID against the driver. The withdrawal action stays disabled until Stripe reports that payouts are enabled and the connected account has at least R50 available.

## Test flow

### Step 1: Start the backend

Before testing against Render, add the matching driver Clerk secret described above to the Render service's environment and redeploy the backend. If the key is absent, driver wallet endpoints return a configuration error rather than attempting verification with the passenger key.

```bash
cd server
npm install
npm run dev
```

### Step 2: Open the passenger app

Open the passenger app and make a booking payment for R50 using the Stripe test card:

- Card number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits

### Step 3: Confirm the payment in Stripe Sandbox

In the Stripe Dashboard (test mode), confirm the PaymentIntent succeeds and that the captured amount matches R50.

### Step 4: Confirm the payment is routed to the driver Stripe Connect account

The server creates the PaymentIntent with Stripe Connect destination transfer data associated with the driver's connected account. Confirm the transfer in Stripe test mode. Stripe can initially show funds as pending; the app only enables withdrawal from the connected account's available ZAR balance.

### Step 5: Open the driver app

Open the driver Earnings screen. If this is the first run, tap **Set up Stripe payouts** and complete test onboarding. Confirm the app's available amount matches Stripe's available ZAR balance.

### Step 6: Press Withdraw

Press **Withdraw** and enter R50. The backend validates the authenticated driver, connected-account payout readiness, and Stripe's available ZAR balance before it creates the test payout. The app shows **Pending** until a signed Stripe webhook changes it to **Paid** or **Failed**.

### Step 7: Trigger the Stripe test payout

Complete the connected account's Stripe-hosted test onboarding with the test external-bank-account details Stripe accepts for that account's country. Use only test details documented for Connect or supplied by the Stripe test onboarding flow; do not use Global Payouts recipient details for a Connect account. Then request the payout through the app. Stripe test mode simulates the payout and never sends real money. Do not mark a database row paid manually.

The `4242` card confirms a successful payment, but does not guarantee the connected account's funds are immediately available for payout. Wait for the connected account's Stripe balance endpoint to report the funds as available. Availability, test bank-account details, and payout timing depend on the platform and connected-account country; confirm eligibility with Stripe before expecting a successful payout.

### Step 8: Expect the webhook events

The backend webhook endpoint listens for:

- `payout.created`
- `payout.updated`
- `payout.paid`
- `payout.failed`

The final status must come from `payout.paid` or `payout.failed`, never from the initial payout API response alone.

Configure the Stripe test-mode webhook destination to send those events to `/api/driver-wallet/webhooks` and set its signing secret as `STRIPE_WEBHOOK_SECRET`. For local testing, Stripe CLI can forward test-mode events to this endpoint; webhook signature verification remains enabled.

### Step 9: Confirm the database

Check the `driver_withdrawals` table and ensure it contains:

- `stripe_payout_id`
- `amount_cents`
- `currency`
- `status`
- `failure_reason` if the payout failed
- `created_at`
- `paid_at` when Stripe marks the payout as paid

The `stripe_webhook_events` table should also contain an entry for each event ID, which prevents duplicate processing.

### Step 10: Confirm the driver app state

The driver app should show:

- Initial: `Pending`
- After successful Stripe payout webhook: `Paid`
- If the payout fails: `Failed`

## Important notes

- Do not use live mode or a fake local wallet.
- The old driver-local withdrawal route is disabled; the app calls the authenticated Render wallet API.
- A successful PaymentIntent alone is not proof that an R50 is immediately available: Stripe settlement can be pending, and Connect country/currency eligibility applies.
- All secret keys stay on the backend only.
- Webhook verification must use `STRIPE_WEBHOOK_SECRET`.
- Duplicate webhook deliveries are ignored because event IDs are stored in `stripe_webhook_events`.

# Driver Stripe Sandbox Payout Flow

This project now uses Stripe Connect in test mode for driver withdrawals. Do not create a local wallet or a fake payout flow. All payout creation and webhook verification runs server-side in the Render/Supabase backend.

## Required environment variables

Add these to the backend `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
CLERK_SECRET_KEY=sk_test_...
APP_URL=https://your-web-app.example.com
```

## Stripe Connect onboarding

Every driver must have a Stripe Connect test account. The backend creates it automatically when the driver requests a wallet or withdrawal, and stores it on the driver row as `stripe_connected_account_id`.

## Test flow

### Step 1: Start the backend

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

### Step 4: Confirm the amount reaches the driver Stripe Connect account

Check the connected account balance in Stripe test mode. The connected account should show an available balance of R50.

### Step 5: Open the driver app

Open the driver earnings/wallet screen and confirm the available balance is `R50`.

### Step 6: Press Withdraw

Press the Withdraw button for R50. The backend creates a real Stripe payout against the driver’s Connect account.

### Step 7: Trigger the Stripe simulated payout

In the Stripe Dashboard test environment, use the payout simulation or a test event for the connected account so Stripe emits a payout event. The payout should move from pending to paid in the test account.

### Step 8: Expect the webhook events

The backend webhook endpoint listens for:

- `payout.created`
- `payout.updated`
- `payout.paid`
- `payout.failed`

The final status must come from `payout.paid` or `payout.failed`, never from the initial payout API response alone.

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
- All secret keys stay on the backend only.
- Webhook verification must use `STRIPE_WEBHOOK_SECRET`.
- Duplicate webhook deliveries are ignored because event IDs are stored in `stripe_webhook_events`.

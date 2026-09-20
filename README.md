# CarpoolGo — DevSphere Inc.

**University of Johannesburg · Department of Applied Information Systems**  
**Sprint 2 Frontend Implementation**

---

# Tech Stack

| Layer | Technology |
| ------ | ---------- |
| Framework | React Native (Expo) |
| Navigation | React Navigation v6 |
| State Management | Zustand |
| Authentication | Clerk (email/password, email verification, Google OAuth, sessions) |
| Backend | Expo API routes with Supabase/Neon profile data |
| Maps | react-native-maps + Google Maps API |
| Payments | Paystack / Flutterwave |
| Security | Clerk password security, Argon2id server service, expo-secure-store |

---

# Project Structure

```text
CarpoolApp/
├── App.jsx
├── firebase.config.js
├── src/
│   ├── theme/
│   │   └── index.js
│   ├── navigation/
│   │   └── AppNavigator.jsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.jsx
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── GetStartedScreen.jsx
│   │   │   ├── RegisterScreen.jsx
│   │   │   └── LoginScreen.jsx
│   │   ├── passenger/
│   │   │   ├── HomeSearchScreen.jsx
│   │   │   ├── TripResultsScreen.jsx
│   │   │   ├── ConfirmBookingScreen.jsx
│   │   │   ├── MyTripsScreen.jsx
│   │   │   └── PassengerProfileScreen.jsx
│   │   ├── driver/
│   │   │   ├── DriverHomeScreen.jsx
│   │   │   ├── CreateTripScreen.jsx
│   │   │   ├── EarningsScreen.jsx
│   │   │   └── DriverProfileScreen.jsx
│   ├── components/
│   │   └── common/
│   │       ├── Button.jsx
│   │       └── Input.jsx
│   └── services/
│       ├── auth.service.js
│       └── payment.service.js
```

---

# Installation

## 1. Install Dependencies

```bash
cd CarpoolApp
npm install
```

## 2. Configure Clerk and Supabase

1. Create a Clerk application and enable email/password, email verification, and Google OAuth.
2. Set the Clerk publishable key used by the Expo client.
3. Create/configure the Supabase project used by the server API routes.
4. Keep the Supabase service-role key server-only. Never prefix it with `EXPO_PUBLIC_`.

---

## 3. Create a `.env` File

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key

# Optional public fallback for development only; do not use it for protected writes.
SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# Optional server-only Argon2id tuning values.
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=4
```

The app's current server client also accepts the equivalent `NEXT_PUBLIC_SUPABASE_URL`,
`EXPO_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or `SUPABASE_ANON_KEY` names where applicable.
Never expose `SUPABASE_SERVICE_ROLE_KEY` or any other secret through an `EXPO_PUBLIC_`
variable.

---

## 4. Run the App

```bash
npx expo start
```

Then scan the QR code using the Expo Go app.

---

# Application Flow

```text
Splash
   │
   ▼
Welcome (4 Onboarding Screens)
   │
   ▼
Get Started
   ├──────────────┐
   ▼              ▼
Passenger      Driver
Register       Register
   │              │
   ▼              ▼
Login          Login
   │              │
   ▼              ▼
Passenger Tabs   Driver Tabs
```

### Passenger Tabs

- Home Search
- Trip Results
- Confirm Booking
- My Trips
- Profile

### Driver Tabs

- Driver Home
- Create Trip
- Earnings
- Profile

---

# Security Features

- Clerk authentication for email/password, email verification, Google OAuth, sessions,
   password changes, and provider-side authentication rate limiting.
- Passwords and password hashes are never stored in React Native state persistence,
   `AsyncStorage`, `SecureStore`, Supabase tables, or API responses.
- Clerk is the active password authority. The app does not create a second password
   login system or duplicate Clerk credentials in its `users` profile table.
- Authentication tokens are stored through Clerk's `expo-secure-store` token cache.
- Input validation is applied before Clerk registration/login and before profile creation.
- Login failures use the generic message `Invalid email or password` and do not expose
   whether an email exists or which credential failed.
- API calls reject absolute `http:` URLs. Production API hosting must use HTTPS; relative
   API routes inherit the scheme of the deployed application origin.
- Profile API responses use explicit column lists and never use `select("*")`, preventing
   future credential columns from being returned to the mobile client.
- South African ID validation (13 digits), phone validation, and verification workflows
   remain part of the application profile security flow.

## Password Hashing

The project includes a reusable server-only Argon2id service at
[`lib/server/passwordHash.ts`](lib/server/passwordHash.ts). It exposes:

```ts
hashPassword(password: string): Promise<string>
verifyPassword(password: string, hash: string): Promise<boolean>
```

The default parameters are deliberately explicit and can be increased through server
environment variables:

```env
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=4
```

The service requires at least eight characters, one uppercase letter, and one number.
It uses Argon2id, generates a unique salt for each hash, rejects invalid passwords, and
returns `false` for malformed verification hashes. It never logs passwords or hashes.

`argon2` is a Node/server dependency and must not be imported into Expo client code.
The current registration and login screens intentionally do not call this service because
Clerk already hashes and verifies those passwords securely on its backend. Adding a
second password verifier would create two authentication authorities and could weaken the
existing Clerk flow.

If first-party backend password authentication is introduced later, use the service on
the backend only:

1. Validate the incoming password and email.
2. Call `hashPassword()` during registration.
3. Store only the returned Argon2id string in a `password_hash` column.
4. Find the account by email during login and call `verifyPassword()`.
5. Return `Invalid email or password` for every authentication failure.
6. Never include `password`, `password_hash`, or credential data in logs or responses.

No password migration is currently required because Clerk owns all application passwords
and the Supabase `users` table stores profile data keyed by `clerk_id` only. Do not add
`password` or reversible encrypted-password columns to that table.

## Authentication Flow

### Registration

1. The sign-up screen validates name, email, and password format locally.
2. Clerk receives the email and password over the configured secure connection.
3. Clerk sends the email verification code and completes the account/session.
4. The app sends only the profile name, email, and Clerk user ID to `/(api)/user`.
5. The profile API stores profile metadata and returns an allowlisted profile object.

The password is never sent to the profile API or stored by this application.

### Login

1. The sign-in screen validates the email and checks that a password was entered.
2. Clerk performs the credential lookup and password verification.
3. On success, the Clerk session becomes active and the app navigates to home.
4. On failure, the app displays only `Invalid email or password`.

Clerk's backend provides the login rate limiting for this active authentication flow.
If a custom credential endpoint is added later, it must add server-side per-account and
per-IP rate limiting before it is exposed to the mobile client.

## Authentication Files

- [`app/(auth)/sign-up.tsx`](app/(auth)/sign-up.tsx): Clerk registration and email verification.
- [`app/(auth)/sign-in.tsx`](app/(auth)/sign-in.tsx): Clerk login with generic errors.
- [`app/(root)/change-password.tsx`](app/(root)/change-password.tsx): Clerk password changes.
- [`lib/auth.ts`](lib/auth.ts): Clerk token cache and Google OAuth profile creation.
- [`app/(api)/user+api.ts`](app/(api)/user+api.ts): allowlisted profile creation only.
- [`lib/fetch.ts`](lib/fetch.ts): client API transport with HTTP rejection.
- [`lib/server/passwordHash.ts`](lib/server/passwordHash.ts): server-only Argon2id utility.
- [`tests/passwordHash.test.ts`](tests/passwordHash.test.ts): hashing and verification tests.

## Password Security Tests

Run the focused tests:

```bash
npx vitest run tests/passwordHash.test.ts
```

Run the complete test suite:

```bash
npx vitest run
```

The tests cover Argon2id output, correct and incorrect verification, unique salts,
invalid/empty passwords, and the configured cost parameters.

---

# Sprint 3 Roadmap

- [ ] Connect Firebase services to every screen.
- [ ] Google Maps trip search.
- [ ] Payment integration (Paystack/Flutterwave).
- [ ] Real-time trip tracking.
- [ ] Push notifications (Firebase Cloud Messaging).
- [ ] Admin dashboard.
- [ ] Safety monitoring.
- [ ] OTP verification.
- [ ] Biometric authentication.

---

# Team

| Member | Role | Responsibility |
| ------ | ---- | -------------- |
| S. Mdala | Project Manager | Project management and process flows |
| M. Sithomola | Backend Developer | Firebase services and Apis|
| N.S. Msomi | Frontend Developer | UI components and screens |
| L.P. Nama | Business Analyst | Requirements gathering |
| T. Macholo | UX/UI Designer | Figma design and navigation |
| G.P. Makwarela | Backend Developer & Database Administrator | Firestore database design and SOS safety features |

---

# License

University of Johannesburg – Department of Applied Information Systems

Sprint 2 Project – CarpoolGo (DevSphere Inc.)

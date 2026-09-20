# Lyft Carpool App — DevSphere Inc.

A Lyft-style carpooling platform for South African commuters, built as a University of Johannesburg project. It has three connected parts: a **Passenger** app, a **Driver** app and an **Admin** dashboard.
**University of Johannesburg · Department of Applied Information Systems**
**Current phase:** Sprint 5–6 — MVP integration and testing
**Status as at:** 03 September 2026

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Status](#project-status)
4. [Getting Started](#getting-started)
5. [Application Flow](#application-flow)
6. [Admin Platform](#admin-platform)
7. [Project Structure](#project-structure)
8. [Security](#security)
9. [Testing](#testing)
10. [Known Limitations](#known-limitations)
11. [Roadmap](#roadmap)
12. [Team](#team)
13. [License](#license)

---

## Features

**Passenger**
- Register, verify email and sign in (email/password or Google)
- Search for trips, view results and book a ride
- Pay for trips through Stripe
- View pickup and drop-off points, live location and route polylines on a map
- Browse pickup hubs on the map

**Driver**
- Driver profile and verification
- Create and manage trips
- Location and availability management
- Active-trip rules (enforced by the backend)

**Admin**
- Clerk sign-in with role-based access control
- Trip management with filtering
- Driver and passenger verification approval
- Payment and pricing management
- Safety monitoring
- User comments and feedback
- Hub management (create, read, update, delete)
- Dashboard statistics and KPIs

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Mobile app | React Native (Expo), TypeScript |
| Navigation | Expo Router / React Navigation |
| State management | Zustand |
| Authentication | Clerk (email/password, email verification, Google OAuth, sessions) |
| Backend | Expo API routes |
| Database | Supabase (PostgreSQL) with database views and Row Level Security |
| Maps & routing | react-native-maps, Google Maps, routing API |
| Payments | Stripe (test mode) |
| Security | Clerk password security, Argon2id server utility, `expo-secure-store` |
| Testing | Vitest |

---

## Project Status

Progress as at **03 September 2026** (Sprint 5–6 progress report).

| Area | Owner | Status | Completion |
| ---- | ----- | ------ | ---------- |
| Admin website development | G. Makwarela | Completed | 80% |
| Admin dashboard UI/UX | G. Makwarela | Completed | 80% |
| Admin backend APIs | G. Makwarela | Completed | 100% |
| Admin Clerk authentication | G. Makwarela | Completed | 100% |
| Admin Supabase integration | G. Makwarela | Completed | 100% |
| Hub management CRUD (admin) | G. Makwarela | Completed | 100% |
| Mobile backend | M. Sithomola | In progress | 70% |
| Supabase migrations | M. Sithomola | Completed | 100% |
| Driver profile APIs | M. Sithomola | Completed | 100% |
| Trip creation and management APIs | M. Sithomola | Completed | 100% |
| Stripe payment integration | M. Sithomola | Completed | 100% |
| Maps and routing integration | M. Sithomola | In progress | 80% |
| Hub system API (mobile) | L. Nama, M. Sithomola | Completed | 100% |
| Time and distance API | M. Sithomola | In progress | 40% |
| Trip cancellation endpoint | M. Sithomola | In progress | 50% |
| Frontend integration | L. Nama, N. Msomi | In progress | 70% |
| UI/UX design | T. Macholo | In progress | 70% |

---

## Getting Started

### Prerequisites

- Node.js (LTS) and npm
- Expo Go on a phone, or an Android/iOS emulator
- A [Clerk](https://clerk.com) application
- A [Supabase](https://supabase.com) project
- A Google Maps API key
- A Stripe account (test mode)

### 1. Clone and install

```bash
git clone https://github.com/nhlanhlamsomi-creator/CarpoolApp.git
cd CarpoolApp
npm install
```

### 2. Configure Clerk

1. Create a Clerk application.
2. Enable email/password, email verification and Google OAuth.
3. Copy the publishable key into your `.env` file (next step).

### 3. Configure Supabase

1. Create a Supabase project.
2. Apply the database migrations to create the trip-related tables, views and Row Level Security policies.
3. Keep the service-role key **server-only**. Never prefix it with `EXPO_PUBLIC_`.

### 4. Create a `.env` file

Create a `.env` file in the project root. It is git-ignored; never commit it.

```env
# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key

# Supabase (server-side)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key

# Optional public fallback for development only; do not use it for protected writes
SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# Google Maps  (confirm variable name against the code)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Stripe test mode  (confirm variable names against the code)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_server_only_key

# Optional server-only Argon2id tuning values
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=4
```

The server client also accepts these alternative Supabase names where applicable: `NEXT_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_ANON_KEY`.

> **Never** expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` or any other secret through an `EXPO_PUBLIC_` variable. Those values are bundled into the mobile app.

### 5. Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` (Android) / `i` (iOS) to open an emulator.

### 6. Run the tests

```bash
npx vitest run
```

---

## Application Flow

```text
Splash
   │
   ▼
Welcome (onboarding)
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

**Passenger tabs:** Home Search · Trip Results · Confirm Booking · My Trips · Profile
**Driver tabs:** Driver Home · Create Trip · Earnings · Profile

---

## Admin Platform

The admin platform is used by administrators to manage the whole system. It authenticates with Clerk, enforces role-based access control, and reads from Supabase through secured queries, database views and Row Level Security.

### Admin API

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/admin/users` | GET | Fetch all users with verification status |
| `/admin/drivers` | GET | Fetch all drivers with verification status |
| `/admin/trips` | GET | Fetch all trips with filtering options |
| `/admin/trips/{id}` | GET | Fetch specific trip details |
| `/admin/trips/{id}` | PUT | Update trip status |
| `/admin/payments` | GET | Fetch all payment transactions |
| `/admin/verifications` | GET | Fetch pending verifications |
| `/admin/verify/{id}` | PUT | Approve or reject driver verification |
| `/admin/hubs` | GET | Fetch all hubs |
| `/admin/hubs` | POST | Create a new hub |
| `/admin/hubs/{id}` | PUT | Update hub details |
| `/admin/hubs/{id}` | DELETE | Delete a hub |
| `/admin/comments` | GET | Fetch user comments and feedback |
| `/admin/stats` | GET | Fetch dashboard statistics and KPIs |

### Hub management

Admins have full CRUD control over pickup hubs. Hubs created in the admin dashboard sync to the mobile apps and appear on the maps in both.

<!-- TODO: add admin dashboard setup/run instructions (folder or repo, install command, dev command, env vars) -->

---

## Project Structure

<!-- TODO: replace with the output of your real folder tree; the paths below are the ones referenced by the auth code -->

```text
CarpoolApp/
├── app/
│   ├── (auth)/
│   │   ├── sign-up.tsx          # Clerk registration + email verification
│   │   └── sign-in.tsx          # Clerk login with generic errors
│   ├── (root)/
│   │   └── change-password.tsx  # Clerk password changes
│   └── (api)/
│       └── user+api.ts          # Allowlisted profile creation
├── lib/
│   ├── auth.ts                  # Clerk token cache + Google OAuth profile creation
│   ├── fetch.ts                 # API transport (rejects HTTP)
│   └── server/
│       └── passwordHash.ts      # Server-only Argon2id utility
└── tests/
    └── passwordHash.test.ts
```

---

## Security

### Authentication

- **Clerk is the single password authority.** It handles email/password, email verification, Google OAuth, sessions, password changes and provider-side rate limiting on sign-in.
- The app does not run a second password system or duplicate Clerk credentials in its own `users` table.
- Passwords and password hashes are never stored in React Native state persistence, `AsyncStorage`, `SecureStore`, Supabase tables or API responses.
- Session tokens are stored via Clerk's `expo-secure-store` token cache.
- Input is validated before Clerk registration/login and before profile creation.
- Login failures always return the generic message `Invalid email or password`, so the app never reveals whether an email exists.
- South African ID (13 digits) and phone validation are part of the profile verification flow.

### Admin access

- Admin API routes require authentication and a role check.
- Supabase Row Level Security policies restrict admin data access.

### API and data

- API calls reject absolute `http:` URLs. Production hosting must use HTTPS.
- Profile API responses use explicit column lists and never `select("*")`, so a future credential column cannot leak to the client.
- The Supabase service-role key and Stripe secret key are server-only.

### Password hashing (Argon2id)

The repo includes a reusable, server-only Argon2id service at [`lib/server/passwordHash.ts`](lib/server/passwordHash.ts):

```ts
hashPassword(password: string): Promise<string>
verifyPassword(password: string, hash: string): Promise<boolean>
```

- Requires at least 8 characters, one uppercase letter and one number.
- Generates a unique salt per hash.
- Returns `false` for malformed hashes; never logs passwords or hashes.
- Cost parameters default to `ARGON2_MEMORY_COST=65536`, `ARGON2_TIME_COST=3`, `ARGON2_PARALLELISM=4` and can be raised via server environment variables.

`argon2` is a Node/server dependency and **must not** be imported into Expo client code. The current sign-up and sign-in screens intentionally do not call this service, because Clerk already hashes and verifies passwords. Adding a second verifier would create two authentication authorities.

If first-party password authentication is introduced later:

1. Validate the email and password.
2. Call `hashPassword()` at registration and store only the returned string in a `password_hash` column.
3. Look up the account by email at login and call `verifyPassword()`.
4. Return `Invalid email or password` for every failure.
5. Add per-account and per-IP rate limiting before exposing the endpoint.
6. Never include `password` or `password_hash` in logs or responses.

### Payments

Payments run through Stripe. Development uses **test mode only**. Never commit live keys.

### Repository hygiene

- `.env` files are git-ignored.
- Use `.env.example` with placeholder values only.
- Before each release, check the repository and history for exposed credentials or API keys.

---

## Testing

Run the full suite:

```bash
npx vitest run
```

Run the password hashing tests only:

```bash
npx vitest run tests/passwordHash.test.ts
```

The password tests cover Argon2id output, correct and incorrect verification, unique salts, invalid and empty passwords, and the configured cost parameters.

### System test cases

| ID | Module | Test case | Status |
| -- | ------ | --------- | ------ |
| TC08 | Admin dashboard | Admin logs in with Clerk and sees dashboard with name and profile | Pass |
| TC09 | Admin dashboard | Admin creates a hub; it appears in the database and mobile app | Pass |
| TC10 | Admin dashboard | Admin approves driver verification; driver status becomes verified | Pass |
| TC11 | Admin dashboard | Admin views trip history with correct data | Pass |
| TC12 | Admin API | Admin fetches all users via API | Pass |
| TC13 | Admin API | Admin updates trip status via API | Pass |
| TC14 | Backend API | Driver creates a trip | Pass |
| TC15 | Backend API | Passenger books a ride; request is linked to driver | Pass |
| TC16 | Payment | Stripe payment is processed with receipt | Pass |
| TC17 | Maps and routing | Route polyline displays between pickup and drop-off | In progress |
| TC18 | Driver app | Driver accepts a ride request; passenger app updates | Planned |
| TC19 | Messaging | Passenger message is delivered to driver in real time | Planned |
| TC20 | Trip lifecycle | Full trip from booking to completion, payment released | Planned |

Still to do: at least 10 automated tests covering valid, invalid and error scenarios, API/payment/calculation testing, end-to-end integration testing, final regression testing and a bug register.

---

## Known Limitations

These are not yet complete and should not be treated as working features:

- Time and distance functionality is not finalised.
- Routing needs final validation.
- Trip cancellation and refund handling is in progress.
- Driver-side ride acceptance and full trip management need final integration.
- K-Means ride/zone optimisation is not implemented.
- Scheduled-trip user interaction is incomplete.
- Real-time passenger–driver messaging is not complete.
- Automated test coverage and final regression testing are outstanding.
- Security documentation is still being completed.

---

## Roadmap

### Remaining for the Sprint 5–6 MVP

- [ ] Finalise the Time and Distance API
- [ ] Dynamic fare calculation
- [ ] K-Means ride/zone optimisation
- [ ] Trip cancellation and refund handling
- [ ] Driver app: ride accept/decline, trip tracking, trip history, earnings and pay-outs
- [ ] Passenger–driver real-time messaging
- [ ] Future-date trip scheduling and scheduled-trip workflow
- [ ] Saved places
- [ ] Stripe test-mode testing, including failure and cancellation scenarios
- [ ] Automated, API, payment and end-to-end tests
- [ ] Bug register, final Git release/tag and updated documentation

### Sprint 7–8 (potential)

- Improved ride matching, routing/ETA and fare calculation
- Expanded analytics and improved notifications
- Improved driver earnings and hub functionality
- Refinement of scheduled trips
- Performance optimisation, expanded security controls and additional automated testing
- Usability improvements

---

## Team

| Member | Role | Responsibility |
| ------ | ---- | -------------- |
| S. Mdala | Project Manager | Project management and process flows |
| L.P. Nama | Business Analyst | Requirements gathering |
| T. Macholo | UX/UI Designer | Figma design and navigation |
| N.S. Msomi | Frontend Developer | UI components and screens |
| M. Sithomola | Backend Developer | Supabase migrations, driver and trip APIs, Stripe payments, maps and routing |
| G.P. Makwarela | Database Administrator & Backend Developer | Admin dashboard and APIs, Clerk authentication, Supabase database administration, hub management, security |



---

## License

University of Johannesburg – Department of Applied Information Systems

Sprint 5–6 MVP – CarpoolGo (DevSphere Inc.)

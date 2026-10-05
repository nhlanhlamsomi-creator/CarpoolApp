# HopOn Carpool App — DevSphere Inc.

HopOn is a smart carpooling platform for South African commuters, developed as a University of Johannesburg project. The system consists of three connected applications: a Passenger mobile app, a Driver mobile app, and an Admin web application.

**University of Johannesburg · Department of Applied Information Systems**

**Current Phase:** Sprint 7–8 — MVP Integration, Testing and Release Preparation
**Status:** MVP feature-complete; deployment and UAT in progress

---

## Table of Contents

* Features
* Tech Stack
* Project Status
* Getting Started
* Application Flow
* Admin Platform
* Project Structure
* Security
* Testing
* Known Limitations
* Roadmap
* Team
* License

---

# Features

## Passenger

* Register, verify email and sign in using email/password or Google
* Manage passenger profile
* Search for available rides
* View available trips and compare ride information
* Book rides
* Cancel rides
* Make payments through Stripe
* Manage bookings and trips
* Communicate with drivers
* View pickup and drop-off locations
* View routes and location information on maps
* Browse pickup hubs
* Passenger grouping
* HopOn Groups
* Passenger SOS and safety functionality
* Rate drivers after completed trips

## Driver

* Driver registration and authentication
* Driver profile management
* Driver verification
* Driver licence verification
* Create trip offers
* Manage available seats
* Manage ride requests
* Accept and manage rides
* Manage active trips
* Communicate with passengers
* View trip and route information
* Location and route functionality
* Hub functionality
* View earnings
* Request withdrawals

## Admin

* Clerk authentication
* Role-based access control
* Dashboard statistics and KPIs
* User management
* Driver management
* Passenger management
* Driver verification management
* Trip management and filtering
* Payment monitoring
* Pricing and fare management
* Safety monitoring
* Passenger SOS monitoring
* Safety alert management
* User comments and feedback
* Hub management
* Create, read, update and delete hubs
* Administrative verification workflows

---

# Tech Stack

| Layer                 | Technology                         |
| --------------------- | ---------------------------------- |
| Passenger Mobile App  | React Native, Expo, TypeScript     |
| Driver Mobile App     | React Native, Expo, TypeScript     |
| Admin Web App         | React, Vite                        |
| Navigation            | Expo Router / React Navigation     |
| State Management      | Zustand                            |
| Authentication        | Clerk                              |
| Backend               | Node.js / API Services             |
| Database              | PostgreSQL / Supabase              |
| Database Security     | Row Level Security                 |
| Maps & Routing        | Google Maps                        |
| Payments              | Stripe                             |
| Identity Verification | Didit                              |
| Security              | Clerk, expo-secure-store, Argon2id |
| Testing               | Vitest                             |
| Version Control       | GitHub                             |

---

# Project Status

The Sprint 7–8 phase expanded the earlier MVP into a more integrated and feature-complete carpooling platform.

| Area                         | Status      |
| ---------------------------- | ----------- |
| Passenger functionality      | Complete    |
| Driver functionality         | Complete    |
| Admin functionality          | Complete    |
| Backend integration          | Complete    |
| Database integration         | Complete    |
| Authentication               | Complete    |
| Payments                     | Complete    |
| Identity verification        | Complete    |
| Safety and SOS functionality | Complete    |
| Automated testing            | Complete    |
| Integration testing          | Complete    |
| Deployment                   | In Progress |
| User Acceptance Testing      | In Progress |

Sprint 7–8 focused on expanding and integrating:

* HopOn Groups and passenger grouping
* Hubs
* Route calculation
* Trip offers
* Ride booking
* Payment functionality
* Driver and passenger communication
* Identity verification
* Passenger SOS functionality
* Ride and trip management
* Driver earnings and withdrawals
* Administrative functionality

---

# Getting Started

## Prerequisites

* Node.js (LTS) and npm
* Expo Go on a phone, or an Android/iOS emulator
* A Clerk application
* A Supabase project
* A Google Maps API key
* A Stripe account in test mode
* Required identity verification configuration

## 1. Clone and Install

```bash
git clone https://github.com/nhlanhlamsomi-creator/CarpoolApp.git
cd CarpoolApp
npm install
```

## 2. Configure Clerk

Create a Clerk application.

Enable:

* Email/password authentication
* Email verification
* Google OAuth
* Session management

Add the Clerk publishable key to `.env.local` and the relevant EAS environments.

## 3. Configure Supabase

Create a Supabase project.

Apply the database migrations required for:

* Users
* Drivers
* Profiles
* Trips
* Ride bookings
* Ride requests
* Messages
* Hubs
* Payments
* Earnings
* Withdrawals
* Safety alerts
* Verification information
* Passenger grouping

Keep the Supabase service-role key server-only.

**Never prefix the service-role key with `EXPO_PUBLIC_`.**

## 4. Configure Environment Variables

Copy `.env.example` to `.env.local`.

Example:

```env
EXPO_PUBLIC_API_URL=https://your-render-service.onrender.com
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_restricted_google_maps_key
EXPO_PUBLIC_DIRECTIONS_API_KEY=your_restricted_google_maps_key
EXPO_PUBLIC_GEOAPIFY_API_KEY=your_restricted_geoapify_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

Set the same required Expo public variables in the EAS preview and production environments.

Backend secrets must be configured separately on the backend hosting platform.

Never put the following values in an `EXPO_PUBLIC_` variable:

```text
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
CLERK_SECRET_KEY
CHECK_ID_API_KEY
```

Expo public variables are bundled into the mobile application and must therefore not contain sensitive server credentials.

## 5. Run the App

```bash
npx expo start
```

Scan the QR code with Expo Go, or press:

```text
a
```

for Android or:

```text
i
```

for iOS.

## 6. Run the Tests

```bash
npx vitest run
```

---

# Application Flow

```text
Splash
   │
   ▼
Welcome / Onboarding
   │
   ▼
Get Started
   │
   ├───────────────┐
   ▼               ▼
Passenger         Driver
Register          Register
   │               │
Login             Login
   │               │
   ▼               ▼
Passenger Tabs    Driver Tabs
```

## Passenger Flow

```text
Home
  │
  ▼
Search for Ride
  │
  ▼
Trip Results
  │
  ▼
Select Ride
  │
  ▼
Trip Information
  │
  ▼
Confirm Booking
  │
  ▼
Payment
  │
  ▼
My Trips
  │
  ├── Messaging
  ├── Trip Management
  └── Safety / SOS
```

## Driver Flow

```text
Driver Home
     │
     ▼
Create Trip Offer
     │
     ▼
Ride Requests
     │
     ▼
Manage Requests
     │
     ▼
Trip Management
     │
     ▼
Trip Completion
     │
     ▼
Earnings
     │
     ▼
Withdrawals
```

---

# Admin Platform

The HopOn Admin Platform is used to manage and monitor the platform.

It authenticates administrators through Clerk and uses role-based access control to protect administrative functionality.

The Admin Platform communicates with backend services and the Supabase PostgreSQL database through secured queries, database views and Row Level Security.

## Admin API

| Endpoint               | Method | Description                                |
| ---------------------- | ------ | ------------------------------------------ |
| `/admin/users`         | GET    | Fetch all users with verification status   |
| `/admin/drivers`       | GET    | Fetch all drivers with verification status |
| `/admin/trips`         | GET    | Fetch all trips with filtering options     |
| `/admin/trips/{id}`    | GET    | Fetch specific trip details                |
| `/admin/trips/{id}`    | PUT    | Update trip status                         |
| `/admin/payments`      | GET    | Fetch payment transactions                 |
| `/admin/verifications` | GET    | Fetch pending verifications                |
| `/admin/verify/{id}`   | PUT    | Approve or reject driver verification      |
| `/admin/hubs`          | GET    | Fetch all hubs                             |
| `/admin/hubs`          | POST   | Create a new hub                           |
| `/admin/hubs/{id}`     | PUT    | Update hub details                         |
| `/admin/hubs/{id}`     | DELETE | Delete a hub                               |
| `/admin/comments`      | GET    | Fetch user comments and feedback           |
| `/admin/stats`         | GET    | Fetch dashboard statistics and KPIs        |

## Hub Management

Administrators have full CRUD control over pickup hubs.

Hubs are stored in Supabase and are available to the relevant mobile application functionality for pickup and drop-off organisation.

---

# Project Structure

```text
CarpoolApp/
├── app/
│   ├── (auth)/
│   │   ├── sign-up.tsx
│   │   └── sign-in.tsx
│   │
│   ├── (root)/
│   │   └── change-password.tsx
│   │
│   └── (api)/
│       └── user+api.ts
│
├── lib/
│   ├── auth.ts
│   ├── fetch.ts
│   │
│   └── server/
│       └── passwordHash.ts
│
└── tests/
    └── passwordHash.test.ts
```

---

# Security

## Authentication

Clerk is the authentication provider for HopOn.

It handles:

* Email/password authentication
* Email verification
* Google OAuth
* Sessions
* Password changes
* Authentication security

The application does not maintain a separate password authentication system.

Passwords and password hashes are never stored in React Native state persistence, AsyncStorage, SecureStore, Supabase tables or API responses.

Session tokens are managed through Clerk's secure token cache.

Input is validated before Clerk registration/login and before profile creation.

Login failures use generic authentication messages so the application does not reveal whether an account exists.

South African ID and phone validation are included as part of the profile verification workflow.

## Admin Access

Admin API routes require authentication and appropriate role authorisation.

Supabase Row Level Security policies restrict access to protected administrative data.

## API and Data Security

* API calls reject absolute `http:` URLs.
* Production services must use HTTPS.
* Profile API responses use explicit column lists.
* Sensitive credentials are never returned to clients.
* The Supabase service-role key is server-only.
* Stripe secret keys are server-only.
* Clerk secret keys are server-only.
* Provider credentials are server-only.

## Password Hashing

The repository includes a reusable server-only Argon2id utility:

```text
lib/server/passwordHash.ts
```

Available functions:

```text
hashPassword(password: string): Promise<string>
verifyPassword(password: string, hash: string): Promise<boolean>
```

The service:

* Generates a unique salt for every hash.
* Returns `false` for malformed hashes.
* Never logs passwords or password hashes.
* Uses configurable Argon2id cost parameters.

Argon2 is a Node/server dependency and must not be imported into Expo client code.

Clerk remains the authentication authority for the current application.

---

# Payments

Payments are processed through Stripe.

Development and testing use Stripe test mode.

Never commit live Stripe credentials or secret keys to the repository.

---

# Identity Verification

HopOn includes identity verification functionality to support user verification, particularly within the driver verification workflow.

The identity verification service is accessed through the appropriate backend functionality.

Provider credentials must remain server-side and must never be included in `EXPO_PUBLIC_` variables.

---

# Safety and SOS

HopOn includes passenger safety functionality and an SOS workflow.

Safety information is stored in Supabase through the safety alert system and can be monitored through the Admin Platform.

The MVP includes:

* Passenger SOS functionality
* Safety alerts
* Administrative safety monitoring
* Safety status management
* Safety-related database records

Advanced real-time notification and escalation capabilities may require further development.

---

# Testing

Testing was performed throughout development to verify application functionality, integration and system quality.

Testing activities include:

* Automated testing
* Integration testing
* Regression testing
* Smoke testing
* User Acceptance Testing

The automated test suite covers areas including:

* Business rules
* Safety functionality
* K-means/grouping functionality
* Identity verification
* Password hashing
* User APIs

Run the complete test suite:

```bash
npx vitest run
```

Run the password hashing tests only:

```bash
npx vitest run tests/passwordHash.test.ts
```

Detailed test cases, execution results, coverage reports and screenshots are maintained in the Testing submission.

---

# System Test Cases

| ID   | Module           | Test Case                                                   | Status |
| ---- | ---------------- | ----------------------------------------------------------- | ------ |
| TC08 | Admin Dashboard  | Admin logs in with Clerk and views the dashboard            | Pass   |
| TC09 | Admin Dashboard  | Admin creates a hub and it appears in the system            | Pass   |
| TC10 | Admin Dashboard  | Admin approves driver verification                          | Pass   |
| TC11 | Admin Dashboard  | Admin views trip history                                    | Pass   |
| TC12 | Admin API        | Admin fetches users through the API                         | Pass   |
| TC13 | Admin API        | Admin updates trip status through the API                   | Pass   |
| TC14 | Backend API      | Driver creates a trip                                       | Pass   |
| TC15 | Backend API      | Passenger books a ride linked to a driver                   | Pass   |
| TC16 | Payment          | Stripe payment is processed                                 | Pass   |
| TC17 | Maps and Routing | Route displays between pickup and drop-off                  | Pass   |
| TC18 | Driver App       | Driver manages ride requests                                | Pass   |
| TC19 | Messaging        | Passenger and driver communicate                            | Pass   |
| TC20 | Trip Lifecycle   | Trip progresses through the booking and completion workflow | Pass   |

---

# Check ID Verification

The identity-verification workflow sends a normalized South African ID number to the authenticated backend endpoint.

The backend communicates with the configured identity-verification provider.

For local development, configure the provider key in the backend environment.

Example:

```text
CHECK_ID_API_KEY=your_provider_key
```

Do not add the provider key to Expo or an `EXPO_PUBLIC_*` variable.

The identity verification process validates the supplied ID and can return demographic information supported by the provider.

The service does not by itself prove that the person presenting the ID is the rightful owner unless the configured verification workflow explicitly provides that capability.

---

# Repository Hygiene

* `.env` files are git-ignored.
* Use `.env.example` with placeholder values only.
* Never commit API keys or authentication secrets.
* Never commit Stripe secret keys.
* Never commit Supabase service-role keys.
* Never commit Clerk secret keys.
* Never commit identity-verification provider credentials.
* Review the repository and Git history for accidentally exposed credentials before releases.

---

# Known Limitations

The following areas remain subject to final release verification or refinement:

* Deployment is still in progress.
* User Acceptance Testing is still in progress.
* Some UI refinements may remain.
* Advanced real-time SOS notification and escalation may require additional development.
* Final release verification and operational readiness are still required.
* Some deployment evidence is still being finalised.

---

# Roadmap

## Final MVP Release

* Complete deployment verification
* Complete User Acceptance Testing
* Finalise release evidence
* Complete final regression testing
* Finalise bug register
* Verify security configuration
* Verify production environment variables
* Finalise project documentation
* Create final Git release/tag

## Future Improvements

* Improved ride matching
* Improved routing and ETA
* Improved fare calculation
* Expanded analytics
* Improved notifications
* Enhanced driver earnings functionality
* Improved hub functionality
* Enhanced scheduled-trip workflows
* Saved places
* Advanced safety notifications and escalation
* Performance optimisation
* Expanded automated testing
* Additional usability improvements

---
## Team

| Member | Role |
| --- | --- |
| S. Mdala | Project Manager |
| L. Nama | Business Analyst |
| T. Macholo | UI/UX Designer & Software Tester |
| N. S. Msomi | Frontend Developer |
| M. Sithomola | Backend Developer |
| G. P. Makwarela | Database Administrator & Backend Developer |

---

# License

University of Johannesburg
Department of Applied Information Systems

**HopOn Carpool App — DevSphere Inc.**

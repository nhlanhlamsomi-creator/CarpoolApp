# CarpoolGo — DevSphere Inc.
**University of Johannesburg · Department of Applied Information Systems**
Sprint 2 Frontend Implementation

---

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | React Native (Expo) |
| Navigation | React Navigation v6 |
| State | Zustand |
| Backend | Firebase (Auth + Firestore + Storage) |
| Maps | react-native-maps + Google Maps API |
| Payments | Paystack / Flutterwave (integrate in payment.service.js) |
| Security | expo-secure-store (tokens), Firebase Security Rules |

---

## Project Structure
```
CarpoolApp/
├── App.jsx                    # Entry point
├── firebase.config.js         # Firebase init (add your keys)
├── src/
│   ├── theme/index.js         # Colors, typography, spacing
│   ├── navigation/
│   │   └── AppNavigator.jsx   # All routes + tab configs
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.jsx
│   │   │   ├── WelcomeScreen.jsx    # Onboarding slides (matches Figma)
│   │   │   ├── GetStartedScreen.jsx
│   │   │   ├── RegisterScreen.jsx   # Passenger + Driver multi-step
│   │   │   └── LoginScreen.jsx
│   │   ├── passenger/
│   │   │   ├── HomeSearchScreen.jsx
│   │   │   ├── TripResultsScreen.jsx
│   │   │   ├── ConfirmBookingScreen.jsx
│   │   │   ├── MyTripsScreen.jsx
│   │   │   └── PassengerProfileScreen.jsx
│   │   └── driver/
│   │       ├── DriverHomeScreen.jsx
│   │       ├── CreateTripScreen.jsx
│   │       ├── EarningsScreen.jsx
│   │       └── DriverProfileScreen.jsx
│   ├── components/
│   │   └── common/
│   │       ├── Button.jsx     # Reusable button (4 variants)
│   │       └── Input.jsx      # Reusable input with validation
│   └── services/
│       └── auth.service.js    # Firebase auth wrapper
```

---

## Setup

### 1. Install dependencies
```bash
cd CarpoolApp
npm install
```

### 2. Configure Firebase
- Go to [Firebase Console](https://console.firebase.google.com)
- Create project → Add Android + iOS app
- Copy config into `firebase.config.js`
- Enable: Authentication (Email/Password + Google), Firestore, Storage

### 3. Create `.env` file
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000
EXPO_PUBLIC_FIREBASE_APP_ID=1:000:web:000
```

### 4. Run the app
```bash
npx expo start
# Scan QR code with Expo Go app
```

---

## Screen Flow (matches Figma)
```
Splash → Welcome (4 onboarding slides) → GetStarted
    ├── Register (Passenger) → Login → PassengerTabs
    │       ├── HomeSearch → TripResults → ConfirmBooking
    │       ├── MyTrips
    │       └── Profile
    └── Register (Driver) → Login → DriverTabs
            ├── DriverHome
            ├── CreateTrip
            ├── Earnings
            └── DriverProfile
```

---

## Security Implemented
- ✅ Passwords never stored locally — Firebase handles auth
- ✅ Tokens stored in expo-secure-store (encrypted, not AsyncStorage)
- ✅ Role-based navigation routing (passenger vs driver vs admin)
- ✅ Form validation with clear error messages
- ✅ SA ID number validation (13 digits)
- ✅ SA phone number validation (+27 format)
- ✅ Password minimum 8 characters enforced
- ✅ Only last 4 digits of ID stored in Firestore
- ⏳ Firebase Security Rules (configure in Firebase Console)
- ⏳ OTP verification (add with expo-sms or Firebase Phone Auth)
- ⏳ Biometric login (add with expo-local-authentication)

---

## Next Steps (Sprint 3)
- [ ] Connect Firebase services to all screens
- [ ] Add Google Maps integration to trip search
- [ ] Implement payment flow (Paystack)
- [ ] Add real-time trip tracking (Firestore listeners)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Admin dashboard screens
- [ ] Safety monitoring integration
- [ ] OTP verification on registration

---

## Team
| Member | Role | Screens |
|---|---|---|
| S Mdala | Project Manager | Process flows |
| M Sithomola | Backend Developer | Firebase services |
| NS Msomi | Frontend Developer | Screen components |
| LP Nama | Business Analyst | Requirements |
| T Macholo | UX/UI Designer | Navigation/Figma |
| GP Makwarela | Database Admin | Firestore schema |

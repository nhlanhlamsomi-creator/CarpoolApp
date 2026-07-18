import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const extra = Constants.expoConfig?.extra || {};

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyAnLukVgHPN8haTTYNZl4sxfrMhB-ZMXuM',
  authDomain: extra.FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || 'carpool-30ad2.firebaseapp.com',
  databaseURL: extra.FIREBASE_DATABASE_URL || process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || 'https://carpool-30ad2-default-rtdb.firebaseio.com',
  projectId: extra.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'carpool-30ad2',
  storageBucket: extra.FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || 'carpool-30ad2.firebasestorage.app',
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '897839971970',
  appId: extra.FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '1:897839971970:web:d2ad195308270d80503e9b',
  measurementId: extra.FIREBASE_MEASUREMENT_ID || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || 'G-8YK6V9M3WE',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if (error?.code !== 'auth/already-initialized') {
    console.warn('Firebase auth initialization warning:', error);
  }
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
export default app;

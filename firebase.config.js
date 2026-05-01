/**
 * firebase.config.js
 * 
 * FRONTEND DEMO MODE — Firebase not connected yet.
 * To connect: add your keys to .env and uncomment the real config below.
 * Sprint 3 will wire this up fully.
 */

// Stub exports so imports don't break during frontend development
export const auth    = null;
export const db      = null;
export const storage = null;
export default null;

/*
// REAL CONFIG — uncomment when ready for backend:
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth    = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
*/

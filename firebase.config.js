import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAnLukVgHPN8haTTYNZl4sxfrMhB-ZMXuM',
  authDomain: 'carpool-30ad2.firebaseapp.com',
  projectId: 'carpool-30ad2',
  storageBucket: 'carpool-30ad2.firebasestorage.app',
  messagingSenderId: '897839971970',
  appId: '1:897839971970:web:d2ad195308270d80503e9b',
  measurementId: 'G-8YK6V9M3WE',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;


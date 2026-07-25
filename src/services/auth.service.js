<<<<<<< HEAD
/**
 * auth.service.js — Frontend stub
 * Firebase Auth wired in Sprint 3.
 * All logic handled by AuthContext mock for now.
 */

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase.config';

export async function register(form) {
  return { uid: 'user_' + Date.now(), role: form.role };
=======
﻿/**
 * auth.service.js — Firebase auth bridge for the frontend.
 */

import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase.config';

export async function register(form) {
  throw new Error('Use AuthContext.register instead');
>>>>>>> f408656f7dda5ebd70147127b48d97fb24bbf636
}

export async function login(email, password) {
  throw new Error('Use AuthContext.login instead');
}

export async function logout() {
  throw new Error('Use AuthContext.logout instead');
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function getCachedUser() {
<<<<<<< HEAD
  return null;
}

export function onAuthChange(callback) {
  return () => {};
}
=======
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user || null);
  });
}
>>>>>>> f408656f7dda5ebd70147127b48d97fb24bbf636

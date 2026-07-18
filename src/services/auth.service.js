/**
 * auth.service.js — Firebase auth bridge for the frontend.
 */

import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase.config';

export async function register(form) {
  throw new Error('Use AuthContext.register instead');
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
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user || null);
  });
}

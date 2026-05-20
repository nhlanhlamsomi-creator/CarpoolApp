/**
 * auth.service.js — Frontend stub
 * Firebase Auth wired in Sprint 3.
 * All logic handled by AuthContext mock for now.
 */

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase.config';

export async function register(form) {
  return { uid: 'user_' + Date.now(), role: form.role };
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
  return null;
}

export function onAuthChange(callback) {
  return () => {};
}
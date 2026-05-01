/**
 * auth.service.js — Frontend stub
 * Firebase Auth wired in Sprint 3.
 * All logic handled by AuthContext mock for now.
 */

export async function register(form) {
  return { uid: 'user_' + Date.now(), role: form.role };
}

export async function login(email, password) {
  return null;
}

export async function logout() {}

export async function resetPassword(email) {}

export async function getCachedUser() {
  return null;
}

export function onAuthChange(callback) {
  return () => {};
}
import * as SecureStore from 'expo-secure-store';

/**
 * rateLimiter.js
 * 
 * Prevents brute-force login attacks by tracking failed attempts.
 * After 5 failed attempts → lock the account for 15 minutes.
 * Persists across app restarts via SecureStore.
 */

const ATTEMPTS_KEY = 'carpoolgo_login_attempts';
const LOCKOUT_KEY = 'carpoolgo_login_lockout';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function recordFailedAttempt(email) {
  const key = `${ATTEMPTS_KEY}_${email.toLowerCase()}`;
  const raw = await SecureStore.getItemAsync(key);
  const data = raw ? JSON.parse(raw) : { count: 0, firstAttempt: Date.now() };

  // Reset window if more than 15 minutes since first attempt
  if (Date.now() - data.firstAttempt > LOCKOUT_DURATION_MS) {
    data.count = 0;
    data.firstAttempt = Date.now();
  }

  data.count += 1;

  if (data.count >= MAX_ATTEMPTS) {
    // Set lockout
    const lockoutKey = `${LOCKOUT_KEY}_${email.toLowerCase()}`;
    await SecureStore.setItemAsync(lockoutKey, (Date.now() + LOCKOUT_DURATION_MS).toString());
  }

  await SecureStore.setItemAsync(key, JSON.stringify(data));
  return data.count;
}

export async function clearAttempts(email) {
  const key = `${ATTEMPTS_KEY}_${email.toLowerCase()}`;
  const lockoutKey = `${LOCKOUT_KEY}_${email.toLowerCase()}`;
  await SecureStore.deleteItemAsync(key);
  await SecureStore.deleteItemAsync(lockoutKey);
}

/**
 * Returns: { locked: false } or { locked: true, minutesLeft: N }
 */
export async function checkLockout(email) {
  const lockoutKey = `${LOCKOUT_KEY}_${email.toLowerCase()}`;
  const raw = await SecureStore.getItemAsync(lockoutKey);
  if (!raw) return { locked: false };

  const lockoutUntil = parseInt(raw, 10);
  const now = Date.now();

  if (now < lockoutUntil) {
    const minutesLeft = Math.ceil((lockoutUntil - now) / 60000);
    return { locked: true, minutesLeft };
  }

  // Lockout expired — clean up
  await SecureStore.deleteItemAsync(lockoutKey);
  return { locked: false };
}

export async function getRemainingAttempts(email) {
  const key = `${ATTEMPTS_KEY}_${email.toLowerCase()}`;
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return MAX_ATTEMPTS;
  const data = JSON.parse(raw);
  return Math.max(0, MAX_ATTEMPTS - data.count);
}

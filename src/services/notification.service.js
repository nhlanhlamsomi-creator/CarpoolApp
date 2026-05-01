/**
 * notification.service.js
 * Frontend stub — Firebase Cloud Messaging wired in Sprint 3.
 * All functions are safe no-ops so the app runs without Firebase.
 */

export async function registerForPushNotifications(userId) {
  console.log('Push notifications: will connect to FCM in Sprint 3');
  return null;
}

export function listenToNotifications({ onNotification, onTap }) {
  return () => {}; // cleanup no-op
}

export async function clearBadge() {}

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  DRIVER_ARRIVING:   'driver_arriving',
  TRIP_STARTED:      'trip_started',
  TRIP_COMPLETED:    'trip_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  PAYMENT_RECEIVED:  'payment_received',
  SAFETY_ALERT:      'safety_alert',
  NEW_RATING:        'new_rating',
};

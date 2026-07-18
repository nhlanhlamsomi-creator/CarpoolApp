/**
 * trips.service.js — Frontend stub
 * Firestore wired in Sprint 3.
 * Screens use mockData.js directly for now.
 */

import { MOCK_TRIPS, MOCK_BOOKINGS, MOCK_DRIVER_TRIPS } from '../data/mockData';

export async function createTrip(data) {
  console.log('createTrip (mock):', data);
  return 'trip_' + Date.now();
}

export async function searchTrips({ from, to }) {
  return MOCK_TRIPS.filter(t =>
    t.from.toLowerCase().includes(from?.toLowerCase() || '') ||
    t.to.toLowerCase().includes(to?.toLowerCase() || '')
  );
}

export async function getTrip(tripId) {
  return MOCK_TRIPS.find(t => t.id === tripId) || null;
}

export async function getDriverTrips(driverUid) {
  return MOCK_DRIVER_TRIPS;
}

export async function updateTripStatus(tripId, status) {
  console.log('updateTripStatus (mock):', tripId, status);
}

export async function cancelTrip(tripId) {
  console.log('cancelTrip (mock):', tripId);
}

export function listenToTrip(tripId, callback) {
  const trip = MOCK_TRIPS.find(t => t.id === tripId);
  if (trip) callback(trip);
  return () => {};
}

export async function bookSeat({ tripId, passengerUid, driverUid }) {
  console.log('bookSeat (mock):', tripId);
  return 'booking_' + Date.now();
}

export async function cancelBooking(bookingId, tripId, minutesSinceBooking) {
  console.log('cancelBooking (mock):', bookingId);
  return { cancellationFee: minutesSinceBooking > 5 ? 10 : 0 };
}

export async function getPassengerBookings(passengerUid) {
  return MOCK_BOOKINGS;
}

export async function submitRating({ tripId, score, comment }) {
  console.log('submitRating (mock):', tripId, score);
}
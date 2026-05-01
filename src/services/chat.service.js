/**
 * chat.service.js — Frontend stub
 * Firestore real-time chat wired in Sprint 3.
 * TripChatScreen uses mockData.js directly for now.
 */

import { MOCK_MESSAGES } from '../data/mockData';

export async function sendMessage({ tripId, senderUid, senderName, senderRole, text }) {
  console.log('sendMessage (mock):', text);
}

export function listenToMessages(tripId, callback) {
  callback(MOCK_MESSAGES);
  return () => {};
}

export async function markAsRead(tripId, userId) {}

export function formatMessageTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
}
import { describe, expect, it } from 'vitest';

import {
    crossCheckProfile,
    formatIdNumber,
    normaliseIdNumber,
    validateSaIdNumber,
} from '../lib/sa-id';
import {
    formatDate,
    formatTime,
    isDriverVisible,
    sortRides,
} from '../lib/utils';

describe('South African ID validation', () => {
  it('normalises spaces and dashes', () => {
    expect(normaliseIdNumber(' 01 0101-1234 081 ')).toBe('0101011234081');
  });

  it('accepts a valid South African ID number', () => {
    const result = validateSaIdNumber('0101011234081');

    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('Expected valid result');
    expect(result.idNumber).toBe('0101011234081');
    expect(result.dateOfBirth).toBe('2001-01-01');
    expect(result.gender).toBe('female');
    expect(result.citizenship).toBe('citizen');
  });

  it('rejects non-numeric ID numbers', () => {
    const result = validateSaIdNumber('010101A234081');

    expect(result).toEqual({
      valid: false,
      error: 'An ID number contains digits only',
    });
  });

  it('rejects IDs with the wrong length', () => {
    expect(validateSaIdNumber('0101011234')).toEqual({
      valid: false,
      error: "That's only 10 digits — an ID number has 13",
    });
  });

  it('rejects impossible DOB values', () => {
    expect(validateSaIdNumber('0101991234081')).toEqual({
      valid: false,
      error: "The date in that ID number isn't valid",
    });
  });

  it('rejects IDs with an invalid checksum', () => {
    const result = validateSaIdNumber('1204051234082');

    expect(result.valid).toBe(false);
    if (result.valid) throw new Error('Expected invalid result');
    expect(result.error).toBe("That ID number isn't valid. Check for a typo.");
  });

  it('formats an ID as 000000 0000 000', () => {
    expect(formatIdNumber('0101011234081')).toBe('010101 1234 081');
  });

  it('flags mismatched profile data against the ID', () => {
    const result = validateSaIdNumber('0101011234081');

    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('Expected valid ID');

    expect(
      crossCheckProfile(result, { gender: 'male', dateOfBirth: '2001-01-02' }),
    ).toEqual([
      'Your profile says male, but this ID number indicates female.',
      "Your profile date of birth doesn't match the one in this ID number.",
    ]);
  });
});

describe('ride ordering and time formatting', () => {
  it('sorts rides newest-first without mutating the original array', () => {
    const rides = [
      { created_at: '2024-01-01T08:00:00.000Z', ride_time: '2024-01-01T08:00:00.000Z' },
      { created_at: '2024-01-03T08:00:00.000Z', ride_time: '2024-01-03T08:00:00.000Z' },
      { created_at: '2024-01-02T08:00:00.000Z', ride_time: '2024-01-02T08:00:00.000Z' },
    ] as any[];

    const result = sortRides(rides);

    expect(result.map((ride) => ride.created_at)).toEqual([
      '2024-01-03T08:00:00.000Z',
      '2024-01-02T08:00:00.000Z',
      '2024-01-01T08:00:00.000Z',
    ]);
    expect(rides.map((ride) => ride.created_at)).toEqual([
      '2024-01-01T08:00:00.000Z',
      '2024-01-03T08:00:00.000Z',
      '2024-01-02T08:00:00.000Z',
    ]);
  });

  it('isDriverVisible accepts approved and live driver rows', () => {
    expect(isDriverVisible({ driver_verification_status: 'approved' })).toBe(true);
    expect(isDriverVisible({ status: 'approved', verified: true })).toBe(true);
    expect(isDriverVisible({ status: 'live', verified: true })).toBe(true);
    expect(isDriverVisible({ status: 'live', verified: true, is_online: true })).toBe(true);
    expect(isDriverVisible({ status: 'online', verified: false, is_online: false })).toBe(true);
    expect(isDriverVisible({ status: 'pending', verified: false })).toBe(false);
  });

  it('formats duration values into human-friendly text', () => {
    expect(formatTime(45)).toBe('45 min');
    expect(formatTime(125)).toBe('2h 5m');
    expect(formatTime('not-a-date')).toBe('Invalid time');
  });

  it('formats dates into a readable display string', () => {
    expect(formatDate('2024-01-03')).toBe('03 January 2024');
  });
});

import { validateSaIdNumber, normaliseIdNumber } from '../../lib/sa-id';
import {
  HUB_PROMOTION_RATE,
  getHubPromotionalFare,
} from '../../lib/promotions.ts';
import { sortRides, formatTime } from '../../lib/utils';

describe('SMOKE - Critical Path Smoke Test', () => {
  test('SMK-01: valid SA ID validates cleanly', () => {
    const result = validateSaIdNumber('0101011234081');
    expect(result.valid).toBe(true);
  });

  test('SMK-02: invalid SA ID is rejected', () => {
    const result = validateSaIdNumber('12345');
    expect(result.valid).toBe(false);
  });

  test('SMK-03: ID normalisation strips spaces and dashes', () => {
    expect(normaliseIdNumber(' 01 0101-1234 081 ')).toBe('0101011234081');
  });

  test('SMK-04: hub fare discount applies a positive reduction', () => {
    const active = new Date();
    active.setHours(11, 0, 0, 0); // inside 10:00–16:00 window
    const result = getHubPromotionalFare(100, active);
    expect(result).toBeLessThan(100);
    expect(result).toBeGreaterThan(0);
  });

  test('SMK-05: hub promotion rate constant is set correctly', () => {
    expect(HUB_PROMOTION_RATE).toBeCloseTo(0.1, 2);
  });

  test('SMK-06: ride sort returns newest first', () => {
    const rides = [
      { created_at: '2024-01-01T08:00:00.000Z', ride_time: '2024-01-01T08:00:00.000Z' },
      { created_at: '2024-01-03T08:00:00.000Z', ride_time: '2024-01-03T08:00:00.000Z' },
    ] as any[];
    const sorted = sortRides(rides);
    expect(sorted[0].created_at).toBe('2024-01-03T08:00:00.000Z');
  });

  test('SMK-07: formatTime handles valid input', () => {
    expect(formatTime(45)).toBe('45 min');
  });

  test('SMK-08: formatTime handles invalid input safely', () => {
    expect(formatTime('not-a-date')).toBe('Invalid time');
  });
});
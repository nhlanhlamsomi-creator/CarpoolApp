import {
  formatDate,
  formatTime,
  isDriverVisible,
  sortRides,
} from '../../lib/utils';

describe('Utility functions', () => {
  it('UT-UTIL-01: sorts rides newest-first without mutating the original array', () => {
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
    // Original array unchanged
    expect(rides.map((ride) => ride.created_at)).toEqual([
      '2024-01-01T08:00:00.000Z',
      '2024-01-03T08:00:00.000Z',
      '2024-01-02T08:00:00.000Z',
    ]);
  });

  it('UT-UTIL-02: isDriverVisible accepts approved and live driver rows', () => {
    expect(isDriverVisible({ driver_verification_status: 'approved' })).toBe(true);
    expect(isDriverVisible({ status: 'approved', verified: true })).toBe(true);
    expect(isDriverVisible({ status: 'live', verified: true })).toBe(true);
    expect(isDriverVisible({ status: 'live', verified: true, is_online: true })).toBe(true);
    expect(isDriverVisible({ status: 'online', verified: false, is_online: false })).toBe(true);
    expect(isDriverVisible({ status: 'pending', verified: false })).toBe(false);
  });

  it('UT-UTIL-03: formats duration values into human-friendly text', () => {
    expect(formatTime(45)).toBe('45 min');
    expect(formatTime(125)).toBe('2h 5m');
    expect(formatTime('not-a-date')).toBe('Invalid time');
  });

  it('UT-UTIL-04: formats dates into a readable display string', () => {
    expect(formatDate('2024-01-03')).toBe('03 January 2024');
  });
});
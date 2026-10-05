import {
  detectSafetyAnomaly,
  distanceMeters,
  type GeoPoint,
  type LocationSample,
} from '../../lib/safety';

describe('Safety anomaly detection', () => {
  const origin: GeoPoint = { latitude: -26.2041, longitude: 28.0473 };
  const destination: GeoPoint = { latitude: -26.14, longitude: 28.10 };

  it('UT-SAFETY-01: distanceMeters returns zero for identical points', () => {
    expect(distanceMeters(origin, origin)).toBe(0);
  });

  it('UT-SAFETY-02: distanceMeters returns a positive value for distinct points', () => {
    const d = distanceMeters(origin, destination);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(20000);
  });

  it('UT-SAFETY-03: returns null with fewer than 2 samples', () => {
    expect(
      detectSafetyAnomaly({
        origin,
        destination,
        samples: [{ ...origin, recordedAt: new Date().toISOString() }],
      }),
    ).toBeNull();
  });

  it('UT-SAFETY-04: returns null for normal travel along the route', () => {
    const now = Date.now();
    const samples: LocationSample[] = [
      { latitude: -26.20, longitude: 28.05, recordedAt: new Date(now - 5 * 60000).toISOString() },
      { latitude: -26.19, longitude: 28.06, recordedAt: new Date(now - 3 * 60000).toISOString() },
      { latitude: -26.18, longitude: 28.07, recordedAt: new Date(now).toISOString() },
    ];
    expect(detectSafetyAnomaly({ origin, destination, samples })).toBeNull();
  });

  it('UT-SAFETY-05: detects a sustained route deviation away from destination', () => {
    const now = Date.now();
    const samples: LocationSample[] = [
      { latitude: -26.20, longitude: 28.05, recordedAt: new Date(now - 10 * 60000).toISOString() },
      { latitude: -25.90, longitude: 28.40, recordedAt: new Date(now - 5 * 60000).toISOString() },
      { latitude: -25.70, longitude: 28.60, recordedAt: new Date(now).toISOString() },
    ];
    const result = detectSafetyAnomaly({ origin, destination, samples });
    expect(result).not.toBeNull();
    expect(result?.reason).toMatch(/route deviation/i);
    expect(result?.deviationMeters).toBeGreaterThan(0);
  });

  it('UT-SAFETY-06: detects a prolonged stop far from the destination', () => {
    const now = Date.now();
    const samples: LocationSample[] = [
      { latitude: -26.10, longitude: 28.20, recordedAt: new Date(now - 15 * 60000).toISOString() },
      { latitude: -26.10, longitude: 28.20, recordedAt: new Date(now - 5 * 60000).toISOString() },
      { latitude: -26.10, longitude: 28.20, recordedAt: new Date(now).toISOString() },
    ];
    const result = detectSafetyAnomaly({ origin, destination, samples });
    expect(result).not.toBeNull();
    expect(result?.reason).toMatch(/prolonged stop/i);
  });
});
import { describe, expect, it } from 'vitest';

import {
    findCarpoolGroups,
    haversineDistanceKm,
    runKMeans,
    type PassengerLocation,
} from '@/services/kMeans';

describe('k-means clustering', () => {
  it('calculates haversine distance in kilometres', () => {
    const distance = haversineDistanceKm(
      -25.7479,
      28.2293,
      -25.75,
      28.23,
    );

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1);
  });

  it('returns clusters with valid passenger memberships', () => {
    const passengers: PassengerLocation[] = [
      { id: 'p1', latitude: -25.7479, longitude: 28.2293 },
      { id: 'p2', latitude: -25.75, longitude: 28.23 },
      { id: 'p3', latitude: -25.76, longitude: 28.24 },
      { id: 'p4', latitude: -25.77, longitude: 28.25 },
    ];

    const clusters = runKMeans(passengers, 2, {
      maxIterations: 25,
      maxPickupDistanceKm: 5,
    });

    expect(clusters.length).toBe(2);
    expect(clusters.every((cluster) => cluster.passengers.length > 0)).toBe(true);
    expect(clusters.flatMap((cluster) => cluster.passengers.map((passenger) => passenger.id))).toHaveLength(passengers.length);
  });

  it('respects vehicle capacity when building carpool groups', () => {
    const passengers: PassengerLocation[] = [
      { id: 'p1', latitude: -25.7479, longitude: 28.2293 },
      { id: 'p2', latitude: -25.75, longitude: 28.23 },
      { id: 'p3', latitude: -25.76, longitude: 28.24 },
      { id: 'p4', latitude: -25.77, longitude: 28.25 },
      { id: 'p5', latitude: -25.771, longitude: 28.251 },
    ];

    const groups = findCarpoolGroups(passengers, 4, {
      k: 2,
      maxPickupDistanceKm: 5,
    });

    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((group) => group.passengerCount <= 4)).toBe(true);
    expect(groups.some((group) => group.passengerCount > 0)).toBe(true);
  });
});

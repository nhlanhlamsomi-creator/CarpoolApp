import {
  generateMarkersFromData,
  calculateRegion,
  calculateDriverTimes,
} from '../../lib/map';

describe('Map utilities', () => {
  it('UT-MAP-01: uses real driver coordinates when they exist', () => {
    const drivers = [{
      id: 1,
      first_name: 'Ava',
      last_name: 'Ngcobo',
      profile_image_url: '',
      car_image_url: '',
      car_seats: 4,
      rating: 4.8,
      latitude: -26.2041,
      longitude: 28.0473,
    }] as any[];

    const markers = generateMarkersFromData({
      data: drivers,
      userLatitude: -26.2,
      userLongitude: 28.04,
    });

    expect(markers[0]).toMatchObject({
      id: 1,
      latitude: -26.2041,
      longitude: 28.0473,
      title: 'Ava Ngcobo',
    });
  });

  it('UT-MAP-02: falls back to offset when driver has no coordinates', () => {
    const drivers = [{
      id: 2,
      first_name: 'Sipho',
      last_name: 'Dlamini',
      latitude: null,
      longitude: null,
    }] as any[];

    const markers = generateMarkersFromData({
      data: drivers,
      userLatitude: -26.2,
      userLongitude: 28.04,
    });

    expect(markers[0].latitude).not.toBe(-26.2);
    expect(markers[0].longitude).not.toBe(28.04);
    expect(markers[0].title).toBe('Sipho Dlamini');
  });

  it('UT-MAP-03: calculateRegion returns Johannesburg default when user location is missing', () => {
    const region = calculateRegion({
      userLatitude: null,
      userLongitude: null,
    });
    expect(region.latitude).toBeCloseTo(-26.2041, 2);
    expect(region.longitude).toBeCloseTo(28.0473, 2);
  });

  it('UT-MAP-04: calculateRegion centres between user and destination', () => {
    const region = calculateRegion({
      userLatitude: -26.20,
      userLongitude: 28.03,
      destinationLatitude: -26.22,
      destinationLongitude: 28.05,
    });
    expect(region.latitude).toBeCloseTo(-26.21, 2);
    expect(region.longitude).toBeCloseTo(28.04, 2);
  });

  it('UT-MAP-05: calculateDriverTimes returns markers unchanged when locations are missing', async () => {
    const markers = [{ id: 1, latitude: -26.2, longitude: 28.04 }] as any[];
    const result = await calculateDriverTimes({
      markers,
      userLatitude: null,
      userLongitude: null,
      destinationLatitude: null,
      destinationLongitude: null,
    });
    expect(result).toEqual(markers);
  });

  it('UT-MAP-06: calculateDriverTimes attaches time, trip_time and price', async () => {
    const markers = [{ id: 1, latitude: -26.19, longitude: 28.03 }] as any[];
    const result = await calculateDriverTimes({
      markers,
      userLatitude: -26.20,
      userLongitude: 28.04,
      destinationLatitude: -26.22,
      destinationLongitude: 28.06,
    });
    expect(result[0].time).toBeGreaterThan(0);
    expect(result[0].trip_time).toBeGreaterThan(0);
    expect(Number(result[0].price)).toBeGreaterThan(0);
  });
});
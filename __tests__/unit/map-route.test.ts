describe('fetchRoutePolyline', () => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    jest.resetModules();
  });

  it('UT-ROUTE-01: returns null when no features in response', async () => {
    console.warn = jest.fn();
    globalThis.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ features: [] }),
    }) as any;

    const { fetchRoutePolyline } = require('../../lib/map');
    const result = await fetchRoutePolyline({
      originLatitude: -26.2,
      originLongitude: 28.0,
      destinationLatitude: -26.1,
      destinationLongitude: 28.1,
      apiKey: 'test',
    });

    expect(result).toBeNull();
  });

  it('UT-ROUTE-02: parses a LineString geometry with string coords', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          features: [
            {
              geometry: {
                type: 'LineString',
                coordinates: ['28.0473 -26.2041', '28.0500 -26.2000'],
              },
            },
          ],
        }),
    }) as any;

    const { fetchRoutePolyline } = require('../../lib/map');
    const result = await fetchRoutePolyline({
      originLatitude: -26.2,
      originLongitude: 28.0,
      destinationLatitude: -26.1,
      destinationLongitude: 28.1,
      apiKey: 'test',
    });

    expect(result).toEqual([
      { longitude: 28.0473, latitude: -26.2041 },
      { longitude: 28.05, latitude: -26.2 },
    ]);
  });

  it('UT-ROUTE-03: parses a MultiLineString geometry with array coords', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          features: [
            {
              geometry: {
                type: 'MultiLineString',
                coordinates: [
                  [[28.0473, -26.2041], [28.0500, -26.2000]],
                  [[28.0600, -26.1900]],
                ],
              },
            },
          ],
        }),
    }) as any;

    const { fetchRoutePolyline } = require('../../lib/map');
    const result = await fetchRoutePolyline({
      originLatitude: -26.2,
      originLongitude: 28.0,
      destinationLatitude: -26.1,
      destinationLongitude: 28.1,
      apiKey: 'test',
    });

    expect(result?.length).toBe(3);
    expect(result?.[0]).toEqual({ longitude: 28.0473, latitude: -26.2041 });
  });

  it('UT-ROUTE-04: returns null when fetch throws', async () => {
    console.error = jest.fn();
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network down')) as any;

    const { fetchRoutePolyline } = require('../../lib/map');
    const result = await fetchRoutePolyline({
      originLatitude: -26.2,
      originLongitude: 28.0,
      destinationLatitude: -26.1,
      destinationLongitude: 28.1,
      apiKey: 'test',
    });

    expect(result).toBeNull();
  });

  it('UT-ROUTE-05: returns null when geometry has no coordinates', async () => {
    console.warn = jest.fn();
    globalThis.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          features: [{ geometry: { type: 'LineString', coordinates: [] } }],
        }),
    }) as any;

    const { fetchRoutePolyline } = require('../../lib/map');
    const result = await fetchRoutePolyline({
      originLatitude: -26.2,
      originLongitude: 28.0,
      destinationLatitude: -26.1,
      destinationLongitude: 28.1,
      apiKey: 'test',
    });

    expect(result).toBeNull();
  });
});
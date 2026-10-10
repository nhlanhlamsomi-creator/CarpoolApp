describe('fetchAPI transport', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.resetModules();
  });

  it('UT-FETCH-01: sends relative API paths to Render', async () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await fetchAPI('user');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://lyft-api-eofz.onrender.com/user',
      undefined,
    );
  });

  it('UT-FETCH-02: converts Expo API route paths to backend API paths', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await fetchAPI('/(api)/safety/ride-1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://lyft-api-eofz.onrender.com/api/safety/ride-1',
      undefined,
    );
  });

  it('UT-FETCH-03: rejects insecure HTTP requests', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await expect(fetchAPI('http://api.example.com/user')).rejects.toThrow(/Insecure HTTP/);
  });

  it('UT-FETCH-04: throws on non-OK HTTP responses', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error'),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await expect(fetchAPI('user')).rejects.toThrow(/HTTP error! status: 500/);
  });

  it('UT-FETCH-05: passes absolute URLs through unchanged', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await fetchAPI('https://other-service.example.com/endpoint');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://other-service.example.com/endpoint',
      undefined,
    );
  });
});
describe('fetchAPI transport', () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
    jest.resetModules();
  });

  it('UT-FETCH-01: throws when EXPO_PUBLIC_API_URL is missing for relative paths', async () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    const { fetchAPI } = require('../../lib/fetch');
    await expect(fetchAPI('user')).rejects.toThrow(/Missing EXPO_PUBLIC_API_URL/);
  });

  it('UT-FETCH-02: builds the URL from the configured base', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await fetchAPI('user');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/user',
      undefined,
    );
  });

  it('UT-FETCH-03: strips trailing slashes from the base URL', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com///';
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await fetchAPI('user');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/user',
      undefined,
    );
  });

  it('UT-FETCH-04: rejects insecure HTTP requests', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.example.com';
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await expect(fetchAPI('user')).rejects.toThrow(/Insecure HTTP/);
  });

  it('UT-FETCH-05: throws on non-OK HTTP responses', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error'),
    }) as any;

    const { fetchAPI } = require('../../lib/fetch');
    await expect(fetchAPI('user')).rejects.toThrow(/HTTP error! status: 500/);
  });

  it('UT-FETCH-06: passes absolute URLs through unchanged', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';
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
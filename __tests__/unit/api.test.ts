jest.mock('@clerk/expo', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue(null),
    userId: null,
  }),
}));

describe('apiRequest wrapper', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('UT-API-01: uses the Render API without an API URL environment variable', async () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1 } }),
    }) as any;

    const { apiRequest } = require('../../lib/api');
    const result = await apiRequest('user');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://lyft-api-eofz.onrender.com/user',
      expect.objectContaining({}),
    );
    expect(result).toEqual({ data: { id: 1 } });
  });

  it('keeps a single api prefix for API paths', async () => {
    jest.resetModules();

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { rating: 3 } }),
    }) as any;

    const { apiRequest } = require('../../lib/api');
    await apiRequest('/api/profile');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://lyft-api-eofz.onrender.com/api/profile',
      expect.objectContaining({}),
    );
  });

  it('UT-API-03: sets Content-Type when body is present', async () => {
    jest.resetModules();

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    }) as any;

    const { apiRequest } = require('../../lib/api');
    await apiRequest('user', {
      method: 'POST',
      body: JSON.stringify({ name: 'Sipho' }),
    });

    const callArgs = (globalThis.fetch as jest.Mock).mock.calls[0];
    const headers = callArgs[1].headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('UT-API-04: sets Authorization header when token is provided', async () => {
    jest.resetModules();

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    }) as any;

    const { apiRequest } = require('../../lib/api');
    await apiRequest('user', {}, 'test-token-123');

    const callArgs = (globalThis.fetch as jest.Mock).mock.calls[0];
    const headers = callArgs[1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token-123');
  });

  it('UT-API-05: throws with server-provided error message on non-OK responses', async () => {
    jest.resetModules();

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad input' }),
    }) as any;

    const { apiRequest } = require('../../lib/api');
    await expect(apiRequest('user')).rejects.toThrow('Bad input');
  });
});
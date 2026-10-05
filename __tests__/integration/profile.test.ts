describe('profile API route', () => {
  const setupSupabase = (mockImpl: any) => {
    jest.doMock('@/lib/supabase-server', () => ({
      getSupabaseServerClient: jest.fn().mockReturnValue(mockImpl),
    }));
  };

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('INT-PROFILE-01: returns 400 when clerkId is missing', async () => {
    setupSupabase({ from: jest.fn() });
    const route = require('@/app/(api)/profile+api');
    const request = new Request('https://example.com/api/profile', { method: 'GET' });
    const response = await route.GET(request);
    expect(response.status).toBe(400);
  });

  it('INT-PROFILE-02: returns null data when profile not found', async () => {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });

    setupSupabase({ from: jest.fn(() => chain) });

    const route = require('@/app/(api)/profile+api');
    const request = new Request(
      'https://example.com/api/profile?clerkId=clerk_new',
      { method: 'GET' },
    );
    const response = await route.GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toBeNull();
  });
});
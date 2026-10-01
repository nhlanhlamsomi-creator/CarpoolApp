describe('ride API route', () => {
  const setupSupabase = (mockImpl: any) => {
    jest.doMock('../../lib/supabase-server', () => ({
      getSupabaseServerClient: jest.fn().mockReturnValue(mockImpl),
    }));
  };

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('INT-RIDE-01: GET returns 400 when clerkId is missing', async () => {
    setupSupabase({ from: jest.fn() });
    const { GET } = require('../../app/(api)/ride+api');
    const request = new Request('https://example.com/api/ride', { method: 'GET' });
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('INT-RIDE-02: GET returns zero-value summary when no rides exist', async () => {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockResolvedValue({ data: [], error: null });

    setupSupabase({ from: jest.fn(() => chain) });

    const { GET } = require('../../app/(api)/ride+api');
    const request = new Request(
      'https://example.com/api/ride?clerkId=clerk_empty',
      { method: 'GET' },
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.completed_trips).toBe(0);
    expect(body.data.total_trips).toBe(0);
    expect(body.data.cancelled_trips).toBe(0);
    expect(body.data.money_spent).toBe(0);
    expect(body.data.last_ride).toBe('No rides yet');
    expect(body.data.favorite_driver).toBe('Not available');
  });

  it('INT-RIDE-03: GET aggregates completed, cancelled and money spent', async () => {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockResolvedValue({
      data: [
        {
          status: 'completed',
          payment_status: 'paid',
          fare_price: 3500,
          destination_address: 'UJ APK',
          drivers: { first_name: 'Ava', last_name: 'Ngcobo' },
        },
        {
          status: 'cancelled',
          payment_status: 'cancelled',
          fare_price: 0,
          destination_address: 'Cancelled Trip',
          drivers: { first_name: 'Sipho', last_name: 'Dlamini' },
        },
      ],
      error: null,
    });

    setupSupabase({ from: jest.fn(() => chain) });

    const { GET } = require('../../app/(api)/ride+api');
    const request = new Request(
      'https://example.com/api/ride?clerkId=clerk_passenger',
      { method: 'GET' },
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.completed_trips).toBe(1);
    expect(body.data.cancelled_trips).toBe(1);
    expect(body.data.money_spent).toBe(3500);
    expect(body.data.favorite_driver).toBe('Ava Ngcobo');
    expect(body.data.last_ride).toBe('UJ APK');
  });

  it('INT-RIDE-04: GET returns 500 when the database fails', async () => {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB down' } });

    setupSupabase({ from: jest.fn(() => chain) });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { GET } = require('../../app/(api)/ride+api');
    const request = new Request(
      'https://example.com/api/ride?clerkId=clerk_passenger',
      { method: 'GET' },
    );
    const response = await GET(request);
    expect(response.status).toBe(500);

    errorSpy.mockRestore();
  });
});
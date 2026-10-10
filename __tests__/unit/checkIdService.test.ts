describe('Check ID service', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('UT-CHECKID-01: rejects IDs that are not 13 digits', async () => {
    const { verifySouthAfricanID } = require('../../lib/checkIdService');
    await expect(verifySouthAfricanID('12345')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('UT-CHECKID-02: rejects IDs with non-numeric characters', async () => {
    const { verifySouthAfricanID } = require('../../lib/checkIdService');
    await expect(verifySouthAfricanID('ABCDEFGHIJKLM')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('UT-CHECKID-03: calls the Check ID endpoint with the normalised ID', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          idNumber: '8903075555083',
          isValid: true,
          dob: '1989-03-07',
          age: 37,
          gender: 'male',
          citizenship: 'citizen',
        }),
    }) as any;

    const { verifySouthAfricanID } = require('../../lib/checkIdService');
    const result = await verifySouthAfricanID('8903075555083');

    expect(result.isValid).toBe(true);
    expect(result.idNumber).toBe('8903075555083');
    expect(result.age).toBe(37);
  });

  it('UT-CHECKID-04: surfaces 400 errors from the service', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('invalid'),
    }) as any;

    const { verifySouthAfricanID } = require('../../lib/checkIdService');
    await expect(verifySouthAfricanID('8903075555083')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('UT-CHECKID-05: surfaces 401 errors from the service', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('unauthorized'),
    }) as any;

    const { verifySouthAfricanID } = require('../../lib/checkIdService');
    await expect(verifySouthAfricanID('8903075555083')).rejects.toMatchObject({
      status: 401,
    });
  });

  it('UT-CHECKID-06: returns a service error on network failure', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as any;

    const { verifySouthAfricanID } = require('../../lib/checkIdService');
    await expect(verifySouthAfricanID('8903075555083')).rejects.toMatchObject({
      message: /Unable to reach ID verification service/,
    });
  });
});
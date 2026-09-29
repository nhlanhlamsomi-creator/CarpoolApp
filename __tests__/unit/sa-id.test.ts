import {
  crossCheckProfile,
  formatIdNumber,
  normaliseIdNumber,
  validateSaIdNumber,
} from '../../lib/sa-id';

describe('SA ID normalisation and validation', () => {
  it('UT-SAID-01: normalises spaces and dashes', () => {
    expect(normaliseIdNumber(' 01 0101-1234 081 ')).toBe('0101011234081');
  });

  it('UT-SAID-02: accepts a valid South African ID number', () => {
    const result = validateSaIdNumber('0101011234081');
    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('Expected valid result');
    expect(result.idNumber).toBe('0101011234081');
    expect(result.dateOfBirth).toBe('2001-01-01');
    expect(result.gender).toBe('female');
    expect(result.citizenship).toBe('citizen');
  });

  it('UT-SAID-03: rejects non-numeric ID numbers', () => {
    expect(validateSaIdNumber('010101A234081')).toEqual({
      valid: false,
      error: 'An ID number contains digits only',
    });
  });

  it('UT-SAID-04: rejects IDs with the wrong length', () => {
    expect(validateSaIdNumber('0101011234')).toEqual({
      valid: false,
      error: "That's only 10 digits — an ID number has 13",
    });
  });

  it('UT-SAID-05: rejects impossible DOB values', () => {
    expect(validateSaIdNumber('0101991234081')).toEqual({
      valid: false,
      error: "The date in that ID number isn't valid",
    });
  });

  it('UT-SAID-06: rejects IDs with an invalid checksum', () => {
    const result = validateSaIdNumber('1204051234082');
    expect(result.valid).toBe(false);
    if (result.valid) throw new Error('Expected invalid result');
    expect(result.error).toBe("That ID number isn't valid. Check for a typo.");
  });

  it('UT-SAID-07: formats an ID as 000000 0000 000', () => {
    expect(formatIdNumber('0101011234081')).toBe('010101 1234 081');
  });

  it('UT-SAID-08: flags mismatched profile data against the ID', () => {
    const result = validateSaIdNumber('0101011234081');
    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('Expected valid ID');
    expect(
      crossCheckProfile(result, { gender: 'male', dateOfBirth: '2001-01-02' }),
    ).toEqual([
      'Your profile says male, but this ID number indicates female.',
      "Your profile date of birth doesn't match the one in this ID number.",
    ]);
  });
});
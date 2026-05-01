/**
 * sanitise.js
 * Cleans all user input before it touches Firebase or display.
 * Prevents XSS, NoSQL injection, and script injection.
 */

// Strip any HTML/script tags
const STRIP_HTML = /<[^>]*>/g;

// Characters that could be used for NoSQL injection in Firestore queries
const DANGEROUS_CHARS = /[<>"'`{}[\]\\]/g;

// SA-specific validators
const SA_ID_REGEX = /^\d{13}$/;
const SA_PHONE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/;
const SA_PLATE_REGEX = /^[A-Z]{2,3}\s?\d{2,3}-?\d{3}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/**
 * Sanitise a plain text field — removes HTML, trims whitespace
 */
export function sanitiseText(value = '') {
  return String(value)
    .replace(STRIP_HTML, '')
    .replace(DANGEROUS_CHARS, '')
    .trim()
    .slice(0, 500); // hard length cap
}

/**
 * Sanitise name fields — only allow letters, spaces, hyphens, apostrophes
 */
export function sanitiseName(value = '') {
  return String(value)
    .replace(/[^a-zA-Z\s\-']/g, '')
    .trim()
    .slice(0, 100);
}

/**
 * Sanitise numeric fields
 */
export function sanitiseNumber(value = '') {
  return String(value).replace(/[^0-9.]/g, '').slice(0, 20);
}

/**
 * Validate + sanitise email
 */
export function validateEmail(value = '') {
  const clean = String(value).toLowerCase().trim().slice(0, 255);
  if (!EMAIL_REGEX.test(clean)) return { valid: false, error: 'Enter a valid email address', value: clean };
  return { valid: true, error: null, value: clean };
}

/**
 * Validate SA ID number (13 digits, Luhn checksum)
 */
export function validateSAID(value = '') {
  const clean = String(value).replace(/\s/g, '');
  if (!SA_ID_REGEX.test(clean)) {
    return { valid: false, error: 'SA ID must be exactly 13 digits' };
  }
  // Luhn algorithm check
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(clean[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  if (sum % 10 !== 0) {
    return { valid: false, error: 'Invalid ID number — please check and try again' };
  }
  return { valid: true, error: null };
}

/**
 * Validate SA phone number
 */
export function validateSAPhone(value = '') {
  const clean = String(value).replace(/\s/g, '');
  if (!SA_PHONE_REGEX.test(clean)) {
    return { valid: false, error: 'Enter a valid SA phone number (e.g. 0821234567)' };
  }
  return { valid: true, error: null, normalised: clean.startsWith('0') ? '+27' + clean.slice(1) : clean };
}

/**
 * Validate password strength
 */
export function validatePassword(value = '') {
  if (value.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(value)) return { valid: false, error: 'Password needs at least one uppercase letter' };
  if (!/[0-9]/.test(value)) return { valid: false, error: 'Password needs at least one number' };
  return { valid: true, error: null };
}

/**
 * Validate SA licence plate
 */
export function validateLicencePlate(value = '') {
  const clean = String(value).toUpperCase().replace(/\s/g, '');
  if (!SA_PLATE_REGEX.test(clean)) {
    return { valid: false, error: 'Enter a valid SA licence plate (e.g. CA 123-456)' };
  }
  return { valid: true, error: null, normalised: clean };
}

/**
 * Sanitise price input — only positive numbers with max 2 decimal places
 */
export function sanitisePrice(value = '') {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * 100) / 100; // round to 2 decimal places
}

/**
 * Sanitise a whole registration form object at once
 */
export function sanitiseRegistrationForm(form) {
  return {
    fullName: sanitiseName(form.fullName),
    email: validateEmail(form.email).value,
    phone: String(form.phone).replace(/\s/g, ''),
    idNumber: String(form.idNumber).replace(/\s/g, ''),
    password: form.password, // never sanitise passwords — may break valid chars
    confirmPassword: form.confirmPassword,
    licenceNumber: sanitiseText(form.licenceNumber),
    vehicleMake: sanitiseName(form.vehicleMake),
    vehicleModel: sanitiseName(form.vehicleModel),
    vehicleColor: sanitiseName(form.vehicleColor),
    licensePlate: String(form.licensePlate).toUpperCase().trim(),
  };
}

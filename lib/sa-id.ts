// ─────────────────────────────────────────────────────────────────────────────
// South African ID number validation.
//
// Format: YYMMDD SSSS C A Z   (13 digits)
//   0–5   YYMMDD  date of birth
//   6–9   SSSS    gender sequence — 0000–4999 female, 5000–9999 male
//   10    C       citizenship — 0 South African, 1 permanent resident
//   11    A       historically a race classifier, now unused (usually 8)
//   12    Z       Luhn check digit
//
// This proves the number is well formed and internally consistent. It does NOT
// prove the number belongs to the person presenting it — that needs a HANIS
// lookup through an accredited provider.
// ─────────────────────────────────────────────────────────────────────────────

export type IdCitizenship = "citizen" | "permanent_resident";
export type IdGender = "female" | "male";

export type IdValidationResult =
  | { valid: false; error: string }
  | {
      valid: true;
      idNumber: string;
      dateOfBirth: string; // YYYY-MM-DD
      age: number;
      gender: IdGender;
      citizenship: IdCitizenship;
    };

/** Strip spaces and dashes people naturally type in. */
export function normaliseIdNumber(input: string): string {
  return input.replace(/[\s-]/g, "");
}

/**
 * Luhn mod-10 checksum, which is what the last digit of an SA ID encodes.
 * Working right to left, every second digit is doubled; digits above 9 have
 * their own digits summed. A valid number totals a multiple of 10.
 */
export function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);

    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

/**
 * Resolve the two-digit year to a full year.
 * A year at or below the current two-digit year is this century; anything
 * above it must be last century. (So in 2026, "26" is 2026 but "27" is 1927.)
 */
function resolveYear(yy: number): number {
  const currentTwoDigit = new Date().getFullYear() % 100;
  return yy <= currentTwoDigit ? 2000 + yy : 1900 + yy;
}

function yearsSince(date: Date): number {
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age--;
  }

  return age;
}

export function validateSaIdNumber(input: string): IdValidationResult {
  const id = normaliseIdNumber(input);

  if (!id) {
    return { valid: false, error: "Enter your ID number" };
  }

  if (!/^\d+$/.test(id)) {
    return { valid: false, error: "An ID number contains digits only" };
  }

  if (id.length !== 13) {
    return {
      valid: false,
      error:
        id.length < 13
          ? `That's only ${id.length} digits — an ID number has 13`
          : "That's more than 13 digits",
    };
  }

  // ── Date of birth ──────────────────────────────────────────────────────────
  const yy = Number(id.slice(0, 2));
  const mm = Number(id.slice(2, 4));
  const dd = Number(id.slice(4, 6));

  if (mm < 1 || mm > 12) {
    return { valid: false, error: "The month in that ID number isn't valid" };
  }

  const year = resolveYear(yy);
  const birthDate = new Date(Date.UTC(year, mm - 1, dd));

  // Catches things like 31 February, which Date would silently roll forward
  const rolledOver =
    birthDate.getUTCMonth() !== mm - 1 || birthDate.getUTCDate() !== dd;

  if (dd < 1 || rolledOver) {
    return { valid: false, error: "The date in that ID number isn't valid" };
  }

  if (birthDate.getTime() > Date.now()) {
    return { valid: false, error: "That date of birth is in the future" };
  }

  // ── Checksum ───────────────────────────────────────────────────────────────
  if (!passesLuhn(id)) {
    return {
      valid: false,
      error: "That ID number isn't valid. Check for a typo.",
    };
  }

  // ── Age ────────────────────────────────────────────────────────────────────
  const age = yearsSince(birthDate);

  if (age < 18) {
    return { valid: false, error: "You must be 18 or older to use this app" };
  }

  if (age > 120) {
    return { valid: false, error: "Check the year in that ID number" };
  }

  // ── Gender and citizenship ─────────────────────────────────────────────────
  const sequence = Number(id.slice(6, 10));
  const gender: IdGender = sequence < 5000 ? "female" : "male";

  const citizenshipDigit = id[10];
  if (citizenshipDigit !== "0" && citizenshipDigit !== "1") {
    return { valid: false, error: "That ID number isn't valid" };
  }

  const citizenship: IdCitizenship =
    citizenshipDigit === "0" ? "citizen" : "permanent_resident";

  return {
    valid: true,
    idNumber: id,
    dateOfBirth: `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`,
    age,
    gender,
    citizenship,
  };
}

/** Format as 000000 0000 000 for display. */
export function formatIdNumber(input: string): string {
  const id = normaliseIdNumber(input).slice(0, 13);
  const parts = [id.slice(0, 6), id.slice(6, 10), id.slice(10, 13)].filter(
    Boolean,
  );
  return parts.join(" ");
}

/**
 * Compare what the ID number says against what the person typed in their
 * profile. Mismatches are the most common sign of a borrowed document, so
 * they're worth flagging to a reviewer rather than silently accepting.
 */
export function crossCheckProfile(
  result: Extract<IdValidationResult, { valid: true }>,
  profile: { gender?: string | null; dateOfBirth?: string | null },
): string[] {
  const warnings: string[] = [];

  if (
    profile.gender &&
    ["female", "male"].includes(profile.gender.toLowerCase()) &&
    profile.gender.toLowerCase() !== result.gender
  ) {
    warnings.push(
      `Your profile says ${profile.gender.toLowerCase()}, but this ID number indicates ${result.gender}.`,
    );
  }

  if (profile.dateOfBirth && profile.dateOfBirth !== result.dateOfBirth) {
    warnings.push(
      `Your profile date of birth doesn't match the one in this ID number.`,
    );
  }

  return warnings;
}
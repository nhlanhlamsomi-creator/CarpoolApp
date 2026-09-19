import argon2 from "argon2";

export const passwordHashOptions = {
  type: argon2.argon2id,
  memoryCost: Number(process.env.ARGON2_MEMORY_COST ?? 65536),
  timeCost: Number(process.env.ARGON2_TIME_COST ?? 3),
  parallelism: Number(process.env.ARGON2_PARALLELISM ?? 4),
} as const;

const MIN_PASSWORD_LENGTH = 8;

function assertValidPassword(password: string): void {
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new Error("Password does not meet the minimum requirements");
  }
}

/** Server-only password hashing for first-party backend authentication. */
export async function hashPassword(password: string): Promise<string> {
  assertValidPassword(password);
  return argon2.hash(password, passwordHashOptions);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (typeof password !== "string" || typeof hash !== "string" || !password) {
    return false;
  }

  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
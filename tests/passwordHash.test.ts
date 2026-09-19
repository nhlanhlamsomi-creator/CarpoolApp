import argon2 from "argon2";
import { describe, expect, it } from "vitest";

import {
  hashPassword,
  passwordHashOptions,
  verifyPassword,
} from "../lib/server/passwordHash";

describe("server password hashing", () => {
  const password = "CorrectHorse7";

  it("hashes passwords with Argon2id without retaining the plaintext", async () => {
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain(password);
    expect(await argon2.verify(hash, password)).toBe(true);
  });

  it("verifies the correct password", async () => {
    const hash = await hashPassword(password);

    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword(password);

    await expect(verifyPassword("WrongPassword7", hash)).resolves.toBe(false);
  });

  it("uses a unique salt for each hash", async () => {
    const firstHash = await hashPassword(password);
    const secondHash = await hashPassword(password);

    expect(secondHash).not.toBe(firstHash);
    expect(await verifyPassword(password, firstHash)).toBe(true);
    expect(await verifyPassword(password, secondHash)).toBe(true);
  });

  it("rejects empty and weak passwords", async () => {
    await expect(hashPassword("")).rejects.toThrow();
    await expect(hashPassword("short7")).rejects.toThrow();
    await expect(hashPassword("lowercase7")).rejects.toThrow();
  });

  it("keeps the configured Argon2id parameters explicit", () => {
    expect(passwordHashOptions).toMatchObject({
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  });
});
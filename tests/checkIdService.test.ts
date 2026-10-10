import { afterEach, describe, expect, it, vi } from "vitest";

import {
    CheckIdServiceError,
    verifySouthAfricanID,
} from "../lib/checkIdService";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Check ID service", () => {
  it("normalises the ID and sends it with the session to Render", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          idNumber: "8903075555083",
          isValid: true,
          dob: "1989-03-07T00:00:00",
          age: 35,
          gender: "M",
          citizenship: "SA Citizen",
        }),
        { status: 200 },
      ),
    );

    await expect(
      verifySouthAfricanID("890307 5555 083", "test-session-token"),
    ).resolves.toMatchObject({ isValid: true, age: 35 });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://lyft-api-eofz.onrender.com/api/check-id/validate",
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer test-session-token",
        },
        body: JSON.stringify({ idNumber: "8903075555083" }),
      }),
    );
  });

  it("rejects IDs that are not exactly 13 digits before making a request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(verifySouthAfricanID("12345")).rejects.toMatchObject({
      status: 400,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns an invalid result when Check ID rejects the number", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ idNumber: "8903075555083", isValid: false }),
        { status: 200 },
      ),
    );

    await expect(verifySouthAfricanID("8903075555083")).resolves.toMatchObject({
      idNumber: "8903075555083",
      isValid: false,
    });
  });

  it("preserves a 401 status without exposing response secrets", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await expect(verifySouthAfricanID("8903075555083")).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        message: "Authentication is required to verify an ID",
      } satisfies Partial<CheckIdServiceError>),
    );
  });

  it("converts network failures into a service error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    await expect(verifySouthAfricanID("8903075555083")).rejects.toMatchObject({
      message: "Unable to reach ID verification service",
    });
  });
});
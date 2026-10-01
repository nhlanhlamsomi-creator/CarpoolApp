import { fetchAPI } from "./fetch";

export interface CheckIdResponse {
  idNumber: string;
  isValid: boolean;
  dob?: string;
  age?: number;
  gender?: string;
  citizenship?: string;
}

export class CheckIdServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "CheckIdServiceError";
  }
}

export async function verifySouthAfricanID(
  idNumber: string,
  token?: string | null,
): Promise<CheckIdResponse> {
  const normalisedId = idNumber.replace(/\s/g, "");

  if (!/^\d{13}$/.test(normalisedId)) {
    throw new CheckIdServiceError("Invalid South African ID number", 400);
  }

  try {
    const response = await fetchAPI("/api/check-id/validate", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ idNumber: normalisedId }),
    });

    return {
      idNumber: String(response.idNumber ?? normalisedId),
      isValid: response.isValid === true,
      dob: response.dob,
      age: response.age,
      gender: response.gender,
      citizenship: response.citizenship,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = Number(/status:\s*(\d+)/i.exec(message)?.[1]);

    if (Number.isInteger(status) && status > 0) {
      throw new CheckIdServiceError(
        status === 400
          ? "Invalid South African ID number"
          : status === 401
            ? "Authentication is required to verify an ID"
            : "ID verification service request failed",
        status,
      );
    }

    throw new CheckIdServiceError("Unable to reach ID verification service");
  }
}
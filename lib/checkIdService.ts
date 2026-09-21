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

const CHECK_ID_URL = "https://api.checkid.co.za/api/v1/validate";

export async function verifySouthAfricanID(
  idNumber: string,
): Promise<CheckIdResponse> {
  const normalisedId = idNumber.replace(/\s/g, "");

  if (!/^\d{13}$/.test(normalisedId)) {
    throw new CheckIdServiceError("Invalid South African ID number", 400);
  }

  const apiKey = process.env.EXPO_PUBLIC_CHECK_ID_API_KEY;
  if (!apiKey) {
    throw new CheckIdServiceError("ID verification is not configured");
  }

  let response: Response;
  try {
    response = await fetch(`${CHECK_ID_URL}/${normalisedId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
  } catch {
    throw new CheckIdServiceError("Unable to reach ID verification service");
  }

  let result: Partial<CheckIdResponse> = {};
  try {
    result = await response.json();
  } catch {
    // The status code below still gives the UI a safe, generic outcome.
  }

  if (!response.ok) {
    throw new CheckIdServiceError("ID verification service request failed", response.status);
  }

  return {
    idNumber: String(result.idNumber ?? normalisedId),
    isValid: result.isValid === true,
    dob: result.dob,
    age: result.age,
    gender: result.gender,
    citizenship: result.citizenship,
  };
}
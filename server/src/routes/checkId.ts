import { Router } from "express";
import { HttpError } from "../middleware/errorHandler";

const router = Router();
const CHECK_ID_URL = "https://api.checkid.co.za/api/v1/validate";

router.post("/validate", async (request, response) => {
  const idNumber = String(request.body?.idNumber ?? "").replace(/\s/g, "");
  if (!/^\d{13}$/.test(idNumber)) {
    throw new HttpError(400, "Invalid South African ID number");
  }

  const apiKey = process.env.CHECK_ID_API_KEY;
  if (!apiKey) {
    throw new HttpError(503, "ID verification is not configured");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${CHECK_ID_URL}/${idNumber}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
  } catch {
    throw new HttpError(502, "Unable to reach ID verification service");
  }

  const result = (await upstream.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!upstream.ok) {
    throw new HttpError(
      upstream.status === 400 ? 400 : 502,
      upstream.status === 400
        ? "Invalid South African ID number"
        : "ID verification service request failed",
    );
  }

  response.json({
    idNumber: String(result?.idNumber ?? idNumber),
    isValid: result?.isValid === true,
    dob: typeof result?.dob === "string" ? result.dob : undefined,
    age: typeof result?.age === "number" ? result.age : undefined,
    gender: typeof result?.gender === "string" ? result.gender : undefined,
    citizenship:
      typeof result?.citizenship === "string" ? result.citizenship : undefined,
  });
});

export default router;
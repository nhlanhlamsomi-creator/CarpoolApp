import { supportErrorMessage } from "@/lib/support";

describe("supportErrorMessage", () => {
  it("explains when the backend has no Gemini API key configured", () => {
    expect(supportErrorMessage(new Error("AI_SUPPORT_NOT_CONFIGURED"))).toMatch(
      /GEMINI_API_KEY/,
    );
  });

  it("identifies a missing support route", () => {
    expect(supportErrorMessage(new Error("Endpoint not found"))).toMatch(
      /endpoint is not available/i,
    );
  });

  it("distinguishes AI provider failures from network failures", () => {
    expect(
      supportErrorMessage(new Error("AI_SUPPORT_UPSTREAM_ERROR")),
    ).toMatch(/AI service/i);
    expect(supportErrorMessage(new Error("Network request failed"))).toMatch(
      /offline/i,
    );
  });

  it("explains when the Gemini project has reached its request limit", () => {
    expect(
      supportErrorMessage(new Error("AI_SUPPORT_RATE_LIMITED")),
    ).toMatch(/Gemini API request limit/i);
  });
});

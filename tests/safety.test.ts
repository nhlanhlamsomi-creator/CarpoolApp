import { describe, expect, it } from "vitest";

import { detectSafetyAnomaly } from "../lib/safety";

const route = {
  origin: { latitude: 0, longitude: 0 },
  destination: { latitude: 0, longitude: 0.1 },
};

const sample = (latitude: number, longitude: number, minutes: number) => ({
  latitude,
  longitude,
  recordedAt: new Date(minutes * 60000).toISOString(),
});

describe("automated ride safety detection", () => {
  it("does not alert for normal route travel", () => {
    expect(
      detectSafetyAnomaly({
        ...route,
        samples: [sample(0, 0.02, 0), sample(0, 0.05, 4)],
      }),
    ).toBeNull();
  });

  it("tolerates a small GPS deviation", () => {
    expect(
      detectSafetyAnomaly({
        ...route,
        samples: [sample(0, 0.02, 0), sample(0.002, 0.05, 4)],
      }),
    ).toBeNull();
  });

  it("alerts when a deviation is sustained and movement is away from the destination", () => {
    const result = detectSafetyAnomaly({
      ...route,
      samples: [sample(0, 0.02, 0), sample(0.01, 0.005, 4)],
    });

    expect(result?.reason).toContain("Sustained route deviation");
  });

  it("alerts for a configurable prolonged stop away from the destination", () => {
    const result = detectSafetyAnomaly({
      ...route,
      samples: [sample(0.01, 0.01, 0), sample(0.01, 0.01, 11)],
    });

    expect(result?.reason).toContain("prolonged stop");
  });
});

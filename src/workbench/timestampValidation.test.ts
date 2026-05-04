import { describe, expect, it } from "vitest";

import {
  isUtcTimestampTextForMs,
  isValidUtcTimestampText,
  parseUtcTimestampTextToMs,
} from "./timestampValidation";

describe("timestampValidation", () => {
  it("parses strict UTC timestamp text with Z and explicit zero offsets", () => {
    expect(parseUtcTimestampTextToMs("2026-03-01T00:00:00.000Z")).toBe(
      1772323200000,
    );
    expect(parseUtcTimestampTextToMs("2026-03-01T00:00:00+00:00")).toBe(
      1772323200000,
    );
  });

  it("accepts source timestamps with microsecond precision when no epoch field is present", () => {
    expect(isValidUtcTimestampText("2026-03-31T16:15:33.593235+00:00")).toBe(
      true,
    );
  });

  it("rejects non-zero sub-millisecond precision when comparing to millisecond epochs", () => {
    expect(
      isUtcTimestampTextForMs("2026-03-01T00:59:59.999500Z", 1772326799999),
    ).toBe(false);
    expect(
      isUtcTimestampTextForMs("2026-03-01T00:59:59.999000Z", 1772326799999),
    ).toBe(true);
  });

  it("rejects non-UTC, normalized, and out-of-range timestamp text", () => {
    expect(isValidUtcTimestampText("2026-03-01T00:00:00")).toBe(false);
    expect(isValidUtcTimestampText("2026-02-30T00:00:00.000Z")).toBe(false);
    expect(isValidUtcTimestampText("2026-03-01T24:00:00.000Z")).toBe(false);
  });
});

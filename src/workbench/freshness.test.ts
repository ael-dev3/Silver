import { describe, expect, it } from "vitest";

import {
  describeCoverageFreshness,
  describeExportAge,
  formatElapsedDuration,
} from "./freshness";
import type { CoverageEntry } from "./types";

describe("freshness", () => {
  it("formats elapsed durations for compact terminal badges", () => {
    expect(formatElapsedDuration(12_000)).toBe("under 1m");
    expect(formatElapsedDuration(45 * 60_000)).toBe("45m");
    expect(formatElapsedDuration(2 * 60 * 60_000 + 31 * 60_000)).toBe("2h 31m");
    expect(formatElapsedDuration(3 * 24 * 60 * 60_000 + 4 * 60 * 60_000)).toBe("3d 4h");
  });

  it("describes export age relative to the browser clock", () => {
    expect(
      describeExportAge("2026-05-07T17:30:00.000Z", Date.UTC(2026, 4, 7, 18, 45, 0)),
    ).toBe("Exported 1h 15m ago");
  });

  it("classifies lag relative to the selected candle interval", () => {
    expect(
      describeCoverageFreshness(
        makeCoverage("1h", "2026-05-07T14:59:59.999Z"),
        "2026-05-07T17:30:22.882Z",
      ),
    ).toMatchObject({
      tone: "quiet",
      shortLabel: "2h 30m before refresh",
      label: "Latest candle 2h 30m before refresh",
    });

    expect(
      describeCoverageFreshness(
        makeCoverage("1m", "2026-05-07T14:58:59.999Z"),
        "2026-05-07T17:30:22.882Z",
      ).tone,
    ).toBe("stale");

    expect(
      describeCoverageFreshness(
        makeCoverage("1d", "2026-05-06T23:59:59.999Z"),
        "2026-05-07T17:30:22.882Z",
      ).tone,
    ).toBe("fresh");
  });
});

function makeCoverage(interval: CoverageEntry["interval"], lastCloseUtc: string): CoverageEntry {
  return {
    interval,
    rows: 10,
    first_open_time_utc: "2026-05-01T00:00:00.000Z",
    last_close_time_utc: lastCloseUtc,
  };
}

import { parseUtcTimestampTextToMs } from "./timestampValidation";
import type { CoverageEntry, Interval } from "./types";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const INTERVAL_DURATION_MS: Record<Interval, number> = {
  "1m": MINUTE_MS,
  "5m": 5 * MINUTE_MS,
  "15m": 15 * MINUTE_MS,
  "1h": HOUR_MS,
  "4h": 4 * HOUR_MS,
  "1d": DAY_MS,
  "1w": 7 * DAY_MS,
};

export type FreshnessTone = "fresh" | "quiet" | "stale";

export interface CoverageFreshness {
  ageMs: number;
  tone: FreshnessTone;
  label: string;
  shortLabel: string;
}

function requireUtcMs(value: string, fieldName: string): number {
  const epochMs = parseUtcTimestampTextToMs(value);
  if (epochMs === null) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return epochMs;
}

export function formatElapsedDuration(durationMs: number): string {
  const clampedMs = Math.max(0, durationMs);
  if (clampedMs < MINUTE_MS) {
    return "under 1m";
  }

  const days = Math.floor(clampedMs / DAY_MS);
  const hours = Math.floor((clampedMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((clampedMs % HOUR_MS) / MINUTE_MS);

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

export function describeExportAge(downloadedAtUtc: string, nowMs = Date.now()): string {
  const downloadedAtMs = requireUtcMs(downloadedAtUtc, "downloaded_at_utc");
  return `Exported ${formatElapsedDuration(nowMs - downloadedAtMs)} ago`;
}

export function describeCoverageFreshness(
  coverage: CoverageEntry,
  downloadedAtUtc: string,
): CoverageFreshness {
  const downloadedAtMs = requireUtcMs(downloadedAtUtc, "downloaded_at_utc");
  const lastCloseMs = requireUtcMs(coverage.last_close_time_utc, "last_close_time_utc");
  const ageMs = Math.max(0, downloadedAtMs - lastCloseMs);
  const intervalMs = INTERVAL_DURATION_MS[coverage.interval];
  const freshThresholdMs = intervalMs * 1.5;
  const quietThresholdMs = Math.max(intervalMs * 6, HOUR_MS);
  const tone: FreshnessTone =
    ageMs <= freshThresholdMs ? "fresh" : ageMs <= quietThresholdMs ? "quiet" : "stale";
  const shortLabel =
    ageMs < MINUTE_MS ? "closed at refresh" : `${formatElapsedDuration(ageMs)} before refresh`;

  return {
    ageMs,
    tone,
    shortLabel,
    label: `Latest candle ${shortLabel}`,
  };
}

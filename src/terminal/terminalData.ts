import { parseCandleCsv } from "../workbench/candleValidation";
import { calculateMovingAverageValues } from "../workbench/movingAverage";
import { isUtcTimestampTextForMs, parseUtcTimestampTextToMs } from "../workbench/timestampValidation";
import type { CandleRow, CoverageEntry, IndicatorPoint, Interval } from "../workbench/types";

const INTERVAL_ORDER: Interval[] = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
const VALID_INTERVALS = new Set<Interval>(INTERVAL_ORDER);

interface RawCoverageEntry {
  interval?: unknown;
  rows?: unknown;
  first_open_time?: unknown;
  first_open_time_utc?: unknown;
  last_close_time?: unknown;
  last_close_time_utc?: unknown;
}

interface RawMetadata {
  source?: unknown;
  api_url?: unknown;
  downloaded_at_utc?: unknown;
  pair?: unknown;
  coverage?: unknown;
}

interface RawPairMetadata {
  pair_id?: unknown;
  display_name?: unknown;
}

export interface TerminalMetadata {
  source: string;
  apiUrl?: string;
  downloadedAtUtc: string;
  pairDisplayName: string;
  pairId: string;
  coverage: CoverageEntry[];
}

export interface TerminalDataset {
  rows: CandleRow[];
  ema20: IndicatorPoint[];
  ema50: IndicatorPoint[];
}

function requireObject(value: unknown, context: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${context}`);
  }

  return value as Record<string, unknown>;
}

function requireNonEmptyString(value: unknown, context: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${context}`);
  }

  return value.trim();
}

function normalizeOptionalString(value: unknown, context: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return requireNonEmptyString(value, context);
}

function requirePositiveSafeInteger(value: unknown, context: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Invalid ${context}`);
  }

  return value;
}

function parseTimestampText(
  textValue: unknown,
  epochValue: unknown,
  utcFieldName: string,
  epochFieldName: string,
): { text: string; epochMs: number } {
  const text = requireNonEmptyString(textValue, utcFieldName);

  if (epochValue === undefined || epochValue === null) {
    const epochMs = parseUtcTimestampTextToMs(text);
    if (epochMs === null) {
      throw new Error(`Invalid ${utcFieldName}`);
    }

    return {
      text,
      epochMs,
    };
  }

  if (typeof epochValue !== "number" || !Number.isSafeInteger(epochValue) || epochValue < 0) {
    throw new Error(`Invalid ${epochFieldName}`);
  }

  if (!isUtcTimestampTextForMs(text, epochValue)) {
    throw new Error(`${utcFieldName} does not match ${epochFieldName}`);
  }

  return {
    text,
    epochMs: epochValue,
  };
}

function compareIntervals(left: CoverageEntry, right: CoverageEntry): number {
  return INTERVAL_ORDER.indexOf(left.interval) - INTERVAL_ORDER.indexOf(right.interval);
}

function normalizeCoverageEntry(value: unknown, seenIntervals: Set<Interval>): CoverageEntry {
  const entry = value as RawCoverageEntry;
  const intervalText = requireNonEmptyString(entry.interval, "coverage interval");
  if (!VALID_INTERVALS.has(intervalText as Interval)) {
    throw new Error(`Invalid coverage interval: ${intervalText}`);
  }

  const interval = intervalText as Interval;
  if (seenIntervals.has(interval)) {
    throw new Error(`Duplicate coverage interval: ${interval}`);
  }
  seenIntervals.add(interval);

  const rows = requirePositiveSafeInteger(entry.rows, `coverage rows for ${interval}`);
  const first = parseTimestampText(
    entry.first_open_time_utc,
    entry.first_open_time,
    "first_open_time_utc",
    "first_open_time",
  );
  const last = parseTimestampText(
    entry.last_close_time_utc,
    entry.last_close_time,
    "last_close_time_utc",
    "last_close_time",
  );

  if (first.epochMs > last.epochMs) {
    throw new Error(`Coverage window is reversed for ${interval}`);
  }

  return {
    interval,
    rows,
    first_open_time_utc: first.text,
    last_close_time_utc: last.text,
  };
}

function buildIndicatorSeries(rows: CandleRow[], period: number): IndicatorPoint[] {
  const values = calculateMovingAverageValues(rows, period, "ema");
  const points: IndicatorPoint[] = [];

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (Number.isNaN(value)) {
      continue;
    }

    points.push({
      time: rows[index].open_time / 1000,
      value,
    });
  }

  return points;
}

export function parseTerminalMetadata(payload: unknown): TerminalMetadata {
  const rawMetadata = requireObject(payload, "terminal metadata") as RawMetadata;
  const pair = requireObject(rawMetadata.pair, "pair metadata") as RawPairMetadata;

  const coverageValues = rawMetadata.coverage;
  if (!Array.isArray(coverageValues) || coverageValues.length === 0) {
    throw new Error("Missing metadata coverage");
  }

  const seenIntervals = new Set<Interval>();
  const coverage = coverageValues
    .map((entry) => normalizeCoverageEntry(entry, seenIntervals))
    .sort(compareIntervals);

  return {
    source: requireNonEmptyString(rawMetadata.source, "metadata source"),
    apiUrl: normalizeOptionalString(rawMetadata.api_url, "metadata api_url"),
    downloadedAtUtc: parseTimestampText(
      rawMetadata.downloaded_at_utc,
      undefined,
      "downloaded_at_utc",
      "downloaded_at_utc",
    ).text,
    pairDisplayName: requireNonEmptyString(pair.display_name, "pair display_name"),
    pairId: requireNonEmptyString(pair.pair_id, "pair pair_id"),
    coverage,
  };
}

export function parseTerminalDataset(csvText: string, interval: Interval): TerminalDataset {
  const rows = parseCandleCsv(csvText, {
    expectedInterval: interval,
    datasetLabel: `Silver terminal ${interval}`,
  });

  if (!rows.length) {
    throw new Error(`No candles available for ${interval}`);
  }

  return {
    rows,
    ema20: buildIndicatorSeries(rows, 20),
    ema50: buildIndicatorSeries(rows, 50),
  };
}

export function getCoverageEntry(
  metadata: TerminalMetadata,
  interval: Interval,
): CoverageEntry | undefined {
  return metadata.coverage.find((entry) => entry.interval === interval);
}

export function chooseInitialTimeframe(
  coverage: readonly CoverageEntry[],
  requestedInterval: string | null,
): Interval {
  if (!coverage.length) {
    throw new Error("No metadata coverage available");
  }

  const availableIntervals = coverage.map((entry) => entry.interval);
  if (
    requestedInterval &&
    VALID_INTERVALS.has(requestedInterval as Interval) &&
    availableIntervals.includes(requestedInterval as Interval)
  ) {
    return requestedInterval as Interval;
  }

  return availableIntervals.includes("1h") ? "1h" : availableIntervals[0];
}

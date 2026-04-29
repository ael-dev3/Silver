import type { CandleRow, Interval } from "./types";
import { assertUtcTimestampTextForMs } from "./timestampValidation";

const EXPECTED_HEADER = [
  "open_time",
  "close_time",
  "open_time_utc",
  "close_time_utc",
  "symbol",
  "interval",
  "open",
  "high",
  "low",
  "close",
  "volume",
  "trade_count",
].join(",");

const VALID_INTERVALS = new Set<Interval>(["1m", "5m", "15m", "1h", "4h", "1d", "1w"]);
const INTERVAL_SPAN_MS: Record<Interval, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "1h": 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
  "1w": 7 * 24 * 60 * 60_000,
};

const INTEGER_TEXT_PATTERN = /^-?\d+$/;

interface ParseCandleCsvOptions {
  expectedInterval?: Interval;
  datasetLabel?: string;
}

function parseFiniteNumber(rawValue: string, fieldName: string, lineNumber: number): number {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
  }

  const value = Number(trimmedValue);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
  }
  return value;
}

function parseInteger(rawValue: string, fieldName: string, lineNumber: number): number {
  const trimmedValue = rawValue.trim();
  if (!INTEGER_TEXT_PATTERN.test(trimmedValue)) {
    throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
  }

  const value = parseFiniteNumber(rawValue, fieldName, lineNumber);
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
  }
  return value;
}

function validateRange(row: CandleRow, lineNumber: number): void {
  if (row.close_time <= row.open_time) {
    throw new Error(`Invalid candle timestamps at line ${lineNumber}`);
  }

  const candleSpanMs = row.close_time - row.open_time + 1;
  if (candleSpanMs > INTERVAL_SPAN_MS[row.interval]) {
    throw new Error(`Candle span exceeds ${row.interval} at line ${lineNumber}`);
  }

  if (row.volume < 0) {
    throw new Error(`Invalid volume at line ${lineNumber}`);
  }

  if (row.trade_count < 0) {
    throw new Error(`Invalid trade_count at line ${lineNumber}`);
  }

  const highestBodyValue = Math.max(row.open, row.close);
  const lowestBodyValue = Math.min(row.open, row.close);
  if (row.high < highestBodyValue || row.low > lowestBodyValue || row.high < row.low) {
    throw new Error(`Invalid OHLC range at line ${lineNumber}`);
  }
}

export function parseCandleCsv(
  text: string,
  options: ParseCandleCsvOptions = {},
): CandleRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    return [];
  }

  const header = (lines[0] ?? "").replace(/^\uFEFF/, "").trim();
  if (header !== EXPECTED_HEADER) {
    const datasetDetail = options.datasetLabel ? ` for ${options.datasetLabel}` : "";
    throw new Error(`Malformed candle header${datasetDetail}`);
  }

  const candles: CandleRow[] = [];
  let previousOpenTime: number | null = null;
  let previousCloseTime: number | null = null;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    const lineNumber = index + 1;
    const parts = line.split(",");
    if (parts.length !== 12) {
      throw new Error(`Malformed candle row at line ${lineNumber}`);
    }

    const intervalValue = parts[5]?.trim();
    if (!VALID_INTERVALS.has(intervalValue as Interval)) {
      throw new Error(`Invalid interval at line ${lineNumber}`);
    }

    const row: CandleRow = {
      open_time: parseInteger(parts[0], "open_time", lineNumber),
      close_time: parseInteger(parts[1], "close_time", lineNumber),
      open_time_utc: parts[2]?.trim() ?? "",
      close_time_utc: parts[3]?.trim() ?? "",
      symbol: parts[4]?.trim() ?? "",
      interval: intervalValue as Interval,
      open: parseFiniteNumber(parts[6], "open", lineNumber),
      high: parseFiniteNumber(parts[7], "high", lineNumber),
      low: parseFiniteNumber(parts[8], "low", lineNumber),
      close: parseFiniteNumber(parts[9], "close", lineNumber),
      volume: parseFiniteNumber(parts[10], "volume", lineNumber),
      trade_count: parseInteger(parts[11], "trade_count", lineNumber),
    };

    if (!row.symbol) {
      throw new Error(`Missing symbol at line ${lineNumber}`);
    }

    if (options.expectedInterval && row.interval !== options.expectedInterval) {
      throw new Error(`Unexpected interval at line ${lineNumber}`);
    }

    assertUtcTimestampTextForMs(
      row.open_time_utc,
      row.open_time,
      "open_time_utc",
      "open_time",
      lineNumber,
    );
    assertUtcTimestampTextForMs(
      row.close_time_utc,
      row.close_time,
      "close_time_utc",
      "close_time",
      lineNumber,
    );

    if (previousOpenTime !== null && row.open_time <= previousOpenTime) {
      throw new Error(`Non-ascending open_time at line ${lineNumber}`);
    }

    if (previousCloseTime !== null && row.open_time <= previousCloseTime) {
      throw new Error(`Overlapping candle timestamps at line ${lineNumber}`);
    }

    validateRange(row, lineNumber);
    candles.push(row);
    previousOpenTime = row.open_time;
    previousCloseTime = row.close_time;
  }

  return candles;
}

import type { CandleRow, Interval } from "./types";

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

interface ParseCandleCsvOptions {
  expectedInterval?: Interval;
  datasetLabel?: string;
}

function parseFiniteNumber(rawValue: string, fieldName: string, lineNumber: number): number {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
  }
  return value;
}

function parseInteger(rawValue: string, fieldName: string, lineNumber: number): number {
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
      open_time_utc: parts[2],
      close_time_utc: parts[3],
      symbol: parts[4]?.trim() ?? "",
      interval: intervalValue as Interval,
      open: parseFiniteNumber(parts[6], "open", lineNumber),
      high: parseFiniteNumber(parts[7], "high", lineNumber),
      low: parseFiniteNumber(parts[8], "low", lineNumber),
      close: parseFiniteNumber(parts[9], "close", lineNumber),
      volume: parseFiniteNumber(parts[10], "volume", lineNumber),
      trade_count: parseInteger(parts[11], "trade_count", lineNumber),
    };

    if (!row.open_time_utc || !row.close_time_utc) {
      throw new Error(`Missing candle timestamp text at line ${lineNumber}`);
    }

    if (!row.symbol) {
      throw new Error(`Missing symbol at line ${lineNumber}`);
    }

    if (options.expectedInterval && row.interval !== options.expectedInterval) {
      throw new Error(`Unexpected interval at line ${lineNumber}`);
    }

    if (previousOpenTime !== null && row.open_time <= previousOpenTime) {
      throw new Error(`Non-ascending open_time at line ${lineNumber}`);
    }

    validateRange(row, lineNumber);
    candles.push(row);
    previousOpenTime = row.open_time;
  }

  return candles;
}

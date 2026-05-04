const UTC_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]00:00)$/i;

interface ParsedUtcTimestamp {
  epochMs: number;
  hasNonZeroSubMillisecondPrecision: boolean;
}

function parseUtcTimestampText(value: string): ParsedUtcTimestamp | null {
  const trimmed = value.trim();
  const match = UTC_TIMESTAMP_PATTERN.exec(trimmed);
  if (!match) {
    return null;
  }

  const [, rawYear, rawMonth, rawDay, rawHour, rawMinute, rawSecond, rawFraction = ""] =
    match;

  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const second = Number(rawSecond);
  const millisecond = Number(rawFraction.slice(0, 3).padEnd(3, "0"));

  if (
    year < 1000 ||
    month < 1 ||
    month > 12 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }

  const epochMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  if (!Number.isFinite(epochMs)) {
    return null;
  }

  const date = new Date(epochMs);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== second ||
    date.getUTCMilliseconds() !== millisecond
  ) {
    return null;
  }

  return {
    epochMs,
    hasNonZeroSubMillisecondPrecision: /[1-9]/.test(rawFraction.slice(3)),
  };
}

export function parseUtcTimestampTextToMs(value: string): number | null {
  return parseUtcTimestampText(value)?.epochMs ?? null;
}

export function isValidUtcTimestampText(value: string): boolean {
  return parseUtcTimestampText(value) !== null;
}

export function isUtcTimestampTextForMs(value: string, expectedMs: number): boolean {
  const parsed = parseUtcTimestampText(value);
  return (
    parsed !== null &&
    parsed.epochMs === expectedMs &&
    !parsed.hasNonZeroSubMillisecondPrecision
  );
}

export function assertUtcTimestampTextForMs(
  value: string,
  expectedMs: number,
  fieldName: string,
  epochFieldName: string,
  lineNumber: number,
): void {
  const parsed = parseUtcTimestampText(value);
  if (parsed === null) {
    throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
  }

  if (parsed.epochMs !== expectedMs || parsed.hasNonZeroSubMillisecondPrecision) {
    throw new Error(`${fieldName} does not match ${epochFieldName} at line ${lineNumber}`);
  }
}

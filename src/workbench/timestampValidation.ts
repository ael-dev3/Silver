const UTC_ZERO_OFFSET_SUFFIX = /(Z|[+-]00:00)$/i;

function parseUtcTimestampText(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || !UTC_ZERO_OFFSET_SUFFIX.test(trimmed)) {
    return null;
  }

  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isValidUtcTimestampText(value: string): boolean {
  return parseUtcTimestampText(value) !== null;
}

export function isUtcTimestampTextForMs(value: string, expectedMs: number): boolean {
  return parseUtcTimestampText(value) === expectedMs;
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

  if (parsed !== expectedMs) {
    throw new Error(`${fieldName} does not match ${epochFieldName} at line ${lineNumber}`);
  }
}

import { INDICATORS } from "./indicators";

const NO_INDICATORS_TOKEN = "none";

function validIndicatorIds(): Set<string> {
  return new Set(INDICATORS.map((indicator) => indicator.id));
}

export function defaultIndicatorIds(): Set<string> {
  return new Set(
    INDICATORS.filter((indicator) => indicator.defaultEnabled).map((indicator) => indicator.id),
  );
}

export function parseIndicatorIdsParam(indicatorParam: string | null): Set<string> {
  if (indicatorParam === null) {
    return defaultIndicatorIds();
  }

  const trimmedParam = indicatorParam.trim();
  if (!trimmedParam || trimmedParam.toLowerCase() === NO_INDICATORS_TOKEN) {
    return new Set();
  }

  const allowedIds = validIndicatorIds();
  const indicatorIds = new Set(
    trimmedParam
      .split(",")
      .map((value) => value.trim())
      .filter((value) => allowedIds.has(value)),
  );

  return indicatorIds.size ? indicatorIds : defaultIndicatorIds();
}

export function serializeIndicatorIdsParam(indicatorIds: Iterable<string>): string {
  const activeIds = new Set(indicatorIds);
  const orderedIds = INDICATORS.map((indicator) => indicator.id).filter((id) => activeIds.has(id));

  return orderedIds.length ? orderedIds.join(",") : NO_INDICATORS_TOKEN;
}

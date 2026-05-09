import { describe, expect, it } from "vitest";

import {
  parseIndicatorIdsParam,
  serializeIndicatorIdsParam,
} from "./urlState";

function setToArray(values: Set<string>): string[] {
  return [...values];
}

describe("workbench URL state", () => {
  it("uses default indicators when no indicator parameter is present", () => {
    expect(setToArray(parseIndicatorIdsParam(null))).toEqual(["ema20", "ema50"]);
  });

  it("preserves an explicit no-indicator selection", () => {
    expect(setToArray(parseIndicatorIdsParam("none"))).toEqual([]);
    expect(setToArray(parseIndicatorIdsParam(""))).toEqual([]);
    expect(serializeIndicatorIdsParam(new Set())).toBe("none");
  });

  it("normalizes selected indicators into stable catalog order", () => {
    expect(setToArray(parseIndicatorIdsParam("sma20,ema20"))).toEqual(["sma20", "ema20"]);
    expect(serializeIndicatorIdsParam(new Set(["sma20", "ema20"]))).toBe("ema20,sma20");
  });

  it("falls back to defaults for malformed indicator parameters", () => {
    expect(setToArray(parseIndicatorIdsParam("missing,unknown"))).toEqual(["ema20", "ema50"]);
  });
});

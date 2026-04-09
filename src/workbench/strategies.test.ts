import { describe, expect, it } from "vitest";

import { STRATEGIES } from "./strategies";
import type { CandleRow } from "./types";

const emaCrossStrategy = STRATEGIES.find((strategy) => strategy.id === "ema-cross");

if (!emaCrossStrategy) {
  throw new Error("EMA cross strategy is not registered.");
}

describe("EMA 20/50 Cross strategy", () => {
  it("captures intratrade drawdown from marked-to-market equity", () => {
    const candles = buildCandles([
      ...Array(60).fill(100),
      ...Array(6).fill(110),
      85,
      ...Array(10).fill(115),
    ]);

    const result = emaCrossStrategy.run(candles);

    expect(result).not.toBeNull();
    expect(result?.tradeCount).toBe(1);
    expect(result?.totalReturnPct).toBeCloseTo(4.54545, 4);
    expect(result?.maxDrawdownPct).toBeCloseTo(-22.72727, 4);
  });

  it("keeps drawdown at zero when equity only moves higher after entry", () => {
    const candles = buildCandles([
      ...Array(60).fill(100),
      ...Array(6).fill(110),
      ...Array(10).fill(115),
    ]);

    const result = emaCrossStrategy.run(candles);

    expect(result).not.toBeNull();
    expect(result?.tradeCount).toBe(1);
    expect(result?.totalReturnPct).toBeCloseTo(4.54545, 4);
    expect(result?.maxDrawdownPct).toBe(0);
  });
});

function buildCandles(closes: number[]): CandleRow[] {
  const oneHourMs = 60 * 60 * 1000;
  const start = Date.UTC(2026, 2, 1, 0, 0, 0, 0);

  return closes.map((close, index) => {
    const openTime = start + index * oneHourMs;
    const closeTime = openTime + oneHourMs - 1;

    return {
      open_time: openTime,
      close_time: closeTime,
      open_time_utc: new Date(openTime).toISOString(),
      close_time_utc: new Date(closeTime).toISOString(),
      symbol: "SLV/USDC",
      interval: "1h",
      open: close,
      high: close,
      low: close,
      close,
      volume: 100 + index,
      trade_count: 10 + index,
    };
  });
}

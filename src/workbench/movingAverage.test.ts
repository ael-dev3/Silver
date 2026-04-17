import { describe, expect, it } from "vitest";

import { buildMovingAverageSeries, calculateMovingAverageValues } from "./movingAverage";
import type { CandleRow } from "./types";

describe("movingAverage", () => {
  it("seeds EMA from the initial SMA window before smoothing forward", () => {
    const candles = buildCandles([1, 2, 3, 4, 5]);

    const values = calculateMovingAverageValues(candles, 3, "ema");

    expect(values[0]).toBeNaN();
    expect(values[1]).toBeNaN();
    expect(values[2]).toBeCloseTo(2, 8);
    expect(values[3]).toBeCloseTo(3, 8);
    expect(values[4]).toBeCloseTo(4, 8);
  });

  it("builds chart series from the first fully formed moving-average point", () => {
    const candles = buildCandles([10, 20, 30, 40]);

    const series = buildMovingAverageSeries(candles, 3, "sma");

    expect(series).toEqual([
      {
        time: candles[2].open_time / 1000,
        value: 20,
      },
      {
        time: candles[3].open_time / 1000,
        value: 30,
      },
    ]);
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

import { describe, expect, it } from "vitest";

import { parseCandleCsv } from "./candleValidation";

const HEADER =
  "open_time,close_time,open_time_utc,close_time_utc,symbol,interval,open,high,low,close,volume,trade_count";

describe("parseCandleCsv", () => {
  it("accepts explicit UTC offsets in candle timestamp text", () => {
    const candles = parseCandleCsv(
      [
        HEADER,
        "1772323200000,1772326799999,2026-03-01T00:00:00+00:00,2026-03-01T00:59:59.999000+00:00,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
      ].join("\n"),
      { expectedInterval: "1h" },
    );

    expect(candles).toHaveLength(1);
    expect(candles[0]).toMatchObject({
      open_time_utc: "2026-03-01T00:00:00+00:00",
      close_time_utc: "2026-03-01T00:59:59.999000+00:00",
    });
  });

  it("rejects timestamp text that does not match the numeric open_time", () => {
    expect(() =>
      parseCandleCsv(
        [
          HEADER,
          "1772323200000,1772326799999,2026-03-01T01:00:00.000Z,2026-03-01T00:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
        ].join("\n"),
      )).toThrow("open_time_utc does not match open_time at line 2");
  });

  it("rejects timestamp text that is not explicitly UTC", () => {
    expect(() =>
      parseCandleCsv(
        [
          HEADER,
          "1772323200000,1772326799999,2026-03-01T00:00:00,2026-03-01T00:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
        ].join("\n"),
      )).toThrow("Invalid open_time_utc at line 2");
  });

  it("rejects candles whose reported span exceeds their declared interval", () => {
    expect(() =>
      parseCandleCsv(
        [
          HEADER,
          "1772323200000,1772330399999,2026-03-01T00:00:00.000Z,2026-03-01T01:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
        ].join("\n"),
      )).toThrow("Candle span exceeds 1h at line 2");
  });

  it("rejects blank numeric cells instead of coercing them to zero", () => {
    expect(() =>
      parseCandleCsv(
        [
          HEADER,
          "1772323200000,1772326799999,2026-03-01T00:00:00.000Z,2026-03-01T00:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150, ,2",
        ].join("\n"),
      )).toThrow("Invalid volume at line 2");
  });

  it("rejects non-literal integer cells in timestamp and count fields", () => {
    expect(() =>
      parseCandleCsv(
        [
          HEADER,
          "1772323200000,1.772326799999e12,2026-03-01T00:00:00.000Z,2026-03-01T00:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
        ].join("\n"),
      )).toThrow("Invalid close_time at line 2");
  });

  it("rejects overlapping candles even when open_time stays ascending", () => {
    expect(() =>
      parseCandleCsv(
        [
          HEADER,
          "1772323200000,1772326799999,2026-03-01T00:00:00.000Z,2026-03-01T00:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
          "1772325000000,1772328599999,2026-03-01T00:30:00.000Z,2026-03-01T01:29:59.999Z,SLV/USDC,1h,31.150,31.250,31.100,31.225,110,3",
        ].join("\n"),
      )).toThrow("Overlapping candle timestamps at line 3");
  });
});

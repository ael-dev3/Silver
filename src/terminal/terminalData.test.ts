import { describe, expect, it } from "vitest";

import type { Interval } from "../workbench/types";
import {
  chooseInitialTimeframe,
  parseTerminalDataset,
  parseTerminalMetadata,
} from "./terminalData";

const HEADER =
  "open_time,close_time,open_time_utc,close_time_utc,symbol,interval,open,high,low,close,volume,trade_count";

describe("terminalData", () => {
  it("parses validated terminal datasets and builds EMA overlays from shared logic", () => {
    const dataset = parseTerminalDataset(buildCsv("1h", 60), "1h");

    expect(dataset.rows).toHaveLength(60);
    expect(dataset.ema20).toHaveLength(41);
    expect(dataset.ema50).toHaveLength(11);
    expect(dataset.ema20[0]).toEqual({
      time: dataset.rows[19].open_time / 1000,
      value: 109.5,
    });
    expect(dataset.ema50[0]).toEqual({
      time: dataset.rows[49].open_time / 1000,
      value: 124.5,
    });
  });

  it("rejects malformed terminal CSV rows instead of silently accepting drifted data", () => {
    expect(() =>
      parseTerminalDataset(
        [
          HEADER,
          "1772323200000,1772326799999,2026-03-01T00:00:00.000Z,2026-03-01T01:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
        ].join("\n"),
        "1h",
      )).toThrow("close_time_utc does not match close_time at line 2");
  });

  it("rejects malformed metadata coverage instead of rendering ambiguous timeframe state", () => {
    expect(() =>
      parseTerminalMetadata({
        source: "Hyperliquid official API",
        api_url: "https://api.hyperliquid.xyz/info",
        downloaded_at_utc: "2026-03-31T16:15:33.593235+00:00",
        pair: {
          pair_id: "@265",
          display_name: "SLV/USDC",
        },
        coverage: [
          {
            interval: "1h",
            rows: 2,
            first_open_time: 1772323200000,
            first_open_time_utc: "2026-03-01T00:00:00.000Z",
            last_close_time: 1772330399999,
            last_close_time_utc: "2026-03-01T01:59:59.999Z",
          },
          {
            interval: "1h",
            rows: 3,
            first_open_time: 1772330400000,
            first_open_time_utc: "2026-03-01T02:00:00.000Z",
            last_close_time: 1772341199999,
            last_close_time_utc: "2026-03-01T04:59:59.999Z",
          },
        ],
      })).toThrow("Duplicate coverage interval: 1h");
  });

  it("prefers a valid requested timeframe and otherwise falls back to 1h", () => {
    const metadata = parseTerminalMetadata({
      source: "Hyperliquid official API",
      api_url: "https://api.hyperliquid.xyz/info",
      downloaded_at_utc: "2026-03-31T16:15:33.593235+00:00",
      pair: {
        pair_id: "@265",
        display_name: "SLV/USDC",
      },
      coverage: [
        {
          interval: "1m",
          rows: 10,
          first_open_time: 1772323200000,
          first_open_time_utc: "2026-03-01T00:00:00.000Z",
          last_close_time: 1772323799999,
          last_close_time_utc: "2026-03-01T00:09:59.999Z",
        },
        {
          interval: "1h",
          rows: 10,
          first_open_time: 1772323200000,
          first_open_time_utc: "2026-03-01T00:00:00.000Z",
          last_close_time: 1772359199999,
          last_close_time_utc: "2026-03-01T09:59:59.999Z",
        },
      ],
    });

    expect(chooseInitialTimeframe(metadata.coverage, "1m")).toBe("1m");
    expect(chooseInitialTimeframe(metadata.coverage, "1d")).toBe("1h");
    expect(chooseInitialTimeframe(metadata.coverage, null)).toBe("1h");
  });
});

function buildCsv(interval: Interval, rowCount: number): string {
  const oneHourMs = 60 * 60 * 1000;
  const start = Date.UTC(2026, 2, 1, 0, 0, 0, 0);
  const rows: string[] = [HEADER];

  for (let index = 0; index < rowCount; index += 1) {
    const openTime = start + index * oneHourMs;
    const closeTime = openTime + oneHourMs - 1;
    const close = 100 + index;
    rows.push(
      [
        openTime,
        closeTime,
        new Date(openTime).toISOString(),
        new Date(closeTime).toISOString(),
        "SLV/USDC",
        interval,
        close,
        close + 1,
        close - 1,
        close,
        1000 + index,
        10 + index,
      ].join(","),
    );
  }

  return rows.join("\n");
}

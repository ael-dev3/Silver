import { describe, expect, it, vi } from "vitest";
import { DataRepository } from "./dataRepository";
import type { DatasetDefinition, Interval } from "./types";

describe("DataRepository", () => {
  it("retries dataset loads after a transient CSV failure", async () => {
    let csvAttempts = 0;
    const repository = new DataRepository(async (path) => {
      if (path === "/silver_1h.csv") {
        csvAttempts += 1;
        if (csvAttempts === 1) {
          return response({ ok: false });
        }

        return response({ text: buildCsv("1h") });
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    await expect(repository.loadDataset(makeDefinition(), "1h")).rejects.toThrow(
      "Failed to load /silver_1h.csv",
    );

    const dataset = await repository.loadDataset(makeDefinition(), "1h");

    expect(csvAttempts).toBe(2);
    expect(dataset.candles).toHaveLength(2);
    expect(dataset.coverage).toMatchObject({
      interval: "1h",
      rows: 2,
      first_open_time_utc: "2026-03-01T00:00:00.000Z",
      last_close_time_utc: "2026-03-01T01:59:59.999Z",
    });
  });

  it("falls back to CSV-derived coverage when metadata is unavailable", async () => {
    const paths: string[] = [];
    const repository = new DataRepository(async (path) => {
      paths.push(path);

      if (path === "/meta.json") {
        return response({ ok: false });
      }

      if (path === "/silver_1h.csv") {
        return response({ text: buildCsv("1h") });
      }

      if (path === "/silver_1d.csv") {
        return response({ text: buildCsv("1d") });
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    const overview = await repository.loadOverview(
      makeDefinition({ intervals: ["1h", "1d"] }),
    );

    expect(paths).toEqual(["/meta.json", "/silver_1h.csv", "/silver_1d.csv"]);
    expect(overview.meta).toEqual({
      sourceLabel: "Silver feed",
      displayName: "SLV/USDC",
    });
    expect(overview.coverage).toEqual([
      {
        interval: "1h",
        rows: 2,
        first_open_time_utc: "2026-03-01T00:00:00.000Z",
        last_close_time_utc: "2026-03-01T01:59:59.999Z",
      },
      {
        interval: "1d",
        rows: 2,
        first_open_time_utc: "2026-03-01T00:00:00.000Z",
        last_close_time_utc: "2026-03-02T23:59:59.999Z",
      },
    ]);
  });

  it("backfills only the intervals missing from metadata coverage", async () => {
    const fetcher = vi.fn(async (path: string) => {
      if (path === "/meta.json") {
        return response({
          json: {
            source: "Hyperliquid",
            pair: { display_name: "SLV/USDC", pair_id: "SLV/USDC" },
            coverage: [
              {
                interval: "1d",
                rows: 2,
                first_open_time_utc: "2026-03-01T00:00:00.000Z",
                last_close_time_utc: "2026-03-02T23:59:59.999Z",
              },
            ],
          },
        });
      }

      if (path === "/silver_1h.csv") {
        return response({ text: buildCsv("1h") });
      }

      throw new Error(`Unexpected path: ${path}`);
    });
    const repository = new DataRepository(fetcher);

    const overview = await repository.loadOverview(
      makeDefinition({ intervals: ["1h", "1d"] }),
    );

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(1, "/meta.json", { cache: "no-store" });
    expect(fetcher).toHaveBeenNthCalledWith(2, "/silver_1h.csv", { cache: "no-store" });
    expect(overview.meta).toEqual({
      sourceLabel: "Hyperliquid",
      displayName: "SLV/USDC",
      downloadedAtUtc: undefined,
      pairId: "SLV/USDC",
      apiUrl: undefined,
      note: undefined,
    });
    expect(overview.coverage).toEqual([
      {
        interval: "1h",
        rows: 2,
        first_open_time_utc: "2026-03-01T00:00:00.000Z",
        last_close_time_utc: "2026-03-01T01:59:59.999Z",
      },
      {
        interval: "1d",
        rows: 2,
        first_open_time_utc: "2026-03-01T00:00:00.000Z",
        last_close_time_utc: "2026-03-02T23:59:59.999Z",
      },
    ]);
  });

  it("falls back to CSV-derived coverage when metadata timestamps do not match their numeric fields", async () => {
    const fetcher = vi.fn(async (path: string) => {
      if (path === "/meta.json") {
        return response({
          json: {
            source: "Hyperliquid",
            coverage: [
              {
                interval: "1d",
                rows: 2,
                first_open_time: 1772323200000,
                first_open_time_utc: "2026-03-02T00:00:00.000Z",
                last_close_time: 1772495999999,
                last_close_time_utc: "2026-03-03T23:59:59.999Z",
              },
            ],
          },
        });
      }

      if (path === "/silver_1d.csv") {
        return response({ text: buildCsv("1d") });
      }

      throw new Error(`Unexpected path: ${path}`);
    });
    const repository = new DataRepository(fetcher);

    const overview = await repository.loadOverview(
      makeDefinition({ intervals: ["1d"], defaultInterval: "1d" }),
    );

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(1, "/meta.json", { cache: "no-store" });
    expect(fetcher).toHaveBeenNthCalledWith(2, "/silver_1d.csv", { cache: "no-store" });
    expect(overview.coverage).toEqual([
      {
        interval: "1d",
        rows: 2,
        first_open_time_utc: "2026-03-01T00:00:00.000Z",
        last_close_time_utc: "2026-03-02T23:59:59.999Z",
      },
    ]);
  });

  it("falls back to CSV-derived coverage when metadata coverage windows are reversed", async () => {
    const fetcher = vi.fn(async (path: string) => {
      if (path === "/meta.json") {
        return response({
          json: {
            source: "Hyperliquid",
            coverage: [
              {
                interval: "1d",
                rows: 2,
                first_open_time_utc: "2026-03-02T00:00:00.000Z",
                last_close_time_utc: "2026-03-01T23:59:59.999Z",
              },
            ],
          },
        });
      }

      if (path === "/silver_1d.csv") {
        return response({ text: buildCsv("1d") });
      }

      throw new Error(`Unexpected path: ${path}`);
    });
    const repository = new DataRepository(fetcher);

    const overview = await repository.loadOverview(
      makeDefinition({ intervals: ["1d"], defaultInterval: "1d" }),
    );

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(1, "/meta.json", { cache: "no-store" });
    expect(fetcher).toHaveBeenNthCalledWith(2, "/silver_1d.csv", { cache: "no-store" });
    expect(overview.coverage).toEqual([
      {
        interval: "1d",
        rows: 2,
        first_open_time_utc: "2026-03-01T00:00:00.000Z",
        last_close_time_utc: "2026-03-02T23:59:59.999Z",
      },
    ]);
  });

  it("rejects malformed candles whose close falls outside the reported range", async () => {
    const repository = new DataRepository(async (path) => {
      if (path === "/silver_1h.csv") {
        return response({
          text: [
            "open_time,close_time,open_time_utc,close_time_utc,symbol,interval,open,high,low,close,volume,trade_count",
            "1772323200000,1772326799999,2026-03-01T00:00:00.000Z,2026-03-01T00:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,30.900,100,2",
          ].join("\n"),
        });
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    await expect(repository.loadDataset(makeDefinition(), "1h")).rejects.toThrow(
      "Invalid OHLC range at line 2",
    );
  });

  it("rejects descending timestamps instead of silently reordering candles", async () => {
    const repository = new DataRepository(async (path) => {
      if (path === "/silver_1h.csv") {
        return response({
          text: [
            "open_time,close_time,open_time_utc,close_time_utc,symbol,interval,open,high,low,close,volume,trade_count",
            "1772326800000,1772330399999,2026-03-01T01:00:00.000Z,2026-03-01T01:59:59.999Z,SLV/USDC,1h,31.150,31.250,31.100,31.225,110,3",
            "1772323200000,1772326799999,2026-03-01T00:00:00.000Z,2026-03-01T00:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
          ].join("\n"),
        });
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    await expect(repository.loadDataset(makeDefinition(), "1h")).rejects.toThrow(
      "Non-ascending open_time at line 3",
    );
  });

  it("rejects candle rows whose UTC text does not match the numeric close_time", async () => {
    const repository = new DataRepository(async (path) => {
      if (path === "/silver_1h.csv") {
        return response({
          text: [
            "open_time,close_time,open_time_utc,close_time_utc,symbol,interval,open,high,low,close,volume,trade_count",
            "1772323200000,1772326799999,2026-03-01T00:00:00.000Z,2026-03-01T01:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
          ].join("\n"),
        });
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    await expect(repository.loadDataset(makeDefinition(), "1h")).rejects.toThrow(
      "close_time_utc does not match close_time at line 2",
    );
  });
});

function makeDefinition(
  overrides: Partial<DatasetDefinition> = {},
): DatasetDefinition {
  return {
    id: "silver",
    label: "Silver",
    description: "Test dataset",
    source: "Silver feed",
    market: "SLV/USDC",
    intervals: ["1h"],
    defaultInterval: "1h",
    notes: [],
    metadataPath: "/meta.json",
    csvPath: (interval) => `/silver_${interval}.csv`,
    ...overrides,
  };
}

function buildCsv(interval: Interval): string {
  if (interval === "1d") {
    return [
      "open_time,close_time,open_time_utc,close_time_utc,symbol,interval,open,high,low,close,volume,trade_count",
      "1772323200000,1772409599999,2026-03-01T00:00:00.000Z,2026-03-01T23:59:59.999Z,SLV/USDC,1d,31.100,31.400,31.000,31.250,1000,10",
      "1772409600000,1772495999999,2026-03-02T00:00:00.000Z,2026-03-02T23:59:59.999Z,SLV/USDC,1d,31.250,31.600,31.200,31.500,1200,12",
    ].join("\n");
  }

  return [
    "open_time,close_time,open_time_utc,close_time_utc,symbol,interval,open,high,low,close,volume,trade_count",
    "1772323200000,1772326799999,2026-03-01T00:00:00.000Z,2026-03-01T00:59:59.999Z,SLV/USDC,1h,31.100,31.200,31.000,31.150,100,2",
    "1772326800000,1772330399999,2026-03-01T01:00:00.000Z,2026-03-01T01:59:59.999Z,SLV/USDC,1h,31.150,31.250,31.100,31.225,110,3",
  ].join("\n");
}

function response({
  ok = true,
  json,
  text,
}: {
  ok?: boolean;
  json?: unknown;
  text?: string;
}) {
  return {
    ok,
    async text() {
      return text ?? "";
    },
    async json() {
      return json ?? {};
    },
  };
}

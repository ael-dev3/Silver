import type {
  CandleRow,
  CoverageEntry,
  DatasetDefinition,
  DatasetMetaSummary,
  DatasetOverview,
  Interval,
  LoadedDataset,
} from "./types";
import { parseCandleCsv } from "./candleValidation";

interface RawMetadataCoverage {
  interval: Interval;
  rows: number;
  first_open_time_utc: string;
  last_close_time_utc: string;
}

interface RawMetadata {
  source?: string;
  api_url?: string;
  downloaded_at_utc?: string;
  note?: string;
  pair?: {
    pair_id?: string;
    display_name?: string;
  };
  coverage?: RawMetadataCoverage[];
}

interface FetchResponseLike {
  ok: boolean;
  text(): Promise<string>;
  json(): Promise<unknown>;
}

type FetchLike = (path: string, init?: RequestInit) => Promise<FetchResponseLike>;

function buildCoverage(interval: Interval, candles: CandleRow[]): CoverageEntry {
  const first = candles[0];
  const last = candles[candles.length - 1];

  if (!first || !last) {
    throw new Error(`No candles available for ${interval}`);
  }

  return {
    interval,
    rows: candles.length,
    first_open_time_utc: first.open_time_utc,
    last_close_time_utc: last.close_time_utc,
  };
}

function mapMetadata(definition: DatasetDefinition, metadata: RawMetadata): DatasetMetaSummary {
  return {
    sourceLabel: metadata.source ?? definition.source,
    displayName: metadata.pair?.display_name ?? definition.market,
    downloadedAtUtc: metadata.downloaded_at_utc,
    pairId: metadata.pair?.pair_id,
    apiUrl: metadata.api_url,
    note: metadata.note,
  };
}

function isValidCoverageEntry(
  definition: DatasetDefinition,
  entry: RawMetadataCoverage,
): entry is CoverageEntry {
  return (
    definition.intervals.includes(entry.interval) &&
    Number.isFinite(entry.rows) &&
    entry.rows > 0 &&
    typeof entry.first_open_time_utc === "string" &&
    entry.first_open_time_utc.length > 0 &&
    typeof entry.last_close_time_utc === "string" &&
    entry.last_close_time_utc.length > 0
  );
}

function normalizeCoverage(
  definition: DatasetDefinition,
  coverage: RawMetadataCoverage[] | undefined,
): CoverageEntry[] {
  if (!coverage?.length) {
    return [];
  }

  const deduped = new Map<Interval, CoverageEntry>();
  for (const entry of coverage) {
    if (!isValidCoverageEntry(definition, entry)) {
      continue;
    }

    deduped.set(entry.interval, {
      interval: entry.interval,
      rows: entry.rows,
      first_open_time_utc: entry.first_open_time_utc,
      last_close_time_utc: entry.last_close_time_utc,
    });
  }

  return definition.intervals
    .map((interval) => deduped.get(interval))
    .filter((entry): entry is CoverageEntry => Boolean(entry));
}

export class DataRepository {
  constructor(private readonly fetcher: FetchLike = fetch) {}

  private readonly overviewCache = new Map<string, Promise<DatasetOverview>>();
  private readonly datasetCache = new Map<string, Promise<LoadedDataset>>();

  async loadOverview(definition: DatasetDefinition): Promise<DatasetOverview> {
    return this.loadCached(
      this.overviewCache,
      definition.id,
      () => this.buildOverview(definition),
    );
  }

  async loadDataset(definition: DatasetDefinition, interval: Interval): Promise<LoadedDataset> {
    if (!definition.intervals.includes(interval)) {
      throw new Error(`${definition.label} does not support ${interval}`);
    }

    const cacheKey = `${definition.id}:${interval}`;
    return this.loadCached(
      this.datasetCache,
      cacheKey,
      () => this.buildDataset(definition, interval),
    );
  }

  private async buildOverview(definition: DatasetDefinition): Promise<DatasetOverview> {
    let metadata: RawMetadata | null = null;
    if (definition.metadataPath) {
      try {
        metadata = await this.fetchJson<RawMetadata>(definition.metadataPath);
      } catch {
        metadata = null;
      }
    }

    const coverageByInterval = new Map<Interval, CoverageEntry>(
      normalizeCoverage(definition, metadata?.coverage).map((entry) => [entry.interval, entry] as const),
    );
    const missingIntervals = definition.intervals.filter(
      (interval) => !coverageByInterval.has(interval),
    );

    if (missingIntervals.length) {
      const derivedCoverage = await Promise.all(
        missingIntervals.map(async (interval) => {
          const dataset = await this.loadDataset(definition, interval);
          return dataset.coverage;
        }),
      );

      for (const entry of derivedCoverage) {
        coverageByInterval.set(entry.interval, entry);
      }
    }

    const coverage = definition.intervals
      .map((interval) => coverageByInterval.get(interval))
      .filter((entry): entry is CoverageEntry => Boolean(entry));

    if (!coverage.length) {
      throw new Error(`No coverage available for ${definition.label}`);
    }

    return {
      definition,
      coverage,
      meta: metadata
        ? mapMetadata(definition, metadata)
        : {
            sourceLabel: definition.source,
            displayName: definition.market,
          },
    };
  }

  private async buildDataset(
    definition: DatasetDefinition,
    interval: Interval,
  ): Promise<LoadedDataset> {
    const csvText = await this.fetchText(definition.csvPath(interval));
    const candles = parseCandleCsv(csvText, {
      expectedInterval: interval,
      datasetLabel: `${definition.label} ${interval}`,
    });

    return {
      definition,
      interval,
      candles,
      coverage: buildCoverage(interval, candles),
    };
  }

  private loadCached<T>(
    cache: Map<string, Promise<T>>,
    key: string,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const promise = loader().catch((error) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, promise);
    return promise;
  }

  private async fetchText(path: string): Promise<string> {
    const response = await this.fetcher(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return response.text();
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await this.fetcher(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return response.json() as Promise<T>;
  }
}

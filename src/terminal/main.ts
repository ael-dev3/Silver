import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";

import { formatDateOnly, formatDateTime, formatInteger, formatPrice } from "../workbench/format";
import {
  describeCoverageFreshness,
  describeExportAge,
  type FreshnessTone,
} from "../workbench/freshness";
import type { CandleRow, CoverageEntry, Interval } from "../workbench/types";
import {
  chooseInitialTimeframe,
  getCoverageEntry,
  parseTerminalDataset,
  parseTerminalMetadata,
  type TerminalDataset,
  type TerminalMetadata,
} from "./terminalData";

const TIMEFRAME_ORDER: Interval[] = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
const TIMEFRAME_SHORTCUTS: Record<string, Interval> = {
  Digit1: "1m",
  Digit2: "5m",
  Digit3: "15m",
  Digit4: "1h",
  Digit5: "4h",
  Digit6: "1d",
  Digit7: "1w",
};

interface Elements {
  headlinePrice: HTMLElement;
  headlineChange: HTMLElement;
  headlineCoverage: HTMLElement;
  currentCsvLink: HTMLAnchorElement;
  panelTitle: HTMLElement;
  sourcePill: HTMLElement;
  pairPill: HTMLElement;
  downloadedPill: HTMLElement;
  freshnessPill: HTMLElement;
  legendSymbol: HTMLElement;
  legendInterval: HTMLElement;
  legendTime: HTMLElement;
  legendValues: HTMLElement;
  timeframeToolbar: HTMLElement;
  loadingMask: HTMLElement;
  chart: HTMLElement;
  sidebarTitle: HTMLElement;
  coverageList: HTMLElement;
  stats: {
    rows: HTMLElement;
    close: HTMLElement;
    range: HTMLElement;
    volume: HTMLElement;
    trades: HTMLElement;
    window: HTMLElement;
    dataLag: HTMLElement;
  };
  tools: {
    ema: HTMLButtonElement;
    volume: HTMLButtonElement;
    fit: HTMLButtonElement;
  };
}

function mustFind<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Missing element: #${id}`);
  }

  return element as T;
}

function getElements(): Elements {
  return {
    headlinePrice: mustFind("headline-price"),
    headlineChange: mustFind("headline-change"),
    headlineCoverage: mustFind("headline-coverage"),
    currentCsvLink: mustFind("current-csv-link"),
    panelTitle: mustFind("panel-title"),
    sourcePill: mustFind("source-pill"),
    pairPill: mustFind("pair-pill"),
    downloadedPill: mustFind("downloaded-pill"),
    freshnessPill: mustFind("freshness-pill"),
    legendSymbol: mustFind("legend-symbol"),
    legendInterval: mustFind("legend-interval"),
    legendTime: mustFind("legend-time"),
    legendValues: mustFind("legend-values"),
    timeframeToolbar: mustFind("timeframe-toolbar"),
    loadingMask: mustFind("loading-mask"),
    chart: mustFind("chart"),
    sidebarTitle: mustFind("sidebar-title"),
    coverageList: mustFind("coverage-list"),
    stats: {
      rows: mustFind("stat-rows"),
      close: mustFind("stat-close"),
      range: mustFind("stat-range"),
      volume: mustFind("stat-volume"),
      trades: mustFind("stat-trades"),
      window: mustFind("stat-window"),
      dataLag: mustFind("stat-data-lag"),
    },
    tools: {
      ema: mustFind("tool-ema"),
      volume: mustFind("tool-volume"),
      fit: mustFind("tool-fit"),
    },
  };
}

function toTimestamp(value: number): UTCTimestamp {
  return Math.floor(value / 1000) as UTCTimestamp;
}

function formatNumber(value: number, digits = 2): string {
  return formatPrice(value, digits);
}

function formatSigned(value: number, digits: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value, digits)}`;
}

function buildVolumeColor(row: CandleRow): string {
  return row.close >= row.open ? "rgba(78, 201, 176, 0.55)" : "rgba(255, 107, 122, 0.55)";
}

function compareCoverage(left: CoverageEntry, right: CoverageEntry): number {
  return TIMEFRAME_ORDER.indexOf(left.interval) - TIMEFRAME_ORDER.indexOf(right.interval);
}

function applyFreshnessTone(element: HTMLElement, tone: FreshnessTone): void {
  element.classList.remove("freshness-fresh", "freshness-quiet", "freshness-stale");
  element.classList.add(`freshness-${tone}`);
}

class SilverTerminalApp {
  private readonly elements = getElements();
  private readonly datasetCache = new Map<Interval, Promise<TerminalDataset>>();
  private readonly chart: IChartApi;
  private readonly candleSeries: ISeriesApi<"Candlestick", Time>;
  private readonly volumeSeries: ISeriesApi<"Histogram", Time>;
  private readonly ema20Series: ISeriesApi<"Line", Time>;
  private readonly ema50Series: ISeriesApi<"Line", Time>;
  private metadata: TerminalMetadata | null = null;
  private selectedTimeframe: Interval | null = null;
  private showIndicators = true;
  private showVolume = true;
  private activationToken = 0;
  private currentRows: CandleRow[] = [];
  private currentRowsByTime = new Map<number, CandleRow>();

  constructor() {
    this.chart = createChart(this.elements.chart, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#081322" },
        textColor: "#c6d4ea",
        fontFamily: '"JetBrains Mono", monospace',
      },
      grid: {
        vertLines: { color: "rgba(150, 170, 197, 0.08)" },
        horzLines: { color: "rgba(150, 170, 197, 0.08)" },
      },
      crosshair: {
        mode: CrosshairMode.MagnetOHLC,
        vertLine: {
          color: "rgba(213, 222, 234, 0.28)",
          labelBackgroundColor: "#0f1f36",
        },
        horzLine: {
          color: "rgba(213, 222, 234, 0.28)",
          labelBackgroundColor: "#0f1f36",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(150, 170, 197, 0.18)",
      },
      timeScale: {
        borderColor: "rgba(150, 170, 197, 0.18)",
        rightOffset: 0,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      localization: {
        priceFormatter: (price: number) => formatPrice(price, 3),
      },
    });

    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: "#4ec9b0",
      downColor: "#ff6b7a",
      borderVisible: false,
      wickUpColor: "#4ec9b0",
      wickDownColor: "#ff6b7a",
      priceLineColor: "#c7d0de",
      lastValueVisible: true,
    });

    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      base: 0,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    this.ema20Series = this.chart.addSeries(LineSeries, {
      color: "#f7b955",
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    this.ema50Series = this.chart.addSeries(LineSeries, {
      color: "#7aa2ff",
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    this.candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.08, bottom: 0.24 },
    });
    this.volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    this.chart.subscribeCrosshairMove((param) => {
      this.updateLegendFromRow(this.lookupRow(param));
    });

    this.wireToolButtons();
  }

  async start(): Promise<void> {
    try {
      this.setLoading(true, "Loading metadata...");
      this.metadata = await this.loadMetadata();

      const availableIntervals = [...this.metadata.coverage]
        .sort(compareCoverage)
        .map((entry) => entry.interval);

      this.renderMetadata();
      this.buildTimeframeToolbar(availableIntervals);
      this.buildCoverageList(availableIntervals);
      this.wireKeyboard(availableIntervals);

      const requestedInterval = new URL(window.location.href).searchParams.get("tf");
      const initialInterval = chooseInitialTimeframe(this.metadata.coverage, requestedInterval);

      await this.activateTimeframe(initialInterval);

      void Promise.allSettled(
        availableIntervals
          .filter((interval) => interval !== initialInterval)
          .map((interval) => this.loadDataset(interval)),
      );
    } catch (error) {
      console.error(error);
      this.setLoading(true, "Unable to load the chart. Check metadata and CSV files.");
      this.elements.legendValues.textContent = "Failed to initialize chart data.";
    }
  }

  private async loadMetadata(): Promise<TerminalMetadata> {
    const response = await fetch("./data/hyperliquid/slv_usdc_metadata.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load metadata");
    }

    const payload = await response.json();
    return parseTerminalMetadata(payload);
  }

  private async loadDataset(interval: Interval): Promise<TerminalDataset> {
    const cached = this.datasetCache.get(interval);
    if (cached) {
      return cached;
    }

    const promise = (async () => {
      const response = await fetch(`./data/hyperliquid/slv_usdc_${interval}.csv`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load ${interval} candles`);
      }

      return parseTerminalDataset(await response.text(), interval);
    })().catch((error) => {
      this.datasetCache.delete(interval);
      throw error;
    });

    this.datasetCache.set(interval, promise);
    return promise;
  }

  private renderMetadata(): void {
    if (!this.metadata) {
      return;
    }

    this.elements.legendSymbol.textContent = this.metadata.pairDisplayName;
    this.elements.sourcePill.textContent = this.metadata.source;
    this.elements.pairPill.textContent = this.metadata.pairId;
    this.elements.downloadedPill.textContent = describeExportAge(this.metadata.downloadedAtUtc);
    this.elements.downloadedPill.title = `Refreshed ${formatDateTime(this.metadata.downloadedAtUtc)}`;
  }

  private buildTimeframeToolbar(intervals: readonly Interval[]): void {
    this.elements.timeframeToolbar.replaceChildren();

    for (const interval of intervals) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "timeframe-button";
      button.dataset.timeframe = interval;
      button.textContent = interval.toUpperCase();
      button.addEventListener("click", () => {
        void this.activateTimeframe(interval);
      });
      this.elements.timeframeToolbar.append(button);
    }
  }

  private buildCoverageList(intervals: readonly Interval[]): void {
    if (!this.metadata) {
      return;
    }

    this.elements.coverageList.replaceChildren();

    for (const interval of intervals) {
      const coverage = getCoverageEntry(this.metadata, interval);
      if (!coverage) {
        continue;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "coverage-card";
      button.dataset.timeframe = interval;
      button.innerHTML = `
        <div class="coverage-tag">${interval.toUpperCase()}</div>
        <div class="coverage-text">
          <strong>${formatDateOnly(coverage.first_open_time_utc)} -> ${formatDateOnly(coverage.last_close_time_utc)}</strong>
          <span>${formatInteger(coverage.rows)} candles</span>
        </div>
        <div class="coverage-meta">
          <strong>${interval === "1w" ? "Weekly" : "Rolling"}</strong>
          <span>${coverage.rows} rows</span>
        </div>
      `;
      button.addEventListener("click", () => {
        void this.activateTimeframe(interval);
      });
      this.elements.coverageList.append(button);
    }
  }

  private wireToolButtons(): void {
    this.elements.tools.ema.addEventListener("click", () => {
      this.showIndicators = !this.showIndicators;
      this.elements.tools.ema.classList.toggle("is-active", this.showIndicators);
      this.ema20Series.applyOptions({ visible: this.showIndicators });
      this.ema50Series.applyOptions({ visible: this.showIndicators });
    });

    this.elements.tools.volume.addEventListener("click", () => {
      this.showVolume = !this.showVolume;
      this.elements.tools.volume.classList.toggle("is-active", this.showVolume);
      this.volumeSeries.applyOptions({ visible: this.showVolume });
    });

    this.elements.tools.fit.addEventListener("click", () => {
      this.chart.timeScale().fitContent();
    });
  }

  private wireKeyboard(intervals: readonly Interval[]): void {
    window.addEventListener("keydown", (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const interval = TIMEFRAME_SHORTCUTS[event.code];
      if (interval && intervals.includes(interval)) {
        event.preventDefault();
        void this.activateTimeframe(interval);
      }
    });
  }

  private async activateTimeframe(interval: Interval): Promise<void> {
    if (!this.metadata) {
      return;
    }

    this.selectedTimeframe = interval;
    const token = ++this.activationToken;

    this.setLoading(true, `Loading ${interval} candles...`);
    this.updateCoverageSelection(interval);

    try {
      const dataset = await this.loadDataset(interval);
      if (token !== this.activationToken) {
        return;
      }

      this.currentRows = dataset.rows;
      this.currentRowsByTime = new Map(
        dataset.rows.map((row) => [Math.floor(row.open_time / 1000), row] as const),
      );

      const candleData: CandlestickData<Time>[] = dataset.rows.map((row) => ({
        time: toTimestamp(row.open_time),
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
      }));
      const volumeData: HistogramData<Time>[] = dataset.rows.map((row) => ({
        time: toTimestamp(row.open_time),
        value: row.volume,
        color: buildVolumeColor(row),
      }));
      const ema20Data: LineData<Time>[] = dataset.ema20.map((point) => ({
        time: point.time as UTCTimestamp,
        value: point.value,
      }));
      const ema50Data: LineData<Time>[] = dataset.ema50.map((point) => ({
        time: point.time as UTCTimestamp,
        value: point.value,
      }));

      this.candleSeries.setData(candleData);
      this.volumeSeries.setData(volumeData);
      this.ema20Series.setData(ema20Data);
      this.ema50Series.setData(ema50Data);

      this.volumeSeries.applyOptions({ visible: this.showVolume });
      this.ema20Series.applyOptions({ visible: this.showIndicators });
      this.ema50Series.applyOptions({ visible: this.showIndicators });

      const latestRow = dataset.rows[dataset.rows.length - 1] ?? null;
      this.updateLegendFromRow(latestRow);
      this.updateHeadline(dataset);
      this.updateSidebar(interval, dataset);

      this.elements.panelTitle.textContent = `SLV/USDC - ${interval}`;
      this.elements.legendInterval.textContent = interval;
      this.elements.currentCsvLink.href = `./data/hyperliquid/slv_usdc_${interval}.csv`;
      this.elements.currentCsvLink.textContent = `${interval.toUpperCase()} CSV`;

      this.chart.timeScale().fitContent();
      this.updateUrl(interval);
      this.setLoading(false);
    } catch (error) {
      console.error(error);
      if (token === this.activationToken) {
        this.setLoading(true, "Unable to load the chart. Check metadata and CSV files.");
        this.elements.legendValues.textContent = "Failed to initialize chart data.";
      }
    }
  }

  private lookupRow(param: MouseEventParams<Time>): CandleRow | null {
    if (!param.time) {
      return this.currentRows[this.currentRows.length - 1] ?? null;
    }

    const timeValue =
      typeof param.time === "number"
        ? param.time
        : Math.floor(new Date(String(param.time)).getTime() / 1000);

    return this.currentRowsByTime.get(timeValue) ?? this.currentRows[this.currentRows.length - 1] ?? null;
  }

  private updateLegendFromRow(row: CandleRow | null): void {
    if (!row) {
      this.elements.legendTime.textContent = "--";
      this.elements.legendValues.textContent = "No candle selected";
      return;
    }

    const change = row.close - row.open;
    const changePct = row.open === 0 ? 0 : (change / row.open) * 100;
    const parts = [
      `O ${formatNumber(row.open, 3)}`,
      `H ${formatNumber(row.high, 3)}`,
      `L ${formatNumber(row.low, 3)}`,
      `C ${formatNumber(row.close, 3)}`,
      `${formatSigned(change, 3)} (${formatSigned(changePct, 2)}%)`,
      `Vol ${formatNumber(row.volume, 2)}`,
    ];

    this.elements.legendTime.textContent = formatDateTime(row.close_time_utc);
    this.elements.legendValues.textContent = parts.join("   ");
  }

  private updateHeadline(dataset: TerminalDataset): void {
    const latest = dataset.rows[dataset.rows.length - 1];
    const previous = dataset.rows[dataset.rows.length - 2] ?? latest;
    const change = latest.close - previous.close;
    const changePct = previous.close === 0 ? 0 : (change / previous.close) * 100;

    this.elements.headlinePrice.textContent = formatNumber(latest.close, 3);
    this.elements.headlineChange.textContent =
      `${formatSigned(change, 3)} (${formatSigned(changePct, 2)}%)`;
    this.elements.headlineChange.classList.toggle("is-positive", change >= 0);
    this.elements.headlineChange.classList.toggle("is-negative", change < 0);
  }

  private updateSidebar(interval: Interval, dataset: TerminalDataset): void {
    if (!this.metadata) {
      return;
    }

    const coverage = getCoverageEntry(this.metadata, interval);
    const latest = dataset.rows[dataset.rows.length - 1];
    const highs = dataset.rows.map((row) => row.high);
    const lows = dataset.rows.map((row) => row.low);
    const totalVolume = dataset.rows.reduce((sum, row) => sum + row.volume, 0);
    const totalTrades = dataset.rows.reduce((sum, row) => sum + row.trade_count, 0);
    const averageTrades = totalTrades / dataset.rows.length;

    this.elements.sidebarTitle.textContent = `${interval} snapshot`;
    this.elements.stats.rows.textContent = formatInteger(dataset.rows.length);
    this.elements.stats.close.textContent = formatNumber(latest.close, 3);
    this.elements.stats.range.textContent =
      `${formatNumber(Math.min(...lows), 3)} - ${formatNumber(Math.max(...highs), 3)}`;
    this.elements.stats.volume.textContent = formatNumber(totalVolume, 2);
    this.elements.stats.trades.textContent = formatNumber(averageTrades, 2);
    this.elements.stats.window.textContent = coverage
      ? `${formatDateOnly(coverage.first_open_time_utc)} to ${formatDateOnly(coverage.last_close_time_utc)}`
      : "--";

    this.elements.headlineCoverage.textContent = coverage
      ? `${formatDateOnly(coverage.first_open_time_utc)} -> ${formatDateOnly(coverage.last_close_time_utc)}`
      : "Coverage unavailable";

    if (coverage) {
      const freshness = describeCoverageFreshness(coverage, this.metadata.downloadedAtUtc);
      this.elements.freshnessPill.textContent = freshness.label;
      this.elements.stats.dataLag.textContent = freshness.shortLabel;
      applyFreshnessTone(this.elements.freshnessPill, freshness.tone);
      applyFreshnessTone(this.elements.stats.dataLag, freshness.tone);
    } else {
      this.elements.freshnessPill.textContent = "Data freshness unavailable";
      this.elements.stats.dataLag.textContent = "--";
    }
  }

  private updateCoverageSelection(interval: Interval): void {
    document.querySelectorAll<HTMLElement>("[data-timeframe]").forEach((element) => {
      element.classList.toggle("is-active", element.dataset.timeframe === interval);
    });
  }

  private updateUrl(interval: Interval): void {
    const url = new URL(window.location.href);
    url.searchParams.set("tf", interval);
    window.history.replaceState({}, "", url);
  }

  private setLoading(visible: boolean, message = "Loading..."): void {
    this.elements.loadingMask.textContent = message;
    this.elements.loadingMask.classList.toggle("is-hidden", !visible);
  }
}

window.addEventListener("load", () => {
  const app = new SilverTerminalApp();
  void app.start();
});

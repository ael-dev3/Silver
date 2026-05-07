import { PriceScaleMode } from "lightweight-charts";
import { DATASETS, getDatasetById } from "./catalog";
import { ChartController } from "./chartController";
import { DataRepository } from "./dataRepository";
import {
  formatCompactNumber,
  formatDateOnly,
  formatDateTime,
  formatInteger,
  formatPercent,
  formatPrice,
} from "./format";
import {
  describeCoverageFreshness,
  describeExportAge,
  type FreshnessTone,
} from "./freshness";
import { INDICATORS } from "./indicators";
import { STRATEGIES } from "./strategies";
import type {
  BacktestResult,
  CandleRow,
  CoverageEntry,
  DatasetDefinition,
  DatasetOverview,
  IndicatorDefinition,
  Interval,
  LoadedDataset,
  StrategyDefinition,
} from "./types";

const INTERVAL_ORDER: Interval[] = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
const RANGE_PRESETS = [
  { id: "50", label: "50", bars: 50 },
  { id: "200", label: "200", bars: 200 },
  { id: "500", label: "500", bars: 500 },
  { id: "all", label: "All", bars: null },
] as const;

type RangePresetId = (typeof RANGE_PRESETS)[number]["id"];

interface PageConfig {
  appName: string;
  fixedDatasetId: string | null;
  fixedInterval: Interval | null;
}

interface Elements {
  datasetControl: HTMLDivElement;
  timeframeControl: HTMLDivElement;
  datasetSelect: HTMLSelectElement;
  timeframeControls: HTMLDivElement;
  indicatorControls: HTMLDivElement;
  strategySelect: HTMLSelectElement;
  volumeToggle: HTMLInputElement;
  logScaleToggle: HTMLInputElement;
  fitButton: HTMLButtonElement;
  rangeControls: HTMLDivElement;
  chartHost: HTMLDivElement;
  loadingState: HTMLDivElement;
  errorState: HTMLDivElement;
  pageTitle: HTMLHeadingElement;
  subtitle: HTMLParagraphElement;
  sourceBadge: HTMLSpanElement;
  pairBadge: HTMLSpanElement;
  refreshedBadge: HTMLSpanElement;
  freshnessBadge: HTMLSpanElement;
  activeCsvLink: HTMLAnchorElement;
  metadataLink: HTMLAnchorElement;
  metadataLinkWrap: HTMLDivElement;
  legendTime: HTMLSpanElement;
  legendValues: HTMLDivElement;
  statLast: HTMLDivElement;
  statChange: HTMLDivElement;
  statRows: HTMLDivElement;
  statCoverage: HTMLDivElement;
  statHighLow: HTMLDivElement;
  statVolume: HTMLDivElement;
  overviewBody: HTMLDivElement;
  coverageBody: HTMLDivElement;
  notesList: HTMLUListElement;
  strategyBlurb: HTMLParagraphElement;
  strategyMetrics: HTMLDivElement;
  tradesTableBody: HTMLTableSectionElement;
  candlesTableBody: HTMLTableSectionElement;
  statusLine: HTMLDivElement;
}

interface AppState {
  datasetId: string;
  interval: Interval;
  strategyId: string;
  activeIndicatorIds: Set<string>;
  showVolume: boolean;
  priceScaleMode: PriceScaleMode;
  rangePreset: RangePresetId;
}

function readPageConfig(): PageConfig {
  const appName = document.body.dataset.appName?.trim() || "Silver Workbench";
  const fixedDatasetId = document.body.dataset.fixedDataset?.trim() || null;
  const requestedInterval = document.body.dataset.fixedInterval?.trim() || null;
  const fixedInterval = INTERVAL_ORDER.includes(requestedInterval as Interval)
    ? (requestedInterval as Interval)
    : null;

  return {
    appName,
    fixedDatasetId,
    fixedInterval,
  };
}

function mustFind<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

function getElements(): Elements {
  return {
    datasetControl: mustFind("#dataset-control"),
    timeframeControl: mustFind("#timeframe-control"),
    datasetSelect: mustFind("#dataset-select"),
    timeframeControls: mustFind("#timeframe-controls"),
    indicatorControls: mustFind("#indicator-controls"),
    strategySelect: mustFind("#strategy-select"),
    volumeToggle: mustFind("#volume-toggle"),
    logScaleToggle: mustFind("#log-scale-toggle"),
    fitButton: mustFind("#fit-button"),
    rangeControls: mustFind("#range-controls"),
    chartHost: mustFind("#chart-host"),
    loadingState: mustFind("#loading-state"),
    errorState: mustFind("#error-state"),
    pageTitle: mustFind("#page-title"),
    subtitle: mustFind("#page-subtitle"),
    sourceBadge: mustFind("#source-badge"),
    pairBadge: mustFind("#pair-badge"),
    refreshedBadge: mustFind("#refreshed-badge"),
    freshnessBadge: mustFind("#freshness-badge"),
    activeCsvLink: mustFind("#active-csv-link"),
    metadataLink: mustFind("#metadata-link"),
    metadataLinkWrap: mustFind("#metadata-link-wrap"),
    legendTime: mustFind("#legend-time"),
    legendValues: mustFind("#legend-values"),
    statLast: mustFind("#stat-last"),
    statChange: mustFind("#stat-change"),
    statRows: mustFind("#stat-rows"),
    statCoverage: mustFind("#stat-coverage"),
    statHighLow: mustFind("#stat-high-low"),
    statVolume: mustFind("#stat-volume"),
    overviewBody: mustFind("#overview-body"),
    coverageBody: mustFind("#coverage-body"),
    notesList: mustFind("#notes-list"),
    strategyBlurb: mustFind("#strategy-blurb"),
    strategyMetrics: mustFind("#strategy-metrics"),
    tradesTableBody: mustFind("#trades-table-body"),
    candlesTableBody: mustFind("#candles-table-body"),
    statusLine: mustFind("#status-line"),
  };
}

function defaultIndicatorIds(): Set<string> {
  return new Set(
    INDICATORS.filter((indicator) => indicator.defaultEnabled).map((indicator) => indicator.id),
  );
}

function parseInitialState(config: PageConfig): AppState {
  const params = new URL(window.location.href).searchParams;
  const requestedDatasetId = config.fixedDatasetId ?? params.get("dataset");
  const datasetId = DATASETS.some((dataset) => dataset.id === requestedDatasetId)
    ? (requestedDatasetId as string)
    : DATASETS[0].id;

  const definition = getDatasetById(datasetId);
  const requestedInterval = (config.fixedInterval ?? params.get("tf")) as Interval | null;
  const interval = requestedInterval && definition.intervals.includes(requestedInterval)
    ? requestedInterval
    : definition.defaultInterval;

  const requestedStrategyId = params.get("strategy");
  const strategyId = STRATEGIES.some((strategy) => strategy.id === requestedStrategyId)
    ? (requestedStrategyId as string)
    : "none";

  const indicatorIds = params.get("ind")
    ? new Set(
        params
          .get("ind")
          ?.split(",")
          .map((value) => value.trim())
          .filter((value) => INDICATORS.some((indicator) => indicator.id === value)),
      )
    : defaultIndicatorIds();

  const requestedRange = params.get("range");

  return {
    datasetId,
    interval,
    strategyId,
    activeIndicatorIds: indicatorIds.size ? indicatorIds : defaultIndicatorIds(),
    showVolume: params.get("volume") !== "0",
    priceScaleMode: params.get("scale") === "log"
      ? PriceScaleMode.Logarithmic
      : PriceScaleMode.Normal,
    rangePreset: RANGE_PRESETS.some((preset) => preset.id === requestedRange)
      ? (requestedRange as RangePresetId)
      : "all",
  };
}

function compareCoverage(left: CoverageEntry, right: CoverageEntry): number {
  return INTERVAL_ORDER.indexOf(left.interval) - INTERVAL_ORDER.indexOf(right.interval);
}

function getStrategyById(strategyId: string): StrategyDefinition {
  return STRATEGIES.find((strategy) => strategy.id === strategyId) ?? STRATEGIES[0];
}

function getIndicatorMap(): Map<string, IndicatorDefinition> {
  return new Map(INDICATORS.map((indicator) => [indicator.id, indicator] as const));
}

function applyFreshnessTone(element: HTMLElement, tone: FreshnessTone): void {
  element.classList.remove("freshness-fresh", "freshness-quiet", "freshness-stale");
  element.classList.add(`freshness-${tone}`);
}

class WorkbenchApp {
  private readonly pageConfig = readPageConfig();
  private readonly elements = getElements();
  private readonly repository = new DataRepository();
  private readonly chart = new ChartController(this.elements.chartHost);
  private readonly indicatorMap = getIndicatorMap();
  private readonly state = parseInitialState(this.pageConfig);
  private currentOverview: DatasetOverview | null = null;
  private currentDataset: LoadedDataset | null = null;
  private activationToken = 0;

  constructor() {
    this.initializeStaticControls();
    this.initializeKeyboardShortcuts();
    this.chart.onCrosshair((row) => {
      this.renderLegend(row);
    });
  }

  async start(): Promise<void> {
    await this.loadCurrentSelection();
  }

  private initializeStaticControls(): void {
    for (const dataset of DATASETS) {
      const option = document.createElement("option");
      option.value = dataset.id;
      option.textContent = dataset.label;
      this.elements.datasetSelect.append(option);
    }

    for (const strategy of STRATEGIES) {
      const option = document.createElement("option");
      option.value = strategy.id;
      option.textContent = strategy.label;
      this.elements.strategySelect.append(option);
    }

    this.elements.datasetSelect.value = this.state.datasetId;
    this.elements.strategySelect.value = this.state.strategyId;
    this.elements.volumeToggle.checked = this.state.showVolume;
    this.elements.logScaleToggle.checked =
      this.state.priceScaleMode === PriceScaleMode.Logarithmic;
    this.elements.datasetControl.hidden = this.pageConfig.fixedDatasetId !== null;
    this.elements.timeframeControl.hidden = this.pageConfig.fixedInterval !== null;

    this.renderIndicatorControls();
    this.renderRangeControls();

    this.elements.datasetSelect.addEventListener("change", async () => {
      const nextDefinition = getDatasetById(this.elements.datasetSelect.value);
      this.state.datasetId = nextDefinition.id;
      if (!nextDefinition.intervals.includes(this.state.interval)) {
        this.state.interval = nextDefinition.defaultInterval;
        this.state.rangePreset = "all";
      }
      await this.loadCurrentSelection();
    });

    this.elements.strategySelect.addEventListener("change", () => {
      this.state.strategyId = this.elements.strategySelect.value;
      this.renderDerivedViews();
      this.syncUrl();
    });

    this.elements.volumeToggle.addEventListener("change", () => {
      this.state.showVolume = this.elements.volumeToggle.checked;
      this.chart.setVolumeVisible(this.state.showVolume);
      this.syncUrl();
    });

    this.elements.logScaleToggle.addEventListener("change", () => {
      this.state.priceScaleMode = this.elements.logScaleToggle.checked
        ? PriceScaleMode.Logarithmic
        : PriceScaleMode.Normal;
      this.chart.setPriceScaleMode(this.state.priceScaleMode);
      this.syncUrl();
    });

    this.elements.fitButton.addEventListener("click", () => {
      this.state.rangePreset = "all";
      this.chart.fitContent();
      this.renderRangeControls();
      this.syncUrl();
    });
  }

  private initializeKeyboardShortcuts(): void {
    window.addEventListener("keydown", async (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const datasetDefinition = this.currentOverview?.definition ?? getDatasetById(this.state.datasetId);
      const intervalByKey: Record<string, Interval> = {
        Digit1: "1m",
        Digit2: "5m",
        Digit3: "15m",
        Digit4: "1h",
        Digit5: "4h",
        Digit6: "1d",
        Digit7: "1w",
      };

      const nextInterval = intervalByKey[event.code];
      if (
        this.pageConfig.fixedInterval === null &&
        nextInterval &&
        datasetDefinition.intervals.includes(nextInterval)
      ) {
        event.preventDefault();
        this.state.interval = nextInterval;
        this.state.rangePreset = "all";
        await this.loadCurrentSelection();
        return;
      }

      if (event.code === "KeyF") {
        event.preventDefault();
        this.state.rangePreset = "all";
        this.chart.fitContent();
        this.renderRangeControls();
        this.syncUrl();
        return;
      }

      if (event.code === "KeyV") {
        event.preventDefault();
        this.state.showVolume = !this.state.showVolume;
        this.elements.volumeToggle.checked = this.state.showVolume;
        this.chart.setVolumeVisible(this.state.showVolume);
        this.syncUrl();
        return;
      }

      if (event.code === "KeyL") {
        event.preventDefault();
        this.state.priceScaleMode = this.state.priceScaleMode === PriceScaleMode.Logarithmic
          ? PriceScaleMode.Normal
          : PriceScaleMode.Logarithmic;
        this.elements.logScaleToggle.checked =
          this.state.priceScaleMode === PriceScaleMode.Logarithmic;
        this.chart.setPriceScaleMode(this.state.priceScaleMode);
        this.syncUrl();
      }
    });
  }

  private renderIndicatorControls(): void {
    this.elements.indicatorControls.replaceChildren();

    for (const indicator of INDICATORS) {
      const label = document.createElement("label");
      label.className = "toggle-chip";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = this.state.activeIndicatorIds.has(indicator.id);
      input.addEventListener("change", () => {
        if (input.checked) {
          this.state.activeIndicatorIds.add(indicator.id);
        } else {
          this.state.activeIndicatorIds.delete(indicator.id);
        }
        this.renderIndicatorControls();
        this.renderDerivedViews();
        this.syncUrl();
      });

      const text = document.createElement("span");
      text.textContent = indicator.label;

      label.append(input, text);
      if (input.checked) {
        label.classList.add("is-active");
      }
      this.elements.indicatorControls.append(label);
    }
  }

  private renderTimeframeControls(definition: DatasetDefinition): void {
    this.elements.timeframeControls.replaceChildren();

    for (const interval of INTERVAL_ORDER) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "segmented-button";
      button.textContent = interval.toUpperCase();
      button.dataset.interval = interval;

      const supported = definition.intervals.includes(interval);
      button.disabled = !supported;
      button.classList.toggle("is-active", this.state.interval === interval);
      button.addEventListener("click", async () => {
        if (!supported || this.state.interval === interval) {
          return;
        }
        this.state.interval = interval;
        this.state.rangePreset = "all";
        await this.loadCurrentSelection();
      });
      this.elements.timeframeControls.append(button);
    }
  }

  private renderRangeControls(): void {
    this.elements.rangeControls.replaceChildren();

    for (const preset of RANGE_PRESETS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "segmented-button";
      button.textContent = preset.label;
      button.classList.toggle("is-active", this.state.rangePreset === preset.id);
      button.addEventListener("click", () => {
        this.state.rangePreset = preset.id;
        this.applyRangePreset();
        this.renderRangeControls();
        this.syncUrl();
      });
      this.elements.rangeControls.append(button);
    }
  }

  private async loadCurrentSelection(): Promise<void> {
    const definition = getDatasetById(this.state.datasetId);
    this.renderTimeframeControls(definition);
    this.setError("");
    this.setLoading(true, `Loading ${definition.label} ${this.state.interval}...`);

    const token = ++this.activationToken;

    try {
      const [overview, dataset] = await Promise.all([
        this.repository.loadOverview(definition),
        this.repository.loadDataset(definition, this.state.interval),
      ]);

      if (token !== this.activationToken) {
        return;
      }

      this.currentOverview = overview;
      this.currentDataset = dataset;

      this.chart.setCandles(dataset.candles);
      this.chart.setVolumeVisible(this.state.showVolume);
      this.chart.setPriceScaleMode(this.state.priceScaleMode);

      this.renderTopSummary();
      this.renderOverview();
      this.renderCoverage();
      this.renderNotes();
      this.renderDerivedViews();
      this.renderCandleTable();
      this.applyRangePreset();
      this.syncUrl();
      this.setLoading(false);
    } catch (error) {
      console.error(error);
      if (token === this.activationToken) {
        this.setLoading(false);
        this.setError("Unable to load the selected dataset. Check the CSV and metadata files.");
      }
    }
  }

  private renderTopSummary(): void {
    if (!this.currentOverview || !this.currentDataset) {
      return;
    }

    const { definition, meta } = this.currentOverview;
    const latest = this.currentDataset.candles[this.currentDataset.candles.length - 1];
    const previous =
      this.currentDataset.candles[this.currentDataset.candles.length - 2] ?? latest;
    const change = latest.close - previous.close;
    const changePct = previous.close === 0 ? 0 : (change / previous.close) * 100;

    document.title = `${meta.displayName} ${this.state.interval} | ${this.pageConfig.appName}`;

    this.elements.pageTitle.textContent = `${meta.displayName} ${this.state.interval}`;
    this.elements.subtitle.textContent = definition.description;
    this.elements.sourceBadge.textContent = meta.sourceLabel;
    this.elements.pairBadge.textContent = meta.pairId ?? definition.market;
    this.elements.refreshedBadge.textContent = meta.downloadedAtUtc
      ? describeExportAge(meta.downloadedAtUtc)
      : "Reference dataset";
    this.elements.refreshedBadge.title = meta.downloadedAtUtc
      ? `Refreshed ${formatDateTime(meta.downloadedAtUtc)}`
      : "";

    if (meta.downloadedAtUtc) {
      const freshness = describeCoverageFreshness(
        this.currentDataset.coverage,
        meta.downloadedAtUtc,
      );
      this.elements.freshnessBadge.hidden = false;
      this.elements.freshnessBadge.textContent = freshness.label;
      applyFreshnessTone(this.elements.freshnessBadge, freshness.tone);
    } else {
      this.elements.freshnessBadge.hidden = true;
      this.elements.freshnessBadge.textContent = "";
    }

    this.elements.activeCsvLink.href = definition.csvPath(this.state.interval);
    this.elements.activeCsvLink.textContent = `${this.state.interval.toUpperCase()} CSV`;

    if (definition.metadataPath) {
      this.elements.metadataLinkWrap.hidden = false;
      this.elements.metadataLink.href = definition.metadataPath;
    } else {
      this.elements.metadataLinkWrap.hidden = true;
    }

    this.elements.statLast.textContent = formatPrice(latest.close, 3);
    this.elements.statChange.textContent =
      `${change >= 0 ? "+" : ""}${formatPrice(change, 3)} (${formatPercent(changePct, 2)})`;
    this.elements.statChange.classList.toggle("is-positive", change >= 0);
    this.elements.statChange.classList.toggle("is-negative", change < 0);
    this.elements.statRows.textContent = formatInteger(this.currentDataset.candles.length);
    this.elements.statCoverage.textContent =
      `${formatDateOnly(this.currentDataset.coverage.first_open_time_utc)} to ${formatDateOnly(this.currentDataset.coverage.last_close_time_utc)}`;

    const highs = this.currentDataset.candles.map((row) => row.high);
    const lows = this.currentDataset.candles.map((row) => row.low);
    this.elements.statHighLow.textContent =
      `${formatPrice(Math.min(...lows), 3)} / ${formatPrice(Math.max(...highs), 3)}`;

    const totalVolume = this.currentDataset.candles.reduce((sum, row) => sum + row.volume, 0);
    const averageVolume = totalVolume / this.currentDataset.candles.length;
    this.elements.statVolume.textContent =
      `${formatCompactNumber(totalVolume, 2)} total | ${formatCompactNumber(averageVolume, 2)} avg`;

    const linkParts = [
      `${definition.label}`,
      this.state.interval,
      `${this.currentDataset.candles.length} rows`,
      "F fit",
      "V volume",
      "L log",
    ];
    if (meta.downloadedAtUtc) {
      linkParts.push(
        describeCoverageFreshness(this.currentDataset.coverage, meta.downloadedAtUtc).shortLabel,
      );
    }
    if (this.pageConfig.fixedInterval === null) {
      linkParts.splice(3, 0, "Keys 1-7 timeframe");
    }
    if (meta.apiUrl) {
      linkParts.push(meta.apiUrl);
    }
    this.elements.statusLine.textContent = linkParts.join(" | ");
  }

  private renderOverview(): void {
    if (!this.currentOverview || !this.currentDataset) {
      return;
    }

    const latest = this.currentDataset.candles[this.currentDataset.candles.length - 1];
    const previous =
      this.currentDataset.candles[this.currentDataset.candles.length - 2] ?? latest;
    const change = latest.close - previous.close;
    const changePct = previous.close === 0 ? 0 : (change / previous.close) * 100;
    const totalTrades = this.currentDataset.candles.reduce(
      (sum, row) => sum + row.trade_count,
      0,
    );

    this.elements.overviewBody.innerHTML = `
      <div class="data-row"><span>Last close</span><strong>${formatPrice(latest.close, 3)}</strong></div>
      <div class="data-row"><span>Bar change</span><strong>${change >= 0 ? "+" : ""}${formatPrice(change, 3)} (${formatPercent(changePct, 2)})</strong></div>
      <div class="data-row"><span>Volume</span><strong>${formatCompactNumber(latest.volume, 2)}</strong></div>
      <div class="data-row"><span>Trade count</span><strong>${formatInteger(latest.trade_count)}</strong></div>
      <div class="data-row"><span>Total trades</span><strong>${formatInteger(totalTrades)}</strong></div>
      <div class="data-row"><span>Coverage</span><strong>${formatDateOnly(this.currentDataset.coverage.first_open_time_utc)} to ${formatDateOnly(this.currentDataset.coverage.last_close_time_utc)}</strong></div>
    `;
  }

  private renderCoverage(): void {
    if (!this.currentOverview) {
      return;
    }

    this.elements.coverageBody.replaceChildren();

    for (const entry of [...this.currentOverview.coverage].sort(compareCoverage)) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "coverage-row";
      row.classList.toggle("is-active", entry.interval === this.state.interval);
      row.disabled = !this.currentOverview.definition.intervals.includes(entry.interval);
      row.addEventListener("click", async () => {
        if (this.state.interval === entry.interval) {
          return;
        }
        this.state.interval = entry.interval;
        this.state.rangePreset = "all";
        await this.loadCurrentSelection();
      });

      row.innerHTML = `
        <span class="coverage-interval">${entry.interval.toUpperCase()}</span>
        <span class="coverage-window">${formatDateOnly(entry.first_open_time_utc)} to ${formatDateOnly(entry.last_close_time_utc)}</span>
        <span class="coverage-rows">${formatInteger(entry.rows)}</span>
      `;
      this.elements.coverageBody.append(row);
    }
  }

  private renderNotes(): void {
    if (!this.currentOverview) {
      return;
    }

    this.elements.notesList.replaceChildren();
    const noteValues = [...this.currentOverview.definition.notes];
    if (this.currentOverview.meta.note) {
      noteValues.push(this.currentOverview.meta.note);
    }

    for (const note of noteValues) {
      const item = document.createElement("li");
      item.textContent = note;
      this.elements.notesList.append(item);
    }
  }

  private renderDerivedViews(): void {
    if (!this.currentDataset) {
      return;
    }

    const activeIndicators = [...this.state.activeIndicatorIds]
      .map((indicatorId) => this.indicatorMap.get(indicatorId))
      .filter((indicator): indicator is IndicatorDefinition => Boolean(indicator));
    this.chart.setIndicators(activeIndicators, this.currentDataset.candles);

    const strategy = getStrategyById(this.state.strategyId);
    const result = strategy.run(this.currentDataset.candles);
    this.chart.setStrategy(result);
    this.renderStrategy(strategy, result);
  }

  private renderStrategy(
    strategy: StrategyDefinition,
    result: BacktestResult | null,
  ): void {
    this.elements.strategyBlurb.textContent = strategy.description;

    if (!result) {
      this.elements.strategyMetrics.innerHTML = `
        <div class="data-row"><span>Mode</span><strong>Chart only</strong></div>
        <div class="data-row"><span>Trades</span><strong>0</strong></div>
      `;
      this.elements.tradesTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-row">No trades for the current selection.</td>
        </tr>
      `;
      return;
    }

    this.elements.strategyMetrics.innerHTML = `
      <div class="data-row"><span>Trades</span><strong>${formatInteger(result.tradeCount)}</strong></div>
      <div class="data-row"><span>Win rate</span><strong>${formatPercent(result.winRate, 2)}</strong></div>
      <div class="data-row"><span>Total return</span><strong>${formatPercent(result.totalReturnPct, 2)}</strong></div>
      <div class="data-row"><span>Max drawdown</span><strong>${formatPercent(result.maxDrawdownPct, 2)}</strong></div>
    `;

    const recentTrades = [...result.trades].slice(-8).reverse();
    this.elements.tradesTableBody.innerHTML = recentTrades
      .map(
        (trade) => `
          <tr>
            <td>${formatDateOnly(trade.entryTime)}</td>
            <td>${formatPrice(trade.entryPrice, 3)}</td>
            <td>${formatDateOnly(trade.exitTime)}</td>
            <td>${formatPrice(trade.exitPrice, 3)}</td>
            <td class="${trade.returnPct >= 0 ? "is-positive" : "is-negative"}">${formatPercent(trade.returnPct, 2)}</td>
          </tr>
        `,
      )
      .join("");
  }

  private renderCandleTable(): void {
    if (!this.currentDataset) {
      return;
    }

    const recent = [...this.currentDataset.candles].slice(-12).reverse();
    this.elements.candlesTableBody.innerHTML = recent
      .map(
        (row) => `
          <tr>
            <td>${formatDateTime(row.open_time_utc)}</td>
            <td>${formatPrice(row.open, 3)}</td>
            <td>${formatPrice(row.high, 3)}</td>
            <td>${formatPrice(row.low, 3)}</td>
            <td>${formatPrice(row.close, 3)}</td>
            <td>${formatCompactNumber(row.volume, 2)}</td>
            <td>${formatInteger(row.trade_count)}</td>
          </tr>
        `,
      )
      .join("");
  }

  private renderLegend(row: CandleRow | null): void {
    if (!row) {
      this.elements.legendTime.textContent = "--";
      this.elements.legendValues.textContent = "No candle selected";
      return;
    }

    this.elements.legendTime.textContent = formatDateTime(row.open_time_utc);
    this.elements.legendValues.textContent =
      `O ${formatPrice(row.open, 3)} H ${formatPrice(row.high, 3)} L ${formatPrice(row.low, 3)} C ${formatPrice(row.close, 3)} | Vol ${formatCompactNumber(row.volume, 2)} | Trades ${formatInteger(row.trade_count)}`;
  }

  private applyRangePreset(): void {
    const preset = RANGE_PRESETS.find((entry) => entry.id === this.state.rangePreset);
    if (!preset) {
      this.chart.fitContent();
      return;
    }

    if (preset.bars === null) {
      this.chart.fitContent();
      return;
    }

    this.chart.showLastBars(preset.bars);
  }

  private setLoading(visible: boolean, message = "Loading..."): void {
    this.elements.loadingState.hidden = !visible;
    this.elements.loadingState.textContent = message;
  }

  private setError(message: string): void {
    if (message) {
      this.elements.errorState.hidden = false;
      this.elements.errorState.textContent = message;
      return;
    }
    this.elements.errorState.hidden = true;
    this.elements.errorState.textContent = "";
  }

  private syncUrl(): void {
    const url = new URL(window.location.href);
    if (this.pageConfig.fixedDatasetId === null) {
      url.searchParams.set("dataset", this.state.datasetId);
    } else {
      url.searchParams.delete("dataset");
    }

    if (this.pageConfig.fixedInterval === null) {
      url.searchParams.set("tf", this.state.interval);
    } else {
      url.searchParams.delete("tf");
    }

    url.searchParams.set("strategy", this.state.strategyId);
    url.searchParams.set("range", this.state.rangePreset);

    const indicatorIds = [...this.state.activeIndicatorIds];
    if (indicatorIds.length) {
      url.searchParams.set("ind", indicatorIds.join(","));
    } else {
      url.searchParams.delete("ind");
    }

    if (!this.state.showVolume) {
      url.searchParams.set("volume", "0");
    } else {
      url.searchParams.delete("volume");
    }

    if (this.state.priceScaleMode === PriceScaleMode.Logarithmic) {
      url.searchParams.set("scale", "log");
    } else {
      url.searchParams.delete("scale");
    }

    window.history.replaceState({}, "", url);
  }
}

window.addEventListener("load", () => {
  const app = new WorkbenchApp();
  void app.start();
});

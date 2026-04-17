(function () {
  const TIMEFRAME_ORDER = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
  const TIMEFRAME_SHORTCUTS = {
    Digit1: "1m",
    Digit2: "5m",
    Digit3: "15m",
    Digit4: "1h",
    Digit5: "4h",
    Digit6: "1d",
    Digit7: "1w",
  };

  const state = {
    selectedTimeframe: null,
    metadata: null,
    datasetCache: new Map(),
    showIndicators: true,
    showVolume: true,
  };

  const ui = {
    headlinePrice: document.getElementById("headline-price"),
    headlineChange: document.getElementById("headline-change"),
    headlineCoverage: document.getElementById("headline-coverage"),
    currentCsvLink: document.getElementById("current-csv-link"),
    panelTitle: document.getElementById("panel-title"),
    sourcePill: document.getElementById("source-pill"),
    pairPill: document.getElementById("pair-pill"),
    downloadedPill: document.getElementById("downloaded-pill"),
    legendSymbol: document.getElementById("legend-symbol"),
    legendInterval: document.getElementById("legend-interval"),
    legendTime: document.getElementById("legend-time"),
    legendValues: document.getElementById("legend-values"),
    timeframeToolbar: document.getElementById("timeframe-toolbar"),
    loadingMask: document.getElementById("loading-mask"),
    chart: document.getElementById("chart"),
    sidebarTitle: document.getElementById("sidebar-title"),
    coverageList: document.getElementById("coverage-list"),
    stats: {
      rows: document.getElementById("stat-rows"),
      close: document.getElementById("stat-close"),
      range: document.getElementById("stat-range"),
      volume: document.getElementById("stat-volume"),
      trades: document.getElementById("stat-trades"),
      window: document.getElementById("stat-window"),
    },
    tools: {
      ema: document.getElementById("tool-ema"),
      volume: document.getElementById("tool-volume"),
      fit: document.getElementById("tool-fit"),
    },
  };

  let chart;
  let candleSeries;
  let volumeSeries;
  let ema20Series;
  let ema50Series;
  let resizeObserver;

  function createChart() {
    chart = LightweightCharts.createChart(ui.chart, {
      autoSize: true,
      layout: {
        background: { color: "#081322" },
        textColor: "#c6d4ea",
        fontFamily: '"JetBrains Mono", monospace',
      },
      grid: {
        vertLines: { color: "rgba(150, 170, 197, 0.08)" },
        horzLines: { color: "rgba(150, 170, 197, 0.08)" },
      },
      crosshair: {
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
        priceFormatter: (price) => Number(price).toFixed(3),
      },
    });

    candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: "#4ec9b0",
      downColor: "#ff6b7a",
      borderVisible: false,
      wickUpColor: "#4ec9b0",
      wickDownColor: "#ff6b7a",
      priceLineColor: "#c7d0de",
      lastValueVisible: true,
    });

    volumeSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      base: 0,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    ema20Series = chart.addSeries(LightweightCharts.LineSeries, {
      color: "#f7b955",
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    ema50Series = chart.addSeries(LightweightCharts.LineSeries, {
      color: "#7aa2ff",
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.08, bottom: 0.24 },
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    chart.subscribeCrosshairMove((param) => {
      const activeData = state.datasetCache.get(state.selectedTimeframe);
      if (!activeData || !activeData.candles.length) {
        return;
      }

      if (!param || !param.point || !param.time) {
        updateLegendFromBar(activeData.candles.at(-1), activeData.volume.at(-1));
        return;
      }

      const candleBar = param.seriesData.get(candleSeries);
      const volumeBar = param.seriesData.get(volumeSeries);
      if (candleBar) {
        updateLegendFromBar(candleBar, volumeBar);
      }
    });

    resizeObserver = new ResizeObserver(() => {
      chart.timeScale().fitContent();
    });
    resizeObserver.observe(ui.chart);
  }

  function setLoading(loading, message) {
    ui.loadingMask.textContent = message || "Loading candles...";
    ui.loadingMask.classList.toggle("is-hidden", !loading);
  }

  function formatNumber(value, digits = 2) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(value);
  }

  function formatInteger(value) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  }

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(date) + " UTC";
  }

  function formatDateOnly(isoString) {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    }).format(date);
  }

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length <= 1) {
      return [];
    }

    const rows = [];
    for (let index = 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (!line) {
        continue;
      }

      const parts = line.split(",");
      rows.push({
        open_time: Number(parts[0]),
        close_time: Number(parts[1]),
        open_time_utc: parts[2],
        close_time_utc: parts[3],
        symbol: parts[4],
        interval: parts[5],
        open: Number(parts[6]),
        high: Number(parts[7]),
        low: Number(parts[8]),
        close: Number(parts[9]),
        volume: Number(parts[10]),
        trade_count: Number(parts[11]),
      });
    }
    return rows;
  }

  function computeEma(rows, period) {
    if (rows.length < period) {
      return [];
    }

    // Seed from the initial SMA window so the static terminal matches the workbench overlays.
    const multiplier = 2 / (period + 1);
    let rollingSum = 0;
    let emaValue = 0;
    const series = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      rollingSum += row.close;

      if (index === period - 1) {
        emaValue = rollingSum / period;
        series.push({
          time: row.open_time / 1000,
          value: Number(emaValue.toFixed(6)),
        });
        continue;
      }

      if (index >= period) {
        emaValue = row.close * multiplier + emaValue * (1 - multiplier);
        series.push({
          time: row.open_time / 1000,
          value: Number(emaValue.toFixed(6)),
        });
      }
    }

    return series;
  }

  function transformRows(rows) {
    const candles = rows.map((row) => ({
      time: row.open_time / 1000,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      open_time_utc: row.open_time_utc,
      close_time_utc: row.close_time_utc,
      volume: row.volume,
      trade_count: row.trade_count,
    }));

    const volume = rows.map((row) => ({
      time: row.open_time / 1000,
      value: row.volume,
      color: row.close >= row.open ? "rgba(78, 201, 176, 0.55)" : "rgba(255, 107, 122, 0.55)",
    }));

    return {
      candles,
      volume,
      ema20: computeEma(rows, 20),
      ema50: computeEma(rows, 50),
      raw: rows,
    };
  }

  async function loadDataset(interval) {
    if (state.datasetCache.has(interval)) {
      return state.datasetCache.get(interval);
    }

    const response = await fetch(`./data/hyperliquid/slv_usdc_${interval}.csv`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${interval} candles`);
    }

    const rows = parseCsv(await response.text());
    const dataset = transformRows(rows);
    state.datasetCache.set(interval, dataset);
    return dataset;
  }

  function getCoverageEntry(interval) {
    return state.metadata.coverage.find((entry) => entry.interval === interval);
  }

  function updateLegendFromBar(candleBar, volumeBar) {
    if (!candleBar) {
      return;
    }

    ui.legendTime.textContent = candleBar.close_time_utc
      ? formatDateTime(candleBar.close_time_utc)
      : `t=${candleBar.time}`;

    const change = candleBar.close - candleBar.open;
    const changePct = candleBar.open ? (change / candleBar.open) * 100 : 0;
    const parts = [
      `O ${formatNumber(candleBar.open, 3)}`,
      `H ${formatNumber(candleBar.high, 3)}`,
      `L ${formatNumber(candleBar.low, 3)}`,
      `C ${formatNumber(candleBar.close, 3)}`,
      `${change >= 0 ? "+" : ""}${formatNumber(change, 3)} (${changePct >= 0 ? "+" : ""}${formatNumber(changePct, 2)}%)`,
    ];

    if (volumeBar && Number.isFinite(volumeBar.value)) {
      parts.push(`Vol ${formatNumber(volumeBar.value, 2)}`);
    }

    ui.legendValues.textContent = parts.join("   ");
  }

  function updateHeadline(dataset) {
    const latest = dataset.raw.at(-1);
    const previous = dataset.raw.at(-2) || latest;
    const change = latest.close - previous.close;
    const changePct = previous.close ? (change / previous.close) * 100 : 0;

    ui.headlinePrice.textContent = formatNumber(latest.close, 3);
    ui.headlineChange.textContent = `${change >= 0 ? "+" : ""}${formatNumber(change, 3)} (${changePct >= 0 ? "+" : ""}${formatNumber(changePct, 2)}%)`;
    ui.headlineChange.classList.toggle("is-positive", change >= 0);
    ui.headlineChange.classList.toggle("is-negative", change < 0);
  }

  function updateSidebar(interval, dataset) {
    const coverage = getCoverageEntry(interval);
    const rows = dataset.raw;
    const latest = rows.at(-1);
    const high = Math.max(...rows.map((row) => row.high));
    const low = Math.min(...rows.map((row) => row.low));
    const totalVolume = rows.reduce((sum, row) => sum + row.volume, 0);
    const totalTrades = rows.reduce((sum, row) => sum + row.trade_count, 0);

    ui.sidebarTitle.textContent = `${interval} snapshot`;
    ui.stats.rows.textContent = formatInteger(rows.length);
    ui.stats.close.textContent = formatNumber(latest.close, 3);
    ui.stats.range.textContent = `${formatNumber(low, 3)} - ${formatNumber(high, 3)}`;
    ui.stats.volume.textContent = formatNumber(totalVolume, 2);
    ui.stats.trades.textContent = formatNumber(totalTrades / rows.length, 2);
    ui.stats.window.textContent = coverage
      ? `${formatDateOnly(coverage.first_open_time_utc)} to ${formatDateOnly(coverage.last_close_time_utc)}`
      : "--";

    ui.headlineCoverage.textContent = coverage
      ? `${formatDateOnly(coverage.first_open_time_utc)} -> ${formatDateOnly(coverage.last_close_time_utc)}`
      : "Coverage unavailable";
  }

  function updateCoverageSelection(interval) {
    document.querySelectorAll("[data-timeframe]").forEach((element) => {
      element.classList.toggle("is-active", element.dataset.timeframe === interval);
    });
  }

  function updateUrl(interval) {
    const url = new URL(window.location.href);
    url.searchParams.set("tf", interval);
    window.history.replaceState({}, "", url);
  }

  async function activateTimeframe(interval) {
    state.selectedTimeframe = interval;
    setLoading(true, `Loading ${interval} candles...`);
    updateCoverageSelection(interval);

    const dataset = await loadDataset(interval);
    candleSeries.setData(dataset.candles);
    volumeSeries.setData(dataset.volume);
    ema20Series.setData(dataset.ema20);
    ema50Series.setData(dataset.ema50);

    volumeSeries.applyOptions({ visible: state.showVolume });
    ema20Series.applyOptions({ visible: state.showIndicators });
    ema50Series.applyOptions({ visible: state.showIndicators });

    const latestBar = dataset.candles.at(-1);
    const latestVolume = dataset.volume.at(-1);
    updateLegendFromBar(latestBar, latestVolume);
    updateHeadline(dataset);
    updateSidebar(interval, dataset);

    ui.panelTitle.textContent = `SLV/USDC - ${interval}`;
    ui.legendInterval.textContent = interval;
    ui.currentCsvLink.href = `./data/hyperliquid/slv_usdc_${interval}.csv`;
    ui.currentCsvLink.textContent = `${interval.toUpperCase()} CSV`;
    chart.timeScale().fitContent();
    updateUrl(interval);
    setLoading(false);
  }

  function buildTimeframeToolbar(intervals) {
    ui.timeframeToolbar.innerHTML = "";
    intervals.forEach((interval) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "timeframe-button";
      button.dataset.timeframe = interval;
      button.textContent = interval.toUpperCase();
      button.addEventListener("click", () => {
        void activateTimeframe(interval);
      });
      ui.timeframeToolbar.appendChild(button);
    });
  }

  function buildCoverageList(intervals) {
    ui.coverageList.innerHTML = "";
    intervals.forEach((interval) => {
      const coverage = getCoverageEntry(interval);
      if (!coverage) {
        return;
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
        void activateTimeframe(interval);
      });
      ui.coverageList.appendChild(button);
    });
  }

  function wireToolButtons() {
    ui.tools.ema.addEventListener("click", () => {
      state.showIndicators = !state.showIndicators;
      ui.tools.ema.classList.toggle("is-active", state.showIndicators);
      ema20Series.applyOptions({ visible: state.showIndicators });
      ema50Series.applyOptions({ visible: state.showIndicators });
    });

    ui.tools.volume.addEventListener("click", () => {
      state.showVolume = !state.showVolume;
      ui.tools.volume.classList.toggle("is-active", state.showVolume);
      volumeSeries.applyOptions({ visible: state.showVolume });
    });

    ui.tools.fit.addEventListener("click", () => {
      chart.timeScale().fitContent();
    });
  }

  function wireKeyboard(intervals) {
    window.addEventListener("keydown", (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const interval = TIMEFRAME_SHORTCUTS[event.code];
      if (interval && intervals.includes(interval)) {
        event.preventDefault();
        void activateTimeframe(interval);
      }
    });
  }

  function chooseInitialTimeframe(intervals) {
    const url = new URL(window.location.href);
    const requested = url.searchParams.get("tf");
    if (requested && intervals.includes(requested)) {
      return requested;
    }
    return intervals.includes("1h") ? "1h" : intervals[0];
  }

  async function initialize() {
    try {
      setLoading(true, "Loading metadata...");

      const response = await fetch("./data/hyperliquid/slv_usdc_metadata.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load metadata");
      }

      state.metadata = await response.json();
      const intervals = TIMEFRAME_ORDER.filter((interval) =>
        state.metadata.coverage.some((entry) => entry.interval === interval),
      );

      ui.legendSymbol.textContent = state.metadata.pair.display_name;
      ui.sourcePill.textContent = state.metadata.source;
      ui.pairPill.textContent = state.metadata.pair.pair_id;
      ui.downloadedPill.textContent = `Refreshed ${formatDateTime(state.metadata.downloaded_at_utc)}`;

      buildTimeframeToolbar(intervals);
      buildCoverageList(intervals);
      createChart();
      wireToolButtons();
      wireKeyboard(intervals);

      const initialInterval = chooseInitialTimeframe(intervals);
      await activateTimeframe(initialInterval);

      Promise.all(intervals.filter((interval) => interval !== initialInterval).map((interval) => loadDataset(interval))).catch(() => {});
    } catch (error) {
      console.error(error);
      setLoading(true, "Unable to load the chart. Check metadata and CSV files.");
      ui.legendValues.textContent = "Failed to initialize chart data.";
    }
  }

  window.addEventListener("load", () => {
    void initialize();
  });
})();

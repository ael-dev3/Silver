# Hyperliquid Silver Terminal

[![CI](https://github.com/ael-dev3/Silver/actions/workflows/ci.yml/badge.svg)](https://github.com/ael-dev3/Silver/actions/workflows/ci.yml)

Live links:

- Silver Terminal: https://ael-dev3.github.io/Silver-terminal/ - Hyperliquid-only `SLV/USDC` data across the checked-in rolling timeframes.
- Silver Weekly Reference: https://ael-dev3.github.io/Silver-terminal/workbench/ - long-history `1w` silver data only, using the normalized Dukascopy `XAGUSD` weekly file.

Public Pages repo: https://github.com/ael-dev3/Silver-terminal

This project centers on Hyperliquid `SLV/USDC` spot data and ships two open-source chart interfaces: a Hyperliquid-only terminal and a locked weekly reference site for the long-history Dukascopy series. It also includes a long-history weekly reference file built from Dukascopy `XAGUSD` daily data and normalized into the same candle schema.

## What is included

- raw Hyperliquid candle exports under `data/hyperliquid/`
- a long-history weekly reference file under `data/reference/`
- a static terminal UI in `index.html`, `app.css`, and generated `app.js`
- a typed terminal source under `src/terminal/` that reuses the shared candle validation and EMA logic
- a modular TypeScript workbench in `workbench/` and `src/workbench/`
- a reproducible download script in `scripts/download_hyperliquid_slv.py`
- a reproducible long-history builder in `scripts/build_long_silver_weekly.py`
- a vendored copy of TradingView Lightweight Charts 5.1.0 under `vendor/lightweight-charts/`

## Live interface

The hosted UI provides:

- candlestick charting for every checked-in timeframe
- volume overlay
- EMA overlays
- export age and latest-candle freshness badges
- TradingView-style dark terminal layout
- keyboard timeframe shortcuts
- direct links to the current CSV and metadata file

The weekly reference site adds:

- a locked `1w` long-history view for the normalized Dukascopy `XAGUSD` series
- modular indicator and strategy registries under `src/workbench/`
- range presets, log scale toggle, and volume pane toggle
- recent candle and trade tables for direct data inspection
- shareable URL state for strategy and view controls

Available timeframes in the UI:

- `1m`
- `5m`
- `15m`
- `1h`
- `4h`
- `1d`
- `1w`

## Current Hyperliquid datasets

The Hyperliquid market data lives under `data/hyperliquid/`.

| File | Timeframe | Rows | Coverage |
| --- | --- | ---: | --- |
| `data/hyperliquid/slv_usdc_1m.csv` | `1m` | 5,000 | 2026-05-04 03:39 UTC to 2026-05-07 14:58 UTC |
| `data/hyperliquid/slv_usdc_5m.csv` | `5m` | 5,000 | 2026-04-20 06:20 UTC to 2026-05-07 14:59 UTC |
| `data/hyperliquid/slv_usdc_15m.csv` | `15m` | 5,000 | 2026-03-16 13:00 UTC to 2026-05-07 14:59 UTC |
| `data/hyperliquid/slv_usdc_1h.csv` | `1h` | 2,864 | 2026-01-08 07:00 UTC to 2026-05-07 14:59 UTC |
| `data/hyperliquid/slv_usdc_4h.csv` | `4h` | 717 | 2026-01-08 04:00 UTC to 2026-05-07 15:59 UTC |
| `data/hyperliquid/slv_usdc_1d.csv` | `1d` | 119 | 2026-01-08 00:00 UTC to 2026-05-06 23:59 UTC |
| `data/hyperliquid/slv_usdc_1w.csv` | `1w` | 17 | 2026-01-08 00:00 UTC to 2026-05-06 23:59 UTC |

The repo also includes `data/hyperliquid/slv_usdc_metadata.json`, which records:

- the Hyperliquid API endpoint
- the download timestamp
- the discovered pair metadata
- exact per-interval coverage

## Long-history weekly reference

The repo also includes:

| File | Source | Market | Timeframe | Rows | Coverage |
| --- | --- | --- | --- | ---: | --- |
| `data/reference/xagusd_dukascopy_1w.csv` | Dukascopy | `XAGUSD` spot | `1w` | 1,406 | 1999-06-03 00:00 UTC to 2026-05-06 23:59 UTC |

This file is intended for long-range weekly research and backtesting where Hyperliquid does not yet have enough history.

Important caveats:

- it is `XAGUSD` spot from Dukascopy, not Hyperliquid `SLV/USDC`
- the schema matches the Hyperliquid CSV layout, but the market and volume construction are different
- `trade_count` is set to `0` because the Dukascopy daily export used here does not expose per-bar trade counts
- weekly bars are aggregated from daily candles, using Monday-based calendar weeks and partial weeks at the edges when needed
- the weekly builder normalizes rare upstream daily OHLC envelope anomalies from Dukascopy so checked-in weekly bars remain internally consistent

## Candle schema

Each candle CSV uses:

```text
open_time,close_time,open_time_utc,close_time_utc,symbol,interval,open,high,low,close,volume,trade_count
```

Notes:

- `open_time` and `close_time` are Unix epoch milliseconds.
- `open_time_utc` and `close_time_utc` are ISO 8601 UTC timestamps.
- `symbol` is source-specific. Hyperliquid uses the pair id from the API, while the long-history reference file uses `XAGUSD`.
- `trade_count` is present in the schema for every candle, but the Dukascopy-derived weekly file sets it to `0`.

## Source and caveats

Source:

- Hyperliquid official API: `https://api.hyperliquid.xyz/info`
- Dukascopy historical `XAGUSD` spot data via `dukascopy-node`

Caveats:

- This is Hyperliquid `SLV/USDC`, not OTC silver spot or CME silver futures.
- Hyperliquid `candleSnapshot` returns rolling recent history, not a guaranteed full historical backfill for each interval.
- The current weekly candle can still be in progress when you refresh the export.

## Open-source stack

- TradingView Lightweight Charts 5.1.0
- Apache License 2.0 for the vendored chart library
- custom HTML and CSS app shell
- TypeScript terminal and workbench bundles built with esbuild
- static GitHub Pages deployment

## Refreshing the data

Install dependencies:

```bash
pip install -r requirements.txt
npm install
```

Refresh the Hyperliquid exports:

```bash
python scripts/download_hyperliquid_slv.py
```

Build the long-history weekly reference file:

```bash
python scripts/build_long_silver_weekly.py
```

Build the terminal and workbench bundles:

```bash
npm run build
```

Run the strict TypeScript check:

```bash
npm run typecheck
```

Run the full validation suite:

```bash
npm test
```

This runs TypeScript checks, Vitest, Python dataset-integrity tests, and both browser builds.

## Repo layout

```text
data/
  hyperliquid/
    slv_usdc_1m.csv
    slv_usdc_5m.csv
    slv_usdc_15m.csv
    slv_usdc_1h.csv
    slv_usdc_4h.csv
    slv_usdc_1d.csv
    slv_usdc_1w.csv
    slv_usdc_metadata.json
  reference/
    xagusd_dukascopy_1w.csv
scripts/
  build_long_silver_weekly.py
  download_hyperliquid_slv.py
src/
  terminal/
    main.ts
    terminalData.ts
  workbench/
    catalog.ts
    chartController.ts
    dataRepository.ts
    format.ts
    indicators.ts
    main.ts
    strategies.ts
    types.ts
vendor/
  lightweight-charts/
    LICENSE
    lightweight-charts.standalone.production.js
index.html
app.css
app.js
workbench/
  index.html
  workbench.css
  assets/
    workbench.js
favicon.svg
package.json
tsconfig.json
requirements.txt
```

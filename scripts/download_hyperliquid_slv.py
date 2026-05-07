from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path

import requests


API_URL = "https://api.hyperliquid.xyz/info"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "data" / "hyperliquid"
INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"]
MAX_CANDLES_PER_REQUEST = 5000


def post_info(payload: dict) -> object:
    response = requests.post(API_URL, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()


def iso_utc(timestamp_ms: int) -> str:
    return (
        datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )


def discover_slv_pair() -> dict:
    meta = post_info({"type": "spotMeta"})
    tokens = {token["index"]: token for token in meta["tokens"]}
    slv_tokens = [token for token in meta["tokens"] if token["name"] == "SLV"]
    if not slv_tokens:
        raise RuntimeError("Could not find a Hyperliquid spot token named SLV.")

    slv_token = slv_tokens[0]
    usdc_token = tokens[0]
    candidates = [
        pair
        for pair in meta["universe"]
        if slv_token["index"] in pair["tokens"] and 0 in pair["tokens"]
    ]
    if not candidates:
        raise RuntimeError("Could not find an SLV spot pair quoted in USDC.")

    pair = candidates[0]
    return {
        "pair_id": pair["name"],
        "pair_index": pair["index"],
        "pair_tokens": pair["tokens"],
        "base_token": slv_token,
        "quote_token": usdc_token,
        "display_name": f"{slv_token['name']}/{usdc_token['name']}",
    }


def current_time_ms() -> int:
    return int(datetime.now(tz=timezone.utc).timestamp() * 1000)


def candle_close_time_ms(candle: dict) -> int:
    try:
        close_time = int(candle["T"])
    except (KeyError, TypeError, ValueError) as exc:
        raise RuntimeError(f"Unexpected candle close timestamp: {candle!r}") from exc

    if close_time < 0:
        raise RuntimeError(f"Unexpected candle close timestamp: {candle!r}")
    return close_time


def filter_closed_candles(candles: list[dict], snapshot_ms: int) -> list[dict]:
    return [candle for candle in candles if candle_close_time_ms(candle) <= snapshot_ms]


def fetch_candles(pair_id: str, interval: str, end_time_ms: int) -> list[dict]:
    payload = {
        "type": "candleSnapshot",
        "req": {
            "coin": pair_id,
            "interval": interval,
            "startTime": 0,
            "endTime": end_time_ms,
        },
    }
    candles = post_info(payload)
    if not isinstance(candles, list):
        raise RuntimeError(f"Unexpected candle response for {pair_id} {interval}: {candles!r}")
    return candles


def write_csv(path: Path, candles: list[dict]) -> None:
    fieldnames = [
        "open_time",
        "close_time",
        "open_time_utc",
        "close_time_utc",
        "symbol",
        "interval",
        "open",
        "high",
        "low",
        "close",
        "volume",
        "trade_count",
    ]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for candle in candles:
            writer.writerow(
                {
                    "open_time": candle["t"],
                    "close_time": candle["T"],
                    "open_time_utc": iso_utc(candle["t"]),
                    "close_time_utc": iso_utc(candle["T"]),
                    "symbol": candle["s"],
                    "interval": candle["i"],
                    "open": candle["o"],
                    "high": candle["h"],
                    "low": candle["l"],
                    "close": candle["c"],
                    "volume": candle["v"],
                    "trade_count": candle["n"],
                }
            )


def build_coverage(interval: str, candles: list[dict]) -> dict:
    first = candles[0]
    last = candles[-1]
    return {
        "interval": interval,
        "rows": len(candles),
        "first_open_time": first["t"],
        "first_open_time_utc": iso_utc(first["t"]),
        "last_close_time": last["T"],
        "last_close_time_utc": iso_utc(last["T"]),
    }


def require_complete_coverage(coverage: list[dict]) -> None:
    exported_intervals = {entry.get("interval") for entry in coverage}
    missing_intervals = [
        interval for interval in INTERVALS if interval not in exported_intervals
    ]

    if missing_intervals:
        missing_text = ", ".join(missing_intervals)
        raise RuntimeError(
            f"Missing closed candle data for required interval(s): {missing_text}"
        )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    pair = discover_slv_pair()
    snapshot_ms = current_time_ms()

    coverage = []
    for interval in INTERVALS:
        raw_candles = fetch_candles(pair["pair_id"], interval, snapshot_ms)
        candles = filter_closed_candles(raw_candles, snapshot_ms)
        dropped_count = len(raw_candles) - len(candles)
        if not candles:
            continue
        output_path = OUTPUT_DIR / f"slv_usdc_{interval}.csv"
        write_csv(output_path, candles)
        coverage.append(build_coverage(interval, candles))
        print(f"Saved {len(candles):,} candles to {output_path}")
        if dropped_count:
            print(f"Dropped {dropped_count:,} open {interval} candle(s).")

    require_complete_coverage(coverage)

    metadata = {
        "source": "Hyperliquid official API",
        "api_url": API_URL,
        "downloaded_at_utc": iso_utc(snapshot_ms),
        "pair": pair,
        "note": (
            "Hyperliquid candleSnapshot returns only the most recent candles for an interval. "
            f"This export captures the latest available history per interval, up to roughly {MAX_CANDLES_PER_REQUEST} candles."
        ),
        "coverage": coverage,
    }
    metadata_path = OUTPUT_DIR / "slv_usdc_metadata.json"
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Saved metadata to {metadata_path}")


if __name__ == "__main__":
    main()

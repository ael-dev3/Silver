from __future__ import annotations

import csv
import shutil
import subprocess
import tempfile
from datetime import date, datetime, timedelta, timezone
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT_DIR / "data" / "reference"
OUTPUT_PATH = OUTPUT_DIR / "xagusd_dukascopy_1w.csv"
SOURCE_FROM_DATE = "1999-06-03"
SOURCE_TO_DATE = date.today().isoformat()
SYMBOL = "XAGUSD"
INTERVAL = "1w"
DAY_MS = 86_400_000


def iso_utc(timestamp_ms: int) -> str:
    return (
        datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )


def day_end_timestamp(timestamp_ms: int) -> int:
    return timestamp_ms + DAY_MS - 1


def week_bucket_start(timestamp_ms: int) -> date:
    current = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc).date()
    return current - timedelta(days=current.weekday())


def normalize_price_envelope(open_price: float, high_price: float, low_price: float, close_price: float) -> tuple[float, float]:
    return (
        max(open_price, high_price, low_price, close_price),
        min(open_price, high_price, low_price, close_price),
    )


def validate_ascending_timestamps(rows: list[dict], *, key: str, label: str) -> None:
    previous: int | None = None
    for index, row in enumerate(rows, start=1):
        current = int(row[key])
        if previous is not None and current <= previous:
            raise RuntimeError(f"{label} rows are not strictly ascending at row {index}.")
        previous = current


def validate_ohlc_rows(rows: list[dict], *, label: str, row_label_key: str) -> None:
    for index, row in enumerate(rows, start=1):
        open_price = float(row["open"])
        high_price = float(row["high"])
        low_price = float(row["low"])
        close_price = float(row["close"])

        if high_price < max(open_price, close_price) or low_price > min(open_price, close_price) or high_price < low_price:
            row_label = row.get(row_label_key, f"row {index}")
            raise RuntimeError(f"{label} has invalid OHLC range at row {index} ({row_label}).")


def download_dukascopy_daily_csv(target_path: Path) -> None:
    npx_executable = shutil.which("npx.cmd") or shutil.which("npx")
    if not npx_executable:
        raise RuntimeError("Could not find npx. Install Node.js or add it to PATH.")

    command = [
        npx_executable,
        "dukascopy-node",
        "-i",
        "xagusd",
        "-from",
        SOURCE_FROM_DATE,
        "-to",
        SOURCE_TO_DATE,
        "-t",
        "d1",
        "-f",
        "csv",
        "-dir",
        str(target_path.parent),
        "-fn",
        target_path.stem,
        "-v",
    ]
    subprocess.run(command, check=True)


def read_daily_rows(path: Path, *, verbose: bool = False) -> list[dict]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        rows = []
        normalized_rows = 0
        for row in reader:
            open_price = float(row["open"])
            high_price = float(row["high"])
            low_price = float(row["low"])
            close_price = float(row["close"])
            normalized_high, normalized_low = normalize_price_envelope(
                open_price,
                high_price,
                low_price,
                close_price,
            )
            if normalized_high != high_price or normalized_low != low_price:
                normalized_rows += 1
            rows.append(
                {
                    "timestamp": int(row["timestamp"]),
                    "open": open_price,
                    "high": normalized_high,
                    "low": normalized_low,
                    "close": close_price,
                    "volume": float(row["volume"]),
                }
            )
    if not rows:
        raise RuntimeError("No daily Dukascopy rows were downloaded.")
    rows.sort(key=lambda row: row["timestamp"])
    validate_ascending_timestamps(rows, key="timestamp", label="Dukascopy daily")
    validate_ohlc_rows(rows, label="Dukascopy daily", row_label_key="timestamp")
    if verbose and normalized_rows:
        print(f"Normalized {normalized_rows} Dukascopy daily rows with upstream OHLC envelope anomalies.")
    return rows


def aggregate_weekly(rows: list[dict]) -> list[dict]:
    validate_ascending_timestamps(rows, key="timestamp", label="Dukascopy daily")

    grouped: list[list[dict]] = []
    current_group: list[dict] = []
    current_bucket: date | None = None

    for row in rows:
        bucket = week_bucket_start(row["timestamp"])
        if current_bucket is None or bucket != current_bucket:
            if current_group:
                grouped.append(current_group)
            current_group = [row]
            current_bucket = bucket
        else:
            current_group.append(row)

    if current_group:
        grouped.append(current_group)

    weekly_rows = []
    for group in grouped:
        first = group[0]
        last = group[-1]
        weekly_rows.append(
            {
                "open_time": first["timestamp"],
                "close_time": day_end_timestamp(last["timestamp"]),
                "open_time_utc": iso_utc(first["timestamp"]),
                "close_time_utc": iso_utc(day_end_timestamp(last["timestamp"])),
                "symbol": SYMBOL,
                "interval": INTERVAL,
                "open": f"{first['open']:.6f}".rstrip("0").rstrip("."),
                "high": f"{max(row['high'] for row in group):.6f}".rstrip("0").rstrip("."),
                "low": f"{min(row['low'] for row in group):.6f}".rstrip("0").rstrip("."),
                "close": f"{last['close']:.6f}".rstrip("0").rstrip("."),
                "volume": f"{sum(row['volume'] for row in group):.6f}".rstrip("0").rstrip("."),
                # Dukascopy daily CSVs do not expose per-bar trade counts in this export.
                "trade_count": "0",
            }
        )

    validate_ascending_timestamps(weekly_rows, key="open_time", label="Aggregated weekly")
    validate_ohlc_rows(weekly_rows, label="Aggregated weekly", row_label_key="open_time_utc")
    return weekly_rows


def write_weekly_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
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
        writer.writerows(rows)


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="silver-dukascopy-") as temp_dir:
        temp_path = Path(temp_dir) / "xagusd_dukascopy_d1.csv"
        download_dukascopy_daily_csv(temp_path)
        daily_rows = read_daily_rows(temp_path, verbose=True)

    weekly_rows = aggregate_weekly(daily_rows)
    write_weekly_csv(OUTPUT_PATH, weekly_rows)

    print(f"Saved {len(weekly_rows):,} weekly rows to {OUTPUT_PATH}")
    print(f"Coverage: {weekly_rows[0]['open_time_utc']} -> {weekly_rows[-1]['close_time_utc']}")


if __name__ == "__main__":
    main()

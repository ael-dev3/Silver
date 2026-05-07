import csv
import json
import unittest
from datetime import datetime, timedelta
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
HYPERLIQUID_METADATA_PATH = DATA_DIR / "hyperliquid" / "slv_usdc_metadata.json"
EXPECTED_FIELDS = [
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
INTERVAL_DURATION_MS = {
    "1m": 60_000,
    "5m": 5 * 60_000,
    "15m": 15 * 60_000,
    "1h": 60 * 60_000,
    "4h": 4 * 60 * 60_000,
    "1d": 24 * 60 * 60_000,
    "1w": 7 * 24 * 60 * 60_000,
}


def read_candle_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
    return list(reader.fieldnames or []), rows


def parse_utc_text_to_epoch_ms(raw_value: str) -> int:
    normalized = raw_value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None or parsed.utcoffset() != timedelta(0):
        raise AssertionError(f"Timestamp is not explicit UTC: {raw_value}")
    return int(parsed.timestamp() * 1000)


class DatasetIntegrityTests(unittest.TestCase):
    def test_checked_in_candle_files_are_valid_and_monotonic(self) -> None:
        csv_paths = sorted(DATA_DIR.rglob("*.csv"))
        self.assertTrue(csv_paths, "Expected checked-in candle CSV files.")

        for path in csv_paths:
            with self.subTest(path=str(path.relative_to(ROOT_DIR))):
                fields, rows = read_candle_csv(path)
                self.assertEqual(fields, EXPECTED_FIELDS)
                self.assertTrue(rows, f"{path.name} should not be empty.")

                expected_interval = path.stem.rsplit("_", maxsplit=1)[-1]
                previous_open_time = None
                previous_close_time = None

                for index, row in enumerate(rows, start=2):
                    open_time = int(row["open_time"])
                    close_time = int(row["close_time"])
                    candle_span_ms = close_time - open_time + 1
                    open_price = float(row["open"])
                    high_price = float(row["high"])
                    low_price = float(row["low"])
                    close_price = float(row["close"])
                    volume = float(row["volume"])
                    trade_count = int(row["trade_count"])
                    open_time_utc_ms = parse_utc_text_to_epoch_ms(row["open_time_utc"])
                    close_time_utc_ms = parse_utc_text_to_epoch_ms(row["close_time_utc"])

                    if previous_open_time is not None:
                        self.assertGreater(open_time, previous_open_time, f"{path.name} row {index} is not strictly ascending.")
                    if previous_close_time is not None:
                        self.assertGreater(open_time, previous_close_time, f"{path.name} row {index} overlaps the previous candle.")
                    self.assertGreater(close_time, open_time, f"{path.name} row {index} has an invalid close_time.")
                    self.assertLessEqual(candle_span_ms, INTERVAL_DURATION_MS[expected_interval], f"{path.name} row {index} exceeds the declared {expected_interval} span.")
                    self.assertEqual(open_time_utc_ms, open_time, f"{path.name} row {index} open_time_utc drifted from open_time.")
                    self.assertEqual(close_time_utc_ms, close_time, f"{path.name} row {index} close_time_utc drifted from close_time.")
                    self.assertLessEqual(low_price, min(open_price, close_price), f"{path.name} row {index} low does not envelope the candle body.")
                    self.assertGreaterEqual(high_price, max(open_price, close_price), f"{path.name} row {index} high does not envelope the candle body.")
                    self.assertGreaterEqual(high_price, low_price, f"{path.name} row {index} has high below low.")
                    self.assertGreaterEqual(volume, 0, f"{path.name} row {index} has negative volume.")
                    self.assertGreaterEqual(trade_count, 0, f"{path.name} row {index} has negative trade_count.")
                    self.assertEqual(row["interval"], expected_interval, f"{path.name} row {index} has an unexpected interval.")

                    previous_open_time = open_time
                    previous_close_time = close_time

    def test_hyperliquid_metadata_coverage_matches_checked_in_csvs(self) -> None:
        metadata = json.loads(HYPERLIQUID_METADATA_PATH.read_text(encoding="utf-8"))
        coverage_by_interval = {entry["interval"]: entry for entry in metadata["coverage"]}

        for path in sorted((DATA_DIR / "hyperliquid").glob("slv_usdc_*.csv")):
            with self.subTest(path=path.name):
                interval = path.stem.rsplit("_", maxsplit=1)[-1]
                _, rows = read_candle_csv(path)
                coverage = coverage_by_interval[interval]
                first_open_time = int(rows[0]["open_time"])
                last_close_time = int(rows[-1]["close_time"])

                self.assertEqual(coverage["rows"], len(rows), f"{path.name} row count drifted from metadata.")
                self.assertEqual(coverage["first_open_time"], first_open_time, f"{path.name} first candle epoch drifted from metadata.")
                self.assertEqual(coverage["last_close_time"], last_close_time, f"{path.name} last candle epoch drifted from metadata.")
                self.assertEqual(parse_utc_text_to_epoch_ms(coverage["first_open_time_utc"]), coverage["first_open_time"], f"{path.name} metadata first_open_time_utc drifted from first_open_time.")
                self.assertEqual(parse_utc_text_to_epoch_ms(coverage["last_close_time_utc"]), coverage["last_close_time"], f"{path.name} metadata last_close_time_utc drifted from last_close_time.")

    def test_hyperliquid_metadata_excludes_open_candles(self) -> None:
        metadata = json.loads(HYPERLIQUID_METADATA_PATH.read_text(encoding="utf-8"))
        downloaded_at_ms = parse_utc_text_to_epoch_ms(metadata["downloaded_at_utc"])

        for entry in metadata["coverage"]:
            with self.subTest(interval=entry["interval"]):
                self.assertLessEqual(
                    entry["last_close_time"],
                    downloaded_at_ms,
                    f"{entry['interval']} metadata advertises an open candle.",
                )
                self.assertLessEqual(
                    parse_utc_text_to_epoch_ms(entry["last_close_time_utc"]),
                    downloaded_at_ms,
                    f"{entry['interval']} metadata close timestamp text advertises an open candle.",
                )


if __name__ == "__main__":
    unittest.main()

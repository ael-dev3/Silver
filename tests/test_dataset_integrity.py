import csv
import json
import unittest
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


def read_candle_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
    return list(reader.fieldnames or []), rows


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

                for index, row in enumerate(rows, start=2):
                    open_time = int(row["open_time"])
                    close_time = int(row["close_time"])
                    open_price = float(row["open"])
                    high_price = float(row["high"])
                    low_price = float(row["low"])
                    close_price = float(row["close"])
                    volume = float(row["volume"])
                    trade_count = int(row["trade_count"])

                    if previous_open_time is not None:
                        self.assertGreater(open_time, previous_open_time, f"{path.name} row {index} is not strictly ascending.")
                    self.assertGreater(close_time, open_time, f"{path.name} row {index} has an invalid close_time.")
                    self.assertLessEqual(low_price, min(open_price, close_price), f"{path.name} row {index} low does not envelope the candle body.")
                    self.assertGreaterEqual(high_price, max(open_price, close_price), f"{path.name} row {index} high does not envelope the candle body.")
                    self.assertGreaterEqual(high_price, low_price, f"{path.name} row {index} has high below low.")
                    self.assertGreaterEqual(volume, 0, f"{path.name} row {index} has negative volume.")
                    self.assertGreaterEqual(trade_count, 0, f"{path.name} row {index} has negative trade_count.")
                    self.assertEqual(row["interval"], expected_interval, f"{path.name} row {index} has an unexpected interval.")

                    previous_open_time = open_time

    def test_hyperliquid_metadata_coverage_matches_checked_in_csvs(self) -> None:
        metadata = json.loads(HYPERLIQUID_METADATA_PATH.read_text(encoding="utf-8"))
        coverage_by_interval = {entry["interval"]: entry for entry in metadata["coverage"]}

        for path in sorted((DATA_DIR / "hyperliquid").glob("slv_usdc_*.csv")):
            with self.subTest(path=path.name):
                interval = path.stem.rsplit("_", maxsplit=1)[-1]
                _, rows = read_candle_csv(path)
                coverage = coverage_by_interval[interval]

                self.assertEqual(coverage["rows"], len(rows), f"{path.name} row count drifted from metadata.")
                self.assertEqual(coverage["first_open_time_utc"], rows[0]["open_time_utc"], f"{path.name} first candle drifted from metadata.")
                self.assertEqual(coverage["last_close_time_utc"], rows[-1]["close_time_utc"], f"{path.name} last candle drifted from metadata.")


if __name__ == "__main__":
    unittest.main()

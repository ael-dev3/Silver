import csv
import tempfile
import unittest
from pathlib import Path

from scripts.build_long_silver_weekly import aggregate_weekly, read_daily_rows


class BuildLongSilverWeeklyTests(unittest.TestCase):
    def test_read_daily_rows_normalizes_upstream_ohlc_anomalies(self) -> None:
        rows = self._read_rows(
            [
                {
                    "timestamp": "928368000000",
                    "open": "4.96",
                    "high": "4.99",
                    "low": "4.94",
                    "close": "4.93",
                    "volume": "156.75",
                },
                {
                    "timestamp": "928454400000",
                    "open": "4.93",
                    "high": "4.95",
                    "low": "4.87",
                    "close": "4.88",
                    "volume": "140.25",
                },
            ]
        )

        self.assertEqual(rows[0]["high"], 4.99)
        self.assertEqual(rows[0]["low"], 4.93)
        self.assertEqual(rows[1]["high"], 4.95)
        self.assertEqual(rows[1]["low"], 4.87)

    def test_aggregate_weekly_keeps_the_bar_range_consistent_with_open_and_close(self) -> None:
        weekly_rows = aggregate_weekly(
            [
                {
                    "timestamp": 928368000000,
                    "open": 4.96,
                    "high": 4.99,
                    "low": 4.93,
                    "close": 4.93,
                    "volume": 156.75,
                },
                {
                    "timestamp": 928454400000,
                    "open": 4.93,
                    "high": 4.95,
                    "low": 4.87,
                    "close": 4.88,
                    "volume": 140.25,
                },
            ]
        )

        self.assertEqual(len(weekly_rows), 1)
        weekly_bar = weekly_rows[0]

        self.assertEqual(weekly_bar["open"], "4.96")
        self.assertEqual(weekly_bar["high"], "4.99")
        self.assertEqual(weekly_bar["low"], "4.87")
        self.assertEqual(weekly_bar["close"], "4.88")
        self.assertLessEqual(float(weekly_bar["low"]), min(float(weekly_bar["open"]), float(weekly_bar["close"])))
        self.assertGreaterEqual(float(weekly_bar["high"]), max(float(weekly_bar["open"]), float(weekly_bar["close"])))

    def _read_rows(self, candle_rows: list[dict[str, str]]) -> list[dict]:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "dukascopy_daily.csv"
            with path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(
                    handle,
                    fieldnames=["timestamp", "open", "high", "low", "close", "volume"],
                )
                writer.writeheader()
                writer.writerows(candle_rows)
            return read_daily_rows(path)


if __name__ == "__main__":
    unittest.main()

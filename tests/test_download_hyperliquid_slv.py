import unittest

from scripts.download_hyperliquid_slv import filter_closed_candles


class DownloadHyperliquidSlvTests(unittest.TestCase):
    def test_filter_closed_candles_drops_rows_after_the_snapshot(self) -> None:
        candles = [
            {"T": 999, "label": "closed-before"},
            {"T": 1_000, "label": "closed-at-snapshot"},
            {"T": 1_001, "label": "still-open"},
        ]

        self.assertEqual(
            filter_closed_candles(candles, 1_000),
            [
                {"T": 999, "label": "closed-before"},
                {"T": 1_000, "label": "closed-at-snapshot"},
            ],
        )

    def test_filter_closed_candles_rejects_malformed_close_times(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "Unexpected candle close timestamp"):
            filter_closed_candles([{"T": "not-a-timestamp"}], 1_000)


if __name__ == "__main__":
    unittest.main()

import { buildMovingAverageSeries } from "./movingAverage";
import type { IndicatorDefinition } from "./types";

export const INDICATORS: IndicatorDefinition[] = [
  {
    id: "ema20",
    label: "EMA 20",
    color: "#f5a524",
    lineWidth: 2,
    defaultEnabled: true,
    compute: (candles) => buildMovingAverageSeries(candles, 20, "ema"),
  },
  {
    id: "ema50",
    label: "EMA 50",
    color: "#5e7cff",
    lineWidth: 2,
    defaultEnabled: true,
    compute: (candles) => buildMovingAverageSeries(candles, 50, "ema"),
  },
  {
    id: "sma20",
    label: "SMA 20",
    color: "#a4abb6",
    lineWidth: 1,
    defaultEnabled: false,
    compute: (candles) => buildMovingAverageSeries(candles, 20, "sma"),
  },
];

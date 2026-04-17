import type { CandleRow, IndicatorPoint } from "./types";

export type MovingAverageMode = "ema" | "sma";

function createEmptyValues(length: number): number[] {
  return Array<number>(length).fill(Number.NaN);
}

export function calculateMovingAverageValues(
  candles: CandleRow[],
  period: number,
  mode: MovingAverageMode,
): number[] {
  const values = createEmptyValues(candles.length);
  if (candles.length < period) {
    return values;
  }

  let rollingSum = 0;

  if (mode === "sma") {
    for (let index = 0; index < candles.length; index += 1) {
      rollingSum += candles[index].close;

      if (index >= period) {
        rollingSum -= candles[index - period].close;
      }

      if (index >= period - 1) {
        values[index] = rollingSum / period;
      }
    }

    return values;
  }

  const multiplier = 2 / (period + 1);
  let emaValue = 0;

  for (let index = 0; index < candles.length; index += 1) {
    const close = candles[index].close;
    rollingSum += close;

    if (index === period - 1) {
      emaValue = rollingSum / period;
      values[index] = emaValue;
      continue;
    }

    if (index >= period) {
      emaValue = close * multiplier + emaValue * (1 - multiplier);
      values[index] = emaValue;
    }
  }

  return values;
}

export function buildMovingAverageSeries(
  candles: CandleRow[],
  period: number,
  mode: MovingAverageMode,
): IndicatorPoint[] {
  const values = calculateMovingAverageValues(candles, period, mode);
  const series: IndicatorPoint[] = [];

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (Number.isNaN(value)) {
      continue;
    }

    series.push({
      time: candles[index].open_time / 1000,
      value,
    });
  }

  return series;
}

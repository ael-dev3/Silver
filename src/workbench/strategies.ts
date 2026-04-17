import { calculateMovingAverageValues } from "./movingAverage";
import type { BacktestResult, BacktestTrade, CandleRow, StrategyDefinition } from "./types";

function calculateMaxDrawdown(equityCurve: number[]): number {
  let peak = equityCurve[0] ?? 1;
  let maxDrawdown = 0;
  for (const value of equityCurve) {
    peak = Math.max(peak, value);
    maxDrawdown = Math.min(maxDrawdown, (value - peak) / peak);
  }
  return maxDrawdown * 100;
}

function markToMarketEquity(
  equityAtEntry: number,
  entryPrice: number,
  currentPrice: number,
): number {
  if (entryPrice <= 0) {
    return equityAtEntry;
  }

  return equityAtEntry * (currentPrice / entryPrice);
}

function runEmaCross(candles: CandleRow[]): BacktestResult | null {
  const fast = calculateMovingAverageValues(candles, 20, "ema");
  const slow = calculateMovingAverageValues(candles, 50, "ema");
  const trades: BacktestTrade[] = [];
  const equityCurve: number[] = [1];

  let inPosition = false;
  let entryPrice = 0;
  let entryTime = "";
  let realizedEquity = 1;
  let equityAtEntry = 1;

  for (let index = 1; index < candles.length; index += 1) {
    if (
      Number.isNaN(fast[index - 1]) ||
      Number.isNaN(slow[index - 1]) ||
      Number.isNaN(fast[index]) ||
      Number.isNaN(slow[index])
    ) {
      continue;
    }

    const crossedUp = fast[index - 1] <= slow[index - 1] && fast[index] > slow[index];
    const crossedDown = fast[index - 1] >= slow[index - 1] && fast[index] < slow[index];

    if (!inPosition && crossedUp) {
      inPosition = true;
      entryPrice = candles[index].close;
      entryTime = candles[index].close_time_utc;
      equityAtEntry = realizedEquity;
      equityCurve.push(realizedEquity);
      continue;
    }

    if (inPosition) {
      // Track marked-to-market equity so drawdown reflects open-position risk.
      const markedEquity = markToMarketEquity(
        equityAtEntry,
        entryPrice,
        candles[index].close,
      );
      equityCurve.push(markedEquity);

      if (crossedDown) {
        const exitPrice = candles[index].close;
        const tradeReturn = (exitPrice - entryPrice) / entryPrice;
        realizedEquity = markedEquity;
        trades.push({
          entryTime,
          exitTime: candles[index].close_time_utc,
          entryPrice,
          exitPrice,
          returnPct: tradeReturn * 100,
        });
        inPosition = false;
      }

      continue;
    }

    equityCurve.push(realizedEquity);
  }

  if (inPosition) {
    const last = candles[candles.length - 1];
    const tradeReturn = (last.close - entryPrice) / entryPrice;
    realizedEquity = markToMarketEquity(equityAtEntry, entryPrice, last.close);
    trades.push({
      entryTime,
      exitTime: last.close_time_utc,
      entryPrice,
      exitPrice: last.close,
      returnPct: tradeReturn * 100,
    });
  }

  if (!trades.length) {
    return null;
  }

  const winners = trades.filter((trade) => trade.returnPct > 0).length;
  return {
    strategyLabel: "EMA 20/50 Cross",
    trades,
    tradeCount: trades.length,
    winRate: (winners / trades.length) * 100,
    totalReturnPct: (realizedEquity - 1) * 100,
    maxDrawdownPct: calculateMaxDrawdown(equityCurve),
  };
}

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: "none",
    label: "No strategy",
    description: "Chart-only mode.",
    run: () => null,
  },
  {
    id: "ema-cross",
    label: "EMA 20/50 Cross",
    description: "Simple long-only crossover scaffold for future strategy work.",
    run: runEmaCross,
  },
];

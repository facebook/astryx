// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared sample datasets for the Charts stories. Not a story file (no `.stories`
 * suffix) so Storybook won't pick it up as a story.
 */

export const monthlyData = [
  {month: 'Jan', revenue: 45, costs: 30, trend: 38},
  {month: 'Feb', revenue: 52, costs: 35, trend: 42},
  {month: 'Mar', revenue: 48, costs: 32, trend: 40},
  {month: 'Apr', revenue: 61, costs: 38, trend: 48},
  {month: 'May', revenue: 55, costs: 34, trend: 45},
  {month: 'Jun', revenue: 70, costs: 40, trend: 52},
];

export const profitLossData = [
  {month: 'Jan', profit: 20, trend: 15},
  {month: 'Feb', profit: -10, trend: 5},
  {month: 'Mar', profit: 35, trend: 20},
  {month: 'Apr', profit: -25, trend: -5},
  {month: 'May', profit: 15, trend: 10},
  {month: 'Jun', profit: -5, trend: 8},
];

export const groupedStackData = [
  {month: 'Jan', revenueA: 30, costsA: 15, revenueB: 25, costsB: 20},
  {month: 'Feb', revenueA: 35, costsA: 18, revenueB: 28, costsB: 22},
  {month: 'Mar', revenueA: 28, costsA: 14, revenueB: 32, costsB: 18},
  {month: 'Apr', revenueA: 42, costsA: 20, revenueB: 35, costsB: 25},
  {month: 'May', revenueA: 38, costsA: 17, revenueB: 30, costsB: 21},
  {month: 'Jun', revenueA: 50, costsA: 22, revenueB: 40, costsB: 28},
];

export const predictionData = Array.from({length: 20}, (_, i) => {
  const mean = 30 + i * 2 + Math.sin(i / 3) * 5;
  return {
    x: i,
    mean: Math.round(mean * 10) / 10,
    upper95: Math.round((mean + 8 + i * 0.3) * 10) / 10,
    lower95: Math.round((mean - 8 - i * 0.3) * 10) / 10,
    upper80: Math.round((mean + 4 + i * 0.15) * 10) / 10,
    lower80: Math.round((mean - 4 - i * 0.15) * 10) / 10,
  };
});

export const salesData = [
  {month: 'Jan', sales: 45, target: 50, errorHigh: 48, errorLow: 42},
  {month: 'Feb', sales: 52, target: 50, errorHigh: 56, errorLow: 48},
  {month: 'Mar', sales: 48, target: 50, errorHigh: 52, errorLow: 44},
  {month: 'Apr', sales: 61, target: 50, errorHigh: 66, errorLow: 56},
  {month: 'May', sales: 55, target: 50, errorHigh: 59, errorLow: 51},
  {month: 'Jun', sales: 70, target: 50, errorHigh: 76, errorLow: 64},
];

export const stockData = Array.from({length: 30}, (_, i) => {
  const base = 100 + Math.sin(i / 5) * 20 + i * 0.5;
  const open = base + (Math.random() - 0.5) * 8;
  const close = base + (Math.random() - 0.5) * 8;
  return {
    day: `Day ${i + 1}`,
    open: Math.round(open * 10) / 10,
    close: Math.round(close * 10) / 10,
    high:
      Math.round(Math.max(open, close, base + Math.random() * 10) * 10) / 10,
    low: Math.round(Math.min(open, close, base - Math.random() * 10) * 10) / 10,
    volume: Math.round(500 + Math.random() * 1000),
  };
});

export const scatterData = Array.from({length: 200}, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));

export const heatmapData: Record<string, unknown>[] = [];
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
for (const day of HEATMAP_DAYS) {
  for (let hour = 0; hour < 24; hour++) {
    heatmapData.push({
      hour: `${hour}`,
      day,
      traffic: Math.round(
        50 +
          Math.sin(hour / 4) * 30 +
          (day === 'Sat' || day === 'Sun' ? -20 : 10) +
          Math.random() * 20,
      ),
    });
  }
}

export const stripData = [
  {group: 'A', value: 12},
  {group: 'A', value: 15},
  {group: 'A', value: 13},
  {group: 'A', value: 16},
  {group: 'A', value: 14},
  {group: 'B', value: 22},
  {group: 'B', value: 20},
  {group: 'B', value: 25},
  {group: 'B', value: 21},
  {group: 'C', value: 17},
  {group: 'C', value: 18},
  {group: 'C', value: 15},
  {group: 'C', value: 19},
  {group: 'C', value: 16},
  {group: 'C', value: 20},
];

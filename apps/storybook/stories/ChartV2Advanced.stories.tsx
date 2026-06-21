// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useMemo, useRef, useEffect, type MutableRefObject} from 'react';
import {
  ChartV2 as Chart,
  bar,
  line,
  band,
  candlestick,
  errorBar,
  referenceLine,
  dotGL,
  heatmapGL,
  streamGL,
  type StreamGLHandle,
} from '@xds/lab';
import {
  ChartV2Grid as ChartGrid,
  ChartV2Axis as ChartAxis,
} from '@xds/lab';

const meta: Meta<typeof Chart> = {
  title: 'Lab/ChartV2Advanced',
  component: Chart,
};
export default meta;

// ─── Data ──────────────────────────────────────────────────────────────────

const stockData = Array.from({length: 30}, (_, i) => {
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

const predictionData = Array.from({length: 20}, (_, i) => {
  const x = i;
  const mean = 30 + i * 2 + Math.sin(i / 3) * 5;
  return {
    x,
    mean: Math.round(mean * 10) / 10,
    upper95: Math.round((mean + 8 + i * 0.3) * 10) / 10,
    lower95: Math.round((mean - 8 - i * 0.3) * 10) / 10,
    upper80: Math.round((mean + 4 + i * 0.15) * 10) / 10,
    lower80: Math.round((mean - 4 - i * 0.15) * 10) / 10,
  };
});

const salesData = [
  {month: 'Jan', sales: 45, target: 50, errorHigh: 48, errorLow: 42},
  {month: 'Feb', sales: 52, target: 50, errorHigh: 56, errorLow: 48},
  {month: 'Mar', sales: 48, target: 50, errorHigh: 52, errorLow: 44},
  {month: 'Apr', sales: 61, target: 50, errorHigh: 66, errorLow: 56},
  {month: 'May', sales: 55, target: 50, errorHigh: 59, errorLow: 51},
  {month: 'Jun', sales: 70, target: 50, errorHigh: 76, errorLow: 64},
];

const scatterData = Array.from({length: 200}, _ => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));

const heatmapData: Record<string, unknown>[] = [];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
for (const day of days) {
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

// ─── Stories ───────────────────────────────────────────────────────────────

/** Candlestick chart */
export const Candlestick: StoryObj = {
  render: () => (
    <Chart
      data={stockData}
      xKey="day"
      series={[
        candlestick({
          open: 'open',
          high: 'high',
          low: 'low',
          close: 'close',
          upColor: '#22c55e',
          downColor: '#ef4444',
        }),
      ]}
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>
      }
      height={350}
    />
  ),
};

/** Candlestick + MA line + volume bars */
export const FinancialComposite: StoryObj = {
  name: 'Financial (Candlestick + MA + Volume)',
  render: () => {
    const data = useMemo(() => {
      let sum = 0;
      return stockData.map((d, i) => {
        sum += d.close;
        return {
          ...d,
          ma5:
            i >= 4
              ? Math.round(
                  ((sum -
                    stockData
                      .slice(0, i - 4)
                      .reduce((s, v) => s + v.close, 0)) /
                    5) *
                    10,
                ) / 10
              : undefined,
        };
      });
    }, []);
    return (
      <Chart
        data={data}
        xKey="day"
        series={[
          candlestick({
            open: 'open',
            high: 'high',
            low: 'low',
            close: 'close',
            upColor: '#22c55e',
            downColor: '#ef4444',
          }),
          line('ma5', {color: '#f59e0b', strokeWidth: 1.5}),
          bar('volume', {color: '#94a3b8', opacity: 0.3}),
        ]}
        grid={<ChartGrid />}
        axes={
          <>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
          </>
        }
        height={400}
      />
    );
  },
};

/** Confidence bands (80% + 95%) */
export const ConfidenceBands: StoryObj = {
  render: () => (
    <Chart
      data={predictionData}
      xKey="x"
      series={[
        band({
          upper: 'upper95',
          lower: 'lower95',
          color: '#3b82f6',
          opacity: 0.1,
        }),
        band({
          upper: 'upper80',
          lower: 'lower80',
          color: '#3b82f6',
          opacity: 0.2,
        }),
        line('mean', {color: '#3b82f6', strokeWidth: 2}),
      ]}
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

/** Error bars on bar chart + reference line */
export const ErrorBarsWithTarget: StoryObj = {
  name: 'Error Bars + Reference Line',
  render: () => (
    <Chart
      data={salesData}
      xKey="month"
      series={[
        bar('sales', {color: '#3b82f6'}),
        errorBar({high: 'errorHigh', low: 'errorLow', color: '#1e3a5f'}),
        referenceLine({y: 50, label: 'Target', color: '#ef4444'}),
        referenceLine({
          y: 40,
          y2: 60,
          label: 'Acceptable',
          color: '#22c55e',
          bandOpacity: 0.1,
        }),
      ]}
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

/** WebGL scatter — 200 points */
export const WebGLScatter: StoryObj = {
  name: 'WebGL Scatter (dotGL)',
  render: () => (
    <Chart
      data={scatterData}
      xKey="x"
      series={[dotGL('y', {color: '#3b82f6', size: 4})]}
      grid={<ChartGrid horizontal vertical />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>
      }
      height={400}
    />
  ),
};

/** WebGL heatmap — traffic by hour × day */
export const WebGLHeatmap: StoryObj = {
  name: 'WebGL Heatmap',
  render: () => (
    <Chart
      data={heatmapData}
      xKey="hour"
      series={[
        heatmapGL({
          xKey: 'hour',
          yKey: 'day',
          valueKey: 'traffic',
          colorRange: ['#eff6ff', '#1e40af'],
        }),
      ]}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>
      }
      height={280}
    />
  ),
};

/** Streaming line — real-time data */
export const StreamingLine: StoryObj = {
  name: 'Streaming (streamGL)',
  render: () => {
    const handleRef = useRef<StreamGLHandle | null>(
      null,
    ) as MutableRefObject<StreamGLHandle | null>;
    useEffect(() => {
      let t = 0;
      const interval = setInterval(() => {
        handleRef.current?.push(
          t,
          50 + Math.sin(t / 10) * 30 + Math.random() * 10,
        );
        t++;
      }, 200);
      return () => clearInterval(interval);
    }, []);

    return (
      <Chart
        data={[]}
        xKey="x"
        series={[streamGL({handleRef, color: '#3b82f6'})]}
        grid={<ChartGrid />}
        axes={
          <>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
          </>
        }
        height={300}
      />
    );
  },
};

/** Mixed: bars with error bars, line, reference line, confidence band */
export const KitchenSink: StoryObj = {
  name: 'Kitchen Sink',
  render: () => {
    const data = salesData.map((d, i, arr) => ({
      ...d,
      runAvg:
        Math.round(
          (arr.slice(0, i + 1).reduce((s, v) => s + v.sales, 0) / (i + 1)) * 10,
        ) / 10,
      upper:
        Math.round(
          (arr.slice(0, i + 1).reduce((s, v) => s + v.sales, 0) / (i + 1) + 8) *
            10,
        ) / 10,
      lower:
        Math.round(
          (arr.slice(0, i + 1).reduce((s, v) => s + v.sales, 0) / (i + 1) - 8) *
            10,
        ) / 10,
    }));
    return (
      <Chart
        data={data}
        xKey="month"
        series={[
          referenceLine({y: 40, y2: 60, color: '#22c55e', bandOpacity: 0.08}),
          referenceLine({y: 50, label: 'Target', color: '#ef4444'}),
          band({
            upper: 'upper',
            lower: 'lower',
            color: '#f59e0b',
            opacity: 0.15,
          }),
          bar('sales', {color: '#3b82f6'}),
          errorBar({high: 'errorHigh', low: 'errorLow', color: '#1e3a5f'}),
          line('runAvg', {color: '#f59e0b', strokeWidth: 2}),
        ]}
        grid={<ChartGrid />}
        axes={
          <>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
          </>
        }
        height={400}
      />
    );
  },
};

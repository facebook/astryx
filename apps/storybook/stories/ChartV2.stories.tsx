// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ChartV2 as Chart, bar, line, area} from '@xds/lab';
import {
  ChartV2Grid as ChartGrid,
  ChartV2Axis as ChartAxis,
  currency,
} from '@xds/lab';

const meta: Meta<typeof Chart> = {
  title: 'Lab/ChartV2',
  component: Chart,
};
export default meta;

const monthlyData = [
  {month: 'Jan', revenue: 45, costs: 30, trend: 38},
  {month: 'Feb', revenue: 52, costs: 35, trend: 42},
  {month: 'Mar', revenue: 48, costs: 32, trend: 40},
  {month: 'Apr', revenue: 61, costs: 38, trend: 48},
  {month: 'May', revenue: 55, costs: 34, trend: 45},
  {month: 'Jun', revenue: 70, costs: 40, trend: 52},
];

const groupedStackData = [
  {month: 'Jan', revenueA: 30, costsA: 15, revenueB: 25, costsB: 20},
  {month: 'Feb', revenueA: 35, costsA: 18, revenueB: 28, costsB: 22},
  {month: 'Mar', revenueA: 28, costsA: 14, revenueB: 32, costsB: 18},
  {month: 'Apr', revenueA: 42, costsA: 20, revenueB: 35, costsB: 25},
  {month: 'May', revenueA: 38, costsA: 17, revenueB: 30, costsB: 21},
  {month: 'Jun', revenueA: 50, costsA: 22, revenueB: 40, costsB: 28},
];

/** Simple bar chart */
export const SimpleBar: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      title="Monthly Revenue"
      series={[bar('revenue', {color: '#3b82f6'})]}
      tooltip={true}
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" tickFormat={currency()} />
        </>
      }
      height={300}
    />
  ),
};

/** Simple line chart */
export const SimpleLine: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      series={[line('trend', {color: '#3b82f6'})]}
      tooltip={true}
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

/** Stacked bars */
export const StackedBars: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      title="Revenue & Costs"
      subtitle="Stacked by category"
      series={[
        bar('revenue', {color: '#3b82f6', stack: 'totals', label: 'Revenue'}),
        bar('costs', {color: '#ef4444', stack: 'totals', label: 'Costs'}),
      ]}
      legend={{position: 'bottom', alignment: 'center'}}
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

/** Grouped bars */
export const GroupedBars: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      title="Revenue vs Costs"
      series={[
        bar('revenue', {color: '#3b82f6', group: 'compare', label: 'Revenue'}),
        bar('costs', {color: '#ef4444', group: 'compare', label: 'Costs'}),
      ]}
      legend={{position: 'top', alignment: 'end'}}
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

/** Grouped stacked bars — two stacks side by side per x value */
export const GroupedStackedBars: StoryObj = {
  render: () => (
    <Chart
      data={groupedStackData}
      xKey="month"
      series={[
        // Stack A (left bar in each group)
        bar('revenueA', {
          color: '#3b82f6',
          stack: 'stackA',
          group: 'comparison',
        }),
        bar('costsA', {color: '#93c5fd', stack: 'stackA', group: 'comparison'}),
        // Stack B (right bar in each group)
        bar('revenueB', {
          color: '#ef4444',
          stack: 'stackB',
          group: 'comparison',
        }),
        bar('costsB', {color: '#fca5a5', stack: 'stackB', group: 'comparison'}),
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

/** Mixed: bars + line */
export const MixedMarks: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      title="Revenue vs Trend"
      subtitle="Bar chart with trendline overlay"
      series={[
        bar('revenue', {color: '#3b82f6', label: 'Revenue'}),
        line('trend', {color: '#f59e0b', label: 'Trend'}),
      ]}
      tooltip={true}
      legend={{position: 'end', alignment: 'start'}}
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

/** Area with gradient */
export const AreaGradient: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      title="Revenue Over Time"
      series={[
        area('revenue', {color: '#3b82f6', gradient: true}),
        line('revenue', {color: '#3b82f6'}),
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

/** Stacked areas */
export const StackedAreas: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      title="Revenue & Costs Over Time"
      series={[
        area('revenue', {color: '#3b82f6', stack: 'total', label: 'Revenue'}),
        area('costs', {color: '#ef4444', stack: 'total', label: 'Costs'}),
      ]}
      legend={true}
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

const profitLossData = [
  {month: 'Jan', profit: 20, trend: 15},
  {month: 'Feb', profit: -10, trend: 5},
  {month: 'Mar', profit: 35, trend: 20},
  {month: 'Apr', profit: -25, trend: -5},
  {month: 'May', profit: 15, trend: 10},
  {month: 'Jun', profit: -5, trend: 8},
];

/** Mixed marks with negative values */
export const NegativeValues: StoryObj = {
  render: () => (
    <Chart
      data={profitLossData}
      xKey="month"
      series={[
        bar('profit', {color: '#3b82f6'}),
        line('trend', {color: '#f59e0b', dots: true, strokeWidth: 2}),
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

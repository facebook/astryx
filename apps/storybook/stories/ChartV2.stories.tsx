import type {Meta, StoryObj} from '@storybook/react';
import {XDSChartV2 as XDSChart, bar, line, area} from '@xds/lab';
import {XDSChartGrid, XDSChartAxis} from '@xds/lab';

const meta: Meta<typeof XDSChart> = {
  title: 'Lab/XDSChart v2',
  component: XDSChart,
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
    <XDSChart
      data={monthlyData}
      xKey="month"
      series={[bar('revenue', {color: '#3b82f6'})]}
      grid={<XDSChartGrid horizontal />}
      axes={
        <>
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

/** Stacked bars */
export const StackedBars: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      series={[
        bar('revenue', {color: '#3b82f6', stack: 'totals'}),
        bar('costs', {color: '#ef4444', stack: 'totals'}),
      ]}
      grid={<XDSChartGrid horizontal />}
      axes={
        <>
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

/** Grouped bars */
export const GroupedBars: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      series={[
        bar('revenue', {color: '#3b82f6', group: 'compare'}),
        bar('costs', {color: '#ef4444', group: 'compare'}),
      ]}
      grid={<XDSChartGrid horizontal />}
      axes={
        <>
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

/** Grouped stacked bars — two stacks side by side per x value */
export const GroupedStackedBars: StoryObj = {
  render: () => (
    <XDSChart
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
      grid={<XDSChartGrid horizontal />}
      axes={
        <>
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

/** Mixed: bars + line */
export const MixedMarks: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      series={[
        bar('revenue', {color: '#3b82f6'}),
        line('trend', {color: '#f59e0b'}),
      ]}
      grid={<XDSChartGrid horizontal />}
      axes={
        <>
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

/** Area with gradient */
export const AreaGradient: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      series={[
        area('revenue', {color: '#3b82f6', gradient: true}),
        line('revenue', {color: '#3b82f6'}),
      ]}
      grid={<XDSChartGrid horizontal />}
      axes={
        <>
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

/** Stacked areas */
export const StackedAreas: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      series={[
        area('revenue', {color: '#3b82f6', stack: 'total'}),
        area('costs', {color: '#ef4444', stack: 'total'}),
      ]}
      grid={<XDSChartGrid horizontal />}
      axes={
        <>
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
        </>
      }
      height={300}
    />
  ),
};

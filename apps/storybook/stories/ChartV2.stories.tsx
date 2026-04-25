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

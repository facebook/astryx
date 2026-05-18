import type {Meta, StoryObj} from '@storybook/react';
import {XDSChartV2 as XDSChart, line} from '@xds/lab';
import {XDSChartGrid, XDSChartAxis} from '@xds/lab';

const meta: Meta<typeof XDSChart> = {
  title: 'Lab/XDSChart v2/Line',
  component: XDSChart,
};
export default meta;

const weeklyData = [
  {day: 'Mon', pageViews: 1200, uniqueVisitors: 820},
  {day: 'Tue', pageViews: 1450, uniqueVisitors: 960},
  {day: 'Wed', pageViews: 1380, uniqueVisitors: 910},
  {day: 'Thu', pageViews: 1520, uniqueVisitors: 1050},
  {day: 'Fri', pageViews: 1690, uniqueVisitors: 1120},
  {day: 'Sat', pageViews: 980, uniqueVisitors: 680},
  {day: 'Sun', pageViews: 870, uniqueVisitors: 590},
];

/** Simple single-series line chart */
export const SimpleLine: StoryObj = {
  render: () => (
    <XDSChart
      data={weeklyData}
      xKey="day"
      series={[line('pageViews', {color: '#3b82f6'})]}
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

/** Line chart with dots on data points */
export const LineWithDots: StoryObj = {
  render: () => (
    <XDSChart
      data={weeklyData}
      xKey="day"
      series={[line('pageViews', {color: '#3b82f6', dots: true})]}
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

/** Multi-series line chart */
export const MultiSeries: StoryObj = {
  render: () => (
    <XDSChart
      data={weeklyData}
      xKey="day"
      series={[
        line('pageViews', {color: '#3b82f6', dots: true}),
        line('uniqueVisitors', {color: '#10b981', dots: true}),
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

/** Curve variations */
export const CurveVariations: StoryObj = {
  render: () => (
    <XDSChart
      data={weeklyData}
      xKey="day"
      series={[
        line('pageViews', {color: '#3b82f6', curve: 'linear'}),
        line('pageViews', {color: '#ef4444', curve: 'step'}),
        line('pageViews', {color: '#f59e0b', curve: 'natural'}),
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

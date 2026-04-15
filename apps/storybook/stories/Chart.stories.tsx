import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartBar,
  XDSChartLine,
  XDSChartDot,
  XDSChartTooltip,
  XDSChartLegend,
  XDSChartColors,
} from '@xds/lab';

const meta: Meta = {
  title: 'Lab/XDSChart',
};

export default meta;

const monthlyData = [
  {month: 'Jan', revenue: 4200, expenses: 2800, trend: 3800},
  {month: 'Feb', revenue: 3800, expenses: 2600, trend: 3900},
  {month: 'Mar', revenue: 5100, expenses: 3200, trend: 4200},
  {month: 'Apr', revenue: 4600, expenses: 2900, trend: 4400},
  {month: 'May', revenue: 5400, expenses: 3100, trend: 4600},
  {month: 'Jun', revenue: 6200, expenses: 3400, trend: 5000},
];

const colors = XDSChartColors.categorical(3);

/** Bar chart with axes and grid */
export const BarChart: StoryObj = {
  render: () => (
    <XDSChart data={monthlyData} xKey="month" yKeys={['revenue']} height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="revenue" color={colors[0]} />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

/** Line chart with dots */
export const LineChart: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'expenses']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartLine dataKey="revenue" color={colors[0]} dots />
      <XDSChartLine dataKey="expenses" color={colors[1]} dots />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: colors[0]},
          {label: 'Expenses', color: colors[1]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

/** Mixed bar + line chart */
export const MixedChart: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'trend']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="revenue" color={colors[0]} />
      <XDSChartLine dataKey="trend" color={colors[2]} dots />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: colors[0]},
          {label: 'Trend', color: colors[2]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

/** Scatter plot */
export const ScatterPlot: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'expenses']}
      height={300}>
      <XDSChartGrid horizontal vertical />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartDot dataKey="revenue" color={colors[0]} radius={5} />
      <XDSChartDot dataKey="expenses" color={colors[1]} radius={5} />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: colors[0]},
          {label: 'Expenses', color: colors[1]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

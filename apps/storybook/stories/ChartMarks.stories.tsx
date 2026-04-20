import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartBar,
  XDSChartLine,
  XDSChartArea,
  XDSChartBand,
  XDSChartTooltip,
  XDSChartLegend,
  useXDSChartColors,
} from '@xds/lab';

/**
 * Chart mark variants — stacked bars, grouped bars, area charts,
 * horizontal orientation, and confidence bands.
 */
const meta: Meta<typeof XDSChart> = {
  title: 'Lab/XDSChart/Marks',
  component: XDSChart,
};

export default meta;

// ─── Sample Data ────────────────────────────────────────────────────────────

const monthlyRevenue = [
  {month: 'Jan', revenue: 45, costs: 30, profit: 15},
  {month: 'Feb', revenue: 52, costs: 35, profit: 17},
  {month: 'Mar', revenue: 48, costs: 32, profit: 16},
  {month: 'Apr', revenue: 61, costs: 38, profit: 23},
  {month: 'May', revenue: 55, costs: 34, profit: 21},
  {month: 'Jun', revenue: 70, costs: 40, profit: 30},
];

const trafficData = [
  {month: 'Jan', mobile: 30, desktop: 45, tablet: 10},
  {month: 'Feb', mobile: 35, desktop: 42, tablet: 12},
  {month: 'Mar', mobile: 40, desktop: 38, tablet: 11},
  {month: 'Apr', mobile: 48, desktop: 35, tablet: 9},
  {month: 'May', mobile: 52, desktop: 33, tablet: 8},
  {month: 'Jun', mobile: 58, desktop: 30, tablet: 7},
];

const quarterlyData = [
  {quarter: 'Q1', product: 40, services: 25, support: 15},
  {quarter: 'Q2', product: 45, services: 30, support: 18},
  {quarter: 'Q3', product: 55, services: 35, support: 20},
  {quarter: 'Q4', product: 65, services: 40, support: 22},
];

const stockData = Array.from({length: 30}, (_, i) => {
  const base = 100 + Math.sin(i / 5) * 20 + i * 0.5;
  return {
    day: i + 1,
    price: Math.round(base * 10) / 10,
    upper: Math.round((base + 8) * 10) / 10,
    lower: Math.round((base - 8) * 10) / 10,
  };
});

const categories = [
  {category: 'Electronics', value: 85},
  {category: 'Clothing', value: 62},
  {category: 'Food & Beverage', value: 78},
  {category: 'Home & Garden', value: 45},
  {category: 'Sports', value: 55},
  {category: 'Books', value: 30},
];

// ─── Stories ────────────────────────────────────────────────────────────────

/** Stacked bars — revenue and costs build on each other */
export const StackedBars: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSChart data={monthlyRevenue} xKey="month" yKeys={['revenue', 'costs']} height={300}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartBar dataKey="revenue" color={colors.categorical(2)[0]} stack="total" />
        <XDSChartBar dataKey="costs" color={colors.categorical(2)[1]} stack="total" />
        <XDSChartTooltip />
        <XDSChartLegend items={[
          {label: 'Revenue', color: colors.categorical(2)[0]},
          {label: 'Costs', color: colors.categorical(2)[1]},
        ]} />
      </XDSChart>
    );
  },
};

/** Grouped bars — metrics side by side per category */
export const GroupedBars: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSChart data={quarterlyData} xKey="quarter" yKeys={['product', 'services', 'support']} height={300}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartBar dataKey="product" color={colors.categorical(3)[0]} />
        <XDSChartBar dataKey="services" color={colors.categorical(3)[1]} />
        <XDSChartBar dataKey="support" color={colors.categorical(3)[2]} />
        <XDSChartTooltip />
        <XDSChartLegend items={[
          {label: 'Product', color: colors.categorical(3)[0]},
          {label: 'Services', color: colors.categorical(3)[1]},
          {label: 'Support', color: colors.categorical(3)[2]},
        ]} />
      </XDSChart>
    );
  },
};

/** Horizontal bars — great for long category names */
export const HorizontalBars: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSChart data={categories} xKey="category" yKeys={['value']} height={300} orientation="horizontal">
        <XDSChartGrid vertical />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartBar dataKey="value" color={colors.categorical(1)[0]} />
        <XDSChartTooltip />
      </XDSChart>
    );
  },
};

/** Area chart with gradient fill */
export const AreaGradient: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSChart data={stockData} xKey="day" yKeys={['price']} height={300}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartArea dataKey="price" color={colors.categorical(1)[0]} gradient />
        <XDSChartLine dataKey="price" color={colors.categorical(1)[0]} />
        <XDSChartTooltip />
      </XDSChart>
    );
  },
};

/** Stacked areas — traffic source composition over time */
export const StackedAreas: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSChart data={trafficData} xKey="month" yKeys={['mobile', 'desktop', 'tablet']} height={300}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartArea dataKey="mobile" color={colors.categorical(3)[0]} stack="traffic" />
        <XDSChartArea dataKey="desktop" color={colors.categorical(3)[1]} stack="traffic" />
        <XDSChartArea dataKey="tablet" color={colors.categorical(3)[2]} stack="traffic" />
        <XDSChartTooltip />
        <XDSChartLegend items={[
          {label: 'Mobile', color: colors.categorical(3)[0]},
          {label: 'Desktop', color: colors.categorical(3)[1]},
          {label: 'Tablet', color: colors.categorical(3)[2]},
        ]} />
      </XDSChart>
    );
  },
};

/** Confidence band — price with upper/lower bounds */
export const ConfidenceBandStory: StoryObj = {
  name: 'Confidence Band',
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSChart data={stockData} xKey="day" yKeys={['price', 'upper', 'lower']} height={300}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartBand yUpper="upper" yLower="lower" color={colors.categorical(1)[0]} opacity={0.15} />
        <XDSChartLine dataKey="price" color={colors.categorical(1)[0]} />
        <XDSChartTooltip />
      </XDSChart>
    );
  },
};

/** Mixed — stacked bars with a trend line overlay */
export const StackedWithLine: StoryObj = {
  name: 'Stacked Bars + Line',
  render: () => {
    const colors = useXDSChartColors();
    const data = monthlyRevenue.map((d, i, arr) => ({
      ...d,
      runningAvg: Math.round(arr.slice(0, i + 1).reduce((s, v) => s + v.revenue, 0) / (i + 1)),
    }));
    return (
      <XDSChart data={data} xKey="month" yKeys={['revenue', 'costs', 'runningAvg']} height={300}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartBar dataKey="revenue" color={colors.categorical(3)[0]} stack="total" />
        <XDSChartBar dataKey="costs" color={colors.categorical(3)[1]} stack="total" />
        <XDSChartLine dataKey="runningAvg" color={colors.categorical(3)[2]} />
        <XDSChartTooltip />
      </XDSChart>
    );
  },
};

import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSRadialChart,
  XDSRadialGrid,
  XDSRadialArea,
  XDSRadialAxis,
  XDSRadialSlice,
  XDSChartLegend,
  useXDSChartColors,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDSRadialChart',
  tags: ['autodocs'],
};

export default meta;

// Spider data — each row is a "model" with values per axis
const spiderData = [
  {
    model: 'Model A',
    speed: 85,
    handling: 70,
    comfort: 90,
    safety: 95,
    efficiency: 60,
  },
  {
    model: 'Model B',
    speed: 70,
    handling: 95,
    comfort: 60,
    safety: 80,
    efficiency: 85,
  },
  {
    model: 'Model C',
    speed: 95,
    handling: 60,
    comfort: 75,
    safety: 70,
    efficiency: 90,
  },
];

/** Spider/radar chart comparing three models across five dimensions */
export const SpiderChart: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    const c = colors.categorical(3);
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Spider Chart</XDSHeading>
        <XDSRadialChart
          data={spiderData}
          axes={['speed', 'handling', 'comfort', 'safety', 'efficiency']}
          height={400}>
          <XDSRadialGrid rings={5} />
          <XDSRadialArea dataKey="Model A" color={c[0]} dots />
          <XDSRadialArea dataKey="Model B" color={c[1]} dots />
          <XDSRadialArea dataKey="Model C" color={c[2]} dots />
          <XDSRadialAxis />
          <XDSChartLegend
            items={[
              {label: 'Model A', color: c[0]},
              {label: 'Model B', color: c[1]},
              {label: 'Model C', color: c[2]},
            ]}
          />
        </XDSRadialChart>
      </XDSStack>
    );
  },
};

// Pie data
const pieData = [
  {region: 'North America', revenue: 42},
  {region: 'Europe', revenue: 28},
  {region: 'Asia Pacific', revenue: 18},
  {region: 'Latin America', revenue: 8},
  {region: 'Africa', revenue: 4},
];

/** Pie chart — revenue by region */
export const PieChart: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Pie Chart</XDSHeading>
        <XDSRadialChart
          data={pieData}
          valueKey="revenue"
          labelKey="region"
          height={400}>
          <XDSRadialSlice colors={colors.categorical(5)} />
          <XDSChartLegend
            items={pieData.map((d, i) => ({
              label: d.region,
              color: colors.categorical(5)[i],
            }))}
          />
        </XDSRadialChart>
      </XDSStack>
    );
  },
};

/** Donut chart — same data with inner radius */
export const DonutChart: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Donut Chart</XDSHeading>
        <XDSRadialChart
          data={pieData}
          valueKey="revenue"
          labelKey="region"
          innerRadius={0.55}
          height={400}>
          <XDSRadialSlice colors={colors.categorical(5)} />
          <XDSChartLegend
            items={pieData.map((d, i) => ({
              label: d.region,
              color: colors.categorical(5)[i],
            }))}
          />
        </XDSRadialChart>
      </XDSStack>
    );
  },
};

/** Spider with donut center */
export const SpiderDonut: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    const c = colors.categorical(2);
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Spider with Inner Radius</XDSHeading>
        <XDSRadialChart
          data={spiderData}
          axes={['speed', 'handling', 'comfort', 'safety', 'efficiency']}
          innerRadius={0.2}
          height={400}>
          <XDSRadialGrid rings={4} />
          <XDSRadialArea dataKey="Model A" color={c[0]} dots />
          <XDSRadialArea dataKey="Model B" color={c[1]} dots />
          <XDSRadialAxis />
        </XDSRadialChart>
      </XDSStack>
    );
  },
};

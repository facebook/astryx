// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  RadialChart,
  RadialGrid,
  RadialArea,
  RadialAxis,
  RadialSlice,
  ChartLegend,
  useChartColors,
} from '@xds/lab';
import {Stack} from '@xds/core';
import {Heading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/RadialChart',
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
    const colors = useChartColors();
    const c = colors.categorical(3);
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Spider Chart</Heading>
        <RadialChart
          data={spiderData}
          axes={['speed', 'handling', 'comfort', 'safety', 'efficiency']}
          height={400}>
          <RadialGrid rings={5} />
          <RadialArea dataKey="Model A" color={c[0]} dots />
          <RadialArea dataKey="Model B" color={c[1]} dots />
          <RadialArea dataKey="Model C" color={c[2]} dots />
          <RadialAxis />
          <ChartLegend
            items={[
              {label: 'Model A', color: c[0]},
              {label: 'Model B', color: c[1]},
              {label: 'Model C', color: c[2]},
            ]}
          />
        </RadialChart>
      </Stack>
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
    const colors = useChartColors();
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Pie Chart</Heading>
        <RadialChart
          data={pieData}
          valueKey="revenue"
          labelKey="region"
          height={400}>
          <RadialSlice colors={colors.categorical(5)} />
          <ChartLegend
            items={pieData.map((d, i) => ({
              label: d.region,
              color: colors.categorical(5)[i],
            }))}
          />
        </RadialChart>
      </Stack>
    );
  },
};

/** Donut chart — same data with inner radius */
export const DonutChart: StoryObj = {
  render: () => {
    const colors = useChartColors();
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Donut Chart</Heading>
        <RadialChart
          data={pieData}
          valueKey="revenue"
          labelKey="region"
          innerRadius={0.55}
          height={400}>
          <RadialSlice colors={colors.categorical(5)} />
          <ChartLegend
            items={pieData.map((d, i) => ({
              label: d.region,
              color: colors.categorical(5)[i],
            }))}
          />
        </RadialChart>
      </Stack>
    );
  },
};

/** Spider with donut center */
export const SpiderDonut: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const c = colors.categorical(2);
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Spider with Inner Radius</Heading>
        <RadialChart
          data={spiderData}
          axes={['speed', 'handling', 'comfort', 'safety', 'efficiency']}
          innerRadius={0.2}
          height={400}>
          <RadialGrid rings={4} />
          <RadialArea dataKey="Model A" color={c[0]} dots />
          <RadialArea dataKey="Model B" color={c[1]} dots />
          <RadialAxis />
        </RadialChart>
      </Stack>
    );
  },
};

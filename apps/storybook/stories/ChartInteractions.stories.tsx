// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState, useMemo} from 'react';
import {
  Chart,
  ChartAxis,
  ChartGrid,
  ChartLine,
  ChartDot,
  ChartBar,
  ChartBrush,
  ChartTooltip,
  ChartZoom,
  ChartSelect,
  ChartReferenceLine,
  useChartColors,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {Heading} from '@xds/core/Text';
import {useDataset} from './useDataset';

const meta: Meta = {title: 'Lab/Chart Interactions', tags: ['autodocs']};
export default meta;

type Car = {Horsepower: number; Miles_per_Gallon: number};

const monthlyData = [
  {month: 'Jan', revenue: 4200, expenses: 2800},
  {month: 'Feb', revenue: 3800, expenses: 2600},
  {month: 'Mar', revenue: 5100, expenses: 3200},
  {month: 'Apr', revenue: 4600, expenses: 2900},
  {month: 'May', revenue: 5400, expenses: 3100},
  {month: 'Jun', revenue: 6200, expenses: 3400},
  {month: 'Jul', revenue: 5800, expenses: 3300},
  {month: 'Aug', revenue: 5500, expenses: 3000},
  {month: 'Sep', revenue: 4900, expenses: 2700},
  {month: 'Oct', revenue: 5200, expenses: 3100},
  {month: 'Nov', revenue: 5700, expenses: 3200},
  {month: 'Dec', revenue: 6800, expenses: 3600},
];

/** 1D brush on a bar chart — select a range of months */
export const BrushBars: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>1D Brush — Bar Chart</Heading>
        <Text type="supporting" color="secondary">
          Drag to select a range. {selected ?? 'Click to clear.'}
        </Text>
        <Chart
          data={monthlyData}
          xKey="month"
          yKeys={['revenue']}
          height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
          <ChartBrush
            onBrush={(_, sel) => setSelected(`${sel.length} months selected`)}
            onClear={() => setSelected(null)}
          />
        </Chart>
      </Stack>
    );
  },
};

/** 1D brush on a line chart — select a time range */
export const BrushLine: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>1D Brush — Line Chart</Heading>
        <Text type="supporting" color="secondary">
          Drag to select a range. {selected ?? 'Click to clear.'}
        </Text>
        <Chart
          data={monthlyData}
          xKey="month"
          yKeys={['revenue', 'expenses']}
          height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartLine
            dataKey="revenue"
            color={colors.categorical(2)[0]}
            dots
          />
          <ChartLine
            dataKey="expenses"
            color={colors.categorical(2)[1]}
            dots
          />
          <ChartBrush
            onBrush={(_, sel) => setSelected(`${sel.length} months selected`)}
            onClear={() => setSelected(null)}
          />
        </Chart>
      </Stack>
    );
  },
};

/** 2D rectangular brush on a scatter plot */
export const Brush2D: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const [count, setCount] = useState<number | null>(null);
    const data = useMemo(
      () =>
        raw
          .filter(d => d.Horsepower != null && d.Miles_per_Gallon != null)
          .map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon})),
      [raw],
    );
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>2D Brush — Scatter Plot</Heading>
        <Text type="supporting" color="secondary">
          Drag a rectangle to select.{' '}
          {count != null ? `${count} points selected.` : 'Click to clear.'}
        </Text>
        <Chart
          data={data}
          xKey="hp"
          yKeys={['mpg']}
          yBaseline="data"
          height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot
            dataKey="mpg"
            color={colors.categorical(1)[0]}
            radius={3}
          />
          <ChartBrush
            mode="xy"
            onBrush={(_, sel) => setCount(sel.length)}
            onClear={() => setCount(null)}
          />
        </Chart>
      </Stack>
    );
  },
};

/** Crosshair with value readouts */
export const Crosshair: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(
      () =>
        raw
          .filter(d => d.Horsepower != null && d.Miles_per_Gallon != null)
          .map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon})),
      [raw],
    );
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Crosshair</Heading>
        <Chart
          data={data}
          xKey="hp"
          yKeys={['mpg']}
          yBaseline="data"
          height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot
            dataKey="mpg"
            color={colors.categorical(1)[0]}
            radius={3}
          />
          <ChartTooltip
            crosshair="xy"
            crosshairLabels
            xFormat={v => `${Math.round(Number(v))} hp`}
            yFormat={v => `${Math.round(v)} mpg`}
          />
        </Chart>
      </Stack>
    );
  },
};

/** Scroll to zoom, drag to pan */
export const ZoomPan: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(
      () =>
        raw
          .filter(d => d.Horsepower != null && d.Miles_per_Gallon != null)
          .map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon})),
      [raw],
    );
    const [xDomain, setXDomain] = useState<[number, number]>([40, 230]);
    const [yDomain, setYDomain] = useState<[number, number]>([8, 47]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Zoom & Pan</Heading>
        <Text type="supporting" color="secondary">
          Scroll to zoom, drag to pan. x: [{Math.round(xDomain[0])},{' '}
          {Math.round(xDomain[1])}]
        </Text>
        <Chart
          data={data}
          xKey="hp"
          yKeys={['mpg']}
          xDomain={xDomain}
          yDomain={yDomain}
          height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot
            dataKey="mpg"
            color={colors.categorical(1)[0]}
            radius={3}
          />
          <ChartZoom
            onXDomainChange={setXDomain}
            onYDomainChange={setYDomain}
          />
        </Chart>
      </Stack>
    );
  },
};

/** Click to select points */
export const ClickSelect: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(
      () =>
        raw
          .filter(d => d.Horsepower != null && d.Miles_per_Gallon != null)
          .map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon})),
      [raw],
    );
    const [selected, setSelected] = useState<number[]>([]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Click to Select</Heading>
        <Text type="supporting" color="secondary">
          Click a point. Shift-click for multi. {selected.length} selected.
        </Text>
        <Chart
          data={data}
          xKey="hp"
          yKeys={['mpg']}
          yBaseline="data"
          height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot
            dataKey="mpg"
            color={colors.categorical(1)[0]}
            radius={3}
          />
          <ChartSelect selected={selected} onSelectionChange={setSelected} />
        </Chart>
      </Stack>
    );
  },
};

/** Reference lines for target and average */
export const ReferenceLines: StoryObj = {
  render: () => {
    const colors = useChartColors();
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Reference Lines</Heading>
        <Chart
          data={monthlyData}
          xKey="month"
          yKeys={['revenue']}
          height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
          <ChartReferenceLine
            y={5000}
            label="Target"
            color={colors.semantic.positive}
          />
          <ChartReferenceLine
            y={4700}
            label="Average"
            color={colors.semantic.neutral}
          />
        </Chart>
      </Stack>
    );
  },
};

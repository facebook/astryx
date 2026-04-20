import type {Meta, StoryObj} from '@storybook/react';
import {useState, useMemo} from 'react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartLine,
  XDSChartDot,
  XDSChartBar,
  XDSChartBrush,
  XDSChartTooltip,
  XDSChartZoom,
  XDSChartSelect,
  XDSChartReferenceLine,
  useXDSChartColors,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';
import {useDataset} from './useDataset';

const meta: Meta = {title: 'Lab/XDSChart Interactions', tags: ['autodocs']};
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
    const colors = useXDSChartColors();
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>1D Brush — Bar Chart</XDSHeading>
        <XDSText type="supporting" color="secondary">
          Drag to select a range. {selected ?? 'Click to clear.'}
        </XDSText>
        <XDSChart
          data={monthlyData}
          xKey="month"
          yKeys={['revenue']}
          height={300}>
          <XDSChartGrid horizontal />
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
          <XDSChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
          <XDSChartBrush
            onBrush={(_, sel) => setSelected(`${sel.length} months selected`)}
            onClear={() => setSelected(null)}
          />
        </XDSChart>
      </XDSStack>
    );
  },
};

/** 1D brush on a line chart — select a time range */
export const BrushLine: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>1D Brush — Line Chart</XDSHeading>
        <XDSText type="supporting" color="secondary">
          Drag to select a range. {selected ?? 'Click to clear.'}
        </XDSText>
        <XDSChart
          data={monthlyData}
          xKey="month"
          yKeys={['revenue', 'expenses']}
          height={300}>
          <XDSChartGrid horizontal />
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
          <XDSChartLine
            dataKey="revenue"
            color={colors.categorical(2)[0]}
            dots
          />
          <XDSChartLine
            dataKey="expenses"
            color={colors.categorical(2)[1]}
            dots
          />
          <XDSChartBrush
            onBrush={(_, sel) => setSelected(`${sel.length} months selected`)}
            onClear={() => setSelected(null)}
          />
        </XDSChart>
      </XDSStack>
    );
  },
};

/** 2D rectangular brush on a scatter plot */
export const Brush2D: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const [count, setCount] = useState<number | null>(null);
    const data = useMemo(
      () =>
        raw
          .filter(d => d.Horsepower != null && d.Miles_per_Gallon != null)
          .map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon})),
      [raw],
    );
    if (!data.length) return <XDSText type="supporting">Loading…</XDSText>;
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>2D Brush — Scatter Plot</XDSHeading>
        <XDSText type="supporting" color="secondary">
          Drag a rectangle to select.{' '}
          {count != null ? `${count} points selected.` : 'Click to clear.'}
        </XDSText>
        <XDSChart
          data={data}
          xKey="hp"
          yKeys={['mpg']}
          yBaseline="data"
          height={350}>
          <XDSChartGrid horizontal vertical />
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
          <XDSChartDot
            dataKey="mpg"
            color={colors.categorical(1)[0]}
            radius={3}
          />
          <XDSChartBrush
            mode="xy"
            onBrush={(_, sel) => setCount(sel.length)}
            onClear={() => setCount(null)}
          />
        </XDSChart>
      </XDSStack>
    );
  },
};

/** Crosshair with value readouts */
export const Crosshair: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(
      () =>
        raw
          .filter(d => d.Horsepower != null && d.Miles_per_Gallon != null)
          .map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon})),
      [raw],
    );
    if (!data.length) return <XDSText type="supporting">Loading…</XDSText>;
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Crosshair</XDSHeading>
        <XDSChart
          data={data}
          xKey="hp"
          yKeys={['mpg']}
          yBaseline="data"
          height={350}>
          <XDSChartGrid horizontal vertical />
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
          <XDSChartDot
            dataKey="mpg"
            color={colors.categorical(1)[0]}
            radius={3}
          />
          <XDSChartTooltip
            crosshair="xy"
            crosshairLabels
            xFormat={v => `${Math.round(Number(v))} hp`}
            yFormat={v => `${Math.round(v)} mpg`}
          />
        </XDSChart>
      </XDSStack>
    );
  },
};

/** Scroll to zoom, drag to pan */
export const ZoomPan: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
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
    if (!data.length) return <XDSText type="supporting">Loading…</XDSText>;
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Zoom & Pan</XDSHeading>
        <XDSText type="supporting" color="secondary">
          Scroll to zoom, drag to pan. x: [{Math.round(xDomain[0])},{' '}
          {Math.round(xDomain[1])}]
        </XDSText>
        <XDSChart
          data={data}
          xKey="hp"
          yKeys={['mpg']}
          xDomain={xDomain}
          yDomain={yDomain}
          height={350}>
          <XDSChartGrid horizontal vertical />
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
          <XDSChartDot
            dataKey="mpg"
            color={colors.categorical(1)[0]}
            radius={3}
          />
          <XDSChartZoom
            onXDomainChange={setXDomain}
            onYDomainChange={setYDomain}
          />
        </XDSChart>
      </XDSStack>
    );
  },
};

/** Click to select points */
export const ClickSelect: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(
      () =>
        raw
          .filter(d => d.Horsepower != null && d.Miles_per_Gallon != null)
          .map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon})),
      [raw],
    );
    const [selected, setSelected] = useState<number[]>([]);
    if (!data.length) return <XDSText type="supporting">Loading…</XDSText>;
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Click to Select</XDSHeading>
        <XDSText type="supporting" color="secondary">
          Click a point. Shift-click for multi. {selected.length} selected.
        </XDSText>
        <XDSChart
          data={data}
          xKey="hp"
          yKeys={['mpg']}
          yBaseline="data"
          height={350}>
          <XDSChartGrid horizontal vertical />
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
          <XDSChartDot
            dataKey="mpg"
            color={colors.categorical(1)[0]}
            radius={3}
          />
          <XDSChartSelect selected={selected} onSelectionChange={setSelected} />
        </XDSChart>
      </XDSStack>
    );
  },
};

/** Reference lines for target and average */
export const ReferenceLines: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Reference Lines</XDSHeading>
        <XDSChart
          data={monthlyData}
          xKey="month"
          yKeys={['revenue']}
          height={300}>
          <XDSChartGrid horizontal />
          <XDSChartAxis position="bottom" />
          <XDSChartAxis position="left" />
          <XDSChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
          <XDSChartReferenceLine
            y={5000}
            label="Target"
            color={colors.semantic.positive}
          />
          <XDSChartReferenceLine
            y={4700}
            label="Average"
            color={colors.semantic.neutral}
          />
        </XDSChart>
      </XDSStack>
    );
  },
};

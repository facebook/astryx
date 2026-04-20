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

/** Drag to select an x-range */
export const BrushSelection: StoryObj = {
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
    if (!data.length) return <XDSText type="supporting">Loading\u2026</XDSText>;
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Brush Selection</XDSHeading>
        <XDSText type="supporting" color="secondary">
          Drag to select.{' '}
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
    if (!data.length) return <XDSText type="supporting">Loading\u2026</XDSText>;
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
    if (!data.length) return <XDSText type="supporting">Loading\u2026</XDSText>;
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
    if (!data.length) return <XDSText type="supporting">Loading\u2026</XDSText>;
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

const monthlyData = [
  {month: 'Jan', revenue: 4200, expenses: 2800},
  {month: 'Feb', revenue: 3800, expenses: 2600},
  {month: 'Mar', revenue: 5100, expenses: 3200},
  {month: 'Apr', revenue: 4600, expenses: 2900},
  {month: 'May', revenue: 5400, expenses: 3100},
  {month: 'Jun', revenue: 6200, expenses: 3400},
];

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

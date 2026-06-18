// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useMemo} from 'react';
import {
  Chart,
  ChartAxis,
  ChartGrid,
  ChartBar,
  ChartLine,
  ChartDot,
  ChartArea,
  ChartTooltip,
  ChartLegend,
  ChartDotGL,
  ChartHeatmapGL,
  useChartColors,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {useDataset} from './useDataset';

/**
 * `Chart` — composable chart system built on d3. All marks share a single
 * coordinate space via React context.
 *
 * Datasets from [vega-datasets](https://github.com/vega/vega-datasets) (CDN).
 */
const meta: Meta<typeof Chart> = {
  title: 'Lab/Chart',
  component: Chart,
  tags: ['autodocs'],
};

export default meta;

type Barley = {yield: number; variety: string; year: number; site: string};
type Stock = {symbol: string; date: string; price: number};
type Car = {Horsepower: number; Miles_per_Gallon: number};
type Flight = {delay: number; distance: number};
type Weather = {date: string; temp_max: number; temp_min: number};
type Gapminder = {country: string; year: number; life_expect: number};

/** Iowa barley yields — average by variety (barley.json) */
export const BarChart: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Barley>('barley.json');
    const data = useMemo(() => {
      if (!raw.length) {
        return [];
      }
      const byVariety = new Map<string, {sum: number; count: number}>();
      for (const d of raw) {
        const e = byVariety.get(d.variety) ?? {sum: 0, count: 0};
        e.sum += d.yield;
        e.count += 1;
        byVariety.set(d.variety, e);
      }
      return [...byVariety.entries()]
        .map(([variety, {sum, count}]) => ({
          variety,
          avgYield: Math.round((sum / count) * 10) / 10,
        }))
        .sort((a, b) => b.avgYield - a.avgYield)
        .slice(0, 10);
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    return (
      <Chart data={data} xKey="variety" yKeys={['avgYield']} height={300}>
        <ChartGrid horizontal />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartBar dataKey="avgYield" color={colors.categorical(1)[0]} />
        <ChartTooltip />
      </Chart>
    );
  },
};

/** AAPL vs GOOG monthly prices (stocks.csv) */
export const LineChart: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Stock>('stocks.csv');
    const data = useMemo(() => {
      if (!raw.length) {
        return [];
      }
      const filtered = raw.filter(
        d => d.symbol === 'AAPL' || d.symbol === 'GOOG',
      );
      const byDate = new Map<string, Record<string, unknown>>();
      for (const d of filtered) {
        const e = byDate.get(d.date) ?? {date: d.date};
        e[d.symbol] = d.price;
        byDate.set(d.date, e);
      }
      return [...byDate.values()]
        .filter(d => d.AAPL != null && d.GOOG != null)
        .slice(-12);
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    const c = colors.categorical(2);
    return (
      <Chart
        data={data}
        xKey="date"
        yKeys={['AAPL', 'GOOG']}
        yBaseline="data"
        height={300}>
        <ChartGrid horizontal />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartLine dataKey="AAPL" color={c[0]} dots />
        <ChartLine dataKey="GOOG" color={c[1]} dots />
        <ChartLegend
          items={[
            {label: 'AAPL', color: c[0]},
            {label: 'GOOG', color: c[1]},
          ]}
        />
        <ChartTooltip />
      </Chart>
    );
  },
};

/** Horsepower vs MPG — 406 cars (cars.json) */
export const ScatterPlot: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Car>('cars.json');
    const data = useMemo(() => {
      return raw
        .filter(d => d.Horsepower != null && d.Miles_per_Gallon != null)
        .map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon}));
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    return (
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
        <ChartTooltip crosshair="xy" />
      </Chart>
    );
  },
};

/** Flight delay vs distance — 10k points via WebGL (flights-10k.json) */
export const WebGLScatter: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Flight>('flights-10k.json');
    const data = useMemo(() => {
      return raw
        .filter(d => d.delay != null && d.distance != null)
        .map(d => ({distance: d.distance, delay: d.delay}));
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading 10k flights…</Text>;
    }
    return (
      <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary">
          {data.length.toLocaleString()} flights
        </Text>
        <Chart
          data={data}
          xKey="distance"
          yKeys={['delay']}
          yBaseline="zero"
          height={400}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDotGL
            dataKey="delay"
            color={colors.categorical(1)[0]}
            size={3}
            opacity={0.3}
          />
        </Chart>
      </Stack>
    );
  },
};

/** Seattle temperature range — monthly avg min/max band (seattle-weather.csv) */
export const ConfidenceBand: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Weather>('seattle-weather.csv');
    const data = useMemo(() => {
      if (!raw.length) {
        return [];
      }
      const byMonth = new Map<
        string,
        {maxSum: number; minSum: number; count: number}
      >();
      for (const d of raw) {
        const month = String(d.date).slice(0, 7);
        const e = byMonth.get(month) ?? {maxSum: 0, minSum: 0, count: 0};
        e.maxSum += d.temp_max;
        e.minSum += d.temp_min;
        e.count += 1;
        byMonth.set(month, e);
      }
      return [...byMonth.entries()]
        .map(([month, {maxSum, minSum, count}]) => ({
          month,
          avgMax: Math.round((maxSum / count) * 10) / 10,
          avgMin: Math.round((minSum / count) * 10) / 10,
          avgMid: Math.round(((maxSum + minSum) / (count * 2)) * 10) / 10,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-24);
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    return (
      <Chart
        data={data}
        xKey="month"
        yKeys={['avgMax', 'avgMin']}
        yBaseline="data"
        height={300}>
        <ChartGrid horizontal />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartArea
          yUpper="avgMax"
          yLower="avgMin"
          color={colors.categorical(1)[0]}
          opacity={0.15}
        />
        <ChartLine dataKey="avgMid" color={colors.categorical(1)[0]} dots />
        <ChartTooltip />
      </Chart>
    );
  },
};

/** Life expectancy by country × decade (gapminder.json) */
export const Heatmap: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Gapminder>('gapminder.json');
    const data = useMemo(() => {
      if (!raw.length) {
        return [];
      }
      const countries = [
        'United States',
        'China',
        'India',
        'Brazil',
        'Japan',
        'Germany',
        'Nigeria',
        'Russia',
      ];
      return raw
        .filter(
          d =>
            countries.includes(d.country) &&
            d.year >= 1960 &&
            d.year % 10 === 0,
        )
        .map(d => ({
          country: d.country,
          year: String(d.year),
          lifeExp: Math.round(d.life_expect),
        }));
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    return (
      <Chart data={data} xKey="year" yKeys={['lifeExp']} height={300}>
        <ChartAxis position="bottom" />
        <ChartHeatmapGL
          xKey="year"
          yKey="country"
          valueKey="lifeExp"
          colorRange={colors.sequential.blue(5)}
        />
        <ChartLegend
          gradient={colors.sequential.blue(5)}
          domain={[30, 85]}
          label="Life Expectancy"
        />
      </Chart>
    );
  },
};

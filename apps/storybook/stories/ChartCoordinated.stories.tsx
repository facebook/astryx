// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState, useMemo} from 'react';
import {
  Chart,
  ChartAxis,
  ChartGrid,
  ChartDot,
  ChartBar,
  ChartBrush,
  ChartReferenceLine,
  useChartColors,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {Heading} from '@xds/core/Text';
import {useDataset} from './useDataset';

const meta: Meta = {title: 'Lab/Chart Interactions/Coordinated Views'};
export default meta;

type Car = {
  Name: string;
  Miles_per_Gallon: number;
  Horsepower: number;
  Weight_in_lbs: number;
  Origin: string;
  Cylinders: number;
};

/** Brush on scatter filters bar chart + table — coordinated views */
export const CoordinatedViews: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const [brushRange, setBrushRange] = useState<[number, number] | null>(null);

    const allData = useMemo(
      () =>
        raw.filter(
          d =>
            d.Horsepower != null &&
            d.Miles_per_Gallon != null &&
            d.Origin != null,
        ),
      [raw],
    );

    const filteredData = useMemo(() => {
      if (!brushRange) {
        return allData;
      }
      return allData.filter(
        d => d.Horsepower >= brushRange[0] && d.Horsepower <= brushRange[1],
      );
    }, [allData, brushRange]);

    // Scatter data
    const scatterData = useMemo(
      () => allData.map(d => ({hp: d.Horsepower, mpg: d.Miles_per_Gallon})),
      [allData],
    );

    // Bar data — average MPG by origin, from filtered set
    const barData = useMemo(() => {
      const byOrigin = new Map<string, {sum: number; count: number}>();
      for (const d of filteredData) {
        const e = byOrigin.get(d.Origin) ?? {sum: 0, count: 0};
        e.sum += d.Miles_per_Gallon;
        e.count += 1;
        byOrigin.set(d.Origin, e);
      }
      return [...byOrigin.entries()]
        .map(([origin, {sum, count}]) => ({
          origin,
          avgMpg: Math.round((sum / count) * 10) / 10,
        }))
        .sort((a, b) => b.avgMpg - a.avgMpg);
    }, [filteredData]);

    // Table data — top 10 from filtered set
    const tableData = useMemo(
      () =>
        filteredData.slice(0, 10).map(d => ({
          name: d.Name,
          hp: d.Horsepower,
          mpg: d.Miles_per_Gallon,
          origin: d.Origin,
        })),
      [filteredData],
    );

    if (!allData.length) {
      return <Text type="supporting">Loading\u2026</Text>;
    }

    const c = colors.categorical(3);

    return (
      <Stack direction="vertical" gap={6}>
        <Heading level={3}>Coordinated Views</Heading>
        <Text type="supporting" color="secondary">
          Brush on the scatter to filter the bar chart and table below.
          {brushRange
            ? ` Showing ${filteredData.length} cars with ${Math.round(brushRange[0])}\u2013${Math.round(brushRange[1])} HP.`
            : ` Showing all ${allData.length} cars.`}
        </Text>

        {/* Scatter with brush */}
        <Stack direction="vertical" gap={1}>
          <Text type="label">Horsepower vs MPG</Text>
          <Chart
            data={scatterData}
            xKey="hp"
            yKeys={['mpg']}
            yBaseline="data"
            height={280}>
            <ChartGrid horizontal vertical />
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
            <ChartDot dataKey="mpg" color={c[0]} radius={3} />
            <ChartBrush
              onBrush={range => setBrushRange(range.x)}
              onClear={() => setBrushRange(null)}
            />
            {brushRange && (
              <>
                <ChartReferenceLine
                  x={brushRange[0]}
                  color={c[0]}
                  strokeDasharray="none"
                />
                <ChartReferenceLine
                  x={brushRange[1]}
                  color={c[0]}
                  strokeDasharray="none"
                />
              </>
            )}
          </Chart>
        </Stack>

        {/* Bar chart — reacts to brush */}
        <Stack direction="vertical" gap={1}>
          <Text type="label">Average MPG by Origin (filtered)</Text>
          <Chart
            data={barData}
            xKey="origin"
            yKeys={['avgMpg']}
            height={200}>
            <ChartGrid horizontal />
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
            <ChartBar dataKey="avgMpg" color={c[1]} />
          </Chart>
        </Stack>

        {/* Table — reacts to brush */}
        <Stack direction="vertical" gap={1}>
          <Text type="label">Top 10 cars (filtered)</Text>
          <div style={{fontSize: 12, overflow: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: 'left',
                  }}>
                  <th style={{padding: '4px 8px'}}>Name</th>
                  <th style={{padding: '4px 8px'}}>HP</th>
                  <th style={{padding: '4px 8px'}}>MPG</th>
                  <th style={{padding: '4px 8px'}}>Origin</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((d, i) => (
                  <tr
                    key={i}
                    style={{borderBottom: '1px solid var(--color-border)'}}>
                    <td style={{padding: '4px 8px'}}>{d.name}</td>
                    <td style={{padding: '4px 8px'}}>{d.hp}</td>
                    <td style={{padding: '4px 8px'}}>{d.mpg}</td>
                    <td style={{padding: '4px 8px'}}>{d.origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Stack>
      </Stack>
    );
  },
};

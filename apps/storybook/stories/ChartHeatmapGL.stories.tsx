// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartHeatmapGL,
  XDSChartLegend,
  useXDSChartColors,
  type SequentialHue,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {Heading} from '@xds/core/Text';

const meta: Meta = {title: 'Lab/ChartHeatmapGL'};
export default meta;

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = [
  '6am',
  '8am',
  '10am',
  '12pm',
  '2pm',
  '4pm',
  '6pm',
  '8pm',
  '10pm',
];
const gridData = days.flatMap((day, di) =>
  hours.map((hour, hi) => ({
    hour,
    day,
    activity: Math.round(
      Math.sin((di + hi) * 0.5) * 30 + 50 + Math.random() * 20,
    ),
  })),
);

function ActivityGridDemo() {
  const colors = useXDSChartColors();
  return (
    <Stack direction="vertical" gap={4}>
      <Heading level={3}>Heatmap \u2014 Activity by Day x Hour</Heading>
      <XDSChart data={gridData} xKey="hour" yKeys={['activity']} height={280}>
        <XDSChartAxis position="bottom" />
        <XDSChartHeatmapGL
          xKey="hour"
          yKey="day"
          valueKey="activity"
          colorRange={colors.sequential.blue(5)}
        />
        <XDSChartLegend
          gradient={colors.sequential.blue(5)}
          domain={[0, 100]}
          label="Activity"
        />
      </XDSChart>
    </Stack>
  );
}
export const ActivityGrid: StoryObj = {render: () => <ActivityGridDemo />};

function ColorRampsDemo() {
  const colors = useXDSChartColors();
  const hues: SequentialHue[] = ['blue', 'shamrock', 'orange', 'purple', 'red'];
  return (
    <Stack direction="vertical" gap={6}>
      <Heading level={3}>Heatmap Color Ramps</Heading>
      {hues.map(hue => (
        <Stack key={hue} direction="vertical" gap={1}>
          <Text type="label">sequential.{hue}(5)</Text>
          <XDSChart
            data={gridData}
            xKey="hour"
            yKeys={['activity']}
            height={200}>
            <XDSChartAxis position="bottom" />
            <XDSChartHeatmapGL
              xKey="hour"
              yKey="day"
              valueKey="activity"
              colorRange={colors.sequential[hue](5)}
            />
          </XDSChart>
        </Stack>
      ))}
    </Stack>
  );
}
export const ColorRamps: StoryObj = {render: () => <ColorRampsDemo />};

const bigRows = Array.from({length: 50}, (_, i) => String(i));
const bigCols = Array.from({length: 50}, (_, i) => String(i));
const bigGrid = bigRows.flatMap(row =>
  bigCols.map(col => ({
    col,
    row,
    value: Math.round(
      Math.sin(Number(row) * 0.2) * Math.cos(Number(col) * 0.15) * 50 + 50,
    ),
  })),
);

function LargeGridDemo() {
  const colors = useXDSChartColors();
  return (
    <Stack direction="vertical" gap={4}>
      <Heading level={3}>Heatmap \u2014 50x50 Grid</Heading>
      <XDSChart data={bigGrid} xKey="col" yKeys={['value']} height={400}>
        <XDSChartHeatmapGL
          xKey="col"
          yKey="row"
          valueKey="value"
          colorRange={colors.sequential.red(5)}
          cellGap={0}
        />
        <XDSChartLegend
          gradient={colors.sequential.red(5)}
          domain={[0, 100]}
          label="Intensity"
        />
      </XDSChart>
    </Stack>
  );
}
export const LargeGrid: StoryObj = {render: () => <LargeGridDemo />};

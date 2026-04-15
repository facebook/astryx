import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartHeatmapGL,
  XDSChartLegend,
  XDSChartColors,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDSChartHeatmapGL',
};

export default meta;

// Generate a proper 2D grid: days x hours
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

/** Activity heatmap \u2014 days x hours */
export const ActivityGrid: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Heatmap \u2014 Activity by Day x Hour</XDSHeading>
      <XDSChart data={gridData} xKey="hour" yKeys={['activity']} height={280}>
        <XDSChartAxis position="bottom" />
        <XDSChartHeatmapGL
          xKey="hour"
          yKey="day"
          valueKey="activity"
          colorRange={XDSChartColors.sequential.blue(5)}
        />
        <XDSChartLegend
          gradient={XDSChartColors.sequential.blue(5)}
          domain={[0, 100]}
          label="Activity"
        />
      </XDSChart>
    </XDSStack>
  ),
};

/** Multiple color ramps on the same grid */
export const ColorRamps: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={6}>
      <XDSHeading level={3}>Heatmap Color Ramps</XDSHeading>
      {(['blue', 'shamrock', 'orange', 'purple', 'red'] as const).map(hue => (
        <XDSStack key={hue} direction="vertical" gap={1}>
          <XDSText type="label">sequential.{hue}(5)</XDSText>
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
              colorRange={XDSChartColors.sequential[hue](5)}
            />
          </XDSChart>
        </XDSStack>
      ))}
    </XDSStack>
  ),
};

// Large grid: 50x50 = 2500 cells
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

/** Large 50x50 grid \u2014 2,500 cells */
export const LargeGrid: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Heatmap \u2014 50x50 Grid (2,500 cells)</XDSHeading>
      <XDSText type="supporting" color="secondary">
        2,500 cells rendered in a single WebGL draw call
      </XDSText>
      <XDSChart data={bigGrid} xKey="col" yKeys={['value']} height={400}>
        <XDSChartHeatmapGL
          xKey="col"
          yKey="row"
          valueKey="value"
          colorRange={XDSChartColors.sequential.red(5)}
          cellGap={0}
        />
        <XDSChartLegend
          gradient={XDSChartColors.sequential.red(5)}
          domain={[0, 100]}
          label="Intensity"
        />
      </XDSChart>
    </XDSStack>
  ),
};

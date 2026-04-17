import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartHeatmapGL,
  XDSChartLegend,
  useXDSChartColors,
  type SequentialHue,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {title: 'Lab/XDSChartHeatmapGL'};
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
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Heatmap \u2014 Activity by Day x Hour</XDSHeading>
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
    </XDSStack>
  );
}
export const ActivityGrid: StoryObj = {render: () => <ActivityGridDemo />};

function ColorRampsDemo() {
  const colors = useXDSChartColors();
  const hues: SequentialHue[] = ['blue', 'shamrock', 'orange', 'purple', 'red'];
  return (
    <XDSStack direction="vertical" gap={6}>
      <XDSHeading level={3}>Heatmap Color Ramps</XDSHeading>
      {hues.map(hue => (
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
              colorRange={colors.sequential[hue](5)}
            />
          </XDSChart>
        </XDSStack>
      ))}
    </XDSStack>
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
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Heatmap \u2014 50x50 Grid</XDSHeading>
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
    </XDSStack>
  );
}
export const LargeGrid: StoryObj = {render: () => <LargeGridDemo />};

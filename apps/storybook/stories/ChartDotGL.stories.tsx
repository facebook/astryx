import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartDot,
  XDSChartDotGL,
  XDSChartColors,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDSChartDotGL',
};

export default meta;

// Small dataset for visual comparison
const smallData = Array.from({length: 30}, (_, i) => ({
  x: i,
  y: Math.sin(i * 0.3) * 40 + 50 + Math.random() * 20,
}));

// Large dataset to show WebGL advantage
const largeData = Array.from({length: 5000}, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));

const colors = XDSChartColors.categorical(2);

/** Side-by-side comparison: SVG dots vs WebGL dots with the same data */
export const SVGvsWebGL: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={6}>
      <XDSHeading level={3}>SVG vs WebGL — 30 points</XDSHeading>
      <XDSStack direction="horizontal" gap={6}>
        <XDSStack direction="vertical" gap={1}>
          <XDSText type="label">SVG (XDSChartDot)</XDSText>
          <XDSChart data={smallData} xKey="x" yKeys={['y']} height={250}>
            <XDSChartGrid horizontal />
            <XDSChartAxis position="bottom" />
            <XDSChartAxis position="left" />
            <XDSChartDot dataKey="y" color={colors[0]} radius={4} />
          </XDSChart>
        </XDSStack>
        <XDSStack direction="vertical" gap={1}>
          <XDSText type="label">WebGL (XDSChartDotGL)</XDSText>
          <XDSChart data={smallData} xKey="x" yKeys={['y']} height={250}>
            <XDSChartGrid horizontal />
            <XDSChartAxis position="bottom" />
            <XDSChartAxis position="left" />
            <XDSChartDotGL dataKey="y" color={colors[0]} size={8} />
          </XDSChart>
        </XDSStack>
      </XDSStack>
    </XDSStack>
  ),
};

/** 5,000 points — WebGL handles this smoothly */
export const LargeDataset: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>WebGL — 5,000 points</XDSHeading>
      <XDSText type="supporting" color="secondary">
        5k random points rendered in a single WebGL draw call
      </XDSText>
      <XDSChart data={largeData} xKey="x" yKeys={['y']} height={400}>
        <XDSChartGrid horizontal vertical />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartDotGL dataKey="y" color={colors[0]} size={4} opacity={0.5} />
      </XDSChart>
    </XDSStack>
  ),
};

/** Mixed: WebGL scatter with SVG axes and grid */
export const MixedRenderers: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Mixed — WebGL dots + SVG axes</XDSHeading>
      <XDSChart data={largeData} xKey="x" yKeys={['y']} height={400}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartDotGL dataKey="y" color={colors[0]} size={5} opacity={0.4} />
        <XDSChartDotGL dataKey="y" color={colors[1]} size={3} opacity={0.6} />
      </XDSChart>
    </XDSStack>
  ),
};

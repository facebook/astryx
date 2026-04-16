import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartDot,
  XDSChartDotGL,
  useXDSChartColors,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {title: 'Lab/XDSChartDotGL'};
export default meta;

const smallData = Array.from({length: 30}, (_, i) => ({
  x: i,
  y: Math.sin(i * 0.3) * 40 + 50 + Math.random() * 20,
}));
const largeData = Array.from({length: 5000}, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));

function SVGvsWebGLDemo() {
  const colors = useXDSChartColors();
  const c = colors.categorical(2);
  return (
    <XDSStack direction="vertical" gap={6}>
      <XDSHeading level={3}>SVG vs WebGL</XDSHeading>
      <XDSStack direction="horizontal" gap={6}>
        <XDSStack direction="vertical" gap={1}>
          <XDSText type="label">SVG (XDSChartDot)</XDSText>
          <XDSChart data={smallData} xKey="x" yKeys={['y']} height={250}>
            <XDSChartGrid horizontal />
            <XDSChartAxis position="bottom" />
            <XDSChartAxis position="left" />
            <XDSChartDot dataKey="y" color={c[0]} radius={4} />
          </XDSChart>
        </XDSStack>
        <XDSStack direction="vertical" gap={1}>
          <XDSText type="label">WebGL (XDSChartDotGL)</XDSText>
          <XDSChart data={smallData} xKey="x" yKeys={['y']} height={250}>
            <XDSChartGrid horizontal />
            <XDSChartAxis position="bottom" />
            <XDSChartAxis position="left" />
            <XDSChartDotGL dataKey="y" color={c[0]} size={8} />
          </XDSChart>
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
export const SVGvsWebGL: StoryObj = {render: () => <SVGvsWebGLDemo />};

function LargeDatasetDemo() {
  const colors = useXDSChartColors();
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>WebGL \u2014 5,000 points</XDSHeading>
      <XDSChart data={largeData} xKey="x" yKeys={['y']} height={400}>
        <XDSChartGrid horizontal vertical />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartDotGL
          dataKey="y"
          color={colors.categorical(1)[0]}
          size={4}
          opacity={0.5}
        />
      </XDSChart>
    </XDSStack>
  );
}
export const LargeDataset: StoryObj = {render: () => <LargeDatasetDemo />};

// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartDot,
  XDSChartDotGL,
  useXDSChartColors,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {Heading} from '@xds/core/Text';

const meta: Meta = {title: 'Lab/ChartDotGL'};
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
    <Stack direction="vertical" gap={6}>
      <Heading level={3}>SVG vs WebGL</Heading>
      <Stack direction="horizontal" gap={6}>
        <Stack direction="vertical" gap={1}>
          <Text type="label">SVG (XDSChartDot)</Text>
          <XDSChart data={smallData} xKey="x" yKeys={['y']} height={250}>
            <XDSChartGrid horizontal />
            <XDSChartAxis position="bottom" />
            <XDSChartAxis position="left" />
            <XDSChartDot dataKey="y" color={c[0]} radius={4} />
          </XDSChart>
        </Stack>
        <Stack direction="vertical" gap={1}>
          <Text type="label">WebGL (XDSChartDotGL)</Text>
          <XDSChart data={smallData} xKey="x" yKeys={['y']} height={250}>
            <XDSChartGrid horizontal />
            <XDSChartAxis position="bottom" />
            <XDSChartAxis position="left" />
            <XDSChartDotGL dataKey="y" color={c[0]} size={8} />
          </XDSChart>
        </Stack>
      </Stack>
    </Stack>
  );
}
export const SVGvsWebGL: StoryObj = {render: () => <SVGvsWebGLDemo />};

function LargeDatasetDemo() {
  const colors = useXDSChartColors();
  return (
    <Stack direction="vertical" gap={4}>
      <Heading level={3}>WebGL \u2014 5,000 points</Heading>
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
    </Stack>
  );
}
export const LargeDataset: StoryObj = {render: () => <LargeDatasetDemo />};

// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  Chart,
  ChartAxis,
  ChartGrid,
  ChartDotGLInteractive,
  useChartColors,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {Heading} from '@xds/core/Text';

const meta: Meta = {title: 'Lab/ChartDotGLInteractive'};
export default meta;

const scatterData = Array.from({length: 5000}, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));
const bigScatter = Array.from({length: 50000}, (_, i) => ({
  x: Math.random() * 1000,
  y: Math.sin(i * 0.001) * 40 + Math.random() * 60,
}));

function GPUPicking5kDemo() {
  const colors = useChartColors();
  return (
    <Stack direction="vertical" gap={4}>
      <Heading level={3}>GPU Color-Picking \u2014 5,000 points</Heading>
      <Text type="supporting" color="secondary">
        Hover any point. O(1) via readPixels.
      </Text>
      <Chart data={scatterData} xKey="x" yKeys={['y']} height={400}>
        <ChartGrid horizontal vertical />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartDotGLInteractive
          dataKey="y"
          color={colors.categorical(1)[0]}
          size={6}
          opacity={0.6}
        />
      </Chart>
    </Stack>
  );
}
export const GPUPicking5k: StoryObj = {render: () => <GPUPicking5kDemo />};

function GPUPicking50kDemo() {
  const colors = useChartColors();
  return (
    <Stack direction="vertical" gap={4}>
      <Heading level={3}>GPU Color-Picking \u2014 50,000 points</Heading>
      <Chart data={bigScatter} xKey="x" yKeys={['y']} height={400}>
        <ChartGrid horizontal />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartDotGLInteractive
          dataKey="y"
          color={colors.categorical(2)[1]}
          size={3}
          opacity={0.4}
          renderTooltip={(d, i) => (
            <div style={{fontSize: 12}}>
              <div style={{fontWeight: 600}}>#{i.toLocaleString()}</div>
              <div>x: {Number(d.x).toFixed(1)}</div>
              <div>y: {Number(d.y).toFixed(1)}</div>
            </div>
          )}
        />
      </Chart>
    </Stack>
  );
}
export const GPUPicking50k: StoryObj = {render: () => <GPUPicking50kDemo />};

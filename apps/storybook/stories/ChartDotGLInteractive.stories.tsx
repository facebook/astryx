import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartDotGLInteractive,
  XDSChartColors,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDSChartDotGLInteractive',
};

export default meta;

const colors = XDSChartColors.categorical(3);

const scatterData = Array.from({length: 5000}, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));

/** Hover any of 5,000 points — GPU color-picking identifies the point in O(1) */
export const GPUPicking5k: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>GPU Color-Picking \u2014 5,000 points</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Hover any point. The pick buffer identifies it in O(1) via readPixels.
      </XDSText>
      <XDSChart data={scatterData} xKey="x" yKeys={['y']} height={400}>
        <XDSChartGrid horizontal vertical />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartDotGLInteractive
          dataKey="y"
          color={colors[0]}
          size={6}
          opacity={0.6}
        />
      </XDSChart>
    </XDSStack>
  ),
};

const bigScatter = Array.from({length: 50000}, (_, i) => ({
  x: Math.random() * 1000,
  y: Math.sin(i * 0.001) * 40 + Math.random() * 60,
}));

/** 50k points with custom tooltip */
export const GPUPicking50k: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>GPU Color-Picking \u2014 50,000 points</XDSHeading>
      <XDSText type="supporting" color="secondary">
        50k points. Hover is still instant via GPU readback.
      </XDSText>
      <XDSChart data={bigScatter} xKey="x" yKeys={['y']} height={400}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartDotGLInteractive
          dataKey="y"
          color={colors[1]}
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
      </XDSChart>
    </XDSStack>
  ),
};

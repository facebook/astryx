// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  ThreeDChart,
  ThreeDScatter,
  ThreeDBar,
  ThreeDGrid,
  ThreeDAxis,
  ThreeDSurface,
  useChartColors,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {Heading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/ThreeDChart',
  tags: ['autodocs'],
};

export default meta;

// Random 3D scatter data
const scatterData = Array.from({length: 200}, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 100,
}));

/** 3D scatter plot — drag to rotate */
export const Scatter3D: StoryObj = {
  render: () => {
    const colors = useChartColors();
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>3D Scatter Plot</Heading>
        <Text type="supporting" color="secondary">
          200 points. Drag to rotate. Depth encoded via size and opacity.
        </Text>
        <ThreeDChart
          data={scatterData}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive>
          <ThreeDGrid />
          <ThreeDAxis />
          <ThreeDScatter color={colors.categorical(1)[0]} radius={4} />
        </ThreeDChart>
      </Stack>
    );
  },
};

// 3D bar data — sales by product and region
const barData = [
  {product: 0, region: 0, sales: 42},
  {product: 1, region: 0, sales: 58},
  {product: 2, region: 0, sales: 35},
  {product: 0, region: 1, sales: 65},
  {product: 1, region: 1, sales: 48},
  {product: 2, region: 1, sales: 72},
  {product: 0, region: 2, sales: 30},
  {product: 1, region: 2, sales: 55},
  {product: 2, region: 2, sales: 40},
];

/** 3D bar chart — drag to rotate */
export const Bar3D: StoryObj = {
  render: () => {
    const colors = useChartColors();
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>3D Bar Chart</Heading>
        <Text type="supporting" color="secondary">
          Sales by product x region. Drag to rotate.
        </Text>
        <ThreeDChart
          data={barData}
          xKey="product"
          yKey="sales"
          zKey="region"
          height={400}
          interactive>
          <ThreeDGrid divisions={3} />
          <ThreeDAxis />
          <ThreeDBar
            color={colors.categorical(1)[0]}
            barWidth={0.12}
            barDepth={0.12}
          />
        </ThreeDChart>
      </Stack>
    );
  },
};

// Surface data — math function
const surfaceData: Record<string, unknown>[] = [];
for (let x = 0; x <= 20; x++) {
  for (let z = 0; z <= 20; z++) {
    const xn = x / 20,
      zn = z / 20;
    const y = Math.sin(xn * Math.PI * 2) * Math.cos(zn * Math.PI * 2) * 50 + 50;
    surfaceData.push({x, y: Math.round(y), z});
  }
}

/** 3D surface — height-colored mesh */
export const Surface3D: StoryObj = {
  render: () => {
    const colors = useChartColors();
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>3D Surface</Heading>
        <Text type="supporting" color="secondary">
          sin(x) * cos(z) surface. Drag to rotate. Color maps to height.
        </Text>
        <ThreeDChart
          data={surfaceData}
          xKey="x"
          yKey="y"
          zKey="z"
          height={450}
          interactive>
          <ThreeDGrid />
          <ThreeDAxis />
          <ThreeDSurface colorRange={colors.sequential.blue(5)} />
        </ThreeDChart>
      </Stack>
    );
  },
};

/** 3D surface wireframe */
export const Wireframe3D: StoryObj = {
  render: () => {
    const colors = useChartColors();
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>3D Wireframe</Heading>
        <ThreeDChart
          data={surfaceData}
          xKey="x"
          yKey="y"
          zKey="z"
          height={450}
          interactive>
          <ThreeDGrid />
          <ThreeDSurface colorRange={colors.sequential.teal(5)} wireframe />
        </ThreeDChart>
      </Stack>
    );
  },
};

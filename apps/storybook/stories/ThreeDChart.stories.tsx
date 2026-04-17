import type {Meta, StoryObj} from '@storybook/react';
import {
  XDS3DChart,
  XDS3DScatter,
  XDS3DBar,
  XDS3DGrid,
  XDS3DAxis,
  XDS3DSurface,
  XDSChartLegend,
  useXDSChartColors,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDS3DChart',
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
    const colors = useXDSChartColors();
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>3D Scatter Plot</XDSHeading>
        <XDSText type="supporting" color="secondary">
          200 points. Drag to rotate. Depth encoded via size and opacity.
        </XDSText>
        <XDS3DChart
          data={scatterData}
          xKey="x"
          yKey="y"
          zKey="z"
          height={400}
          interactive>
          <XDS3DGrid />
          <XDS3DAxis />
          <XDS3DScatter color={colors.categorical(1)[0]} radius={4} />
        </XDS3DChart>
      </XDSStack>
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
    const colors = useXDSChartColors();
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>3D Bar Chart</XDSHeading>
        <XDSText type="supporting" color="secondary">
          Sales by product x region. Drag to rotate.
        </XDSText>
        <XDS3DChart
          data={barData}
          xKey="product"
          yKey="sales"
          zKey="region"
          height={400}
          interactive>
          <XDS3DGrid divisions={3} />
          <XDS3DAxis />
          <XDS3DBar
            color={colors.categorical(1)[0]}
            barWidth={0.12}
            barDepth={0.12}
          />
        </XDS3DChart>
      </XDSStack>
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
    const colors = useXDSChartColors();
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>3D Surface</XDSHeading>
        <XDSText type="supporting" color="secondary">
          sin(x) * cos(z) surface. Drag to rotate. Color maps to height.
        </XDSText>
        <XDS3DChart
          data={surfaceData}
          xKey="x"
          yKey="y"
          zKey="z"
          height={450}
          interactive>
          <XDS3DGrid />
          <XDS3DAxis />
          <XDS3DSurface colorRange={colors.sequential.blue(5)} />
        </XDS3DChart>
      </XDSStack>
    );
  },
};

/** 3D surface wireframe */
export const Wireframe3D: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>3D Wireframe</XDSHeading>
        <XDS3DChart
          data={surfaceData}
          xKey="x"
          yKey="y"
          zKey="z"
          height={450}
          interactive>
          <XDS3DGrid />
          <XDS3DSurface colorRange={colors.sequential.teal(5)} wireframe />
        </XDS3DChart>
      </XDSStack>
    );
  },
};

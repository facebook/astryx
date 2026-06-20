// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ChartV2 as Chart, bar} from '@xds/lab';
import {
  ChartV2Grid as ChartGrid,
  ChartV2Axis as ChartAxis,
} from '@xds/lab';

interface AxesAndGridsArgs {
  /** Show horizontal grid lines */
  horizontalGrid: boolean;
  /** Show vertical grid lines */
  verticalGrid: boolean;
  /** Show the bottom (x) axis edge line */
  bottomAxisLine: boolean;
  /** Show the left (y) axis edge line */
  leftAxisLine: boolean;
  /** Show perpendicular tick marks on both axes */
  showTicks: boolean;
}

const meta: Meta<AxesAndGridsArgs> = {
  title: 'Lab/Chart v2/Primitives/Axes & Grids',
  argTypes: {
    horizontalGrid: {control: 'boolean'},
    verticalGrid: {control: 'boolean'},
    bottomAxisLine: {control: 'boolean'},
    leftAxisLine: {control: 'boolean'},
    showTicks: {control: 'boolean'},
  },
  args: {
    horizontalGrid: true,
    verticalGrid: false,
    bottomAxisLine: true,
    leftAxisLine: false,
    showTicks: false,
  },
};
export default meta;

const monthlyData = [
  {month: 'Jan', revenue: 45},
  {month: 'Feb', revenue: 52},
  {month: 'Mar', revenue: 48},
  {month: 'Apr', revenue: 61},
  {month: 'May', revenue: 55},
  {month: 'Jun', revenue: 70},
];

/**
 * Toggle grid lines, axis edge lines, and tick marks independently.
 *
 * - Grid lines use `--color-border-emphasized`; the y=0 / domain axis line
 *   uses `--color-icon-primary`.
 * - The bottom axis edge line is on by default; the left/top/right are off.
 * - When showing vertical grid lines, enable `leftAxisLine` so the grid
 *   has a clear left edge to anchor against.
 */
export const AxesAndGrids: StoryObj<AxesAndGridsArgs> = {
  name: 'Axes & Grids',
  render: args => (
    <Chart
      data={monthlyData}
      xKey="month"
      series={[bar('revenue', {color: '#3b82f6'})]}
      grid={
        <ChartGrid
          horizontal={args.horizontalGrid}
          vertical={args.verticalGrid}
        />
      }
      axes={
        <>
          <ChartAxis
            position="bottom"
            showAxisLine={args.bottomAxisLine}
            showTicks={args.showTicks}
          />
          <ChartAxis
            position="left"
            showAxisLine={args.leftAxisLine}
            showTicks={args.showTicks}
          />
        </>
      }
      height={300}
    />
  ),
};

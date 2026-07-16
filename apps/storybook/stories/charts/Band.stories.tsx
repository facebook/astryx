// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Chart, band, line, ChartGrid, ChartAxis} from '@astryxdesign/charts';
import {predictionData} from './_data';

const meta: Meta<typeof Chart> = {
  title: 'Charts/Band',
  component: Chart,
};
export default meta;

/** Confidence bands (80% + 95%) around a forecast line. */
export const ConfidenceBands: StoryObj = {
  render: () => (
    <Chart
      data={predictionData}
      xKey="x"
      title="Forecast with confidence bands"
      series={[
        band({
          upper: 'upper95',
          lower: 'lower95',
          color: '#3b82f6',
          opacity: 0.12,
        }),
        band({
          upper: 'upper80',
          lower: 'lower80',
          color: '#3b82f6',
          opacity: 0.22,
        }),
        line('mean', {color: '#3b82f6', strokeWidth: 2}),
      ]}
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>
      }
      height={320}
    />
  ),
};

// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useRef, useEffect, useState, type MutableRefObject} from 'react';
import {
  Chart,
  dotGL,
  dotGLInteractive,
  heatmapGL,
  streamGL,
  type StreamGLHandle,
  ChartGrid,
  ChartAxis,
} from '@astryxdesign/charts';
import {scatterData, heatmapData} from './_data';

const meta: Meta<typeof Chart> = {
  title: 'Charts/WebGL',
  component: Chart,
};
export default meta;

const axes = (
  <>
    <ChartAxis position="bottom" />
    <ChartAxis position="left" />
  </>
);

/**
 * Static, high-performance GPU scatter (`dotGL`) — one draw call, scales to
 * tens of thousands of points. Intentionally has NO hover/tooltip; for
 * interactivity see "Interactive scatter" below.
 */
export const Scatter: StoryObj = {
  name: 'Scatter — static (high-performance)',
  render: () => (
    <Chart
      data={scatterData}
      xKey="x"
      title="WebGL scatter — static (dotGL)"
      series={[dotGL('y', {color: '#3b82f6', size: 5})]}
      grid={<ChartGrid horizontal vertical />}
      axes={axes}
      height={400}
    />
  ),
};

/**
 * GPU scatter with color-picking hover (`dotGLInteractive`) — hover any point
 * for a highlight + tooltip. O(1) hit detection regardless of point count.
 */
export const InteractiveScatter: StoryObj = {
  name: 'Interactive scatter — hover + tooltip',
  render: () => (
    <Chart
      data={scatterData}
      xKey="x"
      title="WebGL scatter — interactive hover (dotGLInteractive)"
      series={[
        dotGLInteractive('y', {
          color: '#6b1efd',
          size: 6,
          renderTooltip: (d: Record<string, unknown>) => (
            <span>
              x: {Math.round(d.x as number)}, y: {Math.round(d.y as number)}
            </span>
          ),
        }),
      ]}
      grid={<ChartGrid horizontal vertical />}
      axes={axes}
      height={400}
    />
  ),
};

/** GPU heatmap — a 2D grid of colored cells (traffic by hour x day). */
export const Heatmap: StoryObj = {
  render: () => (
    <Chart
      data={heatmapData}
      xKey="hour"
      title="Traffic heatmap"
      series={[
        heatmapGL({
          xKey: 'hour',
          yKey: 'day',
          valueKey: 'traffic',
          colorRange: ['#eff6ff', '#1e40af'],
        }),
      ]}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" showAxisLine />
        </>
      }
      height={280}
    />
  ),
};

/** Streaming line via an imperative push handle + a sliding domain window. */
export const Streaming: StoryObj = {
  render: () => {
    const handleRef = useRef<StreamGLHandle | null>(
      null,
    ) as MutableRefObject<StreamGLHandle | null>;
    const WINDOW = 60;
    const [windowEnd, setWindowEnd] = useState(WINDOW);
    useEffect(() => {
      let t = 0;
      const interval = setInterval(() => {
        handleRef.current?.push(
          t,
          50 + Math.sin(t / 10) * 30 + Math.random() * 10,
        );
        t++;
        setWindowEnd(Math.max(WINDOW, t));
      }, 200);
      return () => clearInterval(interval);
    }, []);
    return (
      <Chart
        data={[]}
        xKey="x"
        title="Live stream (streamGL)"
        xDomain={[Math.max(0, windowEnd - WINDOW), windowEnd]}
        yDomain={[0, 100]}
        series={[streamGL({handleRef, color: '#3b82f6'})]}
        grid={<ChartGrid />}
        axes={axes}
        height={300}
      />
    );
  },
};

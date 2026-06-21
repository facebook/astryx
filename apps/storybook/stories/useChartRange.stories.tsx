// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useRef, useEffect} from 'react';
import {
  Chart,
  ChartAxis,
  ChartGrid,
  ChartStreamGL,
  useChartColors,
  useChartRange,
  type ChartStreamGLHandle,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {Heading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/useChartRange',
};

export default meta;

/** Known y-range — useChartRange just manages the sliding x window */
export const KnownRange: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const {xDomain, yDomain, push} = useChartRange({
      xWindow: 300,
      yDomain: [0, 100],
    });

    useEffect(() => {
      const id = setInterval(() => {
        tRef.current += 1;
        const y =
          Math.sin(tRef.current * 0.04) * 30 + 50 + (Math.random() - 0.5) * 10;
        push(tRef.current, y, streamRef);
      }, 33);
      return () => clearInterval(id);
    }, [push]);

    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Known Range (0-100%)</Heading>
        <Text type="supporting" color="secondary">
          yDomain fixed at [0, 100]. useChartRange manages xDomain sliding
          window.
        </Text>
        <Chart
          data={[]}
          xKey="t"
          yKeys={[]}
          xDomain={xDomain}
          yDomain={yDomain}
          height={200}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL
            handleRef={streamRef}
            color={colors.categorical(1)[0]}
            bufferSize={300}
            lineWidth={1.5}
          />
        </Chart>
      </Stack>
    );
  },
};

/** Unknown y-range — auto-tracks from data with 10% padding */
export const UnknownRange: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const {xDomain, yDomain, push} = useChartRange({
      xWindow: 300,
      yPadding: 0.1,
    });

    useEffect(() => {
      const id = setInterval(() => {
        tRef.current += 1;
        // Gradually increasing range to show auto-expansion
        const amplitude = 10 + tRef.current * 0.05;
        const y = Math.sin(tRef.current * 0.03) * amplitude + 50;
        push(tRef.current, y, streamRef);
      }, 33);
      return () => clearInterval(id);
    }, [push]);

    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Unknown Range (auto-tracks)</Heading>
        <Text type="supporting" color="secondary">
          No fixed yDomain. Range auto-expands as data reveals amplitude.
          Currently: [{yDomain[0].toFixed(1)}, {yDomain[1].toFixed(1)}]
        </Text>
        <Chart
          data={[]}
          xKey="t"
          yKeys={[]}
          xDomain={xDomain}
          yDomain={yDomain}
          height={200}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL
            handleRef={streamRef}
            color={colors.categorical(2)[1]}
            bufferSize={300}
            lineWidth={1.5}
          />
        </Chart>
      </Stack>
    );
  },
};

/** Zero-centered — seismograph pattern with yCenter */
export const ZeroCentered: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const quakeRef = useRef(0);
    const {xDomain, yDomain, push} = useChartRange({
      xWindow: 600,
      yCenter: true,
      yPadding: 0.05,
    });

    useEffect(() => {
      let raf: number;
      const tick = () => {
        tRef.current += 1;
        if (Math.random() < 0.003) {
          quakeRef.current = 30 + Math.random() * 50;
        }
        quakeRef.current *= 0.97;
        const tremor = (Math.random() - 0.5) * 2;
        const quake =
          quakeRef.current > 0.5
            ? Math.sin(tRef.current * 0.5) *
              quakeRef.current *
              (0.5 + Math.random() * 0.5)
            : 0;
        push(tRef.current, tremor + quake, streamRef);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [push]);

    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Zero-Centered (seismograph)</Heading>
        <Text type="supporting" color="secondary">
          yCenter=true keeps 0 at center. Range auto-expands on quake bursts.
          Currently: [{yDomain[0].toFixed(1)}, {yDomain[1].toFixed(1)}]
        </Text>
        <Chart
          data={[]}
          xKey="t"
          yKeys={[]}
          xDomain={xDomain}
          yDomain={yDomain}
          yBaseline="zero"
          height={220}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL
            handleRef={streamRef}
            color={colors.categorical(5)[3]}
            bufferSize={600}
            lineWidth={1}
            opacity={0.9}
          />
        </Chart>
      </Stack>
    );
  },
};

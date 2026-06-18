// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useRef, useEffect, useState} from 'react';
import {
  Chart,
  ChartAxis,
  ChartGrid,
  ChartStreamGL,
  useChartColors,
  type ChartStreamGLHandle,
} from '@xds/lab';
import {Stack, Text} from '@xds/core';
import {Heading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/ChartStreamPerf',
};

export default meta;

/**
 * Measures frame timing when xDomain updates on every push.
 * Shows: fps, render time per frame, and dropped frames.
 */
export const XDomainUpdateCost: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 300]);
    const [fps, setFps] = useState(0);
    const [renderMs, setRenderMs] = useState(0);
    const frameTimesRef = useRef<number[]>([]);
    const lastFrameRef = useRef(performance.now());

    useEffect(() => {
      let raf: number;
      const tick = () => {
        const now = performance.now();
        const dt = now - lastFrameRef.current;
        lastFrameRef.current = now;

        frameTimesRef.current.push(dt);
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }

        // Update stats every 30 frames
        if (tRef.current % 30 === 0 && frameTimesRef.current.length > 0) {
          const avg =
            frameTimesRef.current.reduce((a, b) => a + b, 0) /
            frameTimesRef.current.length;
          setFps(Math.round(1000 / avg));
          setRenderMs(Math.round(avg * 100) / 100);
        }

        tRef.current += 1;
        const y =
          Math.sin(tRef.current * 0.05) * 40 + 50 + (Math.random() - 0.5) * 10;
        streamRef.current?.push(tRef.current, y);

        {
          setXDomain([Math.max(0, tRef.current - 300), tRef.current]);
        }

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);

    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Performance: xDomain on every frame</Heading>
        <Stack direction="horizontal" gap={6}>
          <Text type="label">FPS: {fps}</Text>
          <Text type="label">Frame: {renderMs}ms</Text>
          <Text type="supporting" color="secondary">
            xDomain updates via setState on every requestAnimationFrame
          </Text>
        </Stack>
        <Chart
          data={[
            {t: 0, v: 0},
            {t: 1, v: 100},
          ]}
          xKey="t"
          yKeys={['v']}
          yDomain={[0, 100]}
          xDomain={xDomain}
          height={250}>
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

/**
 * Throttled xDomain — updates every 500ms instead of every frame.
 * Axis slides in steps; stream still renders every frame via WebGL.
 */
export const ThrottledXDomain: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 300]);
    const [fps, setFps] = useState(0);
    const [renderMs, setRenderMs] = useState(0);
    const frameTimesRef = useRef<number[]>([]);
    const lastFrameRef = useRef(performance.now());
    const lastDomainUpdateRef = useRef(0);

    useEffect(() => {
      let raf: number;
      const tick = () => {
        const now = performance.now();
        const dt = now - lastFrameRef.current;
        lastFrameRef.current = now;

        frameTimesRef.current.push(dt);
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }

        if (tRef.current % 30 === 0 && frameTimesRef.current.length > 0) {
          const avg =
            frameTimesRef.current.reduce((a, b) => a + b, 0) /
            frameTimesRef.current.length;
          setFps(Math.round(1000 / avg));
          setRenderMs(Math.round(avg * 100) / 100);
        }

        tRef.current += 1;
        const y =
          Math.sin(tRef.current * 0.05) * 40 + 50 + (Math.random() - 0.5) * 10;
        streamRef.current?.push(tRef.current, y);

        // Throttle xDomain updates to every 500ms
        if (now - lastDomainUpdateRef.current > 500) {
          setXDomain([Math.max(0, tRef.current - 300), tRef.current]);
          lastDomainUpdateRef.current = now;
        }

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);

    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>
          Performance: throttled xDomain (500ms)
        </Heading>
        <Stack direction="horizontal" gap={6}>
          <Text type="label">FPS: {fps}</Text>
          <Text type="label">Frame: {renderMs}ms</Text>
          <Text type="supporting" color="secondary">
            xDomain updates every 500ms; WebGL draws every frame
          </Text>
        </Stack>
        <Chart
          data={[
            {t: 0, v: 0},
            {t: 1, v: 100},
          ]}
          xKey="t"
          yKeys={['v']}
          yDomain={[0, 100]}
          xDomain={xDomain}
          height={250}>
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

/**
 * Stress test: 3 streams + both axes + grid, xDomain every frame.
 */
export const StressTest: StoryObj = {
  render: () => {
    const colors = useChartColors();
    const s1 = useRef<ChartStreamGLHandle>(null);
    const s2 = useRef<ChartStreamGLHandle>(null);
    const s3 = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 400]);
    const [fps, setFps] = useState(0);
    const frameTimesRef = useRef<number[]>([]);
    const lastFrameRef = useRef(performance.now());

    useEffect(() => {
      let raf: number;
      const tick = () => {
        const now = performance.now();
        const dt = now - lastFrameRef.current;
        lastFrameRef.current = now;
        frameTimesRef.current.push(dt);
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }
        if (tRef.current % 30 === 0 && frameTimesRef.current.length > 0) {
          const avg =
            frameTimesRef.current.reduce((a, b) => a + b, 0) /
            frameTimesRef.current.length;
          setFps(Math.round(1000 / avg));
        }

        tRef.current += 1;
        const t = tRef.current;
        const shared = Math.sin(t * 0.02) * 20;
        s1.current?.push(
          t,
          50 + shared + Math.sin(t * 0.07) * 10 + (Math.random() - 0.5) * 4,
        );
        s2.current?.push(
          t,
          50 +
            shared * 0.6 +
            Math.cos(t * 0.05) * 15 +
            (Math.random() - 0.5) * 6,
        );
        s3.current?.push(
          t,
          50 +
            shared * 0.3 +
            Math.sin(t * 0.11) * 8 +
            (Math.random() - 0.5) * 3,
        );

        setXDomain([Math.max(0, t - 400), t]);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);

    const c = colors.categorical(3);
    return (
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>
          Stress: 3 streams + axes + grid @ 60fps
        </Heading>
        <Text type="label">FPS: {fps}</Text>
        <Chart
          data={[
            {t: 0, v: 0},
            {t: 1, v: 100},
          ]}
          xKey="t"
          yKeys={['v']}
          yDomain={[0, 100]}
          xDomain={xDomain}
          height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL
            handleRef={s1}
            color={c[0]}
            bufferSize={400}
            lineWidth={1.5}
            opacity={0.8}
          />
          <ChartStreamGL
            handleRef={s2}
            color={c[1]}
            bufferSize={400}
            lineWidth={1.5}
            opacity={0.8}
          />
          <ChartStreamGL
            handleRef={s3}
            color={c[2]}
            bufferSize={400}
            lineWidth={1.5}
            opacity={0.8}
          />
        </Chart>
      </Stack>
    );
  },
};

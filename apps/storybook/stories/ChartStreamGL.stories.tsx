import type {Meta, StoryObj} from '@storybook/react';
import {useRef, useEffect, useState} from 'react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartStreamGL,
  useXDSChartColors,
  type XDSChartStreamGLHandle,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDSChartStreamGL',
};

export default meta;

// =============================================================================
// Simulated Stock Ticker
// =============================================================================

function StockTicker() {
  const colors = useXDSChartColors().categorical(5);
  const streamRef = useRef<XDSChartStreamGLHandle>(null);
  const priceRef = useRef(150);
  const tRef = useRef(0);
  const [price, setPrice] = useState(150);

  useEffect(() => {
    const mu = 0.0001;
    const sigma = 0.008;
    const id = setInterval(() => {
      tRef.current += 1;
      const z = (Math.random() + Math.random() + Math.random() - 1.5) * 2;
      const logReturn = mu - (sigma * sigma) / 2 + sigma * z;
      priceRef.current *= Math.exp(logReturn);
      if (Math.random() < 0.002) {
        priceRef.current *= 1 + (Math.random() - 0.5) * 0.03;
      }
      setPrice(priceRef.current);
      streamRef.current?.push(tRef.current, priceRef.current);
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSText type="label">ACME Corp</XDSText>
        <XDSText type="body">${price.toFixed(2)}</XDSText>
      </XDSStack>
      <XDSChart
        data={[
          {t: 0, v: 130},
          {t: 1, v: 170},
        ]}
        xKey="t"
        yKeys={['v']}
        yDomain={[130, 170]}
        yBaseline="data"
        height={200}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="left" />
        <XDSChartStreamGL
          ref={streamRef}
          color={colors[0]}
          bufferSize={400}
          lineWidth={1.5}
        />
      </XDSChart>
    </XDSStack>
  );
}

export const StockPrice: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Simulated Stock Ticker</XDSHeading>
      <XDSText type="supporting" color="secondary">
        GBM with drift and volatility. Y-axis locked to $130\u2013$170 via
        yDomain.
      </XDSText>
      <StockTicker />
    </XDSStack>
  ),
};

// =============================================================================
// Server Metrics — shared yDomain [0, 100] for all three
// =============================================================================

function useMetricStream(
  ref: React.RefObject<XDSChartStreamGLHandle | null>,
  config: {
    base: number;
    amplitude: number;
    frequency: number;
    noise: number;
    spikeProbability: number;
    spikeSize: number;
  },
) {
  const tRef = useRef(0);
  useEffect(() => {
    const {base, amplitude, frequency, noise, spikeProbability, spikeSize} =
      config;
    const id = setInterval(() => {
      tRef.current += 1;
      let value =
        base +
        Math.sin(tRef.current * frequency) * amplitude +
        Math.sin(tRef.current * frequency * 2.7) * amplitude * 0.3 +
        (Math.random() - 0.5) * noise;
      if (Math.random() < spikeProbability) {
        value += spikeSize * (0.5 + Math.random() * 0.5);
      }
      value = Math.max(0, Math.min(100, value));
      ref.current?.push(tRef.current, value);
    }, 33);
    return () => clearInterval(id);
  }, [ref, config]);
}

function ServerMetrics() {
  const colors = useXDSChartColors().categorical(5);
  const cpuRef = useRef<XDSChartStreamGLHandle>(null);
  const memRef = useRef<XDSChartStreamGLHandle>(null);
  const netRef = useRef<XDSChartStreamGLHandle>(null);

  useMetricStream(cpuRef, {
    base: 35,
    amplitude: 15,
    frequency: 0.04,
    noise: 8,
    spikeProbability: 0.01,
    spikeSize: 40,
  });
  useMetricStream(memRef, {
    base: 62,
    amplitude: 5,
    frequency: 0.008,
    noise: 2,
    spikeProbability: 0.005,
    spikeSize: 15,
  });
  useMetricStream(netRef, {
    base: 20,
    amplitude: 12,
    frequency: 0.06,
    noise: 10,
    spikeProbability: 0.02,
    spikeSize: 30,
  });

  const chartProps = {
    data: [
      {t: 0, v: 0},
      {t: 1, v: 100},
    ] as Record<string, unknown>[],
    xKey: 't',
    yKeys: ['v'] as string[],
    yDomain: [0, 100] as [number, number],
    height: 150,
  };

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="label">CPU Usage (%)</XDSText>
        <XDSChart {...chartProps}>
          <XDSChartGrid horizontal />
          <XDSChartAxis position="left" />
          <XDSChartStreamGL
            ref={cpuRef}
            color={colors[0]}
            bufferSize={300}
            lineWidth={1.5}
          />
        </XDSChart>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="label">Memory Usage (%)</XDSText>
        <XDSChart {...chartProps}>
          <XDSChartGrid horizontal />
          <XDSChartAxis position="left" />
          <XDSChartStreamGL
            ref={memRef}
            color={colors[1]}
            bufferSize={300}
            lineWidth={1.5}
          />
        </XDSChart>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="label">Network I/O (Mbps)</XDSText>
        <XDSChart {...chartProps}>
          <XDSChartGrid horizontal />
          <XDSChartAxis position="left" />
          <XDSChartStreamGL
            ref={netRef}
            color={colors[2]}
            bufferSize={300}
            lineWidth={1.5}
          />
        </XDSChart>
      </XDSStack>
    </XDSStack>
  );
}

export const ServerDashboard: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Server Metrics Dashboard</XDSHeading>
      <XDSText type="supporting" color="secondary">
        All three charts share yDomain=[0, 100]. Grid and axes stay locked.
      </XDSText>
      <ServerMetrics />
    </XDSStack>
  ),
};

// =============================================================================
// Seismograph — centered on 0
// =============================================================================

function Seismograph() {
  const colors = useXDSChartColors().categorical(5);
  const streamRef = useRef<XDSChartStreamGLHandle>(null);
  const tRef = useRef(0);
  const quakeRef = useRef(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      tRef.current += 1;
      if (Math.random() < 0.003) {
        quakeRef.current = 30 + Math.random() * 50;
      }
      quakeRef.current *= 0.97;
      const microTremor = (Math.random() - 0.5) * 2;
      const quakeSignal =
        quakeRef.current > 0.5
          ? Math.sin(tRef.current * 0.5) *
            quakeRef.current *
            (0.5 + Math.random() * 0.5)
          : 0;
      streamRef.current?.push(tRef.current, microTremor + quakeSignal);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <XDSChart
      data={[
        {t: 0, v: -80},
        {t: 1, v: 80},
      ]}
      xKey="t"
      yKeys={['v']}
      yDomain={[-80, 80]}
      yBaseline="zero"
      height={200}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="left" />
      <XDSChartStreamGL
        ref={streamRef}
        color={colors[3]}
        bufferSize={600}
        lineWidth={1}
        opacity={0.9}
      />
    </XDSChart>
  );
}

export const SeismographDemo: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Seismograph</XDSHeading>
      <XDSText type="supporting" color="secondary">
        yBaseline=&quot;zero&quot; anchors 0 to center. yDomain=[-80, 80] keeps
        axis stable.
      </XDSText>
      <Seismograph />
    </XDSStack>
  ),
};

// =============================================================================
// Multi-sensor overlay — same chart, same yDomain
// =============================================================================

function MultiSensor() {
  const colors = useXDSChartColors().categorical(5);
  const s1Ref = useRef<XDSChartStreamGLHandle>(null);
  const s2Ref = useRef<XDSChartStreamGLHandle>(null);
  const s3Ref = useRef<XDSChartStreamGLHandle>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tRef.current += 1;
      const t = tRef.current;
      const shared = Math.sin(t * 0.02) * 20;
      s1Ref.current?.push(
        t,
        50 + shared + Math.sin(t * 0.07) * 10 + (Math.random() - 0.5) * 4,
      );
      s2Ref.current?.push(
        t,
        50 + shared * 0.6 + Math.cos(t * 0.05) * 15 + (Math.random() - 0.5) * 6,
      );
      s3Ref.current?.push(
        t,
        50 + shared * 0.3 + Math.sin(t * 0.11) * 8 + (Math.random() - 0.5) * 3,
      );
    }, 33);
    return () => clearInterval(id);
  }, []);

  return (
    <XDSChart
      data={[
        {t: 0, v: 0},
        {t: 1, v: 100},
      ]}
      xKey="t"
      yKeys={['v']}
      yDomain={[0, 100]}
      height={250}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="left" />
      <XDSChartStreamGL
        ref={s1Ref}
        color={colors[0]}
        bufferSize={400}
        lineWidth={1.5}
        opacity={0.8}
      />
      <XDSChartStreamGL
        ref={s2Ref}
        color={colors[1]}
        bufferSize={400}
        lineWidth={1.5}
        opacity={0.8}
      />
      <XDSChartStreamGL
        ref={s3Ref}
        color={colors[2]}
        bufferSize={400}
        lineWidth={1.5}
        opacity={0.8}
      />
    </XDSChart>
  );
}

export const MultiSensorOverlay: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Multi-Sensor Overlay</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Three streams on one chart sharing yDomain=[0, 100]. Lines are properly
        comparable because they all map through the same yScale.
      </XDSText>
      <MultiSensor />
    </XDSStack>
  ),
};

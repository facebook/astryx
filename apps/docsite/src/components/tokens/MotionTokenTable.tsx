// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Table, pixel} from '@astryxdesign/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  durationTrack: {
    width: 40,
    height: 8,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-neutral)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  durationFill: {
    height: '100%',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-accent)',
  },
  easingTrack: {
    width: 40,
    height: 8,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-neutral)',
    position: 'relative' as const,
    overflow: 'visible',
    flexShrink: 0,
  },
  easingDot: {
    position: 'absolute' as const,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-accent)',
    transform: 'translateX(-50%)',
  },
});

function DurationBar({value}: {value: string}) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setAnimate(a => !a), 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div {...stylex.props(styles.durationTrack)}>
      <div
        {...stylex.props(styles.durationFill)}
        style={{
          width: animate ? '100%' : '0%',
          transition: `width ${value} ease`,
        }}
      />
    </div>
  );
}

function evaluateBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
): number {
  const cx = 3 * x1,
    bx = 3 * (x2 - x1) - cx,
    ax = 1 - cx - bx;
  const cy = 3 * y1,
    by = 3 * (y2 - y1) - cy,
    ay = 1 - cy - by;
  const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number) => ((ay * s + by) * s + cy) * s;
  const sampleXDeriv = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  let g = t;
  for (let i = 0; i < 8; i++) {
    const cur = sampleX(g) - t;
    if (Math.abs(cur) < 1e-6) {
      break;
    }
    const d = sampleXDeriv(g);
    if (Math.abs(d) < 1e-6) {
      break;
    }
    g -= cur / d;
  }
  return sampleY(Math.max(0, Math.min(1, g)));
}

function EasingCurve({value}: {value: string}) {
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const match = value.match(
    /cubic-bezier\(\s*([\d.]+)\s*,\s*([-\d.]+)\s*,\s*([\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );

  useEffect(() => {
    if (!match) {
      return;
    }
    let running = true;
    const duration = 1200,
      pause = 800,
      cycle = duration + pause;
    function tick(ts: number) {
      if (!running) {
        return;
      }
      if (!startRef.current) {
        startRef.current = ts;
      }
      const inCycle = (ts - startRef.current) % cycle;
      setProgress(inCycle < duration ? inCycle / duration : 1);
      if ((ts - startRef.current) % (cycle * 2) >= cycle * 2 - 16) {
        startRef.current = ts;
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [match]);

  if (!match) {
    return null;
  }
  const [, x1, y1, x2, y2] = match.map(Number);
  const easedY = evaluateBezier(x1, y1, x2, y2, progress);
  const pad = 0.12;

  return (
    <HStack gap={2} vAlign="center">
      <svg
        width={32}
        height={24}
        viewBox={`${-pad} ${-pad} ${1 + pad * 2} ${1 + pad * 2}`}
        style={{flexShrink: 0}}>
        <path
          d={`M 0 1 C ${x1} ${1 - y1}, ${x2} ${1 - y2}, 1 0`}
          fill="none"
          stroke="var(--color-neutral)"
          strokeWidth={0.04}
        />
        <path
          d={`M 0 1 C ${x1} ${1 - y1}, ${x2} ${1 - y2}, 1 0`}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={0.06}
          strokeDasharray="1"
          strokeDashoffset={1 - progress}
          pathLength={1}
        />
        <circle
          cx={progress}
          cy={1 - easedY}
          r={0.06}
          fill="var(--color-accent)"
        />
      </svg>
      <div {...stylex.props(styles.easingTrack)}>
        <div
          {...stylex.props(styles.easingDot)}
          style={{left: `${easedY * 100}%`}}
        />
      </div>
    </HStack>
  );
}

export function DurationTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--duration-');
  const data = tokens.map(name => ({
    tokenName: name,
    value: resolveToken(theme, name),
  }));

  return (
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(200)},
        {
          key: 'value',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <HStack gap={2} vAlign="center">
              <DurationBar value={item.value as string} />
              <Text type="code" color="secondary">
                {item.value as string}
              </Text>
            </HStack>
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
    />
  );
}

export function EasingTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--ease-');
  const data = tokens.map(name => ({
    tokenName: name,
    value: resolveToken(theme, name),
  }));

  return (
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(200)},
        {
          key: 'value',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <HStack gap={2} vAlign="center">
              <EasingCurve value={item.value as string} />
              <Text type="code" color="secondary">
                {item.value as string}
              </Text>
            </HStack>
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
    />
  );
}

export function MotionTokenTable({theme}: TokenTableProps) {
  return (
    <VStack gap={6}>
      <VStack gap={3}>
        <Heading level={3}>Duration</Heading>
        <DurationTokenTable theme={theme} />
      </VStack>
      <VStack gap={3}>
        <Heading level={3}>Easing</Heading>
        <EasingTokenTable theme={theme} />
      </VStack>
    </VStack>
  );
}

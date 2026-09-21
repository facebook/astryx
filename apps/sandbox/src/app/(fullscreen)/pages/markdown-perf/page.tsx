// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic Markdown fixtures and configurable streamed bursts
 * @output Interactive render/stream benchmark with paint and frame metrics
 * @position Fullscreen sandbox tool for validating Markdown performance and animation
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Markdown} from '@astryxdesign/core/Markdown';
import {Section} from '@astryxdesign/core/Section';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {generateMarkdownFixture, nextStreamOffset} from './benchmark';

type BenchmarkMode = 'complete' | 'streaming';

interface BenchmarkMetrics {
  firstPaintMs: number | null;
  completeMs: number | null;
  mutationBatches: number;
  frames: number;
  droppedFrames: number;
}

const EMPTY_METRICS: BenchmarkMetrics = {
  firstPaintMs: null,
  completeMs: null,
  mutationBatches: 0,
  frames: 0,
  droppedFrames: 0,
};

const SECTION_OPTIONS = ['10', '50', '200', '500'];
const BURST_OPTIONS = ['64', '256', '1024'];
const SETTLE_DELAY_MS = 180;
const BURST_INTERVAL_MS = 80;

function formatDuration(value: number | null): string {
  return value == null ? '—' : `${value.toFixed(1)} ms`;
}

export default function MarkdownPerfPage() {
  const [mode, setMode] = useState<BenchmarkMode>('streaming');
  const [sectionCount, setSectionCount] = useState('50');
  const [burstSize, setBurstSize] = useState('256');
  const [renderedSource, setRenderedSource] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [metrics, setMetrics] = useState<BenchmarkMetrics>(EMPTY_METRICS);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const firstPaintRef = useRef<number | null>(null);
  const mutationBatchesRef = useRef(0);
  const producerDoneRef = useRef(false);
  const runningRef = useRef(false);
  const frameRef = useRef({id: 0, frames: 0, dropped: 0, previous: 0});
  const feedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetFrameRef = useRef<number | null>(null);

  const fixture = useMemo(
    () => generateMarkdownFixture(Number(sectionCount)),
    [sectionCount],
  );

  const stopTimers = useCallback(() => {
    if (feedTimerRef.current != null) {
      clearTimeout(feedTimerRef.current);
      feedTimerRef.current = null;
    }
    if (settleTimerRef.current != null) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    if (resetFrameRef.current != null) {
      cancelAnimationFrame(resetFrameRef.current);
      resetFrameRef.current = null;
    }
    cancelAnimationFrame(frameRef.current.id);
  }, []);

  const finish = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    runningRef.current = false;
    setIsRunning(false);
    cancelAnimationFrame(frameRef.current.id);
    setMetrics({
      firstPaintMs: firstPaintRef.current,
      completeMs: performance.now() - startTimeRef.current,
      mutationBatches: mutationBatchesRef.current,
      frames: frameRef.current.frames,
      droppedFrames: frameRef.current.dropped,
    });
  }, []);

  const scheduleFinish = useCallback(() => {
    if (!producerDoneRef.current || !runningRef.current) {
      return;
    }
    if (settleTimerRef.current != null) {
      clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = setTimeout(finish, SETTLE_DELAY_MS);
  }, [finish]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (surface == null) {
      return;
    }
    const observer = new MutationObserver(() => {
      if (!runningRef.current) {
        return;
      }
      mutationBatchesRef.current += 1;
      firstPaintRef.current ??= performance.now() - startTimeRef.current;
      setMetrics(current => ({
        ...current,
        firstPaintMs: firstPaintRef.current,
        mutationBatches: mutationBatchesRef.current,
      }));
      scheduleFinish();
    });
    observer.observe(surface, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [scheduleFinish]);

  useEffect(() => stopTimers, [stopTimers]);

  const startFrameMeasurement = useCallback(() => {
    const frameState = frameRef.current;
    frameState.frames = 0;
    frameState.dropped = 0;
    frameState.previous = performance.now();

    const measureFrame = (now: number) => {
      if (!runningRef.current) {
        return;
      }
      frameState.frames += 1;
      if (now - frameState.previous > 20) {
        frameState.dropped += 1;
      }
      frameState.previous = now;
      frameState.id = requestAnimationFrame(measureFrame);
    };
    frameState.id = requestAnimationFrame(measureFrame);
  }, []);

  const startBenchmark = useCallback(() => {
    stopTimers();
    runningRef.current = false;
    setIsRunning(false);
    setIsStreaming(mode === 'streaming');
    setRenderedSource('');
    setRunKey(value => value + 1);
    setMetrics(EMPTY_METRICS);

    resetFrameRef.current = requestAnimationFrame(() => {
      resetFrameRef.current = requestAnimationFrame(() => {
        startTimeRef.current = performance.now();
        firstPaintRef.current = null;
        mutationBatchesRef.current = 0;
        producerDoneRef.current = false;
        runningRef.current = true;
        setIsRunning(true);
        startFrameMeasurement();

        if (mode === 'complete') {
          producerDoneRef.current = true;
          setIsStreaming(false);
          setRenderedSource(fixture);
          scheduleFinish();
          return;
        }

        let offset = 0;
        const feed = () => {
          offset = nextStreamOffset(fixture.length, offset, Number(burstSize));
          setRenderedSource(fixture.slice(0, offset));
          if (offset < fixture.length) {
            feedTimerRef.current = setTimeout(feed, BURST_INTERVAL_MS);
            return;
          }
          producerDoneRef.current = true;
          setIsStreaming(false);
          scheduleFinish();
        };
        feed();
      });
    });
  }, [
    burstSize,
    fixture,
    mode,
    scheduleFinish,
    startFrameMeasurement,
    stopTimers,
  ]);

  const stopBenchmark = useCallback(() => {
    stopTimers();
    runningRef.current = false;
    setIsRunning(false);
    setIsStreaming(false);
  }, [stopTimers]);

  const progress =
    fixture.length === 0
      ? 0
      : Math.round((renderedSource.length / fixture.length) * 100);

  return (
    <AppShell contentPadding={4} height="fill">
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Markdown Performance</Heading>
          <Text type="body" color="secondary">
            Compare a complete render with bursty streamed input while observing
            first paint, total completion, DOM mutation batches, and dropped
            animation frames.
          </Text>
        </VStack>

        <Section variant="muted" padding={3} dividers={['bottom']}>
          <HStack gap={4} vAlign="center" wrap="wrap">
            <SegmentedControl
              label="Render mode"
              value={mode}
              onChange={value => setMode(value as BenchmarkMode)}
              size="sm">
              <SegmentedControlItem value="complete" label="Complete" />
              <SegmentedControlItem value="streaming" label="Streaming" />
            </SegmentedControl>
            <SegmentedControl
              label="Section count"
              value={sectionCount}
              onChange={setSectionCount}
              size="sm">
              {SECTION_OPTIONS.map(value => (
                <SegmentedControlItem key={value} value={value} label={value} />
              ))}
            </SegmentedControl>
            <SegmentedControl
              label="Burst size"
              value={burstSize}
              onChange={setBurstSize}
              isDisabled={mode !== 'streaming'}
              disabledMessage="Burst size applies only to streaming runs."
              size="sm">
              {BURST_OPTIONS.map(value => (
                <SegmentedControlItem
                  key={value}
                  value={value}
                  label={`${value} chars`}
                />
              ))}
            </SegmentedControl>
            <Button
              label={isRunning ? 'Restart benchmark' : 'Run benchmark'}
              onClick={startBenchmark}
            />
            <Button
              label="Stop"
              variant="secondary"
              onClick={stopBenchmark}
              isDisabled={!isRunning}
            />
          </HStack>
        </Section>

        <Grid columns={2} gap={4}>
          <Card padding={3}>
            <VStack gap={3}>
              <Heading level={3}>Run metrics</Heading>
              <HStack gap={2} wrap="wrap">
                <Badge
                  label={mode === 'streaming' ? 'Streaming' : 'Complete'}
                />
                <Badge
                  label={`${Number(sectionCount).toLocaleString()} sections`}
                />
                <Badge
                  label={`${fixture.length.toLocaleString()} characters`}
                />
                <Badge label={`${progress}% received`} />
              </HStack>
              <Grid columns={2} gap={3}>
                <VStack gap={0.5}>
                  <Text type="label">First paint</Text>
                  <Text type="code">
                    {formatDuration(metrics.firstPaintMs)}
                  </Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text type="label">Complete</Text>
                  <Text type="code">{formatDuration(metrics.completeMs)}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text type="label">DOM mutation batches</Text>
                  <Text type="code">{metrics.mutationBatches}</Text>
                </VStack>
                <VStack gap={0.5}>
                  <Text type="label">Frames / drops</Text>
                  <Text type="code">
                    {metrics.frames} / {metrics.droppedFrames}
                  </Text>
                </VStack>
              </Grid>
              <Text type="body" color="secondary">
                A dropped frame is a measured animation-frame gap over 20 ms.
                Completion waits for the rendered subtree to stay unchanged for
                180 ms after the final source burst.
              </Text>
            </VStack>
          </Card>

          <Card ref={surfaceRef} height={560} padding={4}>
            <Markdown key={runKey} isStreaming={isStreaming} contentWidth={760}>
              {renderedSource}
            </Markdown>
          </Card>
        </Grid>
      </VStack>
    </AppShell>
  );
}

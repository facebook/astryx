// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input A long list of rows (1k, 5k or 10k; every row rendered, or only
 *   the visible window) with a Collapsible in the middle that takes the
 *   list's `useAnimatedLayout` handle
 * @output Run metrics for expanding and collapsing that middle item: the
 *   commit and layout walk until the glide starts, rectangles read, elements
 *   animated, long tasks, frames and drops, and time to the first frame,
 *   each with its change from a saved baseline
 * @position Fullscreen sandbox tool, beside Markdown Perf and DiffViewer
 *   Perf, for measuring `useAnimatedLayout` at scale
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Grid} from '@astryxdesign/core/Grid';
import {useAnimatedLayout} from '@astryxdesign/core/hooks';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Section} from '@astryxdesign/core/Section';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

type Rendering = 'full' | 'virtualized';

interface RunMetrics {
  /** From the change to the glide starting: React's commit and the walk. */
  walkMs: number | null;
  rectsRead: number | null;
  animated: number | null;
  longTasks: number | null;
  longTaskMs: number | null;
  frames: number | null;
  droppedFrames: number | null;
  firstFrameMs: number | null;
}

const EMPTY_METRICS: RunMetrics = {
  walkMs: null,
  rectsRead: null,
  animated: null,
  longTasks: null,
  longTaskMs: null,
  frames: null,
  droppedFrames: null,
  firstFrameMs: null,
};

const ROW_OPTIONS = ['1000', '5000', '10000'];
const ROW_HEIGHT = 36;
const VIEWPORT_HEIGHT = 560;
/** Rows rendered past each edge of the visible window when virtualized. */
const OVERSCAN = 8;
/** Expand and collapse, three times each, for one run. */
const TOGGLES = 6;
/** Long enough for the glide (springs.settle) to finish between toggles. */
const SETTLE_MS = 900;

const styles = stylex.create({
  row: {
    height: ROW_HEIGHT,
    paddingInline: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    boxSizing: 'border-box',
  },
  middle: {
    paddingInline: 12,
    paddingBlock: 4,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
  },
  spacer: (height: number) => ({height}),
});

function formatMs(value: number | null): string {
  return value == null ? '—' : `${value.toFixed(1)} ms`;
}

function formatCount(value: number | null): string {
  return value == null ? '—' : value.toLocaleString();
}

/** A value's change from its baseline, as the other perf pages show it. */
function formatChange(value: number | null, base: number | null): string {
  if (value == null || base == null) {
    return 'no baseline';
  }
  if (base === 0) {
    return value === 0 ? '±0%' : 'new';
  }
  const change = ((value - base) / base) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
}

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
}

const nextFrame = async (): Promise<number> =>
  new Promise(resolve => {
    requestAnimationFrame(resolve);
  });

const wait = async (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export default function AnimatedLayoutPerfPage() {
  const [rowCount, setRowCount] = useState('5000');
  const [rendering, setRendering] = useState<Rendering>('full');
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<RunMetrics>(EMPTY_METRICS);
  const [baselines, setBaselines] = useState<Record<string, RunMetrics>>({});
  const [scrollTop, setScrollTop] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const animatedLayout = useAnimatedLayout({containerRef: viewportRef});
  const runningRef = useRef(false);

  const count = Number(rowCount);
  const middle = Math.floor(count / 2);
  const key = `${rowCount}:${rendering}`;
  const baseline = baselines[key];

  // Virtualized: only the rows in (and just around) the viewport render; the
  // middle item always renders, so the change always happens in the DOM.
  const windowRange = useMemo(() => {
    if (rendering === 'full') {
      return {start: 0, end: count};
    }
    const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visible = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;
    return {start: first, end: Math.min(count, first + visible)};
  }, [count, rendering, scrollTop]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport == null || rendering === 'full') {
      return undefined;
    }
    const onScroll = () => setScrollTop(viewport.scrollTop);
    viewport.addEventListener('scroll', onScroll, {passive: true});
    return () => viewport.removeEventListener('scroll', onScroll);
  }, [rendering]);

  useEffect(() => {
    if (!runningRef.current) {
      setMetrics(EMPTY_METRICS);
    }
  }, [key]);

  const run = useCallback(async () => {
    const viewport = viewportRef.current;
    if (viewport == null || runningRef.current) {
      return;
    }
    runningRef.current = true;
    setIsRunning(true);
    setMetrics(EMPTY_METRICS);
    flushSync(() => setIsOpen(false));
    // The middle item, centered in the viewport.
    viewport.scrollTop = Math.max(
      0,
      middle * ROW_HEIGHT - VIEWPORT_HEIGHT / 2 + ROW_HEIGHT,
    );
    setScrollTop(viewport.scrollTop);
    await wait(SETTLE_MS);

    // Instrumentation, for this run only: every rectangle read on the page,
    // long tasks, and animation frames.
    const prototype = Element.prototype;
    const original = prototype.getBoundingClientRect;
    let rects = 0;
    prototype.getBoundingClientRect = function getBoundingClientRect(
      this: Element,
    ) {
      rects += 1;
      return original.call(this);
    };
    let longTasks = 0;
    let longTaskMs = 0;
    const observer =
      typeof PerformanceObserver !== 'undefined' &&
      PerformanceObserver.supportedEntryTypes?.includes('longtask')
        ? new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              longTasks += 1;
              longTaskMs += entry.duration;
            }
          })
        : null;
    observer?.observe({type: 'longtask', buffered: false});
    let frames = 0;
    let dropped = 0;
    let previous = performance.now();
    let frameId: number;
    const onFrame = (now: number) => {
      frames += 1;
      if (now - previous > 20) {
        dropped += 1;
      }
      previous = now;
      frameId = requestAnimationFrame(onFrame);
    };
    frameId = requestAnimationFrame(onFrame);

    const walks: number[] = [];
    const reads: number[] = [];
    const animations: number[] = [];
    const firstFrames: number[] = [];
    try {
      for (let i = 0; i < TOGGLES && runningRef.current; i++) {
        rects = 0;
        const start = performance.now();
        flushSync(() => setIsOpen(open => !open));
        // The layout walk runs in a microtask after the commit.
        await Promise.resolve();
        await Promise.resolve();
        walks.push(performance.now() - start);
        reads.push(rects);
        animations.push(
          viewport
            .getAnimations({subtree: true})
            .filter(animation =>
              (animation.effect as KeyframeEffect | null)
                ?.getKeyframes()
                .some(frame => 'translate' in frame),
            ).length,
        );
        await nextFrame();
        firstFrames.push(performance.now() - start);
        await wait(SETTLE_MS);
      }
    } finally {
      prototype.getBoundingClientRect = original;
      observer?.disconnect();
      cancelAnimationFrame(frameId);
    }
    const next: RunMetrics = {
      walkMs: median(walks),
      rectsRead: median(reads),
      animated: median(animations),
      longTasks,
      longTaskMs,
      frames,
      droppedFrames: dropped,
      firstFrameMs: median(firstFrames),
    };
    setMetrics(next);
    runningRef.current = false;
    setIsRunning(false);
  }, [middle]);

  const stop = useCallback(() => {
    runningRef.current = false;
  }, []);

  const saveBaseline = useCallback(() => {
    setBaselines(current => ({...current, [key]: metrics}));
  }, [key, metrics]);

  const rows = [];
  for (let i = windowRange.start; i < windowRange.end; i++) {
    if (i === middle) {
      rows.push(
        <VStack key={i} xstyle={styles.middle}>
          <Collapsible
            trigger={`Row ${i + 1}: the middle item`}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            animatedLayout={animatedLayout}>
            <VStack gap={1}>
              <Text type="supporting">
                Expanding this item glides every row after it in the list.
              </Text>
              <Text type="supporting">
                The walk visits the rows after it, at each level up to the list,
                and moves only those whose rectangle changed and that are in
                view.
              </Text>
              <Text type="supporting">
                Closing it plays its exit while the rows below glide up.
              </Text>
            </VStack>
          </Collapsible>
        </VStack>,
      );
      continue;
    }
    rows.push(
      <HStack key={i} vAlign="center" xstyle={styles.row}>
        <Text type="supporting">Row {i + 1}</Text>
      </HStack>,
    );
  }

  return (
    <AppShell contentPadding={4} height="fill">
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Animated Layout Performance</Heading>
          <Text type="body" color="secondary">
            Expand and collapse an item in the middle of a long list through
            useAnimatedLayout, and measure the layout walk, the rectangles it
            reads, the elements it animates, long tasks and dropped frames.
          </Text>
        </VStack>

        <Section variant="muted" padding={3} dividers={['bottom']}>
          <HStack gap={4} vAlign="center" wrap="wrap">
            <SegmentedControl
              label="Rows"
              value={rowCount}
              onChange={setRowCount}
              isDisabled={isRunning}
              disabledMessage="Stop the active run before changing the list."
              size="sm">
              {ROW_OPTIONS.map(value => (
                <SegmentedControlItem
                  key={value}
                  value={value}
                  label={Number(value).toLocaleString()}
                />
              ))}
            </SegmentedControl>
            <SegmentedControl
              label="Rendering"
              value={rendering}
              onChange={value => setRendering(value as Rendering)}
              isDisabled={isRunning}
              disabledMessage="Stop the active run before changing rendering."
              size="sm">
              <SegmentedControlItem value="full" label="Every row" />
              <SegmentedControlItem value="virtualized" label="Virtualized" />
            </SegmentedControl>
            <Button
              label={isRunning ? 'Running…' : 'Run benchmark'}
              onClick={() => {
                void run();
              }}
              isDisabled={isRunning}
            />
            <Button
              label="Stop"
              variant="secondary"
              onClick={stop}
              isDisabled={!isRunning}
            />
            <Button
              label="Save as baseline"
              variant="secondary"
              onClick={saveBaseline}
              isDisabled={isRunning || metrics.walkMs == null}
            />
          </HStack>
        </Section>

        <Grid columns={{minWidth: 360, max: 2}} gap={4}>
          <Card padding={3}>
            <VStack gap={3}>
              <Heading level={3}>Run metrics</Heading>
              <HStack gap={2} wrap="wrap">
                <Badge label={`${count.toLocaleString()} rows`} />
                <Badge
                  label={rendering === 'full' ? 'Every row' : 'Virtualized'}
                />
                <Badge label={`${TOGGLES} toggles`} />
              </HStack>
              <Grid columns={2} gap={3}>
                {(
                  [
                    ['Commit + walk', formatMs, 'walkMs'],
                    ['Rectangles read', formatCount, 'rectsRead'],
                    ['Elements animated', formatCount, 'animated'],
                    ['Time to first frame', formatMs, 'firstFrameMs'],
                    ['Long tasks', formatCount, 'longTasks'],
                    ['Long task time', formatMs, 'longTaskMs'],
                    ['Frames', formatCount, 'frames'],
                    ['Dropped frames', formatCount, 'droppedFrames'],
                  ] as const
                ).map(([label, format, field]) => (
                  <VStack key={field} gap={0.5}>
                    <Text type="label">{label}</Text>
                    <Text type="code">
                      {format(metrics[field])} ·{' '}
                      {formatChange(metrics[field], baseline?.[field] ?? null)}
                    </Text>
                  </VStack>
                ))}
              </Grid>
              <Text type="body" color="secondary">
                Commit + walk, rectangles read, elements animated and time to
                first frame are medians over the run&apos;s toggles; the rest
                are totals for the run. Commit + walk runs from the change to
                the glide starting: React&apos;s commit of the item, then the
                walk and its reads. A dropped frame is a measured animation
                frame gap over 20 ms. Save a baseline, change the build or the
                CPU throttle in DevTools, and run again to compare.
              </Text>
            </VStack>
          </Card>

          <Card padding={0}>
            <ScrollableArea
              ref={viewportRef}
              height={VIEWPORT_HEIGHT}
              label="Long list">
              <VStack>
                {rendering === 'virtualized' && (
                  <VStack
                    xstyle={styles.spacer(windowRange.start * ROW_HEIGHT)}
                  />
                )}
                {rows}
                {rendering === 'virtualized' && (
                  <VStack
                    xstyle={styles.spacer(
                      (count - windowRange.end) * ROW_HEIGHT,
                    )}
                  />
                )}
              </VStack>
            </ScrollableArea>
          </Card>
        </Grid>
      </VStack>
    </AppShell>
  );
}

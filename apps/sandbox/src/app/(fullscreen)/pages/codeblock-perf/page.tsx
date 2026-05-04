'use client';

import * as React from 'react';
import {useState, useCallback, useRef, useLayoutEffect} from 'react';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSHStack, XDSVStack} from '@xds/core/Stack';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

function generateCode(lines: number): string {
  const parts: string[] = [
    "import {useState, useEffect, useCallback, useMemo, useRef} from 'react';",
    "import type {ReactNode, CSSProperties} from 'react';",
    '',
    '// Auto-generated stress test code',
    `// ${lines} lines of TypeScript`,
    '',
  ];

  for (let i = 0; i < lines - 6; i++) {
    const mod = i % 12;
    switch (mod) {
      case 0:
        parts.push(`interface Model${i} {`);
        break;
      case 1:
        parts.push(`  id: string;`);
        break;
      case 2:
        parts.push(`  value: number;`);
        break;
      case 3:
        parts.push(`}`);
        break;
      case 4:
        parts.push('');
        break;
      case 5:
        parts.push(
          `async function fetch${i}(url: string): Promise<Model${i - 5}> {`,
        );
        break;
      case 6:
        parts.push(`  const response = await fetch(url);`);
        break;
      case 7:
        parts.push(
          `  if (!response.ok) throw new Error("HTTP " + response.status);`,
        );
        break;
      case 8:
        parts.push(`  return response.json(); // line ${i}`);
        break;
      case 9:
        parts.push(`}`);
        break;
      case 10:
        parts.push('');
        break;
      case 11:
        parts.push(`// Section ${Math.floor(i / 12) + 1}`);
        break;
    }
  }
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Perf measurement
// ---------------------------------------------------------------------------

interface PerfMetrics {
  mountMs: number | null;
  renderCount: number;
  lastRenderMs: number | null;
  scrollFps: number | null;
  scrollFrameDrops: number;
}

function usePerfMetrics() {
  const [metrics, setMetrics] = useState<PerfMetrics>({
    mountMs: null,
    renderCount: 0,
    lastRenderMs: null,
    scrollFps: null,
    scrollFrameDrops: 0,
  });

  const renderCount = useRef(0);

  renderCount.current += 1;

  useLayoutEffect(() => {
    // Stamp after React commits our DOM — any prior-panel unmount has
    // already happened, so this is a clean baseline.
    const commitTime = performance.now();
    requestAnimationFrame(() => {
      const paintTime = performance.now();
      setMetrics({
        mountMs: paintTime - commitTime,
        renderCount: renderCount.current,
        lastRenderMs: paintTime - commitTime,
        scrollFps: null,
        scrollFrameDrops: 0,
      });
    });
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollState = useRef({
    frames: 0,
    drops: 0,
    startTime: 0,
    rafId: 0,
    measuring: false,
    lastFrameTime: 0,
  });

  const runScrollTest = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollContainer =
      el.querySelector<HTMLElement>('[style*="max-height"]') ??
      el.querySelector<HTMLElement>('pre');
    if (!scrollContainer) return;

    scrollContainer.scrollTop = 0;
    const s = scrollState.current;
    s.frames = 0;
    s.drops = 0;
    s.startTime = performance.now();
    s.measuring = true;
    s.lastFrameTime = performance.now();

    function tick() {
      if (!s.measuring) return;
      const now = performance.now();
      s.frames++;
      if (now - s.lastFrameTime > 20) s.drops++;
      s.lastFrameTime = now;
      s.rafId = requestAnimationFrame(tick);
    }
    s.rafId = requestAnimationFrame(tick);

    const totalScroll =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const duration = 2000;
    const start = performance.now();

    function step() {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      scrollContainer!.scrollTop = totalScroll * eased;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        requestAnimationFrame(() => {
          s.measuring = false;
          cancelAnimationFrame(s.rafId);
          const totalElapsed = performance.now() - s.startTime;
          if (totalElapsed > 0 && s.frames > 0) {
            const fps = Math.round((s.frames / totalElapsed) * 1000);
            setMetrics(m => ({
              ...m,
              scrollFps: fps,
              scrollFrameDrops: s.drops,
            }));
          }
        });
      }
    }
    requestAnimationFrame(step);
  }, []);

  return {metrics, scrollRef, runScrollTest};
}

// ---------------------------------------------------------------------------
// Metrics display
// ---------------------------------------------------------------------------

function metricVariant(
  value: number | null,
  thresholds?: {good: number; warn: number},
): 'green' | 'orange' | 'red' | 'neutral' {
  if (value == null || !thresholds) return 'neutral';
  if (value <= thresholds.good) return 'green';
  if (value <= thresholds.warn) return 'orange';
  return 'red';
}

function formatMetric(value: number | null, unit: string): string {
  if (value == null) return '\u2014';
  return `${value.toFixed(1)}${unit}`;
}

function Metric({
  label,
  value,
  unit,
  thresholds,
}: {
  label: string;
  value: number | null;
  unit: string;
  thresholds?: {good: number; warn: number};
}) {
  return (
    <XDSHStack gap={1} vAlign="center">
      <XDSBadge variant={metricVariant(value, thresholds)} label={label} />
      <XDSText type="code">{formatMetric(value, unit)}</XDSText>
    </XDSHStack>
  );
}

function MetricsBar({
  metrics,
  onScrollTest,
}: {
  metrics: PerfMetrics;
  onScrollTest: () => void;
}) {
  return (
    <XDSHStack gap={3} vAlign="center" wrap="wrap">
      <Metric
        label="mount"
        value={metrics.mountMs}
        unit="ms"
        thresholds={{good: 50, warn: 200}}
      />
      <Metric
        label="render"
        value={metrics.lastRenderMs}
        unit="ms"
        thresholds={{good: 16, warn: 50}}
      />
      <Metric label="renders" value={metrics.renderCount} unit="" />
      <Metric
        label="scroll fps"
        value={metrics.scrollFps}
        unit=""
        thresholds={{good: 120, warn: 55}}
      />
      <Metric label="drops" value={metrics.scrollFrameDrops} unit="" />
      <XDSButton
        size="sm"
        variant="secondary"
        label="Scroll test"
        onClick={onScrollTest}
      />
    </XDSHStack>
  );
}

// ---------------------------------------------------------------------------
// Deferred mount — separates unmount and mount into different frames so
// the old panel's teardown doesn't pollute the new panel's timing.
// ---------------------------------------------------------------------------

function DeferredMount({children}: {children: React.ReactNode}) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return ready ? <>{children}</> : null;
}

// ---------------------------------------------------------------------------
// Panel (one code block + its metrics)
// ---------------------------------------------------------------------------

function PerfPanel({
  mode,
  label,
  lineCount,
  maxHeight,
}: {
  mode: 'ranges' | 'spans';
  label: string;
  lineCount: number;
  maxHeight: number;
}) {
  const code = React.useMemo(() => generateCode(lineCount), [lineCount]);
  const {metrics, scrollRef, runScrollTest} = usePerfMetrics();

  return (
    <DeferredMount>
      <XDSVStack gap={3}>
        <XDSHStack gap={2} vAlign="center">
          <XDSText type="label">{label}</XDSText>
          <XDSBadge label={mode} />
        </XDSHStack>
        <XDSCard padding={3}>
          <MetricsBar metrics={metrics} onScrollTest={runScrollTest} />
        </XDSCard>
        <div ref={scrollRef}>
          <XDSCodeBlock
            code={code}
            language="typescript"
            title={`${lineCount.toLocaleString()} lines`}
            hasLineNumbers
            maxHeight={maxHeight}
            highlightMode={mode}
          />
        </div>
      </XDSVStack>
    </DeferredMount>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const LINE_OPTIONS = ['100', '500', '1000', '2000', '5000'];
const VIEW_OPTIONS = ['both', 'ranges', 'spans'] as const;
type ViewMode = (typeof VIEW_OPTIONS)[number];

const VIEW_LABELS: Record<ViewMode, string> = {
  both: 'Side by Side',
  ranges: 'CSS Highlight Only',
  spans: 'Spans Only',
};

export default function CodeBlockPerfPage() {
  const [lineCount, setLineCount] = useState('1000');
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const showRanges = viewMode === 'both' || viewMode === 'ranges';
  const showSpans = viewMode === 'both' || viewMode === 'spans';
  const columns = viewMode === 'both' ? 2 : 1;

  return (
    <XDSAppShell contentPadding={4} height="fill">
      <XDSVStack gap={4}>
        <XDSVStack gap={1}>
          <XDSHeading level={2}>CodeBlock Performance</XDSHeading>
          <XDSText type="body" color="secondary">
            Compare CSS Highlight API (ranges) vs span-based rendering side by
            side, or run each in isolation.
          </XDSText>
        </XDSVStack>

        <XDSSection variant="muted" padding={3} dividers={['bottom']}>
          <XDSHStack gap={4} vAlign="center" wrap="wrap">
            <XDSSegmentedControl
              label="Line count"
              value={lineCount}
              onChange={setLineCount}
              size="sm">
              {LINE_OPTIONS.map(n => (
                <XDSSegmentedControlItem
                  key={n}
                  value={n}
                  label={Number(n).toLocaleString()}
                />
              ))}
            </XDSSegmentedControl>
            <XDSSegmentedControl
              label="View"
              value={viewMode}
              onChange={v => setViewMode(v as ViewMode)}
              size="sm">
              {VIEW_OPTIONS.map(v => (
                <XDSSegmentedControlItem
                  key={v}
                  value={v}
                  label={VIEW_LABELS[v]}
                />
              ))}
            </XDSSegmentedControl>
          </XDSHStack>
        </XDSSection>

        <XDSGrid columns={columns} gap={4}>
          {showRanges && (
            <PerfPanel
              key={`ranges-${lineCount}`}
              mode="ranges"
              label="CSS Highlight API"
              lineCount={Number(lineCount)}
              maxHeight={500}
            />
          )}
          {showSpans && (
            <PerfPanel
              key={`spans-${lineCount}`}
              mode="spans"
              label="Span-based"
              lineCount={Number(lineCount)}
              maxHeight={500}
            />
          )}
        </XDSGrid>
      </XDSVStack>
    </XDSAppShell>
  );
}

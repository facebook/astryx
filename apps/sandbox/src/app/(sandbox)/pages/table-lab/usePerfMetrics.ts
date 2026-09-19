// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePerfMetrics.ts
 * @input React refs to a scrollable container
 * @output Render stats (in a ref), scroll-test state, and an auto-scroll driver
 * @position Table Lab tool; measures Table render + scroll performance
 *
 * CRITICAL: the React Profiler `onRender` callback must NEVER call setState.
 * setState → commit → onRender → setState … is an infinite loop. So per-commit
 * stats (render count, commit time) are written to a REF only. The <PerfHud>
 * component reads that ref via its own rAF ticker and renders in isolation — it
 * is a sibling of the profiled <Table>, so its updates never re-render (and
 * therefore never re-profile) the table. Low-frequency scroll results (fired
 * a couple of times per test) are plain state and safe.
 */

import {useCallback, useRef, useState} from 'react';

export interface RenderStats {
  /** Total React commits of the profiled subtree since last reset. */
  count: number;
  /** Duration (ms) of the most recent commit (Profiler actualDuration). */
  lastMs: number | null;
  /** Sum of all commit durations since last reset. */
  totalMs: number;
}

export interface ScrollStats {
  /** Measured FPS during the last scroll run. */
  fps: number | null;
  /** Frames that took > 20ms (dropped) during the last scroll run. */
  drops: number;
  /** Total frames sampled during the last scroll run. */
  frames: number;
  /** Whether a scroll test is currently running. */
  isScrolling: boolean;
}

const EMPTY_SCROLL: ScrollStats = {
  fps: null,
  drops: 0,
  frames: 0,
  isScrolling: false,
};

export function usePerfMetrics() {
  // Per-commit stats live in a ref (written by onRender, read by PerfHud's
  // ticker). Never parent state — that would loop through the Profiler.
  const renderStatsRef = useRef<RenderStats>({
    count: 0,
    lastMs: null,
    totalMs: 0,
  });

  const onRender = useCallback(
    (_id: string, _phase: string, actualDuration: number) => {
      const r = renderStatsRef.current;
      r.count += 1;
      r.lastMs = actualDuration;
      r.totalMs += actualDuration;
    },
    [],
  );

  const resetRenders = useCallback(() => {
    renderStatsRef.current = {count: 0, lastMs: null, totalMs: 0};
  }, []);

  // Scroll results — low frequency (start + end of a test), safe as state.
  const [scroll, setScroll] = useState<ScrollStats>(EMPTY_SCROLL);

  const scrollState = useRef({
    frames: 0,
    drops: 0,
    startTime: 0,
    rafId: 0,
    measuring: false,
    lastFrameTime: 0,
  });

  const runScrollTest = useCallback(
    (containerArg: HTMLElement | null, durationMs = 2400) => {
      if (!containerArg) {
        return;
      }
      const container: HTMLElement = containerArg;
      const s = scrollState.current;
      if (s.measuring) {
        return;
      }

      const totalScroll = container.scrollHeight - container.clientHeight;
      if (totalScroll <= 0) {
        setScroll({...EMPTY_SCROLL});
        return;
      }

      container.scrollTop = 0;
      s.frames = 0;
      s.drops = 0;
      s.startTime = performance.now();
      s.measuring = true;
      s.lastFrameTime = performance.now();
      setScroll(prev => ({...prev, isScrolling: true}));

      function tick() {
        if (!s.measuring) {
          return;
        }
        const now = performance.now();
        s.frames++;
        if (now - s.lastFrameTime > 20) {
          s.drops++;
        }
        s.lastFrameTime = now;
        s.rafId = requestAnimationFrame(tick);
      }
      s.rafId = requestAnimationFrame(tick);

      const start = performance.now();
      const half = durationMs / 2;

      function step() {
        const elapsed = performance.now() - start;
        // Down for the first half, back up for the second half.
        let progress: number;
        if (elapsed < half) {
          const p = elapsed / half;
          progress = 1 - Math.pow(1 - p, 3);
        } else {
          const p = Math.min((elapsed - half) / half, 1);
          progress = 1 - (1 - Math.pow(1 - p, 3));
        }
        container.scrollTop = totalScroll * Math.max(0, Math.min(1, progress));

        if (elapsed < durationMs) {
          requestAnimationFrame(step);
        } else {
          requestAnimationFrame(() => {
            s.measuring = false;
            cancelAnimationFrame(s.rafId);
            const totalElapsed = performance.now() - s.startTime;
            const fps =
              totalElapsed > 0 && s.frames > 0
                ? Math.round((s.frames / totalElapsed) * 1000)
                : null;
            setScroll({
              fps,
              drops: s.drops,
              frames: s.frames,
              isScrolling: false,
            });
          });
        }
      }
      requestAnimationFrame(step);
    },
    [],
  );

  const resetScroll = useCallback(() => {
    setScroll({...EMPTY_SCROLL});
  }, []);

  return {
    renderStatsRef,
    onRender,
    resetRenders,
    scroll,
    runScrollTest,
    resetScroll,
  };
}

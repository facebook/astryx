// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file trace.test.ts
 * @input countBetween, traceAnimations, hand-built rendering traces and one
 *   recorded trace (trace.popover.fixture.ts)
 * @output Tests which rendering passes countBetween leaves out with
 *   skipCompositorAnimationUpdates: only Chrome's own update for compositor
 *   animations, never work the page caused
 * @position Unit tests for internal/interaction-harness/src/trace.ts
 */

import {describe, expect, it} from 'vitest';
import {POPOVER_PRESENT_UNDER_LOAD} from './trace.popover.fixture';
import {
  countBetween,
  traceAnimations,
  type RenderingTrace,
  type TraceAnimation,
} from './trace';

const PASS = ['UpdateLayoutTree', 'Layout', 'PrePaint', 'Paint', 'Paint'];

function trace(
  passes: number[],
  extra: Pick<RenderingTrace, 'styleInvalidations' | 'animations' | 'scripts'>,
): RenderingTrace {
  const events = passes.flatMap(t =>
    PASS.map((name, k) => ({name, t: t + k * 0.1})),
  );
  return {
    counts: {},
    layout: 0,
    paint: 0,
    styleRecalc: 0,
    prePaint: 0,
    durationMs: 500,
    longTasks: [],
    devtoolsTasks: [],
    events,
    window: {from: 0, to: 500},
    ...extra,
  };
}

const COMPOSITED = [
  {nodeId: 7, composited: true},
  {nodeId: 10, composited: true},
];

describe('countBetween with skipCompositorAnimationUpdates', () => {
  it('leaves out a pass Chrome made on its own for compositor animations', () => {
    const t = trace([4, 154], {
      animations: COMPOSITED,
      styleInvalidations: [
        {t: 1, reason: 'Inline CSS style declaration was mutated', nodeId: 7},
        {t: 153.7, reason: 'Animation', nodeId: 7},
        {t: 153.8, reason: 'Animation', nodeId: 10},
      ],
      scripts: [0.5],
    });
    expect(countBetween(t, 150, 400)).toMatchObject({Layout: 1, Paint: 2});
    expect(
      countBetween(t, 150, 400, {skipCompositorAnimationUpdates: true}),
    ).toEqual({});
    // The start, which the page's style writes caused, still counts.
    expect(
      countBetween(t, 0, 400, {skipCompositorAnimationUpdates: true}),
    ).toMatchObject({Layout: 1});
  });

  it('counts the pass when script ran since the previous one', () => {
    const t = trace([4, 154], {
      animations: COMPOSITED,
      styleInvalidations: [{t: 153.7, reason: 'Animation', nodeId: 7}],
      scripts: [150],
    });
    expect(
      countBetween(t, 150, 400, {skipCompositorAnimationUpdates: true}),
    ).toMatchObject({Layout: 1});
  });

  it('counts the pass when any recalculation has another reason', () => {
    const t = trace([4, 154], {
      animations: COMPOSITED,
      styleInvalidations: [
        {t: 153.7, reason: 'Animation', nodeId: 7},
        {
          t: 153.8,
          reason: 'Inline CSS style declaration was mutated',
          nodeId: 10,
        },
      ],
      scripts: [],
    });
    expect(
      countBetween(t, 150, 400, {skipCompositorAnimationUpdates: true}),
    ).toMatchObject({Layout: 1});
  });

  it('counts every pass of an animation the compositor cannot run', () => {
    const t = trace([4, 21, 38, 154], {
      animations: [{nodeId: 7, composited: false}],
      styleInvalidations: [20, 37, 153].map(at => ({
        t: at,
        reason: 'Animation',
        nodeId: 7,
      })),
      scripts: [],
    });
    expect(
      countBetween(t, 15, 400, {skipCompositorAnimationUpdates: true}),
    ).toMatchObject({Layout: 3});
  });

  it('needs a trace recorded with invalidations', () => {
    const t = trace([4], {});
    expect(() =>
      countBetween(t, 0, 400, {skipCompositorAnimationUpdates: true}),
    ).toThrow(/invalidations: true/);
  });
});

describe('a recorded trace: a popover presenting on a loaded machine', () => {
  const recorded = POPOVER_PRESENT_UNDER_LOAD;
  const animations = traceAnimations(recorded.animationEvents, ts => ts / 1000);
  const withAnimations = (list: readonly TraceAnimation[]): RenderingTrace => ({
    ...trace([], {
      animations: list,
      styleInvalidations: recorded.styleInvalidations,
      scripts: recorded.scripts,
    }),
    events: recorded.events,
  });
  const [from, to] = recorded.window;

  it('keeps one entry per animation when Chrome reuses an id for a later one', () => {
    // The layer's present (node 6) and, under the same two ids, the exit copy
    // the dismissal plays on (node 59).
    expect(animations.filter(a => a.nodeId === 6 && a.composited).length).toBe(
      2,
    );
    expect(animations.filter(a => a.nodeId === 59 && a.composited).length).toBe(
      2,
    );
    for (const a of animations.filter(a => a.nodeId === 6 && a.composited)) {
      expect(a.from).toBeLessThan(from);
      expect(a.to).toBeGreaterThan(to);
    }
  });

  it("leaves out Chrome's own update of the layer and of its ::backdrop", () => {
    const t = withAnimations(animations);
    expect(countBetween(t, from, to)).toMatchObject({Layout: 2, Paint: 2});
    expect(
      countBetween(t, from, to, {skipCompositorAnimationUpdates: true}),
    ).toEqual({});
  });

  it('counts the passes when script ran before them', () => {
    const t = {
      ...withAnimations(animations),
      scripts: [...recorded.scripts, 140],
    };
    expect(
      countBetween(t, from, to, {skipCompositorAnimationUpdates: true}),
    ).toMatchObject({Layout: 2});
  });

  it('counts them when the layer has no compositor animation at the time', () => {
    const ended = animations.map(a =>
      a.nodeId === 6 ? {...a, to: Math.min(a.to ?? Infinity, 100)} : a,
    );
    expect(
      countBetween(withAnimations(ended), from, to, {
        skipCompositorAnimationUpdates: true,
      }),
    ).toMatchObject({Layout: 2});
    const mainThread = animations.map(a =>
      a.nodeId === 6 ? {...a, composited: false} : a,
    );
    expect(
      countBetween(withAnimations(mainThread), from, to, {
        skipCompositorAnimationUpdates: true,
      }),
    ).toMatchObject({Layout: 2});
  });
});

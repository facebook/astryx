// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file trace.test.ts
 * @input countBetween and hand-built rendering traces
 * @output Tests which rendering passes countBetween leaves out with
 *   skipCompositorAnimationUpdates: only Chrome's own update for compositor
 *   animations, never work the page caused
 * @position Unit tests for internal/interaction-harness/src/trace.ts
 */

import {describe, expect, it} from 'vitest';
import {countBetween, type RenderingTrace} from './trace';

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

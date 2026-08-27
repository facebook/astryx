// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {buildActivationPlan} from './activate-visual-acceptance.mjs';

describe('visual-acceptance activation', () => {
  it('derives pending for stable heads and success only for no-scope heads', () => {
    const plan = buildActivationPlan(
      [
        {number: 1, head: {sha: 'a'.repeat(40)}, hasStableVisual: true, visualStatus: null},
        {number: 2, head: {sha: 'b'.repeat(40)}, hasStableVisual: false, visualStatus: null},
        {number: 3, head: {sha: 'a'.repeat(40)}, hasStableVisual: true, visualStatus: null},
      ],
      ['build'],
    );
    expect(plan).toEqual({
      backfill: [
        {
          number: 3,
          sha: 'a'.repeat(40),
          state: 'pending',
          description: 'Stable visual result pending; rerun CI after activation.',
        },
        {
          number: 2,
          sha: 'b'.repeat(40),
          state: 'success',
          description: 'No stable visual scope.',
        },
      ],
      addRequiredContext: true,
    });
  });

  it('repairs legacy grandfathered states but preserves live workflow verdicts', () => {
    const plan = buildActivationPlan(
      [
        {
          number: 1,
          head: {sha: 'a'.repeat(40)},
          hasStableVisual: true,
          visualStatus: {description: 'Grandfathered during visual-acceptance activation'},
        },
        {
          number: 2,
          head: {sha: 'b'.repeat(40)},
          hasStableVisual: true,
          visualStatus: {description: 'Current visual bundle was explicitly accepted.'},
        },
      ],
      ['build', 'visual-acceptance'],
    );
    expect(plan.backfill).toEqual([
      {
        number: 1,
        sha: 'a'.repeat(40),
        state: 'pending',
        description: 'Stable visual result pending; rerun CI after activation.',
      },
    ]);
    expect(plan.addRequiredContext).toBe(false);
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {buildPlan} from './plan.mjs';

const stories = [
  {id: 'core-badge--default', title: 'Core/Badge', name: 'Default', component: 'Badge', tags: []},
  {id: 'core-badge--variants', title: 'Core/Badge', name: 'Variants', component: 'Badge', tags: []},
  {id: 'core-badge--error', title: 'Core/Badge', name: 'Error', component: 'Badge', tags: []},
];

const targets = [{key: 'badge', className: 'astryx-badge', component: 'Badge', props: [], states: []}];

const themeOverrides = {
  butter: {badge: ['base', 'variant:success', 'variant:warning', 'variant:error']},
};

const observations = {
  'core-badge--default': {badge: []},
  'core-badge--variants': {badge: ['variant:success', 'variant:warning']},
  'core-badge--error': {badge: ['variant:error']},
};

const matrix = extra =>
  buildPlan({
    stories,
    targets,
    themeOverrides,
    defaultTheme: 'neutral',
    tiers: ['theme-matrix'],
    ...extra,
  });

describe('theme matrix with scout observations', () => {
  it('picks the stories that actually render the overridden states', () => {
    const ids = [...new Set(matrix({observations}).map(shot => shot.storyId))].sort();
    expect(ids).toEqual(['core-badge--error', 'core-badge--variants']);
  });

  it('covers several overrides with one story when one story renders them all', () => {
    const plan = matrix({observations});
    const variants = plan.filter(shot => shot.storyId === 'core-badge--variants' && shot.mode === 'light');
    expect(variants).toHaveLength(1);
  });

  it('leaves an override no story renders uncovered rather than photographing the default', () => {
    const plan = matrix({
      observations: {'core-badge--default': {badge: []}},
    });
    expect(plan.map(shot => shot.storyId)).toEqual(['core-badge--default', 'core-badge--default']);
  });

  it('skips a component whose stories never render the target at all', () => {
    expect(matrix({observations: {'core-badge--default': {}}})).toEqual([]);
  });

  it('falls back to the representative story when no scout ran', () => {
    const ids = [...new Set(matrix({}).map(shot => shot.storyId))];
    expect(ids).toEqual(['core-badge--default']);
  });

  it('is deterministic across runs', () => {
    expect(matrix({observations})).toEqual(matrix({observations}));
  });
});

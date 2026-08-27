// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  buildPlan,
  readStoryIndex,
  representativeStories,
  shotKey,
  storiesInPackages,
  uncoveredTargets,
} from './plan.mjs';

const stories = [
  {id: 'core-button--primary', title: 'Core/Button', name: 'Primary', component: 'Button', tags: []},
  {id: 'core-button--default', title: 'Core/Button', name: 'Default', component: 'Button', tags: []},
  {id: 'core-badge--solid', title: 'Core/Badge', name: 'Solid', component: 'Badge', tags: []},
];

const targets = [
  {key: 'button', className: 'astryx-button', component: 'Button', props: ['variant:primary'], states: []},
  {key: 'badge', className: 'astryx-badge', component: 'Badge', props: [], states: []},
  {key: 'tooltip', className: 'astryx-tooltip', component: 'Tooltip', props: [], states: []},
];

const themeOverrides = {
  neutral: {button: ['base']},
  y2k: {button: ['base', 'variant:primary'], badge: ['base']},
};

describe('storiesInPackages', () => {
  const mixed = [
    ...stories,
    {id: 'lab-drawer--default', title: 'Lab/Drawer', name: 'Default', component: 'Drawer', tags: []},
    {id: 'charts-bar--default', title: 'Charts/Bar', name: 'Default', component: 'Bar', tags: []},
  ];

  it('keeps only the stable Storybook package groups', () => {
    expect(storiesInPackages(mixed, ['Core']).map(story => story.id)).toEqual(
      stories.map(story => story.id),
    );
  });

  it('allows an explicit all-packages audit without changing the release default', () => {
    expect(storiesInPackages(mixed, ['*'])).toEqual(mixed);
  });
});

describe('representativeStories', () => {
  it('prefers a conventionally named story over source order', () => {
    expect(representativeStories(stories).get('Button').id).toBe('core-button--default');
  });

  it('falls back to the first story when no name is conventional', () => {
    expect(representativeStories(stories).get('Badge').id).toBe('core-badge--solid');
  });
});

describe('buildPlan', () => {
  it('photographs one story per component in the default theme for the surface tier', () => {
    const plan = buildPlan({stories, targets, themeOverrides, defaultTheme: 'neutral', tiers: ['surface']});
    expect(plan.map(shot => shot.key).sort()).toEqual([
      'core-badge--solid__neutral-dark',
      'core-badge--solid__neutral-light',
      'core-button--default__neutral-dark',
      'core-button--default__neutral-light',
    ]);
  });

  it('adds a shot for every theme that overrides a component the story renders', () => {
    const plan = buildPlan({stories, targets, themeOverrides, defaultTheme: 'neutral', tiers: ['theme-matrix']});
    const y2k = plan.filter(shot => shot.theme === 'y2k').map(shot => shot.key);
    expect(y2k).toContain('core-button--default__y2k-light');
    expect(y2k).toContain('core-badge--solid__y2k-dark');
  });

  it('restricts the theme matrix to changed shipped themes', () => {
    const plan = buildPlan({
      stories,
      targets,
      themeOverrides,
      defaultTheme: 'neutral',
      tiers: ['theme-matrix'],
      matrixThemes: ['y2k'],
    });
    expect(new Set(plan.map(shot => shot.theme))).toEqual(new Set(['y2k']));
    expect(plan.map(shot => shot.key)).toContain('core-badge--solid__y2k-light');
  });

  it('keeps every shipped theme for touched Core components even when the matrix is scoped', () => {
    const plan = buildPlan({
      stories,
      targets,
      themeOverrides,
      defaultTheme: 'neutral',
      tiers: ['component', 'theme-matrix'],
      components: ['Button'],
      matrixThemes: ['y2k'],
    });
    expect(plan.some(shot => shot.theme === 'neutral' && shot.component === 'Button')).toBe(true);
    expect(plan.some(shot => shot.theme === 'y2k' && shot.component === 'Button')).toBe(true);
  });

  it('records why a shot is in the plan, merging the reasons of a shot both tiers want', () => {
    const plan = buildPlan({stories, targets, themeOverrides, defaultTheme: 'neutral', tiers: ['surface', 'theme-matrix']});
    const shot = plan.find(candidate => candidate.key === 'core-button--default__neutral-light');
    expect(shot.reasons).toEqual(['surface', 'theme:neutral:button']);
  });

  it('captures every story, not just the representative, in the full tier', () => {
    const plan = buildPlan({stories, targets, themeOverrides, defaultTheme: 'neutral', tiers: ['full']});
    expect(plan.filter(shot => shot.component === 'Button' && shot.mode === 'light')).toHaveLength(2);
  });

  it('skips a target whose component has no story rather than planning an unshootable shot', () => {
    const plan = buildPlan({
      stories,
      targets,
      themeOverrides: {gothic: {tooltip: ['base']}},
      defaultTheme: 'neutral',
      tiers: ['theme-matrix'],
    });
    expect(plan).toEqual([]);
  });

  it('is deterministic — same input, same order', () => {
    const args = {stories, targets, themeOverrides, defaultTheme: 'neutral', tiers: ['surface', 'theme-matrix']};
    expect(buildPlan(args)).toEqual(buildPlan(args));
  });
});

describe('shotKey', () => {
  it('stays filesystem-safe', () => {
    expect(shotKey({storyId: 'core-a/b--c d', theme: 'y2k', mode: 'light'})).toBe('core-a_b--c_d__y2k-light');
  });
});

describe('readStoryIndex exclusions', () => {
  const index = {
    entries: {
      a: {type: 'story', id: 'lab-stream--one', title: 'Lab/Stream', name: 'One', tags: []},
      b: {type: 'story', id: 'lab-stream--two', title: 'Lab/Stream', name: 'Two', tags: []},
      c: {type: 'story', id: 'core-button--default', title: 'Core/Button', name: 'Default', tags: []},
      d: {type: 'docs', id: 'core-button--docs', title: 'Core/Button', name: 'Docs', tags: []},
      e: {type: 'story', id: 'core-thing--skipped', title: 'Core/Thing', name: 'S', tags: ['no-visual']},
    },
  };

  const read = exclusions => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-index-'));
    fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index));
    try {
      return readStoryIndex(dir, exclusions).map(story => story.id);
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  };

  it('drops docs entries and stories tagged out', () => {
    expect(read([])).toEqual(['lab-stream--one', 'lab-stream--two', 'core-button--default']);
  });

  it('drops one story by id', () => {
    expect(read(['lab-stream--one'])).not.toContain('lab-stream--one');
  });

  it('drops a whole story file with a trailing star', () => {
    expect(read(['lab-stream--*'])).toEqual(['core-button--default']);
  });
});

describe('uncoveredTargets', () => {
  it('names targets no shot can reach', () => {
    const plan = buildPlan({stories, targets, themeOverrides, defaultTheme: 'neutral', tiers: ['surface']});
    expect(uncoveredTargets(targets, plan)).toEqual([{key: 'tooltip', component: 'Tooltip'}]);
  });
});

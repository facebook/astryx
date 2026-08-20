// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-eval.test.ts
 * @input Synthetic measurements
 * @output Assertions that each detector fires on a sample that should trip it,
 *         and stays silent on one that should not
 * @position internal/vibe-tests/setup-test — the scorer's own tests
 *
 * Every check is asserted in both directions. A detector that only ever fires is
 * indistinguishable from a constant, and a scorer nobody can trust produces
 * findings nobody has to act on.
 */

import {describe, expect, it} from 'vitest';
import {
  cascadeInverted,
  categoryOf,
  contrastFailures,
  countByCategory,
  modeDependence,
  regressions,
  scoreArm,
  variableCapture,
  verdict,
  type Measurement,
  type SchemeReading,
} from './setup-eval.js';

// ── fixtures ─────────────────────────────────────────────────────────

const probe = (
  style: Record<string, string>,
  contrast: number | null = 12,
  text = 'x',
) => ({
  style,
  text,
  contrast,
});

function scheme(overrides: Partial<SchemeReading> = {}): SchemeReading {
  return {
    probes: {
      'page-title': probe(
        {
          color: 'rgb(230, 230, 233)',
          fontSize: '12px',
          fontFamily: 'ui-sans-serif',
        },
        15.8,
      ),
      'status-badge': probe(
        {
          color: 'rgb(110, 231, 183)',
          fontSize: '12px',
          fontFamily: 'ui-sans-serif',
        },
        8.1,
      ),
    },
    variables: {'--spacing': '.25rem', '--color-card': '#141417'},
    colorScheme: 'normal',
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    ...overrides,
  };
}

const CORRECT_LAYERS = [
  'reset',
  'theme',
  'base',
  'astryx-base',
  'astryx-theme',
  'utilities',
];

function measurement(
  light: SchemeReading,
  dark: SchemeReading = light,
  label = 'arm',
  layerOrder: string[] = CORRECT_LAYERS,
): Measurement {
  return {
    label,
    build: {ok: true, status: 0, ms: 1000, stdout: '', stderr: ''},
    layerOrder,
    schemes: {light, dark},
  };
}

// ── categories ───────────────────────────────────────────────────────

describe('categoryOf', () => {
  it('sorts a property into the axis a reader would look under', () => {
    expect(categoryOf('fontSize')).toBe('typography');
    expect(categoryOf('backgroundColor')).toBe('color');
    expect(categoryOf('paddingTop')).toBe('spacing');
  });

  it('does not silently drop a property it has no rule for', () => {
    expect(categoryOf('someFutureProperty')).toBe('geometry');
  });
});

// ── 1. regressions ───────────────────────────────────────────────────

describe('regressions', () => {
  it('reports a property the install moved on untouched app chrome', () => {
    const after = scheme();
    after.probes['page-title'] = probe({
      color: 'rgb(230, 230, 233)',
      fontSize: '10px',
      fontFamily: 'ui-sans-serif',
    });
    const {changed} = regressions(scheme(), after);
    expect(changed).toEqual([
      {
        probe: 'page-title',
        property: 'fontSize',
        category: 'typography',
        before: '12px',
        after: '10px',
      },
    ]);
  });

  it('reports nothing when the app rendered identically', () => {
    expect(regressions(scheme(), scheme()).changed).toEqual([]);
  });

  it('records a probe the install removed instead of skipping it', () => {
    const after = scheme();
    after.probes['status-badge'] = {missing: true};
    const {changed, missing} = regressions(scheme(), after);
    expect(missing).toEqual(['status-badge']);
    expect(changed).toEqual([]);
  });

  it('counts by category so a row says which axis moved', () => {
    const after = scheme();
    after.probes['page-title'] = probe({
      color: 'rgb(23, 23, 23)',
      fontSize: '10px',
      fontFamily: 'Figtree',
    });
    expect(countByCategory(regressions(scheme(), after).changed)).toEqual({
      typography: 2,
      color: 1,
      geometry: 0,
      spacing: 0,
    });
  });
});

// ── 2. legibility ────────────────────────────────────────────────────

describe('contrastFailures', () => {
  it('fires when readable text drops below the AA floor', () => {
    const after = scheme();
    after.probes['page-title'] = probe({color: 'rgb(23, 23, 23)'}, 1.1);
    expect(contrastFailures(scheme(), after)).toEqual([
      {probe: 'page-title', before: 15.8, after: 1.1},
    ]);
  });

  it('does not fire on a contrast change that stays readable', () => {
    const after = scheme();
    after.probes['page-title'] = probe({color: 'rgb(250, 250, 250)'}, 17.2);
    expect(contrastFailures(scheme(), after)).toEqual([]);
  });

  it('does not fire on text that was already below the floor', () => {
    const before = scheme();
    before.probes['page-title'] = probe({color: 'rgb(40, 40, 40)'}, 2.0);
    const after = scheme();
    after.probes['page-title'] = probe({color: 'rgb(30, 30, 30)'}, 1.4);
    expect(contrastFailures(before, after)).toEqual([]);
  });
});

// ── 3. mode dependence ───────────────────────────────────────────────

describe('modeDependence', () => {
  it('names a probe the install made OS-scheme dependent', () => {
    const light = scheme();
    light.probes['page-title'] = probe({color: 'rgb(23, 23, 23)'});
    const dark = scheme();
    dark.probes['page-title'] = probe({color: 'rgb(250, 250, 250)'});
    const baseline = measurement(scheme(), scheme(), 'baseline');
    expect(modeDependence(baseline, measurement(light, dark))).toEqual([
      'page-title',
    ]);
  });

  it('stays silent when the arm renders the same in both schemes', () => {
    const baseline = measurement(scheme(), scheme(), 'baseline');
    expect(modeDependence(baseline, measurement(scheme(), scheme()))).toEqual(
      [],
    );
  });

  it('does not blame the install for a probe the app itself themed', () => {
    const light = scheme();
    light.probes['page-title'] = probe({color: 'rgb(0, 0, 0)'});
    const dark = scheme();
    dark.probes['page-title'] = probe({color: 'rgb(255, 255, 255)'});
    const baseline = measurement(light, dark, 'baseline');
    expect(modeDependence(baseline, measurement(light, dark))).toEqual([]);
  });
});

// ── 4. variable capture ──────────────────────────────────────────────

describe('variableCapture', () => {
  it('reports a name the app owned that now resolves to something else', () => {
    const after = scheme({
      variables: {
        '--spacing': '.25rem',
        '--color-card': 'light-dark(#fff,#000)',
      },
    });
    expect(variableCapture(scheme(), after)).toEqual([
      {name: '--color-card', before: '#141417', after: 'light-dark(#fff,#000)'},
    ]);
  });

  it('reports a name that stopped resolving at all', () => {
    const after = scheme({
      variables: {'--spacing': '', '--color-card': '#141417'},
    });
    expect(variableCapture(scheme(), after)).toEqual([
      {name: '--spacing', before: '.25rem', after: ''},
    ]);
  });

  it('reports nothing when the vocabulary survived', () => {
    expect(variableCapture(scheme(), scheme())).toEqual([]);
  });
});

// ── 5. cascade inversion ─────────────────────────────────────────────

describe('cascadeInverted', () => {
  const correct = [
    'properties',
    'reset',
    'theme',
    'base',
    'astryx-base',
    'astryx-theme',
    'utilities',
  ];
  const inverted = [
    'properties',
    'theme',
    'base',
    'utilities',
    'reset',
    'astryx-base',
    'astryx-theme',
  ];

  it('fires when a system layer outranks the app utilities', () => {
    expect(cascadeInverted(inverted)).toBe(true);
  });

  it('stays silent on the order the recipe is trying to produce', () => {
    expect(cascadeInverted(correct)).toBe(false);
  });

  it('does not guess when the emitted CSS declares no utility layer', () => {
    expect(cascadeInverted(['reset', 'astryx-base'])).toBe(false);
    expect(cascadeInverted([])).toBe(false);
    expect(cascadeInverted(undefined)).toBe(false);
  });
});

// ── 6. score + verdict ───────────────────────────────────────────────

describe('scoreArm', () => {
  it('fails everything below the build when the app stopped compiling', () => {
    const broken: Measurement = {
      label: 'broken',
      build: {ok: false, status: 1, ms: 900, stdout: '', stderr: 'TS2307'},
      schemes: {light: scheme(), dark: scheme()},
    };
    const score = scoreArm(measurement(scheme(), scheme(), 'baseline'), broken);
    expect(score.builds).toBe(false);
    expect(verdict(score)).toBe('broken-build');
  });

  it('calls a clean build with unreadable text silent damage', () => {
    const after = scheme();
    after.probes['page-title'] = probe({color: 'rgb(23, 23, 23)'}, 1.1);
    const score = scoreArm(
      measurement(scheme(), scheme(), 'baseline'),
      measurement(after),
    );
    expect(score.clean).toBe(true);
    expect(verdict(score)).toBe('silent-damage');
  });

  it('separates drift from damage', () => {
    const after = scheme();
    after.probes['page-title'] = probe(
      {color: 'rgb(230, 230, 233)', fontFamily: 'Figtree'},
      15.1,
    );
    const score = scoreArm(
      measurement(scheme(), scheme(), 'baseline'),
      measurement(after),
    );
    expect(score.contrastFailures).toEqual([]);
    expect(verdict(score)).toBe('cosmetic-drift');
  });

  it('calls an install that changed nothing clean', () => {
    const score = scoreArm(
      measurement(scheme(), scheme(), 'baseline'),
      measurement(scheme()),
    );
    expect(verdict(score)).toBe('clean');
  });

  it('calls an inverted cascade damage even when every probe still reads', () => {
    const arm = measurement(scheme(), scheme(), 'arm', [
      'theme',
      'base',
      'utilities',
      'reset',
      'astryx-base',
    ]);
    const score = scoreArm(measurement(scheme(), scheme(), 'baseline'), arm);
    expect(score.cascadeInverted).toBe(true);
    expect(verdict(score)).toBe('silent-damage');
  });

  it('reports a noisy page even when nothing regressed', () => {
    const noisy = scheme({consoleErrors: ['Warning: two copies of React']});
    const score = scoreArm(
      measurement(scheme(), scheme(), 'baseline'),
      measurement(noisy),
    );
    expect(score.consoleErrors).toBe(1);
    expect(verdict(score)).toBe('noisy');
  });
});

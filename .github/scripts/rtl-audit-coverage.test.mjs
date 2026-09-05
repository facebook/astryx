// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for RTL contextual decorations and applicability coverage.
 */

import {JSDOM} from 'jsdom';
import {describe, expect, it} from 'vitest';
import {
  buildAuditedComponentRoster,
  buildComponentCoverage,
  classifyDirectionalDecorationPair,
  collectDirectionalDecorations,
  coverageHasFindings,
  diffVerifiedNotApplicable,
  validateKnownCoverageGaps,
  validateKnownCoverageGapTransition,
  validateRemovedComponents,
  validateVerifiedNotApplicable,
} from '../../apps/storybook/rtl-audit/rtl-audit-coverage.mjs';

const IDENTITY = [1, 0, 0, 1];
const MIRROR = [-1, 0, 0, 1];

function decoration(glyph, policy, matrix = IDENTITY) {
  return {glyph, policy, matrix};
}

describe('collectDirectionalDecorations', () => {
  it('detects a slash used between repeated list items', () => {
    const dom = new JSDOM(`
      <ol>
        <li><span aria-hidden="true">/</span><a>Home</a></li>
        <li><span aria-hidden="true">/</span><a>Docs</a></li>
      </ol>
      <p>Control: and/or · 08/24 · /settings</p>
    `);
    const found = collectDirectionalDecorations({
      root: dom.window.document,
      requireVisible: false,
    });
    expect(found).toHaveLength(2);
    expect(found[0]).toMatchObject({glyph: '/', policy: 'explicit'});
  });

  it('follows a nested glyph element that carries the mirror transform', () => {
    const dom = new JSDOM(`
      <ol>
        <li><span aria-hidden="true"><span style="transform: matrix(-1, 0, 0, 1, 0, 0)">→</span></span><a>Home</a></li>
        <li><span aria-hidden="true"><span style="transform: matrix(-1, 0, 0, 1, 0, 0)">→</span></span><a>Docs</a></li>
      </ol>
    `);
    const found = collectDirectionalDecorations({
      root: dom.window.document,
      requireVisible: false,
    });
    expect(found[0].matrix).toEqual(MIRROR);
  });

  it('ignores the same slash without a directional decoration context', () => {
    const dom = new JSDOM('<p aria-hidden="true">/</p><p>and/or</p>');
    expect(
      collectDirectionalDecorations({
        root: dom.window.document,
        requireVisible: false,
      }),
    ).toEqual([]);
  });
});

describe('classifyDirectionalDecorationPair', () => {
  it('fails a bare contextual arrow', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('→', 'explicit'),
        decoration('→', 'explicit'),
      ),
    ).toMatchObject({verdict: 'fail'});
  });

  it('passes a mirrored contextual arrow', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('→', 'explicit'),
        decoration('→', 'explicit', MIRROR),
      ),
    ).toMatchObject({verdict: 'pass'});
  });

  it('passes an unchanged Unicode-mirrored angle quote', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('›', 'auto-bidi'),
        decoration('›', 'auto-bidi'),
      ),
    ).toMatchObject({verdict: 'pass'});
  });

  it('fails an explicitly mirrored Unicode-mirrored angle quote', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('›', 'auto-bidi'),
        decoration('›', 'auto-bidi', MIRROR),
      ),
    ).toMatchObject({verdict: 'fail'});
  });
});

describe('validateRemovedComponents', () => {
  it('accepts removed Core, Lab, and unknown identifiers', () => {
    expect(
      validateRemovedComponents([
        'core/Button',
        'lab/Tree',
        'unknown/ChartTooltip',
      ]),
    ).toEqual(['core/Button', 'lab/Tree', 'unknown/ChartTooltip']);
  });

  it('rejects malformed and duplicate identifiers', () => {
    expect(() => validateRemovedComponents(['ChartTooltip'])).toThrow(
      'core/Name, lab/Name, or unknown/Name',
    );
    expect(() =>
      validateRemovedComponents([
        'unknown/ChartTooltip',
        'unknown/charttooltip',
      ]),
    ).toThrow('duplicate removed component');
  });
});

describe('validateVerifiedNotApplicable', () => {
  it('accepts reviewed declarations and trims their reasons', () => {
    expect(
      validateVerifiedNotApplicable([
        {component: 'core/Text', reason: '  No directional behavior.  '},
        {component: 'unknown/ChartTooltip', reason: 'Fixture-only surface.'},
      ]),
    ).toEqual([
      {component: 'core/Text', reason: 'No directional behavior.'},
      {component: 'unknown/ChartTooltip', reason: 'Fixture-only surface.'},
    ]);
  });

  it('reports added, changed, and removed declarations', () => {
    expect(
      diffVerifiedNotApplicable(
        [
          {component: 'core/Unchanged', reason: 'Same.'},
          {component: 'core/Changed', reason: 'Before.'},
          {component: 'core/Removed', reason: 'Gone.'},
        ],
        [
          {component: 'core/Unchanged', reason: 'Same.'},
          {component: 'core/Changed', reason: 'After.'},
          {component: 'core/Added', reason: 'New.'},
        ],
      ),
    ).toEqual({
      changed: ['core/Changed', 'core/Removed', 'core/Added'],
      removed: ['core/Removed'],
    });
  });

  it('rejects malformed and duplicate declarations', () => {
    expect(() => validateVerifiedNotApplicable([null])).toThrow(
      'verified-N/A entry at index 0',
    );
    expect(() =>
      validateVerifiedNotApplicable([
        {component: 'core/Text', reason: 'Reviewed.'},
        {component: 'core/text', reason: 'Also reviewed.'},
      ]),
    ).toThrow('duplicate verified-N/A declaration');
  });
});

describe('validateKnownCoverageGaps', () => {
  it('accepts unique Core and Lab component names', () => {
    expect(validateKnownCoverageGaps(['core/Button', 'lab/Tree'])).toEqual([
      'core/Button',
      'lab/Tree',
    ]);
  });

  it('rejects malformed and duplicate entries', () => {
    expect(() => validateKnownCoverageGaps({})).toThrow('JSON array');
    expect(() => validateKnownCoverageGaps(['Button'])).toThrow(
      'core/Name or lab/Name',
    );
    expect(() =>
      validateKnownCoverageGaps(['core/Button', 'core/button']),
    ).toThrow('duplicate known coverage gap');
  });

  it('permits removals but rejects additions', () => {
    expect(
      validateKnownCoverageGapTransition(
        ['core/Button', 'lab/Tree'],
        ['core/Button'],
      ),
    ).toEqual({removed: ['lab/Tree']});
    expect(() =>
      validateKnownCoverageGapTransition(
        ['core/Button'],
        ['core/Button', 'core/NewComponent'],
      ),
    ).toThrow('baseline is removal-only; added: core/NewComponent');
  });
});

describe('buildComponentCoverage', () => {
  it('classifies measured, verified N/A, unexplained gaps, and stale declarations', () => {
    const coverage = buildComponentCoverage({
      components: [
        'core/Breadcrumbs',
        'core/Button',
        'core/Text',
        'core/Pagination',
      ],
      decorationResults: [
        {
          component: 'core/Breadcrumbs',
          storyId: 'core-breadcrumbs--default',
          verdict: 'pass',
        },
      ],
      autoResults: [
        {
          component: 'core/Pagination',
          storyId: 'core-pagination--default',
          verdict: 'pass',
        },
      ],
      verifiedNa: [
        {
          component: 'core/Text',
          reason: 'Text has no direction-sensitive visual or behavior.',
        },
        {component: 'core/Pagination', reason: 'stale reason'},
      ],
    });

    expect(coverage).toMatchObject({
      total: 4,
      measured: 1,
      verifiedNa: 1,
      gaps: 1,
      staleVerifiedNa: 1,
    });
    expect(
      Object.fromEntries(
        coverage.results.map(result => [result.component, result.status]),
      ),
    ).toEqual({
      'core/Breadcrumbs': 'measured',
      'core/Button': 'coverage-gap',
      'core/Pagination': 'stale-verified-na',
      'core/Text': 'verified-na',
    });
  });

  it('separates known debt from new and stale gaps', () => {
    const coverage = buildComponentCoverage({
      components: ['core/Legacy', 'core/New', 'core/Measured', 'core/Verified'],
      autoResults: [
        {
          component: 'core/Measured',
          storyId: 'core-measured--default',
          verdict: 'pass',
        },
      ],
      verifiedNa: [
        {
          component: 'core/Verified',
          reason: 'No direction-sensitive behavior.',
        },
      ],
      knownGaps: [
        'core/Legacy',
        'core/Measured',
        'core/Verified',
        'lab/Removed',
      ],
    });

    expect(coverage).toMatchObject({
      total: 4,
      measured: 0,
      verifiedNa: 0,
      knownGaps: 1,
      gaps: 1,
      staleKnownGaps: 3,
      staleVerifiedNa: 0,
    });
    expect(
      Object.fromEntries(
        coverage.results.map(result => [result.component, result.status]),
      ),
    ).toEqual({
      'core/Legacy': 'known-coverage-gap',
      'core/Measured': 'stale-known-coverage-gap',
      'core/New': 'coverage-gap',
      'core/Verified': 'stale-known-coverage-gap',
      'lab/Removed': 'stale-known-coverage-gap',
    });
  });

  it('does not treat out-of-scope baseline entries as removed in a filtered run', () => {
    const coverage = buildComponentCoverage({
      components: ['core/Current'],
      knownGaps: ['core/Current', 'core/OutOfScope'],
      checkKnownGapRoster: false,
    });

    expect(coverage).toMatchObject({
      total: 1,
      knownGaps: 1,
      staleKnownGaps: 0,
    });
    expect(coverage.results).toHaveLength(1);
  });

  it('treats a filtered known gap missing from the live roster as stale', () => {
    const coverage = buildComponentCoverage({
      components: ['core/Removed'],
      knownGapRosterComponents: ['core/Current'],
      knownGaps: ['core/Removed'],
      checkKnownGapRoster: true,
    });

    expect(coverage).toMatchObject({
      total: 1,
      knownGaps: 0,
      staleKnownGaps: 1,
    });
    expect(coverage.results).toMatchObject([
      {
        component: 'core/Removed',
        status: 'stale-known-coverage-gap',
      },
    ]);
  });

  it('classifies a removed debt component separately from a new gap', () => {
    const coverage = buildComponentCoverage({
      components: ['core/Removed'],
      removedFromRoster: ['core/Removed'],
    });

    expect(coverage).toMatchObject({
      total: 1,
      removedComponents: 1,
      gaps: 0,
    });
    expect(coverage.results).toMatchObject([
      {component: 'core/Removed', status: 'removed-component'},
    ]);
  });

  it('keeps missing stories and audit errors as coverage gaps', () => {
    const coverage = buildComponentCoverage({
      components: ['core/MissingStory', 'core/BrokenAudit'],
      autoResults: [
        {
          component: 'core/BrokenAudit',
          storyId: 'core-broken--default',
          verdict: 'ERROR',
        },
      ],
      curatedResults: [
        {
          component: 'core/MissingStory',
          storyId: 'core-missing--default',
          rollup: 'MISSING-STORY',
        },
      ],
    });
    expect(coverage.measured).toBe(0);
    expect(coverage.gaps).toBe(2);
  });

  it('keeps same-named Core and Lab components distinct', () => {
    const coverage = buildComponentCoverage({
      components: ['core/Chat', 'lab/Chat'],
    });
    expect(coverage.results.map(result => result.component)).toEqual([
      'core/Chat',
      'lab/Chat',
    ]);
    expect(coverage.gaps).toBe(2);
  });
});

describe('coverageHasFindings', () => {
  it('keeps known debt non-failing while new and stale gaps fail', () => {
    expect(
      coverageHasFindings({
        enforced: true,
        knownGaps: 12,
        gaps: 0,
        staleKnownGaps: 0,
        staleVerifiedNa: 0,
      }),
    ).toBe(false);
    expect(
      coverageHasFindings({
        enforced: true,
        knownGaps: 0,
        gaps: 1,
        staleKnownGaps: 0,
        staleVerifiedNa: 0,
      }),
    ).toBe(true);
    expect(
      coverageHasFindings({
        enforced: true,
        knownGaps: 0,
        gaps: 0,
        staleKnownGaps: 1,
        staleVerifiedNa: 0,
      }),
    ).toBe(true);
    expect(
      coverageHasFindings({
        enforced: false,
        knownGaps: 0,
        gaps: 1,
        staleKnownGaps: 0,
        staleVerifiedNa: 0,
      }),
    ).toBe(false);
    expect(
      coverageHasFindings({
        enforced: false,
        knownGaps: 0,
        gaps: 0,
        staleKnownGaps: 0,
        staleVerifiedNa: 0,
        registryError: 'malformed registry',
      }),
    ).toBe(true);
  });
});

describe('buildAuditedComponentRoster', () => {
  it('uses an umbrella Storybook surface without adding an unknown duplicate', () => {
    expect(
      buildAuditedComponentRoster({
        sourceComponents: ['core/ChatComposer', 'core/ChatMessage'],
        storyComponents: ['core/chat', 'core/chatcomposer'],
        filters: ['chat'],
      }),
    ).toEqual(['core/chat']);
  });

  it('retains a package-qualified filter for a removed component', () => {
    expect(
      buildAuditedComponentRoster({
        sourceComponents: ['core/Button'],
        storyComponents: ['core/button'],
        filters: ['core/Removed'],
      }),
    ).toEqual(['core/removed']);
  });

  it('retains an unknown entry when neither source nor stories match', () => {
    expect(
      buildAuditedComponentRoster({
        sourceComponents: ['core/Button'],
        storyComponents: ['core/button'],
        filters: ['missing'],
      }),
    ).toEqual(['unknown/missing']);
  });
});

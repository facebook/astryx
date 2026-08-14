// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file a11y-baseline.test.mjs
 * Tests for the a11y baseline gate: key stability across DOM churn, diff
 * classification (new / baselined / resolved / unchecked), baseline
 * generation, and the failure summary format.
 */

import {describe, expect, it} from 'vitest';
import {
  buildBaseline,
  collectViolations,
  diffAgainstBaseline,
  formatDiffSummary,
  violationKey,
} from './a11y-baseline.js';

// Build a report in the shape accessibility-audit.js writes: per-component
// results with per-story raw axe violations under `storyDetails`.
function makeReport(componentStories) {
  const components = {};
  for (const [component, stories] of Object.entries(componentStories)) {
    const storyDetails = Object.entries(stories).map(([story, violations]) => ({
      story,
      violations,
    }));
    components[component] = {
      storiesAudited: storyDetails.length,
      violations: [],
      storyDetails,
    };
  }
  return {components, summary: {}};
}

function axeViolation(id, overrides = {}) {
  return {
    id,
    impact: 'serious',
    description: `${id} description`,
    help: `${id} help`,
    helpUrl: `https://dequeuniversity.com/rules/axe/4.10/${id}`,
    tags: ['wcag2a'],
    nodes: [{html: '<button></button>', target: ['#root > button']}],
    ...overrides,
  };
}

describe('violationKey', () => {
  it('is component + story + rule id, independent of DOM specifics', () => {
    expect(violationKey('Button', 'Primary', 'button-name')).toBe(
      'Button::Primary::button-name',
    );
  });
});

describe('collectViolations', () => {
  it('keys violations stably across unrelated DOM churn', () => {
    const before = makeReport({
      Button: {
        Primary: [
          axeViolation('button-name', {
            nodes: [{html: '<button class="a"></button>', target: ['.a']}],
          }),
        ],
      },
    });
    const after = makeReport({
      Button: {
        Primary: [
          axeViolation('button-name', {
            // Same violation, different selector/markup after a refactor.
            nodes: [
              {html: '<button class="b x"></button>', target: ['div > .b']},
            ],
          }),
        ],
      },
    });
    expect(collectViolations(before).map(v => v.key)).toEqual(
      collectViolations(after).map(v => v.key),
    );
  });

  it('falls back to the aggregated shape when storyDetails is absent', () => {
    const report = {
      components: {
        Card: {
          storiesAudited: 2,
          violations: [
            {
              id: 'color-contrast',
              impact: 'serious',
              help: 'contrast',
              helpUrl: 'https://example.com',
              stories: ['Default', 'Compact'],
              totalNodes: 3,
            },
          ],
        },
      },
    };
    expect(
      collectViolations(report)
        .map(v => v.key)
        .sort(),
    ).toEqual([
      'Card::Compact::color-contrast',
      'Card::Default::color-contrast',
    ]);
  });
});

describe('diffAgainstBaseline', () => {
  const report = makeReport({
    Button: {Primary: [axeViolation('button-name')]},
    Card: {Default: []},
  });

  it('flags violations missing from the baseline as new', () => {
    const diff = diffAgainstBaseline(report, {version: 1, entries: []});
    expect(diff.newViolations).toHaveLength(1);
    expect(diff.newViolations[0].key).toBe('Button::Primary::button-name');
    expect(diff.matched).toBe(0);
  });

  it('treats a missing baseline as empty (everything is new)', () => {
    expect(diffAgainstBaseline(report, null).newViolations).toHaveLength(1);
    expect(diffAgainstBaseline(report, undefined).newViolations).toHaveLength(
      1,
    );
  });

  it('passes when every violation is baselined', () => {
    const diff = diffAgainstBaseline(report, {
      version: 1,
      entries: [{key: 'Button::Primary::button-name', impact: 'serious'}],
    });
    expect(diff.newViolations).toEqual([]);
    expect(diff.matched).toBe(1);
    expect(diff.resolved).toEqual([]);
  });

  it('accepts bare string entries', () => {
    const diff = diffAgainstBaseline(report, {
      version: 1,
      entries: ['Button::Primary::button-name'],
    });
    expect(diff.newViolations).toEqual([]);
  });

  it('reports baseline entries for audited components as resolved', () => {
    const diff = diffAgainstBaseline(report, {
      version: 1,
      entries: [
        {key: 'Button::Primary::button-name'},
        {key: 'Card::Default::color-contrast'},
      ],
    });
    expect(diff.newViolations).toEqual([]);
    expect(diff.resolved).toEqual(['Card::Default::color-contrast']);
  });

  it('does not mark entries for unaudited components as resolved', () => {
    // CI only audits changed components; a baseline entry for a component
    // outside this run is unchecked, not resolved.
    const diff = diffAgainstBaseline(report, {
      version: 1,
      entries: [
        {key: 'Button::Primary::button-name'},
        {key: 'Dialog::Basic::aria-dialog-name'},
      ],
    });
    expect(diff.resolved).toEqual([]);
    expect(diff.unchecked).toEqual(['Dialog::Basic::aria-dialog-name']);
  });
});

describe('buildBaseline', () => {
  it('round-trips: a baseline built from a report gates that report clean', () => {
    const report = makeReport({
      Button: {Primary: [axeViolation('button-name')]},
      Dialog: {Basic: [axeViolation('aria-dialog-name', {impact: 'critical'})]},
    });
    const baseline = buildBaseline(report, {
      now: new Date('2026-07-25T00:00:00Z'),
    });
    expect(baseline.generatedAt).toBe('2026-07-25T00:00:00.000Z');
    expect(baseline.entries.map(e => e.key)).toEqual([
      'Button::Primary::button-name',
      'Dialog::Basic::aria-dialog-name',
    ]);

    const diff = diffAgainstBaseline(report, baseline);
    expect(diff.newViolations).toEqual([]);
    expect(diff.resolved).toEqual([]);
    expect(diff.matched).toBe(2);
  });

  it('preserves entries for components outside a scoped regeneration', () => {
    // `pnpm a11y:baseline -- --components Button` must not drop baseline
    // entries belonging to components that were not audited in this run.
    const existing = {
      version: 1,
      entries: [
        {key: 'Button::Primary::color-contrast', impact: 'serious'},
        {key: 'Dialog::Basic::aria-dialog-name', impact: 'critical'},
        'Toast::Stacked::aria-live-region',
      ],
    };
    const scopedReport = makeReport({
      Button: {Primary: [axeViolation('button-name')]},
    });
    const baseline = buildBaseline(scopedReport, {existing});
    expect(baseline.entries.map(e => e.key)).toEqual([
      // Button entries replaced by the fresh audit (color-contrast dropped,
      // button-name added); Dialog/Toast entries preserved untouched.
      'Button::Primary::button-name',
      'Dialog::Basic::aria-dialog-name',
      'Toast::Stacked::aria-live-region',
    ]);
  });
});

describe('formatDiffSummary', () => {
  it('describes new violations with rule, impact, location, and remediation', () => {
    const report = makeReport({
      Button: {Primary: [axeViolation('button-name')]},
    });
    const summary = formatDiffSummary(
      diffAgainstBaseline(report, {version: 1, entries: []}),
      {baselinePath: '.github/a11y-baseline.json'},
    );
    expect(summary).toContain('button-name');
    expect(summary).toContain('[serious]');
    expect(summary).toContain('Button / Primary');
    expect(summary).toContain('pnpm a11y:audit');
    expect(summary).toContain('pnpm a11y:baseline');
    expect(summary).toContain('.github/a11y-baseline.json');
  });

  it('notes resolved entries as removable without failing language', () => {
    const report = makeReport({Button: {Primary: []}});
    const summary = formatDiffSummary(
      diffAgainstBaseline(report, {
        version: 1,
        entries: ['Button::Primary::button-name'],
      }),
    );
    expect(summary).toContain('can be removed');
    expect(summary).toContain('Button::Primary::button-name');
    expect(summary).toContain('Gate passed');
  });
});

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
  const auditedStoryKeys = Object.entries(componentStories).flatMap(
    ([component, stories]) =>
      Object.keys(stories).map(story => `${component}::${story}`),
  );
  return {auditedStoryKeys, components, summary: {}};
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

const RICH_TEXT_BASELINE_KEYS = [
  'Controlled Persistence',
  'Custom Transformers',
  'Default',
  'Error Status',
  'Imperative Ref',
  'Markdown Serializers',
  'Read Only',
  'Required',
  'With Character Limit',
  'With Description',
  'With Initial Value',
  'With Toolbar',
].flatMap(story => [
  `RichTextEditor::${story}::aria-input-field-name`,
  ...(story === 'Markdown Serializers'
    ? [`RichTextEditor::${story}::label`]
    : []),
]);

function makeRoutedReport({
  owner,
  storyId,
  component,
  story,
  violations = [],
  legacyStoryOwners,
}) {
  const canonicalStoryKey = `${owner}::${storyId}`;
  const legacyStoryKey = `${component}::${story}`;
  return {
    ownerStoryRoutes: {[owner]: [storyId]},
    ownerStoryKeys: {[owner]: [canonicalStoryKey]},
    auditedStories: [{owner, storyId, legacyStoryKey}],
    auditedStoryKeys: [canonicalStoryKey],
    legacyStoryOwners: legacyStoryOwners ?? {
      [legacyStoryKey]: [canonicalStoryKey],
    },
    components: {
      [component]: {
        storiesAudited: 1,
        violations: [],
        storyDetails:
          violations.length > 0 ? [{story, storyId, violations}] : [],
      },
    },
    summary: {},
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

  it('keeps baseline entries for unscanned stories of a routed owner unchecked', () => {
    const scopedReport = makeRoutedReport({
      owner: 'richtext/RichTextEditorToolbar',
      storyId: 'lab-richtexteditor--with-toolbar',
      component: 'RichTextEditor',
      story: 'With Toolbar',
    });
    const diff = diffAgainstBaseline(scopedReport, {
      version: 1,
      entries: RICH_TEXT_BASELINE_KEYS.map(key => ({key})),
    });

    expect(diff.resolved).toEqual([
      'RichTextEditor::With Toolbar::aria-input-field-name',
    ]);
    expect(diff.unchecked).toHaveLength(12);
    expect(diff.unchecked).toContain(
      'RichTextEditor::Default::aria-input-field-name',
    );
  });

  it('keeps colliding Core Tooltip baseline evidence outside a Charts-only audit', () => {
    const legacyStoryOwners = {
      'Tooltip::Default': [
        'core/Tooltip::core-tooltip--default',
        'charts/ChartTooltip::charts-chrome-tooltip--default',
      ],
    };
    const scopedReport = makeRoutedReport({
      owner: 'charts/ChartTooltip',
      storyId: 'charts-chrome-tooltip--default',
      component: 'Tooltip',
      story: 'Default',
      legacyStoryOwners,
    });
    const legacyKey = 'Tooltip::Default::color-contrast';
    const coreKey =
      'core/Tooltip::core-tooltip--default::color-contrast';
    const chartsKey =
      'charts/ChartTooltip::charts-chrome-tooltip--default::color-contrast';
    const diff = diffAgainstBaseline(scopedReport, {
      version: 1,
      entries: [{key: legacyKey}, {key: coreKey}, {key: chartsKey}],
    });

    expect(diff.resolved).toEqual([chartsKey]);
    expect(diff.unchecked).toEqual([legacyKey, coreKey]);

    const violatingReport = makeRoutedReport({
      owner: 'charts/ChartTooltip',
      storyId: 'charts-chrome-tooltip--default',
      component: 'Tooltip',
      story: 'Default',
      violations: [axeViolation('color-contrast')],
      legacyStoryOwners,
    });
    const collisionDiff = diffAgainstBaseline(violatingReport, {
      version: 1,
      entries: [{key: legacyKey}],
    });
    expect(collisionDiff.newViolations.map(violation => violation.key)).toEqual([
      chartsKey,
    ]);
    expect(collisionDiff.unchecked).toEqual([legacyKey]);
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

  it('preserves unscanned stories when regenerating one routed owner story', () => {
    const existing = {
      version: 1,
      entries: RICH_TEXT_BASELINE_KEYS.map(key => ({key})),
    };
    const scopedReport = makeRoutedReport({
      owner: 'richtext/RichTextEditorToolbar',
      storyId: 'lab-richtexteditor--with-toolbar',
      component: 'RichTextEditor',
      story: 'With Toolbar',
    });
    const baseline = buildBaseline(scopedReport, {existing});

    expect(baseline.entries).toHaveLength(12);
    expect(baseline.entries.map(entry => entry.key)).not.toContain(
      'RichTextEditor::With Toolbar::aria-input-field-name',
    );
    expect(baseline.entries.map(entry => entry.key)).toContain(
      'RichTextEditor::Default::aria-input-field-name',
    );
  });

  it('migrates a unique audited legacy key to package and story identity', () => {
    const legacyKey =
      'RichTextEditor::With Toolbar::aria-input-field-name';
    const scopedReport = makeRoutedReport({
      owner: 'richtext/RichTextEditorToolbar',
      storyId: 'lab-richtexteditor--with-toolbar',
      component: 'RichTextEditor',
      story: 'With Toolbar',
      violations: [axeViolation('aria-input-field-name')],
    });
    const baseline = buildBaseline(scopedReport, {
      existing: {version: 1, entries: [{key: legacyKey}]},
    });

    expect(baseline.entries.map(entry => entry.key)).toEqual([
      'richtext/RichTextEditorToolbar::lab-richtexteditor--with-toolbar::aria-input-field-name',
    ]);
    expect(
      diffAgainstBaseline(scopedReport, {
        version: 1,
        entries: [{key: legacyKey}],
      }).newViolations,
    ).toEqual([]);
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

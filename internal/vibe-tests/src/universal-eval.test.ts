// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  evaluate,
  loadAxeResults,
  getA11yDimensionLabel,
  type AxeResultForPrompt,
} from './universal-eval.js';

const dirs: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-eval-'));
  dirs.push(d);
  return d;
}
afterAll(() => dirs.forEach(d => fs.rmSync(d, {recursive: true})));

// Component-composed output — no raw HTML, so no static a11y rule can fire.
// This is the #4145 blind spot: the score is 100 by construction.
const COMPOSED_CODE = `
import {XDSButton, XDSTextInput, XDSHeading} from '@astryxdesign/core';
export default function App() {
  return (
    <>
      <XDSHeading level={1}>Dashboard</XDSHeading>
      <XDSTextInput label="Name" />
      <XDSButton onClick={() => {}}>Save</XDSButton>
    </>
  );
}
`;

const AXE_FIXTURE: AxeResultForPrompt = {
  target: 'astryx',
  themesScanned: ['light', 'dark'],
  passes: 24,
  incomplete: 1,
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      help: 'Elements must have sufficient color contrast',
      nodes: 3,
      themes: ['dark'],
    },
    {
      id: 'button-name',
      impact: 'critical',
      help: 'Buttons must have discernible text',
      nodes: 1,
      themes: ['light', 'dark'],
    },
  ],
};

// ============================================================
// Pinning tests — existing static-rule behavior (guards refactor)
// ============================================================

describe('accessibility static rules (pinned behavior)', () => {
  it('penalizes onClick on a non-interactive element without role or tabIndex', () => {
    const code = `export default () => <div onClick={() => {}}>hi</div>;`;
    const {accessibility} = evaluate(code, 'html');
    expect(accessibility.score).toBe(85);
    expect(accessibility.findings?.map(f => f.rule)).toContain(
      'click-non-interactive',
    );
  });

  it('penalizes an icon-only button without aria-label', () => {
    const code = `export default () => <button><svg viewBox="0 0 1 1" /></button>;`;
    const {accessibility} = evaluate(code, 'html');
    expect(accessibility.findings?.map(f => f.rule)).toContain(
      'icon-button-no-label',
    );
  });

  it('penalizes a form input without a label', () => {
    const code = `export default () => <input type="text" />;`;
    const {accessibility} = evaluate(code, 'html');
    expect(accessibility.findings?.map(f => f.rule)).toContain(
      'input-no-label',
    );
  });

  it('penalizes an image without alt text', () => {
    const code = `export default () => <img src="/a.png" />;`;
    const {accessibility} = evaluate(code, 'html');
    expect(accessibility.findings?.map(f => f.rule)).toContain('img-no-alt');
  });

  it('penalizes a skipped heading level', () => {
    const code = [
      `export default () => (`,
      `  <div>`,
      `    <h1>Title</h1>`,
      `    <h3>Sub</h3>`,
      `  </div>`,
      `);`,
    ].join('\n');
    const {accessibility} = evaluate(code, 'html');
    expect(accessibility.findings?.map(f => f.rule)).toContain('heading-skip');
  });

  it('scores 100 for component-composed code (the #4145 blind spot)', () => {
    const {accessibility} = evaluate(COMPOSED_CODE, 'astryx');
    expect(accessibility.score).toBe(100);
  });
});

// ============================================================
// New: eligibility metrics (issue #4145 proposal 4)
// ============================================================

describe('accessibility eligibility metrics', () => {
  it('reports zero eligible sites for component-composed code, exposing the score ceiling', () => {
    const {accessibility} = evaluate(COMPOSED_CODE, 'astryx');
    expect(accessibility.metrics).toBeDefined();
    expect(accessibility.metrics?.eligibleSites).toBe(0);
    expect(accessibility.metrics?.rulesFired).toBe(0);
    expect(accessibility.metrics?.runtime).toBe(false);
  });

  it('counts eligible sites per rule for raw-HTML code', () => {
    const code = [
      `export default function App() {`,
      `  return (`,
      `    <div>`,
      `      <img src="/a.png" alt="A" />`,
      `      <img src="/b.png" />`,
      `      <input type="text" aria-label="q" />`,
      `      <h1>Title</h1>`,
      `      <h3>Sub</h3>`,
      `    </div>`,
      `  );`,
      `}`,
    ].join('\n');
    const {accessibility} = evaluate(code, 'html');
    const m = accessibility.metrics;
    expect(m?.eligibleByRule['img-no-alt']).toBe(2);
    expect(m?.eligibleByRule['input-no-label']).toBe(1);
    expect(m?.eligibleByRule['heading-skip']).toBe(1);
    expect(m?.eligibleByRule['click-non-interactive']).toBe(0);
    expect(m?.eligibleSites).toBe(4);
    expect(m?.rulesFired).toBe(2); // img-no-alt + heading-skip
  });
});

// ============================================================
// New: loadAxeResults sidecar loader (mirrors loadBuildErrors)
// ============================================================

describe('loadAxeResults', () => {
  it('parses an axe-results.json sidecar keyed by promptId', () => {
    const dir = tmpDir();
    fs.writeFileSync(
      path.join(dir, 'axe-results.json'),
      JSON.stringify({'cwm-1': AXE_FIXTURE}),
    );
    const results = loadAxeResults(dir);
    expect(results?.['cwm-1'].violations).toHaveLength(2);
    expect(results?.['cwm-1'].themesScanned).toEqual(['light', 'dark']);
  });

  it('returns null when the sidecar is absent (older iterations)', () => {
    expect(loadAxeResults(tmpDir())).toBeNull();
  });

  it('returns null for a malformed sidecar', () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'axe-results.json'), '{not json');
    expect(loadAxeResults(dir)).toBeNull();
  });
});

// ============================================================
// New: runtime axe fold-in (issue #4145 proposal 1)
// ============================================================

describe('accessibility runtime fold-in', () => {
  it('penalizes axe violations by impact when runtime results are present', () => {
    // serious −10, critical −15 → 100 − 25 = 75
    const {accessibility} = evaluate(COMPOSED_CODE, 'astryx', {
      axeResult: AXE_FIXTURE,
    });
    expect(accessibility.score).toBe(75);
    expect(accessibility.findings?.map(f => f.rule)).toEqual(
      expect.arrayContaining(['axe:color-contrast', 'axe:button-name']),
    );
  });

  it('records runtime metrics when axe results are present', () => {
    const {accessibility} = evaluate(COMPOSED_CODE, 'astryx', {
      axeResult: AXE_FIXTURE,
    });
    const m = accessibility.metrics;
    expect(m?.runtime).toBe(true);
    expect(m?.axeViolationCount).toBe(2);
    expect(m?.axeImpacts).toEqual({serious: 1, critical: 1});
    expect(m?.axePasses).toBe(24);
    expect(m?.axeIncomplete).toBe(1);
    expect(m?.themesScanned).toEqual(['light', 'dark']);
  });

  it('does not double-penalize static rules that axe verifies at runtime', () => {
    // Static img-no-alt overlaps axe image-alt: with runtime data present the
    // static finding is reported but only the axe violation is penalized.
    const code = `export default () => <img src="/a.png" />;`;
    const axe: AxeResultForPrompt = {
      target: 'html',
      themesScanned: ['light'],
      passes: 10,
      incomplete: 0,
      violations: [
        {
          id: 'image-alt',
          impact: 'critical',
          help: 'Images must have alternative text',
          nodes: 1,
          themes: ['light'],
        },
      ],
    };
    const {accessibility} = evaluate(code, 'html', {axeResult: axe});
    expect(accessibility.score).toBe(85); // one −15, not −23
    expect(accessibility.findings?.map(f => f.rule)).toContain('img-no-alt');
  });

  it('suppresses each axe-covered static rule from penalty when runtime data is present', () => {
    const cleanAxe: AxeResultForPrompt = {
      target: 'html',
      themesScanned: ['light'],
      passes: 10,
      incomplete: 0,
      violations: [],
    };
    const fixtures: Array<{rule: string; code: string}> = [
      {
        rule: 'icon-button-no-label',
        code: `export default () => <button><svg viewBox="0 0 1 1" /></button>;`,
      },
      {
        rule: 'input-no-label',
        code: `export default () => <input type="text" />;`,
      },
      {rule: 'img-no-alt', code: `export default () => <img src="/a.png" />;`},
      {
        rule: 'heading-skip',
        code: [
          `export default () => (`,
          `  <div>`,
          `    <h1>T</h1>`,
          `    <h3>S</h3>`,
          `  </div>`,
          `);`,
        ].join('\n'),
      },
    ];
    for (const {rule, code} of fixtures) {
      const {accessibility} = evaluate(code, 'html', {axeResult: cleanAxe});
      expect(
        accessibility.findings?.map(f => f.rule),
        rule,
      ).toContain(rule);
      expect(accessibility.score, rule).toBe(100);
    }
  });

  it('penalizes an unrecognized axe impact at the moderate rate', () => {
    const axe = {
      target: 'html',
      themesScanned: ['light'],
      passes: 10,
      incomplete: 0,
      violations: [
        {
          id: 'future-rule',
          impact: 'widget',
          help: 'future',
          nodes: 1,
          themes: ['light'],
        },
      ],
    } as unknown as AxeResultForPrompt;
    const {accessibility} = evaluate(COMPOSED_CODE, 'astryx', {axeResult: axe});
    expect(accessibility.score).toBe(92);
  });

  it('floors the score at 0 when axe penalties exceed 100', () => {
    const axe: AxeResultForPrompt = {
      target: 'html',
      themesScanned: ['light'],
      passes: 0,
      incomplete: 0,
      violations: Array.from({length: 8}, (_, i) => ({
        id: `rule-${i}`,
        impact: 'critical' as const,
        help: 'broken',
        nodes: 1,
        themes: ['light'],
      })),
    };
    const {accessibility} = evaluate(COMPOSED_CODE, 'astryx', {axeResult: axe});
    expect(accessibility.score).toBe(0);
  });

  it('still penalizes click-on-non-interactive statically since axe cannot see React handlers', () => {
    const code = `export default () => <div onClick={() => {}}>hi</div>;`;
    const axe: AxeResultForPrompt = {
      target: 'html',
      themesScanned: ['light'],
      passes: 10,
      incomplete: 0,
      violations: [],
    };
    const {accessibility} = evaluate(code, 'html', {axeResult: axe});
    expect(accessibility.score).toBe(85);
  });

  it('resolves the axe sidecar from iterDir and promptId like build-errors.json', () => {
    const dir = tmpDir();
    fs.writeFileSync(
      path.join(dir, 'axe-results.json'),
      JSON.stringify({'cwm-1': AXE_FIXTURE}),
    );
    const {accessibility} = evaluate(COMPOSED_CODE, 'astryx', {
      iterDir: dir,
      promptId: 'cwm-1',
    });
    expect(accessibility.metrics?.runtime).toBe(true);
    expect(accessibility.score).toBe(75);
  });

  it('falls back to static-only scoring when no sidecar exists for the prompt', () => {
    const dir = tmpDir();
    const {accessibility} = evaluate(COMPOSED_CODE, 'astryx', {
      iterDir: dir,
      promptId: 'cwm-1',
    });
    expect(accessibility.metrics?.runtime).toBe(false);
    expect(accessibility.score).toBe(100);
  });
});

// ============================================================
// New: honest dimension label (issue #4145 proposal 3)
// ============================================================

describe('getA11yDimensionLabel', () => {
  it('labels the static-only score as composition hygiene', () => {
    expect(getA11yDimensionLabel(false)).toBe('A11y Hygiene (composition)');
  });

  it('labels the runtime-backed score as accessibility', () => {
    expect(getA11yDimensionLabel(true)).toBe(
      'Accessibility (runtime + hygiene)',
    );
  });
});

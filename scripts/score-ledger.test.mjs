// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file score-ledger.test.mjs
 * Unit tests for the component score ledger — chiefly the ratchet, whose whole
 * job is to fail on a regression this diff caused and on nothing else.
 *
 * The behaviours pinned here are the ones a contributor feels:
 *   - an unaudited component never blocks;
 *   - debt already on the row never blocks;
 *   - a new BLOCK blocks even when the total went up;
 *   - a rubric-version change is `incomparable`, not a failure;
 *   - an unreadable ledger passes.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, it, expect} from 'vitest';

import {
  SECTION_WEIGHTS,
  SECTION_IDS,
  applyScorecard,
  blockLink,
  buildQueue,
  buildRoster,
  buildStats,
  compareEntry,
  gradeFor,
  isComponentDirectory,
  issueBody,
  listComponents,
  loadLedger,
  runRatchet,
  weakestSection,
} from './score-ledger.mjs';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

/** A minimal audited entry. */
const entry = (over = {}) => ({
  component: 'Button',
  package: 'core',
  status: 'audited',
  score: 70,
  grade: 'C',
  sections: {},
  blocks: {count: 0, open: []},
  distinct_defects: 1,
  fixes: null,
  nits: null,
  lastAudited: '2026-08-01',
  rubricVersion: '1.2',
  mode: 'O',
  commit: 'abc1234567',
  evidence: [],
  ...over,
});

const withBlocks = (...blocks) => ({
  count: blocks.length,
  open: blocks.map(b => (typeof b === 'string' ? {id: b, summary: b, issue: null} : b)),
});

// ---------------------------------------------------------------------------

describe('the ratchet', () => {
  it('passes an unaudited component — no baseline, judged on merits', () => {
    const r = compareEntry('Toast', null, null);
    expect(r.verdict).toBe('pass');
    expect(r.reason).toMatch(/unaudited/);
    // Nothing that reads as an accusation against the pull request.
    expect(r.reason).not.toMatch(/BLOCK|fail|regress/i);
  });

  it('passes when only the head is unaudited', () => {
    expect(compareEntry('Button', entry(), null).verdict).toBe('pass');
  });

  it('passes the first audit — there is nothing to ratchet against', () => {
    const r = compareEntry('Button', null, entry({score: 41}));
    expect(r.verdict).toBe('pass');
    expect(r.reason).toMatch(/first audit/);
  });

  it('passes known debt that did not change', () => {
    const base = entry({score: 62.6, blocks: withBlocks('A11', 'T6')});
    const head = entry({score: 62.6, blocks: withBlocks('A11', 'T6')});
    const r = compareEntry('Button', base, head);
    expect(r.verdict).toBe('pass');
    expect(r.reason).toBe('unchanged');
    expect(r.newBlocks).toEqual([]);
  });

  it('passes an improvement', () => {
    const r = compareEntry(
      'Button',
      entry({score: 62.6, blocks: withBlocks('A11')}),
      entry({score: 75, blocks: withBlocks('A11')}),
    );
    expect(r.verdict).toBe('pass');
    expect(r.reason).toMatch(/improved 62\.6 -> 75/);
  });

  it('fails a score decrease', () => {
    const r = compareEntry('Button', entry({score: 70}), entry({score: 69.9}));
    expect(r.verdict).toBe('fail');
    expect(r.reason).toBe('score decreased 70 -> 69.9');
  });

  it('fails a new BLOCK even when the score went UP', () => {
    const r = compareEntry(
      'Button',
      entry({score: 62.6, blocks: withBlocks('A11')}),
      entry({
        score: 88,
        grade: 'C',
        blocks: withBlocks('A11', {id: 'T6', summary: 'elevation is unthemeable', issue: 99}),
      }),
    );
    expect(r.verdict).toBe('fail');
    expect(r.reason).toMatch(/new BLOCK: T6/);
    expect(r.newBlocks.map(b => b.id)).toEqual(['T6']);
  });

  it('names only the NEW BLOCK, never the inherited ones', () => {
    const r = compareEntry(
      'SideNav',
      entry({blocks: withBlocks('A13', 'I2')}),
      entry({blocks: withBlocks('A13', 'I2', 'D13')}),
    );
    expect(r.reason).toContain('D13');
    expect(r.reason).not.toContain('A13');
    expect(r.reason).not.toContain('I2');
  });

  it('fails when the BLOCK count rises with no named id — the count is the authority', () => {
    const r = compareEntry(
      'Tooltip',
      entry({blocks: {count: 4, open: [{id: 'A8', summary: 'no touch path', issue: 3885}]}}),
      entry({blocks: {count: 5, open: [{id: 'A8', summary: 'no touch path', issue: 3885}]}}),
    );
    expect(r.verdict).toBe('fail');
    expect(r.reason).toMatch(/count rose 4 -> 5/);
  });

  it('reports `incomparable` on a rubric-version change and does NOT fail', () => {
    const r = compareEntry(
      'Button',
      entry({score: 62.6, rubricVersion: '1.1'}),
      entry({score: 41, rubricVersion: '1.2'}),
    );
    expect(r.verdict).toBe('incomparable');
    expect(r.verdict).not.toBe('fail');
    expect(r.reason).toMatch(/incomparable — rubric version changed \(1\.1 -> 1\.2\)/);
    expect(r.reason).toMatch(/re-audit/);
  });

  it('does not fail on a version change even when a new BLOCK appears — the scales differ', () => {
    const r = compareEntry(
      'Button',
      entry({rubricVersion: '1.1', blocks: withBlocks('A11')}),
      entry({rubricVersion: '1.2', blocks: withBlocks('A11', 'D13')}),
    );
    expect(r.verdict).toBe('incomparable');
  });

  it('runRatchet fails the run when any component regressed', () => {
    const base = {components: [entry({component: 'Button'}), entry({component: 'Badge'})]};
    const head = {
      components: [entry({component: 'Button'}), entry({component: 'Badge', score: 10})],
    };
    const {results, failed} = runRatchet(['Button', 'Badge'], base, head);
    expect(failed).toBe(true);
    expect(results.find(r => r.component === 'Button').verdict).toBe('pass');
    expect(results.find(r => r.component === 'Badge').verdict).toBe('fail');
  });

  it('runRatchet passes when a touched component is absent from both ledgers', () => {
    const {failed, results} = runRatchet(['Toast'], {components: []}, {components: []});
    expect(failed).toBe(false);
    expect(results[0].verdict).toBe('pass');
  });
});

describe('loadLedger never throws', () => {
  it('reports an unreadable path instead of throwing, so CI can pass with a warning', async () => {
    const {ledger, error} = await loadLedger('/nonexistent/component-scores.json');
    expect(ledger).toBeNull();
    expect(error).toMatch(/component-scores\.json/);
  });

  it('rejects JSON that is not a ledger', async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-')), 'l.json');
    fs.writeFileSync(file, JSON.stringify({nope: true}));
    const {ledger, error} = await loadLedger(file);
    expect(ledger).toBeNull();
    expect(error).toMatch(/missing a `components` array/);
  });

  it('reads a real ledger', async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-')), 'l.json');
    fs.writeFileSync(file, JSON.stringify({ledgerVersion: 1, components: [entry()]}));
    const {ledger, error} = await loadLedger(file);
    expect(error).toBeNull();
    expect(ledger.components).toHaveLength(1);
  });
});

describe('the canonical component predicate', () => {
  const coreSrc = path.join(REPO_ROOT, 'packages/core/src');

  it('accepts a real component directory', () => {
    expect(isComponentDirectory(coreSrc, 'Button')).toBe(true);
    expect(isComponentDirectory(coreSrc, 'Badge')).toBe(true);
  });

  it('rejects the infrastructure directories', () => {
    for (const dir of ['hooks', 'theme', 'utils', 'i18n', '__tests__']) {
      expect(isComponentDirectory(coreSrc, dir), dir).toBe(false);
    }
  });

  it('rejects a styles-only directory (NavItem)', () => {
    expect(isComponentDirectory(coreSrc, 'NavItem')).toBe(false);
  });

  it('rejects context-only directories that render nothing', () => {
    expect(isComponentDirectory(coreSrc, 'SizeContext')).toBe(false);
    expect(isComponentDirectory(coreSrc, 'InteractiveRoleContext')).toBe(false);
  });

  it('rejects a directory that does not exist', () => {
    expect(isComponentDirectory(coreSrc, 'NotAThing')).toBe(false);
  });

  it('lists both packages, sorted, with no infrastructure', () => {
    const all = listComponents(REPO_ROOT);
    const names = all.map(c => c.component);
    expect(names).toContain('Button');
    expect(names).toContain('Stepper');
    expect(names).not.toContain('hooks');
    expect(names).not.toContain('NavItem');
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
    expect(new Set(all.map(c => c.package))).toEqual(new Set(['core', 'lab']));
  });
});

describe('grades', () => {
  it('bands by score', () => {
    expect(gradeFor(95)).toBe('A');
    expect(gradeFor(80)).toBe('B');
    expect(gradeFor(70)).toBe('C');
    expect(gradeFor(60)).toBe('D');
    expect(gradeFor(59.9)).toBe('F');
    expect(gradeFor(null)).toBeNull();
  });

  it('caps at C when any BLOCK is open, whatever the arithmetic says', () => {
    expect(gradeFor(95, 1)).toBe('C');
    expect(gradeFor(85, 3)).toBe('C');
    expect(gradeFor(65, 1)).toBe('D');
    expect(gradeFor(40, 9)).toBe('F');
  });
});

describe('the section vocabulary matches the rubric', () => {
  it('weights sum to 100', () => {
    expect(Object.values(SECTION_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it('carries all eleven rubric sections', () => {
    expect(SECTION_IDS).toEqual([
      'a11y',
      'theming',
      'api',
      'behavior',
      'design_objective',
      'design_rendered',
      'testing',
      'code_health',
      'docs',
      'i18n_rtl',
      'responsive',
    ]);
  });

  it('reads the weakest SCORED section, ignoring unmeasured ones', () => {
    const e = entry({
      sections: {
        a11y: {score: 1, weight: 16, state: 'unpublished'},
        design_objective: {score: 4, weight: 6, state: 'scored'},
        design_rendered: {score: 2, weight: 4, state: 'scored'},
        testing: {score: 0, weight: 8, state: 'not_measured'},
      },
    });
    expect(weakestSection(e)).toEqual({id: 'design_rendered', score: 2});
  });
});

describe('roster, queue and stats', () => {
  const roster = [
    {component: 'Alpha', package: 'core', live: true, entry: null},
    {
      component: 'Beta',
      package: 'core',
      live: true,
      entry: entry({component: 'Beta', score: 80, grade: 'B', lastAudited: '2026-07-01'}),
    },
    {
      component: 'Gamma',
      package: 'lab',
      live: true,
      entry: entry({
        component: 'Gamma',
        score: 50,
        grade: 'F',
        lastAudited: '2026-06-01',
        blocks: withBlocks('A1', 'A2'),
      }),
    },
    {component: 'Zeta', package: 'lab', live: true, entry: null},
  ];

  it('queues never-audited components first, alphabetically', () => {
    const q = buildQueue(roster);
    expect(q.slice(0, 2).map(e => e.component)).toEqual(['Alpha', 'Zeta']);
    expect(q[0].why).toBe('never audited');
  });

  it('then queues audited components oldest-first', () => {
    const q = buildQueue(roster);
    expect(q.slice(2).map(e => e.component)).toEqual(['Gamma', 'Beta']);
  });

  it('honours --limit', () => {
    expect(buildQueue(roster, 3)).toHaveLength(3);
  });

  it('joins the live roster with the ledger and flags orphan rows', () => {
    const ledger = {
      components: [entry({component: 'Beta'}), entry({component: 'Deleted'})],
    };
    const joined = buildRoster(ledger, [
      {component: 'Alpha', package: 'core'},
      {component: 'Beta', package: 'core'},
    ]);
    expect(joined.map(r => r.component)).toEqual(['Alpha', 'Beta', 'Deleted']);
    expect(joined.find(r => r.component === 'Alpha').entry).toBeNull();
    expect(joined.find(r => r.component === 'Deleted').live).toBe(false);
  });

  it('summarises coverage, grades and open BLOCKs', () => {
    const s = buildStats(roster);
    expect(s.total).toBe(4);
    expect(s.audited).toBe(2);
    expect(s.unaudited).toBe(2);
    expect(s.percentAudited).toBe(50);
    expect(s.grades).toMatchObject({B: 1, F: 1});
    expect(s.openBlocks).toBe(2);
    expect(s.componentsWithBlocks).toBe(1);
    expect(s.oldestAudit).toBe('2026-06-01');
    expect(s.byPackage.core).toEqual({total: 2, audited: 1});
  });
});

describe('recording a scorecard', () => {
  const card = {
    score: 74.2,
    lastAudited: '2026-08-10',
    rubricVersion: '1.2',
    mode: 'O',
    commit: 'dccdabea0b',
    blocks: {count: 1, open: [{id: 'A18', summary: 'baseline entries silence axe'}]},
  };

  it('derives the grade, applying the open-BLOCK cap', () => {
    const e = applyScorecard(null, card, {component: 'Badge', pkg: 'core'});
    expect(e.grade).toBe('C');
    expect(e.status).toBe('audited');
    expect(e.package).toBe('core');
  });

  it('normalises a BLOCK with no issue to `issue: null` rather than dropping it', () => {
    const e = applyScorecard(null, card, {component: 'Badge', pkg: 'core'});
    expect(e.blocks.open[0].issue).toBeNull();
  });

  it('rejects a grade that contradicts the score', () => {
    expect(() =>
      applyScorecard(null, {...card, grade: 'A'}, {component: 'Badge', pkg: 'core'}),
    ).toThrow(/contradicts score/);
  });

  it('rejects an unknown field rather than storing it silently', () => {
    expect(() =>
      applyScorecard(null, {...card, sore: 74}, {component: 'Badge', pkg: 'core'}),
    ).toThrow(/unknown scorecard field\(s\): sore/);
  });

  it('rejects an unknown section id and an unknown section state', () => {
    expect(() =>
      applyScorecard(null, {...card, sections: {a11yy: {score: 3}}}, {component: 'B', pkg: 'core'}),
    ).toThrow(/unknown section id/);
    expect(() =>
      applyScorecard(
        null,
        {...card, sections: {a11y: {score: 3, state: 'vibes'}}},
        {component: 'B', pkg: 'core'},
      ),
    ).toThrow(/unknown section state/);
  });

  it('fills each section weight from the rubric', () => {
    const e = applyScorecard(
      null,
      {...card, sections: {a11y: {score: 3, state: 'scored'}}},
      {component: 'B', pkg: 'core'},
    );
    expect(e.sections.a11y.weight).toBe(16);
  });

  it('rejects more listed BLOCKs than the count claims', () => {
    expect(() =>
      applyScorecard(
        null,
        {...card, blocks: {count: 1, open: [{id: 'A1', summary: 'x'}, {id: 'A2', summary: 'y'}]}},
        {component: 'B', pkg: 'core'},
      ),
    ).toThrow(/BLOCKs listed but blocks.count is 1/);
  });

  it('refuses to store an unaudited row — an unaudited component simply has none', () => {
    expect(() =>
      applyScorecard(null, {...card, status: 'unaudited'}, {component: 'B', pkg: 'core'}),
    ).toThrow(/audited components only/);
  });

  it('requires the rubric version, the date and the mode', () => {
    for (const field of ['rubricVersion', 'lastAudited', 'mode']) {
      const partial = {...card};
      delete partial[field];
      expect(() =>
        applyScorecard(null, partial, {component: 'B', pkg: 'core'}),
        field,
      ).toThrow(new RegExp(field));
    }
  });
});

describe('issue plumbing', () => {
  it('links a filed BLOCK and says so when one is not filed', () => {
    expect(blockLink({id: 'A8', summary: 'x', issue: 3885})).toContain(
      'https://github.com/facebook/astryx/issues/3885',
    );
    expect(blockLink({id: 'A8', summary: 'x', issue: null})).toContain('no issue filed');
  });

  it('writes an issue body that stands on its own', () => {
    const body = issueBody(
      'Button',
      entry({mode: 'O', rubricVersion: '1.2', commit: 'dccdabea0b', score: 62.6, grade: 'D'}),
      {
        id: 'T6',
        section: '§2 Theming & token integrity',
        summary: 'elevation is absent from themeProps',
        evidence: 'Button.tsx',
        fix: 'add elevation to the themeProps call on the painting element',
      },
    );
    expect(body).toContain('`T6`');
    expect(body).toContain('§2 Theming & token integrity');
    expect(body).toContain('rubric **v1.2**');
    expect(body).toContain('Component-Audit-Rubric');
    expect(body).toContain('Component-Scores');
    expect(body).toContain('Button.tsx');
    expect(body).toContain('Closing protocol');
    expect(body).toContain("If the recorded score doesn't move");
  });
});

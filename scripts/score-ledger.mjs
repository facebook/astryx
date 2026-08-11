#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file score-ledger.mjs
 * @description The component score ledger — read, report, queue and ratchet the
 *   per-component audit scores produced by the Component Audit Rubric.
 * @input Subcommand flags (see USAGE below) plus `--ledger <path|url>`.
 * @output Human-readable tables on stdout, a generated Markdown table with
 *   `--report`, an updated ledger JSON with `--record`, and a non-zero exit
 *   from `--check` when the ratchet trips.
 * @position Standalone CLI, and the module every other surface imports.
 *
 *   Two halves, deliberately separate:
 *     - the ROSTER (which components exist) is derived from the packages here,
 *       by the canonical predicate below — rubric decision #15;
 *     - the SCORES live in the wiki, in `component-scores.json` beside the
 *       generated Component-Scores page, because recording a score must not
 *       require a pull request.
 *   A component with no ledger entry is unaudited. Nothing has to maintain a
 *   list of unaudited components: the roster is the packages.
 *
 * SYNC: When the schema changes, update the preamble emitted by `--report`
 *   (renderTable), the Component-Audit-Rubric wiki page, and
 *   apps/sandbox/scripts/generate-score-ledger.mjs.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Where the scores live when no `--ledger` is given. */
export const DEFAULT_LEDGER_URL =
  'https://raw.githubusercontent.com/wiki/facebook/astryx/component-scores.json';

const USAGE = `
Usage: node scripts/score-ledger.mjs <subcommand> [options]

Subcommands
  --check                 Ratchet / standing report for the components a PR touches.
  --report                Regenerate the Markdown table (Component-Scores.md).
  --queue                 The auditor's work queue: unaudited first, then
                          oldest-audited, then lowest-scoring.
  --stats                 Distribution summary.
  --record <Component>    Write one component's scorecard into the ledger and
                          regenerate the table.
  --file-issues <Component>
                          File one GitHub issue per open BLOCK that has none,
                          via gh, and write the numbers back into the ledger.

Options
  --ledger <path|url>       Ledger source. Default: the wiki raw URL.
                            --record needs a local path (it writes).
  --base-ledger <path|url>  Baseline ledger for --check; enables the ratchet.
  --components <a,b,c>      --check: components to check.
  --analysis <file>         --check: analysis.json from .github/scripts/analyze-pr.js.
  --limit <n>               --queue: how many rows (default 5).
  --out <file>              --report/--record: where to write the table.
  --package <core|lab>      --record: package, if the predicate cannot resolve it.
  --from <file|->           --record: scorecard JSON ('-' reads stdin).
  --allow-regression <why>  --record: permit a score drop or a new BLOCK.
  --dry-run                 --file-issues: print the issues, create nothing.
  --repo <owner/name>       --file-issues: default facebook/astryx.
  --json                    Machine-readable output where it applies.
`.trim();

// ---------------------------------------------------------------------------
// The rubric's vocabulary. These ids, weights and bands are the rubric's, not
// this script's — changing one here changes what the ledger claims to measure.
// ---------------------------------------------------------------------------

/** Section id -> weight, summing to 100. Rubric §2, "Overall grade". */
export const SECTION_WEIGHTS = Object.freeze({
  a11y: 16,
  theming: 14,
  api: 14,
  behavior: 12,
  design_objective: 6,
  design_rendered: 4,
  testing: 8,
  code_health: 8,
  docs: 8,
  i18n_rtl: 5,
  responsive: 5,
});

/** Section id -> the rubric's own heading. */
export const SECTION_TITLES = Object.freeze({
  a11y: '§1 Accessibility & operable paths',
  theming: '§2 Theming & token integrity',
  api: '§3 Public API contract',
  behavior: '§4 Behavior correctness & states',
  design_objective: '§5a Design conventions — objective',
  design_rendered: '§5b Design conventions — rendered',
  testing: '§6 Testing & verification',
  code_health: '§7 Code health (React & DOM)',
  docs: '§8 Docs, Storybook & docsite',
  i18n_rtl: '§9 i18n & RTL',
  responsive: '§10 Responsive & touch',
});

export const SECTION_IDS = Object.freeze(Object.keys(SECTION_WEIGHTS));

/**
 * Section states.
 *   scored       — a number was produced from evidence.
 *   limited      — fewer than 1/3 of the section's items gave a non-vacuous
 *                  verdict; reported for information, weight redistributed.
 *   not_measured — nobody looked (the §5b screenshot gate). Never 0.
 *   na           — structurally inapplicable, with a reason.
 *   unpublished  — the section WAS audited and is inside `score`, but the audit
 *                  of record published only the total. Not one of the rubric's
 *                  four states: it exists for the seeded rows, whose calibration
 *                  record reported totals only. Inventing the per-section split
 *                  would be fabrication, and `not_measured` would be a lie in
 *                  the other direction — it would claim nobody looked.
 */
export const SECTION_STATES = Object.freeze([
  'scored',
  'limited',
  'not_measured',
  'na',
  'unpublished',
]);

/** Rubric §2 grade bands. */
export const GRADE_BANDS = Object.freeze([
  {grade: 'A', min: 90},
  {grade: 'B', min: 80},
  {grade: 'C', min: 70},
  {grade: 'D', min: 60},
  {grade: 'F', min: 0},
]);

/**
 * Letter for a score. Any open BLOCK caps the overall grade at C regardless of
 * arithmetic (rubric §2, grade table).
 */
export function gradeFor(score, openBlocks = 0) {
  if (typeof score !== 'number') return null;
  const band = GRADE_BANDS.find(b => score >= b.min);
  const letter = band ? band.grade : 'F';
  if (openBlocks > 0 && (letter === 'A' || letter === 'B')) return 'C';
  return letter;
}

// ---------------------------------------------------------------------------
// The canonical component predicate — rubric decision #15.
//
// "Any sweep over packages/core/src/*/ also hits hooks, theme, utils, i18n,
//  __tests__, SizeContext, InteractiveRoleContext, NavItem. Ship one canonical
//  predicate so all four modes agree on the denominator."
//
// This is that predicate. It is structural, not a name list, so a new
// context-only or styles-only directory is excluded the day it lands.
// ---------------------------------------------------------------------------

/** Directories under a package src that are infrastructure, never components. */
export const NON_COMPONENT_DIRS = Object.freeze(
  new Set(['hooks', 'theme', 'utils', 'i18n', '__tests__']),
);

/** A file that renders: PascalCase `.tsx`, not a test, story, doc or perf file. */
const RENDERING_FILE = /^[A-Z][A-Za-z0-9]*\.tsx$/;

/** Packages the ledger covers, with the src dir the predicate sweeps. */
export const LEDGER_PACKAGES = Object.freeze([
  {name: 'core', src: 'packages/core/src'},
  {name: 'lab', src: 'packages/lab/src'},
]);

/**
 * Is `dirName`, directly under `srcDir`, a component directory?
 *
 * A component directory:
 *   1. is not one of the infrastructure directories (hooks/theme/utils/i18n/__tests__);
 *   2. is PascalCase — infrastructure is lowercase by convention;
 *   3. contains at least one top-level PascalCase `.tsx` file, i.e. something
 *      that actually renders.
 *
 * Rule 3 does the real work. It excludes:
 *   - `NavItem`      — only `navItemStyles.stylex.ts`, a shared style module;
 *   - `SizeContext` and `InteractiveRoleContext` — `.ts` context modules with a
 *     `.test.tsx` but nothing that renders.
 * It deliberately does NOT require `index.ts` or a `.doc.mjs`: an unexported or
 * undocumented component is still a component, and the ledger's job is to say
 * so rather than to hide it.
 *
 * @param {string} srcDir absolute path to `packages/<pkg>/src`
 * @param {string} dirName the directory entry name
 * @returns {boolean}
 */
export function isComponentDirectory(srcDir, dirName) {
  if (NON_COMPONENT_DIRS.has(dirName)) return false;
  if (!/^[A-Z]/.test(dirName)) return false;
  let entries;
  try {
    entries = fs.readdirSync(path.join(srcDir, dirName), {withFileTypes: true});
  } catch {
    return false;
  }
  return entries.some(e => e.isFile() && RENDERING_FILE.test(e.name));
}

/**
 * Every component in the covered packages, sorted by name. This is the ledger's
 * denominator: it is read from the packages, never from a checked-in list.
 * @param {string} [repoRoot]
 * @returns {{component: string, package: string}[]}
 */
export function listComponents(repoRoot = ROOT) {
  const out = [];
  for (const pkg of LEDGER_PACKAGES) {
    const srcDir = path.join(repoRoot, pkg.src);
    let entries;
    try {
      entries = fs.readdirSync(srcDir, {withFileTypes: true});
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!isComponentDirectory(srcDir, entry.name)) continue;
      out.push({component: entry.name, package: pkg.name});
    }
  }
  return out.sort((a, b) => a.component.localeCompare(b.component));
}

// ---------------------------------------------------------------------------
// Ledger IO
// ---------------------------------------------------------------------------

const isUrl = source => /^https?:\/\//.test(source);

/**
 * Read a ledger from a path or an http(s) URL.
 * Never throws: a fetch or parse failure resolves to `{ledger: null, error}` so
 * a caller in CI can degrade to a warning instead of failing a pull request on
 * network flake or on the wiki being momentarily unavailable.
 */
export async function loadLedger(source) {
  try {
    let text;
    if (isUrl(source)) {
      const res = await fetch(source, {redirect: 'follow'});
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      text = await res.text();
    } else {
      text = fs.readFileSync(source, 'utf8');
    }
    const ledger = JSON.parse(text);
    if (!ledger || !Array.isArray(ledger.components)) {
      throw new Error('not a ledger: missing a `components` array');
    }
    return {ledger, error: null};
  } catch (error) {
    return {ledger: null, error: `${source}: ${error.message}`};
  }
}

/** Index a ledger's entries by component name. */
export function indexLedger(ledger) {
  const byName = new Map();
  for (const entry of ledger.components) byName.set(entry.component, entry);
  return byName;
}

/**
 * Join the live roster with the ledger.
 * Every live component gets a row; `entry` is null when nobody has audited it.
 * A ledger row with no live component is surfaced too (`live: false`) rather
 * than silently dropped — that is how a rename or deletion shows up.
 */
export function buildRoster(ledger, components = listComponents()) {
  const byName = indexLedger(ledger);
  const roster = components.map(c => ({
    component: c.component,
    package: c.package,
    live: true,
    entry: byName.get(c.component) || null,
  }));
  const liveNames = new Set(components.map(c => c.component));
  for (const entry of ledger.components) {
    if (liveNames.has(entry.component)) continue;
    roster.push({
      component: entry.component,
      package: entry.package || 'unknown',
      live: false,
      entry,
    });
  }
  return roster.sort((a, b) => a.component.localeCompare(b.component));
}

/** Normalize one section entry, filling the rubric weight and defaults. */
export function readSection(entry, id) {
  const raw = (entry && entry.sections && entry.sections[id]) || null;
  return {
    score: raw && raw.score !== undefined ? raw.score : null,
    weight: raw && raw.weight !== undefined ? raw.weight : SECTION_WEIGHTS[id],
    state: raw && raw.state ? raw.state : 'not_measured',
    blocks: (raw && raw.blocks) || [],
    note: (raw && raw.note) || null,
  };
}

export const openBlockCount = entry =>
  entry && entry.blocks && typeof entry.blocks.count === 'number'
    ? entry.blocks.count
    : 0;

export const blockList = entry => (entry && entry.blocks && entry.blocks.open) || [];

const isAudited = entry => !!entry && entry.status === 'audited';

/** The repo that carries audit issues. */
export const DEFAULT_REPO = 'facebook/astryx';

/** `A8` -> ``[`A8`](https://github.com/…/issues/123)`` when the BLOCK is filed. */
export function blockLink(block, repo = DEFAULT_REPO) {
  const label = `\`${block.id}\``;
  return block.issue
    ? `${label} ([#${block.issue}](https://github.com/${repo}/issues/${block.issue}))`
    : `${label} (no issue filed)`;
}

/** Open BLOCKs that have been filed as issues, as `#123` links. */
export function issueLinks(entry, repo = DEFAULT_REPO) {
  return blockList(entry)
    .filter(b => b.issue)
    .map(b => `[#${b.issue}](https://github.com/${repo}/issues/${b.issue})`);
}

// ---------------------------------------------------------------------------
// --check — the ratchet
// ---------------------------------------------------------------------------

/**
 * Compare one component's proposed entry against its baseline entry.
 *
 * The rules, in the order they are applied:
 *   1. No head entry, or head is `unaudited`  -> pass. There is no baseline;
 *      the first audit sets it. A PR is NEVER blocked for touching a component
 *      nobody has audited.
 *   2. No base entry, or base is `unaudited`  -> pass, "first audit".
 *   3. `rubricVersion` differs                -> `incomparable`. The two numbers
 *      came off different scales, so the delta is meaningless. This does NOT
 *      fail; it asks for a re-audit under the head version.
 *   4. A new BLOCK appears                    -> fail, even if the score is flat
 *      or higher. A BLOCK is categorically different from points. A rise in
 *      `blocks.count` with no new id counts as a new BLOCK.
 *   5. Score decreased                        -> fail.
 *   6. Otherwise                              -> pass.
 */
export function compareEntry(component, baseEntry, headEntry) {
  const result = {
    component,
    verdict: 'pass',
    reason: '',
    baseScore: baseEntry ? (baseEntry.score ?? null) : null,
    headScore: headEntry ? (headEntry.score ?? null) : null,
    baseBlocks: openBlockCount(baseEntry),
    headBlocks: openBlockCount(headEntry),
    newBlocks: [],
  };

  if (!isAudited(headEntry)) {
    result.reason = headEntry
      ? 'unaudited — no baseline, the first audit sets it'
      : 'not in the ledger — unaudited, no baseline';
    return result;
  }
  if (!isAudited(baseEntry)) {
    result.reason = 'first audit — no prior score to ratchet against';
    return result;
  }

  if ((baseEntry.rubricVersion || null) !== (headEntry.rubricVersion || null)) {
    result.verdict = 'incomparable';
    result.reason =
      'incomparable — rubric version changed ' +
      `(${baseEntry.rubricVersion || 'none'} -> ${headEntry.rubricVersion || 'none'}); ` +
      `re-audit this entry under ${headEntry.rubricVersion || 'the new version'}`;
    return result;
  }

  const baseIds = new Set(blockList(baseEntry).map(b => b.id));
  const newBlocks = blockList(headEntry).filter(b => !baseIds.has(b.id));
  result.newBlocks = newBlocks;

  // A count that rises without a named id is still a new BLOCK: an entry may
  // name only a subset of its BLOCKs, so the count is the authority.
  const countRose = result.headBlocks > result.baseBlocks;

  if (newBlocks.length > 0 || countRose) {
    result.verdict = 'fail';
    result.reason = newBlocks.length
      ? `new BLOCK: ${newBlocks.map(b => `${b.id} (${b.summary})`).join('; ')}`
      : `open BLOCK count rose ${result.baseBlocks} -> ${result.headBlocks}`;
    return result;
  }

  if (
    typeof result.headScore === 'number' &&
    typeof result.baseScore === 'number' &&
    result.headScore < result.baseScore
  ) {
    result.verdict = 'fail';
    result.reason = `score decreased ${result.baseScore} -> ${result.headScore}`;
    return result;
  }

  result.reason =
    typeof result.headScore === 'number' &&
    typeof result.baseScore === 'number' &&
    result.headScore > result.baseScore
      ? `improved ${result.baseScore} -> ${result.headScore}`
      : 'unchanged';
  return result;
}

/** Run the ratchet over a set of components. */
export function runRatchet(components, baseLedger, headLedger) {
  const base = baseLedger ? indexLedger(baseLedger) : new Map();
  const head = indexLedger(headLedger);
  const results = components.map(name =>
    compareEntry(name, base.get(name) || null, head.get(name) || null),
  );
  return {results, failed: results.some(r => r.verdict === 'fail')};
}

/**
 * Standing for one component when there is no baseline to compare against:
 * where it sits today, and whether this change just made its audit stale.
 */
export function standingFor(component, entry, repo = DEFAULT_REPO) {
  if (!isAudited(entry)) {
    return {
      component,
      status: 'unaudited',
      verdict: 'no baseline — judged on merits',
      line: null,
    };
  }
  const blocks = openBlockCount(entry);
  const links = issueLinks(entry, repo);
  return {
    component,
    status: 'audited',
    verdict: 'known debt, unchanged',
    score: entry.score,
    grade: entry.grade,
    blocks,
    line:
      `**${entry.grade}** ${fmtScore(entry.score)} · ` +
      (blocks === 0
        ? 'no open BLOCKs'
        : `${blocks} recorded BLOCK${blocks === 1 ? '' : 's'}` +
          (links.length ? ` (${links.join(', ')})` : '')) +
      ` · audited ${entry.lastAudited} under rubric v${entry.rubricVersion}`,
  };
}

// ---------------------------------------------------------------------------
// --queue
// ---------------------------------------------------------------------------

/**
 * The auditor's work queue: unaudited first (alphabetical), then audited
 * oldest-first, then lowest-scoring. Coverage grows before anything is
 * re-audited, and the weakest components come back around soonest.
 */
export function buildQueue(roster, limit = Infinity) {
  const unaudited = roster
    .filter(r => r.live && !isAudited(r.entry))
    .sort((a, b) => a.component.localeCompare(b.component))
    .map(r => ({component: r.component, package: r.package, why: 'never audited'}));

  const audited = roster
    .filter(r => isAudited(r.entry))
    .sort((a, b) => {
      const byDate = String(a.entry.lastAudited || '').localeCompare(
        String(b.entry.lastAudited || ''),
      );
      if (byDate !== 0) return byDate;
      const as = a.entry.score ?? Infinity;
      const bs = b.entry.score ?? Infinity;
      if (as !== bs) return as - bs;
      return a.component.localeCompare(b.component);
    })
    .map(r => ({
      component: r.component,
      package: r.package,
      why:
        `audited ${r.entry.lastAudited} · ${r.entry.grade} ${fmtScore(r.entry.score)} · ` +
        `${openBlockCount(r.entry)} open BLOCK${openBlockCount(r.entry) === 1 ? '' : 's'}` +
        (r.live ? '' : ' · NO LONGER IN THE PACKAGES'),
    }));

  return [...unaudited, ...audited].slice(0, limit);
}

// ---------------------------------------------------------------------------
// --stats
// ---------------------------------------------------------------------------

export function buildStats(roster) {
  const live = roster.filter(r => r.live);
  const audited = roster.filter(r => isAudited(r.entry));
  const grades = {A: 0, B: 0, C: 0, D: 0, F: 0};
  for (const r of audited) if (r.entry.grade in grades) grades[r.entry.grade]++;

  const sections = {};
  for (const id of SECTION_IDS) {
    const states = {scored: 0, limited: 0, not_measured: 0, na: 0, unpublished: 0};
    const scores = [];
    for (const r of audited) {
      const s = readSection(r.entry, id);
      if (s.state in states) states[s.state]++;
      if (s.state === 'scored' && typeof s.score === 'number') scores.push(s.score);
    }
    sections[id] = {
      weight: SECTION_WEIGHTS[id],
      states,
      mean: scores.length
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : null,
      n: scores.length,
    };
  }

  const dates = audited.map(r => r.entry.lastAudited).filter(Boolean).sort();
  const scores = audited.map(r => r.entry.score).filter(n => typeof n === 'number');

  return {
    total: live.length,
    audited: audited.length,
    unaudited: live.length - audited.filter(r => r.live).length,
    percentAudited: live.length
      ? Math.round((audited.filter(r => r.live).length / live.length) * 1000) / 10
      : 0,
    byPackage: LEDGER_PACKAGES.reduce((acc, p) => {
      const inPkg = live.filter(r => r.package === p.name);
      acc[p.name] = {
        total: inPkg.length,
        audited: inPkg.filter(r => isAudited(r.entry)).length,
      };
      return acc;
    }, {}),
    grades,
    openBlocks: audited.reduce((sum, r) => sum + openBlockCount(r.entry), 0),
    componentsWithBlocks: audited.filter(r => openBlockCount(r.entry) > 0).length,
    meanScore: scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null,
    oldestAudit: dates[0] || null,
    newestAudit: dates[dates.length - 1] || null,
    rubricVersions: [
      ...new Set(audited.map(r => r.entry.rubricVersion).filter(Boolean)),
    ].sort(),
    orphanRows: roster.filter(r => !r.live).map(r => r.component),
    sections,
  };
}

// ---------------------------------------------------------------------------
// --report — the generated wiki table
// ---------------------------------------------------------------------------

/** The lowest `scored` section, for the table's "weakest section" column. */
export function weakestSection(entry) {
  let worst = null;
  for (const id of SECTION_IDS) {
    const s = readSection(entry, id);
    if (s.state !== 'scored' || typeof s.score !== 'number') continue;
    if (!worst || s.score < worst.score) worst = {id, score: s.score};
  }
  return worst;
}

function fmtScore(n) {
  return typeof n === 'number' ? n.toFixed(1) : '—';
}

export function renderTable(ledger, roster, stats) {
  const g = stats.grades;
  const out = [];

  out.push('<!--');
  out.push('  GENERATED FILE — DO NOT EDIT.');
  out.push('  Regenerate: node scripts/score-ledger.mjs --report --ledger <path to this wiki>/component-scores.json');
  out.push('  Source of truth for scores: component-scores.json in this wiki.');
  out.push('  Source of truth for the component list: packages/{core,lab}/src in the repo.');
  out.push('-->');
  out.push('');
  out.push('# Component Scores');
  out.push('');
  out.push(
    '**This page is generated. Do not hand-edit it.** Scores live in `component-scores.json` ' +
      'in this wiki; the component list is read from `packages/core/src` and `packages/lab/src`. ' +
      "An audit writes both with `node scripts/score-ledger.mjs --record <Component> --from <scorecard.json>`.",
  );
  out.push('');
  out.push(
    `_Generated ${new Date().toISOString().slice(0, 10)} · ledger v${ledger.ledgerVersion} · ` +
      `current rubric **v${ledger.rubricVersion}** · roster read from the packages at generation time._`,
  );
  out.push('');

  out.push('## Summary');
  out.push('');
  out.push(
    `**${stats.audited} of ${stats.total} components audited (${stats.percentAudited}%)** — ` +
      `core ${stats.byPackage.core.audited}/${stats.byPackage.core.total}, ` +
      `lab ${stats.byPackage.lab.audited}/${stats.byPackage.lab.total}. ` +
      `Total open BLOCKs: **${stats.openBlocks}** across ${stats.componentsWithBlocks} components. ` +
      `Mean score of audited components: **${fmtScore(stats.meanScore)}**. ` +
      `Oldest audit: ${stats.oldestAudit || '—'}.`,
  );
  out.push('');
  out.push('| Grade | A | B | C | D | F | unaudited |');
  out.push('|---|---|---|---|---|---|---|');
  out.push(
    `| Components | ${g.A} | ${g.B} | ${g.C} | ${g.D} | ${g.F} | ${stats.unaudited} |`,
  );
  out.push('');

  out.push('## How to read this');
  out.push('');
  out.push(
    '- **Score** is the rubric total, 0–100: Σ (section score ÷ 5 × weight). It measures ' +
      '**distance from the bar, not craft** — a mature, widely-composed component carrying four ' +
      'narrow defects can land below an immature one with none.',
  );
  out.push(
    '- **Grade** is the band (A 90+ · B 80+ · C 70+ · D 60+ · F <60). **Any open BLOCK caps the ' +
      'grade at C** regardless of arithmetic.',
  );
  out.push(
    '- **Open BLOCKs** is the number that matters. A BLOCK is a bright-line failure, not a large ' +
      'deduction — read it before you read the letter. Each one is filed as a `hardening` issue ' +
      'and linked here; the issue carries the rule id, the evidence and the fix. FIXes and NITs ' +
      'are not issues — they live in the ledger row.',
  );
  out.push(
    '- **TBD** means nobody has graded it. It does not mean "bad", and it does not mean "fine" — ' +
      'it means no evidence. The ledger records nulls, never zeros, and holds no row at all for an ' +
      'unaudited component.',
  );
  out.push(
    '- **Weakest section** is the lowest section carrying a published per-section score. Rows ' +
      'seeded from the calibration record published only their §5 split, so their weakest column ' +
      'reads from §5 alone — see the caveats below.',
  );
  out.push('');
  out.push('### Getting a component audited');
  out.push('');
  out.push(
    'Anyone can ask for an audit — you do not need to be an auditor, and it does not need a PR. ' +
      'Paste this to an agent that has the repo checked out:',
  );
  out.push('');
  out.push('```');
  out.push(AUDIT_PROMPT);
  out.push('```');
  out.push('');
  out.push(
    'Or wait for the nightly pass: it takes the next five from ' +
      '`node scripts/score-ledger.mjs --queue --limit 5`, which puts never-audited components first.',
  );
  out.push('');
  out.push('### How the ratchet works');
  out.push('');
  out.push(
    'The ledger is a regression ratchet. `node scripts/score-ledger.mjs --check` compares a ' +
      'proposed ledger against the current one:',
  );
  out.push('');
  out.push('| Change | Verdict |');
  out.push('|---|---|');
  out.push('| Score decreased | **fail** |');
  out.push('| A new BLOCK appears | **fail** — even if the total is flat or higher |');
  out.push('| Score equal or improved, no new BLOCK | pass |');
  out.push('| Component is unaudited | pass — no baseline; the first audit sets it |');
  out.push(
    '| `rubricVersion` differs | `incomparable` — the two numbers came off different scales; ' +
      'not a failure, but the entry needs re-auditing under the new version |',
  );
  out.push('');
  out.push(
    'A component nobody has audited **never** blocks a pull request. That is deliberate: the ' +
      'ledger exists to stop regressions against measured ground, not to tax work on unmeasured ' +
      'components.',
  );
  out.push('');

  out.push('## Scores');
  out.push('');
  out.push(
    '| Component | Package | Grade | Score | Open BLOCKs | Weakest section | Last audited | Rubric |',
  );
  out.push('|---|---|---|---|---|---|---|---|');
  for (const r of roster) {
    const name = r.live ? r.component : `${r.component} ⚠️`;
    if (!isAudited(r.entry)) {
      out.push(`| ${name} | ${r.package} | TBD | — | — | — | never | — |`);
      continue;
    }
    const e = r.entry;
    const blocks = openBlockCount(e);
    const links = issueLinks(e);
    const unfiled = blockList(e).length - links.length;
    const blockCell =
      blocks === 0
        ? '0'
        : `**${blocks}**` +
          (links.length ? ` — ${links.join(', ')}` : '') +
          (unfiled > 0 ? ` · ${unfiled} not filed` : '') +
          (blocks > blockList(e).length
            ? ` · ${blocks - blockList(e).length} unattributed`
            : '');
    const weakest = weakestSection(e);
    out.push(
      `| ${name} | ${r.package} | **${e.grade}** | ${fmtScore(e.score)} | ${blockCell} | ` +
        `${weakest ? `${SECTION_TITLES[weakest.id]} (${weakest.score}/5)` : '—'} | ` +
        `${e.lastAudited || '—'} | v${e.rubricVersion || '—'} |`,
    );
  }
  out.push('');
  if (stats.orphanRows.length) {
    out.push(
      `⚠️ ${stats.orphanRows.join(', ')} — a ledger row with no matching component directory. ` +
        'Renamed, moved, or deleted since the audit.',
    );
    out.push('');
  }

  const auditedRows = roster.filter(r => isAudited(r.entry));
  if (auditedRows.length) {
    out.push('## Open BLOCKs');
    out.push('');
    for (const r of auditedRows) {
      const e = r.entry;
      const named = blockList(e);
      const sectionBlocks = SECTION_IDS.flatMap(id =>
        readSection(e, id).blocks.map(b => ({...b, section: SECTION_TITLES[id]})),
      );
      if (!named.length && !sectionBlocks.length) continue;
      out.push(`### ${e.component}`);
      out.push('');
      for (const b of named) out.push(`- ${blockLink(b)} — ${b.summary}`);
      for (const b of sectionBlocks)
        out.push(`- ${blockLink(b)} — ${b.summary} _(${b.section})_`);
      const unnamed = openBlockCount(e) - named.length;
      if (unnamed > 0)
        out.push(
          `- _${unnamed} further open BLOCK${unnamed === 1 ? '' : 's'} counted by the audit of ` +
            'record without a published rule id._',
        );
      out.push('');
    }
  }

  if (ledger.caveats && ledger.caveats.length) {
    out.push('## Caveats on the recorded rows');
    out.push('');
    for (const c of ledger.caveats) out.push(`- ${c}`);
    out.push('');
  }

  out.push('---');
  out.push('');
  out.push(
    'Rubric: [[Component Audit Rubric]] · auditor: [[Night Watch Component Auditor]] · ' +
      'tool: `scripts/score-ledger.mjs` in the repo · browsable view: the sandbox ' +
      '**Component Scores** page.',
  );
  out.push('');
  return out.join('\n');
}

/**
 * The paste-to-an-agent request for an audit. One string, used by the wiki page
 * and the sandbox page so the two never drift.
 */
export const AUDIT_PROMPT = `Audit the Astryx component <Component> against the Component Audit Rubric
(https://github.com/facebook/astryx/wiki/Component-Audit-Rubric), mode O — the whole
component, not a diff. Grade every section, cite the rule id for each finding, and
capture the §5b screenshots; if you skip them, report design_rendered as not_measured
rather than scoring it. Then record the result:

  node scripts/score-ledger.mjs --record <Component> --from <scorecard.json>

against a local clone of https://github.com/facebook/astryx.wiki.git, and push the wiki.
Only record what you measured.`;

// ---------------------------------------------------------------------------
// --record
// ---------------------------------------------------------------------------

const SCORECARD_FIELDS = new Set([
  'status',
  'score',
  'grade',
  'sections',
  'blocks',
  'distinct_defects',
  'fixes',
  'nits',
  'lastAudited',
  'rubricVersion',
  'mode',
  'commit',
  'evidence',
  'notes',
]);

/**
 * Merge a scorecard into a ledger entry and validate it.
 * Unknown keys are rejected rather than silently stored — a typo in a field
 * name would otherwise produce a row that reads fine and measures nothing.
 */
export function applyScorecard(existing, scorecard, {component, pkg}) {
  const unknown = Object.keys(scorecard).filter(k => !SCORECARD_FIELDS.has(k));
  if (unknown.length) {
    throw new Error(`unknown scorecard field(s): ${unknown.join(', ')}`);
  }
  const next = {
    component,
    package: (existing && existing.package) || pkg,
    status: 'audited',
    score: null,
    grade: null,
    sections: {},
    blocks: {count: 0, open: []},
    distinct_defects: null,
    fixes: null,
    nits: null,
    lastAudited: null,
    rubricVersion: null,
    mode: null,
    commit: null,
    evidence: [],
    ...(existing || {}),
    ...scorecard,
  };
  if (!next.package) throw new Error(`${component}: no package — pass --package`);
  if (next.status !== 'audited') {
    throw new Error(
      `${component}: the ledger holds audited components only — an unaudited component ` +
        'simply has no row. Remove the entry instead.',
    );
  }
  if (typeof next.score !== 'number') {
    throw new Error(`${component}: an audited entry needs a numeric score`);
  }
  const expected = gradeFor(next.score, openBlockCount(next));
  if (!next.grade) next.grade = expected;
  if (next.grade !== expected) {
    throw new Error(
      `${component}: grade ${next.grade} contradicts score ${next.score} with ` +
        `${openBlockCount(next)} open BLOCK(s) — expected ${expected} ` +
        '(any open BLOCK caps the grade at C)',
    );
  }
  if (!next.rubricVersion) throw new Error(`${component}: rubricVersion is required`);
  if (!next.lastAudited) throw new Error(`${component}: lastAudited is required`);
  if (!next.mode) throw new Error(`${component}: mode is required (N/P/O/R)`);
  for (const [id, section] of Object.entries(next.sections || {})) {
    if (!(id in SECTION_WEIGHTS)) {
      throw new Error(`${component}: unknown section id "${id}"`);
    }
    if (section.state && !SECTION_STATES.includes(section.state)) {
      throw new Error(`${component}: unknown section state "${section.state}"`);
    }
    if (section.weight === undefined) section.weight = SECTION_WEIGHTS[id];
  }
  for (const b of blockList(next)) {
    if (!b || typeof b.id !== 'string' || typeof b.summary !== 'string') {
      throw new Error(`${component}: every BLOCK needs {id, summary} (issue optional)`);
    }
    if (b.issue !== undefined && b.issue !== null && !Number.isInteger(b.issue)) {
      throw new Error(`${component}: BLOCK ${b.id} issue must be an integer or null`);
    }
    if (b.issue === undefined) b.issue = null;
  }
  if (blockList(next).length > openBlockCount(next)) {
    throw new Error(
      `${component}: ${blockList(next).length} BLOCKs listed but blocks.count is ` +
        `${openBlockCount(next)}`,
    );
  }
  return next;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {_: []};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      args._.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

const flagValue = v => (typeof v === 'string' ? v : null);

function componentsFromArgs(args) {
  const known = new Set(listComponents().map(c => c.component));
  if (flagValue(args.components)) {
    return args.components.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (flagValue(args.analysis)) {
    const analysis = JSON.parse(fs.readFileSync(args.analysis, 'utf8'));
    const names = [
      ...(analysis.newComponents || []),
      ...(analysis.modifiedComponents || []),
    ];
    // analyze-pr.js has a looser notion of a component (it keeps NavItem,
    // SizeContext and InteractiveRoleContext, and it covers charts). Filter its
    // output through the canonical predicate so the ledger's denominator stays
    // the rubric's.
    return [...new Set(names)].filter(n => known.has(n)).sort();
  }
  return [];
}

async function cmdCheck(args) {
  const components = componentsFromArgs(args);
  if (components.length === 0) {
    console.log(
      'score-ledger: this change touches no component in packages/{core,lab}/src — nothing to check.',
    );
    return 0;
  }

  const {ledger, error} = await loadLedger(flagValue(args.ledger) || DEFAULT_LEDGER_URL);
  if (!ledger) {
    // Never fail a pull request because the ledger could not be read. The
    // ledger lives in the wiki; a fetch failure is infrastructure, not a
    // regression.
    console.log(
      `::warning::score-ledger: could not read the ledger (${error}) — skipping the check.`,
    );
    return 0;
  }

  let baseLedger = null;
  if (flagValue(args['base-ledger'])) {
    const loaded = await loadLedger(args['base-ledger']);
    if (!loaded.ledger) {
      console.log(
        `::warning::score-ledger: could not read the base ledger (${loaded.error}) — ` +
          'reporting standing only.',
      );
    } else {
      baseLedger = loaded.ledger;
    }
  }

  const lines = [];
  let exitCode = 0;

  if (baseLedger) {
    const {results, failed} = runRatchet(components, baseLedger, ledger);
    lines.push('## Component score ratchet', '');
    lines.push('| Component | Base | Head | Verdict | Detail |');
    lines.push('|---|---|---|---|---|');
    for (const r of results) {
      const icon =
        r.verdict === 'fail'
          ? '🔴 fail'
          : r.verdict === 'incomparable'
            ? '⚠️ incomparable'
            : '✅ pass';
      lines.push(
        `| ${r.component} | ${fmtScore(r.baseScore)} (${r.baseBlocks} BLOCK) | ` +
          `${fmtScore(r.headScore)} (${r.headBlocks} BLOCK) | ${icon} | ${r.reason} |`,
      );
    }
    lines.push('');
    for (const r of results) {
      if (r.verdict === 'fail') {
        lines.push(
          `🔴 **${r.component}: ${r.reason}.** Score ${fmtScore(r.baseScore)} → ` +
            `${fmtScore(r.headScore)}, open BLOCKs ${r.baseBlocks} → ${r.headBlocks}.`,
        );
      } else if (r.verdict === 'incomparable') {
        lines.push(`⚠️ **${r.component}: ${r.reason}.**`);
      }
    }
    exitCode = failed ? 1 : 0;
  } else {
    // No baseline to ratchet against: the ledger lives in the wiki and a pull
    // request cannot change it. Mode R judges the diff, not the component, so
    // this branch reports and never fails — and it stays quiet about debt the
    // contributor inherited.
    const index = indexLedger(ledger);
    const standings = components.map(n => standingFor(n, index.get(n) || null));
    const audited = standings.filter(s => s.status === 'audited');
    if (audited.length === 0) {
      console.log(
        `score-ledger: ${components.length} component(s) touched, none with a recorded audit — ` +
          'no baseline, judged on merits. Nothing to report.',
      );
      return 0;
    }
    lines.push('## Component scores — recorded baselines', '');
    lines.push(
      'For information. These are **recorded baselines, not findings against this pull ' +
        'request** — the ledger lives in the wiki, so a PR cannot change it, and nothing here ' +
        'blocks. A check only ever fails on a regression this diff caused: a new BLOCK, or a ' +
        'lower score. Anything already on the row is known debt with its own issue.',
    );
    lines.push('');
    lines.push('| Component | Recorded | Status |');
    lines.push('|---|---|---|');
    for (const st of audited) {
      lines.push(`| ${st.component} | ${st.line} | known debt, unchanged |`);
    }
    const unaudited = standings.filter(s => s.status !== 'audited');
    if (unaudited.length) {
      lines.push('');
      lines.push(
        `${unaudited.length} other component${unaudited.length === 1 ? '' : 's'} in this diff ` +
          `${unaudited.length === 1 ? 'has' : 'have'} no audit on record — no baseline, judged on ` +
          'merits. See [[Component Scores]] to request one.',
      );
    }
    lines.push('');
  }

  const text = lines.join('\n');
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
  }
  return exitCode;
}

async function withLedger(args, fn) {
  const source = flagValue(args.ledger) || DEFAULT_LEDGER_URL;
  const {ledger, error} = await loadLedger(source);
  if (!ledger) {
    console.error(`score-ledger: ${error}`);
    return 1;
  }
  return fn(ledger, buildRoster(ledger));
}

async function cmdReport(args) {
  return withLedger(args, (ledger, roster) => {
    const table = renderTable(ledger, roster, buildStats(roster));
    const out = flagValue(args.out) || defaultTablePath(args);
    if (out) {
      fs.writeFileSync(out, table);
      console.log(`score-ledger: wrote ${out} (${roster.length} rows)`);
    } else {
      console.log(table);
    }
    return 0;
  });
}

/** Next to the ledger file when it is local; stdout when the ledger is a URL. */
function defaultTablePath(args) {
  const source = flagValue(args.ledger);
  if (!source || isUrl(source)) return null;
  return path.join(path.dirname(source), 'Component-Scores.md');
}

async function cmdQueue(args) {
  return withLedger(args, (ledger, roster) => {
    const limit = flagValue(args.limit) ? Number(args.limit) : 5;
    const queue = buildQueue(roster, limit);
    if (args.json) {
      console.log(JSON.stringify(queue, null, 2));
      return 0;
    }
    console.log(`Audit queue — next ${queue.length}:`);
    for (const [i, e] of queue.entries()) {
      console.log(
        `  ${String(i + 1).padStart(2)}. ${e.component} (${e.package}) — ${e.why}`,
      );
    }
    return 0;
  });
}

async function cmdStats(args) {
  return withLedger(args, (ledger, roster) => {
    const stats = buildStats(roster);
    if (args.json) {
      console.log(JSON.stringify(stats, null, 2));
      return 0;
    }
    const g = stats.grades;
    console.log(
      `Component score ledger — v${ledger.ledgerVersion}, current rubric v${ledger.rubricVersion}`,
    );
    console.log('');
    console.log(
      `  Components:    ${stats.total}  (${stats.audited} audited, ${stats.unaudited} unaudited — ${stats.percentAudited}%)`,
    );
    console.log(
      `                 core ${stats.byPackage.core.audited}/${stats.byPackage.core.total} · ` +
        `lab ${stats.byPackage.lab.audited}/${stats.byPackage.lab.total}`,
    );
    console.log(`  Grades:        A ${g.A} · B ${g.B} · C ${g.C} · D ${g.D} · F ${g.F}`);
    console.log(`  Mean score:    ${fmtScore(stats.meanScore)} (audited only)`);
    console.log(
      `  Open BLOCKs:   ${stats.openBlocks} across ${stats.componentsWithBlocks} components`,
    );
    console.log(
      `  Audit dates:   oldest ${stats.oldestAudit || '—'} · newest ${stats.newestAudit || '—'}`,
    );
    console.log(`  Rubric vers.:  ${stats.rubricVersions.join(', ') || '—'}`);
    if (stats.orphanRows.length) {
      console.log(`  Orphan rows:   ${stats.orphanRows.join(', ')} (no live component)`);
    }
    console.log('');
    console.log('  Sections (audited rows only)');
    for (const id of SECTION_IDS) {
      const s = stats.sections[id];
      const st = s.states;
      console.log(
        `    ${SECTION_TITLES[id].padEnd(38)} w${String(s.weight).padStart(2)}  ` +
          `mean ${s.mean === null ? '   —' : s.mean.toFixed(2)} (n=${s.n})  ` +
          `scored ${st.scored} · limited ${st.limited} · not_measured ${st.not_measured} · ` +
          `na ${st.na} · unpublished ${st.unpublished}`,
      );
    }
    return 0;
  });
}

async function cmdRecord(args) {
  const component = flagValue(args.record);
  if (!component) {
    console.error('score-ledger --record <Component>: the component name is required');
    return 1;
  }
  const ledgerPath = flagValue(args.ledger);
  if (!ledgerPath || isUrl(ledgerPath)) {
    console.error(
      'score-ledger --record: pass --ledger <path> pointing at component-scores.json in a ' +
        'local clone of the wiki — recording writes the file, so a URL will not do.',
    );
    return 1;
  }
  const {ledger, error} = await loadLedger(ledgerPath);
  if (!ledger) {
    console.error(`score-ledger: ${error}`);
    return 1;
  }
  const src = flagValue(args.from);
  if (!src) {
    console.error('score-ledger --record: --from <scorecard.json|-> is required');
    return 1;
  }
  const scorecard = JSON.parse(
    src === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(src, 'utf8'),
  );

  const live = listComponents().find(c => c.component === component);
  if (!live) {
    console.log(
      `score-ledger: warning — ${component} is not a component directory in ` +
        'packages/{core,lab}/src under the canonical predicate. Recording anyway.',
    );
  }

  const before = indexLedger(ledger).get(component) || null;
  const after = applyScorecard(before, scorecard, {
    component,
    pkg: flagValue(args.package) || (live && live.package) || null,
  });

  // The wiki takes no pull request, so the ratchet has to bite here.
  const verdict = compareEntry(component, before, after);
  if (verdict.verdict === 'fail' && !args['allow-regression']) {
    console.error(`score-ledger --record: refusing — ${verdict.reason}.`);
    console.error(
      'If the regression is real and intended, re-run with --allow-regression "<why>" so the ' +
        'reason is recorded in the ledger alongside it.',
    );
    return 1;
  }
  if (verdict.verdict === 'fail') {
    after.regression = {
      reason: String(args['allow-regression']),
      from: {score: verdict.baseScore, blocks: verdict.baseBlocks},
      recordedAt: new Date().toISOString().slice(0, 10),
    };
  }

  const idx = ledger.components.findIndex(e => e.component === component);
  if (idx === -1) ledger.components.push(after);
  else ledger.components[idx] = after;
  ledger.components.sort((a, b) => a.component.localeCompare(b.component));
  ledger.updated = new Date().toISOString().slice(0, 10);

  fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  console.log(
    `score-ledger: recorded ${component} — ${after.grade} ${after.score} ` +
      `(${verdict.reason || 'new entry'})`,
  );

  // Every BLOCK is supposed to carry the issue it was filed as; the ledger row
  // is where the table's links come from.
  const unfiled = blockList(after).filter(b => !b.issue);
  if (unfiled.length) {
    console.log(
      `::warning::score-ledger: ${unfiled.length} BLOCK(s) on ${component} have no issue ` +
        `(${unfiled.map(b => b.id).join(', ')}). File them — ` +
        `node scripts/score-ledger.mjs --file-issues ${component} --from <scorecard.json> ` +
        `--ledger ${ledgerPath}`,
    );
  }
  const unattributed = openBlockCount(after) - blockList(after).length;
  if (unattributed > 0) {
    console.log(
      `::warning::score-ledger: ${component} counts ${openBlockCount(after)} open BLOCKs but ` +
        `names ${blockList(after).length}. An unnamed BLOCK cannot be filed, linked, or closed.`,
    );
  }
  // "A resolved BLOCK that leaves the recorded score unchanged means either the
  // fix or the audit is wrong" — rubric, Closing the loop.
  if (
    before &&
    isAudited(before) &&
    openBlockCount(after) < openBlockCount(before) &&
    after.score === before.score &&
    before.rubricVersion === after.rubricVersion
  ) {
    console.log(
      `::warning::score-ledger: ${component} cleared ` +
        `${openBlockCount(before) - openBlockCount(after)} BLOCK(s) but the score did not move ` +
        `(${fmtScore(before.score)}). Clearing a BLOCK lifts that section's ceiling — either the ` +
        'fix or the audit is wrong. Re-check before you push.',
    );
  }

  const roster = buildRoster(ledger);
  const out = flagValue(args.out) || path.join(path.dirname(ledgerPath), 'Component-Scores.md');
  fs.writeFileSync(out, renderTable(ledger, roster, buildStats(roster)));
  console.log(`score-ledger: regenerated ${out}`);
  console.log('score-ledger: commit and push the wiki to publish.');
  return 0;
}

/**
 * The body of an audit issue. Everything whoever picks it up needs, because
 * they will not have the audit open: the ledger row, the rule and section, the
 * rubric version, the evidence, the fix — and the closing protocol.
 */
export function issueBody(component, entry, block, repo = DEFAULT_REPO) {
  const section = block.section ? ` (${block.section})` : '';
  return [
    `Found by a component audit of **${component}**, mode ${entry.mode}, ` +
      `rubric **v${entry.rubricVersion}**, at commit \`${entry.commit || 'unknown'}\`.`,
    '',
    `- **Rule:** \`${block.id}\`${section} — see the [Component Audit Rubric]` +
      `(https://github.com/${repo}/wiki/Component-Audit-Rubric).`,
    `- **Ledger row:** [${component} in Component Scores]` +
      `(https://github.com/${repo}/wiki/Component-Scores) — recorded ` +
      `${entry.grade} ${entry.score} with ${openBlockCount(entry)} open BLOCK(s).`,
    `- **Finding:** ${block.summary}`,
    block.evidence ? `- **Evidence:** ${block.evidence}` : null,
    block.fix ? `- **Fix:** ${block.fix}` : null,
    '',
    '### Closing protocol',
    '',
    'Resolving this requires:',
    '',
    `1. Re-run the audit for ${component} (mode O) after the fix.`,
    '2. Put the visual results in the PR description — before/after screenshots of the ' +
      'affected states. That is also what §5b needs.',
    '3. Update the Component Scores row with the new score and clear this BLOCK ' +
      `(\`node scripts/score-ledger.mjs --record ${component} --from <scorecard.json>\`).`,
    '4. Close this issue linking that PR.',
    '',
    "If the recorded score doesn't move, either the fix or the audit is wrong.",
  ]
    .filter(l => l !== null)
    .join('\n');
}

/**
 * File one `hardening` issue per unfiled BLOCK and write the numbers back.
 * Idempotent: a BLOCK that already carries an issue number is left alone, and a
 * linked issue that was closed while the BLOCK persists is reopened rather than
 * re-filed.
 */
async function cmdFileIssues(args) {
  const component = flagValue(args['file-issues']);
  if (!component) {
    console.error('score-ledger --file-issues <Component>: the component name is required');
    return 1;
  }
  const ledgerPath = flagValue(args.ledger);
  if (!ledgerPath || isUrl(ledgerPath)) {
    console.error('score-ledger --file-issues: pass --ledger <local path> — it writes back.');
    return 1;
  }
  const repo = flagValue(args.repo) || DEFAULT_REPO;
  const {ledger, error} = await loadLedger(ledgerPath);
  if (!ledger) {
    console.error(`score-ledger: ${error}`);
    return 1;
  }
  const entry = indexLedger(ledger).get(component);
  if (!isAudited(entry)) {
    console.error(`score-ledger: ${component} has no audited row — record it first.`);
    return 1;
  }

  const {execFileSync} = await import('node:child_process');
  const gh = (...argv) =>
    execFileSync('gh', argv, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();

  let changed = false;
  for (const block of blockList(entry)) {
    if (block.issue) {
      // Idempotent: never re-file. Reopen if the issue was closed while the
      // BLOCK is still on the row.
      if (args['dry-run']) {
        console.log(`  ${block.id}: already filed as #${block.issue} — skipping`);
        continue;
      }
      try {
        const state = gh('issue', 'view', String(block.issue), '--repo', repo, '--json', 'state', '--jq', '.state');
        if (state === 'CLOSED') {
          gh('issue', 'reopen', String(block.issue), '--repo', repo, '--comment',
            `Reopening: \`${block.id}\` is still an open BLOCK on the ${component} ledger row.`);
          console.log(`  ${block.id}: reopened #${block.issue}`);
        } else {
          console.log(`  ${block.id}: already filed as #${block.issue}`);
        }
      } catch (e) {
        console.log(`::warning::score-ledger: could not check issue #${block.issue}: ${e.message}`);
      }
      continue;
    }
    const title = `[audit] ${component}: ${block.summary}`;
    const body = issueBody(component, entry, block, repo);
    if (args['dry-run']) {
      console.log(`\n--- would file ---\n${title}\n\n${body}\n`);
      continue;
    }
    const url = gh('issue', 'create', '--repo', repo, '--title', title, '--label', 'hardening', '--body', body);
    const number = Number(url.split('/').pop());
    if (!Number.isInteger(number)) {
      console.error(`score-ledger: could not parse an issue number out of "${url}"`);
      return 1;
    }
    block.issue = number;
    changed = true;
    console.log(`  ${block.id}: filed #${number} — ${url}`);
  }

  if (changed) {
    ledger.updated = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
    const roster = buildRoster(ledger);
    const out = flagValue(args.out) || path.join(path.dirname(ledgerPath), 'Component-Scores.md');
    fs.writeFileSync(out, renderTable(ledger, roster, buildStats(roster)));
    console.log(`score-ledger: wrote ${ledgerPath} and ${out} — commit and push the wiki.`);
  }
  return 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    console.log(USAGE);
    return 0;
  }
  if (args.check) return cmdCheck(args);
  if (args.report) return cmdReport(args);
  if (args.queue) return cmdQueue(args);
  if (args.stats) return cmdStats(args);
  if (args.record) return cmdRecord(args);
  if (args['file-issues']) return cmdFileIssues(args);
  console.log(USAGE);
  return 1;
}

// Only run when invoked directly, so tests can import the pure functions.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().then(
    code => process.exit(code),
    err => {
      console.error(`score-ledger: ${err.message}`);
      process.exit(1);
    },
  );
}

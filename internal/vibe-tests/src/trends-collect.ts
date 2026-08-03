#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Collect nightly vibe-test results from GitHub issues into a time series
 * @position internal/vibe-tests/src/trends-collect.ts
 *
 * The nightly runner posts each run as a GitHub issue labeled `vibe-test`,
 * with a Scoreboard table in the body. This reads every such issue via the
 * `gh` CLI, parses the scoreboard across the handful of historical table
 * layouts, and writes a normalized `trends.json` the dashboard consumes.
 *
 * Usage:
 *   tsx src/trends-collect.ts
 *   tsx src/trends-collect.ts --repo facebook/astryx --label vibe-test
 *   tsx src/trends-collect.ts --out ../trends.json --limit 300
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';

type Target = 'astryx' | 'astryxTW' | 'baseline' | 'html';
type Dimension =
  | 'overall'
  | 'correctness'
  | 'accessibility'
  | 'codeQuality'
  | 'efficiency'
  | 'maintainability'
  | 'design';

export interface TrendRecord {
  number: number;
  date: string;
  createdAt: string;
  state: string;
  url: string;
  title: string;
  overall: Partial<Record<Target, number>>;
  dimensions: Partial<Record<Dimension, Partial<Record<Target, number>>>>;
  source: 'body' | 'title';
}

interface SkippedRecord {
  number: number;
  date: string;
  title: string;
  reason: string;
}

const DIM_ALIASES: Record<string, Dimension> = {
  overall: 'overall',
  correctness: 'correctness',
  accessibility: 'accessibility',
  'code quality': 'codeQuality',
  efficiency: 'efficiency',
  maintainability: 'maintainability',
  design: 'design',
};

// Meta/experiment issues that carry the label but aren't nightly score reports.
const EXCLUDE_KEYWORDS = [
  'selector',
  'token naming',
  'statusdot',
  'impeccable',
  'fairness audit',
  "add 'design'",
  'improve xds design',
  'documentation gaps',
  'cli vs mcp',
  'api concerns',
  'false positive',
  'dry run',
];

function clean(s: string): string {
  return s
    .replace(/\*/g, '')
    .replace(/🥇|🥈|🥉/g, '')
    .trim();
}

function normTarget(h: string): Target | null {
  let x = clean(h).toLowerCase();
  x = x.replace(/\(.*?\)/g, '').trim();
  x = x.replace('raw html/css', 'html').replace('raw html', 'html');
  if (x === 'xds' || x === 'astryx') {
    return 'astryx';
  }
  if (
    [
      'xds+tw',
      'astryx+tw',
      'xds + tw',
      'astryx + tw',
      'xds+tailwind',
      'astryx+tailwind',
      'xds tailwind',
      'astryx tailwind',
    ].includes(x)
  ) {
    return 'astryxTW';
  }
  if (x === 'baseline') {
    return 'baseline';
  }
  if (x === 'html') {
    return 'html';
  }
  return null;
}

function normDim(s: string): Dimension | null {
  return DIM_ALIASES[clean(s).toLowerCase()] ?? null;
}

function getNumber(cell: string): number | null {
  const m = clean(cell).match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.every(c => /^[-:\s]*$/.test(clean(c)));
}

/** Yield each contiguous markdown table (as arrays of cell arrays). */
function* tables(body: string): Generator<string[][]> {
  let rows: string[][] = [];
  for (const line of body.split('\n')) {
    const s = line.trim();
    if (s.startsWith('|') && (s.match(/\|/g)?.length ?? 0) >= 2) {
      const cells = s
        .replace(/^\||\|$/g, '')
        .split('|')
        .map(c => c.trim());
      if (isSeparatorRow(cells)) {
        continue;
      }
      rows.push(cells);
    } else if (rows.length) {
      yield rows;
      rows = [];
    }
  }
  if (rows.length) {
    yield rows;
  }
}

/** A "Score" column in a transposed table means the overall dimension. */
function dimColumn(c: string): Dimension | null {
  const d = normDim(c);
  if (d) {
    return d;
  }
  if (clean(c).toLowerCase() === 'score') {
    return 'overall';
  }
  return null;
}

function parseBody(
  body: string,
): Partial<Record<Dimension, Partial<Record<Target, number>>>> {
  const scores: Partial<Record<Dimension, Partial<Record<Target, number>>>> =
    {};
  const put = (dim: Dimension, t: Target, v: number) => {
    (scores[dim] ??= {})[t] = v;
  };

  for (const tbl of tables(body)) {
    if (tbl.length < 2) {
      continue;
    }
    const header = tbl[0];
    const h0 = clean(header[0]).toLowerCase();

    const colTargets = new Map<number, Target>();
    const colDims = new Map<number, Dimension>();
    header.slice(1).forEach((c, i) => {
      const t = normTarget(c);
      if (t) {
        colTargets.set(i + 1, t);
      }
      const d = dimColumn(c);
      if (d) {
        colDims.set(i + 1, d);
      }
    });

    // Layout A: rows are targets, columns are dimensions (transposed).
    if (
      colDims.size &&
      (['target', 'system', 'config', 'configuration'].includes(h0) ||
        colTargets.size === 0)
    ) {
      for (const row of tbl.slice(1)) {
        const t = normTarget(row[0]);
        if (!t) {
          continue;
        }
        for (const [ci, dim] of colDims) {
          const v = ci < row.length ? getNumber(row[ci]) : null;
          if (v != null) {
            put(dim, t, v);
          }
        }
      }
      continue;
    }

    // Layout B: rows are dimensions, columns are targets.
    if (
      colTargets.size &&
      (['dimension', 'metric'].includes(h0) || normDim(h0) === null)
    ) {
      for (const row of tbl.slice(1)) {
        const dim = normDim(row[0]);
        if (!dim) {
          continue;
        }
        for (const [ci, t] of colTargets) {
          const v = ci < row.length ? getNumber(row[ci]) : null;
          if (v != null) {
            put(dim, t, v);
          }
        }
      }
      continue;
    }

    // Layout C: two-column "Overall Scores" table (| Target | Score |).
    if (
      ['target', 'system', 'config'].includes(h0) &&
      header.length === 2 &&
      clean(header[1]).toLowerCase().includes('score')
    ) {
      for (const row of tbl.slice(1)) {
        const t = normTarget(row[0]);
        const v = row.length > 1 ? getNumber(row[1]) : null;
        if (t && v != null) {
          put('overall', t, v);
        }
      }
    }
  }
  return scores;
}

function parseTitleScores(title: string): Partial<Record<Target, number>> {
  const out: Partial<Record<Target, number>> = {};
  const re =
    /(XDS\+TW|Astryx\+TW|XDS|Astryx|Baseline|HTML)\s*\+?\s*(\d{2,3})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(title))) {
    const t = normTarget(m[1]);
    if (t) {
      out[t] = parseFloat(m[2]);
    }
  }
  return out;
}

interface GhIssue {
  number: number;
  title: string;
  body: string;
  createdAt: string;
  state: string;
  url: string;
}

function fetchIssues(repo: string, label: string, limit: number): GhIssue[] {
  const raw = execFileSync(
    'gh',
    [
      'issue',
      'list',
      '--repo',
      repo,
      '--label',
      label,
      '--state',
      'all',
      '--limit',
      String(limit),
      '--json',
      'number,title,body,createdAt,state,url',
    ],
    {encoding: 'utf8', maxBuffer: 256 * 1024 * 1024},
  );
  return JSON.parse(raw) as GhIssue[];
}

function collect(issues: GhIssue[]): {
  records: TrendRecord[];
  skipped: SkippedRecord[];
} {
  const records: TrendRecord[] = [];
  const skipped: SkippedRecord[] = [];

  for (const iss of issues) {
    const title = iss.title ?? '';
    const body = iss.body ?? '';
    const date = iss.createdAt.slice(0, 10);
    const tl = title.toLowerCase();

    if (EXCLUDE_KEYWORDS.some(k => tl.includes(k)) || tl.includes('failed')) {
      skipped.push({
        number: iss.number,
        date,
        title: title.slice(0, 80),
        reason: 'meta/experiment',
      });
      continue;
    }

    const scores = parseBody(body);
    let overall = scores.overall;
    let source: 'body' | 'title' = 'body';
    if (!overall || Object.keys(overall).length === 0) {
      const t = parseTitleScores(title);
      if (Object.keys(t).length) {
        overall = t;
        scores.overall = t;
        source = 'title';
      }
    }
    if (!overall || Object.keys(overall).length === 0) {
      skipped.push({
        number: iss.number,
        date,
        title: title.slice(0, 80),
        reason: 'no-score',
      });
      continue;
    }

    // Normalize any 0–10 rubric runs to 0–100 for a consistent axis.
    // `overall` and `scores.overall` share a reference, so mutating the row
    // objects in place updates both.
    const ovVals = Object.values(overall).filter((v): v is number => v != null);
    if (ovVals.length && Math.max(...ovVals) <= 10) {
      for (const dim of Object.keys(scores) as Dimension[]) {
        const row = scores[dim] ?? {};
        for (const t of Object.keys(row) as Target[]) {
          const v = row[t];
          if (v != null) {
            row[t] = Math.round(v * 10 * 10) / 10;
          }
        }
      }
    }

    records.push({
      number: iss.number,
      date,
      createdAt: iss.createdAt,
      state: iss.state,
      url: iss.url,
      title,
      overall,
      dimensions: scores,
      source,
    });
  }

  records.sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
  );
  return {records, skipped};
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    repo: 'facebook/astryx',
    label: 'vibe-test',
    limit: 500,
    out: path.join(import.meta.dirname, '..', 'trends.json'),
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--repo' && args[i + 1]) {
      opts.repo = args[++i];
    } else if (args[i] === '--label' && args[i + 1]) {
      opts.label = args[++i];
    } else if (args[i] === '--limit' && args[i + 1]) {
      opts.limit = parseInt(args[++i], 10);
    } else if (args[i] === '--out' && args[i + 1]) {
      opts.out = path.resolve(args[++i]);
    }
  }
  return opts;
}

export interface TrendsFile {
  records: TrendRecord[];
  skipped: SkippedRecord[];
  meta: {
    dateMin: string;
    dateMax: string;
    count: number;
    generatedAt: string;
    repo: string;
    label: string;
  };
}

function main() {
  const opts = parseArgs();
  console.log(`Fetching label:${opts.label} issues from ${opts.repo}…`);
  const issues = fetchIssues(opts.repo, opts.label, opts.limit);
  const {records, skipped} = collect(issues);

  const dates = records.map(r => r.date);
  const out: TrendsFile = {
    records,
    skipped,
    meta: {
      dateMin: dates[0] ?? '',
      dateMax: dates[dates.length - 1] ?? '',
      count: records.length,
      generatedAt:
        new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      repo: opts.repo,
      label: opts.label,
    },
  };

  fs.writeFileSync(opts.out, JSON.stringify(out, null, 2));
  console.log(
    `Parsed ${records.length} scored runs (${out.meta.dateMin} → ${out.meta.dateMax}), ` +
      `skipped ${skipped.length} non-score issues.`,
  );
  console.log(`Wrote ${opts.out}`);
}

// Run when invoked directly, not when imported by the dashboard builder.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}

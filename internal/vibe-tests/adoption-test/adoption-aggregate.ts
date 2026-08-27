// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file adoption-aggregate.ts
 * @input --experiment <id> (reads every condition's evals/)
 * @output adoption-summary-<expId>.json + the results table on stdout
 * @position internal/vibe-tests/adoption-test — the deliverable for an ad-hoc run
 *
 * Per the Designing Vibe Tests playbook, an ad-hoc test's deliverable is a
 * table, not a pipeline. Rates carry Wilson 95% intervals because a handful of
 * runs per cell cannot support a bare percentage.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

type EvalResult = {
  taskId: string;
  promptId: string;
  tier: string;
  condition: string;
  precedent: 'keep' | 'strip';
  adoption: {decision: string; usedPrimitives: boolean};
  verification: {lookupCount: number; lookedUpBeforeWriting: boolean | null};
  escapeHatches: {total: number};
  semantics: {preserved: boolean};
  a11y: {keyboardPathAdded: boolean; hoverWithoutFocusPath: string[]};
  blast: {filesChanged: number; touchedSharedPrimitives: string[]};
  flags: string[];
};

/** Wilson score interval — a bare proportion over 3 runs is not a number. */
export function wilson(
  successes: number,
  n: number,
  z = 1.96,
): [number, number] {
  if (n === 0) {
    return [0, 0];
  }
  const p = successes / n;
  const d = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [
    Math.max(0, (centre - spread) / d),
    Math.min(1, (centre + spread) / d),
  ];
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

export function summarize(results: EvalResult[]) {
  const adopted = results.filter(
    r => r.adoption.decision === 'astryx' || r.adoption.decision === 'mixed',
  );
  const [lo, hi] = wilson(adopted.length, results.length);
  return {
    runs: results.length,
    adopted: adopted.length,
    adoptionRate: results.length ? adopted.length / results.length : 0,
    adoptionCI: [lo, hi] as [number, number],
    lookedUpFirst: results.filter(
      r => r.verification.lookedUpBeforeWriting === true,
    ).length,
    noLookupAtAll: results.filter(r => r.verification.lookupCount === 0).length,
    meanEscapeHatches: mean(results.map(r => r.escapeHatches.total)),
    meanEscapeHatchesWhenAdopted: mean(adopted.map(r => r.escapeHatches.total)),
    semanticsPreserved: results.filter(r => r.semantics.preserved).length,
    keyboardPathAdded: results.filter(r => r.a11y.keyboardPathAdded).length,
    hoverWithoutFocus: results.filter(
      r => r.a11y.hoverWithoutFocusPath.length > 0,
    ).length,
    touchedShared: results.filter(
      r => r.blast.touchedSharedPrimitives.length > 0,
    ).length,
    meanFilesChanged: mean(results.map(r => r.blast.filesChanged)),
  };
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    out.set(k, [...(out.get(k) ?? []), item]);
  }
  return out;
}

function table(rows: string[][]): string {
  const widths = rows[0].map((_, i) =>
    Math.max(...rows.map(r => (r[i] ?? '').length)),
  );
  const line = (r: string[]) =>
    `| ${r.map((c, i) => (c ?? '').padEnd(widths[i])).join(' | ')} |`;
  return [
    line(rows[0]),
    `|${widths.map(w => '-'.repeat(w + 2)).join('|')}|`,
    ...rows.slice(1).map(line),
  ].join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  const experiment = get('--experiment');
  if (!experiment) {
    console.error('usage: adoption-aggregate.ts --experiment <id>');
    process.exit(2);
  }
  const resultsDir = path.resolve(
    get('--results') ?? path.join(import.meta.dirname, '..', 'results'),
  );
  const config = JSON.parse(
    fs.readFileSync(
      path.join(resultsDir, `adoption-config-${experiment}.json`),
      'utf8',
    ),
  );

  const all: EvalResult[] = [];
  for (const iterDir of Object.values<string>(config.iterDirs)) {
    const evalsDir = path.join(iterDir, 'evals');
    if (!fs.existsSync(evalsDir)) {
      continue;
    }
    for (const file of fs.readdirSync(evalsDir)) {
      all.push(JSON.parse(fs.readFileSync(path.join(evalsDir, file), 'utf8')));
    }
  }
  if (all.length === 0) {
    console.error(
      `No evals found for ${experiment}. Run adoption-eval.ts first.`,
    );
    process.exit(1);
  }

  const byCondition = groupBy(all, r => r.condition);
  const summary = Object.fromEntries(
    [...byCondition].map(([c, rs]) => [c, summarize(rs)]),
  );

  console.log(`\n## Adoption vibe test — experiment ${experiment}\n`);
  console.log(
    table([
      [
        'condition',
        'runs',
        'adopted',
        '95% CI',
        'looked up first',
        'hatches/run',
        'a11y+',
        'semantics kept',
      ],
      ...[...byCondition].map(([c, rs]) => {
        const s = summarize(rs);
        return [
          c,
          String(s.runs),
          `${s.adopted}/${s.runs} (${pct(s.adoptionRate)})`,
          `${pct(s.adoptionCI[0])}–${pct(s.adoptionCI[1])}`,
          `${s.lookedUpFirst}/${s.runs}`,
          s.meanEscapeHatches.toFixed(1),
          `${s.keyboardPathAdded}/${s.runs}`,
          `${s.semanticsPreserved}/${s.runs}`,
        ];
      }),
    ]),
  );

  console.log(`\n### By tier (adoption rate)\n`);
  const tiers = [...new Set(all.map(r => r.tier))].sort();
  console.log(
    table([
      ['condition', ...tiers],
      ...[...byCondition].map(([c, rs]) => [
        c,
        ...tiers.map(t => {
          const cell = rs.filter(r => r.tier === t);
          const s = summarize(cell);
          return cell.length ? `${s.adopted}/${s.runs}` : '—';
        }),
      ]),
    ]),
  );

  const precedentRuns = all.filter(
    r => r.precedent === 'strip' || r.tier === 'T3',
  );
  if (precedentRuns.some(r => r.precedent === 'strip')) {
    console.log(
      `\n### Precedent factor (T3 only — does the tree beat the docs?)\n`,
    );
    console.log(
      table([
        ['condition', 'keep', 'strip'],
        ...[...groupBy(precedentRuns, r => r.condition)].map(([c, rs]) => {
          const cell = (level: string) => {
            const s = summarize(rs.filter(r => r.precedent === level));
            return s.runs ? `${s.adopted}/${s.runs}` : '—';
          };
          return [c, cell('keep'), cell('strip')];
        }),
      ]),
    );
  }

  const flagged = all.filter(r => r.flags.length);
  if (flagged.length) {
    console.log(`\n### Flags\n`);
    for (const r of flagged) {
      for (const f of r.flags) {
        console.log(`- **${r.condition} / ${r.taskId}** — ${f}`);
      }
    }
  }

  const outPath = path.join(resultsDir, `adoption-summary-${experiment}.json`);
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {experiment, generatedAt: new Date().toISOString(), summary},
      null,
      2,
    ),
  );
  console.log(`\n📄 ${outPath}\n`);
}

if (process.argv[1] && process.argv[1].endsWith('adoption-aggregate.ts')) {
  main();
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-aggregate.ts
 * @input --dir <measurements dir> [--baseline baseline] [--scheme light|dark] [--markdown]
 * @output The results table for a setup run, on stdout
 * @position internal/vibe-tests/setup-test — reporting
 *
 * Reads the measurement JSONs setup-measure.mjs wrote, scores every arm against
 * the pristine app with the same code, and prints one row each. `--scheme dark`
 * reruns the same scoring under the other color scheme, which is how a
 * "works on my machine" arm shows itself: the rows disagree.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  scoreArm,
  verdict,
  type Measurement,
  type Scheme,
} from './setup-eval.js';

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : (process.argv[i + 1] ?? fallback);
}

const dir = path.resolve(arg('dir', 'results'));
const baselineLabel = arg('baseline', 'baseline');
const scheme = arg('scheme', 'light') as Scheme;

const load = (file: string): Measurement =>
  JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as Measurement;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const baseline = load(`${baselineLabel}.json`);
const arms = files.filter(f => f !== `${baselineLabel}.json`).map(load);

const rows = arms.map(arm => ({arm, score: scoreArm(baseline, arm, {scheme})}));

const header = [
  'arm',
  'builds',
  'console',
  'app regressions',
  'unreadable',
  'mode-dependent',
  'vars captured',
  'verdict',
];
const body = rows.map(({score}) => [
  score.label,
  score.builds ? 'yes' : 'NO',
  String(score.consoleErrors),
  `${score.regressions} (${Object.entries(score.byCategory)
    .filter(([, n]) => n > 0)
    .map(([c, n]) => `${c[0]}${n}`)
    .join(' ')})`,
  String(score.contrastFailures.length),
  String(score.modeDependent.length),
  String(score.variablesCaptured.length),
  verdict(score),
]);

const widths = header.map((h, i) =>
  Math.max(h.length, ...body.map(r => r[i].length)),
);
const line = (cells: string[]) =>
  cells.map((c, i) => c.padEnd(widths[i])).join(' | ');

console.log(`\nSetup run — scheme: ${scheme}, baseline: ${baselineLabel}\n`);
console.log(line(header));
console.log(widths.map(w => '-'.repeat(w)).join('-+-'));
for (const r of body) {
  console.log(line(r));
}

for (const {score} of rows) {
  if (
    score.contrastFailures.length === 0 &&
    score.variablesCaptured.length === 0
  ) {
    continue;
  }
  console.log(`\n${score.label}:`);
  for (const f of score.contrastFailures) {
    console.log(`  unreadable  ${f.probe}: contrast ${f.before} -> ${f.after}`);
  }
  for (const v of score.variablesCaptured) {
    console.log(
      `  variable    ${v.name}: ${v.before || '(unset)'} -> ${v.after || '(unset)'}`,
    );
  }
}
console.log();

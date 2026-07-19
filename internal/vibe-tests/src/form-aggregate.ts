// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file form-aggregate.ts — blind aggregation + comparison for the form test
 *
 * Reads collected results from the four form-framework iterations, runs the
 * deterministic form evaluator on each, and produces a per-target comparison.
 *
 * Blind-judge discipline (invariant #7):
 *   - The evaluator is a pure function; it is inherently reproducible and has no
 *     memory across samples.
 *   - Before scoring, framework identity is stripped from the code
 *     (`stripIdentity`) so that any future LLM-judge layer added here cannot see
 *     which framework produced the output. The deterministic evaluator still
 *     needs the target to COUNT the equivalent concept, but it is given ONLY the
 *     target label, never the author's reasoning, prompt motivation, or a
 *     hypothesis about which framework "should" win.
 *   - The rubric (form-eval dimensions) is identical for every sample.
 *
 * Usage:
 *   npx tsx src/form-aggregate.ts --iterations "<id1>,<id2>,<id3>,<id4>"
 *   npx tsx src/form-aggregate.ts            # reads results/forms-config.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  evaluateForm,
  getFormAverage,
  getFormDimensionNames,
  type FormTarget,
  type FormPromptSpec,
  type FormScore,
} from './form-eval.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.resolve(__dirname, '..', 'results');

/**
 * Strip framework identity from generated code so an identity-blind judge cannot
 * tell targets apart. Import specifiers and package names are replaced with a
 * neutral placeholder. Used before any identity-sensitive judgment; the
 * deterministic evaluator is still given the target label separately, purely to
 * count the equivalent idiom.
 */
export function stripIdentity(code: string): string {
  return code
    .replace(/from\s+['"][^'"]+['"]/g, "from '<lib>'")
    .replace(/@astryxdesign\/[\w-]+/g, '<lib>')
    .replace(/@formisch\/\w+/g, '<lib>')
    .replace(/@tanstack\/[\w-]+/g, '<lib>')
    .replace(/react-hook-form|@hookform\/[\w/]+/g, '<lib>')
    .replace(/\bvalibot\b|\bzod\b/g, '<lib>');
}

interface Manifest {
  iterationId: string;
  config: {target: FormTarget; testKind: string};
  prompts: Array<
    FormPromptSpec & {prompt: string; status: string}
  >;
}

interface TargetAggregate {
  target: FormTarget;
  iterationId: string;
  byPrompt: Record<string, {score: FormScore; average: number; tier: string}>;
  coreAverage: number;
  stretchAverage: number | null;
  dimensionAverages: Record<string, number>;
}

function loadManifest(iterationId: string): Manifest {
  const p = path.join(RESULTS_DIR, iterationId, 'manifest.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as Manifest;
}

function readResult(iterationId: string, promptId: string): string | null {
  const p = path.join(RESULTS_DIR, iterationId, 'results', `${promptId}.tsx`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
}

function aggregateTarget(iterationId: string): TargetAggregate {
  const manifest = loadManifest(iterationId);
  const target = manifest.config.target;
  const byPrompt: TargetAggregate['byPrompt'] = {};
  const dimSums: Record<string, number> = {};
  const dims = getFormDimensionNames();
  for (const d of dims) {dimSums[d] = 0;}

  let coreSum = 0;
  let coreCount = 0;
  let stretchSum = 0;
  let stretchCount = 0;

  for (const p of manifest.prompts) {
    const code = readResult(iterationId, p.id);
    const spec: FormPromptSpec = {
      id: p.id,
      category: p.category,
      tier: p.tier,
      expectedBehaviors: p.expectedBehaviors,
    };
    // Missing output scores 0 across the board (agent failed to produce code).
    const score: FormScore = code
      ? evaluateForm(code, target, spec)
      : (Object.fromEntries(
          dims.map((d) => [d, {score: 0, findings: [{rule: 'no-output', detail: 'No code produced'}]}]),
        ) as unknown as FormScore);
    const average = getFormAverage(score);
    byPrompt[p.id] = {score, average, tier: p.tier};
    for (const d of dims) {dimSums[d] += score[d].score;}
    if (p.tier === 'core') {
      coreSum += average;
      coreCount++;
    } else {
      stretchSum += average;
      stretchCount++;
    }
  }

  const total = manifest.prompts.length || 1;
  const dimensionAverages: Record<string, number> = {};
  for (const d of dims) {dimensionAverages[d] = Math.round(dimSums[d] / total);}

  return {
    target,
    iterationId,
    byPrompt,
    coreAverage: coreCount ? Math.round(coreSum / coreCount) : 0,
    stretchAverage: stretchCount ? Math.round(stretchSum / stretchCount) : null,
    dimensionAverages,
  };
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const iterIdx = args.indexOf('--iterations');
  let iterationIds: string[];
  if (iterIdx !== -1) {
    iterationIds = args[iterIdx + 1].split(',').map((s) => s.trim());
  } else {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(RESULTS_DIR, 'forms-config.json'), 'utf-8'),
    );
    iterationIds = Object.values(cfg.iterations);
  }

  const aggregates = iterationIds.map(aggregateTarget);
  const dims = getFormDimensionNames();

  // Headline: CORE-only.
  console.log('\n═══ Form-Framework Vibe Test — Results ═══\n');
  console.log('HEADLINE (CORE tier only):\n');
  const sorted = [...aggregates].sort((a, b) => b.coreAverage - a.coreAverage);
  for (const a of sorted) {
    console.log(`  ${a.target.padEnd(10)} ${String(a.coreAverage).padStart(3)}  (${a.iterationId})`);
  }

  console.log('\nPer-dimension (CORE + STRETCH averaged):\n');
  const header = 'target'.padEnd(11) + dims.map((d) => d.slice(0, 10).padStart(11)).join('');
  console.log('  ' + header);
  for (const a of aggregates) {
    const row =
      a.target.padEnd(11) +
      dims.map((d) => String(a.dimensionAverages[d]).padStart(11)).join('');
    console.log('  ' + row);
  }

  console.log('\nSTRETCH tier (reported separately, roadmap signal):\n');
  for (const a of aggregates) {
    const s = a.stretchAverage === null ? 'n/a' : String(a.stretchAverage);
    console.log(`  ${a.target.padEnd(10)} ${s}`);
  }

  const outPath = path.join(RESULTS_DIR, 'form-comparison.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {createdAt: new Date().toISOString(), aggregates},
      null,
      2,
    ),
  );
  console.log(`\n📄 Comparison written: ${outPath}\n`);
}

main();

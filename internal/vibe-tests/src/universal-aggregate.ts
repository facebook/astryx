#!/usr/bin/env node
/**
 * @file Universal aggregate scoring across 6 dimensions
 *
 * Scores an iteration's results using target-neutral evaluation.
 *
 * Usage:
 *   tsx src/universal-aggregate.ts --iteration <id>
 *   tsx src/universal-aggregate.ts --iteration <id> --json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  UniversalDimension,
  UniversalScore,
  UniversalAggregate,
} from './types.js';
import {getResultsDir, readJson, writeJson} from './utils.js';
import {evaluate} from './universal-eval.js';

const DIMENSION_LABELS: Record<UniversalDimension, string> = {
  accessibility: 'Accessibility',
  codeQuality: 'Code Quality',
  repetition: 'DRYness',
  conciseness: 'Conciseness',
  themeAdherence: 'Theme Adherence',
  correctness: 'Correctness',
};

const DIMENSIONS: UniversalDimension[] = [
  'accessibility',
  'codeQuality',
  'repetition',
  'conciseness',
  'themeAdherence',
  'correctness',
];

function parseArgs(): {iteration: string; json: boolean} {
  const args = process.argv.slice(2);
  let iteration = '';
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' && args[i + 1]) {
      iteration = args[i + 1];
      i++;
    } else if (args[i] === '--json') {
      json = true;
    }
  }

  if (!iteration) {
    console.error('Usage: tsx src/universal-aggregate.ts --iteration <id> [--json]');
    process.exit(1);
  }

  return {iteration, json};
}

async function main() {
  const {iteration, json} = parseArgs();
  const resultsDir = getResultsDir();
  const iterDir = path.join(resultsDir, iteration);
  const codeDir = path.join(iterDir, 'results');
  const manifestPath = path.join(iterDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`No manifest.json found at ${manifestPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(codeDir)) {
    console.error(`No results directory found at ${codeDir}`);
    process.exit(1);
  }

  const manifest = readJson<{
    config: {target: string};
    prompts: Array<{id: string; category: string}>;
  }>(manifestPath);

  const target = manifest.config.target as 'xds' | 'baseline';
  const promptMap = new Map(
    manifest.prompts.map(p => [p.id, p.category]),
  );

  // Load .tsx files
  const files = fs.readdirSync(codeDir).filter(f => f.endsWith('.tsx'));

  if (files.length === 0) {
    console.error('No .tsx result files found');
    process.exit(1);
  }

  console.log(`Evaluating ${files.length} results for iteration ${iteration} (target: ${target})\n`);

  const byPrompt: Record<string, UniversalScore> = {};
  const categoryScores: Record<string, Record<UniversalDimension, number>> = {};
  let darkModeCount = 0;
  let totalCount = 0;

  for (const file of files) {
    const promptId = path.basename(file, '.tsx');
    const code = fs.readFileSync(path.join(codeDir, file), 'utf-8');
    const score = evaluate(code, target);

    byPrompt[promptId] = score;
    totalCount++;

    if (score.themeAdherence.darkModeSupport) {
      darkModeCount++;
    }

    // Accumulate category scores
    const category = promptMap.get(promptId) ?? 'unknown';
    if (!categoryScores[category]) {
      categoryScores[category] = {} as Record<UniversalDimension, number[]>;
      for (const dim of DIMENSIONS) {
        categoryScores[category][dim] = [];
      }
    }
    for (const dim of DIMENSIONS) {
      categoryScores[category][dim].push(score[dim].score);
    }
  }

  // Compute averages
  const averages = {} as Record<UniversalDimension, number>;
  for (const dim of DIMENSIONS) {
    const allScores = Object.values(byPrompt).map(s => s[dim].score);
    averages[dim] = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  }

  const overall =
    Object.values(averages).reduce((a, b) => a + b, 0) / DIMENSIONS.length;

  // Compute category averages
  const byCategory: Record<string, Record<UniversalDimension, number>> = {};
  for (const [cat, dims] of Object.entries(categoryScores)) {
    byCategory[cat] = {} as Record<UniversalDimension, number>;
    for (const dim of DIMENSIONS) {
      const scores = dims[dim];
      byCategory[cat][dim] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }

  const darkModeRate = totalCount > 0 ? darkModeCount / totalCount : 0;

  const aggregate: UniversalAggregate = {
    averages,
    overall,
    byPrompt,
    byCategory,
    darkModeRate,
  };

  // Save
  const outputPath = path.join(iterDir, 'universal.json');
  writeJson(outputPath, aggregate);

  if (json) {
    console.log(JSON.stringify(aggregate, null, 2));
    return;
  }

  // Print formatted table
  console.log('┌─────────────────────┬─────────┐');
  console.log('│ Dimension           │  Score  │');
  console.log('├─────────────────────┼─────────┤');
  for (const dim of DIMENSIONS) {
    const label = DIMENSION_LABELS[dim].padEnd(19);
    const score = (averages[dim] * 100).toFixed(1).padStart(5) + '%';
    console.log(`│ ${label} │ ${score}  │`);
  }
  console.log('├─────────────────────┼─────────┤');
  const overallStr = (overall * 100).toFixed(1).padStart(5) + '%';
  console.log(`│ ${'Overall'.padEnd(19)} │ ${overallStr}  │`);
  console.log('└─────────────────────┴─────────┘');

  console.log(`\nDark mode support: ${(darkModeRate * 100).toFixed(0)}% (${darkModeCount}/${totalCount})`);
  console.log(`Results saved to: ${outputPath}`);

  // Category breakdown
  const categories = Object.keys(byCategory).sort();
  if (categories.length > 1) {
    console.log('\nBy Category:');
    for (const cat of categories) {
      const catAvg =
        Object.values(byCategory[cat]).reduce((a, b) => a + b, 0) /
        DIMENSIONS.length;
      console.log(`  ${cat}: ${(catAvg * 100).toFixed(1)}%`);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

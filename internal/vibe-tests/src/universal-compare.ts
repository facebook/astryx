#!/usr/bin/env node
/**
 * @file Side-by-side comparison of two iterations using universal scoring
 *
 * Usage:
 *   tsx src/universal-compare.ts --xds <id> --baseline <id>
 *   tsx src/universal-compare.ts --xds <id> --baseline <id> --json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import type {
  UniversalDimension,
  UniversalScore,
  UniversalAggregate,
  UniversalComparison,
} from './types.js';
import {getResultsDir, readJson, writeJson} from './utils.js';

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

function parseArgs(): {xds: string; baseline: string; json: boolean} {
  const args = process.argv.slice(2);
  let xds = '';
  let baseline = '';
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--xds' && args[i + 1]) {
      xds = args[i + 1];
      i++;
    } else if (args[i] === '--baseline' && args[i + 1]) {
      baseline = args[i + 1];
      i++;
    } else if (args[i] === '--json') {
      json = true;
    }
  }

  if (!xds || !baseline) {
    console.error('Usage: tsx src/universal-compare.ts --xds <id> --baseline <id> [--json]');
    process.exit(1);
  }

  return {xds, baseline, json};
}

function ensureUniversalJson(iteration: string): UniversalAggregate {
  const resultsDir = getResultsDir();
  const universalPath = path.join(resultsDir, iteration, 'universal.json');

  if (!fs.existsSync(universalPath)) {
    console.log(`Generating universal.json for ${iteration}...`);
    execSync(
      `tsx ${path.join(import.meta.dirname, 'universal-aggregate.ts')} --iteration ${iteration}`,
      {cwd: path.join(import.meta.dirname, '..'), stdio: 'inherit'},
    );
  }

  return readJson<UniversalAggregate>(universalPath);
}

function winner(
  a: number,
  b: number,
  threshold = 0.01,
): 'xds' | 'baseline' | 'tie' {
  const diff = a - b;
  if (Math.abs(diff) < threshold) return 'tie';
  return diff > 0 ? 'xds' : 'baseline';
}

function winnerIcon(w: 'xds' | 'baseline' | 'tie'): string {
  if (w === 'xds') return '🟢';
  if (w === 'baseline') return '🔴';
  return '⚪';
}

async function main() {
  const {xds: xdsId, baseline: baselineId, json} = parseArgs();

  const xds = ensureUniversalJson(xdsId);
  const baseline = ensureUniversalJson(baselineId);

  // Per-dimension winners
  const winners = {} as Record<UniversalDimension, 'xds' | 'baseline' | 'tie'>;
  for (const dim of DIMENSIONS) {
    winners[dim] = winner(xds.averages[dim], baseline.averages[dim]);
  }

  // Per-prompt comparison
  const allPromptIds = new Set([
    ...Object.keys(xds.byPrompt),
    ...Object.keys(baseline.byPrompt),
  ]);

  const byPrompt: UniversalComparison['byPrompt'] = {};
  for (const promptId of allPromptIds) {
    const xdsScore = xds.byPrompt[promptId];
    const baselineScore = baseline.byPrompt[promptId];
    if (!xdsScore || !baselineScore) continue;

    const xdsOverall =
      DIMENSIONS.reduce((s, d) => s + xdsScore[d].score, 0) / DIMENSIONS.length;
    const baselineOverall =
      DIMENSIONS.reduce((s, d) => s + baselineScore[d].score, 0) / DIMENSIONS.length;

    byPrompt[promptId] = {
      xds: xdsScore,
      baseline: baselineScore,
      winner: winner(xdsOverall, baselineOverall),
    };
  }

  const comparison: UniversalComparison = {
    xds,
    baseline,
    winners,
    byPrompt,
  };

  // Save comparison
  const resultsDir = getResultsDir();
  const outputPath = path.join(resultsDir, `comparison-${xdsId}-${baselineId}.json`);
  writeJson(outputPath, comparison);

  if (json) {
    console.log(JSON.stringify(comparison, null, 2));
    return;
  }

  // Print comparison table
  console.log(`\nUniversal Comparison: XDS (${xdsId}) vs Baseline (${baselineId})\n`);
  console.log('┌─────────────────────┬──────────┬──────────┬────────┐');
  console.log('│ Dimension           │   XDS    │ Baseline │ Winner │');
  console.log('├─────────────────────┼──────────┼──────────┼────────┤');
  for (const dim of DIMENSIONS) {
    const label = DIMENSION_LABELS[dim].padEnd(19);
    const xdsScore = (xds.averages[dim] * 100).toFixed(1).padStart(5) + '%';
    const baseScore = (baseline.averages[dim] * 100).toFixed(1).padStart(5) + '%';
    const w = winners[dim];
    const icon = winnerIcon(w);
    console.log(`│ ${label} │ ${xdsScore}   │ ${baseScore}   │  ${icon}   │`);
  }
  console.log('├─────────────────────┼──────────┼──────────┼────────┤');
  const xdsOverall = (xds.overall * 100).toFixed(1).padStart(5) + '%';
  const baseOverall = (baseline.overall * 100).toFixed(1).padStart(5) + '%';
  const overallWinner = winner(xds.overall, baseline.overall);
  console.log(`│ ${'Overall'.padEnd(19)} │ ${xdsOverall}   │ ${baseOverall}   │  ${winnerIcon(overallWinner)}   │`);
  console.log('└─────────────────────┴──────────┴──────────┴────────┘');

  // Category breakdown
  const allCategories = new Set([
    ...Object.keys(xds.byCategory),
    ...Object.keys(baseline.byCategory),
  ]);

  if (allCategories.size > 0) {
    console.log('\nBy Category:');
    console.log('┌──────────────────────┬──────────┬──────────┬────────┐');
    console.log('│ Category             │   XDS    │ Baseline │ Winner │');
    console.log('├──────────────────────┼──────────┼──────────┼────────┤');
    for (const cat of [...allCategories].sort()) {
      const xdsCat = xds.byCategory[cat];
      const baseCat = baseline.byCategory[cat];
      if (!xdsCat || !baseCat) continue;

      const xdsAvg =
        Object.values(xdsCat).reduce((a, b) => a + b, 0) / DIMENSIONS.length;
      const baseAvg =
        Object.values(baseCat).reduce((a, b) => a + b, 0) / DIMENSIONS.length;

      const label = cat.padEnd(20);
      const xdsStr = (xdsAvg * 100).toFixed(1).padStart(5) + '%';
      const baseStr = (baseAvg * 100).toFixed(1).padStart(5) + '%';
      const w = winner(xdsAvg, baseAvg);
      console.log(`│ ${label} │ ${xdsStr}   │ ${baseStr}   │  ${winnerIcon(w)}   │`);
    }
    console.log('└──────────────────────┴──────────┴──────────┴────────┘');
  }

  // Per-prompt wins
  let xdsWins = 0;
  let baselineWins = 0;
  let ties = 0;
  for (const p of Object.values(byPrompt)) {
    if (p.winner === 'xds') xdsWins++;
    else if (p.winner === 'baseline') baselineWins++;
    else ties++;
  }

  const totalPrompts = xdsWins + baselineWins + ties;
  console.log(`\nPer-Prompt Wins: XDS ${xdsWins} | Baseline ${baselineWins} | Tie ${ties} (${totalPrompts} prompts)`);

  // Dark mode rates
  console.log(
    `\nDark Mode Support: XDS ${(xds.darkModeRate * 100).toFixed(0)}% | Baseline ${(baseline.darkModeRate * 100).toFixed(0)}%`,
  );

  // Conciseness metrics
  const xdsConciseness = xds.averages.conciseness;
  const baseConciseness = baseline.averages.conciseness;
  console.log(
    `Conciseness: XDS ${(xdsConciseness * 100).toFixed(1)}% | Baseline ${(baseConciseness * 100).toFixed(1)}%`,
  );

  console.log(`\nComparison saved to: ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

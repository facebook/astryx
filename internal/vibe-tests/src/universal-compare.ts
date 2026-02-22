#!/usr/bin/env node
/**
 * @file Universal Compare — side-by-side comparison of two iterations
 *
 * Usage:
 *   tsx src/universal-compare.ts --xds abc123 --baseline def456
 *   tsx src/universal-compare.ts --xds abc123 --baseline def456 --json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import type {
  UniversalAggregate,
  UniversalComparison,
  UniversalDimension,
} from './types.js';
import {writeJson, getResultsDir} from './utils.js';
import {getDimensionNames, getAverageScore} from './universal-eval.js';

const DIMENSION_LABELS: Record<UniversalDimension, string> = {
  correctness: 'Correctness',
  accessibility: 'Accessibility',
  codeQuality: 'Code Quality',
  efficiency: 'Efficiency',
  maintainability: 'Maintainability',
};

function loadOrGenerate(iterationId: string): UniversalAggregate {
  const universalPath = path.join(
    getResultsDir(),
    iterationId,
    'universal.json',
  );

  if (fs.existsSync(universalPath)) {
    return JSON.parse(fs.readFileSync(universalPath, 'utf-8'));
  }

  console.log(`⏳ Generating universal.json for ${iterationId}...`);
  const scriptPath = path.join(import.meta.dirname, 'universal-aggregate.ts');
  execSync(`npx tsx ${scriptPath} --iteration ${iterationId}`, {
    stdio: 'inherit',
    cwd: path.join(import.meta.dirname, '..'),
  });

  return JSON.parse(fs.readFileSync(universalPath, 'utf-8'));
}

function winner(a: number, b: number): 'xds' | 'baseline' | 'tie' {
  if (a > b) return 'xds';
  if (b > a) return 'baseline';
  return 'tie';
}

function winnerIcon(w: 'xds' | 'baseline' | 'tie'): string {
  switch (w) {
    case 'xds':
      return '🟢 XDS';
    case 'baseline':
      return '🔵 Base';
    case 'tie':
      return '⚪ Tie';
  }
}

function parseArgs(): {xds: string; baseline: string; json: boolean} {
  const args = process.argv.slice(2);
  let xds = '';
  let baseline = '';
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--xds' || args[i] === '-x') && args[i + 1]) {
      xds = args[++i];
    } else if ((args[i] === '--baseline' || args[i] === '-b') && args[i + 1]) {
      baseline = args[++i];
    } else if (args[i] === '--json') {
      json = true;
    }
  }

  if (!xds || !baseline) {
    console.error(
      'Usage: tsx src/universal-compare.ts --xds <id> --baseline <id> [--json]',
    );
    process.exit(1);
  }

  return {xds, baseline, json};
}

async function main() {
  const {xds: xdsId, baseline: baselineId, json} = parseArgs();

  const xds = loadOrGenerate(xdsId);
  const baseline = loadOrGenerate(baselineId);

  const dimensions = getDimensionNames();

  // Build comparison
  const winners = {} as Record<UniversalDimension, 'xds' | 'baseline' | 'tie'>;
  for (const d of dimensions) {
    winners[d] = winner(xds.averages[d], baseline.averages[d]);
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
    if (xdsScore && baselineScore) {
      byPrompt[promptId] = {
        xds: xdsScore,
        baseline: baselineScore,
        winner: winner(
          getAverageScore(xdsScore),
          getAverageScore(baselineScore),
        ),
      };
    }
  }

  const comparison: UniversalComparison = {xds, baseline, winners, byPrompt};

  // Save
  const outputPath = path.join(
    getResultsDir(),
    `comparison-${xdsId}-${baselineId}.json`,
  );
  writeJson(outputPath, comparison);

  if (json) {
    console.log(JSON.stringify(comparison, null, 2));
    return;
  }

  // --- Print report ---

  console.log(`\n📊 Universal Comparison: XDS vs Baseline`);
  console.log('═'.repeat(52));

  // Dimension table
  console.log('┌─────────────────────┬───────┬──────────┬──────────┐');
  console.log('│ Dimension           │  XDS  │ Baseline │  Winner  │');
  console.log('├─────────────────────┼───────┼──────────┼──────────┤');
  for (const d of dimensions) {
    const label = DIMENSION_LABELS[d].padEnd(19);
    const xScore = String(xds.averages[d]).padStart(3);
    const bScore = String(baseline.averages[d]).padStart(3);
    const w = winnerIcon(winners[d]).padEnd(8);
    console.log(`│ ${label} │  ${xScore}  │   ${bScore}    │ ${w} │`);
  }
  console.log('├─────────────────────┼───────┼──────────┼──────────┤');
  const xOverall = String(xds.overall).padStart(3);
  const bOverall = String(baseline.overall).padStart(3);
  const overallW = winnerIcon(winner(xds.overall, baseline.overall)).padEnd(8);
  console.log(
    `│ ${'Overall'.padEnd(19)} │  ${xOverall}  │   ${bOverall}    │ ${overallW} │`,
  );
  console.log('└─────────────────────┴───────┴──────────┴──────────┘');

  // Dark mode
  console.log(
    `\n🌙 Dark Mode: XDS ${xds.darkModeRate}% | Baseline ${baseline.darkModeRate}%`,
  );

  // Efficiency metrics comparison
  const xdsEff = Object.values(xds.byPrompt).map(s => s.efficiency.metrics!);
  const baseEff = Object.values(baseline.byPrompt).map(
    s => s.efficiency.metrics!,
  );
  if (xdsEff.length > 0 && baseEff.length > 0) {
    const xDpe =
      xdsEff.reduce((s, m) => s + m.decisionsPerElement, 0) / xdsEff.length;
    const bDpe =
      baseEff.reduce((s, m) => s + m.decisionsPerElement, 0) / baseEff.length;
    const xLines = xdsEff.reduce((s, m) => s + m.codeLines, 0) / xdsEff.length;
    const bLines =
      baseEff.reduce((s, m) => s + m.codeLines, 0) / baseEff.length;
    console.log(`\n⚡ Efficiency Metrics:`);
    console.log(
      `   Decisions/element: XDS ${xDpe.toFixed(1)} | Baseline ${bDpe.toFixed(1)} | ${winnerIcon(winner(bDpe, xDpe))}`,
    );
    console.log(
      `   Avg code lines:   XDS ${Math.round(xLines)} | Baseline ${Math.round(bLines)} | ${winnerIcon(winner(bLines, xLines))}`,
    );
  }

  // Maintainability metrics comparison
  const xdsMaint = Object.values(xds.byPrompt).map(
    s => s.maintainability.metrics!,
  );
  const baseMaint = Object.values(baseline.byPrompt).map(
    s => s.maintainability.metrics!,
  );
  if (xdsMaint.length > 0 && baseMaint.length > 0) {
    const xSem =
      xdsMaint.reduce((s, m) => s + m.semanticRatio, 0) / xdsMaint.length;
    const bSem =
      baseMaint.reduce((s, m) => s + m.semanticRatio, 0) / baseMaint.length;
    const xMagic = xdsMaint.reduce((s, m) => s + m.magicValueCount, 0);
    const bMagic = baseMaint.reduce((s, m) => s + m.magicValueCount, 0);
    console.log(`\n🔧 Maintainability Metrics:`);
    console.log(
      `   Semantic ratio:   XDS ${(xSem * 100).toFixed(0)}% | Baseline ${(bSem * 100).toFixed(0)}% | ${winnerIcon(winner(xSem, bSem))}`,
    );
    console.log(
      `   Magic values:     XDS ${xMagic} | Baseline ${bMagic} | ${winnerIcon(winner(bMagic, xMagic))}`,
    );
  }

  // Cost comparison
  if (xds.cost && baseline.cost) {
    console.log(`\n💰 Cost:`);
    const xAvgMs = xds.cost.avgDurationMs;
    const bAvgMs = baseline.cost.avgDurationMs;
    if (xAvgMs > 0 && bAvgMs > 0) {
      console.log(
        `   Avg duration:     XDS ${(xAvgMs / 1000).toFixed(1)}s | Baseline ${(bAvgMs / 1000).toFixed(1)}s | ${winnerIcon(winner(bAvgMs, xAvgMs))}`,
      );
    }
    console.log(
      `   Avg output lines: XDS ${xds.cost.avgOutputLines} | Baseline ${baseline.cost.avgOutputLines} | ${winnerIcon(winner(baseline.cost.avgOutputLines, xds.cost.avgOutputLines))}`,
    );
    console.log(
      `   Avg docs read:    XDS ${xds.cost.avgDocsRead} | Baseline ${baseline.cost.avgDocsRead}`,
    );
    console.log(
      `   Est. tokens:      XDS ~${xds.cost.estimatedInputTokens + xds.cost.estimatedOutputTokens} | Baseline ~${baseline.cost.estimatedInputTokens + baseline.cost.estimatedOutputTokens} | ${winnerIcon(winner(baseline.cost.estimatedInputTokens + baseline.cost.estimatedOutputTokens, xds.cost.estimatedInputTokens + xds.cost.estimatedOutputTokens))}`,
    );
  }

  // Per-prompt wins
  const promptEntries = Object.entries(byPrompt);
  if (promptEntries.length > 0) {
    let xWins = 0;
    let bWins = 0;
    let ties = 0;
    for (const [, data] of promptEntries) {
      if (data.winner === 'xds') xWins++;
      else if (data.winner === 'baseline') bWins++;
      else ties++;
    }
    console.log(
      `\n📝 Per-Prompt: XDS wins ${xWins} | Baseline wins ${bWins} | Ties ${ties} (${promptEntries.length} prompts)`,
    );
  }

  console.log(`\nSaved: ${outputPath}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

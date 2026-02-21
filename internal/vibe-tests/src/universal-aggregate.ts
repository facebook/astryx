#!/usr/bin/env node
/**
 * @file Universal aggregate scoring across 5 dimensions
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
import {getResultsDir, writeJson} from './utils.js';
import {evaluate, getDimensionNames} from './universal-eval.js';

const DIMENSION_LABELS: Record<UniversalDimension, string> = {
  correctness: 'Correctness',
  accessibility: 'Accessibility',
  codeQuality: 'Code Quality',
  efficiency: 'Efficiency',
  maintainability: 'Maintainability',
};

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
    console.error(
      'Usage: tsx src/universal-aggregate.ts --iteration <id> [--json]',
    );
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

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const target = (manifest.config?.target || 'xds') as string;
  const promptMap = new Map<string, string>(
    (manifest.prompts || []).map((p: {id: string; category: string}) => [
      p.id,
      p.category,
    ]),
  );

  // Load .tsx files
  const files = fs.readdirSync(codeDir).filter(f => f.endsWith('.tsx'));

  if (files.length === 0) {
    console.error('No .tsx result files found');
    process.exit(1);
  }

  const dimensions = getDimensionNames();
  const byPrompt: Record<string, UniversalScore> = {};
  const categoryScores: Record<
    string,
    Record<UniversalDimension, number[]>
  > = {};
  let darkModeCount = 0;

  // Cost tracking
  const costByPrompt: Record<
    string,
    {
      durationMs: number;
      outputChars: number;
      outputLines: number;
      docsRead: string[];
      estimatedInputTokens: number;
      estimatedOutputTokens: number;
    }
  > = {};

  /** Rough doc size estimates in chars (for input token calculation) */
  const DOC_CHAR_SIZES: Record<string, number> = {
    'AGENTS.md': 1200,
    'AGENTS.baseline.md': 740,
    'principles.md': 1130,
    'tokens.md': 3600,
  };
  const DEFAULT_DOC_SIZE = 2500; // avg component doc size

  for (const file of files) {
    const promptId = path.basename(file, '.tsx');
    const codePath = path.join(codeDir, file);
    const code = fs.readFileSync(codePath, 'utf-8');
    const score = evaluate(code, target);
    byPrompt[promptId] = score;

    if (score.maintainability.metrics?.darkModeSupport) {
      darkModeCount++;
    }

    const category = promptMap.get(promptId) ?? 'unknown';
    if (!categoryScores[category]) {
      categoryScores[category] = {} as Record<UniversalDimension, number[]>;
      for (const dim of dimensions) {
        categoryScores[category][dim] = [];
      }
    }
    for (const dim of dimensions) {
      categoryScores[category][dim].push(score[dim].score);
    }

    // --- Cost data ---
    // Duration: infer from file timestamps (task creation → result write)
    let durationMs = 0;
    const taskPath = path.join(iterDir, 'tasks', `${promptId}.json`);
    if (fs.existsSync(taskPath)) {
      const taskStat = fs.statSync(taskPath);
      const resultStat = fs.statSync(codePath);
      const inferred = resultStat.mtimeMs - taskStat.mtimeMs;
      if (inferred > 0) durationMs = Math.round(inferred);
    }

    // Docs read: from companion .json file
    let docsRead: string[] = [];
    const jsonPath = path.join(codeDir, `${promptId}.json`);
    if (fs.existsSync(jsonPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        docsRead = meta.docsRead || [];
      } catch {
        // ignore parse errors
      }
    }

    // Estimate input tokens from docs read
    let estimatedInputChars = 0;
    for (const doc of docsRead) {
      const key = doc.endsWith('.md') ? doc : `${doc}.md`;
      estimatedInputChars += DOC_CHAR_SIZES[key] || DEFAULT_DOC_SIZE;
    }
    // Add prompt overhead (~1500 chars)
    estimatedInputChars += 1500;

    costByPrompt[promptId] = {
      durationMs,
      outputChars: code.length,
      outputLines: code.split('\n').length,
      docsRead,
      estimatedInputTokens: Math.round(estimatedInputChars / 4),
      estimatedOutputTokens: Math.round(code.length / 4),
    };
  }

  // Compute averages
  const promptCount = Object.keys(byPrompt).length;
  const averages = {} as Record<UniversalDimension, number>;
  for (const dim of dimensions) {
    const scores = Object.values(byPrompt).map(s => s[dim].score);
    averages[dim] = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );
  }

  const overall = Math.round(
    dimensions.reduce((s, d) => s + averages[d], 0) / dimensions.length,
  );

  // Category averages
  const byCategory: Record<string, Record<UniversalDimension, number>> = {};
  for (const [cat, dimScores] of Object.entries(categoryScores)) {
    byCategory[cat] = {} as Record<UniversalDimension, number>;
    for (const dim of dimensions) {
      const scores = dimScores[dim];
      byCategory[cat][dim] = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
    }
  }

  const darkModeRate = Math.round((darkModeCount / promptCount) * 100);

  // Compute cost aggregates
  const costEntries = Object.values(costByPrompt);
  const totalDurationMs = costEntries.reduce((s, c) => s + c.durationMs, 0);
  const totalOutputChars = costEntries.reduce((s, c) => s + c.outputChars, 0);
  const totalOutputLines = costEntries.reduce((s, c) => s + c.outputLines, 0);
  const totalDocsRead = costEntries.reduce((s, c) => s + c.docsRead.length, 0);
  const totalInputTokens = costEntries.reduce(
    (s, c) => s + c.estimatedInputTokens,
    0,
  );
  const totalOutputTokens = costEntries.reduce(
    (s, c) => s + c.estimatedOutputTokens,
    0,
  );

  const aggregate: UniversalAggregate = {
    averages,
    overall,
    byPrompt,
    byCategory,
    darkModeRate,
    cost: {
      totalDurationMs,
      avgDurationMs: Math.round(totalDurationMs / promptCount),
      avgOutputChars: Math.round(totalOutputChars / promptCount),
      avgOutputLines: Math.round(totalOutputLines / promptCount),
      avgDocsRead: Math.round((totalDocsRead / promptCount) * 10) / 10,
      estimatedInputTokens: totalInputTokens,
      estimatedOutputTokens: totalOutputTokens,
      byPrompt: costByPrompt,
    },
  };

  // Save
  const outputPath = path.join(iterDir, 'universal.json');
  writeJson(outputPath, aggregate);

  if (json) {
    console.log(JSON.stringify(aggregate, null, 2));
    return;
  }

  // Print formatted table
  console.log(`\n📊 Universal Evaluation — Iteration ${iteration}`);
  console.log(`   ${promptCount} prompts, target: ${target}\n`);

  console.log('┌─────────────────────┬───────┐');
  console.log('│ Dimension           │ Score │');
  console.log('├─────────────────────┼───────┤');
  for (const dim of dimensions) {
    const label = DIMENSION_LABELS[dim].padEnd(19);
    const score = String(averages[dim]).padStart(3);
    console.log(`│ ${label} │  ${score}  │`);
  }
  console.log('├─────────────────────┼───────┤');
  console.log(`│ ${'Overall'.padEnd(19)} │  ${String(overall).padStart(3)}  │`);
  console.log('└─────────────────────┴───────┘');

  console.log(`\n🌙 Dark Mode: ${darkModeRate}%`);

  // Efficiency metrics summary
  const allEfficiency = Object.values(byPrompt).map(s => s.efficiency.metrics!);
  if (allEfficiency.length > 0) {
    const avgDecisions =
      allEfficiency.reduce((s, m) => s + m.decisionsPerElement, 0) /
      allEfficiency.length;
    const avgLines =
      allEfficiency.reduce((s, m) => s + m.codeLines, 0) / allEfficiency.length;
    console.log(`\n⚡ Efficiency:`);
    console.log(`   Avg decisions/element: ${avgDecisions.toFixed(1)}`);
    console.log(`   Avg code lines: ${Math.round(avgLines)}`);
  }

  // Maintainability metrics summary
  const allMaint = Object.values(byPrompt).map(s => s.maintainability.metrics!);
  if (allMaint.length > 0) {
    const avgSemantic =
      allMaint.reduce((s, m) => s + m.semanticRatio, 0) / allMaint.length;
    const totalMagic = allMaint.reduce((s, m) => s + m.magicValueCount, 0);
    console.log(`\n🔧 Maintainability:`);
    console.log(`   Semantic ratio: ${(avgSemantic * 100).toFixed(0)}%`);
    console.log(`   Magic values: ${totalMagic}`);
  }

  // Cost metrics
  if (aggregate.cost && aggregate.cost.totalDurationMs > 0) {
    const c = aggregate.cost;
    console.log(`\n💰 Cost:`);
    console.log(
      `   Duration: ${(c.totalDurationMs / 1000).toFixed(1)}s total, ${(c.avgDurationMs / 1000).toFixed(1)}s avg`,
    );
    console.log(
      `   Output: ${c.avgOutputLines} lines avg (${c.avgOutputChars} chars)`,
    );
    console.log(`   Docs read: ${c.avgDocsRead} avg per prompt`);
    console.log(
      `   Tokens: ~${c.estimatedInputTokens} input, ~${c.estimatedOutputTokens} output`,
    );
  }

  // Category breakdown
  const categories = Object.keys(byCategory).sort();
  if (categories.length > 1) {
    console.log('\n📂 By Category:');
    for (const cat of categories) {
      const catOverall = Math.round(
        dimensions.reduce((s, d) => s + byCategory[cat][d], 0) /
          dimensions.length,
      );
      console.log(`   ${cat.padEnd(25)} ${catOverall}`);
    }
  }

  console.log(`\nSaved: ${outputPath}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

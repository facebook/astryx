#!/usr/bin/env node
/**
 * @file CLI entry point for vibe-tests harness
 * @position internal/vibe-tests/src/cli.ts
 */

import {Command} from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import type {RunConfig, PersonaType, Protocol, Iteration} from './types.js';
import {runTests} from './runner.js';
import {analyze} from './analyst.js';
import {
  loadTestSet,
  readJsonl,
  writeJson,
  readJson,
  ensureDir,
  getResultsDir,
} from './utils.js';
import type {TestResult} from './types.js';

const program = new Command();

program
  .name('vibe-tests')
  .description('Vibeability test harness for LLM component system usage')
  .version('0.0.1');

/**
 * Run command
 */
program
  .command('run')
  .description('Run vibeability tests')
  .option('--protocol <type>', 'Test protocol', 'one-shot')
  .option('--persona <type>', 'User persona', 'naive')
  .option('--model <model>', 'LLM model', 'claude-sonnet-4-20250514')
  .option('--skill-doc <path>', 'Path to skill doc')
  .option('--sample <n>', 'Sample N prompts (stratified)', parseInt)
  .option('--holdout', 'Run holdout set instead of main prompts')
  .action(async options => {
    const skillDocPath =
      options.skillDoc ?? process.env.SKILL_DOC ?? './skills/brownie.md';

    if (!fs.existsSync(skillDocPath)) {
      console.error(`Error: Skill doc not found at ${skillDocPath}`);
      console.error(
        'Set SKILL_DOC env var or use --skill-doc flag to specify path',
      );
      process.exit(1);
    }

    const config: RunConfig = {
      protocol: options.protocol as Protocol,
      persona: options.persona as PersonaType,
      model: options.model,
      skillDocPath,
      sample: options.sample,
      holdout: options.holdout,
    };

    const testSet = loadTestSet('default');
    const result = await runTests(testSet, config);

    // Print results summary
    console.log('Results:');
    console.log(
      `  Overall: ${calculateSuccessRate(result.results)}% success (${result.results.filter(r => r.evaluation.success).length}/${result.results.length})\n`,
    );

    // By category
    console.log('  By category:');
    const byCategory = groupBy(result.results, r => r.promptCategory);
    for (const [category, results] of Object.entries(byCategory)) {
      console.log(`    ${category}: ${calculateSuccessRate(results)}%`);
    }

    // Escape hatches
    console.log('\n  Critical issues:');
    const criticalHatches = result.results.flatMap(r =>
      r.evaluation.escapeHatches.filter(h => h.severity === 'critical'),
    );
    const criticalCounts = countBy(criticalHatches, h => h.type);
    for (const [type, count] of Object.entries(criticalCounts)) {
      console.log(`    - ${type} (${count})`);
    }

    console.log('\n  Acceptable escape hatches:');
    const acceptableHatches = result.results.flatMap(r =>
      r.evaluation.escapeHatches.filter(h => h.severity === 'acceptable'),
    );
    const acceptableCounts = countBy(acceptableHatches, h => h.type);
    for (const [type, count] of Object.entries(acceptableCounts)) {
      console.log(`    - ${type} (${count})`);
    }

    console.log(
      `\n  Results saved: ${path.join(getResultsDir(), result.iterationId, 'runs.jsonl')}`,
    );
    console.log(
      `\nRun \`vibe-tests analyze --iteration ${result.iterationId}\` for refinement suggestions.`,
    );
  });

/**
 * Analyze command
 */
program
  .command('analyze')
  .description('Analyze test results from an iteration')
  .requiredOption('--iteration <id>', 'Iteration ID to analyze')
  .option(
    '--model <model>',
    'LLM model for analysis',
    'claude-sonnet-4-20250514',
  )
  .option('--skill-doc <path>', 'Path to skill doc')
  .action(async options => {
    const iterationId = options.iteration;
    const resultsDir = path.join(getResultsDir(), iterationId);

    if (!fs.existsSync(resultsDir)) {
      console.error(`Error: Iteration ${iterationId} not found`);
      process.exit(1);
    }

    const runsPath = path.join(resultsDir, 'runs.jsonl');
    const results = readJsonl<TestResult>(runsPath);

    if (results.length === 0) {
      console.error(`Error: No results found for iteration ${iterationId}`);
      process.exit(1);
    }

    const skillDocPath =
      options.skillDoc ??
      process.env.SKILL_DOC ??
      `./skills/${results[0].systemVersion}.md`;

    if (!fs.existsSync(skillDocPath)) {
      console.error(`Error: Skill doc not found at ${skillDocPath}`);
      process.exit(1);
    }

    const skillDoc = fs.readFileSync(skillDocPath, 'utf-8');
    const promptsRun = new Set(results.map(r => r.id.split('-')[1])).size;
    const promptsTotal = loadTestSet('default').prompts.length;

    console.log(`\nAnalyzing iteration ${iterationId}...`);

    const client = new Anthropic();
    const analysis = await analyze(
      client,
      {results, skillDoc, promptsRun, promptsTotal},
      options.model,
    );

    // Save analysis
    const analysisPath = path.join(resultsDir, 'analysis.json');
    writeJson(analysisPath, analysis);

    // Print results
    console.log('\nPatterns detected:');
    for (const pattern of analysis.patterns) {
      console.log(`  - ${pattern}`);
    }

    console.log('\nSuggested refinements:');
    for (let i = 0; i < analysis.refinements.length; i++) {
      const ref = analysis.refinements[i];
      console.log(
        `  ${i + 1}. [${ref.target}] ${ref.suggestion} (confidence: ${ref.confidence.toFixed(1)}, effort: ${ref.effortEstimate})`,
      );
    }

    console.log(`\nSaved: ${analysisPath}`);
  });

/**
 * Report command
 */
program
  .command('report')
  .description('Generate HTML report for an iteration')
  .requiredOption('--iteration <id>', 'Iteration ID')
  .action(async options => {
    console.log('HTML report generation not yet implemented');
    console.log(`Would generate report for iteration ${options.iteration}`);
  });

/**
 * History command
 */
program
  .command('history')
  .description('View iteration history')
  .action(() => {
    const iterationsPath = path.join(
      import.meta.dirname,
      '..',
      'iterations.json',
    );

    if (!fs.existsSync(iterationsPath)) {
      console.log('No iterations found');
      return;
    }

    const iterations = readJson<{iterations: Iteration[]}>(iterationsPath);

    console.log('\nIteration History:\n');
    for (const iter of iterations.iterations) {
      console.log(`  ${iter.id}`);
      console.log(
        `    Success rate: ${(iter.aggregateMetrics.overallSuccessRate * 100).toFixed(1)}%`,
      );
      console.log(`    Refinements applied: ${iter.refinementsApplied.length}`);
      console.log(`    Parent: ${iter.parentIteration ?? 'none'}`);
      console.log();
    }
  });

// Helper functions
function calculateSuccessRate(results: TestResult[]): string {
  const successes = results.filter(r => r.evaluation.success).length;
  return ((successes / results.length) * 100).toFixed(0);
}

function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

program.parse();

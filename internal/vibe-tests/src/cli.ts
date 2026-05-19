#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI entry point for vibe-tests harness
 * @position internal/vibe-tests/src/cli.ts
 *
 * Code generation is handled by Navi sub-agents (no API key needed).
 * This CLI provides aggregation, reporting, and utility commands.
 */

import {Command} from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type {Iteration} from './types.js';
import {readJson} from './utils.js';

const program = new Command();

program
  .name('vibe-tests')
  .description('Vibeability test harness for LLM component system usage')
  .version('0.0.1');

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

program.parse();

#!/usr/bin/env tsx
/**
 * @file Quality Assessment CLI
 * @description Runs quality assessment agent on generated code results
 *
 * Usage:
 *   yarn workspace @xds/vibe-tests quality --iteration <id>
 *   yarn workspace @xds/vibe-tests quality --iteration <id> --prompt wd-1
 */

import fs from 'fs';
import path from 'path';
import {generateQualityAssessmentPrompt} from './quality-agent.js';

const RESULTS_DIR = path.join(import.meta.dirname, '..', 'results');

interface TaskManifest {
  iterationId: string;
  config: {
    target: 'xds' | 'baseline';
  };
  prompts: Array<{
    id: string;
    prompt: string;
    status: string;
  }>;
}

function loadManifest(iterationId: string): TaskManifest {
  const manifestPath = path.join(RESULTS_DIR, iterationId, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

function loadCode(iterationId: string, promptId: string): string | null {
  const codePath = path.join(
    RESULTS_DIR,
    iterationId,
    'results',
    `${promptId}.tsx`,
  );
  if (!fs.existsSync(codePath)) {
    return null;
  }
  return fs.readFileSync(codePath, 'utf-8');
}

function printUsage(): void {
  console.log(`
Quality Assessment CLI

Usage:
  yarn workspace @xds/vibe-tests quality --iteration <id> [--prompt <promptId>]

Options:
  --iteration, -i  Iteration ID to assess (required)
  --prompt, -p     Specific prompt ID to assess (optional, defaults to all)
  --help, -h       Show this help message

Examples:
  yarn workspace @xds/vibe-tests quality --iteration 2126954a
  yarn workspace @xds/vibe-tests quality -i 2126954a -p wd-1

Note: This generates prompts for quality assessment. Run the prompts with a subagent
to get the actual assessments.
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  // Parse arguments
  let iterationId: string | null = null;
  let promptId: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' || args[i] === '-i') {
      iterationId = args[++i];
    } else if (args[i] === '--prompt' || args[i] === '-p') {
      promptId = args[++i];
    }
  }

  if (!iterationId) {
    console.error('Error: --iteration is required');
    printUsage();
    process.exit(1);
  }

  // Load manifest
  const manifest = loadManifest(iterationId);
  const target = manifest.config.target;

  console.log(`\n🔍 Quality Assessment Setup - Iteration ${iterationId}`);
  console.log(`Target: ${target.toUpperCase()}`);
  console.log('');

  // Filter prompts if specific one requested
  const promptsToAssess = promptId
    ? manifest.prompts.filter(p => p.id === promptId)
    : manifest.prompts;

  if (promptsToAssess.length === 0) {
    console.error(`No prompts found${promptId ? ` matching ${promptId}` : ''}`);
    process.exit(1);
  }

  console.log(
    `Generating quality assessment prompts for ${promptsToAssess.length} result(s):\n`,
  );

  for (const prompt of promptsToAssess) {
    const code = loadCode(iterationId, prompt.id);
    if (!code) {
      console.log(`  [${prompt.id}] ⚠️  No code file found, skipping`);
      continue;
    }

    const assessmentPrompt = generateQualityAssessmentPrompt(
      code,
      target,
      prompt.prompt,
    );

    // Save the prompt for later execution
    const promptPath = path.join(
      RESULTS_DIR,
      iterationId,
      'results',
      `${prompt.id}.quality-prompt.md`,
    );
    fs.writeFileSync(promptPath, assessmentPrompt);

    console.log(`  [${prompt.id}] ✓ Generated prompt: ${promptPath}`);
  }

  console.log(`
Next steps:
1. Run quality assessment subagents on the generated prompts
2. Save results to {promptId}.quality.json files
3. Re-run aggregator to include quality scores

Example subagent prompt:
"Run quality assessment for iteration ${iterationId} by reading each .quality-prompt.md
file, evaluating the code, and saving results to .quality.json files"
`);
}

main().catch(console.error);

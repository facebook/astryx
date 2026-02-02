#!/usr/bin/env node
/**
 * @file Run complete interactive vibe test with subagents
 *
 * Usage:
 *   yarn workspace @xds/vibe-tests run-interactive
 *   yarn workspace @xds/vibe-tests run-interactive --sample 5
 */

import {execSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const args = process.argv.slice(2);

  // Step 1: Setup the test iteration
  console.log('🧪 Setting up interactive vibe test...\n');
  const setupOutput = execSync(
    `tsx ${path.join(__dirname, 'interactive.ts')} ${args.join(' ')}`,
    {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
    },
  );

  console.log(setupOutput);

  // Extract iteration ID from output
  const iterationMatch = setupOutput.match(/Iteration: ([a-f0-9]+)/);
  if (!iterationMatch) {
    console.error('Failed to extract iteration ID');
    process.exit(1);
  }

  const iterationId = iterationMatch[1];
  const resultsDir = path.join(__dirname, '..', 'results', iterationId);
  const tasksDir = path.join(resultsDir, 'tasks');

  // Step 2: Read all task files
  const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.json'));

  console.log(`\n🚀 Spawning ${taskFiles.length} parallel subagents...\n`);

  // Step 3: Generate the agent spawn instructions
  console.log('INSTRUCTIONS FOR CLAUDE CODE:');
  console.log('='.repeat(50));
  console.log(
    '\nPlease run the following to spawn all test agents in parallel:\n',
  );

  for (const taskFile of taskFiles) {
    const taskPath = path.join(tasksDir, taskFile);
    const task = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));

    console.log(`Task("Vibe test: ${task.promptId}", {
  "subagent_type": "general-purpose",
  "description": "Vibe test ${task.promptId}",
  "mode": "bypassPermissions",
  "prompt": "Run vibe test for iteration ${iterationId}, task ${task.promptId}.

TIMING: Record the current timestamp as startTime NOW before doing anything else.

Read task file at: ${taskPath}

XDS AGENTS.md is auto-injected and provides guidance on XDS components and which docs to read.

IMPORTANT: Track which docs you read. Keep a list of doc filenames (e.g., ['AGENTS.md', 'Button.md', 'tokens.md']).

Generate code for: \\"${task.prompt}\\"
Expected components: ${task.expectedComponents.join(', ')}
Persona: ${task.persona}

Self-evaluate your response and output JSON with:
- response: your code
- evaluation: { success, componentsUsed, componentsExpected, escapeHatches, failureMode, confusionSignals }

TIMING: Record the current timestamp as endTime and calculate durationMs = endTime - startTime.

Write the result as a TestResult JSON object to: ${resultsDir}/results/${task.promptId}.json

The TestResult format is:
{
  id: '${iterationId}-${task.promptId}',
  timestamp: new Date().toISOString(),
  systemVersion: 'xds-agents-v1',
  model: 'claude-code-interactive',
  persona: '${task.persona}',
  promptCategory: '${task.category}',
  trajectoryDepth: 0,
  prompt: '${task.prompt}',
  response: <your generated code>,
  evaluation: <your evaluation>,
  fullConversation: [],
  contextWindowUsage: 0,
  durationMs: <calculated duration in milliseconds>,
  inputTokens: 0,
  outputTokens: 0,
  docsRead: <list of doc filenames you read>
}"
});
`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\nAfter all agents complete, run:\n`);
  console.log(
    `  yarn workspace @xds/vibe-tests aggregate --iteration ${iterationId}\n`,
  );
}

main().catch(console.error);

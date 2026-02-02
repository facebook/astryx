#!/usr/bin/env node
/**
 * @file Interactive vibe test runner for Claude Code
 *
 * Runs vibe tests using Claude Code subagents instead of API calls.
 * Results are stored in the same format as the automated harness.
 *
 * Usage:
 *   yarn workspace @xds/vibe-tests interactive
 *   yarn workspace @xds/vibe-tests interactive --sample 5
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import type {TestPrompt, TestResult, Evaluation, EscapeHatch} from './types.js';
import {stratifiedSample} from './sampling.js';
import {
  generateIterationId,
  hashContent,
  ensureDir,
  appendJsonl,
  writeJson,
  readJson,
  timestamp,
  getResultsDir,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Install AGENTS.md and .xds-docs for agent documentation
 */
function installAgentsDocs(): void {
  const vibeTestsDir = path.join(__dirname, '..');
  const agentsMdPath = path.join(vibeTestsDir, 'AGENTS.md');
  const agentsScript = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'packages',
    'agent-tools',
    'bin',
    'agents-md.mjs',
  );

  // Check if AGENTS.md already exists and is recent (within last hour)
  if (fs.existsSync(agentsMdPath)) {
    const stats = fs.statSync(agentsMdPath);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < 60 * 60 * 1000) {
      // Less than 1 hour old, skip regeneration
      return;
    }
  }

  // Run the agents-md script
  if (fs.existsSync(agentsScript)) {
    try {
      execSync(`node ${agentsScript}`, {
        cwd: vibeTestsDir,
        stdio: 'pipe',
      });
      console.log('✓ Generated AGENTS.md and .xds-docs/');
    } catch (error) {
      console.warn('⚠ Failed to generate AGENTS.md, continuing without it');
    }
  }
}

interface InteractiveConfig {
  sample?: number;
  holdout?: boolean;
  persona: 'naive' | 'experienced' | 'adversarial';
  degradation?: boolean; // Enable degradation curve testing
}

interface AgentTask {
  promptId: string;
  category: string;
  prompt: string;
  expectedComponents: string[];
  persona: string;
  degradation?: boolean; // Run multi-turn degradation test
}

/**
 * Generate the agent prompt for a single test
 */
function generateAgentPrompt(task: AgentTask): string {
  const personaInstructions = {
    naive: `You are testing as a NAIVE user who describes UIs in plain language without technical terms.
You don't know component names. Describe what you want visually.`,
    experienced: `You are testing as an EXPERIENCED user who knows the component system.
Use correct component names and reference the docs.`,
    adversarial: `You are testing as an ADVERSARIAL user who mixes in patterns from other frameworks.
Reference Tailwind, shadcn, Bootstrap patterns in your request.`,
  };

  // Always use AGENTS.md - Claude Code auto-injects it from cwd
  const skillDocSection = `## Component Documentation

XDS documentation is auto-loaded via AGENTS.md.

Before generating code, read \`.xds-docs/tokens.md\` for valid CSS variable names.
Valid patterns: \`--color-*\`, \`--spacing-*\`, \`--radius-*\`, \`--elevation-*\`, \`--text-*\`, \`--font-body\`, \`--font-code\`, \`--font-heading\``;

  return `# Vibe Test Task

You are running a vibeability test for the XDS component library.

## Your Role
${personaInstructions[task.persona as keyof typeof personaInstructions]}

${skillDocSection}

## Test Prompt
Category: ${task.category}
Prompt: "${task.prompt}"
Expected Components: ${task.expectedComponents.join(', ')}

## Instructions

1. **Generate a response** to the prompt as if you were an AI assistant helping a developer.
   Write working React/TSX code using XDS components.

2. **Self-evaluate** your response against these criteria:
   - Did you use the expected components (or reasonable alternatives)?
   - Did you hallucinate any props that don't exist?
   - Did you use redundant CSS for things components already handle?
   - Did you use acceptable supplemental CSS for gaps?
   - **CSS Variables**: Did you use valid XDS tokens? Check .xds-docs/tokens.md for the complete list of valid variable names.

3. **Output JSON** in this exact format:
\`\`\`json
{
  "response": "Your full code response here...",
  "evaluation": {
    "success": true/false,
    "componentsUsed": ["XDSCard", "XDSButton", ...],
    "componentsExpected": ${JSON.stringify(task.expectedComponents)},
    "escapeHatches": [
      {
        "type": "supplemental_css|wrapper_div|inline_style|hallucination|wrong_component|redundant_css",
        "severity": "critical|acceptable",
        "detail": "Description",
        "codeSnippet": "relevant code"
      }
    ],
    "failureMode": null or "description of why it failed",
    "confusionSignals": ["any hedging language or uncertainty"]
  }
}
\`\`\`

Remember:
- Critical escape hatches (hallucination, wrong_component, redundant_css) = failure
- Acceptable escape hatches (supplemental_css, wrapper_div, inline_style) = still success
- Only output the JSON block, nothing else
`;
}

/**
 * Parse agent output to extract evaluation
 */
function parseAgentOutput(
  output: string,
): {response: string; evaluation: Evaluation} | null {
  try {
    // Try to find JSON in the output
    const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    // Try parsing the whole thing as JSON
    return JSON.parse(output);
  } catch {
    console.error('Failed to parse agent output');
    return null;
  }
}

/**
 * Create the task manifest for parallel execution
 */
function createTaskManifest(
  prompts: TestPrompt[],
  config: InteractiveConfig,
  iterationId: string,
): void {
  const resultsDir = path.join(getResultsDir(), iterationId);
  ensureDir(resultsDir);

  const manifest = {
    iterationId,
    createdAt: timestamp(),
    config,
    prompts: prompts.map(p => ({
      id: p.id,
      category: p.category,
      prompt: p.prompt,
      expectedComponents: p.expectedComponents,
      status: 'pending',
    })),
    totalPrompts: prompts.length,
    completedPrompts: 0,
  };

  writeJson(path.join(resultsDir, 'manifest.json'), manifest);

  // Also write individual task files for agents to pick up
  const tasksDir = path.join(resultsDir, 'tasks');
  ensureDir(tasksDir);

  for (const prompt of prompts) {
    const task: AgentTask = {
      promptId: prompt.id,
      category: prompt.category,
      prompt: prompt.prompt,
      expectedComponents: prompt.expectedComponents,
      persona: config.persona,
      degradation: config.degradation,
    };
    writeJson(path.join(tasksDir, `${prompt.id}.json`), task);
  }

  console.log(
    `\nCreated task manifest: ${path.join(resultsDir, 'manifest.json')}`,
  );
  console.log(`Individual tasks: ${tasksDir}/`);
}

/**
 * Generate instructions for running tests with subagents
 */
function generateSubagentInstructions(
  iterationId: string,
  prompts: TestPrompt[],
  config: InteractiveConfig,
): string {
  const resultsDir = path.join(getResultsDir(), iterationId);

  const degradationInstructions = config.degradation
    ? `

### Degradation Protocol (10-turn curve)
Each test runs through multiple conversation turns:
- Turn 0: Initial probe (generate code)
- Turns 1-5: Filler prompts (unrelated questions)
- Turn 6: Re-probe with "Actually, let me revisit this..."
- Turn 7: Distractor (different framework question)
- Turn 8: Re-probe with "I want to redo that earlier request..."
- Turn 9: Recovery (re-inject partial context)
- Turn 10: Final re-probe with "Let me try that again..."

Record results at turns 0, 6, 8, and 10 with trajectoryDepth field set accordingly.
`
    : '';

  return `
# Interactive Vibe Test - Iteration ${iterationId}

## Running Tests with Subagents

To run these ${prompts.length} tests in parallel, use the Task tool to spawn subagents.

**Recommended**: Run with \`mode: "bypassPermissions"\` to avoid approval prompts for writing results.
${degradationInstructions}
### Option 1: Run all in parallel (recommended for small batches)
Spawn ${prompts.length} subagents, one for each test prompt.

### Option 2: Run in batches
Spawn subagents in groups of 3-5 for larger test sets.

### Subagent Prompt Template
For each test, the subagent should:
1. Read the task file: ${resultsDir}/tasks/{prompt-id}.json
2. Read XDS docs from .xds-docs/ (AGENTS.md auto-injected)
3. Generate a response to the prompt${config.degradation ? ' (with multi-turn conversation)' : ''}
4. Self-evaluate the response
5. Write result to individual file: ${resultsDir}/results/{promptId}.json
   (Use individual files to avoid parallel write conflicts)

### After All Tests Complete
Run: yarn workspace @xds/vibe-tests aggregate --iteration ${iterationId}

This will:
- Read all results from results/ directory
- Calculate success rates by category
- Generate the summary report${config.degradation ? '\n- Show degradation curve with line graph' : ''}
`;
}

async function main() {
  const args = process.argv.slice(2);

  // Parse args
  const sampleIndex = args.indexOf('--sample');
  const sample =
    sampleIndex !== -1 ? parseInt(args[sampleIndex + 1]) : undefined;
  const holdout = args.includes('--holdout');
  const personaIndex = args.indexOf('--persona');
  const persona =
    personaIndex !== -1
      ? (args[personaIndex + 1] as 'naive' | 'experienced' | 'adversarial')
      : 'naive';
  const degradation = args.includes('--degradation');

  const config: InteractiveConfig = {sample, holdout, persona, degradation};

  // Always install AGENTS.md for retrieval-led approach
  installAgentsDocs();

  // Load test set
  const testSetPath = path.join(__dirname, '..', 'test-sets', 'default.json');
  const testSet = readJson<{prompts: TestPrompt[]; holdout?: TestPrompt[]}>(
    testSetPath,
  );

  // Select prompts
  let prompts: TestPrompt[];
  if (holdout && testSet.holdout) {
    prompts = testSet.holdout;
  } else if (sample && sample < testSet.prompts.length) {
    prompts = stratifiedSample(testSet.prompts, sample);
  } else {
    prompts = testSet.prompts;
  }

  // Generate iteration ID
  const iterationId = generateIterationId();

  console.log(`\n🧪 Interactive Vibe Test Setup`);
  console.log(`================================`);
  console.log(`Iteration: ${iterationId}`);
  console.log(`Persona: ${persona}`);
  console.log(`Mode: AGENTS.md (retrieval-led)`);
  console.log(
    `Protocol: ${degradation ? 'Degradation (10-turn curve)' : 'One-shot'}`,
  );
  console.log(
    `Prompts: ${prompts.length}${sample ? ` (sampled from ${testSet.prompts.length})` : ''}`,
  );

  // Create task manifest
  createTaskManifest(prompts, config, iterationId);

  // Output instructions
  console.log(generateSubagentInstructions(iterationId, prompts, config));

  // Output the prompts for easy reference
  console.log(`\n## Test Prompts\n`);
  for (const p of prompts) {
    console.log(`- [${p.id}] (${p.category}) ${p.prompt}`);
  }

  console.log(`\n## Quick Start\n`);
  console.log(`To run all tests now, ask Claude Code to:`);
  console.log(
    `"Run vibe tests for iteration ${iterationId} using parallel subagents"`,
  );
}

main().catch(console.error);

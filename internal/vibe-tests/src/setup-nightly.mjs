#!/usr/bin/env node
/**
 * @file setup-nightly.mjs
 * 
 * Sets up a complete nightly vibe test run: 3 iterations (xds, baseline, html)
 * using the same prompts. XDS tasks include CLI-retrieval instructions.
 *
 * Usage:
 *   node internal/vibe-tests/src/setup-nightly.mjs
 *   node internal/vibe-tests/src/setup-nightly.mjs --sample 5
 *
 * Output: prints JSON with all three iteration IDs and prompt IDs
 * for the nightly runner to use when spawning sub-agents.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_DIR = path.resolve(__dirname, '..');
const RESULTS_DIR = path.join(VIBE_DIR, 'results');

// ── Helpers ──────────────────────────────────────────────────────────

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

function timestamp() {
  return new Date().toISOString();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, {recursive: true});
}

function loadTestSet() {
  const testSetDir = path.join(VIBE_DIR, 'test-sets');
  const files = fs.readdirSync(testSetDir).filter(f => f.endsWith('.json'));
  const prompts = [];
  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(testSetDir, file), 'utf-8'),
    );
    if (Array.isArray(data)) {
      prompts.push(...data);
    } else if (data.prompts) {
      prompts.push(...data.prompts);
    }
  }
  return prompts;
}

function samplePrompts(prompts, n) {
  if (!n || n >= prompts.length) return prompts;
  const byCategory = {};
  for (const p of prompts) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }
  const categories = Object.keys(byCategory);
  const perCategory = Math.max(1, Math.floor(n / categories.length));
  const sampled = [];
  for (const cat of categories) {
    const shuffled = byCategory[cat].sort(() => Math.random() - 0.5);
    sampled.push(...shuffled.slice(0, perCategory));
  }
  while (sampled.length < n) {
    const remaining = prompts.filter(p => !sampled.includes(p));
    if (remaining.length === 0) break;
    sampled.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }
  return sampled.slice(0, n);
}

// ── Task prompt templates ────────────────────────────────────────────

function generateXdsTaskPrompt(prompt, iterDir) {
  const componentNames = (prompt.expectedComponents || []).map(c =>
    c.replace(/^XDS/, ''),
  );

  const cliCommands = componentNames
    .map(c => `npx xds component ${c}`)
    .join('\n');

  return `You are generating React/TSX code using the XDS design system.

## IMPORTANT: Read component docs FIRST

You MUST run the following commands on the MacBook CLI node (node: "cli:MacBook-Pro-2") 
to read the component API docs BEFORE writing any code:

cd ~/xds/worktrees/main
${cliCommands}

Read the output carefully. Use ONLY the props documented in the CLI output.
Do NOT guess prop names or values. If you need additional components beyond
the ones listed above, look them up too: npx xds component <Name>

## Rules

1. Import from '@xds/core' (e.g. import { XDSButton } from '@xds/core')
2. Use StyleX for custom styling (import * as stylex from '@stylexjs/stylex')
3. Use CSS variables for tokens: var(--color-*), var(--spacing-*), var(--radius-*)
4. Form inputs are controlled: value + onChange
5. No <div> for layout — use XDSVStack, XDSHStack, XDSGrid
6. Export default a single React component

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(iterDir, 'results', `${prompt.id}.tsx`)}
Write metadata to: ${path.join(iterDir, 'results', `${prompt.id}.json`)}

The metadata JSON should contain:
{
  "completedAt": "<current ISO timestamp>",
  "docsRead": [<list of component names you looked up via CLI>]
}

Write ONLY valid TSX in the .tsx file. No markdown fences, no explanation.`;
}

function generateBaselineTaskPrompt(prompt, iterDir) {
  return `You are generating React/TSX code using shadcn/ui components with Tailwind CSS.

Read the baseline docs at ${VIBE_DIR}/.baseline-docs/ 
and ${VIBE_DIR}/AGENTS.baseline.md for component guidance.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(iterDir, 'results', `${prompt.id}.tsx`)}
Write metadata to: ${path.join(iterDir, 'results', `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<docs you read>]}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

function generateHtmlTaskPrompt(prompt, iterDir) {
  return `You are generating React/TSX code using ONLY plain HTML elements and inline CSS.
Do NOT use any component library. Use standard HTML elements (div, button, input, etc.)
with inline styles or a styles object.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(iterDir, 'results', `${prompt.id}.tsx`)}
Write metadata to: ${path.join(iterDir, 'results', `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": []}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

function createIteration(target, prompts, generateFn) {
  const iterationId = generateId();
  const iterDir = path.join(RESULTS_DIR, iterationId);
  ensureDir(iterDir);
  ensureDir(path.join(iterDir, 'results'));
  ensureDir(path.join(iterDir, 'tasks'));

  const manifest = {
    iterationId,
    createdAt: timestamp(),
    config: {
      target,
      persona: 'naive',
      holdout: false,
      degradation: false,
      cliRetrieval: target === 'xds',
    },
    prompts: prompts.map(p => ({
      id: p.id,
      category: p.category,
      prompt: p.prompt,
      expectedComponents: p.expectedComponents,
      status: 'pending',
    })),
  };

  fs.writeFileSync(
    path.join(iterDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  for (const prompt of prompts) {
    const taskPrompt = generateFn(prompt, iterDir);
    const task = {
      promptId: prompt.id,
      category: prompt.category,
      prompt: prompt.prompt,
      expectedComponents: prompt.expectedComponents,
      target,
      persona: 'naive',
      taskPrompt,
      createdAt: timestamp(),
    };
    fs.writeFileSync(
      path.join(iterDir, 'tasks', `${prompt.id}.json`),
      JSON.stringify(task, null, 2),
    );
  }

  return {iterationId, iterDir};
}

// ── Main ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const sampleIdx = args.indexOf('--sample');
const sample = sampleIdx !== -1 ? parseInt(args[sampleIdx + 1]) : 10;

console.log(`\n🧪 Nightly Vibe Test Setup`);
console.log(`   Sample: ${sample} prompts × 3 targets = ${sample * 3} total tasks\n`);

// 1. Sample prompts once — reuse across all targets
const allPrompts = loadTestSet();
const prompts = samplePrompts(allPrompts, sample);
const promptIds = prompts.map(p => p.id);
console.log(`📋 Selected ${prompts.length} prompts from ${allPrompts.length} total`);
console.log(`   IDs: ${promptIds.join(', ')}\n`);

// 2. Create iterations for all three targets
const xds = createIteration('xds', prompts, generateXdsTaskPrompt);
const baseline = createIteration('baseline', prompts, generateBaselineTaskPrompt);
const html = createIteration('html', prompts, generateHtmlTaskPrompt);

console.log(`✅ All iterations ready:\n`);
console.log(`   XDS:      ${xds.iterationId}  (${xds.iterDir})`);
console.log(`   Baseline: ${baseline.iterationId}  (${baseline.iterDir})`);
console.log(`   HTML:     ${html.iterationId}  (${html.iterDir})\n`);

// 3. Output structured data for the nightly runner
const nightlyConfig = {
  createdAt: timestamp(),
  sample,
  promptIds,
  iterations: {
    xds: xds.iterationId,
    baseline: baseline.iterationId,
    html: html.iterationId,
  },
  dirs: {
    xds: xds.iterDir,
    baseline: baseline.iterDir,
    html: html.iterDir,
  },
};

// Write config for the runner to pick up
const configPath = path.join(RESULTS_DIR, 'nightly-config.json');
fs.writeFileSync(configPath, JSON.stringify(nightlyConfig, null, 2));
console.log(`📄 Config written: ${configPath}\n`);

// Print spawn instructions
console.log(`## XDS agents (CLI retrieval on MacBook):\n`);
for (const p of prompts) {
  console.log(`  ${xds.iterDir}/tasks/${p.id}.json`);
}
console.log(`\n## Baseline agents (read .baseline-docs/):\n`);
for (const p of prompts) {
  console.log(`  ${baseline.iterDir}/tasks/${p.id}.json`);
}
console.log(`\n## HTML agents (no docs):\n`);
for (const p of prompts) {
  console.log(`  ${html.iterDir}/tasks/${p.id}.json`);
}

console.log(`\n## After all agents complete:\n`);
console.log(`  # tsc type-checking`);
console.log(`  npx tsx src/build-previews.ts --iterations "${xds.iterationId},${baseline.iterationId},${html.iterationId}" --tsc-only`);
console.log(`\n  # Evaluation`);
console.log(`  npx tsx src/universal-aggregate.ts --iteration ${xds.iterationId}`);
console.log(`  npx tsx src/universal-aggregate.ts --iteration ${baseline.iterationId}`);
console.log(`  npx tsx src/universal-aggregate.ts --iteration ${html.iterationId}`);
console.log(`  npx tsx src/universal-compare.ts --xds ${xds.iterationId} --baseline ${baseline.iterationId} --html ${html.iterationId}`);
console.log(`\n  # Deploy report`);
console.log(`  npx tsx src/deploy-report.ts --iteration ${xds.iterationId} --baseline ${baseline.iterationId} --html ${html.iterationId}`);

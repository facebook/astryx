#!/usr/bin/env node
/**
 * @file setup-nightly.mjs
 * 
 * Sets up a complete nightly vibe test run: 4 iterations
 * (xds, xds-tailwind, baseline, html) using the same prompts.
 * XDS and XDS+Tailwind tasks include CLI-retrieval instructions.
 *
 * Usage:
 *   node internal/vibe-tests/src/setup-nightly.mjs
 *   node internal/vibe-tests/src/setup-nightly.mjs --sample 5
 *
 * Output: prints JSON with all four iteration IDs and prompt IDs
 * for the nightly runner to use when spawning sub-agents.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_DIR = path.resolve(__dirname, '..');
const RESULTS_DIR = path.join(VIBE_DIR, 'results');

import {createAgentProject} from './setup-environment.mjs';

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

function generateXdsTaskPrompt(prompt, projectDir) {
  return `You are generating React/TSX code using the XDS design system.
Your project is at ${projectDir}. Explore it to find available components.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(projectDir, `${prompt.id}.tsx`)}
Write metadata to: ${path.join(projectDir, `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<component names you looked up>]}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

function generateXdsTailwindTaskPrompt(prompt, projectDir) {
  return `You are generating React/TSX code using the XDS design system with Tailwind CSS.
Your project is at ${projectDir}. Explore it to find available components.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(projectDir, `${prompt.id}.tsx`)}
Write metadata to: ${path.join(projectDir, `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<component names you looked up>]}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

function generateBaselineTaskPrompt(prompt, projectDir) {
  return `You are generating React/TSX code using shadcn/ui components with Tailwind CSS.
Your project is at ${projectDir}. Explore it to find available components.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(projectDir, `${prompt.id}.tsx`)}
Write metadata to: ${path.join(projectDir, `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<docs you read>]}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

function generateHtmlTaskPrompt(prompt, projectDir) {
  return `You are generating React/TSX code using ONLY plain HTML elements and inline CSS.
Your project is at ${projectDir}. Do NOT use any component library.
Use standard HTML elements (div, button, input, etc.) with inline styles or a styles object.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(projectDir, `${prompt.id}.tsx`)}
Write metadata to: ${path.join(projectDir, `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": []}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

const TARGET_CONFIG = {
  xds: {label: 'XDS', generateFn: generateXdsTaskPrompt, cliRetrieval: true},
  'xds-tailwind': {label: 'XDS+TW', generateFn: generateXdsTailwindTaskPrompt, cliRetrieval: true},
  baseline: {label: 'Baseline', generateFn: generateBaselineTaskPrompt, cliRetrieval: false},
  html: {label: 'HTML', generateFn: generateHtmlTaskPrompt, cliRetrieval: false},
};

function createIteration(target, prompts) {
  const config = TARGET_CONFIG[target];
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
      cliRetrieval: config.cliRetrieval,
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
    const agentProject = createAgentProject(target, iterDir, prompt.id);
    const taskPrompt = config.generateFn(prompt, agentProject);
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

const TARGETS = ['xds', 'xds-tailwind', 'baseline', 'html'];
const args = process.argv.slice(2);
const sampleIdx = args.indexOf('--sample');
const sample = sampleIdx !== -1 ? parseInt(args[sampleIdx + 1]) : 10;

console.log(`\n🧪 Nightly Vibe Test Setup`);
console.log(`   Sample: ${sample} prompts × ${TARGETS.length} targets = ${sample * TARGETS.length} total tasks\n`);

// 1. Sample prompts once — reuse across all targets
const allPrompts = loadTestSet();
const prompts = samplePrompts(allPrompts, sample);
const promptIds = prompts.map(p => p.id);
console.log(`📋 Selected ${prompts.length} prompts from ${allPrompts.length} total`);
console.log(`   IDs: ${promptIds.join(', ')}\n`);

// 2. Create iterations for all targets
const iterations = {};
const dirs = {};
for (const target of TARGETS) {
  const result = createIteration(target, prompts);
  iterations[target] = result.iterationId;
  dirs[target] = result.iterDir;
}

console.log(`✅ All iterations ready:\n`);
for (const target of TARGETS) {
  const label = TARGET_CONFIG[target].label.padEnd(10);
  console.log(`   ${label} ${iterations[target]}  (${dirs[target]})`);
}
console.log();

// 3. Output structured data for the nightly runner
const nightlyConfig = {
  createdAt: timestamp(),
  sample,
  promptIds,
  iterations,
  dirs,
};

const configPath = path.join(RESULTS_DIR, 'nightly-config.json');
fs.writeFileSync(configPath, JSON.stringify(nightlyConfig, null, 2));
console.log(`📄 Config written: ${configPath}\n`);

// Print spawn instructions per target
for (const target of TARGETS) {
  const config = TARGET_CONFIG[target];
  const hint = config.cliRetrieval ? '(CLI retrieval on MacBook)' :
    target === 'baseline' ? '(read .baseline-docs/)' : '(no docs)';
  console.log(`## ${config.label} agents ${hint}:\n`);
  for (const p of prompts) {
    console.log(`  ${dirs[target]}/tasks/${p.id}.json`);
  }
  console.log();
}

// Post-run commands
const allIds = TARGETS.map(t => iterations[t]);
console.log(`## After all agents complete:\n`);
console.log(`  # Collect results from agent project dirs`);
for (const id of allIds) {
  console.log(`  node src/collect-results.mjs ${id}`);
}
console.log(``);
console.log(`  # tsc type-checking`);
console.log(`  npx tsx src/build-previews.ts --iterations "${allIds.join(',')}" --tsc-only`);
console.log(`\n  # Evaluation`);
for (const id of allIds) {
  console.log(`  npx tsx src/universal-aggregate.ts --iteration ${id}`);
}
console.log(`\n  # Compare (3-way: xds vs baseline vs html)`);
console.log(`  npx tsx src/universal-compare.ts --xds ${iterations.xds} --baseline ${iterations.baseline} --html ${iterations.html}`);
console.log(`\n  # Compare (xds vs xds-tailwind)`);
console.log(`  npx tsx src/universal-compare.ts --xds ${iterations.xds} --baseline ${iterations['xds-tailwind']}`);
console.log(`\n  # Deploy report (xds vs baseline)`);
console.log(`  npx tsx src/deploy-report.ts --iteration ${iterations.xds} --baseline ${iterations.baseline}`);

#!/usr/bin/env node
/**
 * @file setup-iteration.mjs
 * 
 * Sets up a vibe test iteration where XDS sub-agents use the CLI for doc retrieval.
 * Generates task manifests with instructions to run `npx xds component <Name>`
 * on the MacBook CLI node before generating code.
 *
 * Usage:
 *   node internal/vibe-tests/src/setup-iteration.mjs --sample 10 --target xds
 *   node internal/vibe-tests/src/setup-iteration.mjs --sample 10 --target xds-tailwind
 *   node internal/vibe-tests/src/setup-iteration.mjs --sample 10 --target baseline
 *   node internal/vibe-tests/src/setup-iteration.mjs --sample 10 --target html
 *   node internal/vibe-tests/src/setup-iteration.mjs --sample 10 --target xds --prompts cwm-1,dd-2,fwc-6
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

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
  fs.mkdirSync(dir, { recursive: true });
}

function loadTestSet() {
  const testSetDir = path.join(VIBE_DIR, 'test-sets');
  const files = fs.readdirSync(testSetDir).filter(f => f.endsWith('.json'));
  const prompts = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(testSetDir, file), 'utf-8'));
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
  return `You are generating React/TSX code using the XDS design system.

Read the package README at ${path.resolve(VIBE_DIR, '../../packages/core/README.md')} for how to look up
component docs. Use what you find there to discover the components you need.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(iterDir, 'results', `${prompt.id}.tsx`)}
Write metadata to: ${path.join(iterDir, 'results', `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<component names you looked up>]}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

function generateBaselineTaskPrompt(prompt, iterDir) {
  return `You are generating React/TSX code using shadcn/ui components with Tailwind CSS.

Read the README at ${path.join(VIBE_DIR, '.baseline', 'README.md')} for component guidance.
The actual component sources are in ${path.join(VIBE_DIR, '.baseline', 'components', 'ui')}/.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(iterDir, 'results', `${prompt.id}.tsx`)}
Write metadata to: ${path.join(iterDir, 'results', `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<docs you read>]}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

function generateXdsTailwindTaskPrompt(prompt, iterDir) {
  return `You are generating React/TSX code using the XDS design system with Tailwind CSS.

Read the package README at ${path.resolve(VIBE_DIR, '../../packages/core/README.md')} for how to look up
component docs. Use what you find there to discover the components you need.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(iterDir, 'results', `${prompt.id}.tsx`)}
Write metadata to: ${path.join(iterDir, 'results', `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<component names you looked up>]}
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

// ── Main ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const sampleIdx = args.indexOf('--sample');
const sample = sampleIdx !== -1 ? parseInt(args[sampleIdx + 1]) : 10;
const targetIdx = args.indexOf('--target');
const target = targetIdx !== -1 ? args[targetIdx + 1] : 'xds';
const promptsIdx = args.indexOf('--prompts');
const promptFilter = promptsIdx !== -1 ? args[promptsIdx + 1].split(',') : null;

console.log(`\n🧪 Setup Vibe Test Iteration`);
console.log(`   Target: ${target}, Sample: ${sample}`);
if (target === 'xds') console.log(`   Mode: CLI-retrieval (MacBook)\n`);
else if (target === 'xds-tailwind') console.log(`   Mode: CLI-retrieval + Tailwind (MacBook)\n`);
else console.log(`   Mode: ${target === 'baseline' ? 'baseline-docs' : 'no docs'}\n`);

// 1. Load and filter/sample prompts
const allPrompts = loadTestSet();
let prompts;
if (promptFilter) {
  prompts = allPrompts.filter(p => promptFilter.includes(p.id));
  console.log(`📋 Using ${prompts.length} specified prompts`);
} else {
  prompts = samplePrompts(allPrompts, sample);
  console.log(`📋 Sampled ${prompts.length} prompts from ${allPrompts.length} total`);
}

// 2. Create iteration
const iterationId = generateId();
const iterDir = path.join(RESULTS_DIR, iterationId);
ensureDir(iterDir);
ensureDir(path.join(iterDir, 'results'));
ensureDir(path.join(iterDir, 'tasks'));

// 3. Generate manifest + task files
const manifest = {
  iterationId,
  createdAt: timestamp(),
  config: {
    target,
    persona: 'naive',
    holdout: false,
    degradation: false,
    cliRetrieval: target === 'xds' || target === 'xds-tailwind',
  },
  prompts: prompts.map(p => ({
    id: p.id,
    category: p.category,
    prompt: p.prompt,
    expectedComponents: p.expectedComponents,
    status: 'pending',
  })),
};

fs.writeFileSync(path.join(iterDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

const generateTaskPrompt = target === 'xds' ? generateXdsTaskPrompt
  : target === 'xds-tailwind' ? generateXdsTailwindTaskPrompt
  : target === 'baseline' ? generateBaselineTaskPrompt
  : generateHtmlTaskPrompt;

for (const prompt of prompts) {
  const taskPrompt = generateTaskPrompt(prompt, iterDir);

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
    JSON.stringify(task, null, 2)
  );
}

// 4. Output
console.log(`\n✅ Iteration ${iterationId} ready`);
console.log(`   Dir: ${iterDir}`);
console.log(`   ${prompts.length} tasks created`);
console.log(`   Prompt IDs: ${prompts.map(p => p.id).join(',')}\n`);

if (target === 'xds' || target === 'xds-tailwind') {
  console.log(`## Sub-agent spawn pattern (${target} with CLI retrieval):\n`);
  console.log(`Each agent needs: node "cli:MacBook-Pro-2" for CLI, workspace for file I/O\n`);
} else if (target === 'baseline') {
  console.log(`## Sub-agent spawn pattern (baseline):\n`);
  console.log(`Agents read .baseline-docs/ and AGENTS.baseline.md\n`);
} else {
  console.log(`## Sub-agent spawn pattern (HTML):\n`);
  console.log(`Agents use plain HTML/CSS — no design system docs\n`);
}

for (const prompt of prompts) {
  console.log(`  Task: ${iterDir}/tasks/${prompt.id}.json`);
}

#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-forms.mjs
 *
 * Sets up the FORM-FRAMEWORK vibe test: 4 iterations
 * (formentor, formisch, tanstack, rhf) using the SAME prompts on the SAME
 * design system (Astryx). Only the form framework varies. Answers: which form
 * framework is the best default for Astryx?
 *
 * Fairness invariants enforced here (see README "Checker Protocol"):
 *   #2 Only the framework varies — identical prompts, personas, output format,
 *      and an analogous "read the adapter README + use the astryx CLI" instruction
 *      for every target. No framework-specific coaching.
 *   #3 Never leak the answer — expectedBehaviors is written to the manifest for
 *      evaluation only; it is NEVER included in the task prompt.
 *   #6 Blank-slate testers — one fresh agent per (prompt × target), spawned with
 *      zero prior context. The task prompt is fully self-contained; it must be run
 *      by a context-free sub-agent (the runner spawns fresh agents, never reuses).
 *
 * Tiers: CORE prompts are the headline comparison (all frameworks fully support).
 * STRETCH prompts run too but are reported separately. Use --core-only for the
 * headline baseline run.
 *
 * Usage:
 *   node internal/vibe-tests/src/setup-forms.mjs
 *   node internal/vibe-tests/src/setup-forms.mjs --sample 4 --core-only
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

import {createFormAgentProject} from './setup-forms-environment.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_DIR = path.resolve(__dirname, '..');
const RESULTS_DIR = path.join(VIBE_DIR, 'results');

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}
function timestamp() {
  return new Date().toISOString();
}
function ensureDir(dir) {
  fs.mkdirSync(dir, {recursive: true});
}

function loadForms() {
  const file = path.join(VIBE_DIR, 'test-sets', 'forms.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return data.prompts ?? [];
}

function samplePrompts(prompts, n) {
  if (!n || n >= prompts.length) return prompts;
  const byCategory = {};
  for (const p of prompts) {
    (byCategory[p.category] ??= []).push(p);
  }
  const categories = Object.keys(byCategory);
  const perCategory = Math.max(1, Math.floor(n / categories.length));
  const sampled = [];
  for (const cat of categories) {
    const shuffled = byCategory[cat].slice().sort(() => Math.random() - 0.5);
    sampled.push(...shuffled.slice(0, perCategory));
  }
  while (sampled.length < n) {
    const remaining = prompts.filter(p => !sampled.includes(p));
    if (remaining.length === 0) break;
    sampled.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }
  return sampled.slice(0, n);
}

// ── Task prompt template ─────────────────────────────────────────────
// A SINGLE template shared by all four targets. The only substitution is the
// framework's display name + the README path the agent should read. This keeps
// the instruction analogous across targets (invariant #2). No framework-specific
// coaching, no expected behaviors, no pre-built component list (invariant #3).

const READMES = {
  formentor: 'node_modules/@astryxdesign/formentor/README.md',
  formisch: 'node_modules/@astryxdesign/astryx-formisch/README.md',
  tanstack: 'node_modules/@astryxdesign/astryx-tanstack/README.md',
  rhf: 'node_modules/@astryxdesign/astryx-rhf/README.md',
};

const LABELS = {
  formentor: 'Formentor',
  formisch: 'Formisch',
  tanstack: 'TanStack Form',
  rhf: 'React Hook Form',
};

function generateTaskPrompt(target, prompt, projectDir) {
  return `You are building a form in a React/TSX project that uses the Astryx design system with ${LABELS[target]}.
Your project is at ${projectDir}. Explore it before writing code.

Start by reading the project README, then the form library's README:
  ${path.join(projectDir, 'README.md')}
  ${path.join(projectDir, READMES[target])}
Use the astryx CLI to look up any component props you need.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(projectDir, `${prompt.id}.tsx`)}
Write metadata to: ${path.join(projectDir, `${prompt.id}.json`)}

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<files/components you looked up>]}
Write ONLY valid TSX. No markdown fences, no explanation.`;
}

const TARGETS = ['formentor', 'formisch', 'tanstack', 'rhf'];

function createIteration(target, prompts) {
  const iterationId = generateId();
  const iterDir = path.join(RESULTS_DIR, iterationId);
  ensureDir(iterDir);
  ensureDir(path.join(iterDir, 'tasks'));
  ensureDir(path.join(iterDir, 'results'));

  const manifest = {
    iterationId,
    createdAt: timestamp(),
    config: {
      target,
      testKind: 'form-framework',
      persona: 'naive',
      blankSlateTesters: true, // invariant #6
    },
    prompts: prompts.map(p => ({
      id: p.id,
      category: p.category,
      tier: p.tier,
      prompt: p.prompt,
      expectedBehaviors: p.expectedBehaviors, // EVAL-ONLY (invariant #3)
      status: 'pending',
    })),
  };
  fs.writeFileSync(
    path.join(iterDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  for (const prompt of prompts) {
    const projectDir = createFormAgentProject(target, iterDir, prompt.id);
    const taskPrompt = generateTaskPrompt(target, prompt, projectDir);
    const task = {
      promptId: prompt.id,
      category: prompt.category,
      tier: prompt.tier,
      prompt: prompt.prompt,
      // expectedBehaviors intentionally NOT written into the task file the agent reads.
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
const sample = sampleIdx !== -1 ? parseInt(args[sampleIdx + 1], 10) : 0;
const coreOnly = args.includes('--core-only');

let allPrompts = loadForms();
if (coreOnly) {
  allPrompts = allPrompts.filter(p => p.tier === 'core');
}
const prompts = sample ? samplePrompts(allPrompts, sample) : allPrompts;
const promptIds = prompts.map(p => p.id);

console.log(`\n🧪 Form-Framework Vibe Test Setup`);
console.log(`   Design system: Astryx (constant)`);
console.log(`   Targets: ${TARGETS.join(', ')}`);
console.log(`   Tier filter: ${coreOnly ? 'CORE only (headline)' : 'CORE + STRETCH'}`);
console.log(`   ${prompts.length} prompts × ${TARGETS.length} targets = ${prompts.length * TARGETS.length} tasks`);
console.log(`   IDs: ${promptIds.join(', ')}\n`);

const iterations = {};
const dirs = {};
for (const target of TARGETS) {
  const {iterationId, iterDir} = createIteration(target, prompts);
  iterations[target] = iterationId;
  dirs[target] = iterDir;
  console.log(`   ${target.padEnd(10)} ${iterationId}  (${iterDir})`);
}

const config = {
  createdAt: timestamp(),
  testKind: 'form-framework',
  sample: sample || null,
  coreOnly,
  promptIds,
  iterations,
  dirs,
};
const configPath = path.join(RESULTS_DIR, 'forms-config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`\n📄 Config: ${configPath}`);

console.log(`\n## Spawn one BLANK-SLATE agent per task (invariant #6):\n`);
for (const target of TARGETS) {
  console.log(`# ${LABELS[target]}`);
  for (const p of prompts) {
    console.log(`  ${dirs[target]}/tasks/${p.id}.json`);
  }
}
console.log(`\n## After all agents complete:\n`);
const allIds = TARGETS.map(t => iterations[t]);
for (const id of allIds) {
  console.log(`  node src/collect-results.mjs ${id}`);
}
console.log(`  npx tsx src/build-previews.ts --iterations "${allIds.join(',')}" --tsc-only`);
console.log(`  npx tsx src/form-aggregate.ts --iterations "${allIds.join(',')}"`);

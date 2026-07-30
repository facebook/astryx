#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-discovery.mjs
 * @input CLI flags: --conditions, --sample, --reps, --prompts
 * @output One results/<iterationId>/ dir per condition + results/discovery-config.json
 * @position internal/vibe-tests/cli-discovery-test — cold-start CLI-discovery experiment
 *
 * Builds isolated, realistic "just installed @astryxdesign/core" projects and
 * measures whether an agent discovers + uses the CLI with NO one having run
 * `astryx init`. Each CONDITION = the bare base project + zero or more channel
 * patches (see conditions.json). Only the channel varies (Checker Protocol §2).
 *
 * Ground truth: every project gets an `astryx` bin SHIM at node_modules/.bin
 * that logs argv to <project>/.astryx-invocations.log before exec-ing the real
 * CLI. Discovery is defined by that log, not by self-report (PLAN.md §6.2).
 *
 * This is the PILOT: only c0-bare (floor) and c5-agents-md (ceiling) are wired.
 * Adding c1/c2/c4 later is a new entry in the PATCHES map.
 *
 * Usage:
 *   node setup-discovery.mjs                                  # c0 vs c5, curated prompts
 *   node setup-discovery.mjs --sample 6                       # stratified sample of 6
 *   node setup-discovery.mjs --conditions c0-bare,c5-agents-md --reps 5
 *   node setup-discovery.mjs --prompts fwc-1,ps-1
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXP_DIR = __dirname; // internal/vibe-tests/cli-discovery-test
const VIBE_DIR = path.resolve(EXP_DIR, '..'); // internal/vibe-tests
const REPO_ROOT = path.resolve(VIBE_DIR, '../..');
const RESULTS_DIR = path.join(VIBE_DIR, 'results');
const REAL_CLI_BIN = path.join(REPO_ROOT, 'packages', 'cli', 'bin', 'astryx.mjs');

// ── Helpers ──────────────────────────────────────────────────────────

const generateId = () => crypto.randomBytes(4).toString('hex');
const timestamp = () => new Date().toISOString();
const ensureDir = dir => fs.mkdirSync(dir, {recursive: true});

function symlink(target, linkPath, type) {
  ensureDir(path.dirname(linkPath));
  if (fs.existsSync(linkPath)) return;
  fs.symlinkSync(target, linkPath, type);
}

/** Curated prompt IDs from prompts.json, or a stratified sample of default.json. */
function selectPrompts({sample, promptIds}) {
  const testSet = JSON.parse(
    fs.readFileSync(path.join(VIBE_DIR, 'test-sets', 'default.json'), 'utf-8'),
  );
  const all = Array.isArray(testSet) ? testSet : testSet.prompts;
  const byId = new Map(all.map(p => [p.id, p]));

  if (promptIds && promptIds.length > 0) {
    return promptIds.map(id => {
      const p = byId.get(id);
      if (!p) throw new Error(`Prompt id not found in default.json: ${id}`);
      return p;
    });
  }

  if (sample) return stratified(all, sample);

  // Default: the curated subset from prompts.json
  const curated = JSON.parse(
    fs.readFileSync(path.join(EXP_DIR, 'prompts.json'), 'utf-8'),
  );
  return curated.promptIds.map(({id}) => {
    const p = byId.get(id);
    if (!p) throw new Error(`Curated prompt id not in default.json: ${id}`);
    return p;
  });
}

function stratified(prompts, n) {
  const byCat = new Map();
  for (const p of prompts) {
    const arr = byCat.get(p.category) ?? [];
    arr.push(p);
    byCat.set(p.category, arr);
  }
  const cats = [...byCat.keys()];
  const out = [];
  for (const c of cats) {
    const arr = byCat.get(c);
    out.push(arr[Math.floor(Math.random() * arr.length)]);
    if (out.length >= n) return out.slice(0, n);
  }
  let i = 0;
  while (out.length < n && i < cats.length * prompts.length) {
    const arr = byCat.get(cats[i % cats.length]);
    const avail = arr.filter(p => !out.includes(p));
    if (avail.length) out.push(avail[Math.floor(Math.random() * avail.length)]);
    i++;
  }
  return out.slice(0, n);
}

// ── Base project + ground-truth shim ─────────────────────────────────

/**
 * Create the realistic "npm install @astryxdesign/core" base: package.json with
 * core + theme (NOT the CLI — that's the whole point), symlinked packages, and
 * the logging `astryx` shim so `npx astryx` resolves AND is recorded.
 */
function createBaseProject(projectDir) {
  ensureDir(projectDir);

  // A freshly-installed consumer: core + theme, no @astryxdesign/cli listed.
  const pkg = {
    name: 'my-app',
    private: true,
    dependencies: {
      '@astryxdesign/core': '*',
      '@astryxdesign/theme-neutral': '*',
      '@stylexjs/stylex': '^0.10',
      react: '^19',
      'react-dom': '^19',
    },
  };
  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(pkg, null, 2),
  );

  const nm = path.join(projectDir, 'node_modules');
  symlink(path.join(REPO_ROOT, 'packages', 'core'), path.join(nm, '@astryxdesign', 'core'), 'dir');
  symlink(path.join(REPO_ROOT, 'packages', 'themes', 'neutral'), path.join(nm, '@astryxdesign', 'theme-neutral'), 'dir');

  installLoggingShim(projectDir);
}

/**
 * Write an executable `astryx` shim into node_modules/.bin that appends each
 * invocation to <project>/.astryx-invocations.log, then execs the real CLI.
 * Absolute paths are baked in so it works from any cwd.
 */
function installLoggingShim(projectDir) {
  const binDir = path.join(projectDir, 'node_modules', '.bin');
  ensureDir(binDir);
  const logPath = path.join(projectDir, '.astryx-invocations.log');
  const shim = `#!/usr/bin/env node
// GENERATED shim — logs invocations for the CLI-discovery experiment, then execs the real CLI.
import {appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const LOG = ${JSON.stringify(logPath)};
const REAL = ${JSON.stringify(REAL_CLI_BIN)};
const argv = process.argv.slice(2);
try { appendFileSync(LOG, JSON.stringify({ts: new Date().toISOString(), argv}) + '\\n'); } catch {}
const r = spawnSync(process.execPath, [REAL, ...argv], {stdio: 'inherit'});
process.exit(r.status ?? 0);
`;
  const shimPath = path.join(binDir, 'astryx');
  fs.writeFileSync(shimPath, shim);
  fs.chmodSync(shimPath, 0o755);
}

// ── Channel patches (the independent variable) ───────────────────────
//
// Each condition applies zero or more patches to the base. PILOT wires the
// floor (c0) and ceiling (c5). c1/c2/c4 are declared but intentionally guarded
// so they can't silently run half-implemented.

const PATCHES = {
  'c0-bare': () => {
    // Nothing. Bare install. This is the control/floor.
  },
  'c5-agents-md': projectDir => {
    // The post-`init` ceiling: run the REAL cli bin directly (NOT via the shim,
    // so setup doesn't pollute the invocation log) to write AGENTS.md.
    execFileSync(
      process.execPath,
      [REAL_CLI_BIN, 'init', '--features', 'agents', '--agent-docs-path', 'AGENTS.md'],
      {cwd: projectDir, stdio: 'pipe'},
    );
  },
};

const NOT_IN_PILOT = new Set(['c1-readme', 'c2-types', 'c3-postinstall', 'c4-firstrun', 'c6-readme+types', 'c7-all-passive']);

// ── Task prompt (IDENTICAL across conditions — §2/§3) ────────────────

function taskPrompt(prompt, projectDir) {
  const tsx = path.join(projectDir, `${prompt.id}.tsx`);
  const meta = path.join(projectDir, `${prompt.id}.json`);
  return `You are generating React/TSX code using the Astryx design system.
Your project is at ${projectDir}. Treat it as your working directory: cd into it first, then explore it to find available components.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${tsx}
Write metadata to: ${meta}

Metadata JSON shape:
{
  "completedAt": "<ISO timestamp>",
  "docsRead": [<component/doc names you looked up>],
  "discovery": {
    "sawCliReference": <true|false>,
    "howDiscovered": "readme" | "types" | "nudge" | "guessed" | "none",
    "ranInit": <true|false>,
    "cliCommandsRun": [<exact commands, e.g. "astryx component Button">]
  }
}

Write ONLY valid TSX to the .tsx file. No markdown fences, no explanation.`;
}

// ── Build one condition = one iteration dir ──────────────────────────

function buildCondition(conditionId, prompts, reps) {
  const patch = PATCHES[conditionId];
  if (!patch) {
    if (NOT_IN_PILOT.has(conditionId)) {
      throw new Error(`Condition "${conditionId}" is declared in conditions.json but not wired in the pilot (only c0-bare, c5-agents-md). Add it to PATCHES to enable.`);
    }
    throw new Error(`Unknown condition: ${conditionId}`);
  }

  const iterationId = generateId();
  const iterDir = path.join(RESULTS_DIR, iterationId);
  ensureDir(path.join(iterDir, 'tasks'));
  ensureDir(path.join(iterDir, 'results'));
  ensureDir(path.join(iterDir, 'projects'));

  const taskIds = [];
  for (const prompt of prompts) {
    for (let k = 1; k <= reps; k++) {
      const taskId = reps > 1 ? `${prompt.id}__r${k}` : prompt.id;
      taskIds.push(taskId);
      const projectDir = path.join(iterDir, 'projects', taskId);
      createBaseProject(projectDir);
      patch(projectDir);

      const task = {
        promptId: taskId,
        basePromptId: prompt.id,
        category: prompt.category,
        condition: conditionId,
        prompt: prompt.prompt,
        expectedComponents: prompt.expectedComponents, // eval-only; NOT in taskPrompt
        projectDir,
        invocationLog: path.join(projectDir, '.astryx-invocations.log'),
        taskPrompt: taskPrompt(prompt, projectDir),
        createdAt: timestamp(),
      };
      fs.writeFileSync(
        path.join(iterDir, 'tasks', `${taskId}.json`),
        JSON.stringify(task, null, 2),
      );
    }
  }

  const manifest = {
    iterationId,
    experiment: 'cli-discovery',
    condition: conditionId,
    createdAt: timestamp(),
    config: {persona: 'naive', reps},
    prompts: prompts.map(p => ({id: p.id, category: p.category, prompt: p.prompt, expectedComponents: p.expectedComponents})),
    taskIds,
  };
  fs.writeFileSync(path.join(iterDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  return {conditionId, iterationId, iterDir, taskIds};
}

// ── Main ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const get = flag => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  return {
    conditions: (get('--conditions') ?? 'c0-bare,c5-agents-md').split(',').map(s => s.trim()),
    sample: get('--sample') ? parseInt(get('--sample'), 10) : undefined,
    reps: get('--reps') ? parseInt(get('--reps'), 10) : 1,
    promptIds: get('--prompts') ? get('--prompts').split(',').map(s => s.trim()) : undefined,
  };
}

function main() {
  const {conditions, sample, reps, promptIds} = parseArgs(process.argv.slice(2));
  ensureDir(RESULTS_DIR);

  const prompts = selectPrompts({sample, promptIds});
  const expId = generateId();

  console.log(`\n🔎 CLI Discovery Vibe Test  (experiment ${expId})`);
  console.log(`   Conditions: ${conditions.join(', ')}`);
  console.log(`   Prompts: ${prompts.map(p => p.id).join(', ')}  × ${reps} rep(s)`);
  console.log(`   Runs per condition: ${prompts.length * reps}\n`);

  const built = [];
  for (const c of conditions) built.push(buildCondition(c, prompts, reps));

  const config = {
    experimentId: expId,
    createdAt: timestamp(),
    reps,
    promptIds: prompts.map(p => p.id),
    conditions: Object.fromEntries(built.map(b => [b.conditionId, b.iterationId])),
    iterDirs: Object.fromEntries(built.map(b => [b.conditionId, b.iterDir])),
  };
  const configPath = path.join(RESULTS_DIR, `discovery-config-${expId}.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Conditions ready:`);
  for (const b of built) console.log(`   ${b.conditionId.padEnd(14)} ${b.iterationId}  (${b.taskIds.length} tasks)`);
  console.log(`\n📄 Config: ${configPath}\n`);

  console.log(`## Spawn a FRESH, context-free sub-agent per task file (Checker Protocol §5):\n`);
  for (const b of built) {
    console.log(`# ${b.conditionId}`);
    for (const id of b.taskIds) console.log(`   ${path.join(b.iterDir, 'tasks', `${id}.json`)}`);
    console.log();
  }

  console.log(`## After all agents complete — score the funnel:\n`);
  console.log(`   npx tsx ${path.join('cli-discovery-test', 'discovery-aggregate.ts')} --experiment ${expId}\n`);
}

main();

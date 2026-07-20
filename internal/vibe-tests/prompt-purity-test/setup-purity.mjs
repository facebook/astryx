#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-purity.mjs
 * @input CLI flags: --exp, --out, --conditions, --prompts, --sample, --reps
 * @output One <sandbox>/<expId>/<conditionId>/ tree per condition + <sandbox>/<expId>/purity-config.json
 * @position internal/vibe-tests/prompt-purity-test — prompt-purity A/B experiment
 *
 * Builds isolated, realistic "installed @astryxdesign/core" projects whose ONLY
 * guidance is a VARIANT of the astryx-init prompt (the independent variable). Each
 * CONDITION = a fresh `astryx init` AGENTS.md + one variant self-check block spliced
 * inside the <!-- ASTRYX:START/END --> markers (see conditions.json + variants/*.md).
 * Only the injected prompt varies (Checker Protocol §2).
 *
 * ISOLATION: everything is created under an OUT-OF-WORKSPACE sandbox root
 * (os.tmpdir()/astryx-purity by default, --out to override) so it never touches your
 * open repo, editor file-watchers, other Cursor agents, or `git status`. Repo
 * packages are only symlinked (read-only).
 *
 * GROUND TRUTH: every project gets an `astryx` bin SHIM at node_modules/.bin that
 * logs argv to <project>/.astryx-invocations.log before exec-ing the real CLI, so we
 * know objectively whether the agent ran the CLI to self-verify.
 *
 * Usage:
 *   node setup-purity.mjs                                           # A vs B, curated pilot prompts, 3 reps
 *   node setup-purity.mjs --conditions A-control,B-selfcheck,C-strong --sample 6 --reps 5
 *   node setup-purity.mjs --exp abcd1234 --prompts dd-1,tc-6 --reps 3
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXP_DIR = __dirname; // internal/vibe-tests/prompt-purity-test
const VIBE_DIR = path.resolve(EXP_DIR, '..'); // internal/vibe-tests
const REPO_ROOT = path.resolve(VIBE_DIR, '../..');
const REAL_CLI_BIN = path.join(REPO_ROOT, 'packages', 'cli', 'bin', 'astryx.mjs');

// ── Helpers ──────────────────────────────────────────────────────────

const genId = () => crypto.randomBytes(4).toString('hex');
const timestamp = () => new Date().toISOString();
const ensureDir = dir => fs.mkdirSync(dir, {recursive: true});
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf-8'));

/** Default sandbox base — OUTSIDE the repo. Overridable with --out or $ASTRYX_PURITY_OUT. */
export function sandboxBase(out) {
  return out || process.env.ASTRYX_PURITY_OUT || path.join(os.tmpdir(), 'astryx-purity');
}

function symlink(target, linkPath, type) {
  ensureDir(path.dirname(linkPath));
  if (fs.existsSync(linkPath)) return;
  fs.symlinkSync(target, linkPath, type);
}

/** Curated prompt IDs from prompts.json, explicit --prompts, or a stratified sample. */
function selectPrompts({sample, promptIds}) {
  const testSet = readJson(path.join(VIBE_DIR, 'test-sets', 'default.json'));
  const all = Array.isArray(testSet) ? testSet : testSet.prompts;
  const byId = new Map(all.map(p => [p.id, p]));
  const lookup = id => {
    const p = byId.get(id);
    if (!p) throw new Error(`Prompt id not found in default.json: ${id}`);
    return p;
  };

  if (promptIds && promptIds.length > 0) return promptIds.map(lookup);
  if (sample) return stratified(all, sample);

  const curated = readJson(path.join(EXP_DIR, 'prompts.json'));
  return curated.promptIds.map(({id}) => lookup(id));
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
    out.push(byCat.get(c)[Math.floor(Math.random() * byCat.get(c).length)]);
    if (out.length >= n) return out.slice(0, n);
  }
  let i = 0;
  while (out.length < n && i < cats.length * prompts.length) {
    const avail = byCat.get(cats[i % cats.length]).filter(p => !out.includes(p));
    if (avail.length) out.push(avail[Math.floor(Math.random() * avail.length)]);
    i++;
  }
  return out.slice(0, n);
}

// ── Base project + ground-truth shim ─────────────────────────────────

/**
 * Realistic "installed @astryxdesign/core" base. Crucially lists a StyleX *compiler*
 * plugin in devDependencies so the CLI's detectStylingSystem() returns 'stylex' and
 * the injected prompt recommends the Astryx xstyle/StyleX path (what we're testing) —
 * NOT the plain-CSS fallback. The plugin is only referenced in package.json (read by
 * detection); it is never installed/compiled here.
 */
function createBaseProject(projectDir) {
  ensureDir(projectDir);
  const pkg = {
    name: 'my-app',
    private: true,
    type: 'module',
    dependencies: {
      '@astryxdesign/core': '*',
      '@astryxdesign/theme-neutral': '*',
      '@stylexjs/stylex': '^0.10',
      react: '^19',
      'react-dom': '^19',
    },
    devDependencies: {
      '@stylexjs/babel-plugin': '^0.10',
    },
  };
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(pkg, null, 2));

  const nm = path.join(projectDir, 'node_modules');
  symlink(path.join(REPO_ROOT, 'packages', 'core'), path.join(nm, '@astryxdesign', 'core'), 'dir');
  symlink(path.join(REPO_ROOT, 'packages', 'themes', 'neutral'), path.join(nm, '@astryxdesign', 'theme-neutral'), 'dir');
  // CLI is symlinked (so `npx astryx` resolves) but NOT listed in package.json.
  symlink(path.join(REPO_ROOT, 'packages', 'cli'), path.join(nm, '@astryxdesign', 'cli'), 'dir');

  installLoggingShim(projectDir);
}

/**
 * Executable `astryx` shim in node_modules/.bin that appends each invocation to
 * <project>/.astryx-invocations.log, then execs the real CLI. Absolute paths baked in.
 */
function installLoggingShim(projectDir) {
  const binDir = path.join(projectDir, 'node_modules', '.bin');
  ensureDir(binDir);
  const logPath = path.join(projectDir, '.astryx-invocations.log');
  const shim = `#!/usr/bin/env node
// GENERATED shim — logs invocations for the prompt-purity experiment, then execs the real CLI.
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

// ── Variant splice (the independent variable) ────────────────────────

const MARKER_END = '<!-- ASTRYX:END -->';
const LEGACY_MARKER_END = '<!-- XDS:END -->';

/**
 * Splice a variant's self-check text inside the injected ASTRYX block of AGENTS.md.
 * HTML comments are stripped; if nothing remains (the control), inject nothing.
 */
function applyVariant(projectDir, variantId) {
  const variantPath = path.join(EXP_DIR, 'variants', `${variantId}.md`);
  if (!fs.existsSync(variantPath)) {
    throw new Error(`Variant file not found: ${variantPath}`);
  }
  const raw = fs.readFileSync(variantPath, 'utf-8');
  const text = raw.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!text) return {injected: false}; // control / no-op

  const agentsPath = path.join(projectDir, 'AGENTS.md');
  if (!fs.existsSync(agentsPath)) {
    throw new Error(`AGENTS.md missing at ${agentsPath} — did \`astryx init\` run?`);
  }
  let content = fs.readFileSync(agentsPath, 'utf-8');
  const block = `\n\nPURITY SELF-CHECK\n${text}\n`;
  if (content.includes(MARKER_END)) {
    content = content.replace(MARKER_END, `${block}${MARKER_END}`);
  } else if (content.includes(LEGACY_MARKER_END)) {
    content = content.replace(LEGACY_MARKER_END, `${block}${LEGACY_MARKER_END}`);
  } else {
    content = content.trimEnd() + block;
  }
  fs.writeFileSync(agentsPath, content);
  return {injected: true};
}

/** Run the real `astryx init` (direct bin, NOT the shim) to write AGENTS.md. */
function runInit(projectDir) {
  execFileSync(
    process.execPath,
    [REAL_CLI_BIN, 'init', '--features', 'agents', '--agent-docs-path', 'AGENTS.md'],
    {cwd: projectDir, stdio: 'pipe'},
  );
}

// ── Task prompt (IDENTICAL across conditions except the AGENTS.md variant) ──

function taskPrompt(prompt, projectDir, outputFile) {
  return `First read AGENTS.md in this directory for component-library guidance, then follow it.

You are building a React + TypeScript (.tsx) UI using the Astryx design system. Your
project is at ${projectDir}.

## Task

${prompt.prompt}

## Output

Write a single, complete, self-contained .tsx file to:
  ${outputFile}

Then write a short metadata file next to it at:
  ${path.join(projectDir, 'result-meta.json')}

with this shape:
{
  "completedAt": "<ISO timestamp>",
  "docsRead": [<component/doc names you looked up>],
  "selfCheck": {
    "reReadOutput": <true|false>,
    "foundNonAstryx": <true|false>,
    "fixed": <true|false>
  }
}

Write ONLY valid TSX to the .tsx file (no markdown fences, no prose).`;
}

// ── Build one condition ──────────────────────────────────────────────

function buildCondition({expDir, conditionId, variantId, prompts, reps}) {
  const condDir = path.join(expDir, conditionId);
  ensureDir(path.join(condDir, 'tasks'));
  ensureDir(path.join(condDir, 'projects'));
  ensureDir(path.join(condDir, 'runs'));

  const taskIds = [];
  for (const prompt of prompts) {
    for (let k = 1; k <= reps; k++) {
      const taskId = reps > 1 ? `${prompt.id}__r${k}` : prompt.id;
      taskIds.push(taskId);
      const projectDir = path.join(condDir, 'projects', taskId);
      const outputFile = path.join(projectDir, 'output.tsx');

      createBaseProject(projectDir);
      runInit(projectDir);
      const {injected} = applyVariant(projectDir, variantId);

      const task = {
        taskId,
        basePromptId: prompt.id,
        category: prompt.category,
        complexity: prompt.complexity,
        condition: conditionId,
        variant: variantId,
        variantInjected: injected,
        prompt: prompt.prompt,
        expectedComponents: prompt.expectedComponents, // EVAL-ONLY; never placed in taskPrompt
        projectDir,
        outputFile,
        agentsPath: path.join(projectDir, 'AGENTS.md'),
        invocationLog: path.join(projectDir, '.astryx-invocations.log'),
        runDir: path.join(condDir, 'runs', taskId),
        taskPrompt: taskPrompt(prompt, projectDir, outputFile),
        createdAt: timestamp(),
      };
      fs.writeFileSync(path.join(condDir, 'tasks', `${taskId}.json`), JSON.stringify(task, null, 2));
    }
  }

  const manifest = {
    experimentCondition: conditionId,
    variant: variantId,
    createdAt: timestamp(),
    reps,
    prompts: prompts.map(p => ({id: p.id, category: p.category})),
    taskIds,
  };
  fs.writeFileSync(path.join(condDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return {conditionId, condDir, taskIds};
}

// ── Main ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const get = flag => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  const conditionsArg = get('--conditions');
  return {
    exp: get('--exp'),
    out: get('--out'),
    conditions: conditionsArg ? conditionsArg.split(',').map(s => s.trim()) : undefined,
    sample: get('--sample') ? parseInt(get('--sample'), 10) : undefined,
    reps: get('--reps') ? parseInt(get('--reps'), 10) : undefined,
    promptIds: get('--prompts') ? get('--prompts').split(',').map(s => s.trim()) : undefined,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const conditionsDef = readJson(path.join(EXP_DIR, 'conditions.json'));
  const byId = new Map(conditionsDef.conditions.map(c => [c.id, c]));

  const conditionIds = args.conditions ?? ['A-control', 'B-selfcheck'];
  for (const id of conditionIds) {
    if (!byId.has(id)) {
      throw new Error(`Unknown condition "${id}". Known: ${[...byId.keys()].join(', ')}`);
    }
  }

  // Pilot default prompts come from prompts.json#pilotDefault when nothing specified.
  let promptIds = args.promptIds;
  if (!promptIds && !args.sample) {
    const curated = readJson(path.join(EXP_DIR, 'prompts.json'));
    promptIds = curated.pilotDefault ?? curated.promptIds.map(p => p.id);
  }
  const reps = args.reps ?? 3;
  const prompts = selectPrompts({sample: args.sample, promptIds});

  const expId = args.exp ?? genId();
  const base = sandboxBase(args.out);
  const expDir = path.join(base, expId);
  ensureDir(expDir);

  console.log(`\nPrompt Purity Vibe Test — experiment ${expId}`);
  console.log(`  Sandbox:    ${expDir}`);
  console.log(`  Conditions: ${conditionIds.join(', ')}`);
  console.log(`  Prompts:    ${prompts.map(p => p.id).join(', ')}  x ${reps} rep(s)`);
  console.log(`  Runs/cond:  ${prompts.length * reps}\n`);

  const built = [];
  for (const id of conditionIds) {
    const c = byId.get(id);
    process.stdout.write(`  building ${id} (variant ${c.variant})...`);
    built.push(buildCondition({expDir, conditionId: id, variantId: c.variant, prompts, reps}));
    process.stdout.write(' done\n');
  }

  const config = {
    experimentId: expId,
    experiment: 'prompt-purity',
    createdAt: timestamp(),
    sandboxRoot: expDir,
    control: conditionsDef.control ?? 'A-control',
    reps,
    promptIds: prompts.map(p => p.id),
    conditions: conditionIds,
    conditionDirs: Object.fromEntries(built.map(b => [b.conditionId, b.condDir])),
  };
  const configPath = path.join(expDir, 'purity-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`\nConditions ready:`);
  for (const b of built) console.log(`  ${b.conditionId.padEnd(14)} ${b.taskIds.length} tasks`);
  console.log(`\nConfig: ${configPath}`);
  console.log(`\nNext:`);
  console.log(`  npx tsx ${path.relative(process.cwd(), path.join(EXP_DIR, 'run-purity.ts'))} --experiment ${expId}${args.out ? ` --out ${args.out}` : ''}`);
  console.log(`  npx tsx ${path.relative(process.cwd(), path.join(EXP_DIR, 'purity-aggregate.ts'))} --experiment ${expId}${args.out ? ` --out ${args.out}` : ''}\n`);

  // Machine-readable line for the orchestrator to capture the id.
  console.log(`PURITY_EXPERIMENT_ID=${expId}`);
}

main();

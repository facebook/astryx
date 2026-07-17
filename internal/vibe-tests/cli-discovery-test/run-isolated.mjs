#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file run-isolated.mjs
 * @input CLI flags: --conditions, --prompts/--sample, --reps, --model, --run
 * @output /tmp sandboxes + results/<iter>/{manifest,tasks} + discovery-config-<expId>.json
 * @position internal/vibe-tests/cli-discovery-test — the ISOLATED runner (Phase 1.5)
 *
 * Fixes the contamination found in pilot 1 (PLAN.md §14): the in-repo Task
 * sub-agents inherited this repo's always-applied CLAUDE.md (which teaches the
 * CLI) and reached the repo-root CLI + source. Here each task runs in a /tmp
 * sandbox with packages COPIED (no symlink back into the repo) and — when
 * --run — is driven by a headless `cursor-agent` whose cwd is the sandbox, so
 * NONE of this repo's rules apply and the only reachable `astryx` is the shim.
 *
 * Every discovery channel advertises a `--via`-tagged init command, matching
 * the CLI's attribution capture (packages/cli/src/lib/attribution.mjs), so the
 * experiment taxonomy == the production taxonomy.
 *
 * Usage:
 *   node run-isolated.mjs                       # set up c0 vs c5 sandboxes (no agents)
 *   node run-isolated.mjs --run                 # ...and drive cursor-agent headless
 *   node run-isolated.mjs --conditions c0-bare,c1-readme,c5-agents-md --reps 3 --run
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import {execFileSync, spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXP_DIR = __dirname;
const VIBE_DIR = path.resolve(EXP_DIR, '..');
const REPO_ROOT = path.resolve(VIBE_DIR, '../..');
const RESULTS_DIR = path.join(VIBE_DIR, 'results');
const REAL_CLI_BIN = path.join(REPO_ROOT, 'packages', 'cli', 'bin', 'astryx.mjs');
const TMP_ROOT = path.join(os.tmpdir(), 'astryx-disco');

const generateId = () => crypto.randomBytes(4).toString('hex');
const timestamp = () => new Date().toISOString();
const ensureDir = d => fs.mkdirSync(d, {recursive: true});

// ── Shared package copies (OUTSIDE the repo, so exploring can't reach source) ──

/** Copy core + theme into /tmp once per invocation; return the shared dir. */
function ensureSharedPkgs(expId) {
  const dir = path.join(TMP_ROOT, expId, '_pkgs');
  const core = path.join(dir, '@astryxdesign', 'core');
  if (!fs.existsSync(core)) {
    ensureDir(path.dirname(core));
    fs.cpSync(path.join(REPO_ROOT, 'packages', 'core'), core, {recursive: true, dereference: true});
    fs.cpSync(
      path.join(REPO_ROOT, 'packages', 'themes', 'neutral'),
      path.join(dir, '@astryxdesign', 'theme-neutral'),
      {recursive: true, dereference: true},
    );
  }
  return dir;
}

/** Executable `astryx` shim: logs argv to the sandbox, then execs the real CLI. */
function installLoggingShim(sandboxDir, {nudge = false} = {}) {
  const binDir = path.join(sandboxDir, 'node_modules', '.bin');
  ensureDir(binDir);
  const logPath = path.join(sandboxDir, '.astryx-invocations.log');
  const nudgeBlock = nudge
    ? `try { if (!existsSync(LOG)) process.stderr.write('\\n▶ Astryx: run \`npx astryx init --via=nudge\` to set up your project and AI agent docs.\\n\\n'); } catch {}`
    : '';
  const shim = `#!/usr/bin/env node
import {appendFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const LOG = ${JSON.stringify(logPath)};
const REAL = ${JSON.stringify(REAL_CLI_BIN)};
const argv = process.argv.slice(2);
${nudgeBlock}
try { appendFileSync(LOG, JSON.stringify({ts: new Date().toISOString(), argv}) + '\\n'); } catch {}
const r = spawnSync(process.execPath, [REAL, ...argv], {stdio: 'inherit'});
process.exit(r.status ?? 0);
`;
  const shimPath = path.join(binDir, 'astryx');
  fs.writeFileSync(shimPath, shim);
  fs.chmodSync(shimPath, 0o755);
}

/** Build the realistic "just installed core" sandbox in /tmp (no repo paths). */
function createSandbox(sandboxDir, sharedPkgs, {nudge = false} = {}) {
  ensureDir(sandboxDir);
  fs.writeFileSync(
    path.join(sandboxDir, 'package.json'),
    JSON.stringify(
      {
        name: 'my-app',
        private: true,
        dependencies: {'@astryxdesign/core': '*', '@astryxdesign/theme-neutral': '*', react: '^19', 'react-dom': '^19'},
      },
      null,
      2,
    ),
  );
  const nm = path.join(sandboxDir, 'node_modules', '@astryxdesign');
  ensureDir(nm);
  // Symlink to the /tmp copies — NOT the repo. Walking up from these lands in
  // /tmp, so the agent can't reach the design-system source or repo CLAUDE.md.
  fs.symlinkSync(path.join(sharedPkgs, '@astryxdesign', 'core'), path.join(nm, 'core'), 'dir');
  fs.symlinkSync(path.join(sharedPkgs, '@astryxdesign', 'theme-neutral'), path.join(nm, 'theme-neutral'), 'dir');
  installLoggingShim(sandboxDir, {nudge});
}

// ── Channel patches (the independent variable), each --via-tagged ────────────

const PATCHES = {
  'c0-bare': () => {},
  'c1-readme': sandboxDir => {
    fs.writeFileSync(
      path.join(sandboxDir, 'README.md'),
      `# my-app\n\n> **Using an AI agent?** Run \`npx astryx init --via=readme\` first — it installs the component index your agent needs.\n\nThis app uses the Astryx design system (\`@astryxdesign/core\`).\n`,
    );
  },
  'c4-nudge': () => {
    // Handled at sandbox creation via the shim's nudge flag (see buildCondition).
  },
  'c5-agents-md': sandboxDir => {
    // Post-init ceiling: run the real CLI directly (not the shim) so setup
    // doesn't pollute the log. Tag it via=agents for attribution parity.
    execFileSync(
      process.execPath,
      [REAL_CLI_BIN, 'init', '--features', 'agents', '--agent-docs-path', 'AGENTS.md', '--via', 'agents'],
      {cwd: sandboxDir, stdio: 'pipe'},
    );
  },
};

// ── Prompts (identical across conditions; expectedComponents never shown) ─────

function selectPrompts({sample, promptIds}) {
  const testSet = JSON.parse(fs.readFileSync(path.join(VIBE_DIR, 'test-sets', 'default.json'), 'utf-8'));
  const all = Array.isArray(testSet) ? testSet : testSet.prompts;
  const byId = new Map(all.map(p => [p.id, p]));
  if (promptIds && promptIds.length) return promptIds.map(id => byId.get(id));
  if (sample) return all.slice(0, sample);
  const curated = JSON.parse(fs.readFileSync(path.join(EXP_DIR, 'prompts.json'), 'utf-8'));
  return curated.promptIds.map(({id}) => byId.get(id));
}

function taskPrompt(prompt, sandboxDir) {
  return `You are generating React/TSX code using the Astryx design system.
Your project is at ${sandboxDir}. Treat it as your working directory: cd into it first, then explore it to find available components.

## Task

${prompt.prompt}

## Output

Write the TSX code to: ${path.join(sandboxDir, `${prompt.id}.tsx`)}
Write metadata to: ${path.join(sandboxDir, `${prompt.id}.json`)}

Metadata JSON shape:
{
  "completedAt": "<ISO timestamp>",
  "docsRead": [<component/doc names you looked up>],
  "discovery": {
    "sawCliReference": <true|false>,
    "howDiscovered": "readme" | "types" | "nudge" | "guessed" | "none",
    "ranInit": <true|false>,
    "cliCommandsRun": [<exact commands>]
  }
}

Write ONLY valid TSX to the .tsx file. No markdown fences, no explanation.`;
}

// ── Build one condition = one iteration dir + N sandboxes ────────────────────

function buildCondition(conditionId, prompts, reps, sharedPkgs, expId) {
  const patch = PATCHES[conditionId];
  if (!patch) throw new Error(`Condition "${conditionId}" not wired. Add it to PATCHES.`);
  const nudge = conditionId === 'c4-nudge';

  const iterationId = generateId();
  const iterDir = path.join(RESULTS_DIR, iterationId);
  ensureDir(path.join(iterDir, 'tasks'));
  ensureDir(path.join(iterDir, 'results'));

  const tasks = [];
  for (const prompt of prompts) {
    for (let k = 1; k <= reps; k++) {
      const taskId = reps > 1 ? `${prompt.id}__r${k}` : prompt.id;
      const sandboxDir = path.join(TMP_ROOT, expId, conditionId, taskId);
      createSandbox(sandboxDir, sharedPkgs, {nudge});
      patch(sandboxDir);

      const task = {
        promptId: taskId,
        basePromptId: prompt.id,
        category: prompt.category,
        condition: conditionId,
        prompt: prompt.prompt,
        expectedComponents: prompt.expectedComponents,
        projectDir: sandboxDir,
        invocationLog: path.join(sandboxDir, '.astryx-invocations.log'),
        taskPrompt: taskPrompt(prompt, sandboxDir),
        createdAt: timestamp(),
      };
      fs.writeFileSync(path.join(iterDir, 'tasks', `${taskId}.json`), JSON.stringify(task, null, 2));
      tasks.push(task);
    }
  }

  fs.writeFileSync(
    path.join(iterDir, 'manifest.json'),
    JSON.stringify({iterationId, experiment: 'cli-discovery-isolated', condition: conditionId, createdAt: timestamp(), taskIds: tasks.map(t => t.promptId)}, null, 2),
  );
  return {conditionId, iterationId, iterDir, tasks};
}

// ── Headless agent runner (cursor-agent, cwd = sandbox, no repo rules) ────────

function runAgent(task, model) {
  return new Promise(resolve => {
    const args = ['-p', '--force', '--trust', '--sandbox', 'disabled', '--output-format', 'text'];
    if (model) args.push('--model', model);
    args.push(task.taskPrompt);
    const out = fs.createWriteStream(path.join(task.projectDir, 'agent-transcript.txt'));
    const child = spawn('cursor-agent', args, {cwd: task.projectDir});
    child.stdout.pipe(out);
    child.stderr.pipe(out);
    child.on('close', code => resolve({taskId: task.promptId, condition: task.condition, code}));
    child.on('error', err => resolve({taskId: task.promptId, condition: task.condition, code: -1, error: String(err)}));
  });
}

async function runAll(built, model, concurrency = 4) {
  const queue = built.flatMap(b => b.tasks);
  const results = [];
  let i = 0;
  async function worker() {
    while (i < queue.length) {
      const task = queue[i++];
      process.stdout.write(`  ▶ ${task.condition}/${task.promptId} …\n`);
      const r = await runAgent(task, model);
      process.stdout.write(`  ✓ ${task.condition}/${task.promptId} (exit ${r.code})\n`);
      results.push(r);
    }
  }
  await Promise.all(Array.from({length: Math.min(concurrency, queue.length)}, worker));
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : def;
}

async function main() {
  const conditions = (arg('--conditions', 'c0-bare,c5-agents-md')).split(',').map(s => s.trim());
  const reps = parseInt(arg('--reps', '1'), 10);
  const sample = arg('--sample') ? parseInt(arg('--sample'), 10) : undefined;
  const promptIds = arg('--prompts') ? arg('--prompts').split(',').map(s => s.trim()) : undefined;
  const model = arg('--model', 'auto');
  const doRun = process.argv.includes('--run');

  ensureDir(RESULTS_DIR);
  const expId = generateId();
  const sharedPkgs = ensureSharedPkgs(expId);
  const prompts = selectPrompts({sample, promptIds});

  console.log(`\n🧪 CLI Discovery — ISOLATED (experiment ${expId})`);
  console.log(`   Sandboxes under: ${path.join(TMP_ROOT, expId)}`);
  console.log(`   Conditions: ${conditions.join(', ')}`);
  console.log(`   Prompts: ${prompts.map(p => p.id).join(', ')} × ${reps} rep(s)`);
  console.log(`   Model: ${model} · run agents: ${doRun}\n`);

  const built = conditions.map(c => buildCondition(c, prompts, reps, sharedPkgs, expId));

  fs.writeFileSync(
    path.join(RESULTS_DIR, `discovery-config-${expId}.json`),
    JSON.stringify(
      {experimentId: expId, isolated: true, createdAt: timestamp(), model, reps, promptIds: prompts.map(p => p.id), conditions: Object.fromEntries(built.map(b => [b.conditionId, b.iterationId]))},
      null,
      2,
    ),
  );

  for (const b of built) console.log(`   ${b.conditionId.padEnd(14)} ${b.iterationId}  (${b.tasks.length} sandboxes)`);

  if (!doRun) {
    console.log(`\nSandboxes ready (no agents run). Inspect isolation, then re-run with --run.`);
    console.log(`Score later: npx tsx cli-discovery-test/discovery-aggregate.ts --experiment ${expId}\n`);
    return;
  }

  console.log(`\n🤖 Driving cursor-agent headless (cwd = each sandbox)…\n`);
  await runAll(built, model);
  console.log(`\n✅ All agents done. Score the funnel:`);
  console.log(`   npx tsx cli-discovery-test/discovery-aggregate.ts --experiment ${expId}\n`);
}

main();

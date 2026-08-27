#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-adoption.mjs
 * @input CLI flags: --conditions, --prompts, --tiers, --reps, --precedent, --out, --copy-packages
 * @output One results/<iterationId>/ dir per condition + results/adoption-config-<expId>.json
 * @position internal/vibe-tests/adoption-test — adoption-into-an-existing-app experiment
 *
 * Builds one sandbox per (condition × prompt × rep [× precedent level]) from the
 * versioned fixture app. Every sandbox:
 *
 *   1. is a copy of fixture-app/ with the shared shadcn components wired in
 *      (same source as the nightly baseline target — one copy, no drift),
 *   2. has @astryxdesign/core + theme + CLI present in node_modules — the design
 *      system is installed in EVERY condition; availability is never the variable,
 *   3. records every `astryx` call through a logging shim (ground truth: self-report
 *      is not trusted — see cli-discovery-test/PLAN.md §6.2),
 *   4. gets the condition's guidance patches and nothing else,
 *   5. is git-initialised with one baseline commit, so the agent's output is a DIFF.
 *
 * Usage:
 *   node setup-adoption.mjs                                        # floor vs ceiling, T1+T2
 *   node setup-adoption.mjs --conditions a0-installed,a2-ladder --tiers T2,T3
 *   node setup-adoption.mjs --prompts t3-1 --precedent both --reps 3
 *   node setup-adoption.mjs --out /tmp/adoption --copy-packages    # isolated runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXP_DIR = __dirname;
const VIBE_DIR = path.resolve(EXP_DIR, '..');
const REPO_ROOT = path.resolve(VIBE_DIR, '../..');
const FIXTURE = path.join(EXP_DIR, 'fixture-app');
const GUIDANCE = path.join(EXP_DIR, 'guidance');
const BASELINE = path.join(VIBE_DIR, '.baseline');
const REAL_CLI_BIN = path.join(
  REPO_ROOT,
  'packages',
  'cli',
  'clients',
  'cli',
  'bin',
  'astryx.mjs',
);

const PRECEDENT_FILE = path.join('components', 'entity', 'build-hovercard.tsx');

// ── small helpers ────────────────────────────────────────────────────

const generateId = () => crypto.randomBytes(4).toString('hex');
const timestamp = () => new Date().toISOString();
const ensureDir = dir => fs.mkdirSync(dir, {recursive: true});
const read = p => fs.readFileSync(p, 'utf8');
const write = (p, s) => {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, s);
};

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function link(target, linkPath, {copy}) {
  ensureDir(path.dirname(linkPath));
  if (fs.existsSync(linkPath)) return;
  if (copy) copyDir(target, linkPath);
  else fs.symlinkSync(target, linkPath, 'dir');
}

/** Replace the `## <heading>` section of a markdown file, up to the next `## `. */
function replaceSection(markdown, heading, replacement) {
  const lines = markdown.split('\n');
  const start = lines.findIndex(
    l => l.trim().toLowerCase() === `## ${heading}`.toLowerCase(),
  );
  if (start === -1) throw new Error(`Section "## ${heading}" not found`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      end = i;
      break;
    }
  }
  return [
    ...lines.slice(0, start),
    replacement.trimEnd(),
    '',
    ...lines.slice(end),
  ].join('\n');
}

// ── the sandbox ──────────────────────────────────────────────────────

function createSandbox(sandboxDir, {copyPackages}) {
  copyDir(FIXTURE, sandboxDir);

  // Shared primitives: the same real shadcn source the nightly baseline uses.
  link(
    path.join(BASELINE, 'components', 'ui'),
    path.join(sandboxDir, 'components', 'ui'),
    {
      copy: copyPackages,
    },
  );
  fs.copyFileSync(
    path.join(BASELINE, 'lib', 'utils.ts'),
    path.join(sandboxDir, 'lib', 'utils.ts'),
  );

  // The design system, installed but unannounced. Present in every condition.
  const nm = path.join(sandboxDir, 'node_modules', '@astryxdesign');
  link(path.join(REPO_ROOT, 'packages', 'core'), path.join(nm, 'core'), {
    copy: copyPackages,
  });
  link(
    path.join(REPO_ROOT, 'packages', 'themes', 'neutral'),
    path.join(nm, 'theme-neutral'),
    {
      copy: copyPackages,
    },
  );
  link(path.join(REPO_ROOT, 'packages', 'cli'), path.join(nm, 'cli'), {
    copy: copyPackages,
  });

  const pkgPath = path.join(sandboxDir, 'package.json');
  const pkg = JSON.parse(read(pkgPath));
  pkg.dependencies['@astryxdesign/core'] = '^0.3';
  pkg.dependencies['@astryxdesign/theme-neutral'] = '^0.3';
  pkg.devDependencies = {
    ...(pkg.devDependencies ?? {}),
    '@astryxdesign/cli': '^0.3',
  };
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  installLoggingShim(sandboxDir);
}

/**
 * `astryx` shim: append {ts, argv, status} to .astryx-invocations.log, then exec
 * the real CLI. The ts is what makes "looked it up BEFORE deciding" measurable.
 */
function installLoggingShim(sandboxDir) {
  const binDir = path.join(sandboxDir, 'node_modules', '.bin');
  ensureDir(binDir);
  const logPath = path.join(sandboxDir, '.astryx-invocations.log');
  const shim = `#!/usr/bin/env node
// GENERATED shim — records invocations for the adoption experiment, then execs the real CLI.
import {appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const LOG = ${JSON.stringify(logPath)};
const REAL = ${JSON.stringify(REAL_CLI_BIN)};
const argv = process.argv.slice(2);
const started = new Date().toISOString();
const r = spawnSync(process.execPath, [REAL, ...argv], {stdio: 'inherit'});
try {
  appendFileSync(LOG, JSON.stringify({ts: started, argv, status: r.status ?? 0}) + '\\n');
} catch {}
process.exit(r.status ?? 0);
`;
  const shimPath = path.join(binDir, 'astryx');
  fs.writeFileSync(shimPath, shim);
  fs.chmodSync(shimPath, 0o755);
}

// ── guidance patches (the independent variable) ──────────────────────

const PATCHES = {
  'patch:astryx-init': sandboxDir => {
    execFileSync(
      process.execPath,
      [
        REAL_CLI_BIN,
        'init',
        '--features',
        'agents',
        '--agent-docs-path',
        'AGENTS.md',
      ],
      {cwd: sandboxDir, stdio: 'pipe'},
    );
  },
  'patch:ladder': sandboxDir => {
    const agents = path.join(sandboxDir, 'AGENTS.md');
    fs.appendFileSync(agents, '\n' + read(path.join(GUIDANCE, 'ladder.md')));
  },
  'patch:aligned-styling': sandboxDir => {
    const agents = path.join(sandboxDir, 'AGENTS.md');
    write(
      agents,
      replaceSection(
        read(agents),
        'Styling',
        read(path.join(GUIDANCE, 'aligned-styling.md')),
      ),
    );
  },
  'patch:directed': sandboxDir => {
    const agents = path.join(sandboxDir, 'AGENTS.md');
    fs.appendFileSync(agents, '\n' + read(path.join(GUIDANCE, 'directed.md')));
  },
};

/**
 * Precedent factor: remove the hand-rolled hovercard and its usage. Every edit
 * is asserted, so a fixture change can never silently turn `strip` into a no-op.
 */
function stripPrecedent(sandboxDir) {
  const file = path.join(sandboxDir, PRECEDENT_FILE);
  if (!fs.existsSync(file))
    throw new Error(`precedent file missing: ${PRECEDENT_FILE}`);
  fs.rmSync(file);

  const tablePath = path.join(sandboxDir, 'components', 'run-table.tsx');
  const before = read(tablePath);
  const after = before
    .replace(/import \{BuildHovercard\}.*\n/, '')
    .replace(
      /<BuildHovercard buildId=\{run\.buildId\}>\s*([\s\S]*?)\s*<\/BuildHovercard>/,
      '$1',
    );
  if (after === before || after.includes('BuildHovercard')) {
    throw new Error('precedent strip did not apply cleanly to run-table.tsx');
  }
  write(tablePath, after);
}

// ── the task prompt (IDENTICAL across conditions — §2/§3) ────────────

function taskPrompt(prompt, sandboxDir) {
  return `You are working in an existing application.

You have NO prior knowledge of this codebase or of any specific design system,
component library, or styling convention. Do NOT rely on prior knowledge of any
named library. Everything you need is in the project.

## Project

${sandboxDir}

Treat it as your working directory: cd into it first, then explore it.

## Task

${prompt.prompt}

## Working notes

Leave the working tree in a state you would put up for review. Do not commit.

Write a short note to ${path.join(sandboxDir, '.agent-notes.json')}:

{
  "summary": "<what you changed>",
  "approach": "<what you built it out of, and why>",
  "consulted": [<what you read or looked up before deciding>],
  "alternativesConsidered": [<what you looked at and rejected, and why>],
  "uncertain": [<anything you could not confirm>],
  "workarounds": [<anything you had to override or work around to make it fit>]
}
`;
}

// ── build ────────────────────────────────────────────────────────────

function loadConditions() {
  return JSON.parse(read(path.join(EXP_DIR, 'conditions.json')));
}

function selectPrompts({promptIds, tiers}) {
  const battery = JSON.parse(read(path.join(EXP_DIR, 'prompts.json')));
  const byId = new Map(battery.prompts.map(p => [p.id, p]));
  if (promptIds?.length) {
    return promptIds.map(id => {
      const p = byId.get(id);
      if (!p) throw new Error(`Unknown prompt id: ${id}`);
      return p;
    });
  }
  if (tiers?.length) return battery.prompts.filter(p => tiers.includes(p.tier));
  return battery.prompts.filter(p => p.tier === 'T1' || p.tier === 'T2');
}

function gitBaseline(sandboxDir) {
  const git = args =>
    execFileSync('git', ['-C', sandboxDir, ...args], {
      stdio: 'pipe',
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: '/dev/null',
        GIT_CONFIG_SYSTEM: '/dev/null',
      },
    });
  git(['init', '--quiet', '--initial-branch=main']);
  git(['config', 'user.email', 'vibe-tests@example.invalid']);
  git(['config', 'user.name', 'Vibe Tests']);
  git(['config', 'commit.gpgsign', 'false']);
  write(
    path.join(sandboxDir, '.gitignore'),
    'node_modules/\n.astryx-invocations.log\n',
  );
  git(['add', '-A']);
  git(['commit', '--quiet', '--no-verify', '-m', 'baseline']);
}

function buildCondition(condition, prompts, opts) {
  const iterationId = generateId();
  const iterDir = path.join(opts.outDir, iterationId);
  ensureDir(path.join(iterDir, 'tasks'));
  ensureDir(path.join(iterDir, 'sandboxes'));

  const taskIds = [];
  for (const prompt of prompts) {
    const levels = prompt.precedentSensitive ? opts.precedentLevels : ['keep'];
    for (const precedent of levels) {
      for (let k = 1; k <= opts.reps; k++) {
        const parts = [prompt.id];
        if (prompt.precedentSensitive) parts.push(precedent);
        if (opts.reps > 1) parts.push(`r${k}`);
        const taskId = parts.join('__');
        taskIds.push(taskId);

        const sandboxDir = path.join(iterDir, 'sandboxes', taskId);
        createSandbox(sandboxDir, opts);
        for (const patchId of condition.patches) {
          const patch = PATCHES[patchId];
          if (!patch) throw new Error(`Unknown patch: ${patchId}`);
          patch(sandboxDir);
        }
        if (precedent === 'strip') stripPrecedent(sandboxDir);
        gitBaseline(sandboxDir);

        write(
          path.join(iterDir, 'tasks', `${taskId}.json`),
          JSON.stringify(
            {
              taskId,
              promptId: prompt.id,
              tier: prompt.tier,
              category: prompt.category,
              condition: condition.id,
              precedent,
              rep: k,
              prompt: prompt.prompt,
              expectedAdoption: prompt.expectedAdoption, // eval-only; NOT in taskPrompt
              sandboxDir,
              invocationLog: path.join(sandboxDir, '.astryx-invocations.log'),
              notesPath: path.join(sandboxDir, '.agent-notes.json'),
              taskPrompt: taskPrompt(prompt, sandboxDir),
              createdAt: timestamp(),
            },
            null,
            2,
          ),
        );
      }
    }
  }

  write(
    path.join(iterDir, 'manifest.json'),
    JSON.stringify(
      {
        iterationId,
        experiment: 'adoption',
        condition: condition.id,
        role: condition.role,
        patches: condition.patches,
        createdAt: timestamp(),
        taskIds,
      },
      null,
      2,
    ),
  );

  return {conditionId: condition.id, iterationId, iterDir, taskIds};
}

// ── main ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const get = flag => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  const list = flag =>
    get(flag)
      ?.split(',')
      .map(s => s.trim());
  const precedent = get('--precedent') ?? 'keep';
  return {
    conditionIds: list('--conditions') ?? ['a0-installed', 'a4-directed'],
    promptIds: list('--prompts'),
    tiers: list('--tiers'),
    reps: get('--reps') ? parseInt(get('--reps'), 10) : 1,
    precedentLevels: precedent === 'both' ? ['keep', 'strip'] : [precedent],
    outDir: path.resolve(get('--out') ?? path.join(VIBE_DIR, 'results')),
    copyPackages: argv.includes('--copy-packages'),
  };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const {conditions} = loadConditions();
  const chosen = opts.conditionIds.map(id => {
    const c = conditions.find(x => x.id === id);
    if (!c)
      throw new Error(
        `Unknown condition: ${id} (have: ${conditions.map(x => x.id).join(', ')})`,
      );
    return c;
  });
  const prompts = selectPrompts(opts);
  const expId = generateId();
  ensureDir(opts.outDir);

  console.log(`\n🏗  Adoption Vibe Test  (experiment ${expId})`);
  console.log(`   Conditions: ${chosen.map(c => c.id).join(', ')}`);
  console.log(
    `   Prompts:    ${prompts.map(p => p.id).join(', ')} × ${opts.reps} rep(s)`,
  );
  console.log(
    `   Precedent:  ${opts.precedentLevels.join(', ')} (T3 prompts only)`,
  );
  console.log(
    `   Packages:   ${opts.copyPackages ? 'copied (isolated)' : 'symlinked'}\n`,
  );

  const built = chosen.map(c => buildCondition(c, prompts, opts));

  const configPath = path.join(opts.outDir, `adoption-config-${expId}.json`);
  write(
    configPath,
    JSON.stringify(
      {
        experimentId: expId,
        experiment: 'adoption',
        createdAt: timestamp(),
        reps: opts.reps,
        precedentLevels: opts.precedentLevels,
        promptIds: prompts.map(p => p.id),
        conditions: Object.fromEntries(
          built.map(b => [b.conditionId, b.iterationId]),
        ),
        iterDirs: Object.fromEntries(
          built.map(b => [b.conditionId, b.iterDir]),
        ),
      },
      null,
      2,
    ),
  );

  console.log('✅ Conditions ready:');
  for (const b of built) {
    console.log(
      `   ${b.conditionId.padEnd(14)} ${b.iterationId}  (${b.taskIds.length} sandboxes)`,
    );
  }
  console.log(`\n📄 Config: ${configPath}`);
  console.log(
    '\n## Spawn a FRESH, context-free agent per task file (Checker Protocol §5):\n',
  );
  for (const b of built) {
    console.log(`# ${b.conditionId}`);
    for (const id of b.taskIds)
      console.log(`   ${path.join(b.iterDir, 'tasks', `${id}.json`)}`);
    console.log();
  }
  console.log('## After every agent finishes — score the diffs:\n');
  console.log(
    `   npx tsx adoption-test/adoption-eval.ts --experiment ${expId}`,
  );
  console.log(
    `   npx tsx adoption-test/adoption-aggregate.ts --experiment ${expId}\n`,
  );
}

main();

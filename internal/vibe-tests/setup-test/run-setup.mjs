#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file run-setup.mjs
 * @input CLI flags: --conditions, --prompts, --reps, --out, --registry, --copy-deps
 * @output One sandbox per (condition × prompt × rep) + results/setup-config-<expId>.json
 * @position internal/vibe-tests/setup-test — the setup-into-an-existing-app experiment
 *
 * Builds one sandbox per run from the versioned fixture app. Every sandbox:
 *
 *   1. is the existing Tailwind app, already installed and ALREADY BUILDING —
 *      the pristine measurement is taken before the agent is let near it, so
 *      every later number is a delta and not an absolute;
 *   2. does NOT have the design system installed. Unlike the adoption test,
 *      where availability is held constant, here INSTALLING IT IS THE TASK;
 *   3. records every `astryx` call through the same logging shim the discovery
 *      and adoption tests use, so "read the docs before editing" is measurable
 *      rather than self-reported;
 *   4. gets the condition's guidance and nothing else;
 *   5. is git-initialised with one baseline commit, so the edit is a diff and
 *      blast radius comes free.
 *
 * Usage:
 *   node run-setup.mjs                                   # floor vs ceiling, s1
 *   node run-setup.mjs --conditions s0-docs,s3-directed --prompts s1,s2
 *   node run-setup.mjs --out /tmp/setup --copy-deps
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
const BASELINE_UI = path.join(VIBE_DIR, '.baseline');
const REAL_CLI_BIN = path.join(
  REPO_ROOT,
  'packages',
  'cli',
  'clients',
  'cli',
  'bin',
  'astryx.mjs',
);

// ── args ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = name => args.includes(`--${name}`);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const list = name => {
  const v = value(name);
  return v
    ? v
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : undefined;
};

const outRoot = path.resolve(value('out', path.join(EXP_DIR, 'results')));
const reps = Number(value('reps', '1'));
const copyDeps = flag('copy-deps');

// ── helpers ──────────────────────────────────────────────────────────

const read = p => fs.readFileSync(p, 'utf8');
const ensureDir = d => fs.mkdirSync(d, {recursive: true});
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

const npm = (cwd, argv) =>
  execFileSync('npm', argv, {cwd, stdio: 'pipe', encoding: 'utf8'});

// ── shared app dependencies ──────────────────────────────────────────

/**
 * The app's own node_modules, installed once and shared by hardlink. Every
 * sandbox needs a REAL install because a setup run is scored on a build and a
 * render, not on a diff — and paying a full install per sandbox would put the
 * cost of the experiment above the cost of the thing it measures.
 */
function prepareDeps() {
  const depsDir = path.join(outRoot, '.deps');
  if (fs.existsSync(path.join(depsDir, 'node_modules'))) return depsDir;
  ensureDir(depsDir);
  fs.copyFileSync(
    path.join(FIXTURE, 'package.json'),
    path.join(depsDir, 'package.json'),
  );
  npm(depsDir, ['install', '--no-audit', '--no-fund']);
  return depsDir;
}

function linkDeps(depsDir, sandboxDir) {
  const from = path.join(depsDir, 'node_modules');
  const to = path.join(sandboxDir, 'node_modules');
  if (copyDeps) copyDir(from, to);
  else execFileSync('cp', ['-al', from, to], {stdio: 'pipe'});
}

// ── the sandbox ──────────────────────────────────────────────────────

function createSandbox(sandboxDir, depsDir) {
  copyDir(FIXTURE, sandboxDir);

  // Shared primitives: the same real shadcn source the nightly baseline uses.
  copyDir(
    path.join(BASELINE_UI, 'components', 'ui'),
    path.join(sandboxDir, 'components', 'ui'),
  );
  fs.copyFileSync(
    path.join(BASELINE_UI, 'lib', 'utils.ts'),
    path.join(sandboxDir, 'lib', 'utils.ts'),
  );

  linkDeps(depsDir, sandboxDir);
  installLoggingShim(sandboxDir);

  // The app builds BEFORE the agent arrives. An arm that cannot clear this is a
  // harness bug, and finding that out later would be finding it out as a result.
  npm(sandboxDir, ['run', 'build']);
}

/** `astryx` shim: record {ts, argv, status}, then exec the real CLI. */
function installLoggingShim(sandboxDir) {
  const binDir = path.join(sandboxDir, 'node_modules', '.bin');
  ensureDir(binDir);
  const logPath = path.join(sandboxDir, '.astryx-invocations.log');
  const shim = `#!/usr/bin/env node
// GENERATED shim — records invocations for the setup experiment, then execs the real CLI.
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
  fs.rmSync(shimPath, {force: true});
  fs.writeFileSync(shimPath, shim);
  fs.chmodSync(shimPath, 0o755);
}

// ── guidance patches (the independent variable) ──────────────────────

const PATCHES = {
  'patch:pointer': sandboxDir => {
    fs.appendFileSync(
      path.join(sandboxDir, 'AGENTS.md'),
      '\n' + read(path.join(GUIDANCE, 'pointer.md')),
    );
  },
  'patch:existing-app': sandboxDir => {
    fs.appendFileSync(
      path.join(sandboxDir, 'AGENTS.md'),
      '\n' + read(path.join(GUIDANCE, 'existing-app.md')),
    );
  },
  'patch:directed': sandboxDir => {
    fs.appendFileSync(
      path.join(sandboxDir, 'AGENTS.md'),
      '\n' + read(path.join(GUIDANCE, 'directed.md')),
    );
  },
};

// ── the task prompt (IDENTICAL across conditions — §2/§3) ────────────

function taskPrompt(prompt, sandboxDir) {
  return `You are working in an existing application.

You have NO prior knowledge of this codebase or of any specific design system,
component library, or styling convention. Do NOT rely on prior knowledge of any
named library. Everything you need is in the project or in what it points you to.

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
  "approach": "<what you did, and why>",
  "consulted": [<what you read or looked up before deciding>],
  "uncertain": [<anything you could not confirm>],
  "workarounds": [<anything you had to override or work around to make it fit>],
  "verified": [<how you checked the result, if you did>]
}
`;
}

// ── build ────────────────────────────────────────────────────────────

const conditionsFile = JSON.parse(read(path.join(EXP_DIR, 'conditions.json')));
const promptsFile = JSON.parse(read(path.join(EXP_DIR, 'prompts.json')));

const wantConditions = list('conditions');
const wantPrompts = list('prompts');

const conditions = conditionsFile.conditions.filter(
  c => !wantConditions || wantConditions.includes(c.id),
);
const prompts = promptsFile.prompts.filter(
  p => !wantPrompts || wantPrompts.includes(p.id),
);
if (conditions.length === 0) throw new Error('no conditions selected');
if (prompts.length === 0) throw new Error('no prompts selected');

const expId = crypto.randomBytes(4).toString('hex');
const depsDir = prepareDeps();
const runs = [];

for (const condition of conditions) {
  for (const prompt of prompts) {
    for (let rep = 1; rep <= reps; rep += 1) {
      const id = `${condition.id}__${prompt.id}__r${rep}`;
      const sandboxDir = path.join(outRoot, expId, id, 'app');
      createSandbox(sandboxDir, depsDir);
      for (const patch of condition.patches ?? []) {
        const apply = PATCHES[patch];
        if (!apply) throw new Error(`unknown patch: ${patch}`);
        apply(sandboxDir);
      }
      gitBaseline(sandboxDir);
      write(
        path.join(outRoot, expId, id, 'task.md'),
        taskPrompt(prompt, sandboxDir),
      );
      runs.push({
        id,
        condition: condition.id,
        prompt: prompt.id,
        rep,
        sandboxDir,
      });
      console.log(`prepared ${id}`);
    }
  }
}

write(
  path.join(outRoot, `setup-config-${expId}.json`),
  JSON.stringify({expId, createdAt: new Date().toISOString(), runs}, null, 2) +
    '\n',
);
console.log(
  `\n${runs.length} run(s) — ${path.join(outRoot, `setup-config-${expId}.json`)}`,
);
console.log(
  `Measure the pristine app first:\n  node setup-measure.mjs --app <sandbox> --out <dir>/baseline.json`,
);

function gitBaseline(sandboxDir) {
  const git = argv =>
    execFileSync('git', ['-C', sandboxDir, ...argv], {
      stdio: 'pipe',
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'vibe-tests',
        GIT_AUTHOR_EMAIL: 'vibe-tests@example.com',
        GIT_COMMITTER_NAME: 'vibe-tests',
        GIT_COMMITTER_EMAIL: 'vibe-tests@example.com',
      },
    });
  write(
    path.join(sandboxDir, '.gitignore'),
    'node_modules/\ndist/\n.astryx-invocations.log\n',
  );
  git(['init', '-q']);
  git(['add', '-A']);
  git(['commit', '-qm', 'baseline: the app before the design system']);
}

#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Smoke test for the standalone CLI runtime (scripts/build-cli-standalone.mjs).
 *
 * Extracts the tarball twice, into fresh directories with no node_modules
 * above them and a scrubbed environment, then proves:
 *   1. it runs with nothing installed: each command below exits and prints
 *      exactly what the workspace CLI prints (stdout, stderr, exit code);
 *   2. it is relocatable: both extractions print the same bytes;
 *   3. a project's own Core wins over the bundled one;
 *   4. doctor still describes the project: the bundled Core never reads as
 *      installed in it;
 *   5. read-only commands write nothing, neither where they run nor into the
 *      runtime itself;
 *   6. the manifest matches the tree.
 *
 * Usage: node .github/scripts/cli-standalone-smoke-test.mjs <tarball>
 */

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const WORKSPACE_CLI = path.join(REPO_ROOT, 'packages/cli');
const WORKSPACE_BIN = path.join(WORKSPACE_CLI, 'clients/cli/bin/astryx.mjs');

/**
 * Read-only commands whose output must match the workspace CLI byte for byte.
 * Text and --json both: the text renderers resolve some state on their own.
 */
const PARITY_COMMANDS = [
  ['--version'],
  ['--help'],
  ['search', 'button'],
  ['search', 'button', '--json'],
  ['component', 'Button'],
  ['component', '--list'],
  ['component', '--list', '--json'],
  ['hook', '--list'],
  ['hook', '--list', '--json'],
  ['build', 'settings page'],
  ['docs', 'spacing'],
  ['manifest', '--json'],
  ['template', '--list'],
  ['template', '--list', '--json'],
  ['theme', 'list'],
  ['theme', 'list', '--json'],
  ['theme', 'targets', 'Button'],
  ['theme', 'targets', 'Button', '--json'],
  ['doctor', '--json'],
];

/** @type {string[]} */
const failures = [];
/** @param {boolean} ok @param {string} message */
function check(ok, message) {
  if (!ok) failures.push(message);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
}

/** @param {string} prefix */
const tempDir = prefix =>
  fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));

/**
 * The environment every run gets: enough to find `node`, nothing that could
 * reach a package (NODE_PATH, npm_*, INIT_CWD) or change output (color, CI).
 * @param {string} home
 */
function cleanEnv(home) {
  /** @type {Record<string, string>} */
  const env = {
    PATH: process.env.PATH ?? '',
    HOME: home,
    NO_COLOR: '1',
    LANG: 'C',
  };
  for (const key of [
    'SystemRoot',
    'SYSTEMROOT',
    'TEMP',
    'TMP',
    'TMPDIR',
    'USERPROFILE',
  ]) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return env;
}

/**
 * @param {string} bin
 * @param {string[]} args
 * @param {{cwd: string, env: Record<string, string>}} opts
 */
function run(bin, args, {cwd, env}) {
  const started = performance.now();
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd,
    env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    ms: performance.now() - started,
  };
}

/**
 * Replace the install locations a run can print with stable tokens, so two
 * runs from different places compare on what they said, not where they live.
 * @param {string} text
 * @param {Array<[string, string]>} roots - [absolute path, token], longest first
 */
function normalize(text, roots) {
  let out = text;
  for (const [abs, token] of roots) out = out.split(abs).join(token);
  return out;
}

/**
 * Every file under dir with its size and mtime, for before/after comparison.
 * @param {string} dir
 */
function snapshot(dir) {
  /** @type {string[]} */
  const out = [];
  /** @param {string} current */
  const walk = current => {
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        out.push(`${path.relative(dir, full)}/`);
        walk(full);
      } else {
        const stat = fs.lstatSync(full);
        out.push(`${path.relative(dir, full)} ${stat.size} ${stat.mtimeMs}`);
      }
    }
  };
  walk(dir);
  return out.sort().join('\n');
}

/** @param {string} tarball @param {string} dest */
function extract(tarball, dest) {
  const result = spawnSync('tar', ['-xzf', tarball, '-C', dest], {
    encoding: 'utf8',
  });
  if (result.status !== 0)
    throw new Error(`tar -xzf ${tarball} failed: ${result.stderr}`);
  return path.join(dest, 'package');
}

function main() {
  const tarball = process.argv[2] && path.resolve(process.argv[2]);
  if (!tarball || !fs.existsSync(tarball)) {
    console.error(
      'Usage: node .github/scripts/cli-standalone-smoke-test.mjs <tarball>',
    );
    process.exit(2);
  }

  // Two extractions at different depths: nothing may depend on where it lands.
  const runtimeA = extract(tarball, tempDir('astryx-sa-a-'));
  const deepB = path.join(tempDir('astryx-sa-b-'), 'nested', 'deeper');
  fs.mkdirSync(deepB, {recursive: true});
  const runtimeB = extract(tarball, deepB);
  const binA = path.join(runtimeA, 'bin/astryx.mjs');
  const binB = path.join(runtimeB, 'bin/astryx.mjs');

  // ── 6. The manifest matches the tree ──────────────────────────────────
  const manifest = JSON.parse(
    fs.readFileSync(path.join(runtimeA, 'astryx-standalone.json'), 'utf8'),
  );
  const cliVersion = JSON.parse(
    fs.readFileSync(path.join(WORKSPACE_CLI, 'package.json'), 'utf8'),
  ).version;
  check(
    manifest.cli.version === cliVersion,
    `manifest CLI version ${manifest.cli.version} is the workspace CLI's ${cliVersion}`,
  );
  check(
    manifest.core.version === manifest.cli.version,
    `manifest pairs CLI ${manifest.cli.version} with Core ${manifest.core.version}`,
  );
  const drift = manifest.packages.filter(
    (/** @type {{path: string, name: string, version: string}} */ p) => {
      const file = path.join(runtimeA, p.path, 'package.json');
      if (!fs.existsSync(file)) return true;
      const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
      return pkg.name !== p.name || pkg.version !== p.version;
    },
  );
  check(
    drift.length === 0,
    `all ${manifest.packages.length} manifest packages are in the tree at their recorded versions${
      drift.length
        ? ` (drift: ${drift
            .slice(0, 3)
            .map((/** @type {{path: string}} */ p) => p.path)
            .join(', ')})`
        : ''
    }`,
  );

  // ── 1, 2, 4, 5. Parity, relocation, doctor, no writes ────────────────
  const home = tempDir('astryx-sa-home-');
  const env = cleanEnv(home);
  const cwd = tempDir('astryx-sa-cwd-');
  const before = {cwd: snapshot(cwd), runtime: snapshot(runtimeA)};

  const workspaceRoots = /** @type {Array<[string, string]>} */ ([
    [path.join(WORKSPACE_CLI, 'node_modules/@astryxdesign/core'), '<CORE>'],
    [path.join(REPO_ROOT, 'packages/core'), '<CORE>'],
    [WORKSPACE_CLI, '<CLI>'],
    [cwd, '<CWD>'],
    [home, '<HOME>'],
  ]);
  /** @param {string} runtime @returns {Array<[string, string]>} */
  const runtimeRoots = runtime => [
    [path.join(runtime, 'node_modules/@astryxdesign/core'), '<CORE>'],
    [path.join(runtime, 'node_modules/@astryxdesign/cli'), '<CLI>'],
    [cwd, '<CWD>'],
    [home, '<HOME>'],
  ];

  for (const args of PARITY_COMMANDS) {
    const label = `astryx ${args.map(a => (a.includes(' ') ? JSON.stringify(a) : a)).join(' ')}`;
    const want = run(WORKSPACE_BIN, args, {cwd, env});
    const a = run(binA, args, {cwd, env});
    const b = run(binB, args, {cwd, env});
    const same = (
      /** @type {typeof a} */ got,
      /** @type {Array<[string, string]>} */ roots,
    ) =>
      got.status === want.status &&
      normalize(got.stdout, roots) === normalize(want.stdout, workspaceRoots) &&
      normalize(got.stderr, roots) === normalize(want.stderr, workspaceRoots);
    check(
      want.status === 0 || args[0] === 'doctor',
      `${label}: the workspace CLI itself succeeds (exit ${want.status})`,
    );
    check(
      same(a, runtimeRoots(runtimeA)),
      `${label}: standalone matches the workspace CLI (${Math.round(a.ms)} ms vs ${Math.round(want.ms)} ms)`,
    );
    check(
      same(b, runtimeRoots(runtimeB)),
      `${label}: a second extraction elsewhere matches too`,
    );
    if (!same(a, runtimeRoots(runtimeA))) {
      console.log(
        `  exit ${a.status} vs ${want.status}; first differing stdout line:`,
      );
      const got = normalize(a.stdout, runtimeRoots(runtimeA)).split('\n');
      const exp = normalize(want.stdout, workspaceRoots).split('\n');
      const i = got.findIndex((line, n) => line !== exp[n]);
      console.log(
        `    standalone: ${JSON.stringify(got[i])}\n    workspace:  ${JSON.stringify(exp[i])}`,
      );
      if (a.stderr !== want.stderr)
        console.log(`    stderr: ${JSON.stringify(a.stderr.slice(0, 300))}`);
    }
  }

  const doctor = JSON.parse(run(binA, ['doctor', '--json'], {cwd, env}).stdout);
  const coreCheck = JSON.stringify(doctor).match(/"id":"core[^}]*}/)?.[0] ?? '';
  check(
    !/"status":"pass"/.test(coreCheck),
    `doctor does not report the bundled Core as installed in the project (${coreCheck.slice(0, 120) || 'no core check found'})`,
  );

  check(
    snapshot(cwd) === before.cwd,
    'read-only commands wrote nothing into the directory they ran in',
  );
  check(
    snapshot(runtimeA) === before.runtime,
    'read-only commands wrote nothing into the runtime',
  );

  // ── 3. A project's own Core wins ──────────────────────────────────────
  // A Core with no components: if the bundled Core leaked through, the list
  // would still hold Button.
  const project = tempDir('astryx-sa-project-');
  const projectCore = path.join(project, 'node_modules/@astryxdesign/core');
  fs.mkdirSync(path.join(projectCore, 'src'), {recursive: true});
  fs.writeFileSync(
    path.join(projectCore, 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version: '0.0.0-fixture'}),
  );
  const listed = run(binA, ['component', '--list', '--json'], {
    cwd: project,
    env,
  });
  check(
    listed.status === 0 && !listed.stdout.includes('"Button"'),
    `a project's own Core wins over the bundled one (exit ${listed.status}, Button ${listed.stdout.includes('"Button"') ? 'listed' : 'absent'})`,
  );
  const bundled = run(binA, ['component', '--list', '--json'], {cwd, env});
  check(
    bundled.stdout.includes('"Button"'),
    'with no project Core, the bundled Core answers (Button listed)',
  );

  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll checks passed for ${path.basename(tarball)}.`);
}

main();

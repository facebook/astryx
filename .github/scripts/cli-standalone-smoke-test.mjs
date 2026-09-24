#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Tests the standalone CLI runtime (scripts/build-cli-standalone.mjs).
 *
 * The runtime is not a copy of the CLI to compare against it. It is the
 * published `@astryxdesign/cli` and `@astryxdesign/core` packages plus their
 * locked dependencies. So this test proves exactly that, then runs the CLI's
 * own suites against it:
 *
 *   1. The packages are the published ones: the runtime's CLI and Core hold
 *      byte for byte the files of the tarballs `pnpm pack` produced for this
 *      build, and those tarballs match the integrity in the runtime manifest.
 *   2. The CLI's own smoke suites (cli-smoke-test.mjs, cli-json-smoke-test.mjs)
 *      pass, run from the extracted runtime in an empty directory with a
 *      scrubbed environment: no node_modules anywhere above it, no NODE_PATH.
 *   3. Commands that write files work: init, template, theme template, and
 *      theme build, in an empty project.
 *   4. A project's own Core wins over the bundled one, and doctor never counts
 *      the bundled Core as installed in the project.
 *   5. It runs from wherever it is extracted, and nothing it runs writes into
 *      the runtime itself.
 *   6. The manifest lists the tree.
 *
 * Usage: node .github/scripts/cli-standalone-smoke-test.mjs <runtime tarball>
 *   The build's packed packages (astryxdesign-cli-<version>.tgz and
 *   astryxdesign-core-<version>.tgz) must sit beside the runtime tarball.
 */

import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUITES = ['cli-smoke-test.mjs', 'cli-json-smoke-test.mjs'];

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
 * Enough to find `node` and nothing that could reach a package (NODE_PATH,
 * npm_*, INIT_CWD) or change output (color, CI).
 * @param {string} home
 * @param {Record<string, string>} [extra]
 */
function cleanEnv(home, extra = {}) {
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
  return {...env, ...extra};
}

/**
 * @param {string[]} argv - Arguments to node.
 * @param {{cwd: string, env: Record<string, string>, stdio?: 'pipe' | 'inherit'}} opts
 */
function node(argv, {cwd, env, stdio = 'pipe'}) {
  const result = spawnSync(process.execPath, argv, {
    cwd,
    env,
    encoding: 'utf8',
    stdio: ['ignore', stdio, stdio],
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

/** @param {string} tarball @param {string} dest */
function extract(tarball, dest) {
  fs.mkdirSync(dest, {recursive: true});
  const result = spawnSync('tar', ['-xzf', tarball, '-C', dest], {
    encoding: 'utf8',
  });
  if (result.status !== 0)
    throw new Error(`tar -xzf ${tarball} failed: ${result.stderr}`);
  return path.join(dest, 'package');
}

/**
 * Every file under dir, as relative path -> sha256.
 * @param {string} dir
 * @returns {Map<string, string>}
 */
function hashTree(dir) {
  /** @type {Map<string, string>} */
  const out = new Map();
  /** @param {string} current */
  const walk = current => {
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else
        out.set(
          path.relative(dir, full).split(path.sep).join('/'),
          createHash('sha256').update(fs.readFileSync(full)).digest('hex'),
        );
    }
  };
  walk(dir);
  return out;
}

/**
 * Every file under dir with its size and mtime, for a before/after check.
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

/**
 * The runtime's package dir holds exactly the packed package's files.
 * @param {string} packed - `pnpm pack` tarball
 * @param {string} installed - the package's directory inside the runtime
 */
function samePackage(packed, installed) {
  const want = hashTree(extract(packed, tempDir('astryx-sa-packed-')));
  const got = hashTree(installed);
  got.delete('node_modules'); // never a file, but be explicit about scope
  for (const file of [...got.keys()]) {
    if (file.startsWith('node_modules/')) got.delete(file);
  }
  const missing = [...want.keys()].filter(f => !got.has(f));
  const extra = [...got.keys()].filter(f => !want.has(f));
  const changed = [...want.keys()].filter(
    f => got.has(f) && got.get(f) !== want.get(f),
  );
  return {count: want.size, missing, extra, changed};
}

function main() {
  const tarball = process.argv[2] && path.resolve(process.argv[2]);
  if (!tarball || !fs.existsSync(tarball)) {
    console.error(
      'Usage: node .github/scripts/cli-standalone-smoke-test.mjs <runtime tarball>',
    );
    process.exit(2);
  }

  const runtime = extract(tarball, tempDir('astryx-sa-a-'));
  const bin = path.join(runtime, 'bin/astryx.mjs');
  const manifest = JSON.parse(
    fs.readFileSync(path.join(runtime, 'astryx-standalone.json'), 'utf8'),
  );
  const before = snapshot(runtime);
  const home = tempDir('astryx-sa-home-');
  const env = cleanEnv(home);

  // ── 1. The packages are the published ones ────────────────────────────
  for (const [key, dir] of [
    ['cli', 'node_modules/@astryxdesign/cli'],
    ['core', 'node_modules/@astryxdesign/core'],
  ]) {
    const {name, version, integrity} = manifest[key];
    const packed = path.join(
      path.dirname(tarball),
      `${name.slice(1).replace('/', '-')}-${version}.tgz`,
    );
    if (!fs.existsSync(packed)) {
      check(
        false,
        `${name}: the packed tarball ${path.basename(packed)} sits beside the runtime`,
      );
      continue;
    }
    const actual = `sha512-${createHash('sha512').update(fs.readFileSync(packed)).digest('base64')}`;
    check(
      actual === integrity,
      `${name}@${version}: the packed tarball matches the manifest's integrity`,
    );
    const diff = samePackage(packed, path.join(runtime, dir));
    const ok =
      !diff.missing.length && !diff.extra.length && !diff.changed.length;
    check(
      ok,
      `${name}@${version}: the runtime holds all ${diff.count} published files, byte for byte${ok ? '' : ` (missing ${diff.missing.slice(0, 3).join(', ')}; extra ${diff.extra.slice(0, 3).join(', ')}; changed ${diff.changed.slice(0, 3).join(', ')})`}`,
    );
  }

  // ── 2. The CLI's own suites, run from the runtime ─────────────────────
  const empty = tempDir('astryx-sa-cwd-');
  for (const suite of SUITES) {
    console.log(`\n── ${suite} against the runtime ──`);
    const started = performance.now();
    const result = node([path.join(HERE, suite), '--bin', bin, '--cwd', empty], {
      cwd: empty,
      env,
      stdio: 'inherit',
    });
    check(
      result.status === 0,
      `${suite} passes against the runtime (${Math.round((performance.now() - started) / 1000)} s)`,
    );
  }
  console.log('');

  // ── 3. Commands that write files ──────────────────────────────────────
  const project = tempDir('astryx-sa-project-');
  fs.writeFileSync(
    path.join(project, 'package.json'),
    '{"name":"standalone-check","private":true}\n',
  );
  const astryx = (/** @type {string[]} */ ...args) =>
    node([bin, ...args], {cwd: project, env});
  const init = astryx('init', '--features', 'agents');
  check(
    init.status === 0 && fs.existsSync(path.join(project, 'AGENTS.md')),
    `astryx init --features agents writes AGENTS.md (exit ${init.status})`,
  );
  const blocks =
    JSON.parse(
      astryx('template', '--list', '--type', 'block', '--json').stdout || '{}',
    ).data ?? [];
  const block = Array.isArray(blocks) ? blocks[0]?.id : undefined;
  const template = block
    ? astryx('template', block, 'src/blocks')
    : {status: null, stdout: '', stderr: 'no block template listed'};
  const written = fs.existsSync(path.join(project, 'src/blocks'))
    ? fs.readdirSync(path.join(project, 'src/blocks'), {recursive: true}).length
    : 0;
  check(
    template.status === 0 && written > 0,
    `astryx template ${block ?? '<none>'} src/blocks writes files (exit ${template.status}, ${written} entries)`,
  );
  const themeTemplate = astryx('theme', 'template', 'theme.ts');
  check(
    themeTemplate.status === 0 && fs.existsSync(path.join(project, 'theme.ts')),
    `astryx theme template theme.ts writes the theme source (exit ${themeTemplate.status})`,
  );
  const themeBuild = astryx('theme', 'build', 'theme.ts');
  const css = fs.readdirSync(project).filter(f => f.endsWith('.css'));
  check(
    themeBuild.status === 0 && css.length > 0,
    `astryx theme build theme.ts compiles CSS (exit ${themeBuild.status}, ${css.join(', ') || 'no css'})`,
  );

  // ── 4. A project's own Core wins; doctor sees only the project ───────
  // A Core with no components: if the bundled Core leaked through, the list
  // would still hold Button.
  const withCore = tempDir('astryx-sa-own-core-');
  const ownCore = path.join(withCore, 'node_modules/@astryxdesign/core');
  fs.mkdirSync(path.join(ownCore, 'src'), {recursive: true});
  fs.writeFileSync(
    path.join(ownCore, 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version: '0.0.0-fixture'}),
  );
  const listed = node([bin, 'component', '--list', '--json'], {
    cwd: withCore,
    env,
  });
  check(
    listed.status === 0 && !listed.stdout.includes('"Button"'),
    `a project's own Core wins over the bundled one (exit ${listed.status}, Button ${listed.stdout.includes('"Button"') ? 'listed' : 'absent'})`,
  );
  const doctor = JSON.parse(
    node([bin, 'doctor', '--json'], {cwd: empty, env}).stdout || '{}',
  );
  const coreCheck = doctor.data?.checks?.find(
    (/** @type {{id: string}} */ c) => c.id === 'core-installed',
  );
  check(
    coreCheck?.status === 'fail',
    `doctor does not count the bundled Core as installed in the project (core-installed: ${coreCheck?.status ?? 'missing'})`,
  );

  // ── 5. Relocatable, and nothing writes into the runtime ──────────────
  const deep = path.join(tempDir('astryx-sa-b-'), 'nested', 'deeper');
  const elsewhere = extract(tarball, deep);
  const here = node([bin, 'component', 'Button', '--json'], {cwd: empty, env});
  const there = node(
    [path.join(elsewhere, 'bin/astryx.mjs'), 'component', 'Button', '--json'],
    {cwd: empty, env},
  );
  check(
    here.status === 0 && there.status === 0 && here.stdout === there.stdout,
    'a second extraction at another depth answers the same',
  );
  check(
    snapshot(runtime) === before,
    'nothing written into the runtime by any command above',
  );

  // ── 6. The manifest lists the tree ────────────────────────────────────
  const drift = manifest.packages.filter(
    (/** @type {{path: string, name: string, version: string}} */ p) => {
      const file = path.join(runtime, p.path, 'package.json');
      if (!fs.existsSync(file)) return true;
      const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
      return pkg.name !== p.name || pkg.version !== p.version;
    },
  );
  check(
    drift.length === 0,
    `all ${manifest.packages.length} manifest packages are in the tree at their recorded versions`,
  );

  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll checks passed for ${path.basename(tarball)}.`);
}

main();

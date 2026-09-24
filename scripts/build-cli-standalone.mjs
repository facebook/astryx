#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Build the standalone Astryx CLI runtime.
 *
 * The runtime is `@astryxdesign/cli`, its production dependencies, and the
 * matching `@astryxdesign/core`, laid out as an installed `node_modules` tree
 * and packed into one npm tarball. A consumer extracts it and runs
 * `node package/bin/astryx.mjs`: no package manager, no registry, no install
 * step. Catalog commands (component, search, build, docs, template, hook) answer
 * from the bundled Core whenever the project has no Core of its own.
 *
 * Every third-party version comes from this repo's pnpm-lock.yaml through
 * `pnpm deploy`, never from a fresh resolution, and the CLI and Core trees hold
 * exactly the files `pnpm publish` ships. Deliberately not a JS bundle: the CLI
 * picks command modules, parsers and integration configs at runtime (computed
 * dynamic imports, Jiti, a worker, 1,600+ data files), which bundling breaks.
 *
 * Needs a workspace install and a built Core (`pnpm build`).
 *
 * Usage: node scripts/build-cli-standalone.mjs [--out-dir <dir>] [-- <pnpm args>]
 *   Default out dir: .astryx-standalone/ (gitignored). Writes
 *   astryxdesign-cli-standalone-<version>.tgz plus a .sha256 beside it, keeps
 *   the unpacked tree in cli-standalone/, and prints a JSON summary. Arguments
 *   after `--` go to both `pnpm deploy` runs (e.g. registry or proxy config).
 */

import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parseArgs} from 'node:util';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

export const RUNTIME_NAME = '@astryxdesign/cli-standalone';
export const MANIFEST_FILE = 'astryx-standalone.json';
export const ENTRY = 'bin/astryx.mjs';
const CLI = '@astryxdesign/cli';
const CORE = '@astryxdesign/core';

/** What `pnpm deploy` leaves beside a deployed package that is not package content. */
const DEPLOY_ONLY_ENTRIES = new Set([
  'node_modules',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
]);

/** @param {string} file */
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

/** @param {string} file */
const sha256File = file =>
  createHash('sha256').update(fs.readFileSync(file)).digest('hex');

/**
 * The runtime's own package.json. `bundleDependencies` tells npm the whole
 * node_modules tree ships inside the tarball, and `private` keeps it off the
 * registry until publishing is wired up on purpose.
 *
 * @param {{version: string, node: string}} opts
 */
export function runtimePackageJson({version, node}) {
  return {
    name: RUNTIME_NAME,
    version,
    private: true,
    description:
      'The Astryx CLI with its dependencies and the matching @astryxdesign/core bundled in. Extract it and run bin/astryx.mjs with Node; nothing to install.',
    license: 'MIT',
    homepage: 'https://github.com/facebook/astryx#readme',
    repository: {
      type: 'git',
      url: 'git+https://github.com/facebook/astryx.git',
    },
    type: 'module',
    engines: {node},
    bin: {astryx: ENTRY},
    dependencies: {[CLI]: version, [CORE]: version},
    bundleDependencies: [CLI, CORE],
  };
}

/**
 * The runtime's entry point. It imports the bundled CLI's own bin, so the CLI's
 * Node version gate still runs first and argv reaches it unchanged.
 */
export function launcherSource() {
  return [
    '#!/usr/bin/env node',
    '// Copyright (c) Meta Platforms, Inc. and affiliates.',
    '',
    `// Runs the @astryxdesign/cli bundled beside this file. See ../${MANIFEST_FILE}.`,
    `import '../node_modules/${CLI}/clients/cli/bin/astryx.mjs';`,
    '',
  ].join('\n');
}

/**
 * Every package in a node_modules tree, nested trees included, sorted by path.
 * This is the runtime's bill of materials.
 *
 * @param {string} root - Directory holding the top-level node_modules.
 * @returns {Array<{name: string, version: string, license: string|null, path: string}>}
 */
export function inventory(root) {
  /** @type {Array<{name: string, version: string, license: string|null, path: string}>} */
  const out = [];
  /** @param {string} nodeModules */
  const walk = nodeModules => {
    if (!fs.existsSync(nodeModules)) return;
    for (const entry of fs.readdirSync(nodeModules).sort()) {
      if (entry.startsWith('.')) continue;
      const dir = path.join(nodeModules, entry);
      if (entry.startsWith('@')) {
        for (const scoped of fs.readdirSync(dir).sort())
          visit(path.join(dir, scoped));
      } else {
        visit(dir);
      }
    }
  };
  /** @param {string} dir */
  const visit = dir => {
    const manifest = path.join(dir, 'package.json');
    if (!fs.existsSync(manifest)) return;
    const pkg = readJson(manifest);
    out.push({
      name: pkg.name,
      version: pkg.version,
      license: licenseOf(pkg),
      path: path.relative(root, dir).split(path.sep).join('/'),
    });
    walk(path.join(dir, 'node_modules'));
  };
  walk(path.join(root, 'node_modules'));
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * @param {{license?: unknown, licenses?: unknown}} pkg
 * @returns {string|null}
 */
function licenseOf(pkg) {
  if (typeof pkg.license === 'string') return pkg.license;
  if (pkg.license && typeof pkg.license === 'object' && 'type' in pkg.license) {
    return String(/** @type {{type: unknown}} */ (pkg.license).type);
  }
  if (Array.isArray(pkg.licenses)) {
    return (
      pkg.licenses
        .map(l => (typeof l === 'string' ? l : l?.type))
        .filter(Boolean)
        .join(' OR ') || null
    );
  }
  return null;
}

/**
 * Remove every `.bin` directory. They hold symlinks (or Windows shims) to
 * dependency executables that the CLI never spawns, and a symlink would make
 * the tree depend on how it is extracted.
 *
 * @param {string} dir
 */
export function removeBinDirs(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name === '.bin') fs.rmSync(full, {recursive: true, force: true});
    else removeBinDirs(full);
  }
}

/**
 * @param {string} dir
 * @returns {string[]} symlinks under dir, relative to it
 */
export function findSymlinks(dir) {
  /** @type {string[]} */
  const out = [];
  /** @param {string} current */
  const walk = current => {
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) out.push(path.relative(dir, full));
      else if (entry.isDirectory()) walk(full);
    }
  };
  walk(dir);
  return out;
}

/**
 * Move a deployed package's own files into `dest`, leaving deploy leftovers.
 *
 * @param {string} deployDir
 * @param {string} dest
 */
function movePackageFiles(deployDir, dest) {
  fs.mkdirSync(dest, {recursive: true});
  for (const entry of fs.readdirSync(deployDir)) {
    if (DEPLOY_ONLY_ENTRIES.has(entry)) continue;
    fs.renameSync(path.join(deployDir, entry), path.join(dest, entry));
  }
}

/**
 * Move a deployed package's dependency tree into `dest`, leaving pnpm's own
 * bookkeeping (`.pnpm`, `.modules.yaml`, ...), which all starts with a dot.
 *
 * @param {string} deployDir
 * @param {string} dest
 */
function moveDependencies(deployDir, dest) {
  const nodeModules = path.join(deployDir, 'node_modules');
  if (!fs.existsSync(nodeModules)) return;
  fs.mkdirSync(dest, {recursive: true});
  for (const entry of fs.readdirSync(nodeModules)) {
    if (entry.startsWith('.')) continue;
    const target = path.join(dest, entry);
    if (fs.existsSync(target)) throw new Error(`${target} already exists`);
    fs.renameSync(path.join(nodeModules, entry), target);
  }
}

/**
 * @param {string} name
 * @param {string} target
 * @param {string[]} extraArgs
 */
function deploy(name, target, extraArgs) {
  const args = [
    `--filter=${name}`,
    'deploy',
    '--prod',
    '--ignore-scripts',
    // Workspace-wide this stays off; the deployed closures here hold no
    // workspace packages, so it only unlocks the lockfile-driven deploy.
    '--config.inject-workspace-packages=true',
    '--config.node-linker=hoisted',
    ...extraArgs,
    target,
  ];
  const result = spawnSync('pnpm', args, {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error(
      `pnpm ${args.join(' ')} failed (${result.signal ?? `exit ${result.status}`})`,
    );
  }
}

/** The fixed timestamp `npm pack` stamps on every entry: 1985-10-26T08:15:00Z. */
const TAR_MTIME = 499162500;

/**
 * Pack `root` into an npm-style tarball: every file under `package/`, sorted,
 * with a fixed timestamp and owner, so the same tree always packs to the same
 * bytes. Written by hand because `npm pack` died on this ~9,500-file bundled
 * tree in CI ("Exit handler never called"); plain ustar needs only zlib.
 *
 * @param {string} root
 * @param {string} outFile
 * @returns {{files: number, size: number, unpackedSize: number, integrity: string}}
 */
export function packTree(root, outFile) {
  /** @type {string[]} */
  const files = [];
  /** @param {string} dir */
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(full);
      else throw new Error(`cannot pack ${full}: not a regular file`);
    }
  };
  walk(root);
  const names = files.map(file =>
    ['package', ...path.relative(root, file).split(path.sep)].join('/'),
  );
  const order = names
    .map((_, i) => i)
    .sort((a, b) => (names[a] < names[b] ? -1 : names[a] > names[b] ? 1 : 0));

  /** @type {Buffer[]} */
  const chunks = [];
  let unpackedSize = 0;
  for (const i of order) {
    const data = fs.readFileSync(files[i]);
    const executable = (fs.statSync(files[i]).mode & 0o111) !== 0;
    chunks.push(
      tarHeader(names[i], data.length, executable ? 0o755 : 0o644),
      data,
    );
    const pad = (512 - (data.length % 512)) % 512;
    if (pad > 0) chunks.push(Buffer.alloc(pad));
    unpackedSize += data.length;
  }
  chunks.push(Buffer.alloc(1024));
  const gz = zlib.gzipSync(Buffer.concat(chunks), {level: 9});
  fs.writeFileSync(outFile, gz);
  return {
    files: files.length,
    size: gz.length,
    unpackedSize,
    integrity: `sha512-${createHash('sha512').update(gz).digest('base64')}`,
  };
}

/**
 * One ustar header block. Names over 100 bytes split at a `/` into the
 * 155-byte prefix field; anything longer fails loudly rather than truncating.
 *
 * @param {string} name
 * @param {number} size
 * @param {number} mode
 */
function tarHeader(name, size, mode) {
  let prefix = '';
  let base = name;
  if (Buffer.byteLength(name) > 100) {
    const at = [...name.matchAll(/\//g)]
      .map(m => m.index ?? 0)
      .find(
        i =>
          Buffer.byteLength(name.slice(0, i)) <= 155 &&
          Buffer.byteLength(name.slice(i + 1)) <= 100,
      );
    if (at === undefined)
      throw new Error(`path too long for a tar header: ${name}`);
    prefix = name.slice(0, at);
    base = name.slice(at + 1);
  }
  const header = Buffer.alloc(512);
  /** @param {string} value @param {number} offset @param {number} length */
  const put = (value, offset, length) =>
    header.write(value, offset, length, 'utf8');
  /** @param {number} value @param {number} offset @param {number} length */
  const octal = (value, offset, length) =>
    put(`${value.toString(8).padStart(length - 1, '0')}\0`, offset, length);
  put(base, 0, 100);
  octal(mode, 100, 8);
  octal(0, 108, 8);
  octal(0, 116, 8);
  octal(size, 124, 12);
  octal(TAR_MTIME, 136, 12);
  put('        ', 148, 8);
  put('0', 156, 1);
  put('ustar\0', 257, 6);
  put('00', 263, 2);
  put(prefix, 345, 155);
  let sum = 0;
  for (const byte of header) sum += byte;
  put(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 8);
  return header;
}

/** @returns {string|null} */
function sourceCommit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  const result = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

/**
 * @param {{outDir: string, pnpmArgs?: string[]}} opts
 */
export function buildStandalone({outDir, pnpmArgs = []}) {
  const cliPkg = readJson(path.join(REPO_ROOT, 'packages/cli/package.json'));
  const corePkg = readJson(path.join(REPO_ROOT, 'packages/core/package.json'));
  // Core and the CLI release as one fixed changeset group, and the runtime's
  // promise is a release-matched Core. Refuse to pair two different versions.
  if (cliPkg.version !== corePkg.version) {
    throw new Error(
      `${CLI}@${cliPkg.version} and ${CORE}@${corePkg.version} differ`,
    );
  }
  if (!fs.existsSync(path.join(REPO_ROOT, 'packages/core/dist/index.js'))) {
    throw new Error(
      `${CORE} is not built (no packages/core/dist); run \`pnpm build\` first`,
    );
  }
  const version = cliPkg.version;

  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-standalone-'));
  const root = path.join(outDir, 'cli-standalone');
  try {
    deploy(CLI, path.join(staging, 'cli'), pnpmArgs);
    deploy(CORE, path.join(staging, 'core'), pnpmArgs);

    fs.rmSync(root, {recursive: true, force: true});
    const nodeModules = path.join(root, 'node_modules');
    // The CLI's dependencies go at the top level, beside the CLI, exactly
    // where an install puts them. Core keeps its own tree nested under it, so
    // a version it needs can never shadow one the CLI needs.
    moveDependencies(path.join(staging, 'cli'), nodeModules);
    movePackageFiles(path.join(staging, 'cli'), path.join(nodeModules, CLI));
    movePackageFiles(path.join(staging, 'core'), path.join(nodeModules, CORE));
    moveDependencies(
      path.join(staging, 'core'),
      path.join(nodeModules, CORE, 'node_modules'),
    );
  } finally {
    fs.rmSync(staging, {recursive: true, force: true});
  }

  removeBinDirs(root);
  const symlinks = findSymlinks(root);
  if (symlinks.length > 0) {
    throw new Error(
      `the runtime must hold no symlinks; found ${symlinks.slice(0, 5).join(', ')}`,
    );
  }

  const packages = inventory(root);
  for (const [name, dir] of [
    [CLI, `node_modules/${CLI}`],
    [CORE, `node_modules/${CORE}`],
  ]) {
    const found = packages.find(p => p.path === dir);
    if (found?.name !== name || found.version !== version) {
      throw new Error(
        `expected ${name}@${version} at ${dir}, found ${found ? `${found.name}@${found.version}` : 'nothing'}`,
      );
    }
  }

  fs.mkdirSync(path.join(root, path.dirname(ENTRY)), {recursive: true});
  fs.writeFileSync(path.join(root, ENTRY), launcherSource(), {mode: 0o755});
  fs.writeFileSync(
    path.join(root, 'package.json'),
    `${JSON.stringify(runtimePackageJson({version, node: cliPkg.engines.node}), null, 2)}\n`,
  );
  fs.copyFileSync(path.join(REPO_ROOT, 'LICENSE'), path.join(root, 'LICENSE'));
  const manifest = {
    schemaVersion: 1,
    name: RUNTIME_NAME,
    version,
    entry: ENTRY,
    node: cliPkg.engines.node,
    cli: {name: CLI, version},
    core: {name: CORE, version},
    source: {
      repository: 'https://github.com/facebook/astryx',
      commit: sourceCommit(),
    },
    lockfileSha256: sha256File(path.join(REPO_ROOT, 'pnpm-lock.yaml')),
    packages,
  };
  fs.writeFileSync(
    path.join(root, MANIFEST_FILE),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const tarballName = `astryxdesign-cli-standalone-${version}.tgz`;
  const tarball = path.join(outDir, tarballName);
  const packed = packTree(root, tarball);
  const sha256 = sha256File(tarball);
  fs.writeFileSync(`${tarball}.sha256`, `${sha256}  ${tarballName}\n`);

  return {
    tarball,
    sha256,
    integrity: packed.integrity,
    size: packed.size,
    unpackedSize: packed.unpackedSize,
    files: packed.files,
    packages: packages.length,
    cli: version,
    core: version,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const {values, positionals} = parseArgs({
    options: {'out-dir': {type: 'string'}},
    allowPositionals: true,
  });
  const outDir = path.resolve(
    values['out-dir'] ?? path.join(REPO_ROOT, '.astryx-standalone'),
  );
  fs.mkdirSync(outDir, {recursive: true});
  try {
    console.log(
      JSON.stringify(buildStandalone({outDir, pnpmArgs: positionals}), null, 2),
    );
  } catch (err) {
    console.error(
      `build-cli-standalone: ${/** @type {Error} */ (err).message}`,
    );
    process.exit(1);
  }
}

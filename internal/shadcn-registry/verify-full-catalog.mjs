#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file verify-full-catalog.mjs
 * @description Installs every generated Astryx registry item through the pinned
 *   ShadCN client, verifies exact written bytes and dependencies, then compiles
 *   every installed source file against the current Astryx package exports.
 * @input A generated canary registry under apps/docsite/public/shadcn.
 * @output A clean-consumer proof for every canonical item and alias route.
 * @position Required CI contract for the public ShadCN compatibility surface.
 */

import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import {createRequire} from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

import {build} from 'esbuild';

import {parseRegistryReceipt} from '../../packages/cli/authoring/shadcn/receipt.mjs';
import {expandWorkspaceDirs} from '../../scripts/lib/workspace-globs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_DIR = path.join(
  REPO_ROOT,
  'apps',
  'docsite',
  'public',
  'shadcn',
);
const docsiteRequire = createRequire(
  path.join(REPO_ROOT, 'apps', 'docsite', 'package.json'),
);
const SHADCN_BIN = docsiteRequire.resolve('shadcn');
const KEEP_TEMP = process.env.ASTRYX_KEEP_SHADCN_MATRIX === '1';
const MAX_COMMAND_OUTPUT = 16 * 1024 * 1024;
const COPIED_KINDS = new Set(['showcase', 'example', 'block', 'page']);

function fail(message) {
  throw new Error(`ShadCN registry CI: ${message}`);
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolveInside(root, relative, label) {
  if (typeof relative !== 'string' || path.isAbsolute(relative)) {
    fail(`${label} is not a safe relative path: ${String(relative)}`);
  }
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relative);
  if (
    resolved !== resolvedRoot &&
    !resolved.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    fail(`${label} escapes its root: ${relative}`);
  }
  return resolved;
}

function packageName(spec) {
  if (spec.startsWith('@')) {
    const slash = spec.indexOf('/');
    const version = spec.indexOf('@', slash);
    return version === -1 ? spec : spec.slice(0, version);
  }
  const version = spec.indexOf('@');
  return version === -1 ? spec : spec.slice(0, version);
}

function localPackageDirs() {
  const result = new Map();
  for (const directory of expandWorkspaceDirs(REPO_ROOT)) {
    const manifestPath = path.join(directory, 'package.json');
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = readJSON(manifestPath);
    if (typeof manifest.name === 'string') {
      result.set(manifest.name, directory);
    }
  }
  return result;
}

function verifyItemFileShape(item) {
  const receipts = item.files.filter(
    file => file.type === 'registry:file' && file.target.includes('/.astryx/'),
  );
  const sources = item.files.filter(file => !receipts.includes(file));
  const kind = item.astryx?.kind;

  if (COPIED_KINDS.has(kind)) {
    if (
      sources.length !== 1 ||
      receipts.length !== 1 ||
      item.files.length !== 2
    ) {
      fail(`${item.name} must contain exactly one source and one receipt`);
    }
    const source = sources[0];
    const receiptFile = receipts[0];
    const expectedReceiptTarget = path.posix.join(
      path.posix.dirname(source.target),
      '.astryx',
      `${item.name}.json`,
    );
    if (receiptFile.target !== expectedReceiptTarget) {
      fail(`${item.name} receipt is not adjacent to its source`);
    }

    let receipt;
    try {
      receipt = parseRegistryReceipt(JSON.parse(receiptFile.content));
    } catch (error) {
      fail(`${item.name} has an invalid receipt: ${error.message}`);
    }
    if (
      receipt.item.name !== item.name ||
      receipt.item.path !== item.astryx.path ||
      receipt.item.kind !== kind ||
      receipt.files.length !== 1 ||
      receipt.files[0].registryPath !== source.path ||
      receipt.files[0].registryTarget !== source.target ||
      receipt.files[0].content !== source.content
    ) {
      fail(`${item.name} receipt does not describe its installed source`);
    }
    return;
  }

  if (
    (kind === 'component' || kind === 'hook') &&
    sources.length === 1 &&
    receipts.length === 0 &&
    item.files.length === 1
  ) {
    return;
  }

  fail(`${item.name} has an unsupported ${String(kind)} file shape`);
}

function loadCatalog() {
  const indexPath = path.join(REGISTRY_DIR, 'registry.json');
  if (!fs.existsSync(indexPath)) {
    fail(
      `missing ${path.relative(REPO_ROOT, indexPath)}; generate the canary docsite data first`,
    );
  }

  const index = readJSON(indexPath);
  if (!Array.isArray(index.items) || index.items.length === 0) {
    fail('registry.json contains no items');
  }

  const names = new Map();
  const routes = new Map();
  const targets = new Map();
  const items = [];

  for (const summary of index.items) {
    const name = summary.name;
    const registryPath = summary.astryx?.path;
    if (typeof name !== 'string' || typeof registryPath !== 'string') {
      fail('registry.json contains an item without a stable name and path');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      fail(`item name is not safe: ${name}`);
    }
    if (names.has(name)) {
      fail(`duplicate item name ${name}`);
    }
    names.set(name, registryPath);

    const canonicalFile = resolveInside(
      REGISTRY_DIR,
      `${registryPath}.json`,
      `${name} canonical route`,
    );
    if (!fs.existsSync(canonicalFile)) {
      fail(`${name} is missing canonical route ${registryPath}.json`);
    }
    const canonicalBytes = fs.readFileSync(canonicalFile, 'utf8');
    const item = JSON.parse(canonicalBytes);
    if (item.name !== name || item.astryx?.path !== registryPath) {
      fail(`${registryPath}.json does not match its registry.json identity`);
    }

    for (const route of [registryPath, ...(item.astryx?.aliases ?? [])]) {
      const prior = routes.get(route);
      if (prior != null) {
        fail(`route ${route}.json is claimed by both ${prior} and ${name}`);
      }
      routes.set(route, name);
      const routeFile = resolveInside(
        REGISTRY_DIR,
        `${route}.json`,
        `${name} route`,
      );
      if (!fs.existsSync(routeFile)) {
        fail(`${name} is missing route ${route}.json`);
      }
      if (fs.readFileSync(routeFile, 'utf8') !== canonicalBytes) {
        fail(`alias route ${route}.json drifted from canonical item ${name}`);
      }
    }

    if (!Array.isArray(item.files) || item.files.length === 0) {
      fail(`${name} has no installable files`);
    }
    for (const file of item.files) {
      if (typeof file.target !== 'string' || typeof file.content !== 'string') {
        fail(`${name} has a file without a target and content`);
      }
      resolveInside('/registry-source', file.path, `${name} source path`);
      resolveInside('/consumer', file.target, `${name} target`);
      const prior = targets.get(file.target);
      if (prior != null) {
        fail(`target ${file.target} is written by both ${prior} and ${name}`);
      }
      targets.set(file.target, name);
    }
    verifyItemFileShape(item);
    items.push(item);
  }

  return {items, routeCount: routes.size, targetCount: targets.size};
}

function writeConsumer(project, items, packageDirs) {
  const rootManifest = readJSON(path.join(REPO_ROOT, 'package.json'));
  const itemDirectory = path.join(project, 'items');
  fs.mkdirSync(path.join(project, 'src'), {recursive: true});
  fs.mkdirSync(itemDirectory, {recursive: true});

  fs.writeFileSync(
    path.join(project, 'package.json'),
    `${JSON.stringify(
      {
        name: 'astryx-shadcn-registry-ci',
        private: true,
        version: '0.0.0',
        packageManager: rootManifest.packageManager,
        dependencies: {
          react: rootManifest.devDependencies.react,
          'react-dom': rootManifest.devDependencies['react-dom'],
        },
      },
      null,
      2,
    )}\n`,
  );
  // Every dependency is pinned by generated registry data. The consumer is
  // ephemeral, and local Astryx packages need their checked-in install hooks.
  fs.writeFileSync(
    path.join(project, 'pnpm-workspace.yaml'),
    'packages: []\ndangerouslyAllowAllBuilds: true\n',
  );
  fs.writeFileSync(
    path.join(project, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          baseUrl: '.',
          jsx: 'react-jsx',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          paths: {'@/*': ['./src/*']},
          target: 'ES2022',
        },
        include: ['src'],
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(project, 'components.json'),
    `${JSON.stringify(
      {
        $schema: 'https://ui.shadcn.com/schema.json',
        style: 'nova',
        rsc: false,
        tsx: true,
        tailwind: {
          config: '',
          css: 'src/index.css',
          baseColor: '',
          cssVariables: true,
          prefix: '',
        },
        aliases: {
          components: '@/components',
          hooks: '@/hooks',
          lib: '@/lib',
          ui: '@/components/ui',
          utils: '@/lib/utils',
        },
        iconLibrary: 'lucide',
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(path.join(project, 'src', 'index.css'), '');

  const itemPaths = [];
  const dependencyNames = new Set();
  for (const item of items) {
    const installItem = structuredClone(item);
    installItem.dependencies = (installItem.dependencies ?? []).map(spec => {
      const name = packageName(spec);
      dependencyNames.add(name);
      if (!name.startsWith('@astryxdesign/')) return spec;
      const directory = packageDirs.get(name);
      if (directory == null) {
        fail(`${item.name} depends on unresolved workspace package ${name}`);
      }
      return `${name}@file:${directory}`;
    });
    const itemPath = resolveInside(
      itemDirectory,
      `${item.name}.json`,
      `${item.name} temporary item`,
    );
    fs.writeFileSync(itemPath, JSON.stringify(installItem));
    itemPaths.push(itemPath);
  }

  return {dependencyNames, itemPaths};
}

function runShadcn(project, itemPaths) {
  if (!fs.existsSync(SHADCN_BIN)) {
    fail('the pinned ShadCN binary is not installed');
  }
  const result = spawnSync(
    SHADCN_BIN,
    ['add', ...itemPaths, '--yes', '--overwrite', '--silent'],
    {
      cwd: project,
      encoding: 'utf8',
      env: {...process.env, CI: 'true'},
      maxBuffer: MAX_COMMAND_OUTPUT,
      timeout: 10 * 60_000,
    },
  );
  if (result.error != null) {
    fail(`could not run the pinned ShadCN client: ${result.error.message}`);
  }
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    fail(`pinned ShadCN exited ${result.status}`);
  }
}

function verifyInstall(project, items, dependencyNames) {
  const sources = [];
  let installedFiles = 0;

  for (const item of items) {
    for (const file of item.files) {
      const installed = resolveInside(
        path.join(project, 'src'),
        file.target,
        `${item.name} installed target`,
      );
      if (!fs.existsSync(installed)) {
        fail(`${item.name} did not install ${file.target}`);
      }
      const actual = fs.readFileSync(installed, 'utf8');
      if (actual !== file.content) {
        fail(
          `${item.name} installed different bytes at ${file.target}; generated content must match stock ShadCN output`,
        );
      }
      installedFiles += 1;
      if (!file.target.includes('/.astryx/')) {
        sources.push(installed);
      }
    }
  }

  const manifest = readJSON(path.join(project, 'package.json'));
  const installedDependencies = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ]);
  for (const dependency of dependencyNames) {
    if (!installedDependencies.has(dependency)) {
      fail(`pinned ShadCN did not install declared dependency ${dependency}`);
    }
  }

  const css = fs.readFileSync(path.join(project, 'src', 'index.css'), 'utf8');
  for (const specifier of [
    '@astryxdesign/core/reset.css',
    '@astryxdesign/core/astryx.css',
  ]) {
    if (!css.includes(specifier)) {
      fail(`pinned ShadCN did not install required CSS import ${specifier}`);
    }
  }

  return {installedFiles, sources};
}

async function compileSources(project, sources) {
  await build({
    absWorkingDir: project,
    bundle: true,
    entryPoints: sources,
    format: 'esm',
    jsx: 'automatic',
    logLevel: 'warning',
    outdir: path.join(project, 'dist'),
    platform: 'browser',
    splitting: true,
    target: 'es2022',
  });
}

async function main() {
  const startedAt = Date.now();
  const catalog = loadCatalog();
  const packageDirs = localPackageDirs();
  const project = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-shadcn-registry-ci-'),
  );

  try {
    const {dependencyNames, itemPaths} = writeConsumer(
      project,
      catalog.items,
      packageDirs,
    );
    runShadcn(project, itemPaths);
    const {installedFiles, sources} = verifyInstall(
      project,
      catalog.items,
      dependencyNames,
    );
    await compileSources(project, sources);

    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(
      `Verified ${catalog.items.length} items, ${catalog.routeCount} routes, ` +
        `${installedFiles} installed files, and ${sources.length} compiled sources in ${seconds}s.`,
    );
  } finally {
    if (KEEP_TEMP) {
      console.log(`Kept clean consumer at ${project}`);
    } else {
      fs.rmSync(project, {recursive: true, force: true});
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * Promote staged codemods from transforms/next into the just-bumped release
 * version folder. Run after `changeset version`, when package.json contains
 * the actual version this release will publish.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const README = 'README.md';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeText(file, text) {
  fs.writeFileSync(file, text.endsWith('\n') ? text : `${text}\n`);
}

function listPromotableEntries(nextDir) {
  if (!fs.existsSync(nextDir)) return [];
  return fs.readdirSync(nextDir, {withFileTypes: true}).filter(entry => {
    if (entry.name === README) return false;
    if (entry.name.startsWith('.')) return false;
    return entry.isFile() || entry.isDirectory();
  });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, {recursive: true});
    for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
      copyRecursive(path.join(src, entry.name), path.join(dest, entry.name));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
}

function removeRecursive(src) {
  fs.rmSync(src, {recursive: true, force: true});
}

function ensureRegistryEntry(registryPath, version) {
  const text = fs.readFileSync(registryPath, 'utf8');
  const entry = `  ['${version}', () => import('./transforms/v${version}/index.mjs')],`;
  if (text.includes(`['${version}',`)) return false;

  const marker = ']);';
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error('codemod-next: could not locate registry map terminator.');
  }

  const nextText = `${text.slice(0, markerIndex)}${entry}\n${text.slice(markerIndex)}`;
  writeText(registryPath, nextText);
  return true;
}

export function promoteCodemodNext({root = DEFAULT_ROOT} = {}) {
  const corePackage = path.join(root, 'packages/core/package.json');
  const transformsDir = path.join(
    root,
    'packages/cli/assets/codemods/transforms',
  );
  const registryPath = path.join(
    root,
    'packages/cli/assets/codemods/registry.mjs',
  );
  const nextDir = path.join(transformsDir, 'next');

  const entries = listPromotableEntries(nextDir);
  if (entries.length === 0) {
    return {
      promoted: [],
      registryUpdated: false,
      message: 'codemod-next: no staged codemods to promote.',
    };
  }

  const version = readJson(corePackage).version;
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(
      `codemod-next: invalid package version ${JSON.stringify(version)}`,
    );
  }

  if (!entries.some(entry => entry.name === 'index.mjs')) {
    throw new Error(
      'codemod-next: staged codemods must include next/index.mjs so the promoted version folder is registry-loadable.',
    );
  }

  const versionDir = path.join(transformsDir, `v${version}`);
  if (!fs.existsSync(versionDir)) fs.mkdirSync(versionDir, {recursive: true});

  /** @type {Array<{from: string, to: string}>} */
  const promoted = [];
  for (const entry of entries) {
    const src = path.join(nextDir, entry.name);
    const dest = path.join(versionDir, entry.name);
    if (fs.existsSync(dest)) {
      throw new Error(
        `codemod-next: refusing to overwrite existing ${path.relative(root, dest)}`,
      );
    }
    copyRecursive(src, dest);
    removeRecursive(src);
    promoted.push({
      from: path.relative(root, src),
      to: path.relative(root, dest),
    });
  }

  const registryUpdated = ensureRegistryEntry(registryPath, version);
  return {version, promoted, registryUpdated};
}

function main() {
  const result = promoteCodemodNext();
  if (result.message) {
    console.log(result.message);
    return;
  }
  for (const entry of result.promoted) {
    console.log(`codemod-next: promoted ${entry.from} -> ${entry.to}`);
  }
  if (result.registryUpdated) {
    console.log(
      `codemod-next: registered v${result.version} in packages/cli/assets/codemods/registry.mjs`,
    );
  }
  console.log(
    `codemod-next: promoted ${result.promoted.length} entr${result.promoted.length === 1 ? 'y' : 'ies'} into v${result.version}.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

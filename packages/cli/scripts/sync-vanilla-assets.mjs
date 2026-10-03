#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Generate the vanilla HTML assets shipped in @astryxdesign/cli.
 *
 * The source of truth remains packages/vanilla/{markup,templates}. The CLI copy
 * lets `component --html` and `template --html` work after npm installation.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');
export const SOURCE_DIR = path.join(REPO_ROOT, 'packages/vanilla');
export const TARGET_DIR = path.join(REPO_ROOT, 'packages/cli/assets/vanilla');
const ASSET_DIRS = ['markup', 'templates'];

/** @param {string} root @returns {string[]} */
function listFiles(root) {
  /** @type {string[]} */
  const files = [];
  if (!fs.existsSync(root)) return files;
  /** @param {string} current */
  function visit(current) {
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) files.push(path.relative(root, full));
    }
  }
  visit(root);
  return files.sort();
}

/** @returns {string[]} Human-readable drift errors. */
export function checkVanillaAssets() {
  /** @type {string[]} */
  const errors = [];
  for (const assetDir of ASSET_DIRS) {
    const sourceRoot = path.join(SOURCE_DIR, assetDir);
    const targetRoot = path.join(TARGET_DIR, assetDir);
    const sourceFiles = listFiles(sourceRoot);
    const targetFiles = listFiles(targetRoot);
    for (const relative of sourceFiles) {
      if (!targetFiles.includes(relative)) {
        errors.push(`${assetDir}/${relative}: missing from CLI bundle`);
        continue;
      }
      const source = fs.readFileSync(path.join(sourceRoot, relative));
      const target = fs.readFileSync(path.join(targetRoot, relative));
      if (!source.equals(target)) {
        errors.push(`${assetDir}/${relative}: content differs from source`);
      }
    }
    for (const relative of targetFiles) {
      if (!sourceFiles.includes(relative)) {
        errors.push(`${assetDir}/${relative}: no matching source asset`);
      }
    }
  }
  return errors;
}

/** Regenerate the bundled copy from packages/vanilla. */
export function syncVanillaAssets() {
  fs.rmSync(TARGET_DIR, {recursive: true, force: true});
  for (const assetDir of ASSET_DIRS) {
    fs.cpSync(
      path.join(SOURCE_DIR, assetDir),
      path.join(TARGET_DIR, assetDir),
      {recursive: true},
    );
  }
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  if (process.argv.includes('--check')) {
    const errors = checkVanillaAssets();
    if (errors.length > 0) {
      console.error(
        `Bundled vanilla assets are stale:\n${errors.map(error => `- ${error}`).join('\n')}\nRun: pnpm -F @astryxdesign/cli sync:vanilla-assets`,
      );
      process.exitCode = 1;
    } else {
      console.log('Bundled vanilla assets match packages/vanilla.');
    }
  } else {
    syncVanillaAssets();
    console.log('Synced vanilla HTML assets into packages/cli/assets/vanilla.');
  }
}

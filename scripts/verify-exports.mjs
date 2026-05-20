#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * verify-exports.mjs
 *
 * Verifies that all package.json export fields (main, module, types, exports)
 * resolve to files that actually exist on disk. Designed to run AFTER `pnpm build`
 * to catch cases where packages point to dist files that weren't produced.
 *
 * Exit code 1 if any exports are broken.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

/** Fields in package.json that should point to real files */
const TOP_LEVEL_FIELDS = ['main', 'module', 'types'];

/**
 * Export map conditions that reference source files (not built output).
 * These are used by bundlers that compile from source — skip them.
 */
const SKIP_CONDITIONS = new Set(['source']);

/**
 * Find all package.json files in packages/ (including nested workspaces like packages/themes/*)
 */
function findPackageJsons() {
  const results = [];
  const packagesDir = join(rootDir, 'packages');

  function walk(dir, depth = 0) {
    if (depth > 2) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'src') continue;
      const pkgJson = join(dir, entry.name, 'package.json');
      if (existsSync(pkgJson)) {
        results.push(pkgJson);
      }
      // Recurse for nested workspaces (e.g., packages/themes/*)
      walk(join(dir, entry.name), depth + 1);
    }
  }

  walk(packagesDir);
  return results;
}

/**
 * Check if a path resolves to an existing file, relative to the package directory.
 */
function checkFile(pkgDir, filePath) {
  const resolved = resolve(pkgDir, filePath);
  return existsSync(resolved);
}

/**
 * Recursively check an exports map value.
 * Handles string paths, conditional objects, and nested structures.
 */
function checkExportsValue(pkgDir, pkgName, exportKey, value, parentCondition) {
  const errors = [];

  if (typeof value === 'string') {
    if (!checkFile(pkgDir, value)) {
      const label = parentCondition
        ? `exports["${exportKey}"].${parentCondition}`
        : `exports["${exportKey}"]`;
      errors.push(`  ✗ ${label} → ${value} (file not found)`);
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [condition, conditionValue] of Object.entries(value)) {
      if (SKIP_CONDITIONS.has(condition)) continue;
      errors.push(
        ...checkExportsValue(pkgDir, pkgName, exportKey, conditionValue, condition),
      );
    }
  }

  return errors;
}

// --- Main ---

const packageJsons = findPackageJsons();
let totalErrors = 0;
let packagesChecked = 0;

for (const pkgJsonPath of packageJsons) {
  const pkgDir = dirname(pkgJsonPath);
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

  // Skip private packages
  if (pkg.private) continue;

  const errors = [];

  // Check top-level fields (main, module, types)
  for (const field of TOP_LEVEL_FIELDS) {
    if (pkg[field] && !checkFile(pkgDir, pkg[field])) {
      errors.push(`  ✗ ${field} → ${pkg[field]} (file not found)`);
    }
  }

  // Check exports map
  if (pkg.exports && typeof pkg.exports === 'object') {
    for (const [exportKey, exportValue] of Object.entries(pkg.exports)) {
      errors.push(...checkExportsValue(pkgDir, pkg.name, exportKey, exportValue));
    }
  }

  packagesChecked++;

  if (errors.length > 0) {
    console.error(`\n❌ ${pkg.name} (${pkgJsonPath})`);
    for (const error of errors) {
      console.error(error);
    }
    totalErrors += errors.length;
  } else {
    console.log(`✓ ${pkg.name}`);
  }
}

console.log(`\n${packagesChecked} packages checked.`);

if (totalErrors > 0) {
  console.error(`\n${totalErrors} broken export(s) found. Fix the paths above.`);
  process.exit(1);
} else {
  console.log('All exports resolve to existing files.');
}

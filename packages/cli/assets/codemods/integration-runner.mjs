// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Runner for file-based integration codemods.
 *
 * Integration codemods (a plain object stamped `type: 'code'` or
 * `type: 'config'`) use the file-based contract
 * `(file, api) => string | null | undefined`.
 * Config codemods target the consumer's astryx.config.* file; code codemods
 * are applied to source files discovered under `--path`, filtered by each
 * codemod's `fileExtensions`.
 *
 * Execution is delegated to the shared primitives in `run-codemod.mjs`, which
 * the core registry runner (`runner.mjs`) reuses too — there is a single
 * implementation of "run a config codemod against astryx.config.*" and "run a
 * code codemod against source files".
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  findSourceFiles,
  makeLog,
  runCodeCodemod,
  runConfigCodemod,
} from './run-codemod.mjs';

/**
 * Run file-based integration codemods, version-ordered. Config codemods run
 * first (targeting astryx.config.*), then code codemods (source globbing).
 *
 * Optional codemods (isOptional) are skipped unless explicitly requested via
 * `codemod` (matched against the codemod id).
 *
 * @param {Array<{version: string, codemods: Array<import('../../authoring/codemod/type').CodemodEntry>}>} versionGroups
 * @param {object} options
 * @param {boolean} options.apply
 * @param {string} options.path source directory to scan
 * @param {string} [options.codemod] run only this codemod id
 * @param {Set<string>} [options.skipCodemods] codemod ids to exclude
 * @param {import('../../authoring/codemod/type').JscodeshiftFactory} options.jscodeshift
 * @param {boolean} [options.silent]
 * @returns {{totalFilesChanged: number, totalTransformsApplied: number, writtenFiles: string[], errors: Array<{file: string, codemod: string, error: string}>, skippedOptional: Array<import('../../authoring/codemod/type').CodemodEntry>}}
 */
export function runIntegrationCodemods(
  versionGroups,
  {apply, path: srcPath, codemod, skipCodemods, jscodeshift, silent = false},
) {
  const log = makeLog(silent);

  let totalFilesChanged = 0;
  let totalTransformsApplied = 0;
  /** @type {string[]} */
  const writtenFiles = [];
  /** @type {Array<{file: string, codemod: string, error: string}>} */
  const errors = [];
  /** @type {Array<import('../../authoring/codemod/type').CodemodEntry>} */
  const skippedOptional = [];

  // Flatten and split by type, preserving version ordering.
  /** @type {Array<import('../../authoring/codemod/type').CodemodEntry>} */
  const configEntries = [];
  /** @type {Array<import('../../authoring/codemod/type').CodemodEntry>} */
  const codeEntries = [];
  for (const {version, codemods} of versionGroups) {
    for (const entry of codemods) {
      const withVersion = {...entry, version};
      // Exclude explicitly skipped codemods (by codemod id).
      if (skipCodemods?.has(entry.id)) continue;
      if (entry.codemod.isOptional && !codemod) {
        skippedOptional.push(withVersion);
        continue;
      }
      if (codemod && entry.id !== codemod) continue;
      if (entry.type === 'config') configEntries.push(withVersion);
      else codeEntries.push(withVersion);
    }
  }

  // Config codemods first.
  for (const entry of configEntries) {
    log.info(`  ${entry.codemod.title} (v${entry.version}, ${entry.package})`);
    const r = runConfigCodemod(entry, {apply, log, jscodeshift});
    totalFilesChanged += r.filesChanged;
    totalTransformsApplied += r.filesChanged;
    writtenFiles.push(...r.writtenFiles);
    errors.push(...r.errors);
  }

  // Then code codemods (only scan the tree if there are any).
  if (codeEntries.length > 0) {
    const resolvedPath = path.resolve(srcPath);
    const files = fs.existsSync(resolvedPath)
      ? findSourceFiles(resolvedPath)
      : [];
    for (const entry of codeEntries) {
      log.info(
        `  ${entry.codemod.title} (v${entry.version}, ${entry.package})`,
      );
      const r = runCodeCodemod(entry, files, {apply, log, jscodeshift});
      totalFilesChanged += r.filesChanged;
      totalTransformsApplied += r.filesChanged;
      writtenFiles.push(...r.writtenFiles);
      errors.push(...r.errors);
    }
  }

  return {
    totalFilesChanged,
    totalTransformsApplied,
    writtenFiles,
    errors,
    skippedOptional,
  };
}

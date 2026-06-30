// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Runner for file-based integration codemods.
 *
 * Integration codemods authored with `createCodemod` / `createConfigCodemod`
 * use the file-based contract `(file, api) => string | null | undefined`.
 * Config codemods target the consumer's astryx.config.* file; code codemods
 * are applied to source files discovered under `--path`, filtered by each
 * codemod's `fileExtensions`.
 *
 * Both kinds reuse the shared output validation from runner.mjs and fail the
 * upgrade if a transform throws (strictness contract).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {findConfigPath} from '../lib/project.mjs';
import {fixDirectiveCorruption, validateOutput} from './runner.mjs';

const DEFAULT_CODE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs'];
const PARSEABLE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs'];

/**
 * Recursively find candidate source files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function findSourceFiles(dir) {
  const results = [];
  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, {withFileTypes: true});
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walk(fullPath);
      } else {
        results.push(fullPath);
      }
    }
  }
  walk(dir);
  return results.sort();
}

function makeLog(silent) {
  return silent
    ? {step() {}, info() {}, success() {}, warn() {}, error() {}, message() {}}
    : p.log;
}

/**
 * Apply a config codemod to the consumer's astryx.config.* file.
 *
 * @param {object} entry discovered codemod entry {id, codemod, package}
 * @param {{apply: boolean, log: object, jscodeshift: Function}} ctx
 * @returns {{filesChanged: number, writtenFiles: string[], errors: Array}}
 */
function runConfigCodemod(entry, {apply, log, jscodeshift}) {
  const {codemod, id, package: pkg} = entry;
  const name = `${pkg}:${id}`;
  const configPath = findConfigPath(process.cwd());
  if (!configPath) {
    log.info(`  ${codemod.title} — no astryx.config.* found; skipping.`);
    return {filesChanged: 0, writtenFiles: [], errors: []};
  }

  const relativePath = path.relative(process.cwd(), configPath);
  try {
    const source = fs.readFileSync(configPath, 'utf-8');
    const ext = path.extname(configPath);
    const parser = ext === '.tsx' || ext === '.ts' ? 'tsx' : 'babel';
    const j = jscodeshift.withParser(parser);
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    let result = codemod.transform({source, path: configPath}, api);

    if (result == null || result === source) {
      return {filesChanged: 0, writtenFiles: [], errors: []};
    }

    result = fixDirectiveCorruption(result);
    const validation = validateOutput(result, source, j, {
      parse: PARSEABLE_EXTENSIONS.includes(ext),
    });
    if (!validation.valid) {
      log.error(`    ✗ ${relativePath} — ${validation.reason}`);
      return {
        filesChanged: 0,
        writtenFiles: [],
        errors: [{file: relativePath, codemod: name, error: validation.reason}],
      };
    }

    if (apply) {
      fs.writeFileSync(configPath, result, 'utf-8');
      log.success(`    ✓ ${relativePath}`);
    } else {
      log.warn(`    ~ ${relativePath} (would change)`);
    }
    return {filesChanged: 1, writtenFiles: apply ? [configPath] : [], errors: []};
  } catch (err) {
    log.error(`    ✗ ${relativePath} — ${err.message}`);
    return {
      filesChanged: 0,
      writtenFiles: [],
      errors: [{file: relativePath, codemod: name, error: err.message}],
    };
  }
}

/**
 * Apply a code codemod to discovered source files.
 *
 * @param {object} entry discovered codemod entry {id, codemod, package}
 * @param {string[]} files
 * @param {{apply: boolean, log: object, jscodeshift: Function}} ctx
 * @returns {{filesChanged: number, writtenFiles: string[], errors: Array}}
 */
function runCodeCodemod(entry, files, {apply, log, jscodeshift}) {
  const {codemod, id, package: pkg} = entry;
  const name = `${pkg}:${id}`;
  const extensions = new Set(codemod.fileExtensions ?? DEFAULT_CODE_EXTENSIONS);

  let filesChanged = 0;
  const writtenFiles = [];
  const errors = [];

  for (const filePath of files) {
    const ext = path.extname(filePath);
    if (!extensions.has(ext)) continue;

    const relativePath = path.relative(process.cwd(), filePath);
    try {
      const source = fs.readFileSync(filePath, 'utf-8');
      const parser = ext === '.tsx' || ext === '.ts' ? 'tsx' : 'babel';
      const j = jscodeshift.withParser(parser);
      const api = {jscodeshift: j, stats: () => {}, report: () => {}};
      let result = codemod.transform({source, path: filePath}, api);

      if (result == null || result === source) continue;

      result = fixDirectiveCorruption(result);
      const validation = validateOutput(result, source, j, {
        parse: PARSEABLE_EXTENSIONS.includes(ext),
      });
      if (!validation.valid) {
        log.error(`    ✗ ${relativePath} — ${validation.reason}`);
        errors.push({file: relativePath, codemod: name, error: validation.reason});
        continue;
      }

      filesChanged++;
      if (apply) {
        fs.writeFileSync(filePath, result, 'utf-8');
        writtenFiles.push(filePath);
        log.success(`    ✓ ${relativePath}`);
      } else {
        log.warn(`    ~ ${relativePath} (would change)`);
      }
    } catch (err) {
      log.error(`    ✗ ${relativePath} — ${err.message}`);
      errors.push({file: relativePath, codemod: name, error: err.message});
    }
  }

  return {filesChanged, writtenFiles, errors};
}

/**
 * Run file-based integration codemods, version-ordered. Config codemods run
 * first (targeting astryx.config.*), then code codemods (source globbing).
 *
 * Optional codemods (isOptional) are skipped unless explicitly requested via
 * `codemod` (matched against the codemod id).
 *
 * @param {Array<{version: string, codemods: Array<object>}>} versionGroups
 * @param {object} options
 * @param {boolean} options.apply
 * @param {string} options.path source directory to scan
 * @param {string} [options.codemod] run only this codemod id
 * @param {Set<string>} [options.skipCodemods] codemod ids to exclude
 * @param {Function} options.jscodeshift
 * @param {boolean} [options.silent]
 * @returns {{totalFilesChanged: number, totalTransformsApplied: number, writtenFiles: string[], errors: Array, skippedOptional: Array}}
 */
export function runIntegrationCodemods(
  versionGroups,
  {apply, path: srcPath, codemod, skipCodemods, jscodeshift, silent = false},
) {
  const log = makeLog(silent);

  let totalFilesChanged = 0;
  let totalTransformsApplied = 0;
  const writtenFiles = [];
  const errors = [];
  const skippedOptional = [];

  // Flatten and split by type, preserving version ordering.
  const configEntries = [];
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
    const files = fs.existsSync(resolvedPath) ? findSourceFiles(resolvedPath) : [];
    for (const entry of codeEntries) {
      log.info(`  ${entry.codemod.title} (v${entry.version}, ${entry.package})`);
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

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared codemod execution primitives.
 *
 * Both the core registry runner (`runner.mjs` / `upgrade.mjs`) and the
 * integration runner (`integration-runner.mjs`) execute codemods that follow
 * the unified file-based contract:
 *
 *   (file, api) => string | null | undefined
 *
 * where `file` is `{path, source}` and `api` is
 * `{jscodeshift, stats, report}`. Config codemods target the consumer's
 * astryx.config.* file; code codemods are applied to source files discovered
 * under `--path`, filtered by each codemod's `fileExtensions`.
 *
 * A codemod ENTRY is normalized to a single shape across both callers:
 *
 *   {id, type: 'code' | 'config', codemod: {title, transform, fileExtensions?,
 *    isOptional?}, package, version}
 *
 * Integration discovery emits this shape directly. The core registry stores
 * entries as `{name, transform, meta}`; `runner.mjs` normalizes those to this
 * shape at the boundary (see `runner.mjs`).
 *
 * Both kinds reuse the shared output validation from runner.mjs, refuse to
 * write generated files, and surface a transform throw as an error (strictness
 * contract).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from './term-log.mjs';
import {findConfigPath} from '../../foundation/config/project.mjs';
import {fixDirectiveCorruption, validateOutput, IGNORED_DIRS} from './runner.mjs';
import {
  GENERATED_FILE_BLOCK_REASON,
  hasGeneratedFileHeader,
} from './generated-file.mjs';

/**
 * @typedef {import('../../authoring/codemod/type').CodemodRunResult & {
 *   generatedFilesBlocked?: string[],
 * }} CodemodRunResult
 */

export const DEFAULT_CODE_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.mjs',
  '.cjs',
];
const PARSEABLE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs'];

/**
 * Recursively find candidate source files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
export function findSourceFiles(dir) {
  /** @type {string[]} */
  const results = [];
  /** @param {string} currentDir */
  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, {withFileTypes: true});
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      // Never follow symlinks — writing through one would rewrite its target
      // outside the scan tree (e.g. into node_modules or anywhere on disk).
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        walk(fullPath);
      } else {
        results.push(fullPath);
      }
    }
  }
  walk(dir);
  return results.sort();
}

/**
 * No-op log surface for silent (`--json`) mode.
 * @param {boolean} silent
 * @returns {import('../../authoring/codemod/type').CliLog}
 */
export function makeLog(silent) {
  return silent
    ? {step() {}, info() {}, success() {}, warn() {}, error() {}, message() {}}
    : p.log;
}

/**
 * Apply a config codemod to the consumer's astryx.config.* file.
 *
 * @param {import('../../authoring/codemod/type').CodemodEntry} entry normalized codemod entry {id, codemod, package}
 * @param {{apply: boolean, log: import('../../authoring/codemod/type').CliLog, jscodeshift: import('../../authoring/codemod/type').JscodeshiftFactory, cwd?: string}} ctx
 * @returns {CodemodRunResult}
 */
export function runConfigCodemod(
  entry,
  {apply, log, jscodeshift, cwd = process.cwd()},
) {
  const {codemod, id, package: pkg} = entry;
  const name = `${pkg}:${id}`;
  // findConfigPath throws when multiple astryx.config.* files coexist. Config
  // codemods run FIRST (before the strict project loader), so an uncaught throw
  // here aborts the entire `astryx upgrade` with an un-coded error — breaking
  // the per-codemod isolation every other failure path honors. Degrade it to a
  // structured error so the run continues and reports it.
  let configPath;
  try {
    configPath = findConfigPath(cwd);
  } catch (err) {
    const message = /** @type {any} */ (err).message;
    log.error(`    ✗ astryx.config.* — ${message}`);
    return {
      filesChanged: 0,
      writtenFiles: [],
      errors: [{file: 'astryx.config.*', codemod: name, error: message}],
    };
  }
  if (!configPath) {
    log.info(`  ${codemod.title} — no astryx.config.* found; skipping.`);
    return {filesChanged: 0, writtenFiles: [], errors: []};
  }

  const relativePath = path.relative(cwd, configPath);
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

    if (hasGeneratedFileHeader(source)) {
      log.error(`    ✗ ${relativePath} — ${GENERATED_FILE_BLOCK_REASON}`);
      return {
        filesChanged: 0,
        writtenFiles: [],
        errors: [{file: relativePath, codemod: name, error: GENERATED_FILE_BLOCK_REASON}],
        generatedFilesBlocked: [relativePath],
      };
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
    return {
      filesChanged: 1,
      writtenFiles: apply ? [configPath] : [],
      errors: [],
    };
  } catch (err) {
    const message = /** @type {any} */ (err).message;
    log.error(`    ✗ ${relativePath} — ${message}`);
    return {
      filesChanged: 0,
      writtenFiles: [],
      errors: [{file: relativePath, codemod: name, error: message}],
    };
  }
}

/**
 * Apply a code codemod to discovered source files.
 *
 * @param {import('../../authoring/codemod/type').CodemodEntry} entry normalized codemod entry {id, codemod, package}
 * @param {string[]} files
 * @param {{apply: boolean, log: import('../../authoring/codemod/type').CliLog, jscodeshift: import('../../authoring/codemod/type').JscodeshiftFactory, cwd?: string}} ctx
 * @returns {CodemodRunResult & {generatedFilesBlocked: string[]}}
 */
export function runCodeCodemod(
  entry,
  files,
  {apply, log, jscodeshift, cwd = process.cwd()},
) {
  const {codemod, id, package: pkg} = entry;
  const name = `${pkg}:${id}`;
  const extensions = new Set(codemod.fileExtensions ?? DEFAULT_CODE_EXTENSIONS);

  let filesChanged = 0;
  /** @type {string[]} */
  const writtenFiles = [];
  /** @type {Array<{file: string, codemod: string, error: string}>} */
  const errors = [];
  /** @type {Set<string>} */
  const generatedFilesBlocked = new Set();

  for (const filePath of files) {
    const ext = path.extname(filePath);
    if (!extensions.has(ext)) continue;

    const relativePath = path.relative(cwd, filePath);
    try {
      const source = fs.readFileSync(filePath, 'utf-8');
      const parser = ext === '.tsx' || ext === '.ts' ? 'tsx' : 'babel';
      const j = jscodeshift.withParser(parser);
      const api = {jscodeshift: j, stats: () => {}, report: () => {}};
      let result = codemod.transform({source, path: filePath}, api);

      if (result == null || result === source) continue;

      if (hasGeneratedFileHeader(source)) {
        generatedFilesBlocked.add(relativePath);
        log.error(`    ✗ ${relativePath} — ${GENERATED_FILE_BLOCK_REASON}`);
        errors.push({
          file: relativePath,
          codemod: name,
          error: GENERATED_FILE_BLOCK_REASON,
        });
        continue;
      }

      result = fixDirectiveCorruption(result);
      const validation = validateOutput(result, source, j, {
        parse: PARSEABLE_EXTENSIONS.includes(ext),
      });
      if (!validation.valid) {
        log.error(`    ✗ ${relativePath} — ${validation.reason}`);
        errors.push({
          file: relativePath,
          codemod: name,
          error: validation.reason,
        });
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
      const message = /** @type {any} */ (err).message;
      log.error(`    ✗ ${relativePath} — ${message}`);
      errors.push({file: relativePath, codemod: name, error: message});
    }
  }

  return {
    filesChanged,
    writtenFiles,
    errors,
    generatedFilesBlocked: [...generatedFilesBlocked].sort(),
  };
}

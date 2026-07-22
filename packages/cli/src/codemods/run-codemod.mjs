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
 * Both kinds reuse the shared output validation from runner.mjs and surface a
 * transform throw as an error (strictness contract).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '../lib/term-log.mjs';
import {findConfigPath} from '../lib/project.mjs';
import {fixDirectiveCorruption, validateOutput} from './runner.mjs';

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

/**
 * No-op log surface for silent (`--json`) mode.
 * @param {boolean} silent
 */
export function makeLog(silent) {
  return silent
    ? {step() {}, info() {}, success() {}, warn() {}, error() {}, message() {}}
    : p.log;
}

/**
 * Apply a config codemod to the consumer's astryx.config.* file.
 *
 * @param {object} entry normalized codemod entry {id, codemod, package}
 * @param {{apply: boolean, log: object, jscodeshift: Function}} ctx
 * @returns {{filesChanged: number, writtenFiles: string[], errors: Array}}
 */
export function runConfigCodemod(entry, {apply, log, jscodeshift}) {
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
    return {
      filesChanged: 1,
      writtenFiles: apply ? [configPath] : [],
      errors: [],
    };
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
 * @param {object} entry normalized codemod entry {id, codemod, package}
 * @param {string[]} files
 * @param {{apply: boolean, log: object, jscodeshift: Function}} ctx
 * @returns {{filesChanged: number, writtenFiles: string[], errors: Array}}
 */
export function runCodeCodemod(entry, files, {apply, log, jscodeshift}) {
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
      log.error(`    ✗ ${relativePath} — ${err.message}`);
      errors.push({file: relativePath, codemod: name, error: err.message});
    }
  }

  return {filesChanged, writtenFiles, errors};
}

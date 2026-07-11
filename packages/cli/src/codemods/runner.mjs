// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod runner
 *
 * Orchestrates running jscodeshift transforms against source files.
 * Handles dry-run previews, file writing, summary reporting, and
 * output validation to prevent corrupted transforms from reaching disk.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {humanLog} from '../lib/json.mjs';
import {runConfigCodemod} from './run-codemod.mjs';

// Known corruption patterns that indicate a broken transform.
// Each entry: [regex, human-readable description]
const CORRUPTION_PATTERNS = [
  [
    /\[native code\]/g,
    '[native code] injection (prototype pollution in identifier map)',
  ],
  [
    /function \w+\(\) \{ \[native code\] \}/g,
    'native function toString() leak',
  ],
];

/**
 * Fix jscodeshift directive corruption.
 *
 * jscodeshift has a known bug where toSource() double-prints the semicolon
 * on directive prologues ('use client';, 'use server';, 'use strict';)
 * when the AST has been modified with new nodes nearby. The parser treats
 * the directive as an ExpressionStatement with a StringLiteral, and the
 * printer emits both the original semicolon and a new one for the statement.
 *
 * This is applied in the runner so every codemod gets the fix automatically.
 *
 * @param {string} code
 * @returns {string}
 */
export function fixDirectiveCorruption(code) {
  return code.replace(/^(['"]use (client|server|strict)['"]);\s*;/gm, '$1;');
}

/**
 * Recursively find all source files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function findSourceFiles(dir) {
  const results = [];
  const extensions = new Set([
    '.tsx',
    '.ts',
    '.jsx',
    '.js',
    '.mjs',
    '.cjs',
    '.css',
    '.scss',
    '.sass',
    '.less',
  ]);

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
      } else if (extensions.has(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results.sort();
}

/**
 * Validate transform output before writing to disk.
 *
 * Checks:
 * 1. The output can be re-parsed by jscodeshift (no syntax corruption)
 * 2. No known corruption patterns are present that weren't in the original
 *
 * @param {string} result - The transformed source code
 * @param {string} source - The original source code
 * @param {Function} j - jscodeshift instance (with parser configured)
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateOutput(result, source, j, {parse = true} = {}) {
  // Check 1: Re-parse the output — catches syntax-breaking corruption
  if (parse) {
    try {
      j(result);
    } catch (parseError) {
      return {
        valid: false,
        reason: `transform produced unparseable output: ${parseError.message}`,
      };
    }
  }

  // Check 2: Known corruption patterns (only flag new ones, not pre-existing)
  for (const [pattern, description] of CORRUPTION_PATTERNS) {
    const resultMatches = result.match(pattern);
    const sourceMatches = source.match(pattern);
    const resultCount = resultMatches ? resultMatches.length : 0;
    const sourceCount = sourceMatches ? sourceMatches.length : 0;
    if (resultCount > sourceCount) {
      return {
        valid: false,
        reason: `detected corruption: ${description} (${resultCount - sourceCount} new occurrence${resultCount - sourceCount > 1 ? 's' : ''})`,
      };
    }
  }

  return {valid: true};
}

/**
 * Normalize a core registry transform entry to the unified codemod entry shape
 * consumed by the shared runner (`run-codemod.mjs`).
 *
 * Core registry entries are stored as `{name, transform, meta, optional}`.
 * The shared runner — the same one integration codemods use — operates on
 * `{id, type, codemod: {title, transform, fileExtensions?, isOptional?},
 * package, version}`.
 *
 * CONVENTION — how a core registry entry signals it is a CONFIG codemod:
 * set `meta.codemodType === 'config'` on the entry (the default is a 'code'
 * codemod). A config codemod runs against the consumer's astryx.config.* file
 * via the unified `(file, api)`/jscodeshift contract; a code codemod runs
 * against discovered source files. Any future core config codemod (e.g. a
 * v0.1.3 one) must set `meta.codemodType = 'config'` and author its transform
 * with the same `(file, api) => string | null | undefined` contract used by
 * `createConfigCodemod`.
 *
 * @param {{name: string, transform: Function, meta: object, optional?: boolean}} transformEntry
 * @param {string} version
 * @returns {{id: string, type: 'code'|'config', codemod: object, package: string, version: string}}
 */
function toUnifiedEntry(transformEntry, version) {
  const {name, transform, meta, optional} = transformEntry;
  const type = meta?.codemodType === 'config' ? 'config' : 'code';
  return {
    id: name,
    type,
    codemod: {
      title: meta.title,
      transform,
      fileExtensions: meta.fileExtensions,
      isOptional: !!optional,
    },
    package: 'core',
    version,
  };
}

/**
 * Run codemods against source files.
 *
 * @param {Array<{version: string, transforms: Array}>} versionManifests
 * @param {object} options
 * @param {boolean} options.apply - Write changes to disk
 * @param {string} options.path - Source directory to scan
 * @param {string|undefined} options.codemod - Run only this specific transform
 * @param {Set<string>} [options.skipCodemods] - Transform names to exclude
 * @param {boolean} [options.silent] - Suppress all human-facing output (for --json)
 * @returns {{totalFilesChanged: number, totalTransformsApplied: number, totalValidationBlocked: number, writtenFiles: string[], errors: Array, skippedOptional: Array}}
 */
export async function runCodemods(
  versionManifests,
  {apply, path: srcPath, codemod, skipCodemods, silent = false},
) {
  // No-op stub object so silent mode skips clack stdout entirely without
  // littering the body with `if (!silent)` guards.
  const log = silent
    ? {step() {}, info() {}, success() {}, warn() {}, error() {}, message() {}}
    : p.log;
  const writeBlank = () => {
    if (!silent) humanLog('');
  };

  const resolvedPath = path.resolve(srcPath);

  // Config codemods target the consumer's astryx.config.* and never read
  // source files, so a missing --path should not block them. Only hard-fail
  // on a missing source path when there is at least one CODE codemod to run.
  const hasCodeCodemod = versionManifests.some(({transforms}) =>
    transforms.some(t => t.meta?.codemodType !== 'config'),
  );
  const sourcePathExists = fs.existsSync(resolvedPath);

  if (!sourcePathExists && hasCodeCodemod) {
    log.error(`Source path not found: ${resolvedPath}`);
    return {ok: false, reason: 'source_path_missing', resolvedPath};
  }

  let files = [];
  if (sourcePathExists) {
    log.step(`Scanning ${resolvedPath} for source files...`);
    files = findSourceFiles(resolvedPath);

    if (files.length === 0) {
      log.warn('No source files found.');
    } else {
      log.info(
        `Found ${files.length} source file${files.length === 1 ? '' : 's'}`,
      );
    }
  }

  // Dynamically import jscodeshift
  const jscodeshift = (await import('jscodeshift')).default;

  let totalFilesChanged = 0;
  let totalTransformsApplied = 0;
  let totalValidationBlocked = 0;
  const errors = [];
  const writtenFiles = [];
  const skippedOptional = [];

  for (const {version, transforms} of versionManifests) {
    log.step(`Applying v${version} codemods...`);

    for (const transformEntry of transforms) {
      // Filter by codemod name if specified
      if (codemod && transformEntry.name !== codemod) continue;
      // Exclude explicitly skipped codemods (by transform name).
      if (skipCodemods?.has(transformEntry.name)) continue;

      const {name, transform, meta, optional} = transformEntry;
      const transformExtensions = new Set(
        meta.fileExtensions ?? ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs'],
      );

      // Skip optional codemods unless explicitly requested via --codemod
      if (optional && !codemod) {
        skippedOptional.push({name, meta, version});
        continue;
      }

      log.info(`  ${meta.title}`);

      // Config codemods are routed through the SAME shared runner that
      // integration config codemods use: the transform follows the unified
      // `(file, api)` contract and targets the consumer's astryx.config.*.
      // A core entry signals "config" via `meta.codemodType === 'config'`
      // (see toUnifiedEntry).
      if (meta?.codemodType === 'config') {
        const result = runConfigCodemod(toUnifiedEntry(transformEntry, version), {
          apply,
          log,
          jscodeshift,
        });
        if (result.errors.length > 0) {
          errors.push(...result.errors);
        } else if (result.filesChanged > 0) {
          totalFilesChanged += result.filesChanged;
          totalTransformsApplied += result.filesChanged;
          writtenFiles.push(...result.writtenFiles);
        }
        continue;
      }

      let filesChanged = 0;

      for (const filePath of files) {
        const relativePath = path.relative(process.cwd(), filePath);

        try {
          const ext = path.extname(filePath);
          if (!transformExtensions.has(ext)) {
            continue;
          }

          const source = fs.readFileSync(filePath, 'utf-8');
          // Configure parser based on file extension
          const parser = ext === '.tsx' || ext === '.ts' ? 'tsx' : 'babel';
          const j = jscodeshift.withParser(parser);
          const api = {
            jscodeshift: j,
            stats: () => {},
            report: () => {},
          };
          const file = {source, path: filePath};

          let result = transform(file, api);

          if (result != null && result !== source) {
            // Fix known jscodeshift output corruption before validation
            result = fixDirectiveCorruption(result);

            // Validate output before writing
            const validation = validateOutput(result, source, j, {
              parse: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs'].includes(
                ext,
              ),
            });
            if (!validation.valid) {
              totalValidationBlocked++;
              log.error(`    ✗ ${relativePath} — ${validation.reason}`);
              errors.push({
                file: relativePath,
                codemod: name,
                error: validation.reason,
              });
              continue;
            }

            filesChanged++;
            totalFilesChanged++;
            totalTransformsApplied++;

            if (apply) {
              fs.writeFileSync(filePath, result, 'utf-8');
              writtenFiles.push(filePath);
              log.success(`    ✓ ${relativePath}`);
            } else {
              log.warn(`    ~ ${relativePath} (would change)`);
            }
          }
        } catch (err) {
          log.error(`    ✗ ${relativePath} — ${err.message}`);
          errors.push({file: relativePath, codemod: name, error: err.message});
        }
      }

      if (filesChanged > 0) {
        const verb = apply ? 'Updated' : 'Would update';
        log.info(
          `  ${verb} ${filesChanged} file${filesChanged === 1 ? '' : 's'}`,
        );
      }
    }
  }

  // Summary
  writeBlank();

  if (errors.length > 0) {
    log.error(
      `${errors.length} error${errors.length === 1 ? '' : 's'} during codemods:`,
    );
    for (const {file, codemod: cm, error} of errors) {
      log.error(`  ${cm} → ${file}: ${error}`);
    }
  }

  if (totalValidationBlocked > 0) {
    log.warn(
      `${totalValidationBlocked} file${totalValidationBlocked === 1 ? ' was' : 's were'} blocked by validation — no changes written to ${totalValidationBlocked === 1 ? 'that file' : 'those files'}.`,
    );
    log.info(
      'This means a codemod produced invalid output. Please report this as a bug.',
    );
  }

  if (totalFilesChanged === 0 && errors.length === 0) {
    log.success('No changes needed — your code is already up to date!');
  } else if (apply) {
    log.success(
      `Done! Applied ${totalTransformsApplied} change${totalTransformsApplied === 1 ? '' : 's'} across ${totalFilesChanged} file${totalFilesChanged === 1 ? '' : 's'}.`,
    );
    if (errors.length > 0) {
      log.warn('Some files had errors — review them manually.');
    }
    log.info('Run your type checker and tests to verify the changes.');
  } else {
    log.warn(
      `Found ${totalTransformsApplied} change${totalTransformsApplied === 1 ? '' : 's'} across ${totalFilesChanged} file${totalFilesChanged === 1 ? '' : 's'}.`,
    );
    log.info('Run with --apply to write changes to disk.');
  }

  // Report skipped optional codemods so the user knows they exist
  if (skippedOptional.length > 0) {
    writeBlank();
    log.message(
      `${skippedOptional.length} optional codemod${skippedOptional.length === 1 ? '' : 's'} available:`,
    );
    for (const {name, meta} of skippedOptional) {
      log.info(`  ${name} — ${meta.title}`);
      if (meta.description) {
        log.info(`    ${meta.description}`);
      }
      log.info(
        `    Run: astryx upgrade --codemod ${name} --path <dir> --apply`,
      );
    }
  }

  return {
    totalFilesChanged,
    totalTransformsApplied,
    totalValidationBlocked,
    writtenFiles,
    errors,
    skippedOptional,
  };
}

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
import {getRunPrefix} from '../utils/package-manager.mjs';
import {humanLog} from '../lib/json.mjs';

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
 * Detect the project's formatter and run it on changed files.
 * Tries prettier, then biome. Silently skips if none found.
 *
 * @param {string[]} files - Absolute paths to files that were modified
 * @param {boolean} [silent] - Suppress human-facing output
 */
async function formatChangedFiles(files, silent = false) {
  if (files.length === 0) return;

  const {execSync} = await import('node:child_process');
  const fileArgs = files.map(f => `"${f}"`).join(' ');
  const prefix = getRunPrefix();

  const formatters = [
    {name: 'prettier', cmd: `${prefix} prettier --write ${fileArgs}`},
    {name: 'biome', cmd: `${prefix} biome format --write ${fileArgs}`},
  ];

  for (const {name, cmd} of formatters) {
    try {
      execSync(cmd, {stdio: 'pipe', timeout: 30000});
      if (!silent)
        p.log.info(
          `Formatted ${files.length} file${files.length === 1 ? '' : 's'} with ${name}`,
        );
      return;
    } catch {
      // Formatter not available or failed — try next
    }
  }
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
 * Run codemods against source files.
 *
 * @param {Array<{version: string, transforms: Array}>} versionManifests
 * @param {object} options
 * @param {boolean} options.apply - Write changes to disk
 * @param {string} options.path - Source directory to scan
 * @param {string|undefined} options.codemod - Run only this specific transform
 * @param {boolean} [options.silent] - Suppress all human-facing output (for --json)
 */
export async function runCodemods(
  versionManifests,
  {apply, path: srcPath, codemod, silent = false},
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

  if (!fs.existsSync(resolvedPath)) {
    log.error(`Source path not found: ${resolvedPath}`);
    return {ok: false, reason: 'source_path_missing', resolvedPath};
  }

  log.step(`Scanning ${resolvedPath} for source files...`);
  const files = findSourceFiles(resolvedPath);

  if (files.length === 0) {
    log.warn('No source files found.');
    return {
      ok: true,
      totalFilesChanged: 0,
      totalTransformsApplied: 0,
      errors: [],
      writtenFiles: [],
      skippedOptional: [],
    };
  }

  log.info(`Found ${files.length} source file${files.length === 1 ? '' : 's'}`);

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

  // Post-codemod formatting: run the project's formatter on changed files
  // so codemods don't introduce style drift (jscodeshift may change quotes, etc.)
  if (apply && writtenFiles.length > 0) {
    await formatChangedFiles(writtenFiles, silent);
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
      log.info(`    Run: astryx upgrade --codemod ${name} --path <dir> --apply`);
    }
  }

  return {
    totalFilesChanged,
    totalTransformsApplied,
    totalValidationBlocked,
    errors,
    skippedOptional,
  };
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared helpers for integration contribution writers.
 *
 * Hosts the atomic staged-write transaction, package.json files-array
 * maintenance, package-dir resolution, and project-path normalization that
 * every `integration add <kind>` command needs. Stateless and side-effect-free
 * outside of {@link applyWrites}.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {randomUUID} from 'node:crypto';
import {AstryxError} from '../error.mjs';
import {publishNewFile} from '../../foundation/fs/publish-file.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

/** @param {string} value */
export function projectPath(value) {
  return value.split(path.sep).join('/');
}

/** @param {string} startDir */
export function findPackageDir(startDir) {
  let dir = path.resolve(startDir);
  for (let depth = 0; depth < 50; depth++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new AstryxError(
    'No package.json found. Run this command inside an integration package.',
    undefined,
    ERROR_CODES.ERR_FILE_NOT_FOUND,
  );
}

/**
 * @typedef {object} WritePlan
 * @property {string} path
 * @property {string} contents
 * @property {boolean} createOnly
 * @property {Buffer} [expectedOriginal] bytes captured before validation;
 *   a different current file is a concurrent edit and must never be overwritten
 */

/**
 * @typedef {object} PackageJsonUpdate
 * @property {string} contents
 * @property {Buffer} expectedOriginal
 */

/**
 * @typedef {object} PackageExportEntry
 * @property {string} subpath package export key, e.g. `./components/Card.tsx`
 * @property {string} target package-relative target, e.g. `./components/Card.tsx`
 */

/**
 * Compute one package.json update for an existing `files` allowlist and existing
 * `exports` map. Neither field is created: adding an exports map to a package
 * that has none would make every previously-open deep import private.
 *
 * @param {string} packageFile
 * @param {string[]} entries project-relative files or directories
 * @param {PackageExportEntry[]} [publicExports]
 * @returns {PackageJsonUpdate|null}
 */
export function packageJsonFilesUpdate(
  packageFile,
  entries,
  publicExports = [],
) {
  const expectedOriginal = fs.readFileSync(packageFile);
  const original = expectedOriginal.toString('utf-8');
  /** @type {any} */
  let pkg;
  try {
    pkg = JSON.parse(original);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new AstryxError(
      `Cannot update package.json: ${message}`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const normalize = (/** @type {string} */ value) =>
    projectPath(value).replace(/^\.\//u, '').replace(/\/$/u, '');
  let changed = false;

  if (pkg.files !== undefined) {
    if (
      !Array.isArray(pkg.files) ||
      pkg.files.some((/** @type {unknown} */ item) => typeof item !== 'string')
    ) {
      throw new AstryxError(
        'package.json files must be an array of strings before Astryx can add the contribution root.',
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
    for (const item of entries.map(normalize)) {
      if (
        pkg.files.some(
          (/** @type {string} */ value) => normalize(value) === item,
        )
      ) {
        continue;
      }
      pkg.files.push(item);
      changed = true;
    }
  }

  if (pkg.exports !== undefined && publicExports.length > 0) {
    const authored = pkg.exports;
    /** @type {Record<string, unknown>} */
    let exportsMap;
    if (
      authored == null ||
      typeof authored !== 'object' ||
      Array.isArray(authored)
    ) {
      exportsMap = {'.': authored};
    } else {
      const keys = Object.keys(authored);
      const hasSubpaths = keys.some(key => key.startsWith('.'));
      const hasConditions = keys.some(key => !key.startsWith('.'));
      if (hasSubpaths && hasConditions) {
        throw new AstryxError(
          'package.json exports mixes subpaths and conditions, so Astryx cannot add a contribution export safely.',
          undefined,
          ERROR_CODES.ERR_INTEGRATION_EXPORT_CONFLICT,
        );
      }
      exportsMap = hasConditions ? {'.': authored} : {...authored};
    }

    for (const {subpath, target} of publicExports) {
      const key = `./${normalize(subpath)}`;
      const value = `./${normalize(target)}`;
      if (Object.prototype.hasOwnProperty.call(exportsMap, key)) {
        if (exportsMap[key] !== value) {
          throw new AstryxError(
            `package.json exports already maps "${key}" to a different target; refusing to replace it with "${value}".`,
            undefined,
            ERROR_CODES.ERR_INTEGRATION_EXPORT_CONFLICT,
          );
        }
        continue;
      }
      exportsMap[key] = value;
      changed = true;
    }
    if (changed || exportsMap !== authored) pkg.exports = exportsMap;
  }

  if (!changed) return null;
  const indent = original.match(/\n([ \t]+)"/u)?.[1] ?? '  ';
  return {
    contents:
      JSON.stringify(pkg, null, indent) + (original.endsWith('\n') ? '\n' : ''),
    expectedOriginal,
  };
}

/**
 * Include one contribution root, the manifest, and any public source entries in
 * existing package allowlists.
 * @param {string} packageFile
 * @param {string} rootPath
 * @param {string} manifestName
 * @param {PackageExportEntry[]} [publicExports]
 * @returns {PackageJsonUpdate|null}
 */
export function packageJsonUpdate(
  packageFile,
  rootPath,
  manifestName,
  publicExports = [],
) {
  return packageJsonFilesUpdate(
    packageFile,
    [rootPath, manifestName],
    publicExports,
  );
}

// ── Atomic staged-write transaction ─────────────────────────────────

/** @param {string} file */
function removeTemporary(file) {
  try {
    fs.rmSync(file, {force: true});
  } catch {
    // Best effort. The transaction error remains the actionable failure.
  }
}

/**
 * Restore writes that already published.  Best-effort so callers preserve
 * the original actionable error.
 * @param {Array<WritePlan & {temporary: string, original: Buffer|null, mode: number}>} published
 */
function rollbackWrites(published) {
  for (const plan of [...published].reverse()) {
    let restore = null;
    try {
      const stat = fs.lstatSync(plan.path);
      if (stat.isSymbolicLink()) continue;
      const current = fs.readFileSync(plan.path);
      if (!current.equals(Buffer.from(plan.contents))) continue;
      if (plan.original == null) {
        fs.rmSync(plan.path, {force: true});
      } else {
        restore = path.join(
          path.dirname(plan.path),
          `.${path.basename(plan.path)}.restore-${randomUUID()}`,
        );
        fs.writeFileSync(restore, plan.original, {mode: plan.mode});
        fs.renameSync(restore, plan.path);
        restore = null;
      }
    } catch {
      // Best effort. A concurrent edit belongs to its writer, not this rollback.
    } finally {
      if (restore != null) removeTemporary(restore);
    }
  }
}

/** @param {string} file */
function assertNotSymlink(file) {
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch (error) {
    if (
      error instanceof Error &&
      /** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT'
    ) {
      return;
    }
    throw error;
  }
  if (stat.isSymbolicLink()) {
    throw new AstryxError(
      `Refusing to replace symlinked file ${file}.`,
      undefined,
      ERROR_CODES.ERR_PATH_TRAVERSAL,
    );
  }
}

/**
 * Apply several writes as one operation.  New files publish with an atomic
 * hard link so a racing creator is never overwritten; replacements are
 * rejected if their bytes changed after preflight or if the path is a symlink.
 * Returns a rollback function for a later step in the same transaction.
 *
 * @param {WritePlan[]} plans
 * @returns {() => void}
 */
export function applyWrites(plans) {
  /** @type {Array<WritePlan & {temporary: string, original: Buffer|null, mode: number}>} */
  const staged = [];
  /** @type {typeof staged} */
  const published = [];
  try {
    for (const plan of plans) {
      fs.mkdirSync(path.dirname(plan.path), {recursive: true});
      assertNotSymlink(plan.path);
      const exists = fs.existsSync(plan.path);
      if (plan.createOnly && exists) {
        throw new AstryxError(
          `Refusing to overwrite existing file ${plan.path}.`,
          undefined,
          ERROR_CODES.ERR_FILE_EXISTS,
        );
      }
      const original = exists ? fs.readFileSync(plan.path) : null;
      if (
        plan.expectedOriginal != null &&
        (original == null || !original.equals(plan.expectedOriginal))
      ) {
        throw new Error(`File changed while preparing: ${plan.path}`);
      }
      const mode = exists ? fs.statSync(plan.path).mode : 0o666;
      const temporary = path.join(
        path.dirname(plan.path),
        `.${path.basename(plan.path)}.tmp-${randomUUID()}`,
      );
      let descriptor;
      try {
        descriptor = fs.openSync(temporary, 'wx', mode);
        try {
          fs.writeFileSync(descriptor, plan.contents, 'utf-8');
        } finally {
          fs.closeSync(descriptor);
        }
      } catch (error) {
        removeTemporary(temporary);
        throw error;
      }
      staged.push({...plan, temporary, original, mode});
    }

    for (const plan of staged) {
      if (plan.original == null) {
        publishNewFile(plan.temporary, plan.path);
        published.push(plan);
        removeTemporary(plan.temporary);
        continue;
      } else {
        assertNotSymlink(plan.path);
        const current = fs.readFileSync(plan.path);
        if (!current.equals(plan.original)) {
          throw new Error(`File changed while writing: ${plan.path}`);
        }
        fs.renameSync(plan.temporary, plan.path);
      }
      published.push(plan);
    }
    return () => rollbackWrites(published);
  } catch (error) {
    for (const plan of staged) removeTemporary(plan.temporary);
    rollbackWrites(published);
    throw error;
  }
}

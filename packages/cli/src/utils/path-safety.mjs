// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path safety helpers.
 *
 * Centralizes path-traversal defenses, name sanitization, and
 * file-vs-directory detection used by CLI commands that write to
 * user-controlled output paths.
 *
 * Commands should use these helpers instead of constructing paths
 * directly with `path.resolve` / `path.join`, which silently re-root
 * absolute paths or allow traversal via `..`.
 */

import * as path from 'node:path';

/**
 * Error thrown by path-safety guards. Carries a stable `code`
 * so callers (CLI handlers) can render a friendly message and
 * exit cleanly without leaking stack traces.
 */
export class PathSafetyError extends Error {
  /**
   * @param {string} message
   * @param {string} code
   */
  constructor(message, code = 'PATH_UNSAFE') {
    super(message);
    this.name = 'PathSafetyError';
    this.code = code;
  }
}

/**
 * Resolve `targetPath` (relative to `rootDir`) and assert that the
 * result stays inside `rootDir`. Rejects:
 *
 *   - Absolute paths (e.g. `/tmp/x`) — re-rooted by `path.join` is silent;
 *     better to fail loudly. Pass `{allowAbsolute: true}` to opt in.
 *   - Paths that escape via `..` segments.
 *
 * Returns the resolved absolute path on success.
 *
 * @param {string} targetPath - User-provided path (relative or absolute).
 * @param {string} rootDir - Absolute path of the directory to constrain into.
 * @param {object} [options]
 * @param {boolean} [options.allowAbsolute=false] - If true, absolute paths
 *   are accepted *as long as* they resolve inside `rootDir`.
 * @param {string} [options.label='path'] - Human-readable name of the arg
 *   being checked (used in error messages, e.g. 'output directory').
 * @returns {string} Absolute resolved path inside `rootDir`.
 * @throws {PathSafetyError}
 */
export function assertWithin(targetPath, rootDir, options = {}) {
  const {allowAbsolute = false, label = 'path'} = options;

  if (typeof targetPath !== 'string' || targetPath.length === 0) {
    throw new PathSafetyError(`Invalid ${label}: must be a non-empty string`, 'PATH_INVALID');
  }

  if (path.isAbsolute(targetPath) && !allowAbsolute) {
    throw new PathSafetyError(
      `Invalid ${label} "${targetPath}": absolute paths are not allowed. ` +
        `Use a path relative to the project root.`,
      'PATH_ABSOLUTE',
    );
  }

  const absRoot = path.resolve(rootDir);
  const resolved = path.resolve(absRoot, targetPath);

  // Canonicalize for the "is inside" comparison. Use normalized paths
  // with a trailing separator so /root/foo doesn't match /rootbar.
  const rootWithSep = absRoot.endsWith(path.sep) ? absRoot : absRoot + path.sep;
  if (resolved !== absRoot && !resolved.startsWith(rootWithSep)) {
    throw new PathSafetyError(
      `Invalid ${label} "${targetPath}": resolves outside the project root ` +
        `(${absRoot}). Path traversal is not allowed.`,
      'PATH_TRAVERSAL',
    );
  }

  return resolved;
}

/**
 * Validate a "name" argument (e.g. theme name, component name) that will
 * be embedded in a generated filename. Rejects names containing path
 * separators, parent-segment markers, NUL bytes, leading dots, or any
 * character outside a conservative allow-list.
 *
 * Use this at the entry point of any command whose name arg flows into
 * `path.join(outDir, name + '.css')` etc.
 *
 * @param {string} name
 * @param {object} [options]
 * @param {string} [options.label='name']
 * @returns {string} The name (unchanged on success).
 * @throws {PathSafetyError}
 */
export function sanitizeName(name, options = {}) {
  const {label = 'name'} = options;

  if (typeof name !== 'string' || name.length === 0) {
    throw new PathSafetyError(`Invalid ${label}: must be a non-empty string`, 'NAME_INVALID');
  }

  if (name.includes('\0')) {
    throw new PathSafetyError(`Invalid ${label}: contains a NUL byte`, 'NAME_INVALID');
  }

  // Reject any path-segment characters. We don't try to rewrite — silent
  // sanitization hides intent. Fail loudly with a clear hint instead.
  if (/[\\/]/.test(name)) {
    throw new PathSafetyError(
      `Invalid ${label} "${name}": must not contain path separators ('/' or '\\\\').`,
      'NAME_HAS_SEPARATOR',
    );
  }

  if (name === '.' || name === '..' || name.startsWith('..')) {
    throw new PathSafetyError(
      `Invalid ${label} "${name}": must not be '.' or start with '..'.`,
      'NAME_TRAVERSAL',
    );
  }

  // Conservative allow-list: alphanumerics, dot, underscore, hyphen.
  // Theme/component names in this codebase already conform to this.
  if (!/^[A-Za-z0-9._-]+$/.test(name)) {
    throw new PathSafetyError(
      `Invalid ${label} "${name}": only letters, digits, '.', '_', and '-' are allowed.`,
      'NAME_BAD_CHARS',
    );
  }

  return name;
}

const FILE_EXTENSIONS = new Set([
  '.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs',
  '.css', '.scss', '.json', '.md', '.html',
]);

/**
 * Heuristic: does this CLI argument look like a file path (vs a directory)?
 *
 * Used by `xds template <name> <path>` so that
 *   `xds template blank ./foo.tsx`
 * writes to `./foo.tsx` as a file, not `./foo.tsx/page.tsx` (the old bug).
 *
 * Returns true when the basename has a known source/asset extension.
 * Conservative on purpose — unknown extensions still fall through to the
 * directory branch, matching pre-existing behavior for things like
 * `./out` or `./src/pages`.
 *
 * @param {string} pathArg
 * @returns {boolean}
 */
export function isFilePathArg(pathArg) {
  if (typeof pathArg !== 'string' || pathArg.length === 0) return false;
  // Trailing slash → explicit directory.
  if (/[\\/]$/.test(pathArg)) return false;
  const base = path.basename(pathArg);
  const ext = path.extname(base).toLowerCase();
  return ext.length > 0 && FILE_EXTENSIONS.has(ext);
}

/**
 * True when the process is running non-interactively (no TTY) or when the
 * caller has signaled JSON / scripted use. Commands consult this before
 * prompting for confirmation; in scripted mode they require an explicit
 * `--overwrite` flag instead.
 *
 * @param {object} [options]
 * @param {boolean} [options.json] - Caller's --json flag.
 * @returns {boolean}
 */
export function isNonInteractive({json = false} = {}) {
  if (json) return true;
  // stdin not a TTY means piped input or scripted execution.
  if (process.stdin && process.stdin.isTTY === false) return true;
  if (process.stdout && process.stdout.isTTY === false) return true;
  return false;
}

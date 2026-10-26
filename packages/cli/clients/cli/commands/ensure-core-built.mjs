// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared test helper: build @astryxdesign/core once, race-free.
 *
 * `astryx theme build` imports the compiled @astryxdesign/core/theme entry
 * (there is no in-CLI fallback generator), so any test exercising it needs a
 * built core. The CI `test` job runs `pnpm test` without a prior core build,
 * and Vitest runs test files in parallel worker forks. When two build-theme
 * suites each ran `if (!exists) pnpm -F @astryxdesign/core build` in their own
 * beforeAll, both workers saw dist missing and launched concurrent builds that
 * collided on the shared packages/core/dist: one worker cleaned dist while the
 * other was mid-write, failing nondeterministically ("Could not resolve
 * dist/index.js" / "ENOTEMPTY rmdir dist/hooks").
 *
 * This serializes the build behind a filesystem lock so exactly one worker
 * builds and the rest wait for it to finish before reading dist.
 *
 * A build older than Core's sources counts as missing: a reused worktree
 * checked out to a new head keeps its old dist, and the suites would
 * otherwise test the new CLI against the old theme build.
 */

import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../..',
);
const CORE_THEME_ENTRY = path.join(
  REPO_ROOT,
  'packages/core/dist/theme/index.js',
);
// What the build compiles: a file here newer than the built entry means dist
// is stale. A checkout rewrites the files it changes, so they read as newer.
const CORE_SOURCES = [
  path.join(REPO_ROOT, 'packages/core/src'),
  path.join(REPO_ROOT, 'packages/core/package.json'),
];
// A lock directory (mkdir is atomic across processes) guards the build.
const LOCK_DIR = path.join(os.tmpdir(), 'astryx-core-build.lock');

const BUILD_TIMEOUT_MS = 180_000;
// A lock older than this is assumed abandoned by a crashed/killed worker.
const STALE_LOCK_MS = BUILD_TIMEOUT_MS + 20_000;
const POLL_MS = 250;

/** @param {number} ms */
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Whether `entry` is missing or older than any file under `roots` (files or
 * directories; `node_modules` and `dist` are skipped).
 * @param {string} entry
 * @param {readonly string[]} roots
 * @returns {boolean}
 */
export function coreBuildIsStale(entry, roots) {
  let built;
  try {
    built = fs.statSync(entry).mtimeMs;
  } catch {
    return true;
  }
  const pending = [...roots];
  while (pending.length > 0) {
    const current = /** @type {string} */ (pending.pop());
    let stat;
    try {
      stat = fs.statSync(current);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(current)) {
        if (name !== 'node_modules' && name !== 'dist') {
          pending.push(path.join(current, name));
        }
      }
    } else if (stat.mtimeMs > built) {
      return true;
    }
  }
  return false;
}

/** Whether packages/core/dist holds a build of Core's current sources. */
function coreIsBuilt() {
  return !coreBuildIsStale(CORE_THEME_ENTRY, CORE_SOURCES);
}

function buildCore() {
  execFileSync('pnpm', ['-F', '@astryxdesign/core', 'build'], {
    cwd: REPO_ROOT,
    stdio: 'pipe',
    timeout: BUILD_TIMEOUT_MS,
  });
}

function lockIsStale() {
  try {
    return Date.now() - fs.statSync(LOCK_DIR).mtimeMs > STALE_LOCK_MS;
  } catch {
    // Vanished between the exists check and stat — treat as released.
    return false;
  }
}

/** Try to acquire the lock. Returns true if this worker now holds it. */
function tryAcquire() {
  try {
    fs.mkdirSync(LOCK_DIR);
    return true;
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code !== 'EEXIST') {
      throw err;
    }
    if (lockIsStale()) {
      fs.rmSync(LOCK_DIR, {recursive: true, force: true});
      try {
        fs.mkdirSync(LOCK_DIR);
        return true;
      } catch (retryErr) {
        if (/** @type {NodeJS.ErrnoException} */ (retryErr).code !== 'EEXIST') {
          throw retryErr;
        }
      }
    }
    return false;
  }
}

/**
 * Ensure packages/core/dist is built exactly once, even when called
 * concurrently from parallel Vitest workers. Safe to call from every
 * build-theme suite's beforeAll.
 */
export function ensureCoreBuilt() {
  if (coreIsBuilt()) {
    return;
  }

  const deadline = Date.now() + STALE_LOCK_MS;
  while (Date.now() < deadline) {
    if (coreIsBuilt()) {
      return;
    }
    if (tryAcquire()) {
      try {
        if (!coreIsBuilt()) {
          buildCore();
        }
      } finally {
        fs.rmSync(LOCK_DIR, {recursive: true, force: true});
      }
      return;
    }
    // Another worker is building; wait for it to finish and release the lock.
    sleepSync(POLL_MS);
  }

  // Waited past the stale threshold without the artifact appearing — build it
  // ourselves rather than let the suite fail on a missing entry.
  buildCore();
}

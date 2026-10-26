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
 * builds and the rest wait for it to release the lock before reading dist:
 * dist/theme/index.js appears long before the build's declarations do.
 *
 * A build older than Core's sources counts as missing: a reused worktree
 * checked out to a new head keeps its old dist, and the suites would
 * otherwise test the new CLI against the old theme build. The files the build
 * and the test setup generate from those sources are not sources.
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
// The translations live outside src, in locales.
export const CORE_SOURCES = [
  path.join(REPO_ROOT, 'packages/core/src'),
  path.join(REPO_ROOT, 'packages/core/locales'),
  path.join(REPO_ROOT, 'packages/core/package.json'),
];
// Git-ignored output generated from those sources, by the build and again by
// the Vitest global setup (internal/test-utils/src/globalSetup.ts): rewritten
// after a build, it would read as newer than that build.
export const CORE_GENERATED = [
  path.join(REPO_ROOT, 'packages/core/src/i18n/generated-locales'),
  path.join(REPO_ROOT, 'packages/core/locales/pseudo.json'),
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
 * directories; `node_modules`, `dist` and the paths in `generated` are
 * skipped).
 * @param {string} entry
 * @param {readonly string[]} roots
 * @param {readonly string[]} [generated]
 * @returns {boolean}
 */
export function coreBuildIsStale(entry, roots, generated = []) {
  let built;
  try {
    built = fs.statSync(entry).mtimeMs;
  } catch {
    return true;
  }
  const skipped = new Set(generated.map(p => path.resolve(p)));
  const pending = [...roots];
  while (pending.length > 0) {
    const current = /** @type {string} */ (pending.pop());
    if (skipped.has(path.resolve(current))) {
      continue;
    }
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
  return !coreBuildIsStale(CORE_THEME_ENTRY, CORE_SOURCES, CORE_GENERATED);
}

function buildCore() {
  execFileSync('pnpm', ['-F', '@astryxdesign/core', 'build'], {
    cwd: REPO_ROOT,
    stdio: 'pipe',
    timeout: BUILD_TIMEOUT_MS,
  });
}

/**
 * @param {string} lockDir
 * @param {number} staleLockMs
 */
function lockIsStale(lockDir, staleLockMs) {
  try {
    return Date.now() - fs.statSync(lockDir).mtimeMs > staleLockMs;
  } catch {
    // Vanished between the exists check and stat — treat as released.
    return false;
  }
}

/**
 * Whether another worker holds the lock: it is building, and dist is not
 * whole yet.
 * @param {string} lockDir
 * @param {number} staleLockMs
 */
function lockIsHeld(lockDir, staleLockMs) {
  return fs.existsSync(lockDir) && !lockIsStale(lockDir, staleLockMs);
}

/**
 * Try to acquire the lock. Returns true if this worker now holds it.
 * @param {string} lockDir
 * @param {number} staleLockMs
 */
function tryAcquire(lockDir, staleLockMs) {
  try {
    fs.mkdirSync(lockDir);
    return true;
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code !== 'EEXIST') {
      throw err;
    }
    if (lockIsStale(lockDir, staleLockMs)) {
      fs.rmSync(lockDir, {recursive: true, force: true});
      try {
        fs.mkdirSync(lockDir);
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
 * Run `build` unless `isBuilt()`, in exactly one process at a time: the one
 * holding `lockDir`. Every other caller returns only once no process holds
 * the lock and the build is current, so none reads a build still being
 * written.
 * @param {{isBuilt: () => boolean, build: () => void, lockDir: string, staleLockMs?: number, pollMs?: number}} options
 */
export function ensureBuiltOnce({
  isBuilt,
  build,
  lockDir,
  staleLockMs = STALE_LOCK_MS,
  pollMs = POLL_MS,
}) {
  const deadline = Date.now() + staleLockMs;
  while (Date.now() < deadline) {
    if (!lockIsHeld(lockDir, staleLockMs) && isBuilt()) {
      return;
    }
    if (tryAcquire(lockDir, staleLockMs)) {
      try {
        if (!isBuilt()) {
          build();
        }
      } finally {
        fs.rmSync(lockDir, {recursive: true, force: true});
      }
      return;
    }
    // Another worker is building; wait for it to release the lock.
    sleepSync(pollMs);
  }

  // Waited past the stale threshold without the lock coming free — build it
  // ourselves rather than let the suite fail on a missing entry.
  build();
}

/**
 * Ensure packages/core/dist is built exactly once, even when called
 * concurrently from parallel Vitest workers. Safe to call from every
 * build-theme suite's beforeAll.
 */
export function ensureCoreBuilt() {
  ensureBuiltOnce({isBuilt: coreIsBuilt, build: buildCore, lockDir: LOCK_DIR});
}

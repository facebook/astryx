// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared test helper: build a workspace package once, race-free.
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
 * `ensureChartsBuilt` is the same deal for @astryxdesign/charts: tests outside
 * packages/core run in the `node` Vitest project, which resolves workspace
 * packages through their published `exports` — i.e. dist. @astryxdesign/vega's
 * source imports @astryxdesign/charts for the shared categorical palette, so
 * its suites need charts compiled the same way the CLI suites need core.
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
const CHARTS_ENTRY = path.join(REPO_ROOT, 'packages/charts/dist/index.js');

// A lock directory (mkdir is atomic across processes) guards each build.
/** @param {string} slug */
function lockDir(slug) {
  return path.join(os.tmpdir(), `astryx-${slug}-build.lock`);
}

const BUILD_TIMEOUT_MS = 180_000;
// A lock older than this is assumed abandoned by a crashed/killed worker.
const STALE_LOCK_MS = BUILD_TIMEOUT_MS + 20_000;
const POLL_MS = 250;

/** @param {number} ms */
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** @param {string} pkg */
function buildPackage(pkg) {
  execFileSync('pnpm', ['-F', pkg, 'build'], {
    cwd: REPO_ROOT,
    stdio: 'pipe',
    timeout: BUILD_TIMEOUT_MS,
  });
}

/** @param {string} lock */
function lockIsStale(lock) {
  try {
    return Date.now() - fs.statSync(lock).mtimeMs > STALE_LOCK_MS;
  } catch {
    // Vanished between the exists check and stat — treat as released.
    return false;
  }
}

/**
 * Try to acquire the lock. Returns true if this worker now holds it.
 * @param {string} lock
 */
function tryAcquire(lock) {
  try {
    fs.mkdirSync(lock);
    return true;
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code !== 'EEXIST') {
      throw err;
    }
    if (lockIsStale(lock)) {
      fs.rmSync(lock, {recursive: true, force: true});
      try {
        fs.mkdirSync(lock);
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
 * Ensure a workspace package's dist is built exactly once, even when called
 * concurrently from parallel Vitest workers.
 *
 * @param {string} pkg package name passed to `pnpm -F`
 * @param {string} artifact absolute path proving the build ran
 * @param {string} slug lock name, unique per package
 */
function ensureBuilt(pkg, artifact, slug) {
  if (fs.existsSync(artifact)) {
    return;
  }

  const lock = lockDir(slug);
  const deadline = Date.now() + STALE_LOCK_MS;
  while (Date.now() < deadline) {
    if (fs.existsSync(artifact)) {
      return;
    }
    if (tryAcquire(lock)) {
      try {
        if (!fs.existsSync(artifact)) {
          buildPackage(pkg);
        }
      } finally {
        fs.rmSync(lock, {recursive: true, force: true});
      }
      return;
    }
    // Another worker is building; wait for it to finish and release the lock.
    sleepSync(POLL_MS);
  }

  // Waited past the stale threshold without the artifact appearing — build it
  // ourselves rather than let the suite fail on a missing entry.
  buildPackage(pkg);
}

/**
 * Ensure packages/core/dist is built exactly once, even when called
 * concurrently from parallel Vitest workers. Safe to call from every
 * build-theme suite's beforeAll.
 */
export function ensureCoreBuilt() {
  ensureBuilt('@astryxdesign/core', CORE_THEME_ENTRY, 'core');
}

/**
 * Ensure packages/charts/dist is built. Charts' own build resolves core's
 * types from packages/core/dist, so core is built first.
 */
export function ensureChartsBuilt() {
  ensureCoreBuilt();
  ensureBuilt('@astryxdesign/charts', CHARTS_ENTRY, 'charts');
}

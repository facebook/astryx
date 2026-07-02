// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Cross-process lock for tests that build packages into shared dist dirs.
 *
 * Three test files run a repo package build from beforeAll (scripts/
 * build-css.test.mjs, packages/cli/src/commands/build-theme.prose.test.mjs and
 * build-theme.import-path.test.mjs). Vitest runs test files in parallel worker
 * processes, so without coordination two of them can build @astryxdesign/core
 * into the same dist directory at once: one build's `rimraf dist` races the
 * other's output, failing with ENOTEMPTY or an unresolvable dist/index.js.
 *
 * withRepoBuildLock serializes those builds with an atomic lock directory
 * (fs.mkdirSync either creates it or throws), waiting for the holder to
 * finish before proceeding.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCK_DIR = path.join(REPO_ROOT, '.repo-build-lock');

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Run `fn` while holding the repo-wide build lock. Blocks (synchronously)
 * until the lock is free. If the lock is not released within `timeoutMs`,
 * throws with a hint about removing a stale lock left by a crashed process.
 *
 * @template T
 * @param {() => T} fn
 * @param {{timeoutMs?: number}} [options]
 * @returns {T}
 */
export function withRepoBuildLock(fn, {timeoutMs = 300_000} = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      fs.mkdirSync(LOCK_DIR);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      if (Date.now() > deadline) {
        throw new Error(
          `Timed out waiting for the repo build lock (${LOCK_DIR}). ` +
            'If no build is running, a crashed process may have left a stale ' +
            'lock; remove the directory and retry.',
        );
      }
      sleepSync(250);
    }
  }
  try {
    return fn();
  } finally {
    fs.rmdirSync(LOCK_DIR);
  }
}

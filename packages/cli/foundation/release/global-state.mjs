// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The global copy's update state, and the background check that keeps
 * it on the newest release.
 *
 * A CLI installed for the computer answers outside a project with the release
 * the registry tags `latest` (spec AST-081 FR6). It never waits for that: a run
 * reads the state saved here, answers with the newest verified release it
 * already has, and, at most once an hour, starts a detached check that installs
 * a newer release into the cache for the next run. The release it switched
 * from stays in the cache, so a failed check, install, or start leaves the
 * last good release answering.
 *
 *     <user cache>/astryx/global.json
 *       firstRunAt   when the global copy first ran (no check in the first hour)
 *       checkedAt    when the last check started
 *       latest       the version `latest` named at the last check
 *       current      the verified release outside-project runs answer with
 *       previous     the release before it
 *       notice       a switch not yet announced: {from, to} or {blockedBy}
 *
 * @input  the clock, the registry's `latest` tag (in the worker)
 * @output which cached release answers outside a project
 * @position foundation/release — read by the bin; the check runs in
 *   refresh-worker.mjs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
  userCacheDir,
  cachedRelease,
  ensureRelease,
  resolvePublishedVersion,
  tryLock,
  isReleaseVersion,
} from './cache.mjs';
import {readJson} from './project.mjs';

/** The shortest time between two checks of the `latest` tag. */
export const CHECK_INTERVAL_MS = 60 * 60_000;

/**
 * @typedef {object} GlobalNotice
 * @property {string} [from] the release that answered before
 * @property {string} [to] the release that answers now
 * @property {string} [blockedVersion] a newer release this computer's Node cannot run
 * @property {string} [blockedReason] why
 * @property {boolean} [announced] the blocked release was already reported
 */

/**
 * @typedef {object} GlobalState
 * @property {number} [firstRunAt]
 * @property {number} [checkedAt]
 * @property {string} [latest]
 * @property {string} [current]
 * @property {string} [previous]
 * @property {GlobalNotice | null} [notice]
 */

/**
 * The state file.
 * @param {string} [cacheDir]
 * @returns {string}
 */
export function stateFile(cacheDir = userCacheDir()) {
  return path.join(cacheDir, 'global.json');
}

/**
 * Read the saved state; an absent or broken file is an empty state.
 * @param {string} [cacheDir]
 * @returns {GlobalState}
 */
export function readGlobalState(cacheDir = userCacheDir()) {
  const state = readJson(stateFile(cacheDir));
  return state && typeof state === 'object' && !Array.isArray(state)
    ? state
    : {};
}

/**
 * Save the state atomically, merging `patch` into what is on disk now.
 * @param {Partial<GlobalState>} patch
 * @param {string} [cacheDir]
 * @returns {GlobalState}
 */
export function updateGlobalState(patch, cacheDir = userCacheDir()) {
  const next = {...readGlobalState(cacheDir), ...patch};
  const file = stateFile(cacheDir);
  try {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, `${JSON.stringify(next, null, 2)}\n`);
    fs.renameSync(tmp, file);
  } catch {
    // An unwritable cache never fails a run; the state is simply not kept.
  }
  return next;
}

/**
 * The newest release the global copy knows of, for `doctor`.
 * @param {string} [cacheDir]
 * @returns {string | null}
 */
export function knownLatestRelease(cacheDir = userCacheDir()) {
  const {latest} = readGlobalState(cacheDir);
  return isReleaseVersion(latest) ? latest : null;
}

/**
 * The cached release the global copy answers with outside a project, when
 * one is saved and still verified. Falls back to the previous release when the
 * current one has gone missing.
 * @param {string} [cacheDir]
 * @returns {import('./cache.mjs').CachedRelease | null}
 */
export function currentGlobalRelease(cacheDir = userCacheDir()) {
  const state = readGlobalState(cacheDir);
  for (const version of [state.current, state.previous]) {
    if (!isReleaseVersion(version)) continue;
    const release = cachedRelease(version, cacheDir);
    if (release) return release;
  }
  return null;
}

/**
 * Start the background check when one is due: never in the first hour after
 * the global copy's first run, then at most once an hour. The check runs in a
 * detached process with no output, so this returns at once.
 * @param {{cacheDir?: string, now?: number, start?: (worker: string, cacheDir: string) => void}} [options]
 * @returns {boolean} whether a check was started
 */
export function maybeStartCheck(options = {}) {
  const {
    cacheDir = userCacheDir(),
    now = Date.now(),
    start = startWorker,
  } = options;
  const state = readGlobalState(cacheDir);
  if (typeof state.firstRunAt !== 'number') {
    updateGlobalState({firstRunAt: now}, cacheDir);
    return false;
  }
  const last = Math.max(state.firstRunAt, state.checkedAt ?? 0);
  if (now - last < CHECK_INTERVAL_MS) return false;
  updateGlobalState({checkedAt: now}, cacheDir);
  start(
    fileURLToPath(new URL('./refresh-worker.mjs', import.meta.url)),
    cacheDir,
  );
  return true;
}

/**
 * Start the check detached from this run.
 * @param {string} worker
 * @param {string} cacheDir
 */
function startWorker(worker, cacheDir) {
  try {
    const child = spawn(process.execPath, [worker, cacheDir], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.on('error', () => {});
    child.unref();
  } catch {
    // A check that cannot start is the same as a failed check.
  }
}

/**
 * The check itself: ask the registry for `latest`, install and verify it in
 * the cache, then make it current. Only one check runs at a time. Called by
 * refresh-worker.mjs; exported for tests.
 * @param {{cacheDir?: string, run?: import('./cache.mjs').runNpm, resolve?: typeof resolvePublishedVersion, ensure?: typeof ensureRelease}} [options]
 * @returns {GlobalState}
 */
export function runCheck(options = {}) {
  const {
    cacheDir = userCacheDir(),
    resolve = resolvePublishedVersion,
    ensure = ensureRelease,
  } = options;
  const lockDir = path.join(cacheDir, '.lock-check');
  if (!tryLock(lockDir)) return readGlobalState(cacheDir);
  try {
    const latest = resolve('@astryxdesign/cli', 'latest');
    if (!latest) return readGlobalState(cacheDir);
    const state = updateGlobalState({latest}, cacheDir);
    if (state.current === latest && cachedRelease(latest, cacheDir)) {
      return state;
    }
    const release = ensure(latest, {cacheDir});
    if (!('bin' in release)) {
      if (/needs Node/.test(release.reason)) {
        const announced = state.notice?.blockedVersion === latest;
        return announced
          ? state
          : updateGlobalState(
              {notice: {blockedVersion: latest, blockedReason: release.reason}},
              cacheDir,
            );
      }
      return state;
    }
    return updateGlobalState(
      {
        current: latest,
        previous: state.current ?? undefined,
        notice: {from: state.current, to: latest},
      },
      cacheDir,
    );
  } finally {
    fs.rmSync(lockDir, {recursive: true, force: true});
  }
}

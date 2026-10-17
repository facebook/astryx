// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterEach} from 'vitest';
import {
  CHECK_INTERVAL_MS,
  currentGlobalRelease,
  knownLatestRelease,
  maybeStartCheck,
  readGlobalState,
  runCheck,
  updateGlobalState,
} from './global-state.mjs';
import {
  cleanupFixtures,
  seedRelease,
  tempDir,
} from '../../test-utils/release-fixtures.mjs';

afterEach(cleanupFixtures);

describe('maybeStartCheck', () => {
  it('never checks in the first hour, then at most once an hour', () => {
    const cacheDir = tempDir('cache');
    /** @type {number[]} */
    const started = [];
    const start = () => started.push(1);
    const t0 = 1_000_000;
    expect(maybeStartCheck({cacheDir, now: t0, start})).toBe(false);
    expect(
      maybeStartCheck({cacheDir, now: t0 + CHECK_INTERVAL_MS - 1, start}),
    ).toBe(false);
    expect(
      maybeStartCheck({cacheDir, now: t0 + CHECK_INTERVAL_MS, start}),
    ).toBe(true);
    expect(
      maybeStartCheck({cacheDir, now: t0 + CHECK_INTERVAL_MS + 10, start}),
    ).toBe(false);
    expect(
      maybeStartCheck({cacheDir, now: t0 + 2 * CHECK_INTERVAL_MS, start}),
    ).toBe(true);
    expect(started).toHaveLength(2);
  });
});

describe('runCheck', () => {
  it('installs a new latest, keeps the previous one, and leaves a notice', () => {
    const cacheDir = tempDir('cache');
    seedRelease(cacheDir, '0.7.2');
    updateGlobalState({current: '0.7.2'}, cacheDir);
    const state = runCheck({
      cacheDir,
      resolve: () => '0.7.3',
      ensure: version => {
        const dir = seedRelease(cacheDir, version);
        return {version, dir, cliDir: dir, coreDir: dir, bin: dir};
      },
    });
    expect(state).toMatchObject({
      latest: '0.7.3',
      current: '0.7.3',
      previous: '0.7.2',
      notice: {from: '0.7.2', to: '0.7.3'},
    });
    expect(currentGlobalRelease(cacheDir)?.version).toBe('0.7.3');
    expect(knownLatestRelease(cacheDir)).toBe('0.7.3');
  });

  it('follows the tag back down', () => {
    const cacheDir = tempDir('cache');
    seedRelease(cacheDir, '0.8.0');
    updateGlobalState({current: '0.8.0', latest: '0.8.0'}, cacheDir);
    runCheck({
      cacheDir,
      resolve: () => '0.7.9',
      ensure: version => {
        const dir = seedRelease(cacheDir, version);
        return {version, dir, cliDir: dir, coreDir: dir, bin: dir};
      },
    });
    expect(readGlobalState(cacheDir)).toMatchObject({
      current: '0.7.9',
      previous: '0.8.0',
    });
  });

  it('keeps the current release when the registry or the install fails', () => {
    const cacheDir = tempDir('cache');
    seedRelease(cacheDir, '0.7.2');
    updateGlobalState({current: '0.7.2'}, cacheDir);
    runCheck({cacheDir, resolve: () => null});
    runCheck({
      cacheDir,
      resolve: () => '0.7.3',
      ensure: version => ({
        version,
        reason: 'the registry could not be reached',
      }),
    });
    expect(readGlobalState(cacheDir)).toMatchObject({
      current: '0.7.2',
      latest: '0.7.3',
    });
    expect(readGlobalState(cacheDir).notice ?? null).toBeNull();
  });

  it('says once that a release needs a newer Node, and stays', () => {
    const cacheDir = tempDir('cache');
    seedRelease(cacheDir, '0.7.2');
    updateGlobalState({current: '0.7.2'}, cacheDir);
    const ensure = (/** @type {string} */ version) => ({
      version,
      reason: 'it needs Node >=24, and this computer runs Node 22.13.0',
    });
    runCheck({cacheDir, resolve: () => '0.8.0', ensure});
    expect(readGlobalState(cacheDir)).toMatchObject({
      current: '0.7.2',
      notice: {blockedVersion: '0.8.0'},
    });
  });

  it('does nothing while another check runs', () => {
    const cacheDir = tempDir('cache');
    updateGlobalState({current: '0.7.2'}, cacheDir);
    let asked = false;
    runCheck({
      cacheDir,
      resolve: () => {
        // A second check started while this one holds the lock.
        runCheck({
          cacheDir,
          resolve: () => {
            asked = true;
            return '9.9.9';
          },
        });
        return null;
      },
    });
    expect(asked).toBe(false);
  });
});

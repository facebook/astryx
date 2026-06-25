// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  getLatestVersion,
  getInstalledVersion,
  checkForUpdate,
} from './update-check.mjs';

let tmpDir;
const originalEnv = {};

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-update-check-'));
  // Save and clear env
  originalEnv.ASTRYX_LATEST_VERSION = process.env.ASTRYX_LATEST_VERSION;
  delete process.env.ASTRYX_LATEST_VERSION;
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  // Restore env
  if (originalEnv.ASTRYX_LATEST_VERSION !== undefined) {
    process.env.ASTRYX_LATEST_VERSION = originalEnv.ASTRYX_LATEST_VERSION;
  } else {
    delete process.env.ASTRYX_LATEST_VERSION;
  }
});

describe('getLatestVersion', () => {
  it('reads from ASTRYX_LATEST_VERSION env var', () => {
    process.env.ASTRYX_LATEST_VERSION = '0.0.8';
    expect(getLatestVersion(tmpDir)).toBe('0.0.8');
  });

  it('ignores invalid env var values', () => {
    process.env.ASTRYX_LATEST_VERSION = 'not-a-version';
    expect(getLatestVersion(tmpDir)).toBeNull();
  });

  it('returns null when no signals exist', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'test'}),
    );
    expect(getLatestVersion(tmpDir)).toBeNull();
  });
});

describe('getInstalledVersion', () => {
  it('reads @astryxdesign/core version from dependencies', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({dependencies: {'@astryxdesign/core': '^0.0.7'}}),
    );
    expect(getInstalledVersion(tmpDir)).toBe('0.0.7');
  });

  it('strips semver range prefix', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({dependencies: {'@astryxdesign/core': '~0.0.5'}}),
    );
    expect(getInstalledVersion(tmpDir)).toBe('0.0.5');
  });

  it('returns null when @astryxdesign/core is not a dependency', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({dependencies: {react: '^19.0.0'}}),
    );
    expect(getInstalledVersion(tmpDir)).toBeNull();
  });
});

describe('checkForUpdate', () => {
  it('returns hint when newer version is available', () => {
    process.env.ASTRYX_LATEST_VERSION = '0.0.8';
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({dependencies: {'@astryxdesign/core': '^0.0.7'}}),
    );

    const hint = checkForUpdate(tmpDir);
    expect(hint).toContain('0.0.8');
    expect(hint).toContain('astryx upgrade --from <old-version> --apply');
    expect(hint).toContain('FYI');
  });

  it('returns null when up to date', () => {
    process.env.ASTRYX_LATEST_VERSION = '0.0.7';
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({dependencies: {'@astryxdesign/core': '^0.0.7'}}),
    );

    expect(checkForUpdate(tmpDir)).toBeNull();
  });

  it('returns null when no latest version is known', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({dependencies: {'@astryxdesign/core': '^0.0.7'}}),
    );

    expect(checkForUpdate(tmpDir)).toBeNull();
  });

  it('uses semver (not lexicographic) comparison for double-digit patches', () => {
    // Regression: with string compare, '0.0.20' > '0.0.5' is false because
    // '2' < '5' lexicographically. Users on 0.0.5 would never be told that
    // 0.0.20 is available.
    process.env.ASTRYX_LATEST_VERSION = '0.0.20';
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({dependencies: {'@astryxdesign/core': '^0.0.5'}}),
    );

    const hint = checkForUpdate(tmpDir);
    expect(hint).toContain('0.0.20');
  });

  it('does not suggest an upgrade when latest < installed (semver)', () => {
    // The mirror-image bug: '0.0.9' > '0.0.10' is true under string compare,
    // so a stale env hint of 0.0.9 would falsely claim it's "newer" than 0.0.10.
    process.env.ASTRYX_LATEST_VERSION = '0.0.9';
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({dependencies: {'@astryxdesign/core': '^0.0.10'}}),
    );

    expect(checkForUpdate(tmpDir)).toBeNull();
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file prune-canaries.test.mjs
 * Unit tests for npm canary retention selection.
 */

import {describe, expect, it} from 'vitest';

import {
  getCanaryBaseVersion,
  isTaggedCanaryVersion,
  parseArgs,
  selectCanaryVersions,
} from './prune-canaries.mjs';

const NOW = Date.parse('2026-08-02T12:00:00.000Z');

function metadata() {
  return {
    versions: [
      '0.2.0',
      '0.2.0-canary.current1',
      '0.2.0-canary.current2',
      '0.1.9-canary.old1',
      '0.1.9-canary.old2',
      '0.2.0-beta.1',
    ],
    time: {
      '0.2.0': '2026-08-01T00:00:00.000Z',
      '0.2.0-canary.current1': '2026-07-20T00:00:00.000Z',
      '0.2.0-canary.current2': '2026-08-02T00:00:00.000Z',
      '0.1.9-canary.old1': '2026-07-20T00:00:00.000Z',
      '0.1.9-canary.old2': '2026-08-02T00:00:00.000Z',
      '0.2.0-beta.1': '2026-08-02T01:00:00.000Z',
    },
    'dist-tags': {
      latest: '0.2.0',
      canary: '0.2.0-canary.current2',
    },
  };
}

describe('canary version parsing', () => {
  it('matches only the requested prerelease tag', () => {
    expect(isTaggedCanaryVersion('0.2.1-canary.abc1234')).toBe(true);
    expect(isTaggedCanaryVersion('0.2.1-beta.1')).toBe(false);
    expect(isTaggedCanaryVersion('0.2.1')).toBe(false);
  });

  it('extracts the base version from a tagged canary', () => {
    expect(getCanaryBaseVersion('0.2.1-canary.abc1234')).toBe('0.2.1');
    expect(getCanaryBaseVersion('0.2.1-beta.1')).toBe(null);
  });
});

describe('selectCanaryVersions', () => {
  it('keeps every canary for the current stable version', () => {
    const result = selectCanaryVersions(metadata(), {nowMs: NOW});

    expect(result.currentVersion).toBe('0.2.0');
    expect(result.retainedVersions.sort()).toEqual([
      '0.2.0-canary.current1',
      '0.2.0-canary.current2',
    ]);
  });

  it('selects recent older-base canaries for unpublish', () => {
    const result = selectCanaryVersions(metadata(), {nowMs: NOW});

    expect(result.toUnpublish.map(entry => entry.version)).toEqual([
      '0.1.9-canary.old2',
    ]);
    expect(result.skippedTooOld.map(entry => entry.version)).toEqual([
      '0.1.9-canary.old1',
    ]);
  });

  it('can include older older-base canaries when explicitly requested', () => {
    const result = selectCanaryVersions(metadata(), {
      includeOlder: true,
      nowMs: NOW,
    });

    expect(result.toUnpublish.map(entry => entry.version)).toEqual([
      '0.1.9-canary.old1',
      '0.1.9-canary.old2',
    ]);
    expect(result.skippedTooOld).toEqual([]);
  });

  it('retains the active dist-tag version even if its base is older', () => {
    const data = metadata();
    data['dist-tags'].canary = '0.1.9-canary.old2';

    const result = selectCanaryVersions(data, {
      includeOlder: true,
      nowMs: NOW,
    });

    expect(result.retainedVersions.sort()).toEqual([
      '0.1.9-canary.old2',
      '0.2.0-canary.current1',
      '0.2.0-canary.current2',
    ]);
    expect(result.toUnpublish.map(entry => entry.version)).toEqual([
      '0.1.9-canary.old1',
    ]);
  });

  it('allows callers to override the current version', () => {
    const result = selectCanaryVersions(metadata(), {
      currentVersion: '0.1.9',
      includeOlder: true,
      nowMs: NOW,
    });

    expect(result.retainedVersions.sort()).toEqual([
      '0.1.9-canary.old1',
      '0.1.9-canary.old2',
      '0.2.0-canary.current2',
    ]);
    expect(result.toUnpublish.map(entry => entry.version)).toEqual([
      '0.2.0-canary.current1',
    ]);
  });
});

describe('parseArgs', () => {
  it('defaults to dry-run pruning of older base versions', () => {
    expect(parseArgs([])).toMatchObject({
      currentVersion: undefined,
      dryRun: true,
      tag: 'canary',
    });
  });

  it('parses destructive mode and package filters', () => {
    expect(
      parseArgs([
        '--yes',
        '--current-version',
        '0.2.0',
        '--package',
        '@astryxdesign/core',
        '--include-older',
      ]),
    ).toMatchObject({
      currentVersion: '0.2.0',
      dryRun: false,
      includeOlder: true,
      packageNames: ['@astryxdesign/core'],
    });
  });
});

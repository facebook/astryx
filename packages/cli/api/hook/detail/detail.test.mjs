// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the hook.detail leaf, run against the real
 * @astryxdesign/core registry. The list leaf is covered end-to-end by
 * cli/commands/detail-levels.test.mjs; this covers the single-hook detail
 * projection (envelope shape + the ERR_UNKNOWN_HOOK fuzzy-suggestion path).
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {detail} from './detail.mjs';

// api/hook/detail/ -> up 5 = repo root (has packages/core, which findCoreDir walks to).
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');

const SLOW = 30_000;

describe('hook.detail leaf', () => {
  it('resolves a real hook into a hook.detail envelope', async () => {
    const res = await detail('useMediaQuery', {cwd: REPO});
    expect(res.type).toBe('hook.detail');
    expect(res.data.name).toBe('useMediaQuery');
    // The full authored doc is projected verbatim, so params/returns arrays exist.
    expect(Array.isArray(res.data.params)).toBe(true);
    expect(Array.isArray(res.data.returns)).toBe(true);
  }, SLOW);

  it('throws ERR_UNKNOWN_HOOK with fuzzy suggestions for an unknown hook', async () => {
    let err;
    try {
      await detail('useNope', {cwd: REPO});
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe('ERR_UNKNOWN_HOOK');
    expect(err.message).toBe('No hook named "useNope"');
    expect(Array.isArray(err.suggestions)).toBe(true);
  }, SLOW);
});

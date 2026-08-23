// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the hook.detail.params leaf, run against the real
 * @astryxdesign/core registry. Covers the params projection (just the resolved
 * doc's params array) and the shared ERR_UNKNOWN_HOOK path.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {params} from './params.mjs';

// api/hook/detail/params/ -> up 6 = repo root (has packages/core).
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..');

const SLOW = 30_000;

describe('hook.detail.params leaf', () => {
  it('projects only the params array into a hook.detail.params envelope', async () => {
    const res = await params('useMediaQuery', {cwd: REPO});
    expect(res.type).toBe('hook.detail.params');
    expect(Array.isArray(res.data)).toBe(true);
    // useMediaQuery takes a single `query` string parameter.
    expect(res.data[0].name).toBe('query');
  }, SLOW);

  it('throws ERR_UNKNOWN_HOOK for an unknown hook', async () => {
    let err;
    try {
      await params('useNope', {cwd: REPO});
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe('ERR_UNKNOWN_HOOK');
    expect(Array.isArray(err.suggestions)).toBe(true);
  }, SLOW);
});

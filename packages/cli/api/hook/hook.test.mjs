// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Dispatcher-level tests for hook() — the argument-shape routing above
 * the list/detail/params leaves. The leaves have their own tests; this pins the
 * router: no name / --list / --category -> hook.list, bare name -> hook.detail,
 * --params -> hook.detail.params, an unknown --category -> ERR_UNKNOWN_CATEGORY,
 * and a non-string name -> a coded ERR_UNKNOWN_HOOK (not a raw TypeError).
 * Runs against the real @astryxdesign/core hooks.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {hook} from './hook.mjs';
import {AstryxError} from '../error.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const cwd = REPO;
const SLOW = 30_000;

describe('hook() dispatcher routing', () => {
  it('no name -> hook.list', async () => {
    const r = await hook(undefined, {cwd});
    expect(r.type).toBe('hook.list');
    expect(r.data.components).toBeDefined();
  }, SLOW);

  it('--list -> hook.list', async () => {
    expect((await hook(undefined, {cwd, list: true})).type).toBe('hook.list');
  }, SLOW);

  it('--category (known) -> filtered hook.list', async () => {
    const all = await hook(undefined, {cwd});
    const someCategory = Object.keys(all.data.components)[0];
    const r = await hook(undefined, {cwd, category: someCategory});
    expect(r.type).toBe('hook.list');
    expect(Object.keys(r.data.components)).toEqual([someCategory]);
  }, SLOW);

  it('--category (unknown) -> ERR_UNKNOWN_CATEGORY', async () => {
    await expect(
      hook(undefined, {cwd, category: 'zzz-not-a-real-category'}),
    ).rejects.toMatchObject({code: 'ERR_UNKNOWN_CATEGORY'});
  }, SLOW);

  it('bare name -> hook.detail', async () => {
    expect((await hook('useMediaQuery', {cwd})).type).toBe('hook.detail');
  }, SLOW);

  it('--params -> hook.detail.params', async () => {
    expect((await hook('useMediaQuery', {cwd, params: true})).type).toBe(
      'hook.detail.params',
    );
  }, SLOW);

  it('a non-string name throws a coded error (not a raw TypeError)', async () => {
    for (const bad of [42, {}, [1]]) {
      const err = await hook(/** @type {any} */ (bad), {cwd}).catch(e => e);
      expect(err).toBeInstanceOf(AstryxError);
      expect(err.code).toBe('ERR_UNKNOWN_HOOK');
    }
  }, SLOW);

  it('a non-string category throws a coded error (not a raw TypeError)', async () => {
    for (const bad of [123, {}, [1]]) {
      const err = await hook(undefined, {
        cwd,
        category: /** @type {any} */ (bad),
      }).catch(e => e);
      expect(err).toBeInstanceOf(AstryxError);
      expect(err.code).toBe('ERR_UNKNOWN_CATEGORY');
    }
  }, SLOW);
});

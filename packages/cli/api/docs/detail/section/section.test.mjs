// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the docs.detail.section leaf. Locks the happy path,
 * case-insensitive title match, ERR_UNKNOWN_SECTION, and the empty-section guard
 * (regression: '' matched every title via .includes(''), silently returning the
 * first section).
 */

import {describe, it, expect} from 'vitest';
import {section} from './section.mjs';
import {AstryxError} from '../../../error.mjs';

const SLOW = 30_000;

describe('docs.detail.section leaf', () => {
  it('resolves a named section (case-insensitive) into a docs.detail.section envelope', async () => {
    const res = await section('tokens', 'spacing');
    expect(res.type).toBe('docs.detail.section');
    expect(res.data.title.toLowerCase()).toContain('spacing');
  }, SLOW);

  it('throws ERR_UNKNOWN_SECTION for an unknown section', async () => {
    let err;
    try {
      await section('tokens', 'zzzznope');
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_UNKNOWN_SECTION');
  }, SLOW);

  it('does not return the first section for an empty section name', async () => {
    await expect(section('tokens', '')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_SECTION',
    });
    await expect(section('tokens', '   ')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_SECTION',
    });
  }, SLOW);
});

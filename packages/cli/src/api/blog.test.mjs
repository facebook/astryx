// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the blog API — lists posts and prints one by slug, against
 * the CLI's own blog content (the source of truth).
 */

import {describe, it, expect} from 'vitest';
import {blog} from './blog.mjs';
import {AstryxError} from './error.mjs';

describe('blog API', () => {
  it('lists posts with metadata only (no body)', () => {
    const res = blog();
    expect(res.type).toBe('blog.list');
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThanOrEqual(1);
    for (const p of res.data) {
      expect(typeof p.slug).toBe('string');
      expect(typeof p.title).toBe('string');
      expect(p.body).toBeUndefined();
    }
  });

  it('prints a single post with its body by slug', () => {
    const res = blog('introducing-astryx');
    expect(res.type).toBe('blog.detail');
    expect(res.data.slug).toBe('introducing-astryx');
    expect(typeof res.data.body).toBe('string');
    expect(res.data.body.length).toBeGreaterThan(0);
  });

  it('is case-insensitive on the slug', () => {
    const res = blog('Introducing-Astryx');
    expect(res.data.slug).toBe('introducing-astryx');
  });

  it('throws ERR_UNKNOWN_POST with suggestions for a bad slug', () => {
    try {
      blog('does-not-exist');
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(AstryxError);
      expect(e.code).toBe('ERR_UNKNOWN_POST');
      expect(Array.isArray(e.suggestions)).toBe(true);
    }
  });
});

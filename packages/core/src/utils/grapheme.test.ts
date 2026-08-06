// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file grapheme.test.ts
 * @input grapheme utilities
 * @output Tests for graphemeLength, firstGrapheme, truncateGraphemes
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {graphemeLength, firstGrapheme, truncateGraphemes} from './grapheme';

// Multi-code-unit fixtures: an emoji surrogate pair (2 units), a flag
// sequence (4 units), a ZWJ family (11 units), and a combining mark (2 units).
const EMOJI = '\u{1F600}'; // 😀
const FLAG = '\u{1F1F9}\u{1F1F7}'; // 🇹🇷
const FAMILY = '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}'; // 👨‍👩‍👧‍👦
const E_ACUTE = 'é'; // é as base + combining mark

describe('graphemeLength', () => {
  it('returns 0 for the empty string', () => {
    expect(graphemeLength('')).toBe(0);
  });

  it('counts ASCII one per character', () => {
    expect(graphemeLength('hello')).toBe(5);
  });

  it('counts an emoji surrogate pair as one', () => {
    expect(graphemeLength(EMOJI.repeat(2))).toBe(2);
    expect(EMOJI.repeat(2).length).toBe(4); // sanity: code units differ
  });

  it('counts a flag sequence as one', () => {
    expect(graphemeLength(FLAG)).toBe(1);
  });

  it('counts a ZWJ family emoji as one', () => {
    expect(graphemeLength(FAMILY)).toBe(1);
    expect(FAMILY.length).toBe(11); // sanity: code units differ
  });

  it('counts a combining-mark character as one', () => {
    expect(graphemeLength(E_ACUTE)).toBe(1);
  });

  it('counts mixed content by user-perceived characters', () => {
    expect(graphemeLength(`a${EMOJI}b`)).toBe(3);
  });
});

describe('firstGrapheme', () => {
  it('returns the empty string for the empty string', () => {
    expect(firstGrapheme('')).toBe('');
  });

  it('returns the first ASCII character', () => {
    expect(firstGrapheme('abc')).toBe('a');
  });

  it('returns a whole emoji, not half a surrogate pair', () => {
    expect(firstGrapheme(`${EMOJI}x`)).toBe(EMOJI);
  });

  it('returns a whole ZWJ family emoji', () => {
    expect(firstGrapheme(`${FAMILY}x`)).toBe(FAMILY);
  });

  it('keeps a combining mark attached to its base', () => {
    expect(firstGrapheme(`${E_ACUTE}cole`)).toBe(E_ACUTE);
  });
});

describe('truncateGraphemes', () => {
  it('returns strings within max unchanged', () => {
    expect(truncateGraphemes('abc', 5)).toBe('abc');
  });

  it('returns strings exactly at max unchanged', () => {
    expect(truncateGraphemes('abcde', 5)).toBe('abcde');
  });

  it('truncates so the result, including the ellipsis, is max graphemes', () => {
    expect(truncateGraphemes('abcdefghij', 5)).toBe('abcd…');
  });

  it('counts a multi-character ellipsis against max', () => {
    // "..." is 3 graphemes, so 5 content graphemes remain.
    expect(truncateGraphemes('aaaaaaaaaa', 8, '...')).toBe('aaaaa...');
  });

  it('passes strings within max through under a multi-character ellipsis', () => {
    expect(truncateGraphemes('aaaaaaaa', 8, '...')).toBe('aaaaaaaa');
  });

  it('cuts by graphemes, never splitting an emoji', () => {
    // The exact-string assertion also proves no surrogate pair was split.
    expect(truncateGraphemes(EMOJI.repeat(4), 3)).toBe(`${EMOJI.repeat(2)}…`);
  });

  it('treats a ZWJ family emoji as a single unit when cutting', () => {
    expect(truncateGraphemes(`${FAMILY}abc`, 2)).toBe(`${FAMILY}…`);
  });

  it('returns the empty string unchanged', () => {
    expect(truncateGraphemes('', 5)).toBe('');
  });

  it('degrades to just the ellipsis when max is smaller than the ellipsis', () => {
    // Documented degenerate behavior: no consumer passes max below the
    // ellipsis length, but the clamp must stay predictable.
    expect(truncateGraphemes('abcdef', 2, '...')).toBe('...');
    expect(truncateGraphemes('abcdef', 0)).toBe('…');
  });
});

describe('code-point fallback (no Intl.Segmenter)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('keeps surrogate pairs intact while counting by code points', async () => {
    vi.resetModules();
    // grapheme.ts only reads Intl.Segmenter, so a minimal stub suffices.
    vi.stubGlobal('Intl', {Segmenter: undefined});
    const fallback = await import('./grapheme');

    expect(fallback.graphemeLength(EMOJI.repeat(2))).toBe(2);
    expect(fallback.firstGrapheme(`${EMOJI}x`)).toBe(EMOJI);
    expect(fallback.truncateGraphemes(EMOJI.repeat(4), 3)).toBe(
      `${EMOJI.repeat(2)}…`,
    );
    // Documented degradation: a flag sequence splits into its two
    // regional-indicator code points under the fallback.
    expect(fallback.graphemeLength(FLAG)).toBe(2);
  });
});

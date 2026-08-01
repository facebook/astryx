// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file delimiters.test.ts
 * @input Uses vitest, delimiters
 * @output Unit tests for the delimiter-splitting module
 * @position Testing; validates delimiters.ts
 *
 * SYNC: When delimiters.ts changes, update tests to match
 */

import {describe, it, expect} from 'vitest';
import {
  escapeDelimiter,
  toDelimiterPattern,
  splitOnDelimiters,
} from './delimiters';

describe('escapeDelimiter', () => {
  it('escapes every regex metacharacter', () => {
    // Each of these would otherwise change the meaning of the joined pattern.
    expect(escapeDelimiter('.')).toBe('\\.');
    expect(escapeDelimiter('*')).toBe('\\*');
    expect(escapeDelimiter('+')).toBe('\\+');
    expect(escapeDelimiter('?')).toBe('\\?');
    expect(escapeDelimiter('^')).toBe('\\^');
    expect(escapeDelimiter('$')).toBe('\\$');
    expect(escapeDelimiter('{')).toBe('\\{');
    expect(escapeDelimiter('}')).toBe('\\}');
    expect(escapeDelimiter('(')).toBe('\\(');
    expect(escapeDelimiter(')')).toBe('\\)');
    expect(escapeDelimiter('|')).toBe('\\|');
    expect(escapeDelimiter('[')).toBe('\\[');
    expect(escapeDelimiter(']')).toBe('\\]');
    expect(escapeDelimiter('\\')).toBe('\\\\');
  });

  it('leaves ordinary characters untouched', () => {
    expect(escapeDelimiter(',')).toBe(',');
    expect(escapeDelimiter(';')).toBe(';');
    expect(escapeDelimiter(', ')).toBe(', ');
  });
});

describe('toDelimiterPattern', () => {
  it('returns null for an empty list (the off switch)', () => {
    expect(toDelimiterPattern([])).toBeNull();
  });

  it('returns null for a list of only empty strings', () => {
    expect(toDelimiterPattern([''])).toBeNull();
    expect(toDelimiterPattern(['', ''])).toBeNull();
  });

  it('matches string delimiters literally, not as patterns', () => {
    // A '.' delimiter must split only on dots, not on every character.
    const pattern = toDelimiterPattern(['.']);
    expect(splitOnDelimiters('a.b', pattern)).toEqual(['a', 'b']);
    expect(splitOnDelimiters('axb', pattern)).toBeNull();
  });

  it('sorts longest-first so a multi-char delimiter wins over its prefix', () => {
    // Shorter delimiter listed FIRST — without a longest-first sort the
    // alternation would match the bare ',' and leave " b" as a segment. The
    // sort must make ", " win regardless of input order.
    const pattern = toDelimiterPattern([',', ', ']);
    expect(splitOnDelimiters('a, b', pattern)).toEqual(['a', 'b']);
  });

  it('rebuilds a RegExp with a global flag and without sticky', () => {
    const pattern = toDelimiterPattern(/[,;]/y);
    expect(pattern).not.toBeNull();
    expect(pattern!.global).toBe(true);
    expect(pattern!.sticky).toBe(false);
  });
});

describe('splitOnDelimiters', () => {
  it('returns null when the pattern is null', () => {
    expect(splitOnDelimiters('a,b', null)).toBeNull();
  });

  it('returns null (identity signal) when no delimiter is present', () => {
    // A single value with no delimiter must be left untouched by the caller —
    // this is how "paste NewTag still shows Create" keeps working.
    expect(
      splitOnDelimiters('NewTag', toDelimiterPattern([',', '\n'])),
    ).toBeNull();
  });

  it('splits a delimited string into raw segments', () => {
    expect(splitOnDelimiters('a,b,c', toDelimiterPattern([',']))).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('keeps the trailing segment after the final delimiter', () => {
    // "alice," -> the empty trailing segment is preserved here; the caller
    // drops it after trimming.
    expect(splitOnDelimiters('alice,', toDelimiterPattern([',']))).toEqual([
      'alice',
      '',
    ]);
  });

  it('preserves empty segments from consecutive delimiters (raw)', () => {
    expect(splitOnDelimiters('a,,b', toDelimiterPattern([',']))).toEqual([
      'a',
      '',
      'b',
    ]);
  });

  it('ignores capture groups in a RegExp (never emits the delimiter itself)', () => {
    // String.prototype.split(/(,)/) would yield ['a', ',', 'b']; the exec loop
    // must not mint a ',' token from a user's capturing pattern.
    expect(splitOnDelimiters('a,b', /(,)/)).toEqual(['a', 'b']);
    expect(splitOnDelimiters('a,b', /(,)/)).not.toContain(',');
  });

  it('terminates on a zero-width-matching pattern', () => {
    // /,*/ matches empty everywhere; the guard must advance lastIndex so this
    // cannot spin forever.
    expect(() => splitOnDelimiters('abc', /,*/)).not.toThrow();
  });

  it('treats a pattern that only zero-width-matches as no delimiter', () => {
    // /,*/ (a plausible mistyping of /,+/) matches empty at every position.
    // An empty match delimits nothing — reporting "delimiter found" here
    // would tokenize every keystroke into single-character tokens.
    expect(splitOnDelimiters('abc', /,*/)).toBeNull();
    expect(splitOnDelimiters('abc', /\s*/)).toBeNull();
  });

  it('splits on the real matches of a zero-width-capable pattern', () => {
    // Where /,*/ does consume text it behaves like /,+/ — the empty matches
    // between characters contribute no extra segments.
    expect(splitOnDelimiters('a,b', /,*/)).toEqual(['a', 'b']);
    expect(splitOnDelimiters('a,,b', /,*/)).toEqual(['a', 'b']);
  });

  it('terminates on astral text under a u-flag zero-width-capable pattern', () => {
    // Skipping an empty match one code UNIT at a time lands mid-surrogate,
    // where a u-flag regex re-matches empty at the same code point — the loop
    // never advances (frozen tab). The skip must step a whole code point.
    expect(splitOnDelimiters('💥x', /,?/u)).toBeNull();
    expect(splitOnDelimiters('💥,x', /,?/u)).toEqual(['💥', 'x']);
    expect(splitOnDelimiters('a💥b,c', /,*/u)).toEqual(['a💥b', 'c']);
  });

  it('gives the same result twice for a shared RegExp instance (lastIndex reset)', () => {
    const shared = /[,\n]/g;
    const first = splitOnDelimiters('a,b', shared);
    const second = splitOnDelimiters('a,b', shared);
    expect(first).toEqual(['a', 'b']);
    expect(second).toEqual(['a', 'b']);
  });

  it('splits on newline', () => {
    expect(splitOnDelimiters('a\nb', toDelimiterPattern([',', '\n']))).toEqual([
      'a',
      'b',
    ]);
  });
});

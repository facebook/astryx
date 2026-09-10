// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createRequire} from 'node:module';

const {inline, num, safeUrl} = createRequire(import.meta.url)('./report-text.js');

describe('inline', () => {
  it('passes ordinary values through', () => {
    expect(inline('core-button--default')).toBe('core-button--default');
    expect(inline(42)).toBe('42');
  });

  it('renders empty for missing values', () => {
    expect(inline(null)).toBe('');
    expect(inline(undefined)).toBe('');
  });

  it('keeps a multi-line value on one line', () => {
    expect(inline('first\nsecond\r\nthird')).toBe('first second third');
  });

  it('renders HTML tags as literal text', () => {
    expect(inline('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('renders markdown punctuation as literal text', () => {
    expect(inline('a|b')).toBe('a\\|b');
    expect(inline('`code`')).toBe('\\`code\\`');
    expect(inline('[text]')).toBe('\\[text\\]');
    expect(inline('**loud**')).toBe('\\*\\*loud\\*\\*');
  });
});

describe('num', () => {
  it('passes finite numbers through', () => {
    expect(num(7)).toBe(7);
    expect(num('7')).toBe(7);
    expect(num(0)).toBe(0);
  });

  it('falls back for everything else', () => {
    expect(num('seven')).toBe(0);
    expect(num(undefined)).toBe(0);
    expect(num(Infinity, 3)).toBe(3);
  });
});

describe('safeUrl', () => {
  it('accepts a plain absolute URL', () => {
    expect(safeUrl('https://dequeuniversity.com/rules/axe/4.10/list')).toBe(
      'https://dequeuniversity.com/rules/axe/4.10/list',
    );
    expect(safeUrl('  https://example.com/a?b=c#d  ')).toBe('https://example.com/a?b=c#d');
  });

  it('rejects anything that is not one', () => {
    expect(safeUrl('not a url')).toBeNull();
    expect(safeUrl('ftp://example.com/x')).toBeNull();
    expect(safeUrl('/relative/path')).toBeNull();
    expect(safeUrl('https://example.com/a"b')).toBeNull();
    expect(safeUrl('https://example.com/a)b')).toBeNull();
    expect(safeUrl('https://example.com/a b')).toBeNull();
    expect(safeUrl(null)).toBeNull();
  });
});

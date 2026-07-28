// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the inline-markdown tokenizer used by authored docs.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import {describe, it, expect} from 'vitest';
import {tokenizeInline} from '../components/docs/inlineTokens';

describe('tokenizeInline', () => {
  it('returns a single text token for plain prose', () => {
    expect(tokenizeInline('just words')).toEqual([
      {type: 'text', value: 'just words'},
    ]);
  });

  it('returns nothing for an empty string', () => {
    expect(tokenizeInline('')).toEqual([]);
  });

  it('splits code spans out of the surrounding text', () => {
    expect(tokenizeInline('use `light-dark()` here')).toEqual([
      {type: 'text', value: 'use '},
      {type: 'code', value: 'light-dark()'},
      {type: 'text', value: ' here'},
    ]);
  });

  it('splits links out of the surrounding text', () => {
    expect(tokenizeInline('see [Button](/components/Button) now')).toEqual([
      {type: 'text', value: 'see '},
      {
        type: 'link',
        href: '/components/Button',
        label: 'Button',
        isCodeLabel: false,
      },
      {type: 'text', value: ' now'},
    ]);
  });

  it('marks a backticked link label as a code label and unwraps it', () => {
    expect(
      tokenizeInline('[`<InternationalizationProvider>`](/components/X)'),
    ).toEqual([
      {
        type: 'link',
        href: '/components/X',
        label: '<InternationalizationProvider>',
        isCodeLabel: true,
      },
    ]);
  });

  it('only treats a label as code when the whole label is one span', () => {
    expect(tokenizeInline('[the `Button` prop](/x)')).toEqual([
      {
        type: 'link',
        href: '/x',
        label: 'the `Button` prop',
        isCodeLabel: false,
      },
    ]);
  });

  it('handles a code span adjacent to a link', () => {
    expect(tokenizeInline('`a`[`b`](/c)')).toEqual([
      {type: 'code', value: 'a'},
      {type: 'link', href: '/c', label: 'b', isCodeLabel: true},
    ]);
  });

  it('keeps an unpaired backtick as literal text', () => {
    expect(tokenizeInline('a ` b')).toEqual([{type: 'text', value: 'a ` b'}]);
  });

  it('keeps external and internal hrefs verbatim', () => {
    expect(
      tokenizeInline('[MDN](https://developer.mozilla.org/en-US/)'),
    ).toEqual([
      {
        type: 'link',
        href: 'https://developer.mozilla.org/en-US/',
        label: 'MDN',
        isCodeLabel: false,
      },
    ]);
  });
});

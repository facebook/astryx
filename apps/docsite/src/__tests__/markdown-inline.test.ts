// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  parseInlineMarkdown,
  splitMarkdownParagraphs,
} from '../components/markdownInline';

describe('docsite inline markdown', () => {
  it('parses inline code, bold text, and links in authored doc text', () => {
    expect(
      parseInlineMarkdown(
        'Use `value` with **controlled state** and [docs](/docs/theme).',
      ),
    ).toEqual([
      {kind: 'text', text: 'Use '},
      {kind: 'code', text: 'value'},
      {kind: 'text', text: ' with '},
      {kind: 'strong', children: [{kind: 'text', text: 'controlled state'}]},
      {kind: 'text', text: ' and '},
      {
        kind: 'link',
        href: '/docs/theme',
        children: [{kind: 'text', text: 'docs'}],
      },
      {kind: 'text', text: '.'},
    ]);
  });

  it('leaves unsafe markdown links as literal text', () => {
    expect(parseInlineMarkdown('[bad](javascript:alert(1))')).toEqual([
      {kind: 'text', text: '[bad](javascript:alert(1))'},
    ]);
  });

  it('leaves unclosed markdown delimiters as literal text', () => {
    expect(parseInlineMarkdown('Use **bold markers literally')).toEqual([
      {kind: 'text', text: 'Use **bold markers literally'},
    ]);
  });

  it('keeps authored paragraph breaks and folds soft line breaks', () => {
    expect(
      splitMarkdownParagraphs('First line\nwraps.\n\nSecond paragraph.'),
    ).toEqual(['First line wraps.', 'Second paragraph.']);
  });
});

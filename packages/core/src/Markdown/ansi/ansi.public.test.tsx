// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expectTypeOf, it} from 'vitest';
import {
  markdownAnsiDefaultPalette,
  type MarkdownAnsiCodeBlockProps,
  type MarkdownAnsiPalette,
} from './index';

describe('Markdown ANSI public API', () => {
  it('exports a complete theme-aware palette', () => {
    expectTypeOf(
      markdownAnsiDefaultPalette,
    ).toMatchTypeOf<MarkdownAnsiPalette>();
  });

  it('keeps source and token rendering under adapter ownership', () => {
    function compileOnlyGuards() {
      const code: MarkdownAnsiCodeBlockProps = {
        // @ts-expect-error ANSI removes controls before setting CodeBlock code
        code: 'override',
      };
      const language: MarkdownAnsiCodeBlockProps = {
        // @ts-expect-error ANSI owns its language label
        language: 'text',
      };
      const tokenizer: MarkdownAnsiCodeBlockProps = {
        // @ts-expect-error ANSI owns tokenization
        tokenizer: () => [],
      };
      const highlightMode: MarkdownAnsiCodeBlockProps = {
        // @ts-expect-error styled ANSI tokens always use spans
        highlightMode: 'ranges',
      };
      return {code, highlightMode, language, tokenizer};
    }

    expectTypeOf(compileOnlyGuards).toBeFunction();
  });
});

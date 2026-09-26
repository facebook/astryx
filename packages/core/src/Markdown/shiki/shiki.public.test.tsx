// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, expectTypeOf, it} from 'vitest';
import {
  markdownShikiDefaultLanguages,
  type MarkdownShikiCodeBlockProps,
  type MarkdownShikiPluginOptions,
} from './index';
import type {BundledLanguage} from 'shiki';

describe('Markdown Shiki public API', () => {
  it('exports a typed default language set and theme options', () => {
    expectTypeOf(markdownShikiDefaultLanguages).toMatchTypeOf<
      ReadonlyArray<BundledLanguage>
    >();
    expect(markdownShikiDefaultLanguages).not.toContain('mermaid');
    expect(markdownShikiDefaultLanguages).not.toContain('ansi');
    expectTypeOf<MarkdownShikiPluginOptions['theme']>().toMatchTypeOf<
      string | undefined
    >();
  });

  it('keeps source and token rendering under adapter ownership', () => {
    function compileOnlyGuards() {
      const code: MarkdownShikiCodeBlockProps = {
        // @ts-expect-error Shiki owns CodeBlock source
        code: 'override',
      };
      const language: MarkdownShikiCodeBlockProps = {
        // @ts-expect-error the claimed fence owns its language
        language: 'text',
      };
      const tokenizer: MarkdownShikiCodeBlockProps = {
        // @ts-expect-error Shiki owns tokenization
        tokenizer: () => [],
      };
      const highlightMode: MarkdownShikiCodeBlockProps = {
        // @ts-expect-error Shiki tokens use span rendering when ready
        highlightMode: 'ranges',
      };
      return {code, highlightMode, language, tokenizer};
    }

    expectTypeOf(compileOnlyGuards).toBeFunction();
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expectTypeOf, it} from 'vitest';
import type {MarkdownComponents} from '../index';
import {
  createMarkdownKaTeXRenderer,
  MarkdownKaTeX,
  type MarkdownKaTeXOptions,
} from './index';

describe('Markdown KaTeX public API', () => {
  it('exports components.math-compatible renderers', () => {
    expectTypeOf(MarkdownKaTeX).toMatchTypeOf<
      NonNullable<MarkdownComponents['math']>
    >();
    expectTypeOf(createMarkdownKaTeXRenderer()).toMatchTypeOf<
      NonNullable<MarkdownComponents['math']>
    >();
  });

  it('keeps safety and accessibility options under adapter ownership', () => {
    function compileOnlyGuards() {
      const output: MarkdownKaTeXOptions = {
        // @ts-expect-error the adapter always emits accessible MathML
        output: 'html',
      };
      const strict: MarkdownKaTeXOptions = {
        // @ts-expect-error the adapter suppresses third-party diagnostics
        strict: 'warn',
      };
      const trust: MarkdownKaTeXOptions = {
        // @ts-expect-error the adapter never enables trusted author commands
        trust: true,
      };
      return {output, strict, trust};
    }

    expectTypeOf(compileOnlyGuards).toBeFunction();
  });
});

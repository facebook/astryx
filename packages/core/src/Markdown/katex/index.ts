// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Optional lazy KaTeX renderer for Markdown math
 * @position Public `@astryxdesign/core/Markdown/katex` subpath
 */

export {MarkdownKaTeX, createMarkdownKaTeXRenderer} from './MarkdownKaTeX';
export type {
  MarkdownKaTeXDiagnostic,
  MarkdownKaTeXDiagnosticCode,
  MarkdownKaTeXOptions,
  MarkdownKaTeXProps,
  MarkdownKaTeXRendererOptions,
  MarkdownMathRendererInput,
} from './MarkdownKaTeX';

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file katex-css.d.ts
 * @input KaTeX's published stylesheet side-effect import
 * @output TypeScript declaration for the optional Markdown KaTeX adapter
 * @position Build-only typing shim; the consumer bundler owns CSS loading
 */

declare module 'katex/dist/katex.min.css';

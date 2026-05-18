// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Theme build command JSON responses.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json theme build <file>             -> theme.build
 * (file not found / parse error)            -> CLIError
 */

/** xds --json theme build <file> */
export interface ThemeBuildResponse {
  type: 'theme.build';
  data: {
    name: string;
    tokenCount: number;
    componentCount: number;
    sizeKB: number;
    outputs: {css: string; js: string; dts: string; variantsDts?: string};
    warnings: string[];
  };
}

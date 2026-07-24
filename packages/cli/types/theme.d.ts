// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Theme build command JSON responses.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json theme build <file>             -> theme.build
 * xds --json theme list                     -> theme.list
 * xds --json theme add <slug>               -> theme.add
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

/** A single theme entry as surfaced by `theme list`. */
export interface ThemeListEntry {
  slug: string;
  displayName: string;
  description: string;
  maintained: boolean;
}

/** xds --json theme list */
export interface ThemeListResponse {
  type: 'theme.list';
  data: ThemeListEntry[];
}

/** xds --json theme add <slug> */
export interface ThemeAddResponse {
  type: 'theme.add';
  data: {
    slug: string;
    displayName: string;
    maintained: boolean;
    outputDir: string;
    entry: string;
    exportName: string;
    files: string[];
  };
}

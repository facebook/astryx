// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `theme` command — the source of truth for its
 * build/list/add JSON response shapes. The leaves' `@returns` reference these
 * directly (functions own their types); the public `@astryxdesign/cli/api`
 * surface re-exports them via types/theme.d.ts, so consumers see the same names.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json theme build <file>             -> theme.build
 * xds --json theme build <file> --check     -> theme.build.check
 * xds --json theme list                     -> theme.list
 * xds --json theme add <slug>               -> theme.add
 * (file not found / parse error)            -> CLIError
 *
 * @position api — colocated typedefs for api/theme/{theme,build,add,list,_adapter}
 */

/**
 * xds --json theme build <file>
 * @typedef {object} ThemeBuildResponse
 * @property {'theme.build'} type
 * @property {{name: string, tokenCount: number, componentCount: number, sizeKB: number, outputs: {css: string, js: string, dts: string, variantsDts?: string}, warnings: string[]}} data
 */

/**
 * xds --json theme build <file> --check
 * @typedef {object} ThemeBuildCheckResponse
 * @property {'theme.build.check'} type
 * @property {{name: string, upToDate: boolean, stale: Array<{path: string, reason: 'missing' | 'outdated'}>, checked: string[]}} data
 */

/**
 * A single theme entry as surfaced by `theme list`.
 * @typedef {object} ThemeListEntry
 * @property {string} slug
 * @property {string} displayName
 * @property {string} description
 * @property {boolean} maintained
 */

/**
 * xds --json theme list
 * @typedef {object} ThemeListResponse
 * @property {'theme.list'} type
 * @property {ThemeListEntry[]} data
 */

/**
 * xds --json theme add <slug>
 * @typedef {object} ThemeAddResponse
 * @property {'theme.add'} type
 * @property {{slug: string, displayName: string, maintained: boolean, outputDir: string, entry: string, exportName: string, files: string[]}} data
 */

// Make this a module so the @typedefs above are importable as types via
// `import('./theme.type.mjs').ThemeBuildResponse` (and re-exportable from a .d.ts).
export {};

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
 * xds --json theme build <a> <b> …          -> theme.build.batch
 * xds --json theme list                     -> theme.list
 * xds --json theme add <slug>               -> theme.add
 * xds --json theme template                 -> theme.template
 * xds --json theme targets [filter]         -> theme.targets
 * (file not found / parse error)            -> CLIError
 *
 * @position api — colocated typedefs for api/theme/{theme,build,add,list,template,targets,_adapter}
 */

/**
 * xds --json theme build <file>
 * @typedef {object} ThemeBuildResponse
 * @property {'theme.build'} type
 * `warnings` are defects the theme author should fix. `notices` are advisories
 * about a correct theme — most of them cannot be fixed in a theme file at all,
 * so folding them into `warnings` makes a clean build look dirty.
 * @property {{name: string, tokenCount: number, componentCount: number, sizeKB: number, outputs: {css: string, js: string, dts: string, variantsDts?: string}, warnings: string[], notices: string[]}} data
 */

/**
 * xds --json theme build <file> --check
 * @typedef {object} ThemeBuildCheckResponse
 * @property {'theme.build.check'} type
 * @property {{name: string, upToDate: boolean, stale: Array<{path: string, reason: 'missing' | 'outdated'}>, checked: string[]}} data
 */

/**
 * xds --json theme build <a> <b> … — several themes in one invocation. Each
 * result carries the file as it was passed and the receipt a single-file build
 * would have returned (null when that theme produced no CSS). One file still
 * returns the bare theme.build / theme.build.check envelope.
 * @typedef {object} ThemeBuildBatchResponse
 * @property {'theme.build.batch'} type
 * @property {{count: number, results: Array<{file: string, receipt: ThemeBuildResponse | ThemeBuildCheckResponse | null}>}} data
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

/**
 * xds --json theme template
 * `written: false` with `reason: 'exists'` is a success: the command is safe to
 * re-run, and an edited template is the consumer's file to keep.
 * @typedef {object} ThemeTemplateResponse
 * @property {'theme.template'} type
 * @property {{path: string, written: boolean, reason: 'exists' | null}} data
 */

/**
 * One themeable target: the `defineTheme` `components` key, the class it
 * renders as, the component whose doc declares it, and the props and states
 * that are legal override keys under it.
 * @typedef {object} ThemeTargetEntry
 * @property {string} key
 * @property {string} className
 * @property {string} component
 * @property {string[]} props
 * @property {string[]} states
 */

/**
 * xds --json theme targets [filter]
 * @typedef {object} ThemeTargetsResponse
 * @property {'theme.targets'} type
 * @property {{filter: string | null, componentCount: number, targets: ThemeTargetEntry[]}} data
 */

// Make this a module so the @typedefs above are importable as types via
// `import('./theme.type.mjs').ThemeBuildResponse` (and re-exportable from a .d.ts).
export {};

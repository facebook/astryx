// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `template` command — source of truth for the
 * template command JSON responses. Re-exported by `types/template.d.ts`.
 *
 * Each template is exactly two files: page.tsx (code) + template.doc.mjs (metadata).
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json template [--list]              -> template.list
 * xds --json template <name>               -> template.show
 * xds --json template <name> --skeleton    -> template.skeleton
 * xds --json template <name> [path]        -> template.copy
 * xds --json template --cdn [path]         -> template.cdn
 * (unknown template)                        -> CLIError
 */

/**
 * xds --json template [--list]
 * @typedef {object} TemplateListResponse
 * @property {'template.list'} type
 * @property {TemplateListEntry[]} data
 */

/**
 * @typedef {object} TemplateListEntry
 * @property {string} id - Stable template id (relative path under the templates root, minus the .doc.* suffix).
 * @property {string} name
 * @property {string} description
 * @property {'page' | 'block'} type
 * @property {string} package - Owning package; core (built-in) templates report '@astryxdesign/core'.
 * @property {string} [category] - Optional grouping/category label.
 * @property {string[]} [componentsUsed] - Astryx components the template composes; each is exact and resolvable through `astryx component <Name>`.
 * @property {boolean} isReady
 * @property {boolean} [scaffold]
 */

/**
 * xds --json template <name>
 * @typedef {object} TemplateShowResponse
 * @property {'template.show'} type
 * @property {object} data
 * @property {string} data.template
 * @property {string} data.description
 * @property {'page' | 'block'} data.type
 * @property {string[]} data.components
 * @property {string} data.source
 */

/**
 * xds --json template <name> --skeleton
 * @typedef {object} TemplateSkeletonResponse
 * @property {'template.skeleton'} type
 * @property {object} data
 * @property {string} data.template
 * @property {string} data.description
 * @property {string[]} data.components
 * @property {string} data.skeleton
 */

/**
 * xds --json template <name> [path]
 * @typedef {object} TemplateCopyResponse
 * @property {'template.copy'} type
 * @property {object} data
 * @property {string} data.template
 * @property {string} data.outputDir
 * @property {string} data.fileName
 * @property {number} data.filesCopied
 */

/**
 * xds --json template --cdn [path]
 * `written: false` with `reason: 'exists'` is a success: the command is safe to
 * re-run, and an edited page is the consumer's file to keep. `version` is the
 * Astryx version every CDN URL in the file was pinned to.
 * @typedef {object} TemplateCdnResponse
 * @property {'template.cdn'} type
 * @property {{path: string, version: string, written: boolean, reason: 'exists' | null}} data
 */

/**
 * Options for `template()`.
 * @typedef {object} TemplateOptions
 * @property {boolean} [list]
 * @property {boolean} [skeleton]
 * @property {boolean} [show]
 * @property {boolean | string} [cdn] Write the no-build-step CDN starter page instead of resolving a template. A string is used as the destination path.
 * @property {'page' | 'block'} [type] Filter templates by kind: 'page' or 'block'. Only applies to list views.
 * @property {string} [package] Narrow to templates from a specific package (id-only lookups across packages are ambiguous).
 * @property {string} [targetPath]
 * @property {boolean} [overwrite] Overwrite an existing target file instead of erroring (ERR_FILE_EXISTS).
 * @property {string} [cwd]
 */

export {};

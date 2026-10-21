// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `template` command — source of truth for the
 * template command JSON responses. Re-exported by `types/template.d.ts`.
 *
 * Each template is exactly two files: page.tsx (code) + template.doc.mjs (metadata).
 *
 * Invocation                               -> type discriminator
 * ------------------------------------------------------------------
 * astryx --json template [--list]          -> template.list
 * astryx --json template <name>            -> template.show
 * astryx --json template <name> --skeleton -> template.skeleton
 * astryx --json template <name> [path]     -> template.copy
 * astryx --json template --cdn [path]      -> template.cdn
 * (unknown template)                       -> CLIError
 */

/**
 * astryx --json template [--list]
 * @typedef {object} TemplateListResponse
 * @property {'template.list'} type
 * @property {TemplateListEntry[]} data
 */

/**
 * @typedef {object} TemplateListEntry
 * @property {string} id - Stable template id (relative path under the templates root, minus the .doc.* suffix).
 * @property {string} name
 * @property {string} [displayName]
 * @property {string} description
 * @property {'page' | 'block'} type
 * @property {string} package - Owning package; core (built-in) templates report '@astryxdesign/core'.
 * @property {string} [replaces] - Core template id this integration template replaces by default.
 * @property {string} [category] - Optional grouping/category label.
 * @property {string[]} [componentsUsed] - Component display names the template composes.
 * @property {number} [aspectRatio] - Block preview width/height ratio.
 * @property {string} [exampleFor] - Component documented by a block.
 * @property {string[]} [alsoExampleFor] - Additional component pages that receive this example.
 * @property {string[]} [alsoShowcaseFor] - Additional component pages that reuse this showcase.
 * @property {boolean} [isShowcase] - Whether a block is the component's primary showcase.
 * @property {boolean} isReady
 * @property {boolean} [scaffold]
 */

/**
 * astryx --json template <name>
 * @typedef {object} TemplateShowResponse
 * @property {'template.show'} type
 * @property {string} package The npm package that owns the template.
 * @property {object} data
 * @property {string} data.template
 * @property {string} data.description
 * @property {'page' | 'block'} data.type
 * @property {string[]} data.components
 * @property {string} data.source
 * @property {number} data.demoMediaReplaced Astryx demo media references (images, posters, videos) replaced in the returned source: images with a neutral placeholder, videos with an empty source. Swap in your own media at those points; no media is installed. 0 when the template carried none.
 * @property {TemplateIconsReport} [data.icons] Experimental, present only when an icon set is installed or configured: how the template's icons follow the project's icon set, each icon `mapped` (source and target) or `kept`, and the icon-set state.
 */

/**
 * astryx --json template <name> --skeleton
 * @typedef {object} TemplateSkeletonResponse
 * @property {'template.skeleton'} type
 * @property {string} package The npm package that owns the template.
 * @property {object} data
 * @property {string} data.template
 * @property {string} data.description
 * @property {string[]} data.components
 * @property {string} data.skeleton
 */

/**
 * astryx --json template <name> [path]
 * @typedef {object} TemplateCopyResponse
 * @property {'template.copy'} type
 * @property {string} package The npm package that owns the template.
 * @property {object} data
 * @property {string} data.template
 * @property {string} data.outputDir
 * @property {string} data.fileName
 * @property {number} data.filesCopied
 * @property {number} data.demoMediaReplaced Astryx demo media references (images, posters, videos) replaced in the written file: images with a neutral placeholder, videos with an empty source. Swap in your own media at those points; no media is installed. 0 when the template carried none.
 * @property {string[]} data.notes Setup notes: what the template needs that the project lacks (missing packages, missing StyleX compiler). Each note is one actionable line. Empty when the template needs nothing the project lacks.
 * @property {string[]} data.missingPackages External package names the template imports that are not in the project's dependencies. Empty when none are missing.
 * @property {string | null} data.installCommand A ready-to-run install command for the missing packages, using the project's package manager and the CLI workspace's version ranges. Null when no packages are missing, or when several lockfiles leave the package manager undetermined; missingPackages still names the packages.
 * @property {TemplateIconsReport} [data.icons] Experimental, present only when an icon set is installed or configured: how the written file's icons follow the project's icon set, each icon `mapped` (source and target) or `kept`, and the icon-set state.
 */

/**
 * How a template's icons follow the project's icon set (AST-084 FR10).
 * Without a project icon set (`status` `none`, `ambiguous`, or `missing`)
 * the source is unchanged and both lists are empty.
 * @typedef {object} TemplateIconsReport
 * @property {'selected' | 'none' | 'ambiguous' | 'missing'} status The project's icon-set state.
 * @property {string | null} set The project's icon set as `<package>/<set>`, when selected.
 * @property {string} reason Why the project has that set, or none.
 * @property {Array<{source: {module: string, export: string}, target: {set: string, package: string, id: string, module: string, export: string}, by: 'match' | 'definition'}>} mapped Icons rewritten to the project's set, and the rule that chose each one: a reviewed `exact` or `strong` match, or the icon the set's `map` names for the icon definition the template declares.
 * @property {Array<{module: string, export: string, reason: string, suggestion?: {set: string, id: string, module: string, export: string, confidence: 'likely'}}>} kept Icons left as the template wrote them, with why, and a `likely` reviewed match as a suggestion when the project set has one.
 */

/**
 * astryx --json template --cdn [path]
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
 * @property {'page' | 'block'} [type] Filter templates by kind: 'page' or 'block'. Narrows both list and direct lookup.
 * @property {string} [package] Narrow to templates from a specific package. Without it, a valid integration replacement is selected for the Core id; @astryxdesign/core explicitly selects the original.
 * @property {string} [targetPath]
 * @property {boolean} [overwrite] Overwrite an existing target file instead of erroring (ERR_FILE_EXISTS).
 * @property {string} [cwd]
 */

export {};

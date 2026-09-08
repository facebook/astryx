// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `theme` command — the source of truth for its
 * build/list/add JSON response shapes. The leaves' `@returns` reference these
 * directly (functions own their types); the public `@astryxdesign/cli/api`
 * surface re-exports them via types/theme.d.ts, so consumers see the same names.
 *
 * Invocation                                  -> type discriminator
 * ------------------------------------------------------------------
 * astryx --json theme build <file>            -> theme.build
 * astryx --json theme build <file> --check    -> theme.build.check
 * astryx --json theme build <a> <b> …         -> theme.build.batch
 * astryx --json theme list                    -> theme.list
 * astryx --json theme add <slug>              -> theme.add
 * astryx --json theme template                -> theme.template
 * astryx --json theme targets [filter]        -> theme.targets
 * astryx --json theme palette generate <file> -> theme.palette.generate
 * (file not found / parse error)              -> CLIError
 *
 * @position api — colocated typedefs for api/theme/{theme,build,add,list,template,targets,_adapter}
 */

/**
 * astryx --json theme build <file>
 * @typedef {object} ThemeBuildResponse
 * @property {'theme.build'} type
 * `warnings` are defects the theme author should fix. `notices` are advisories
 * about a correct theme — most of them cannot be fixed in a theme file at all,
 * so folding them into `warnings` makes a clean build look dirty.
 * @property {{name: string, tokenCount: number, componentCount: number, sizeKB: number, outputs: {css: string, js: string, dts: string, variantsDts?: string}, warnings: string[], notices: string[]}} data
 */

/**
 * astryx --json theme build <file> --check
 * @typedef {object} ThemeBuildCheckResponse
 * @property {'theme.build.check'} type
 * @property {{name: string, upToDate: boolean, stale: Array<{path: string, reason: 'missing' | 'outdated'}>, checked: string[]}} data
 */

/**
 * astryx --json theme build <a> <b> … — several themes in one invocation. Each
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
 * astryx --json theme list
 * @typedef {object} ThemeListResponse
 * @property {'theme.list'} type
 * @property {ThemeListEntry[]} data
 */

/**
 * astryx --json theme add <slug>
 * @typedef {object} ThemeAddResponse
 * @property {'theme.add'} type
 * @property {{slug: string, displayName: string, maintained: boolean, outputDir: string, entry: string, exportName: string, files: string[]}} data
 */

/**
 * astryx --json theme template
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
 * astryx --json theme targets [filter]
 * @typedef {object} ThemeTargetsResponse
 * @property {'theme.targets'} type
 * @property {{filter: string | null, componentCount: number, targets: ThemeTargetEntry[]}} data
 */

/**
 * A color an author pins at one stop of one mode, constraining generation.
 * @typedef {object} TonalPaletteAnchor
 * @property {'light' | 'dark'} mode Mode containing the anchored stop.
 * @property {number} stop Existing requested stop where the anchor applies.
 * @property {string} color Six-digit sRGB hex the stop is pulled toward.
 * @property {'exact' | 'bounded' | 'flexible'} policy `exact` preserves the
 * chosen color at that stop; `bounded` permits adjustment within `maxDeltaE`;
 * `flexible` treats the color as guidance and blends toward it.
 * @property {number} [maxDeltaE] Required non-negative perceptual-distance
 * limit for a `bounded` anchor.
 */

/**
 * One requested family: a seed color and the constraints applied to its ramp.
 * @typedef {object} TonalPaletteFamilyInput
 * @property {string} id Lower-kebab-case key for the family in the generated
 * palette. `black` and `white` are reserved for the standalone values.
 * @property {string} seed Six-digit sRGB hex the ramp is generated from.
 * @property {string} [name] Display name for review artifacts; defaults to `id`.
 * @property {'chromatic' | 'neutral'} [kind] `neutral` derives the ramp from
 * `neutralProfile` instead of the seed hue; defaults to `chromatic`.
 * @property {TonalPaletteAnchor[]} [anchors] Colors pinned at specific stops.
 */

/**
 * @typedef {object} TonalPaletteGenerationInput
 * @property {TonalPaletteFamilyInput[]} families
 * @property {number} [vibrancy] Chroma control from 0 (most muted) through 50
 * (default) to 100 (most vivid).
 * @property {'neutral-v1' | 'warm-v1' | 'cool-v1' | 'custom'} [neutralProfile]
 * Hue treatment for `neutral` families: `neutral-v1` is fully achromatic,
 * `warm-v1` and `cool-v1` add a slight tint, and `custom` derives the hue from
 * the family's own seed. Defaults to `neutral-v1`.
 * @property {'light-only' | 'dark-only' | 'light-and-dark'} [modeStrategy]
 * @property {number[]} [stops] Ordered stops shared by every requested family;
 * defaults to 0 through 100 in increments of 5. Decimal stops are supported,
 * and authors may omit the repeated black and white endpoints.
 */

/**
 * A generated palette candidate. The palette is still subject to author review
 * and is not connected to runtime theme values.
 * @typedef {object} TonalPaletteCandidate
 * @property {1} schemaVersion
 * @property {'candidate'} status
 * @property {'astryx-oklch-v1'} recipe
 * @property {'#000000'} black Exact solid black for theme authoring outside a tonal family.
 * @property {'#ffffff'} white Exact solid white for theme authoring outside a tonal family.
 * @property {Record<string, {name: string, light?: Record<string, string>, dark?: Record<string, string>}>} palette
 */

/**
 * Per-ramp evidence recorded for one family in one mode.
 * @typedef {object} TonalPaletteRampDiagnostics
 * @property {boolean} monotonic Whether luminance rises across every stop.
 * @property {number} minimumAdjacentDeltaE Smallest perceptual gap between
 * neighboring stops; a small value means two stops read as one color.
 * @property {number} maximumAdjacentDeltaE Largest gap between neighboring stops.
 * @property {number} maximumHueDrift Largest hue distance, in degrees, between
 * a stop and the family's reference hue.
 * @property {'blue-to-purple' | 'yellow-to-brown' | null} hueIdentityRisk Named
 * drift the ramp is at risk of, or `null`.
 * @property {number[]} gamutMappedStops Stops whose ideal color fell outside
 * sRGB and was mapped back into it.
 * @property {Array<TonalPaletteAnchor & {generatedColor: string, deltaE: number}>} anchors
 * Each anchor with the color generated before correction and the perceptual
 * distance the correction moved.
 */

/**
 * Cross-family evidence for one mode, sampled at the stop nearest 50.
 * @typedef {object} TonalPaletteCoordinationDiagnostics
 * @property {'light' | 'dark'} mode Mode these samples come from.
 * @property {number} stop Sampled stop.
 * @property {[string, string] | null} closestFamilies The two chromatic
 * families hardest to tell apart, or `null` with fewer than two.
 * @property {number | null} minimumFamilyDeltaE Perceptual distance between them.
 * @property {string | null} strongestFamily Most saturated family at this stop.
 * @property {string | null} weakestFamily Least saturated family at this stop.
 * @property {number | null} chromaRatio Strongest chroma over weakest; a large
 * ratio means the families are unbalanced.
 */

/**
 * The request as the generator resolved it, with every default filled in.
 * @typedef {object} TonalPaletteNormalizedRequest
 * @property {'astryx-oklch-v1'} recipe
 * @property {number} vibrancy
 * @property {'neutral-v1' | 'warm-v1' | 'cool-v1' | 'custom'} neutralProfile
 * @property {'light-only' | 'dark-only' | 'light-and-dark'} modeStrategy
 * @property {number[]} stops
 * @property {Array<{id: string, name: string, seed: string, kind: 'chromatic' | 'neutral', anchors: TonalPaletteAnchor[]}>} families
 */

/**
 * The detached receipt written beside a candidate. It records what was asked
 * for and what the generator observed, so a candidate can be traced back to
 * its request without rerunning generation.
 * @typedef {object} TonalPaletteGenerationReceipt
 * @property {1} schemaVersion
 * @property {'astryx-oklch-v1'} recipe Recipe that produced the candidate.
 * @property {string} candidateSha256 SHA-256 over the candidate bytes as written.
 * @property {{version: string, sha256: string}} [preview] Present only when a
 * preview was written.
 * @property {TonalPaletteNormalizedRequest} request
 * @property {{families: Record<string, {light?: TonalPaletteRampDiagnostics, dark?: TonalPaletteRampDiagnostics}>, coordination: TonalPaletteCoordinationDiagnostics[]}} diagnostics
 */

/**
 * astryx --json theme palette generate <config>
 * @typedef {object} ThemePaletteGenerateResponse
 * @property {'theme.palette.generate'} type
 * @property {{recipe: 'astryx-oklch-v1', status: 'candidate', familyCount: number, stopCount: number, modes: string[], output: string | null, receipt: string | null, preview: string | null, written: boolean, reason: 'exists' | null, candidate: TonalPaletteCandidate, generationReceipt: TonalPaletteGenerationReceipt}} data
 */

// Make this a module so the @typedefs above are importable as types via
// `import('./theme.type.mjs').ThemeBuildResponse` (and re-exportable from a .d.ts).
export {};

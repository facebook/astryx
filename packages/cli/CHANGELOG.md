# @xds/cli

# 0.3.0

#### Breaking Changes

- CLI — authoring is consolidated into a single entrypoint, `@astryxdesign/cli/authoring`, that exposes only TYPES (the plain objects authors write) and PARSERS (the CLI's load-boundary validators). Zod is sealed inside each parser and never exported.
- Remove long-deprecated compatibility APIs from core and CLI. Run `astryx upgrade` first to migrate the supported replacements for authoring imports, Dialog logical positions, Switch label spacing, and Table root props.

#### New Features

- CLI human (non-`--json`) output now renders through a small, documented formatter kit: consistent, plain-ASCII `key: value` records/sections that mirror `--json` and are greppable by field. Every command was migrated onto it (a lint rule keeps output funneled through the single `emit` sink), and `astryx --help` documents the output contract. `--json` output is unchanged. (#4686)
- `defineTheme`: make `color.accent` optional (#2279)
  A theme can now restyle the neutral ramp (`neutralStyle`, `contrast`) without adopting an accent. An accent-less config seeds the neutral palettes from the default accent's hue but leaves `--color-accent`, `--color-accent-muted` and `--color-on-accent` ungenerated, so they fall through to the token defaults — the same fall-through `expandColorScale` already applies to status, categorical and on-dark tokens. Configs that pass an accent are unchanged, token for token.

#### Fixes

- theme build: generated custom Button variants now type-check through the public `@astryxdesign/core/Button` subpath.
- Remove the `@xds/theme-default` → `@astryxdesign/theme-neutral` collapse from the v0.1.0 upgrade codemods (module-specifiers, css-surfaces, and declare-module). `theme-default` was dropped at the v0.1.0 scope move, so no v0.1.x consumer imported it — the collapse was dead and could rewrite unrelated source (including `@xds/theme-default/theme.css` CSS imports) to a `@astryxdesign/theme-neutral` package the app never declared. The `@xds/theme-daily` → `theme-neutral` collapse (and its `defaultTheme` → `neutralTheme` export remap) is unchanged.
- cli — confine user-controlled file paths, close DoS vectors, and repair paths broken by the authoring reorg (#4637)
- cli hardening pass — validate inputs at the API layer, close path-safety gaps, and prevent agent-docs content loss. The API is a public surface (`@astryxdesign/cli/api`), so guards that lived only in the CLI wrapper are pushed into the API.
  Path safety (the guard the write commands all depend on):
- cli — rename the `search`/`build` verbose flag to `--verbose`, resync the bundled themes, and fix `unwrap-authoring-factories` edge cases (#4639)
- `astryx doctor`'s peer-dependency check is now version-aware and names scoped packages correctly. Two problems are fixed: (1) the install hint was built with `name.split('@')[0]`, which for a scoped peer like `@stylexjs/stylex` returned an empty string, printing a bare `npm install ` with no package; and (2) the check only verified a peer was _present_, not that its installed version satisfied the declared range — so an out-of-range version (e.g. `@stylexjs/stylex@0.10.1` against a `^0.19.0` peer) was reported as satisfied. The check now flags out-of-range peers and its fix pins the required range, e.g. `npm install @stylexjs/stylex@^0.19.0`.
- theme build: validate component override keys from documented theming targets so subtargets like Chat bubbles and SideNav items no longer warn as unknown.
- `astryx theme build`: hyphenated component-override keys now resolve their built-in visual-prop values, and the `KNOWN_COMPONENTS` prop lists match what each component renders (#4109)
  `loadKnownValues` mapped a theme key to its core component directory by stripping non-letters from only the directory name, so a hyphenated key (`text-input`, `dropdown-menu`, `app-shell`, ...) never matched its `TextInput`/`DropdownMenu`/`AppShell` dir and the built-in prop values were silently dropped. It now strips non-letters from both sides before comparing, so hyphenated keys resolve. The `KNOWN_COMPONENTS` visual-prop lists are also synced to each component's `theming.targets[].visualProps` (e.g. `text-input`/`date-input`/`number-input`/`time-input`: `size`, `status`; `side-nav`: `mode`; `aspect-ratio`: `shape`), correcting stale/empty entries.

#### Documentation

- Document the core codemod staging workflow and add release-time automation that promotes `transforms/next` codemods into the resolved release version folder.
- Document the `@astryxdesign/core` StyleX peer dependency — add `@stylexjs/stylex` to the Getting Started / Quick Start install commands in both READMEs, and add an `astryx init` next-steps reminder to ensure the `@stylexjs/stylex` peer dependency is met, with a pointer to `astryx doctor`. StyleX is the styling runtime every component calls, and not all package managers auto-install peers.
- Surface the React 19 peer-dependency requirement everywhere a user would look for it (root README, core README, docsite hero, and the CLI getting-started guide), and add a sync test that keeps those surfaces naming the same React major as the core peer range.

#### Other Changes

- **The `create*` factories are removed** (`createConfig`, `createIntegration`, `createComponentDoc`, `createFunctionDoc`, `createDoc`, `createPageTemplate`, `createBlockTemplate`, `createCodemod`, `createConfigCodemod`). Author a plain object and stamp its `type` directly (`{type: 'component', ...}`, `{type: 'page', ...}`, `{type: 'code', ...}`); config and integration manifests are plain objects with no discriminant.
- **Import authoring types from `@astryxdesign/cli/authoring`** — the doc types `ComponentDoc`, `HookDoc`, `ReferenceDoc`, `TemplateDoc`, and the project-file types `AstryxConfig`, `AstryxIntegration`, `AstryxCodemod`. The old split surfaces (`@astryxdesign/cli/{config,doc,integration,template,codemod}` and the authoring exports of `@astryxdesign/core`) are superseded.
- **Doc field types are renamed to explicit, domain-prefixed names** so the surface reads clearly: `PropDoc → ComponentPropDoc`, `ThemingTarget → ComponentThemingTarget`, `ComponentVar → ComponentThemingVar`, `DerivedVar → ComponentThemingDerivedVar`, `ElementDescriptor → ComponentSlotElement`, `GroupDoc → ComponentGroupDoc`, `TranslationDoc → ComponentTranslationDoc`, `ExampleDoc/AnatomyElement/BestPractice/PlaygroundConfig → Component*`, and `ContentBlock/TokenPreviewType → Reference*`. The authorable entry types (`ComponentDoc`/`HookDoc`/`ReferenceDoc`/`TemplateDoc`) are unchanged.
- **`astryx upgrade` migrates you automatically.** Three codemods ship in this release: `unwrap-authoring-factories` rewrites every `create*` call to the plain stamped object, `migrate-authoring-imports` repoints the import specifiers to `@astryxdesign/cli/authoring`, and `rename-authoring-doctypes` applies the doc field-type renames (imports, type references, and JSDoc `@type` refs).
- CLI — the public `@astryxdesign/cli/api` type surface is now generated from the runtime JSDoc, and the injectable logger is consolidated into one `Logger`.
  Consumer-visible changes to `@astryxdesign/cli/api` (types only — runtime imports are unchanged):
- **Precise return types.** `component`, `docs`, `blog`, `discover`, `build`, `swizzle`, `upgrade`, `init`, and `themeBuild` previously resolved to `Promise<any>`; they now return their precise `{ type, data }` response unions. Code that leaned on `any` may surface new (correct) type errors.
- **Response types are now exported by name** — e.g. `ComponentDetailResponse`, `SearchResponse`, `UpgradeRunResponse` — alongside `themeAdd`/`themeList`/`listThemes` and a new shared `logger` value + `Logger` type.
- **Breaking:** the per-command return-union aliases `ComponentResult`, `DiscoverResult`, `DocsResult`, `HookResult`, and `TemplateResult` are no longer exported. Use `Awaited<ReturnType<typeof component>>` (still works), or import the member response types directly.
- `theme build --out`/`<file>`, the `validate-integration` manifest roots (`components`/`templates`/`codemods`), and `layout --file` are now confined with `assertWithin`. An escaping integration root reports a validation issue instead of importing and executing files outside the package; `layout --file` is also size-capped (5 MB) and rejects non-files, so a stream like `/dev/zero` can't exhaust memory.
- Fuzzy-match (Levenshtein), the layout value parser, and the layout expander gained bounds — a very long search query, a deeply nested attribute value, and a huge repeat count (`Box*999999999`) can no longer spin the CPU, blow the stack, or exhaust the heap.
- Docs topic lookup uses a null-prototype map so `__proto__`/`constructor` as a topic name can't bypass the unknown-topic guard. The shipped getting-started docs and the sandbox registry generator point at the current CLI source path again (both broke in the authoring reorg).
- `assertWithin` now canonicalizes symlinks (realpath of the deepest existing ancestor) — a symlink inside the project root pointing outside no longer lets a write escape. Also rejects a NUL byte in the path. This closes the escape for every command that writes through the guard (swizzle/template/upgrade/theme/layout/agent-docs).
- `search()`: non-positive/non-integer `limit`, empty query, unknown `--type` → `ERR_INVALID_ARGUMENT` (previously `limit: 0` returned the full unclamped set).
- `swizzle()`: the component name is sanitized so `..`/separators can't escape the `--output` base.
- `swizzle()` import rewriting: dynamic `import('../Sibling/…')` is now rewritten (was left pointing at a non-existent sibling in the output dir); a two-levels-up asset import (`../../locales/x.json`) maps to the exported subpath instead of the invalid `<pkg>/..`; and `../theme/tokens.stylex` keeps its full subpath (the StyleX compiler needs the dedicated `./theme/tokens.stylex` export — collapsing it to `<pkg>/theme` broke StyleX resolution). Component-local `.stylex` files that aren't subpath exports keep the working barrel collapse.
- `template()` copy: refuses to clobber without `overwrite: true` (`ERR_FILE_EXISTS`); adds an `overwrite` option.
- `upgrade()`: the `--path` scan dir is confined to cwd (`--apply` rewrites files in place).
- `init()`: template scaffold refuses to clobber an existing `page.tsx` (`ERR_FILE_EXISTS`); an unknown `--agent` now throws `ERR_UNKNOWN_AGENT` (was silently ignored).
- `layout`: rejects an unknown `--form` (`ERR_INVALID_OPTION`) and empty expression (`ERR_INVALID_ARGUMENT`).
- `layout expand`: text payloads containing `<`, `>`, `{`, or `}` (e.g. `Text"5 < 3"`) are emitted as JSX string-expression children so the generated TSX is valid — previously they produced syntactically-broken output.
- `layout expand`: a top-level repeat or group that expands to multiple sibling elements (`B"x"*3`, `(B"a" + B"b")`, an outline `repeat` block) is now wrapped in a fragment — previously the generated TSX had adjacent root elements with no parent and failed to compile (the wrapper decision counted AST roots instead of expanded elements).
- `layout` (expand/check): an empty expression now surfaces `ERR_MISSING_ARGUMENT` and a missing `--file` surfaces `ERR_FILE_NOT_FOUND` (was a generic `ERR_UNKNOWN` / a raw `ENOENT` errno, with a stack leak in human mode).
- `layout` parser: a pathologically deep compact expression (`V > …` nested past 512 levels) is rejected with a located `ERR_LAYOUT_PARSE` instead of blowing the call stack and surfacing a raw `RangeError` (→ `ERR_UNKNOWN`).
- `layout check --form …` printers: a string containing a quote (e.g. a Button `label="Don't panic"`) now round-trips — the printer picks a delimiter the string doesn't contain instead of always single-quoting, so the emitted compact/outline surface re-parses (was producing an unparseable token).
- `resolveTheme`: a non-string `astryx.theme` in package.json (number/array/object/boolean) degrades to null instead of crashing `astryx component` with a raw `TypeError` (parity with the empty-string / unknown-slug paths).
- `jsonOut`: serializes the envelope BEFORE marking the emission handled, so if a command returns unserializable `data` (circular ref / BigInt — an author bug) the bin error boundary still emits a JSON error envelope instead of leaving a `--json` consumer with empty stdout.
- package scanner: a dependency's `astryx.docs` that is a non-string (number/array) is skipped instead of crashing the whole scan with a raw `TypeError`, and a `docs` path that escapes its own package dir is skipped rather than surfacing foreign docs; a non-string package `name` is coerced to a string.
- `component --package <pkg> --showcase`/`--blocks`: route to the right leaf instead of falling back to `component.detail`.
- `discover`/`docs` leaves: empty query/section errors instead of matching everything via `.includes('')`.
- `docs()`/`discover()`: a non-string `topic`/`section`/`query` now throws a stable coded error (`ERR_UNKNOWN_TOPIC` / `ERR_UNKNOWN_SECTION` / `ERR_INVALID_ARGUMENT`) instead of a raw `TypeError` the CLI downgraded to `ERR_UNKNOWN` (parity with the `component`/`hook` non-string guards).
- `blog()` detail: a non-string slug throws `ERR_INVALID_ARGUMENT` (was a raw `TypeError` the CLI downgraded to `ERR_UNKNOWN`), and fails fast before any network fetch.
- `hook()`/`component()` dispatchers: a non-string `name` or `category` throws a coded error (`ERR_UNKNOWN_HOOK` / `ERR_UNKNOWN_COMPONENT` / `ERR_UNKNOWN_CATEGORY`) instead of a raw `TypeError` with no `.code` from the leaf's `.toLowerCase()`/`.replace(...)`.
- `theme add`: a write failure where an ancestor of the target dir is a file now surfaces `ERR_WRITE_FAILED` (the `mkdir` moved inside the write try/catch) instead of leaking a raw fs errno (`EEXIST`/`ENOTDIR`) + absolute path.
- `validate-integration`: a path-unsafe `[package]` spec (`..`/absolute) is reported as an `invalid_package_spec` diagnostic instead of crashing with a raw stack (human) / generic `ERR_UNKNOWN` (`--json`).
- `doctor`: no longer crashes (raw stack in human mode / `ERR_UNKNOWN` in `--json`) when multiple `astryx.config.*` files coexist — it reports a `config` FAIL. Version-alignment skips (info) instead of a spurious drift WARN with a `NaN.undefined.x` fix when either version isn't comparable semver (e.g. `workspace:*`).
- `manifest`: subcommands are sorted by name (same stability guarantee the top-level command list makes), so reordering `.command()` calls can't silently change the agent-facing manifest.
- `build`: the CLI wrapper now propagates the API's error `code` into the `--json` envelope (bogus `--type` / non-positive / non-integer `--limit` → `ERR_INVALID_ARGUMENT` instead of a generic `ERR_UNKNOWN`), and delegates `--limit` validation to the API (parity with `search`).
- `layout check`: exits `1` in BOTH `--json` and human mode for an invalid (but parseable) layout — the exit code no longer depends on the output mode, so it works as a CI gate / agent check without parsing stdout.
- `upgrade` config codemods: a `findConfigPath` throw (multiple `astryx.config.*` files) is surfaced as a structured per-codemod error instead of crashing the whole upgrade run — config codemods run before the strict loader, so this restores the per-codemod isolation every other failure path honors.
- CLI dispatch: the belt-and-suspenders postAction "completed without emitting an envelope" error carries a `code` (`ERR_UNKNOWN`) so every error envelope is branchable on `code`.
- `toErrorEnvelope`/`AstryxError`: attach `suggestions` only when it's a real array.
- `injectXdsBlock`/`removeXdsBlock` no longer drop, duplicate, or orphan user content on malformed managed blocks (END-before-START, duplicate/nested blocks, or a start marker with no end). They locate a single well-formed block (END searched after START) and refuse to touch an ambiguous/half-written file instead of corrupting it.
- The codemod source scan no longer follows symlinks (a symlinked file under the scanned path could rewrite its target OUTSIDE the project) and skips generated-output dirs (dist/build/out/.next/coverage) — codemods rewrite source, not artifacts or dependencies.
- `resolvePackageDir` rejects an integration spec that isn't a bare package name (no `..`, no absolute, must stay in node_modules) — a config spec can no longer point the loader at an arbitrary module.
- A broken integration manifest (throws on import or fails schema validation) no longer crashes `Project.load` (and thus every command). It's recorded and surfaced via `issues()`, restoring the documented skip+warn policy; other integrations still load.
- The `--radius-*`, `--shadow-*`/`--elevation-*`, and `--color-*` token-migration codemods no longer rewrite a longer consumer-defined token that merely shares a prefix (e.g. `--radius-container-custom` → `--radius-3-custom`, `--radius-innermost` → `--radius-0most`, `var(--shadow-10)` → `--shadow-base0`, `--color-positive-custom` → `--color-success-custom`). The boundary lookahead was binding only to the last alternative in the pattern (and two codemods had no boundary at all); it now wraps the whole alternation, so only exact token names migrate.
- `migrate-badge-children-to-label` no longer emits a duplicate `label` prop when the badge already has one (`<XDSBadge label="x">Active</XDSBadge>` produced an invalid `label="x" label="Active"`); it now skips a badge that already declares `label`.
- `readDocMeta` no longer reads a `group:`/`hidden:` field nested inside a `propDescriptions` block (a docsZh/docsDense translation export) as the component's group — that leaked a translated prop description as a group key in the default English `component --list` (e.g. a Chinese string appeared as a group). The field regexes now match top-level fields only (<=2 spaces).
- `astryx search`/`build` verbose output was unreachable: the boolean `--detail` flag collided with the root program's value-taking `--detail <level>`, so `search button --detail` errored `argument missing`. The boolean is now `--verbose` (the global `--detail <level>` is unchanged).
- The themes bundled for `astryx theme add` had drifted from source — the `neutral` bundle was missing a WCAG AA light-mode `text-secondary` contrast fix and a StatusDot color block, so `astryx theme add neutral` scaffolded a theme below AA. All bundles are regenerated to match source, guarded by a new drift test.
- The `unwrap-authoring-factories` upgrade codemod produced broken output for a shorthand `type` property (emitted `{'component'}`) and for no-argument factory calls (left a call referencing the just-removed import). Both now emit the correct plain object.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang
- @ejhammond
- @imdreamrunner
- @jiunshinn
- @joeyfarina
- @josephfarina

---

# 0.2.0

#### Breaking Changes

- cli/json: remove the central `CLIAnyResponse`, `CLIResponseType`, and `CLIResponseDataMap` types. `jsonOut` is now a structural serializer and `parseResponse` / `assertResponse` return the structural `CLIResponse` (`{type, data, meta?}`) instead of the discriminated union, so `result.data` is `unknown` until you narrow it yourself.
  Runtime output is unchanged (every `--json` envelope is byte-identical). This only affects consumers importing those types or relying on `parseResponse` / `assertResponse` to auto-narrow `.data`.
- component/hook `--json` list responses collapsed. `--detail compact`/`full` previously emitted distinct `component.brief`/`component.full` (and `hook.*`) envelopes; they now all emit `component.list` (resp. `hook.list`) with a `data.detail: 'names' | 'compact' | 'full'` field. Migrate: switch on `data.detail`, not the `.brief`/`.full` discriminator. Removed types: ComponentBriefResponse, ComponentFullResponse, HookBriefResponse, HookFullResponse.

#### New Features

- CLI: `blog` is now a normal, agent-facing command — it appears in `--help` and the capability manifest and supports `--json` (emitting `blog.list` / `blog.detail` envelopes), instead of being hidden. Human output is unchanged; the reader still consumes the public RSS feed. Also scriptable through the `./api` barrel as `blog(slug?)`.
- CLI: `init` is now fully scriptable through the `./api` barrel — the non-interactive installer (agent-docs cheat sheet, starter template, `--remove-agents`) lives in `api/init` and returns a typed receipt (`init.run` | `init.remove`), with the CLI reduced to a thin parse → API call → render wrapper. Human output is emitted through an injectable logger, so a scripted `init()` stays silent while the CLI output is byte-identical for existing usage.
- CLI: `theme build` is now fully scriptable through the `./api` barrel — the ~1,000-line theme compiler (defineTheme extraction, CSS generation via `@astryxdesign/core/theme`, variant/type-declaration + icon-module generation, override validation) lives in `api/theme/build` and returns a typed `theme.build` receipt, with the CLI reduced to a thin parse → API call → render wrapper. Human progress is emitted through an injectable logger, so a scripted `themeBuild()` stays silent while the generated CSS/JS/.d.ts, the `--json` envelope, and human output stay byte-identical for existing usage. Watch mode remains a thin CLI loop.
- CLI: `upgrade` is now fully scriptable through the `./api` barrel — the version-to-version pipeline (codemods + agent-docs refresh) lives in `api/upgrade` and returns a typed receipt (`upgrade.list` | `upgrade.status` | `upgrade.run`), with the CLI reduced to a thin parse → API call → render wrapper. Human progress is emitted through an injectable logger, so a scripted `upgrade()` stays silent while the CLI output and `--json` envelopes are unchanged for existing usage.
- Timestamp: new `tooltipEntries` prop renders the hover tooltip across several time zones and/or formats at once — one line per entry, each with an optional `timezoneID` (IANA id; omit it or pass `'local'` for the viewer's zone), `format` (every non-relative `TimestampFormat` plus `'full'`), and `label`. The default is unchanged: with no entries the tooltip stays the single full absolute line in the viewer's zone. Configuring entries also attaches the tooltip to absolute formats, which previously had none — note that this gives those timestamps a tab stop and focus ring, as relative timestamps already have, so a column of them gains one tab stop per row. `hasTooltip={false}` still suppresses the tooltip, and an empty array counts as no configuration. Also corrects `isTimezoneShown`'s documentation, which claimed it applied to the `system_date_time` and `system_time` formats; it never has, and those formats stay machine-readable. (#4188)

#### Fixes

- `astryx theme build`: component-override keys for multi-word components (TextInput, DateInput, NumberInput, DropdownMenu, SideNav, TopNav, etc.) now match the hyphenated class the component actually renders. The known-component registry used de-hyphenated keys, so overrides authored against them emitted dead selectors (`.astryx-textinput` instead of `.astryx-text-input`) that silently never applied (#4109).

#### Other Changes

- CLI: blog reorganized into api/blog leaf shape — list/detail leaves projecting a shared RSS adapter (`_adapter.mjs` owns all network fetch + feed parsing), with `blog.mjs` kept as a dispatcher+barrel so the same `blog` export, the CLI wrapper, api/index.mjs, and the --json/human output stay byte-identical.
- CLI: `build` reorganized into the `api/build` leaf shape — `build.mjs` is now a dispatcher + barrel that routes no-query → `build.help` (`api/build/help/help.mjs`) and a query → `build.kit` (`api/build/kit/kit.mjs`), with each leaf projecting its single `{type, data}` envelope. Pure reorganization: the `build` export, the `./api` barrel, and the CLI consumer are unchanged, and the `--json` and human output stay byte-identical for existing usage.
- CLI: `component` reorganized into the `api/component` leaf shape over a shared `_adapter` resolver — `component.mjs` is now a dispatcher + barrel that routes to per-type leaves (`list`, `detail`, `detail/props`, `detail/source`, `detail/showcase`, `detail/blocks`), each a thin projection of a subject the adapter resolves once (core/external/scoped/integration ownership, ambiguity handling, and fuzzy search, deduped). Pure reorg: every `--json` envelope and human output stays byte-identical across all modes.
- CLI: discover reorganized into api/discover leaf shape (list, detail, detail/doc, search) behind a shared _adapter that owns external-package discovery and doc loading; discover.mjs is now a dispatcher+barrel keeping the same exports. Pure reorg — `--json` and human output are byte-identical and api/index.mjs + the CLI consumer are untouched. Adds colocated leaf tests.
- CLI: docs reorganized into api/docs leaf shape — `docs()` in `api/docs/docs.mjs` is now a dispatcher + barrel that routes by argument shape into three leaves (`api/docs/list`, `api/docs/detail`, `api/docs/detail/section`), each projecting into a single `{ type, data }` envelope. The discovery, overlay loading, and topic resolution shared by ≥2 leaves live in `api/docs/_adapter.mjs`. Pure reorganization: the `docs` export, `api/index.mjs`, the CLI consumer, and all `--json` and human output are unchanged (byte-identical).
- CLI: hook reorganized into api/hook leaf shape — `hook.mjs` is now a dispatcher+barrel routing to colocated leaves (`list/list.mjs` → hook.list, `detail/detail.mjs` → hook.detail, `detail/params/params.mjs` → hook.detail.params) over a shared `_adapter.mjs` resolver. Pure reorg: `--json` and human output are byte-identical across all modes, and the `hook` export surface (api/index.mjs + CLI) is unchanged.
- CLI: init reorganized into api/init leaf shape — `init.mjs` is now a dispatcher + barrel that routes to `api/init/run/run.mjs` (the default / `--features` / `--all` install path) and `api/init/remove/remove.mjs` (the `--remove-agents` path), with the shared plain-logger contract in `api/init/_adapter.mjs`. Pure reorg: `getNextSteps`, `noopInitLogger`, and the `InitOptions` / `InitLogger` types stay re-exported from the barrel, so api/index.mjs, the CLI command, and the programmatic API are unchanged. Human and `--json` output are byte-identical.
- CLI: layout reorganized into the api/layout leaf shape — a shared `_adapter.mjs` (`analyze`/`loadBlocks`/`formatIssue` over `lib/xle`) with thin `expand/`, `check/`, and `grammar/` leaves, plus a `layout.mjs` barrel. `api/index.mjs` and the CLI are unchanged (they import via the barrel). Pure reorg: `layout expand`/`check`/`grammar` `--json` envelopes and human output are byte-identical.
- CLI: swizzle reorganized into api/swizzle leaf shape — the flat command splits into `api/swizzle/list` (`swizzle.list`) and `api/swizzle/copy` (`swizzle.copy` receipt, incl. `rewriteImports`), with shared @astryxdesign/core discovery + component listing deduped in `api/swizzle/_adapter.mjs`, and `swizzle.mjs` reduced to a dispatcher + barrel that keeps its existing exports (`swizzle`, `rewriteImports`). Pure reorganization with no behavior change: human output and every `--json` envelope stay byte-identical, and the CLI command, the `./api` barrel, and the central `types/swizzle` declarations are untouched.
- CLI: template reorganized into api/template leaf shape (shared helpers preserved on the barrel). Pure reorg — `--json` and human output stay byte-identical: shared discovery/IO moved to `api/template/_adapter.mjs`, the command modes split into `list`/`show`/`skeleton`/`copy` leaves, and `template.mjs` becomes a dispatcher + barrel that re-exports every previously-exported symbol (template, discoverTemplates, discoverAll, discoverAllWithErrors, discoverIntegrationTemplatesForOne, findShowcase, findRelatedBlocks, stripTemplateAssetRefs, listTemplates, extractComponents, and the DiscoveredTemplate/TemplateDiscoveryError types) so component/layout/search/init/discover/validate-integration and lib/project keep resolving `api/template/template.mjs` unchanged.
- CLI: `theme add`/`list` are reorganized into the fractal `api/theme/` leaf shape — a shared `_adapter.mjs` (bundled-theme manifest reader + slug resolver) with thin `add/` (copy → `theme.add` receipt) and `list/` (`theme.list`) leaves over it, plus a `theme.mjs` barrel, mirroring the `theme build` extraction (#4462). `themeList()` is now exported from `@astryxdesign/cli/api` alongside `themeAdd`. Pure reorg: `theme list`/`add` `--json` envelopes and human output are byte-identical, with new direct-API tests for both leaves.
- CLI: upgrade reorganized into api/upgrade leaf shape — the flat pipeline is split into a dispatcher+barrel (`upgrade.mjs`), a shared `_adapter.mjs` (version detection + agent-docs refresh + codemod selection/execution machinery), and `list`/`status`/`run` leaves (`upgrade.list` | `upgrade.status` | `upgrade.run`). Pure reorg: the `./api` barrel + CLI consumer are unchanged, and both the human output and `--json` envelopes are byte-identical.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang
- @josephfarina

---

# 0.1.9

#### New Features

- CLI: full API coverage for the `build`, `swizzle`, `layout`, and `validate` commands — each is now scriptable through the `./api` barrel with the CLI as a thin parse → API call → render wrapper. `build` gains `--json` output. Behavior is unchanged for existing command usage. (#4302)

#### Fixes

- Align two `--json` contract shapes with what the CLI actually emits
- Register all emitted response types in the `--json` envelope union
  Three response types were defined, exported, and emitted by commands but never added to `CLIAnyResponse` — the union that `jsonOut()` type-checks payloads against: `component.full`, `component.detail.blocks`, and `upgrade.status`. Because their discriminators were missing from the map, `jsonOut('upgrade.status', …)` (and the two component variants) were rejected by the type-checker, and their payload shapes weren't actually being validated. `build.help` had no response type at all. Added a `BuildHelpResponse` type and wired all four into the union so every `--json` envelope the CLI can emit is now type-checked against a declared shape.
- Type `detectPackageManager` honestly so `astryx doctor`'s "no lockfile" branch is reachable
  `detectPackageManager` returns `'npx'` as the sentinel for "nothing detected", but its return type only listed `'yarn' | 'pnpm' | 'bun' | 'npm'`. Type-checkers therefore treated `doctor`'s `pm !== 'npx'` guard as a dead comparison — the "No lockfile detected — defaulting to npm/npx" message looked unreachable and was at risk of being "cleaned up". The return type is now `PackageManager | 'npx'` and detection narrows via a shared type predicate, so the guard is honest and the branch is preserved.
- Make the CLI's `.mjs` sources fully strict-typecheckable (checkJs + JSDoc)
  Annotated the entire CLI package so `tsconfig.strict.json` (full `strict` `checkJs` over `src`, `bin`, `scripts`, `docs`, and the emitted `templates`) reports zero errors — down from 1717. Fixes are JSDoc-only: no runtime logic changed, `.mjs` stays `.mjs`. Strict checking also surfaced and corrected several type-contract drifts: the `upgrade.run` response type (declared a `depsUpdated` field the command never emits, and omitted the real `integrations`/`filesChanged`/`transformsApplied`/`errors`), registered the emitted `theme.list`/`theme.add`/`layout.*` response types in the `--json` envelope union, and added `category?` to `ReferenceSection` in core's docs types (reference docs already emit it).
- Drop the dead `cwd` parameter from `getLatestVersion`
  `checkForUpdate` called `getLatestVersion(cwd)` and the JSDoc advertised a `cwd` parameter, but the function takes no arguments — it only reads the `$ASTRYX_LATEST_VERSION` env var, so the passed `cwd` was silently ignored. Removed the phantom parameter and its doc so the signature matches the behavior. No functional change to the update-nudge output.

#### Other Changes

- `swizzle.copy` payloads always include `package` and `usesStyleX` (both covered by tests), but `SwizzleCopyResponse.data` didn't declare them — the call site cast the payload to `Record<string, unknown>` to sidestep the mismatch. Added both fields to the type and dropped the loose cast so the payload is type-checked.
- The error `suggestions` shape was declared as `{name, reason}` (reason required) in the JSON envelope / API error contract, but some call sites emit bare `{name}` (e.g. candidate component names on swizzle). Introduced a single canonical `Suggestion` type (`reason?` optional) and referenced it everywhere so the contract matches the emitted data.

#### Contributors

Thanks to everyone who contributed to this release:

- @josephfarina

---

# 0.1.8

#### Breaking Changes

- Avatar and AvatarGroup adopt Icon's abbreviated size scale — `size` now takes `xsm`/`sm`/`md`/`lg`/`xl` instead of `tiny`/`xsmall`/`small`/`medium`/`large`. Pixel values are unchanged (20/24/36/48/128px) and the default is now `md` (still 36px, formerly `small`). Avatar's tiers stay larger than Icon's because avatars align with media rather than glyphs. Run `astryx upgrade` to migrate call sites. (#2672)

#### New Features

- `astryx init --features agents` now defaults to creating root `AGENTS.md` — the tool-agnostic standard that Codex/Copilot, Cursor, and most agents read — instead of the Claude-specific `.claude/CLAUDE.md`. Claude output is now opt-in via `--agent claude` (→ `.claude/CLAUDE.md`), and `--agent all` still writes both. Projects with existing agent-doc files are unaffected: init still discovers and updates every file already present, so this only changes the from-scratch default. (#4216)
- "Foolproof init": both `@astryxdesign/core` and `@astryxdesign/cli` now print a postinstall nudge pointing you to `npx @astryxdesign/cli init`, `astryx` commands nudge you to finish setup until init has run, and `astryx init` runs non-interactively (no TTY required) so it works in CI and agent environments. (#4147, #4153, #4154, #4155)

#### Fixes

- Stop suggesting bare `npx astryx` before the CLI is installed — it resolves to an unrelated package on the npm registry.
  The CLI now emits an install-aware invocation everywhere it prints a command:
- Extend the v0.1.0 upgrade codemods to cover test files that mock `@xds/core` modules, which were previously left half-migrated and broke after upgrade:
- `astryx upgrade` now keeps the managed agent-docs block (`<!-- ASTRYX:START --> … <!-- ASTRYX:END -->`) in sync with the installed version on **every** path — including the up-to-date and no-codemods short-circuits that previously returned before any refresh, leaving AI agents reading a stale component index and superseded rules. The block documents the installed library, so it's now refreshed up front (independent of codemods) and reported in the `--json` receipt as `agentDocs`. One detection pass covers three cases: a stale block is rewritten (`--apply`) or reported as a pending change (dry-run, which no longer writes); a project with core installed but no managed block is nudged to run `astryx init --features agents`; an already-current block stays silent. (#4168, #4169)

#### Documentation

- Add a `cli-integrations` CLI docs topic (`astryx docs cli-integrations`) so the integration-authoring guide (originally written by @ejhammond) is discoverable through the CLI and docsite instead of an unreferenced markdown file. Rewrite the CLI README's Configuration section to match the current strict config schema (`integrations`, `issuesUrl`, `hooks.postCodemod`, `experimental.xle`) and reframe the Integrations section around the two-file API.

#### Other Changes

- Installed / global / dev runs suggest `<pm> astryx <cmd>` (e.g. `pnpm exec astryx …`), unchanged.
- One-off runs (launched via `npx`/`pnpm dlx`/`yarn dlx`/`bunx`) suggest the scoped package `<dlx> @astryxdesign/cli <cmd>`, which always resolves to us.
- **migrate-xds-module-specifiers**: rewrite the mocked-module path in `vi.mock`/`vi.doMock`/`jest.mock`/`jest.doMock` (and bare `mock`) calls, plus `import(...)` specifiers used in TS type positions (`typeof import('@xds/core/Text')`), so the mock still intercepts the renamed `@astryxdesign/*` import.
- **drop-xds-prefix-imports**: un-prefix partial-mock override keys inside an `@xds/core` mock factory (e.g. `useXDSTruncation` → `useTruncation`) so the override matches the renamed export instead of silently overriding nothing. Scoped to recognized `@xds/core` mock factories only; unrelated object keys are untouched.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond
- @joeyfarina
- @josephfarina

---

# 0.1.7

#### New Features

- Export the authoring factories from `@astryxdesign/core`: `createConfig` at `@astryxdesign/core/config` and `createIntegration`/`createPageTemplate`/`createBlockTemplate`/`createComponentDoc`/`createFunctionDoc`/`createDoc` at `@astryxdesign/core/authoring`. Authoring a config or integration no longer requires depending on the CLI. Existing `@astryxdesign/cli/*` imports keep working via re-export.
- Add the finalized doc-authoring API to `@astryxdesign/cli/doc`: `createComponentDoc`, `createFunctionDoc` (any function, including hooks), and `createDoc` (generic reference/topic docs). Each factory stamps a `type` discriminant and is validated at the load boundary against a matching per-kind schema. The legacy loose `export const docs = {...}` format keeps loading unchanged, and `.ts`-authored hook/function sources now derive their import path to a tree-shakeable subpath instead of the bare package root.
- New codemod for the Table `tableProps` deprecation: lifts object-literal `tableProps` keys into direct props on `<Table>`, keeps colliding or dynamic values in place with a TODO note. **Codemod:** `npx astryx upgrade --codemod migrate-table-tableprops-to-direct-props` (#3679)
- New docs topic `internationalization` covering how to localize astryx components, provide translation catalogs, override default strings, coexist with existing i18n libraries (react-intl, i18next, next-intl), swap languages at runtime, and validate coverage with the shipped pseudo locale. Run `npx astryx docs internationalization` or read it at https://astryx.atmeta.com/docs/internationalization.
- template: accept `.template.{ts,mjs,js}` as the canonical suffix for template-spec files, alongside the legacy `.doc.*` suffix. Template specs export `createBlockTemplate`/`createPageTemplate` — a scaffoldable template, not documentation — so they now get a descriptive name. Core, external-package, and integration discovery (`findShowcase`, `--blocks`, `astryx template <id>` scaffolding) all treat `Foo.template.ts` identically to a legacy `Foo.doc.mjs`; same-stem `.tsx` source resolves for either suffix, and `.template.ts` authoring is loaded via jiti. Additive only — no existing files are renamed.

#### Fixes

- Translated component docs no longer drop props
  A `docsZh` / `docsDense` block that carried its own `props` array replaced the English component doc **wholesale** rather than overlaying it, so any prop the translation had not caught up with simply ceased to exist. `astryx component Button --zh` silently omitted `isInterruptible` and `isIconOnly`; ten components were affected, including `MobileNav`, `Popover` and `Stack` through the multi-component `components[]` shape.
- Anchor --dense / --zh doc overlays to their base sections (#2182)
  The compressed and translated reference docs were merged into the base doc **by array position**, so an overlay whose sections were ordered differently — or which omitted one — grafted every title onto the wrong body.
- template: inline full demo-image URLs in the Avatar blocks and theme-showcase page so scaffolding strips them to a clean placeholder. Templates that stored only the CDN base in a `const` and appended the filename via interpolation (`` `${CDN}/File.png` ``) previously scaffolded a malformed `src` — the placeholder data URI with the filename glued onto the end — plus a dead `const CDN = 'data:…'`. (#4027)

#### Documentation

- Document the minimal `package.json#exports` recipe an integration needs so its block templates are importable by a bundler-resolution consumer and type-check under `moduleResolution: bundler`: `"./templates/*.tsx": "./templates/*.tsx"` plus an extensionful `import('@acme/widgets/templates/…/…Showcase.tsx')`. Adds `packages/cli/docs/integration-authoring.md` and a fixture test proving the recipe against the repo's own `tsc` and `esbuild`.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @ejhammond
- @imdreamrunner
- @nynexman4464

---

# 0.1.6

---

# 0.1.5

#### New Features

- Add a v0.1.5 upgrade codemod that renames `labelSpacing="default"` to `labelSpacing="hug"` on Switch. (#2889)
- New `incident-console` page template: an on-call incident response console demonstrating the frame-first tracker archetype — grouped dense incident rows (StatusDot severity, Token state), PowerSearch filtering, status segmented control, and a resizable inspector panel with metadata and timeline. Adds the `Tools - Incident Console` template category.
- New `messaging-shell` page template: Slack-style column frame (rail | sidebar | stream | thread panel) built on the Chat component family — dense rows, zero cards. Adds the `Shell - Messaging` template category.

#### Fixes

- Fill viewport height across CLI page templates so the background covers the full page (#3762)
- `astryx init --features agents` now supports `--agent hermes`. The preset injects the component index into an existing `.hermes.md`/`HERMES.md` (Hermes Agent's top-priority project-context files) and otherwise creates root `AGENTS.md`, which Hermes loads from the project root — unlike the `.claude/CLAUDE.md` default. Additive only: existing `claude`/`cursor`/`codex`/`all`/auto-detect behavior is unchanged. (#2187)
- cli: `astryx doctor` now detects `@astryxdesign/theme-*` packages in pnpm projects. pnpm installs packages as symlinks into `node_modules/.pnpm`, and the theme scan only accepted real directories, so every symlinked theme package was skipped and doctor warned that none were installed (#3530).
- Make `astryx theme build`'s color-scheme declaration mode-aware, so built themes with `light-dark()` tokens no longer defeat `<Theme mode="light|dark">` forcing (#3660)
- `runCodemods` now returns `writtenFiles`, so `astryx upgrade`'s post-codemod hooks (prettier/eslint formatting) actually run on core-codemod changes.
  The runner built the `writtenFiles` list internally but omitted it from its return object, so `upgrade.mjs` read `codemodResult.writtenFiles ?? []` as always-empty and the configured `hooks.postCodemod` (e.g. `prettier --write`, `eslint --fix`) received no files and silently skipped. As a result, jscodeshift's default double-quote output (`"@astryxdesign/core/Button"`) was never reformatted to the project's style, failing `prettier-format` lint on migrated apps. The sibling `integration-runner` already returned `writtenFiles` correctly, so integration-codemod changes were formatted while core-codemod changes were not.
- `astryx swizzle`: swizzled components ship raw StyleX source that needs a build-time StyleX compiler, and without one they render unstyled with no error. The command now prints a StyleX build-setup note after copying (including the Next.js caveat that the StyleX Babel plugin disables SWC and breaks `next/font`, so an SWC-based transform is required), and `astryx docs styling` gains a "StyleX Build Setup" section covering per-bundler setup. (#3373)
- `astryx theme build`: custom component variants declared in a theme (e.g. `button['variant:accentOutline']`) now generate a type augmentation against the component's real interface (`ButtonVariantMap`) instead of a non-existent `XDS`-prefixed one, so `variant="accentOutline"` type-checks. Props with no augmentation point (closed unions like Button `size` or Heading `type`) are skipped instead of emitting dead augmentations, and the generated `.variants.d.ts` is now referenced from the theme's `.d.ts` so the augmentation actually loads. (#3371)

#### Documentation

- CodeBlock: terminal-style dark block template (syntaxTheme preset)
- Add cascade-layer safety guidance to the migration guide (`astryx docs migration`): a Cascade Layer Safety audit checklist (unlayered styles and later layers both beat `astryx-base` regardless of specificity, classify every stylesheet into a layer deliberately, layer Tailwind preflight on both v3 and v4) and a Foundation Smoke Test section (one page with Button/TextInput/Card/Table plus a non-zero-padding assertion) so a broken layer order fails before feature work instead of after N migrated screens. The getting-started guide now points to it from the theme CSS step.
- NavHeadingMenu: add a playground config and showcase block so the Overview tab has a working preview (#2698)
- NavHeadingMenu: constrain the showcase SideNav to a shorter height so the heading no longer appears to float at the top of the Overview preview (#2698)

#### Contributors

Thanks to everyone who contributed to this release:

- @arman-luthra
- @cixzhang
- @ejhammond
- @harjothkhara
- @is-jain
- @jiunshinn
- @josephfarina
- @let-sunny
- @thedjpetersen
- @zeroryu

---

# 0.1.4

#### Fixes

- `astryx component <Name>` now prints the correct `defineTheme` component-override key. The theming example stripped a stale `xds-` prefix (left over from the astryx rename) instead of `astryx-`, so it advertised keys like `astryx-base-table` / `astryx-button`. Those double-prefix to `.astryx-astryx-*` selectors at runtime and silently match nothing. Keys are now the stable class name minus `astryx-` (e.g. `base-table`, `button`), which is what `generateThemeRules` expects (#3458).
- Harden the v0.1.0 upgrade codemods against three cases surfaced while migrating consumer apps:

#### Documentation

- Add a browser-support guide (`astryx docs browser-support`) documenting the support tiers, the modern platform features Astryx depends on (Popover API, CSS anchor positioning, `light-dark()`), which components are affected, and how consumers can support older browsers for their own audience.

#### Other Changes

- **drop-xds-prefix-imports**: when un-prefixing an `@xds/core` import (e.g. `XDSCodeBlock` → `CodeBlock`) would collide with a same-named local binding in the file (such as a local `export function CodeBlock` wrapper), alias the import to `Astryx<Name>` and rewrite its usages instead of producing a duplicate declaration that breaks the build.
- **migrate-xds-css-surfaces**: rewrite CSS `@import` of `@xds/*` package stylesheets (both `'…'`/`"…"` and `url(…)` forms), including the `@xds/core/xds.css` → `@astryxdesign/core/astryx.css` file rename and the `theme-default`/`theme-daily` → `theme-neutral` collapse.
- **migrate-xds-module-specifiers**: when collapsing `@xds/theme-default`/`@xds/theme-daily` to `@astryxdesign/theme-neutral`, remap the `defaultTheme` export to `neutralTheme`, aliasing back to the original local name (`neutralTheme as defaultTheme`) so downstream usages keep working.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond
- @ryanda9910

---

# 0.1.3

#### New Features

- Add a hidden `astryx blog` command that reads the blog over the site's RSS feed and prints a post's plaintext (`.txt`) variant. The command is not shown in `--help` or the manifest and always reads from the canonical site origin.
- Component discovery is now package-ownership aware: --package scoping, source resolution for integration components, and package-qualified JSON listings.
- Strict config + integration v1 schema (integrations, issuesUrl, hooks.postCodemod) and new @astryxdesign/cli/integration export.
- File-based codemod API (createCodemod/createConfigCodemod) with the @astryxdesign/cli/codemod export and integration codemod discovery in upgrade.
- component, template, and upgrade now print a one-line non-blocking warning when a configured integration has validation issues, pointing to validate-integration.
- Add a Kanban Board page template: color-coded status columns, draggable task cards with priority tags, and board toolbar. Based on a design by @cg-hub18.
- Add frame-first layout guidance: new `astryx docs layout` topic (shell choice, region budgets, app archetypes, cards-vs-rows policy, responsive contracts), layout rules in the generated agent cheat sheet, and layout anti-patterns in `docs principles`.
- Add a v0.1.3 config codemod that migrates astryx.config layout.components to experimental.xle.components.
- Add v0.1.0 codemods for migrating `declare module "@xds/core/..."` type augmentations and `.xds-*` / `[data-xds-theme]` / `@layer xds-theme` CSS surfaces to their `@astryxdesign`/`astryx-*` equivalents.
- Introduce the Project configuration API as the single entry point for reading resolved project config, components, templates, codemods, and issue routing, replacing loadConfig. Misconfigured integrations are now skipped with a warning during upgrade instead of hard-failing, and a new --skip-codemod flag lets you re-run past a failed codemod.
- Add a Shell page-template category to the CLI: Top Nav, Side Nav, and Shell Nav app-shell scaffolds (#3245, #3246, #3247)
- Static template authoring API (createPageTemplate/createBlockTemplate) with the @astryxdesign/cli/template export and type-driven, package-scoped template discovery.
- Swizzle can now copy integration-owned components, rewrites escaping imports to the owning package, and routes maintainer feedback through config and integration issue URLs.
- `astryx theme build --watch`: rebuild a theme automatically whenever the source file changes, until interrupted with Ctrl-C. Removes the manual re-run step (and the stale-CSS confusion that comes with forgetting it) from the theme-authoring loop. Each rebuild runs in a child process so a build error is contained and the watcher keeps running. Not supported with `--json`. (#3375)
- Add the validate-integration command and integration issue model for checking an Astryx integration package's manifest and contributions.
- XLE app-component registration moved into validated config under experimental.xle.components (object form), replacing the unvalidated layout.components read.

#### Fixes

- Align the CLI error-code type declarations with the runtime error codes (add the missing ERR_AMBIGUOUS_TEMPLATE declaration).
- Correct the `doctor` theme-wiring hint to reference the real `astryx.theme` config field (was `xds.theme`) and update the agent-docs check wording to say "Astryx".
- Update the API/CLI parity harness for the package-qualified `component --list` shape, and make the component API reject a non-string name with a clean error instead of throwing.
- The XDS-prefix drop codemod now runs as a mandatory v0.1.0 upgrade step, so upgrading from 0.0.x rewrites prefixed imports (useXDSTheme, XDSButton, XDSIconRegistry, ...) to their bare names alongside the @xds/_ → @astryxdesign/_ scope rename.
- upgrade now runs core codemods before loading config, so a config codemod can repair an otherwise-invalid config; dry-run reports a fixable config and suggests the command to apply it.

#### Documentation

- Blockquote: add "With Attribution" and "Testimonials" examples (#3385)
- DateTimeInput and DateRangeInput: add example blocks so their docs pages have populated Examples sections and playground links (#2724)
- Add copyable example blocks to 46 component docs pages that previously showed only a hero visual and an empty Examples section (#3481)
- HoverCard: give the "Link Preview" example an interactive `Link` trigger so there is something to hover over (#2728)
- Lightbox: add Gallery, Video, and Zoom examples and fix the playground preview (#3301)
- Remove lingering references to the removed gap-report feature and swizzle gap flags; docs now reflect swizzle's maintainer feedback link.
- Tab: add an interactive example showing `icon` and `selectedIcon` on the Tab docs page (#2765)
- ToggleButtonGroup: add a vertical example block showing orientation="vertical" with single- and multi-select groups (#2707)

#### Other Changes

- Integration codemod and template-doc loading now use the shared module-loader util instead of duplicating the jiti/import logic.
- Extract the shared module-loading + conventional-file-discovery helpers used by config and integration loading into one internal util (no behavior change).
- Remove the standalone gap-report command. Swizzle now prints a short maintainer feedback link instead of filing issues.
- Load and validate user-authored config, integration, codemod, and template modules through one shared module loader; create\* factories are now type-only and validation happens at load.
- Remove the obsolete xds config-surface migration codemod and unify config codemod execution on the shared (file, api) runner used by integration codemods.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cg-hub18
- @ejhammond
- @ernestt
- @harshavardhan194
- @josephfarina
- @kentonquatman
- @mohitWeb-lab
- @pollychen-lab
- @thedjpetersen

---

# 0.1.2

#### Breaking Changes

- `Text`, `Heading`, `Link`, and `Timestamp` rename the `color="active"` value to `color="accent"`, now mapping to the dedicated `--color-text-accent` token (legible accent text ink) instead of `--color-accent`. Run `astryx upgrade` to migrate call sites automatically. (#2863)

#### New Features

- Let `astryx.config.mjs` integrations contribute package docs, gap-report hooks, template fetching hooks, upgrade codemods, and post-codemod hooks.
- Add `astryx theme add <slug> [path]` (and `astryx theme list`) to scaffold a theme's source into your project as editable files you own, with theme sources bundled into the CLI

#### Fixes

- align `astryx init` theme instructions with the runtime built-theme recommendation (#3080)
  `astryx init` now points users at the pre-built theme path (`@astryxdesign/theme-neutral/built` + `theme.css`) and the base CSS imports, matching the runtime `<Theme>` console guidance, instead of the slower runtime style-injection import that left apps unstyled.
- `astryx theme build` now derives every output file (.css/.js/.d.ts) from the theme name so they share one naming scheme, shows import paths as bare `./<name>` specifiers (instead of a cwd-rooted `./src/...` path that was wrong when your file already lives under src/), and no longer warns about the `variant` prop on `card`

#### Documentation

- Rename the ClickableCard and SelectableCard examples to follow the "Component — Variant" title convention (`Clickable Card — Nested Button`, `Selectable Card — Multi-select`), and add playground defaults to both card docs so their docsite previews show realistic card content (#2877)
- Declare playground scaffolds for the Chat sub-components so they preview at a realistic width (ChatComposer and ChatComposerDrawer wrap in a sized container, and the drawer seeds default content), and drop the redundant visible value label from the ChatComposerDrawer "With Progress" example while keeping the accessible label (#2877)
- Rename the DateInput "Date Range" example to "Min/Max Constraints" — it demos a single input constrained to a min/max window, not a date-range picker (#2692)
- Wire local state into more showcase examples that were frozen (static value + no-op onChange): TextInput, TextArea, NumberInput, SegmentedControl, RadioList, Tab, TabList, and TabMenu. Follows the same fix as the Slider/Selector/MultiSelector showcases so the docsite previews are actually interactive
- Wire local state into the Typeahead, Tokenizer, and FileInput showcase examples (static value + no-op onChange → frozen previews). Completes the interactive-showcase fixes started for Slider/Selector/MultiSelector (#3187-#3189) and the input/tab batch
- Wire local state into the Slider, Selector, and MultiSelector showcase examples so they are interactive — they were controlled components with a static value and a no-op/missing onChange, so the docsite previews appeared frozen (#3187, #3188, #3189)
- Add a LinkProvider example block showing how to swap in a framework router link (e.g. Next.js Link) for client-side routing (#2733)
- Add a showcase block for Outline so its docs page has a hero preview, alongside the existing example blocks (#2871)
- Remove the "MoreMenu — In Toolbar" example block — it rendered incorrectly and was redundant with the other MoreMenu examples (#2870)
- Add rendered example blocks for the two column-axis Table plugin hooks,
  shown on their own subcomponent pages:
- Move the "ToggleButton — Group" example to the ToggleButtonGroup page, where it belongs (it demonstrates grouped toggle behavior) (#2842)
- Make the Toolbar "Table Filter" example use real Selector controls for its Status and Priority filters instead of buttons styled to look like dropdowns, and add meaningful playground defaults plus richer slot options (buttons, icon buttons, tabs, segmented controls, selectors) to the Toolbar docs (#2877).

#### Other Changes

- `useTableStickyColumns — Pinned Columns` (on /components/useTableStickyColumns)
- `useTableColumnResize — Draggable Columns` (on /components/useTableColumnResize)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @durvesh1992
- @ejhammond
- @humbertovirtudes
- @rubyycheung

---

# 0.1.1

#### New Features

- Add `astryx build` command for page composition, with natural-language search ranking.
  `build "<idea>"` returns a composition kit — the closest page template, the
  blocks that cover parts, and components to fill gaps, plus a Compose suggestion.
  `build` with no args prints the how-to-build playbook. The shared search ranking
  now handles oblique natural-language queries via tokenization + stopwords, a
  synonym/intent map, light stemming, and page-template keyword enrichment.
- Make generated agent docs build-first and restructure `init` output.
  The generated `CLAUDE.md` now leads with the `build` workflow (search reframed as
  a neutral universal find), and includes a required-CSS setup note
  (`reset.css` + `astryx.css`) so components never render unstyled. `init` now
  points agents at `astryx build`/`astryx search` instead of dumping page-template
  names.
- Improve `astryx build` output into a complete composition kit.
  `build "<idea>"` now returns an agent-ready kit grouped by role: a START line
  (scaffold vs compose), the closest PAGE template, an always-on FRAME (page
  shell) and FOUNDATION (layout/typography/action primitives), idea-specific
  BLOCKS and DOMAIN COMPONENTS (with a relevance floor to cut noise), and a SETUP
  reminder. The always-on FRAME/FOUNDATION groups fix low recall of the
  structural primitives every page needs but that never keyword-match an idea
  (measured: component recall 15% to 71% on an agent-grounded eval).
- Densify agent docs + tailor styling guidance to the project's configured system
  Tightened the generated `CLAUDE.md`/`AGENTS.md` block from ~48 lines to ~26
  (the per-topic `docs` dump collapsed to one line, `build`/`search`/`component`
  no longer duplicated between workflow and reference, run-prefix stated once,
  filler prose removed) — same information, far denser.

#### Fixes

- `npx astryx` now works when the CLI is installed as a real npm package.
  The bin imported its `../src/*` modules relative to the invoked path, so running
  through the `node_modules/.bin/astryx` symlink made them resolve outside the
  package (`ERR_MODULE_NOT_FOUND: .../node_modules/src/...`) on Node versions that
  don't realpath the bin entry. It now resolves siblings via the bin's real path
  (realpath of `import.meta.url`), working whether invoked via symlink, copy, or
  Windows shim. Also fixes the non-interactive `init`/`theme` error to say
  `astryx <command>` instead of the stale `xds <command>`.
- Add a v0.1.0 upgrade codemod that migrates legacy `@xds/*` module specifiers and config surfaces to the Astryx v0.1.0 names.
  [breaking] Remove legacy `astryx.versionFile` update-hint support from package.json.

#### Documentation

- Add npm install step to the Theme System guide
  The Quick Start section jumped straight to `import {neutralTheme} from '@astryxdesign/theme-neutral'`, which fails with `Cannot find module` for anyone who hasn't already installed the theme package. Prepend a one-line preamble + `npm install` code block, and add a short prose note above the Available Themes table pointing at the install command pattern. Reported in #3082.

#### Other Changes

- StyleX compiler wired → `xstyle` / StyleX token imports
- Tailwind → utility classes backed by `@astryxdesign/core/tailwind-theme.css`
- neither → `style`/`className` with `var(--token)` design tokens, plus an
  explicit note NOT to use `xstyle`/utilities (they would not compile)

#### Contributors

Thanks to everyone who contributed to this release:

- @ejhammond
- @josephfarina
- @nynexman4464

---

# 0.1.0

#### Breaking Changes

- Read project config from `astryx.config.mjs` (was `xds.config.mjs`)
  The CLI now resolves its optional project config from `astryx.config.mjs`
  instead of `xds.config.mjs` — a hard cut, no fallback. Consumers with an
  `xds.config.mjs` must rename it to `astryx.config.mjs` (the config shape and
  all fields are unchanged). Part of removing `xds` naming from the public API.
- Rename the CLI command/bin from `xds` to `astryx`
  The CLI binary is now `astryx` (was `xds`); `bin/xds.mjs` is renamed to
  `bin/astryx.mjs`, the dual `xds`+`astryx` bin entries collapse to a single
  `astryx`, and the program/manifest name is `astryx`. Invoke the CLI as
  `npx astryx <command>` (e.g. `npx astryx component Button`). The swizzle
  default output dir moves from `./components/xds` to `./components/astryx`.
  Consumers using `npx xds`, an `xds` npm-script alias, or the `xds` MCP server
  name should switch to `astryx`. Part of removing `xds` naming from the public API.
- Rename the exported `XDSError` class to `AstryxError`
  The CLI's programmatic API error class is renamed `XDSError` -> `AstryxError`
  (exported from `@xds/cli` + declared in its types). Consumers that catch or
  reference `XDSError` from the CLI's API should switch to `AstryxError`. Part of
  removing `xds` naming from the public API.
- Remove the XDS-prefix compatibility layer — astryx is now the only public surface
  This release erases all `xds` naming from the public API; there is no compatibility
  window. Consumers must migrate (we own all consumers pre-OSS):
- Remove the daily, brutalist, and default themes; neutral is the new baseline
  Three theme packages are removed from the repo and will no longer be published:

#### Fixes

- `theme build` generates valid bare type imports (IconRegistry/DefinedTheme)
  `astryx theme build` emitted `.d.ts` files importing `XDSIconRegistry` /
  `XDSDefinedTheme` from `@xds/core`, but those aliases were removed — the
  generated types failed to resolve. Generate `IconRegistry` / `DefinedTheme`
  (the bare names `@xds/core` now exports) instead.

#### Documentation

- Update CLI theme docs to the current theme set
  Refreshes the `astryx docs theme`, `getting-started`, `styling`,
  `styling-libraries`, and `migration` reference docs to reflect the published
  themes: `neutral`, `butter`, `chocolate`, `gothic`, `matcha`, `stone`, and
  `y2k`. The removed `theme-default`, `theme-brutalist`, and `theme-daily`
  packages are dropped from the docs, and install/import examples now use
  `@astryxdesign/theme-neutral` as the recommended starting theme.

#### Other Changes

- **Component names:** the `XDS*` aliases are gone — use bare names (`Button` not
  `XDSButton`, `useTheme` not `useXDSTheme`, `ButtonProps` not `XDSButtonProps`). The
  `drop-xds-prefix-imports` codemod automates this.
- **CSS classes:** components emit only `.astryx-*` (the dual `.xds-*` class is gone).
  Update custom CSS selectors `.xds-button` -> `.astryx-button` (prop/state value classes
  like `.primary`/`.sm` are unchanged).
- **data attributes:** only `data-astryx-theme` / `data-astryx-media` are written; update
  custom selectors and SSR root attributes off `data-xds-*`.
- **CSS layers:** `@layer xds-base` / `xds-theme` are renamed to `astryx-base` /
  `astryx-theme`; update your `@layer` order line and any PostCSS `layersBefore` config.
  `@astryxdesign/build`'s default library layer is now `astryx-base`.
- **Pre-compiled stylesheet:** the `@astryxdesign/core/xds.css` export is removed — import
  `@astryxdesign/core/astryx.css`.
- **CSS custom properties:** the `--xds-*` padding fallback is gone; set `--astryx-*`.
- **CLI config key:** `@astryxdesign/cli` reads the package.json `"astryx"` field (was `"xds"`).
  Rename the block; a stale `"xds"` key silently drops the package from discovery.
- `@astryxdesign/theme-daily`
- `@astryxdesign/theme-brutalist`
- `@astryxdesign/theme-default`
- import {defaultTheme} from '@astryxdesign/theme-default/built';
  - import {neutralTheme} from '@astryxdesign/theme-neutral/built';
- <Theme theme={defaultTheme}>...</Theme>
  - <Theme theme={neutralTheme}>...</Theme>

  ```

  ```

- Remove the internal `drop-xds-meta-prefix` codemod from the OSS repo (#2970)
  This codemod has been moved to its own package's tooling, where it belongs. It was registered as an optional, version-independent transform and is not part of any standard upgrade path, so removing it does not affect the public `0.0.13 → 0.0.15` migration.
- Rename the npm package scope from `@xds/*` to `@astryxdesign/*`
  All published packages move to the new `@astryxdesign` scope (e.g. `@xds/core` → `@astryxdesign/core`), along with the workspace lockfile, build/runtime scope-directory scans, and docsite slug derivation. Consumers must update their imports and dependency names. The internal ESLint plugin namespace (`@xds/*` rules) is intentionally untouched and tracked separately. Existing `@xds/*` codemods continue to target the old scope so projects still on `@xds/*` can migrate.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond

---

# 0.0.15

#### Breaking Changes

- **New `astryx upgrade` codemods** — This release ships codemods for the DatePicker→Input rename (`rename-date-picker-to-input`), Stack `element`→`as` (`rename-stack-element-to-as`), Chat `isStreaming`→`isStopShown` (`rename-isStreaming-to-isStopShown`), imperative `ref`→`handleRef` (`rename-imperative-ref-to-handleRef`), the menu/selector `children`→`endContent` move (`migrate-item-children-to-endcontent`), and the selector function-children→`renderOption` move (`migrate-selector-children-to-render-option`). The bare-name migration (`drop-xds-prefix-imports`, `drop-xds-meta-prefix`) and the theme `migrate-theme-selectors-to-data-attrs` codemod ship as optional, run them explicitly. (#2879, #2957)

#### Upgrade

```bash
npx astryx upgrade --apply
```

#### New Features

- **`astryx` binary** — The CLI is now also available as `astryx` (same launcher as `xds`), part of the un-prefix migration. Component discovery, the doc gate, and CI checks are prefix-agnostic — both `XDS{Name}.tsx` and bare `{Name}.tsx` source files are recognized. (#2867, #2878)
- **`astryx doctor`** — New health-check command for diagnosing project/setup issues. (#2565)
- **Unified search** — `astryx search` searches across components, hooks, docs, and templates in one query. (#2564)
- **Capability manifest** — Full machine-readable capability manifest for agent discovery, plus stable machine-readable error codes on every error. (#2562, #2563)
- **`@xds/cli/api` hook export** — The `hook` is exposed via `@xds/cli/api` with types and parity coverage. (#2558)
- **CLI exit-code policy** — Every user-visible error now exits with code 1 in both human and `--json` modes (previously several command-layer errors printed a message but exited 0, invisible to CI scripts and AI agents). `xds bogus-cmd`, `astryx theme bogus-subcommand`, the bare `theme` group with an unknown subcommand, and "command not found"/"did you mean…" paths all exit 1. Help, version, and bare-list invocations still exit 0. Introduces `lib/cli-error.mjs` as the canonical exit-code helper.
- **Migration guide** — Added an explicit guide for moving existing Tailwind, shadcn, and Radix applications to XDS incrementally.
- **Data-attribute selector docs** — Documented the data-attribute selector surface in CLI docs alongside the core dual-emit change.

#### Fixes

- **`--json` on Commander short-circuits** — `--json` now honored on parse errors and `--help`. A new shim wires `exitOverride()` and a JSON-aware `configureOutput` onto every command and patches `outputHelp` to emit a `{apiVersion, type:'help', data}` envelope under `--json`. Parse errors produce `{apiVersion, error}` on stdout with exit 1; unknown subcommands now error instead of silently emitting help with exit 0; `--detail` is choice-validated. Non-`--json` invocations are unchanged.
- **`--json` contract enforcement** — Commands that don't support `--json` reject the flag in a `preAction` hook _before_ running side effects, so `astryx init --json` no longer creates files and _then_ errors, leaving partial state behind.
- **`--json` envelope documented** — Success responses are `{ type, data }`; error responses are `{ error, suggestions? }`. The `--json` help text describes both.
- **`xds --version --json`** — Emits `{ type: 'version', data: { version } }` instead of plain text.
- **`xds --json` (no subcommand)** — Emits `{ type: 'help', data: { commands, jsonSupported, ... } }` instead of human help text.
- **`astryx upgrade --json`** — "Already up to date" and "no codemods in version range" paths emit structured `{ type: 'upgrade.status', ... }` envelopes. The codemod runner is silent under `--json` so prompts and progress lines no longer corrupt stdout.
- **`astryx discover --json`** — Includes `meta: { configured: false }` when no packages are configured, distinguishing "configured but empty" from "not configured".
- **`xds gap-report --json`** — Returns a structured error instead of starting an interactive prompt when required flags are missing; the "gh CLI missing" path also emits a JSON error.
- **`astryx theme --json`** — The `theme` parent command (without a subcommand) rejects `--json` cleanly; `theme build --json` continues to work.
- **Theme CSS prose regression** — `astryx theme build` now uses a single CSS generation path (`@xds/core`'s generator) and treats a failed `@xds/core/theme` import as a hard build error instead of a silent fallback, fixing the docsite Markdown typography regression after the XDS-prefix migration. (#2964)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @czarandy
- @ejhammond
- @ernestt
- @imdreamrunner
- @josephfarina
- @kentonquatman
- @rubyycheung
- @thedjpetersen

---

# 0.0.14

#### Codemods

- `rename-action-props` — Rename `on*Action` props to `*Action` (React 19 convention) (#1942)
- `rename-status-variants` — Rename `positive`/`negative` status to `success`/`error` (#2175)
- `rename-section-wash-to-muted` — Rename Section `wash` variant to `muted` (#2063)

#### New Features

- **New component showcases** — XDSAvatarGroup, XDSInputGroup, XDSStepper, XDSButtonGroup, XDSContextMenu, XDSFileInput, XDSDateRangePicker, XDSDateTimePicker, XDSBlockquote
- **Hook documentation system** — `xds hooks` CLI command for hook docs (#1849)
- **Playground defaults** — Added to 19 more components (#2047)
- **Theme/MediaTheme/SyntaxTheme showcases** — Utility showcase support (#2040, #2028)
- **Slot elements** — Wired through playground UI for ReactNode props (#2012, #2005)
- **`exampleFor` field** — Added to all block templates (#1966)
- **`scaffold` flag** — Template metadata scaffold support (#1939)
- **Table page templates** — Heatmap Status, Matcha Store, Chart Shoe Store (#2172, #2149, #2154)

#### Fixes

- **Group useXDSToast and useXDSCollapsible** with their parent components in docs (#2049)
- **DropdownMenu inline data types** — Inline into items prop docs (#2027)
- **Parent hook docs** to their component in docsite (#2022)

---

# 0.0.13

#### Codemods

- `toolbar-density-to-size` — Migrate Toolbar `density` prop to `size` (#1448)
- `icon-name-deprecations` — Rename `checkCircle`/`xCircle` icons to `success`/`error` (#1503)
- `rename-attachments-to-drawer` — Rename `XDSChatComposerAttachments` → `XDSChatComposerDrawer` (#1714)

#### New Features

- `--skip-install` and `--force-install` flags for `astryx upgrade` (#1547)
- `npx astryx docs icons` reference + updated icon prop descriptions (#1500)
- Theme nudge in generated agent docs (#1456)
- Theme `expandColorScale` — derive color tokens from accent hex in `astryx theme build` (#1452)
- Component groups read from doc files instead of hardcoded map (#1650)
- Page and block template system (#1393)

#### Fixes

- Handle prerelease suffixes in `semverCompare` (#1512)
- Handle ternary/logical expressions in `icon-name-deprecations` codemod (#1513)
- Don't inject XDS block into files without markers during upgrade (#1495)
- `findShowcase` matches by directory name and `componentsUsed` (#1728)
- Include `onMedia` CSS in built theme output (#1450)
- Register codemods for v0.0.13 (moved from v0.0.14) (#1508)

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.13
```

---

# 0.0.12

#### Codemods

- `add-is-icon-only` — Add `isIconOnly` to icon-only Button and ToggleButton usages (#1257)

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.12
```

---

# 0.0.10

#### Codemods

- `remove-size-props` — Remove `size` prop from StatusDot and ProgressBar (#966)

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.10
```

---

# 0.0.8

#### New Features

- CLI: tsx parser for .ts files
- Update hints in postAction hook

#### Codemods

- `rename-endslot-to-endcontent` — Button `endSlot` → `endContent` (#895)
- `migrate-token-renames` — Token name migration to v0.0.8 convention

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.8
```

---

# 0.0.7

#### Codemods

- `rename-banner-variant-to-container` — Banner `variant` → `container` (#814)

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.7
```

---

# 0.0.6

#### Codemods

- `migrate-token-names` — Design token renames per naming audit
- `migrate-shadow-tokens` — Elevation → shadow semantic naming
- `migrate-collapse-to-collapsible` — XDSCollapse → XDSCollapsible
- `migrate-radius-tokens` — Semantic radius → numeric scale
- `migrate-skeleton-radius` — Skeleton radius prop → numeric scale
- `migrate-badge-children-to-label` — Badge children → label prop

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.6
```

---

# 0.0.5

#### New Features

- Generate agent cheat sheet from live CLI metadata (#640)
- `--detail` and `--lang` flags for typed `.doc.mjs` output (#636)
- Fold `agent-docs` into `init` with `--features` flag (#639)

> **Note:** Codemods for v0.0.5 breaking changes are registered under v0.0.6. Use `--to 0.0.6`.

---

# 0.0.4

#### Features

- **`astryx theme build`** — Renamed from `build-theme` to `theme build` (#570)
- **`--lang` flag** — ComponentTranslationDoc support for i18n/compressed docs (#611)
- **`--zh` flag** — Chinese Simplified doc output (#567)

#### Refactors

- Split `component.mjs` into `lib/` modules with lazy command registry (#613)

---

# 0.0.3

#### Patch Changes

- Sync package.json exports map
- Add verify-exports CI check (#537)

---

# 0.0.2

#### New Features

- `astryx upgrade` command with codemod support
- `astryx theme build` (formerly `build-theme`)

#### Codemods

12 codemods for the v0.0.2 breaking changes:

- `rename-selector-items-to-options` — Selector `items` → `options`
- `unify-visibility-to-onOpenChange` — Visibility callbacks → `onOpenChange`
- `unify-uncontrolled-to-defaultX` — Uncontrolled state → defaultX pattern
- `rename-banner-endButton-to-endContent` — Banner `endButton` → `endContent`
- `rename-form-tooltip-startIcon` — Form `tooltip` → `labelTooltip`, `startIcon` → `labelIcon`
- `rename-isShown-to-isOpen` — Dialog/Popover `isShown` → `isOpen`
- `rename-topnav-title-to-heading` — TopNav title → heading
- `rename-sidenav-header-to-heading` — SideNav header → heading
- `migrate-useXDSIcon-to-getIcon` — `useXDSIcon()` → `getIcon()`
- `migrate-gap-to-numeric` — String gap tokens → numeric
- `migrate-isFullBleed-to-padding` — `isFullBleed` → `padding={0}`
- `migrate-badge-dot-to-statusdot` — Badge dot → StatusDot

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.2
```

---

# 0.0.1

- Initial release

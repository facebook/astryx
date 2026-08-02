---
'@astryxdesign/cli': patch
---

[fix] cli hardening pass — validate inputs at the API layer, close path-safety gaps, and prevent agent-docs content loss. The API is a public surface (`@astryxdesign/cli/api`), so guards that lived only in the CLI wrapper are pushed into the API.

Path safety (the guard the write commands all depend on):

- `assertWithin` now canonicalizes symlinks (realpath of the deepest existing ancestor) — a symlink inside the project root pointing outside no longer lets a write escape. Also rejects a NUL byte in the path. This closes the escape for every command that writes through the guard (swizzle/template/upgrade/theme/layout/agent-docs).

Per-command input validation + write safety:

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

Agent-docs data integrity:

- `injectXdsBlock`/`removeXdsBlock` no longer drop, duplicate, or orphan user content on malformed managed blocks (END-before-START, duplicate/nested blocks, or a start marker with no end). They locate a single well-formed block (END searched after START) and refuse to touch an ambiguous/half-written file instead of corrupting it.

Backfills api-level tests for the zero-coverage commands (`component`, `search`, `doctor`), the `hook`/`discover`/`docs` dispatchers (incl. `hook.list --category` unknown → `ERR_UNKNOWN_CATEGORY`), the blog adapter/leaf/CLI wrapper, doctor degradation paths, manifest determinism + subcommand ordering, `build` error-code faithfulness, `layout check` exit-code parity, `layout expand` JSX-safe text payloads, `swizzle` import rewriting (dynamic import, two-levels-up assets, theme StyleX subpath, barrel collapse), config-codemod isolation, a static guard that every inline error envelope carries a `code`, `isAstryxInitialized` malformed-marker resilience, and unit tests for `levenshteinDistance`, `checkGhCli`, the error-envelope contract, path-safety symlink escapes, the agent-docs malformed-block cases, `jsonOut` serialization-failure discipline, the `print` string round-trip, the package scanner's adversarial-node_modules handling, `resolveTheme`'s malformed-`astryx.theme` degradation, and the pure `string-utils` / `config-schema` / consumer-facing `json` parser / `term-log` json-silence modules.

Codemod runner + integration loading:

- The codemod source scan no longer follows symlinks (a symlinked file under the scanned path could rewrite its target OUTSIDE the project) and skips generated-output dirs (dist/build/out/.next/coverage) — codemods rewrite source, not artifacts or dependencies.
- `resolvePackageDir` rejects an integration spec that isn't a bare package name (no `..`, no absolute, must stay in node_modules) — a config spec can no longer point the loader at an arbitrary module.
- A broken integration manifest (throws on import or fails schema validation) no longer crashes `Project.load` (and thus every command). It's recorded and surfaced via `issues()`, restoring the documented skip+warn policy; other integrations still load.

Codemod transforms (token migrations):

- The `--radius-*`, `--shadow-*`/`--elevation-*`, and `--color-*` token-migration codemods no longer rewrite a longer consumer-defined token that merely shares a prefix (e.g. `--radius-container-custom` → `--radius-3-custom`, `--radius-innermost` → `--radius-0most`, `var(--shadow-10)` → `--shadow-base0`, `--color-positive-custom` → `--color-success-custom`). The boundary lookahead was binding only to the last alternative in the pattern (and two codemods had no boundary at all); it now wraps the whole alternation, so only exact token names migrate.
- `migrate-badge-children-to-label` no longer emits a duplicate `label` prop when the badge already has one (`<XDSBadge label="x">Active</XDSBadge>` produced an invalid `label="x" label="Active"`); it now skips a badge that already declares `label`.

Component discovery:

- `readDocMeta` no longer reads a `group:`/`hidden:` field nested inside a `propDescriptions` block (a docsZh/docsDense translation export) as the component's group — that leaked a translated prop description as a group key in the default English `component --list` (e.g. a Chinese string appeared as a group). The field regexes now match top-level fields only (<=2 spaces).

@josephfarina

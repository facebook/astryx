---
'@astryxdesign/cli': patch
---

[fix] cli hardening pass — validate inputs at the API layer, close path-safety gaps, and prevent agent-docs content loss. The API is a public surface (`@astryxdesign/cli/api`), so guards that lived only in the CLI wrapper are pushed into the API.

Path safety (the guard the write commands all depend on):

- `assertWithin` now canonicalizes symlinks (realpath of the deepest existing ancestor) — a symlink inside the project root pointing outside no longer lets a write escape. Also rejects a NUL byte in the path. This closes the escape for every command that writes through the guard (swizzle/template/upgrade/theme/layout/agent-docs).

Per-command input validation + write safety:

- `search()`: non-positive/non-integer `limit`, empty query, unknown `--type` → `ERR_INVALID_ARGUMENT` (previously `limit: 0` returned the full unclamped set).
- `swizzle()`: the component name is sanitized so `..`/separators can't escape the `--output` base.
- `template()` copy: refuses to clobber without `overwrite: true` (`ERR_FILE_EXISTS`); adds an `overwrite` option.
- `upgrade()`: the `--path` scan dir is confined to cwd (`--apply` rewrites files in place).
- `init()`: template scaffold refuses to clobber an existing `page.tsx` (`ERR_FILE_EXISTS`); an unknown `--agent` now throws `ERR_UNKNOWN_AGENT` (was silently ignored).
- `layout`: rejects an unknown `--form` (`ERR_INVALID_OPTION`) and empty expression (`ERR_INVALID_ARGUMENT`).
- `component --package <pkg> --showcase`/`--blocks`: route to the right leaf instead of falling back to `component.detail`.
- `discover`/`docs` leaves: empty query/section errors instead of matching everything via `.includes('')`.
- `blog()` detail: a non-string slug throws `ERR_INVALID_ARGUMENT` (was a raw `TypeError` the CLI downgraded to `ERR_UNKNOWN`), and fails fast before any network fetch.
- `doctor`: no longer crashes (raw stack in human mode / `ERR_UNKNOWN` in `--json`) when multiple `astryx.config.*` files coexist — it reports a `config` FAIL. Version-alignment skips (info) instead of a spurious drift WARN with a `NaN.undefined.x` fix when either version isn't comparable semver (e.g. `workspace:*`).
- `manifest`: subcommands are sorted by name (same stability guarantee the top-level command list makes), so reordering `.command()` calls can't silently change the agent-facing manifest.
- `build`: the CLI wrapper now propagates the API's error `code` into the `--json` envelope (bogus `--type` / non-positive / non-integer `--limit` → `ERR_INVALID_ARGUMENT` instead of a generic `ERR_UNKNOWN`), and delegates `--limit` validation to the API (parity with `search`).
- `layout check`: exits `1` in BOTH `--json` and human mode for an invalid (but parseable) layout — the exit code no longer depends on the output mode, so it works as a CI gate / agent check without parsing stdout.
- `upgrade` config codemods: a `findConfigPath` throw (multiple `astryx.config.*` files) is surfaced as a structured per-codemod error instead of crashing the whole upgrade run — config codemods run before the strict loader, so this restores the per-codemod isolation every other failure path honors.
- CLI dispatch: the belt-and-suspenders postAction "completed without emitting an envelope" error carries a `code` (`ERR_UNKNOWN`) so every error envelope is branchable on `code`.
- `toErrorEnvelope`/`AstryxError`: attach `suggestions` only when it's a real array.

Agent-docs data integrity:

- `injectXdsBlock`/`removeXdsBlock` no longer drop, duplicate, or orphan user content on malformed managed blocks (END-before-START, duplicate/nested blocks, or a start marker with no end). They locate a single well-formed block (END searched after START) and refuse to touch an ambiguous/half-written file instead of corrupting it.

Backfills api-level tests for the zero-coverage commands (`component`, `search`, `doctor`), the `discover`/`docs` dispatchers, the blog adapter/leaf/CLI wrapper, doctor degradation paths, manifest determinism + subcommand ordering, `build` error-code faithfulness, `layout check` exit-code parity, config-codemod isolation, a static guard that every inline error envelope carries a `code`, `isAstryxInitialized` malformed-marker resilience, and unit tests for `levenshteinDistance`, `checkGhCli`, the error-envelope contract, path-safety symlink escapes, and the agent-docs malformed-block cases.

Codemod runner + integration loading:

- The codemod source scan no longer follows symlinks (a symlinked file under the scanned path could rewrite its target OUTSIDE the project) and skips generated-output dirs (dist/build/out/.next/coverage) — codemods rewrite source, not artifacts or dependencies.
- `resolvePackageDir` rejects an integration spec that isn't a bare package name (no `..`, no absolute, must stay in node_modules) — a config spec can no longer point the loader at an arbitrary module.
- A broken integration manifest (throws on import or fails schema validation) no longer crashes `Project.load` (and thus every command). It's recorded and surfaced via `issues()`, restoring the documented skip+warn policy; other integrations still load.

Component discovery:

- `readDocMeta` no longer reads a `group:`/`hidden:` field nested inside a `propDescriptions` block (a docsZh/docsDense translation export) as the component's group — that leaked a translated prop description as a group key in the default English `component --list` (e.g. a Chinese string appeared as a group). The field regexes now match top-level fields only (<=2 spaces).

@josephfarina

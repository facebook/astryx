---
'@astryxdesign/cli': patch
---

[feat] app shell — emit any template inside your design system's shell, opt-in and never on disk.

Page templates are content-only by rule: they root at `Layout`/`Center` and never render their own `AppShell`, because whoever consumes a template owns the chrome. That makes the shell a single swappable layer, and this exposes it.

- `astryx template <id> --with-shell` wraps the emitted page in the project's app shell — adding the component and its import as one unit. Without the flag the bare, content-only template is emitted exactly as authored, so the default is unchanged.
- Astryx core provides the default shell (`AppShell`). An integration replaces it by pointing the new `appShell` field in `astryx.integration.*` at a module that default-exports an `AstryxAppShell` (`{component, from, importKind?, props?, description?}`), exported from `@astryxdesign/cli/authoring`. Parameterizing it with the shell's props type (`satisfies AstryxAppShell<AppFrameProps>`) makes typos and non-serializable props compile errors.
- The CLI always states which shell you got — the component, the package, and whether it replaced the default — and on a bare page it points at `--with-shell`. `--json` reports the applied package via `transformedBy`.
- A project has exactly one shell: if two integrations declare one, the first in config order wins and the clash is reported. The shell is never nested inside a template that already renders one, never applied to blocks, and never applied to its own package's templates.
- A pure output-layer: the on-disk templates are never modified. Declarations are validated at the load boundary, dry-run by `astryx validate-integration` (`missing_app_shell` / `invalid_app_shell`), and a broken shell is skipped with a warning instead of breaking the command. The rewrite runs through the codemod engine's shared `validateOutput` safety net, so it can never emit unparseable source.

@josephfarina

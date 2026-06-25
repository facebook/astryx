# @xds/cli

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
- **`--lang` flag** — TranslationDoc support for i18n/compressed docs (#611)
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

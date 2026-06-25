# @xds/build

# 0.1.0

#### Breaking Changes

- Default the StyleX library atomic-class prefix to `astryx` (was `xds`)
  `@astryxdesign/build`'s babel/Vite integrations now emit library atomic classes as
  `.astryx78zum5` by default instead of `.xds78zum5` (the `libraryPrefix` /
  `stylexPrefix` option default flips `xds` -> `astryx`). This is an opaque,
  StyleX-generated namespace — consumers don't target these classes directly —
  but it completes the removal of `xds` naming from build output. Consumers that
  explicitly configured `libraryPrefix`/`stylexPrefix` are unaffected.
- Remove the XDS-prefix compatibility layer — astryx is now the only public surface
  This release erases all `xds` naming from the public API; there is no compatibility
  window. Consumers must migrate (we own all consumers pre-OSS):
- Remove the daily, brutalist, and default themes; neutral is the new baseline
  Three theme packages are removed from the repo and will no longer be published:

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
- Rename the npm package scope from `@xds/*` to `@astryxdesign/*`
  All published packages move to the new `@astryxdesign` scope (e.g. `@xds/core` → `@astryxdesign/core`), along with the workspace lockfile, build/runtime scope-directory scans, and docsite slug derivation. Consumers must update their imports and dependency names. The internal ESLint plugin namespace (`@xds/*` rules) is intentionally untouched and tracked separately. Existing `@xds/*` codemods continue to target the old scope so projects still on `@xds/*` can migrate.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond

---

# 0.0.15

#### Fixes

- **Unprefix migration alignment** — Build output and Vite plugin updated for the XDS-prefix migration (bare names canonical, `XDS*` compat aliases) so generated CSS stays in sync with `@xds/core` (#2941).

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @czarandy
- @ejhammond
- @josephfarina

---

# 0.0.14

_First public release_ — `@xds/build` is now published to the npm registry.

#### New Features

- **Streamlined `xdsStylex()` Vite API** — Simplified configuration for Vite projects (#2227)
- **Build step for Vite plugin** — Proper dist output for the Vite integration (#2205)

#### Internal

- **Migrated to pnpm** (#2197)
- **Bumped esbuild** from 0.24.2 to 0.28.0 (#2246)

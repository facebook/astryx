# @xds/cli

## 0.0.5

### New Features

- Generate agent cheat sheet from live CLI metadata (#640)
- `--detail` and `--lang` flags for typed `.doc.mjs` output (#636)
- Fold `agent-docs` into `init` with `--features` flag (#639)

### Codemods

- 5 new codemods for v0.0.5: `migrate-token-names`, `migrate-shadow-tokens`, `migrate-collapse-to-collapsible`, `migrate-radius-tokens`, `migrate-skeleton-radius`

**Upgrade consumers:** `npx xds upgrade --apply`

## 0.0.4

### Features

- **`xds theme build`** — Renamed from `build-theme` to `theme build` (#570)
- **`--lang` flag** — TranslationDoc support for i18n/compressed docs (#611)
- **`--zh` flag** — Chinese Simplified doc output (#567)

### Refactors

- Split `component.mjs` into `lib/` modules with lazy command registry (#613)

## 0.0.3

### Patch Changes

- Sync package.json exports map
- Add verify-exports CI check (#537)

## 0.0.2

### Features

- `xds upgrade` command with codemod support
- `xds theme build` (formerly `build-theme`)

## 0.0.1

- Initial release

# @xds/cli

## 0.0.12

### Codemods

- `add-is-icon-only` — Add `isIconOnly` to icon-only Button and ToggleButton usages (#1257)

### Upgrade

```sh
npx xds upgrade --apply --to 0.0.12
```

## 0.0.10

### Codemods

- `remove-size-props` — Remove `size` prop from StatusDot and ProgressBar (#966)

### Upgrade

```sh
npx xds upgrade --apply --to 0.0.10
```

## 0.0.8

### New Features

- CLI: tsx parser for .ts files
- Update hints in postAction hook

### Codemods

- `rename-endslot-to-endcontent` — Button `endSlot` → `endContent` (#895)
- `migrate-token-renames` — Token name migration to v0.0.8 convention

### Upgrade

```sh
npx xds upgrade --apply --to 0.0.8
```

## 0.0.7

### Codemods

- `rename-banner-variant-to-container` — Banner `variant` → `container` (#814)

### Upgrade

```sh
npx xds upgrade --apply --to 0.0.7
```

## 0.0.6

### Codemods

- `migrate-token-names` — Design token renames per naming audit
- `migrate-shadow-tokens` — Elevation → shadow semantic naming
- `migrate-collapse-to-collapsible` — XDSCollapse → XDSCollapsible
- `migrate-radius-tokens` — Semantic radius → numeric scale
- `migrate-skeleton-radius` — Skeleton radius prop → numeric scale
- `migrate-badge-children-to-label` — Badge children → label prop

### Upgrade

```sh
npx xds upgrade --apply --to 0.0.6
```

## 0.0.5

### New Features

- Generate agent cheat sheet from live CLI metadata (#640)
- `--detail` and `--lang` flags for typed `.doc.mjs` output (#636)
- Fold `agent-docs` into `init` with `--features` flag (#639)

> **Note:** Codemods for v0.0.5 breaking changes are registered under v0.0.6. Use `--to 0.0.6`.

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

### New Features

- `xds upgrade` command with codemod support
- `xds theme build` (formerly `build-theme`)

### Codemods

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

### Upgrade

```sh
npx xds upgrade --apply --to 0.0.2
```

## 0.0.1

- Initial release

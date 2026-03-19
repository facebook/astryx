# @xds/core

## 0.0.5

### Breaking Changes (codemods included)

- Rename design tokens per naming audit (`migrate-token-names`)
- Rename elevation tokens to `shadow-base`/`shadow-menu`/`shadow-hover`/`shadow-dialog` + `insetshadow-border-*` (`migrate-shadow-tokens`)
- Rename `XDSCollapse` → `XDSCollapsible` (`migrate-collapse-to-collapsible`)
- Dynamic radius tokens — numeric scale with `radiusScale` config (`migrate-radius-tokens`, `migrate-skeleton-radius`)

**Upgrade:** `npx xds upgrade --apply`

### New Features

- **Dynamic theming primitives:** `radiusScale`, `motionScale`, `typeScale` in `defineTheme`
- **Motion tokens:** duration, easing, and component migration to token-based transitions
- **Ratio-based type scale** with `typeScale` in `defineTheme` and 4px grid snapping
- **Mobile-responsive AppShell:** responsive mobile nav API, `autoMobileTopBar`, entry animations
- **TopNav mobile rendering:** responsive menu, MegaMenu composed children API + mobile drawer
- **SideNav:** collapsible sidebar (`isCollapsible` prop), resizable sidebar with drag handle
- **PowerSearch:** filter implementation with nested filters
- **TreeList** component
- **NavItem** component
- Shared theme CSS generation, removed XDSFontWrapper

### Fixes

- CheckboxInput & Switch focus rings + indeterminate aria
- MegaMenu uniform border radius, TopNav menu positioning/keyboard/focus trapping
- Popover background transparency, DropdownMenu elevation tokens
- Badge hardcoded height → spacing token
- Collapsible hardcoded fontSize/transition → tokens
- AppShell hardcoded spacing → spacing tokens
- Dist CSS layer renamed from `@layer xds` to `@layer xds.core.base`
- `color-scheme` in reset.css for lightningcss light-dark() compatibility
- Sync package.json exports (NavItem, remove stale typography.css)
- Type-scale: use Math.round for 4px grid snapping in computeLeading

## 0.0.4

### New Components

- **XDSTreeList** — Hierarchical tree list component with expand/collapse (#609)
- **XDSPowerSearch** — Advanced search component with result count, filtering (#561, #593)

### Features

- **AppShell variant system** — New `variant` prop (#597)
- **AppShell contentPadding** — New `contentPadding` prop (#612)
- **AppShell auto height mode** — Sidenav and sticky backgrounds (#615)
- **startIcon** support (#584)

### Fixes

- Removed deprecated `isFullBleed` prop from Card and Section (#610, #598)
- Layout: `padding={0}` treated as equivalent to `isFullBleed` (#595)
- SideNav: consistent spacing (#601)
- Nav: consistent gap and heading text sizes (#616)

### Refactors

- Popover, HoverCard, Tooltip moved to top-level directories (#557)

## 0.0.3

### Patch Changes

- Bundle StyleX runtime — consumers no longer need @stylexjs/stylex as peer dependency (#545)
- Add stable token export path at @xds/core/tokens (#544)
- Replace null style overrides with explicit values, add lint rule (#547)
- Fix theme packages to produce proper JS/TS module output via tsup (#541)
- Sync package.json exports map
- Add verify-exports CI check (#537)

## 0.0.2

### Breaking Changes (codemods included)

- CSS-based theming replaces StyleX theme system — `defineTheme()` API
- `className` and `style` props on all components
- Numeric spacing scale for `padding` and `gap`
- RSC-compatible icon registry (`registerIcons`/`getIcon`)
- React 19 ref prop migration
- Renames: TopNavTitle→TopNavHeading, SideNavHeader→SideNavHeading, useXDSIcon→getIcon
- `gap="space4"` → `gap={4}`, `isFullBleed` → `padding={0}`

**Codemod:** `npx xds upgrade --apply`

## 0.0.1

- Initial release

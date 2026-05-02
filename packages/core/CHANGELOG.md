# @xds/core

# 0.0.13

#### Breaking Changes

- **Toolbar `density` → `size`** — `XDSToolbar` replaces the `density` prop with `size`, adds `XDSSizeContext` cascade for child components. (#1448)
- **Icon renames: `checkCircle`/`xCircle` → `success`/`error`** — Default icon registry renames for semantic clarity. (#1503)
- **`XDSChatComposerAttachments` → `XDSChatComposerDrawer`** — Renamed for clarity. (#1714)
- **Remove deprecated `XDSSelectorItem`** — Internalized `XDSSelectorOption`; use `XDSSelector` directly. (#1582)
- **Tighten `XDSBaseProps`** — Omits `title` and obscure HTML attributes; adds `data-*` index signature. (#1505, #1502)

#### New Features

- **XDSClickableCard & XDSSelectableCard** with `useClickableContainer` hook (#1707)
- **useResizable hook + XDSResizeHandle** — Drag-to-resize for panels and sidebars (#1754)
- **AlertDialog** — Dedicated confirmation dialog component (#1370)
- **`isInline` prop** on Dialog, AlertDialog, and CommandPalette for embedded usage (#1676)
- **Card `transparent` variant** (#1655)
- **`defaultOpen` prop** on XDSTooltip and XDSHoverCard (#1672)
- **Stack `width`, `height`, `align`, `justify` props** — Convenience aliases on HStack, VStack, Stack (#1778, #1703)
- **Text `type` defaults to `'body'`** — No longer required (#1702)
- **Carousel** — Always show nav buttons when content is scrollable (#1772)
- **AppShell `defaultIsMobile`** for SSR-safe mobile nav detection (#1755)
- **SideNav/TopNav hover-to-open menus** via `useXDSMenuHover` (#1419)
- **DropdownMenu compound-component mode** (#1372)
- **MobileNav auto-detect drawer side** from trigger position (#1395)
- **Dialog `padding` prop** (#1169)
- **Grid unified responsive columns** API (#1422)
- **Selector/Typeahead/Tokenizer** size cascade to dropdown list items (#1442)
- **Icon slots standardized to `ReactNode`** across all components (#1746)
- **Tailwind v4 theme bridge** (#1649)
- **Theme `expandColorScale`** — Derive full color token ramp from a single accent hex (#1452)
- **Theme derived var expansion** — CSS properties to internal vars (#1467)
- **Page and block template system** with 100+ component showcase blocks (#1393)

#### Fixes

- Truncation: use Range API for multi-line detection (#1816)
- PowerSearch: add `xdsClassName` for theme targeting (#1813)
- ToggleButton: fix theming + Chat barrel export (#1812)
- SSR: replace `useLayoutEffect` with SSR-safe alternatives (#1721)
- Focus: use `:focus-visible` instead of `:focus-within` for outlines (#1511)
- Focus: remove `outline` from transition to prevent black flash (#1731)
- iOS Safari: prevent auto-zoom on input focus (#1468)
- Dialog/MobileNav: replace `:where([open])` with prop-driven open styles (#1652)
- className/style clobber by `stylex.props` spread + lint rule (#1462)
- Collapsible: remove trigger padding, add capsize to label (#1770)
- Breadcrumbs: onClick-only items match link color (#1773)
- Grid: cap column count via track-max (#1761)
- Tokens: update palette border colors from DSP color ramp (#1760)
- Slider: keep tooltip visible during thumb drag (#1751)
- AppShell: targeting class names on sticky wrappers (#1764)
- Icon: use secondary color for input startIcon slots (#1765), default to `inherit` (#1588)
- SideNav: section custom styles, item collapsible+action split (#1666)
- Table: container padding to directional vars (#1621)
- Toast viewport: reset UA popover background (#1644)
- Banner, Breadcrumbs, Spinner, StatusDot, TabList, Text, TextArea, TimeInput: extend XDSBaseProps (#1780, #1640, #1405)
- CodeBlock: Safari span fallback, per-line token perf (#1487, #1369)
- TextInput/TextArea: default value to empty string (#1439)
- MobileNav: close drawer on nav item activation (#1438)
- Divider: remove opaque background from label (#1426)
- Field: move description into XDSFieldLabel (#1458)
- Theme: sync `data-xds-theme` to `<html>` for root provider (#1587)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx xds upgrade --apply --to 0.0.13
```

Preview changes first (dry run): `npx xds upgrade --to 0.0.13`
Run a specific codemod: `npx xds upgrade --apply --codemod toolbar-density-to-size`
List all available codemods: `npx xds upgrade --list`

---

# 0.0.12

#### Breaking Changes

- **Button `isIconOnly` required for icon-only mode** — `XDSButton` and `XDSToggleButton` now require explicit `isIconOnly` for icon-only rendering. (#1257)

#### New Features

- **XDSThumbnail** component (#1255)
- **XDSChatLayout** with fixed composer dock and container queries (#1249)
- **XDSToast** notification system (#1194)
- **Chat reasoning components** — Reasoning, ToolCall, ToolCallGroup (#1192)
- **useXDSImperativeDialog** — show/hide without state management (#1239)
- **Theme syntax system** with 11 community presets + `defineTheme({ syntax })` (#1217, #1219)
- **XDSMediaTheme** for inverted surface theming (#1211)
- **Card background color variants** (#1213)
- **Daily theme** with Figtree font, Lucide icons (#1201)
- **SideNav/TopNav menu popover and heading variants** (#1272)
- **TextInput `onEnter` prop** for consistency with NumberInput (#1223)
- **Button `isPressed` prop** for toggle state (#1202)
- **CLI programmatic API** — `@xds/cli/api` (#1208)
- **ChatComposer `headerActions` + `headerContext`** replacing `contextToolbar` (#1242)
- **Chat trigger menu system** for ComposerInput (#1193)

#### Fixes

- Dialog: reset inherited edge signals, prevent ghost button margin shift (#1237)
- CodeBlock: syntax highlighting missing on scroll + perf improvements (#1221)
- Chat: harden bubbles, scroll button, drawer animation, status (#1245)
- Chat: use `color-neutral` for message bubble background (#1271)
- SegmentedControl: consistent border-radius for sm size (#1206)
- Omit `children` from XDSBaseProps — require explicit opt-in (#1246)
- Theme: ship built theme modules to prevent double CSS injection (#1247)
- Theme: support bare state keys in `parseStyleKey` (#1233)
- ProgressBar/Section: migrate to XDSBaseProps, fix RadioList double-apply (#1253)
- CodeBlock: use semantic `--text-code-size` token for md size (#1273)
- Input: forward native event handlers via `...rest` spread (#1259, #1291)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx xds upgrade --apply --to 0.0.12
```

Preview changes first (dry run): `npx xds upgrade --to 0.0.12`
Run a specific codemod: `npx xds upgrade --apply --codemod add-is-icon-only`
List all available codemods: `npx xds upgrade --list`

---

# 0.0.11

#### Patch Changes

- Version bump and publish infrastructure fixes
- No breaking changes

---

# 0.0.10

#### Breaking Changes

- **StatusDot and ProgressBar single size** — Both components now have a single fixed size (8px). The `size` prop has been removed. (#966)

#### New Features

- **Layout `defaultHasDividers`** — Container-controlled dividers via context (#969)
- **Button `href` support** — Link-styled buttons (#935)

#### Fixes

- Dialog: propagate `maxHeight` to layout via `--container-max-height` (#965)
- Popover: embed surface styles in `useXDSPopover` hook (#964)
- Dialog: lock body scroll on iOS Safari (#948)
- Dialog: scrollable content, mobile visibility, container styles (#942)
- Menu components: icon sizing, item density, section headings (#946)
- Avatar status dot sizes + icon non-semantic colors (#944)
- Table: truncate overflowing cell text with ellipsis (#933)
- AppShell: default variant to "elevated" (#934)
- DialogHeader: re-add capsize with visual adjustment (#956)
- Hardening sweep (#968)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx xds upgrade --apply --to 0.0.10
```

Preview changes first (dry run): `npx xds upgrade --to 0.0.10`
Run a specific codemod: `npx xds upgrade --apply --codemod remove-size-props`
List all available codemods: `npx xds upgrade --list`

---

# 0.0.8

#### Breaking Changes

- **Button `endSlot` → `endContent`** — Renamed on XDSButton and forwarded object literals (e.g. XDSDropdownMenu button prop). (#895)
- **Token renames** — Intermediate token names from v0.0.6 renamed to final v0.0.8 convention per the token spec.

#### Fixes

- Align cyan, pink, and yellow token colors with WWW (#907)
- Dialog hardening (#775)
- ListItem: support ReactNode for description, fix whiteSpace nowrap breaking line-clamp (#896)
- Table: default minWidth for proportional columns (#891)
- Button: prevent text wrap, add ellipsis truncation (#892)
- ListItem: fixed inline padding (#887)
- Slider hardening — style clobber, a11y, pointer handling (#882)
- TextArea hardening — counter a11y, soft maxLength, disabled states (#849)
- Field hardening — a11y, auto-IDs, disabled styles (#848)
- Calendar hardening — a11y, keyboard nav, date constraints (#837)
- CheckboxInput, Button, Switch hardening (#765, #768, #769)
- DateInput, FormLayout hardening (#771, #772)
- CSS layer ordering for dist path theming (#806)
- Rename `@layer xds-reset` to `@layer reset` (#833)
- Tokenizer truncation behavior (#880)
- Correct neutral gray token semantics across components (#852)
- Formalize container padding tokens, prevent internal var access (#847)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx xds upgrade --apply --to 0.0.8
```

Preview changes first (dry run): `npx xds upgrade --to 0.0.8`
Run a specific codemod: `npx xds upgrade --apply --codemod rename-endslot-to-endcontent`
List all available codemods: `npx xds upgrade --list`

---

# 0.0.7

#### Breaking Changes

- **Banner `variant` → `container`** — Renamed the `variant` prop on XDSBanner to `container`. Type references `XDSBannerVariant` → `XDSBannerContainer` and `XDSBannerVariantMap` → `XDSBannerContainerMap`. (#814)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx xds upgrade --apply --to 0.0.7
```

Preview changes first (dry run): `npx xds upgrade --to 0.0.7`
Run a specific codemod: `npx xds upgrade --apply --codemod rename-banner-variant-to-container`
List all available codemods: `npx xds upgrade --list`

---

# 0.0.6

#### Breaking Changes

- **Token renames** — Design tokens renamed per naming audit: `positive` → `success`, `negative` → `error`, `divider` → `border`, etc. (`migrate-token-names`)
- **Shadow tokens** — Elevation tokens renamed to `shadow-base`/`shadow-menu`/`shadow-hover`/`shadow-dialog` + `insetshadow-border-*` (`migrate-shadow-tokens`)
- **`XDSCollapse` → `XDSCollapsible`** — Component and prop rename (`migrate-collapse-to-collapsible`)
- **Radius tokens** — Semantic radius tokens renamed to numeric scale (`migrate-radius-tokens`, `migrate-skeleton-radius`)
- **Badge `children` → `label`** — Content passed as children now uses the `label` prop (`migrate-badge-children-to-label`)

#### New Features

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

#### Fixes

- Badge: hardcoded height → spacing token; add `label` prop for API consistency (#709)
- CheckboxInput & Switch: focus rings + indeterminate aria (#723)
- Kbd: platform detection for mod key (#722)
- MegaMenu: uniform border radius, TopNav menu positioning/keyboard/focus trapping
- Popover: background transparency, DropdownMenu elevation tokens
- Collapsible: hardcoded fontSize/transition → tokens
- AppShell: hardcoded spacing → spacing tokens
- Dist CSS layer renamed from `@layer xds` to `@layer xds.core.base`
- `color-scheme` in reset.css for lightningcss light-dark() compatibility
- Sync package.json exports (NavItem, remove stale typography.css)
- Type-scale: use Math.round for 4px grid snapping in computeLeading

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx xds upgrade --apply --to 0.0.6
```

Preview changes first (dry run): `npx xds upgrade --to 0.0.6`
List all available codemods: `npx xds upgrade --list`

---

# 0.0.5

> **Note:** v0.0.5 was the published version. Codemods for this release are registered under v0.0.6 in the CLI. Use `--to 0.0.6` to run them.

See 0.0.6 above for breaking changes and upgrade instructions.

---

# 0.0.4

#### New Components

- **XDSTreeList** — Hierarchical tree list component with expand/collapse (#609)
- **XDSPowerSearch** — Advanced search component with result count, filtering (#561, #593)

#### Features

- **AppShell variant system** — New `variant` prop (#597)
- **AppShell contentPadding** — New `contentPadding` prop (#612)
- **AppShell auto height mode** — Sidenav and sticky backgrounds (#615)
- **startIcon** support (#584)

#### Fixes

- Removed deprecated `isFullBleed` prop from Card and Section (#610, #598)
- Layout: `padding={0}` treated as equivalent to `isFullBleed` (#595)
- SideNav: consistent spacing (#601)
- Nav: consistent gap and heading text sizes (#616)

#### Refactors

- Popover, HoverCard, Tooltip moved to top-level directories (#557)

---

# 0.0.3

#### Patch Changes

- Bundle StyleX runtime — consumers no longer need @stylexjs/stylex as peer dependency (#545)
- Add stable token export path at @xds/core/tokens (#544)
- Replace null style overrides with explicit values, add lint rule (#547)
- Fix theme packages to produce proper JS/TS module output via tsup (#541)
- Sync package.json exports map
- Add verify-exports CI check (#537)

---

# 0.0.2

#### Breaking Changes

- CSS-based theming replaces StyleX theme system — `defineTheme()` API
- `className` and `style` props on all components
- Numeric spacing scale for `padding` and `gap`
- RSC-compatible icon registry (`registerIcons`/`getIcon`)
- React 19 ref prop migration
- Renames: TopNavTitle → TopNavHeading, SideNavHeader → SideNavHeading, useXDSIcon → getIcon
- `gap="space4"` → `gap={4}`, `isFullBleed` → `padding={0}`
- Badge dot → StatusDot

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx xds upgrade --apply --to 0.0.2
```

Preview changes first (dry run): `npx xds upgrade --to 0.0.2`
List all available codemods: `npx xds upgrade --list`

12 codemods included:
- `rename-selector-items-to-options` — Selector `items` → `options`
- `unify-visibility-to-onOpenChange` — onHide/onClose/onShow/onToggle → `onOpenChange`
- `unify-uncontrolled-to-defaultX` — initialIsOpen/initialIsExpanded → defaultX
- `rename-banner-endButton-to-endContent` — Banner `endButton` → `endContent`
- `rename-form-tooltip-startIcon` — Form `tooltip` → `labelTooltip`, `startIcon` → `labelIcon`
- `rename-isShown-to-isOpen` — Dialog/Popover `isShown` → `isOpen`
- `rename-topnav-title-to-heading` — TopNav `title` → `heading`, TopNavTitle → TopNavHeading
- `rename-sidenav-header-to-heading` — SideNav header → heading, SideNavHeader → SideNavHeading
- `migrate-useXDSIcon-to-getIcon` — `useXDSIcon()` → `getIcon()`
- `migrate-gap-to-numeric` — `gap="space4"` → `gap={4}`
- `migrate-isFullBleed-to-padding` — `isFullBleed` → `padding={0}`
- `migrate-badge-dot-to-statusdot` — Badge `shape="dot"` → StatusDot

---

# 0.0.1

- Initial release

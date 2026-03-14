# @xds/cli

## 0.0.4

### Features

- **`xds theme build`** — Renamed from `build-theme` to `theme build`, establishing `xds theme` command group (#570)
- **`--lang` flag** — TranslationDoc support for i18n/compressed docs (#611)
- **`--zh` flag** — Chinese Simplified doc output (#567)

### Refactors

- Split `component.mjs` into `lib/` modules with lazy command registry (#613)

## 0.0.3

### Patch Changes

## 0.1.0

### Minor Changes

- 76ac780: ## 0.0.2 Release

  ### New: CSS-based theming (replaces StyleX theme system)

  The StyleX-based theme system (`stylex.createTheme`, `ComponentStyles` context) has been replaced with a CSS-based approach using `defineTheme()`.

  **Migration:**

  ```tsx
  // Before (0.0.1)
  import { defaultTheme } from '@xds/theme-default';
  <XDSTheme theme={defaultTheme}>

  // After (0.0.2) — same API, new internals
  import { defaultTheme } from '@xds/theme-default';
  import '@xds/theme-default/theme.css'; // NEW: import the theme CSS
  <XDSTheme theme={defaultTheme}>
  ```

  Custom themes now use `defineTheme()`:

  ```tsx
  import {defineTheme} from '@xds/core';

  const myTheme = defineTheme({
    name: 'my-theme',
    tokens: {
      '--color-accent': ['#0077B6', '#48CAE4'], // [light, dark]
    },
    components: {
      button: {base: {borderRadius: '999px'}},
    },
    icons: myIcons,
  });
  ```

  Build theme CSS with: `npx xds theme build`

  ### New: `className` and `style` props on all components

  All components now accept `className` and `style` alongside `xstyle`. Use Tailwind, CSS modules, or plain CSS — no StyleX build requirement for consumers.

  ```tsx
  <XDSCard className="max-w-md shadow-lg" />
  <XDSCard style={{ maxWidth: 400 }} />
  <XDSCard xstyle={myStyleXOverrides} /> // still works
  ```

  ### New: Numeric spacing scale for `padding` and `gap`

  Layout components accept a numeric `padding` prop. Stack and Grid `gap` migrated from string tokens to numbers.

  ```tsx
  // Before
  <XDSStack gap="space4">
  <XDSCard isFullBleed>

  // After
  <XDSStack gap={4}>
  <XDSCard padding={0}>
  ```

  Scale: 0=0px, 1=4px, 2=8px, 3=12px, 4=16px (default), 6=24px, 8=32px, 10=40px.

  **Codemod:** `npx xds upgrade --apply`

  ### New: RSC-compatible icon registry

  Icons now use a global registry instead of React Context:

  ```tsx
  import {registerIcons, getIcon} from '@xds/core';
  registerIcons(myIcons); // works in RSC — no 'use client' needed
  const icon = getIcon('close'); // no hooks required
  ```

  ### New: React 19 ref prop

  All 64 components migrated from `forwardRef` to the React 19 `ref` prop pattern. No consumer changes needed — `ref` works the same way.

  ### Breaking changes (all have codemods)

  Run `npx xds upgrade --apply` to auto-migrate:
  - `XDSTopNavTitle` → `XDSTopNavHeading`, prop `title` → `heading`
  - `XDSSideNavHeader` → `XDSSideNavHeading`, props `title/titleHref/supertitle/subtitle` → `heading/headingHref/superheading/subheading`
  - `useXDSIcon()` → `getIcon()`, `IconRegistryContext` removed
  - `gap="space4"` → `gap={4}` (numeric scale)
  - `isFullBleed` → `padding={0}` (on Card, Section, Layout\*)

  ### Bug fixes
  - Badge height fixed to 20px
  - Token medium padding reduced to 8px
  - Card border uses opaque color for consistency across backgrounds
  - DateInput autocomplete disabled
  - SideNav 8px spacing alignment
  - Breadcrumbs text centering

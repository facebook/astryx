# @xds/theme-neutral

# 0.4.7

---

# 0.4.6

---

# 0.4.5

---

# 0.4.4

---

# 0.4.3

#### Fixes

- Banner: a dismissed banner no longer drops focus, a custom status no longer loses its ARIA role, and the info banner paints again under the neutral theme.
  Dismissing unmounted the focused dismiss button, so focus landed on `<body>` and a keyboard user lost their place in the page. Banner now records where focus entered from and returns it there, the same handoff `ToastViewport` makes for a dismissed toast. Measured in Chromium: `document.activeElement` was `BODY`, and is now the control the user tabbed in from.

  `BannerStatusMap` is documented as augmentable, but all four status lookups were closed `Record<BannerStatus, ...>` maps. Adding the augmentation the docs show produced four TypeScript errors inside `Banner.tsx` itself, which a consumer cannot fix, and at runtime an unknown status resolved to `undefined` for its icon, its background and its ARIA role, so the banner stopped being a live region at all. The lookups are partial now: an unrecognized status renders with no status fill, no default glyph and `role="status"`.

  A theme could not reach the banner's radius. `--_banner-radius` was declared in the doc file and in `derivedVarRegistry.ts`, but no rule read it, so a theme's `borderRadius` on the `banner` target expanded into a variable nothing consumed. The four card-silhouette radii read it now, falling back to `--radius-container`.

  Under `@astryxdesign/theme-neutral` the info banner had no background at all, light or dark: the override set `background-color` directly and forced `--color-accent-muted` to `transparent`, and a plain CSS property written by a theme lands in `@layer astryx-theme`, which StyleX's `@layer priority4` outranks. Info now goes through `--color-accent-muted` like the other three statuses and like the stone theme already did.

  Also in this change: `children={false}` (the ordinary `{cond && <ul/>}` idiom) no longer produces an expand toggle that opens an empty box, and `description=""` no longer leaves an empty 20px row, both via `isRenderable`; a long unbroken word in the title or description no longer forces the page into horizontal scrolling at a 320px viewport, measured at `document.scrollWidth` 529px before; and the content area's bottom border uses logical `border-block-end` alongside its inline siblings.

- The `/built` entry now loads under Node ESM and externalized SSR (Vite `--ssr`, Remix / React Router v7): it imports `./icons.mjs` instead of the extensionless `./icons` Node cannot resolve.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang

---

# 0.4.2

---

# 0.4.1

---

# 0.4.0

#### Fixes

- `--radius-none` no longer overrides to `0.25rem`. `--radius-none` and `--radius-full` are documented as always fixed (never scaled by a theme), matching `@astryxdesign/core`'s own defaults — this theme's radius group bump swept `--radius-none` along with it by mistake. Anything opting out of rounding via `--radius-none` under this theme now renders with a true `0px` radius again, instead of a silent 4px. (#4856)

#### Contributors

Thanks to everyone who contributed to this release:

- @HelloOjasMutreja

---

# 0.3.0

#### Fixes

- neutral theme: darken light-mode `--color-text-secondary` from neutral-500 (#737373) to neutral-600 (#525252). 500 only reached 4.19:1 on the T95 body background (#f1f1f1), just under WCAG AA 1.4.3 (4.5:1); 600 clears it. Dark mode is unchanged.

#### Contributors

Thanks to everyone who contributed to this release:

- @humbertovirtudes

---

# 0.2.0

#### Fixes

- Neutral theme: express the light `--color-border` as `#00000014` (translucent black) instead of the opaque `#ebebeb`. Same rendered color over a white surface, but it now blends over any background — matching the translucent dark-mode value.

#### Contributors

Thanks to everyone who contributed to this release:

- @kentonquatman

---

# 0.1.9

---

# 0.1.8

---

# 0.1.7

#### Fixes

- StatusDot now uses the same vivid fills as the filled Badge in the neutral theme. Previously the dots mapped to the dark text/icon stops (dark green, maroon, brown), which read muddy in light mode; success/warning/error/accent now match their badge counterparts so a dot and its badge share one status color.

#### Contributors

Thanks to everyone who contributed to this release:

- @ernestt

---

# 0.1.6

---

# 0.1.5

---

# 0.1.4

---

# 0.1.3

---

# 0.1.2

---

# 0.1.1

---

# 0.1.0

---

# 0.0.15

#### Changes

- Tracks `@xds/core@0.0.15` (bare-name migration + data-attribute selector surface).

# 0.0.13

#### Changes

- Icon renames: `checkCircle`/`xCircle` → `success`/`error` (#1503)

#### Patch Changes

- Updated dependencies
  - @xds/core@0.0.13

---

# 0.0.5

#### Changes

- Updated token names to match naming audit (shadow, radius, elevation renames)
- Motion token primitives: duration and easing values
- Dynamic radius and type scale support via `defineTheme` config

#### Patch Changes

- Updated dependencies
  - @xds/core@0.0.5

---

# 0.0.4

#### Patch Changes

- Updated dependencies — aligned with @xds/core@0.0.4

---

# 0.0.3

#### Patch Changes

- Fix theme package to produce proper JS/TS module output via tsup (#541)

---

# 0.0.2

#### Changes

- Migrated to CSS-based theming with `defineTheme()`

---

# 0.0.1

- Initial release — neutral theme with Lucide icons

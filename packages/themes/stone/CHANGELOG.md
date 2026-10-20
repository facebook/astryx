# @xds/theme-stone

# 0.7.1

#### Fixes

- Stone, Y2K, and Gothic set `CodeBlock`'s diff row slots in their own syntax palettes, so a reader of a diff on those themes gets added and removed rows whose code, line numbers, and `+`/`-` glyphs stay readable: every syntax token keeps at least 4.5:1 on the tinted rows in Stone (light and dark) and Y2K (light and dark), and in Gothic the rows take a deep green and a deep red at the background's own luminance, so every token keeps the contrast it has on the plain background. Line numbers and glyphs on changed rows use each theme's own green and red. The CLI's bundled copies of the three themes (`astryx theme eject`) carry the same palettes. (#7428)
- A `secondary` Selector, MultiSelector, or ComplexSelector now matches the theme's secondary Button: under butter, chocolate, gothic, stone, and y2k it takes that Button's border, fill, text color, and hover instead of the default borderless neutral fill, so a toolbar mixing secondary buttons and selectors reads as one set of controls. Disabled and read-only triggers keep a still fill on hover, as a disabled Button does, and a Selector or MultiSelector inside an InputGroup keeps the group's neutral fill and edges. The default theme is unchanged, the selector docs now say `secondary` follows the theme's secondary Button, and themes added with the CLI get the same parity. (#7548)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang

---

# 0.7.0

#### Breaking Changes

- On touch devices narrower than the `lg` breakpoint (`(width < 1024px) and (pointer: coarse)`), the 14px-base first-party themes now floor their type base to 16px and re-derive the ratio so Display 1 keeps its desktop size: neutral and chocolate (base 14, ratio 1.2 → 1.1736) and butter and stone (base 14, ratio 1.25 → 1.2225). On phones, body, label and code text rise from 14px to 16px; supporting text, the headings and Display 2 and 3 grow by 1–2px; only Display 1 holds its desktop size. Desktop sizes are unchanged. gothic, matcha and y2k already use a 16px base and need no rule. The CLI's theme templates carry the same rule, so a newly scaffolded theme gets it too. (#6699)
  An app theme that extends one of these four themes and sets its own `typography.scale` or type-size tokens inherits this rule, and on touch + narrow screens the rule replaces those values (a base-18 child drops to a 16px body and a 42px Display 1). Append your own rule for the same condition with the values you want; a later rule for the same condition wins.

  Migration: nothing to change to take the new phone scale. To keep the previous 14px phone scale in an app, extend the theme and append a later rule for the same condition: `defineTheme({name: 'app', extends: neutralTheme, adaptations: {rules: [{when: {pointer: 'coarse', width: {below: 'lg'}}, value: {typography: {scale: {base: 14, ratio: 1.2}}}}]}})`. For butter and stone use `ratio: 1.25` and also set `tokens: {'--text-supporting-size': '12px'}` in that rule's value, because those themes pin supporting text at 12px rather than the 11px the scale alone gives. This cannot be rewritten by a codemod: whether an app wants the floor is a product choice.

#### Contributors

Thanks to everyone who contributed to this release:

- @imdreamrunner

---

# 0.6.8

---

# 0.6.7

#### New Features

- Each theme package now exports `/fonts.css` beside `/built` and `/theme.css`. Import it when the theme uses non-system fonts.

#### Contributors

Thanks to everyone who contributed to this release:

- @josephfarina

---

# 0.6.6

#### New Features

- Add a shared `upload` icon, and use it for FileInput's upload affordance instead of the directional `arrowUp`
  Themes draw `upload` through `icons.upload`, separately from `arrowUp`, so sort arrows and every other `arrowUp` use stay unchanged. Every bundled theme and theme template draws `upload` in its own icon style. FileInput keeps its icon size, placement, color, and accessibility in both modes; a theme with no `upload` artwork shows the default upload-into-tray glyph there.

  A complete `IconRegistry` may still omit `upload` in this release. The next minor makes it required, so add an `upload` entry to any registry you type as `IconRegistry`.

#### Contributors

Thanks to everyone who contributed to this release:

- @rubyycheung

---

# 0.6.5

---

# 0.6.4

#### New Features

- Ship a typed `ThemeDoc` descriptor beside each first-party theme source. (#6498)

#### Contributors

Thanks to everyone who contributed to this release:

- @josephfarina

---

# 0.6.3

---

# 0.6.2

---

# 0.6.1

#### Fixes

- Prefer canonical component target names in maintained themes and new examples while preserving deprecated runtime aliases and released bare prop/state selector classes through the 0.7.0 removal window. Theme discovery labels deprecated targets, theme build warns with each exact canonical replacement, and `astryx upgrade --apply` provides the forward-compatible bare-selector migration. (#6126)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang

---

# 0.6.0

#### Breaking Changes

- Requires `@astryxdesign/core@0.6.0` as part of the coordinated stable release. Upgrade Core and this theme together.

---

# 0.5.4

---

# 0.5.3

#### Fixes

- Rename built-in syntax theme identifiers. (#5847)

#### Contributors

Thanks to everyone who contributed to this release:

- @rubyycheung

---

# 0.5.2

---

# 0.5.1

#### Fixes

- Stone theme: move `--color-text-secondary` to the canonical T40/T70 pair so normal secondary text meets WCAG AA across the theme's light and dark consumer surfaces (#5505) (#5509)
- Theme packages no longer ship an unused CommonJS `icons.js` artifact. Their root entry keeps its advertised CommonJS and ESM outputs, while the standalone icon companion used by `/built` is emitted only as `icons.mjs`. (#5512)

#### Contributors

Thanks to everyone who contributed to this release:

- @jiunshinn

---

# 0.5.0

---

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

- The `/built` entry now loads under Node ESM and externalized SSR (Vite `--ssr`, Remix / React Router v7): it imports `./icons.mjs` instead of the extensionless `./icons` Node cannot resolve.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa

---

# 0.4.2

#### Fixes

- `--radius-none` no longer overrides to `0.125rem`. `--radius-none` and `--radius-full` are documented as always fixed (never scaled by a theme), matching `@astryxdesign/core`'s own defaults — each of these themes' radius group bumps swept `--radius-none` along with it by mistake, the same bug fixed for `theme-neutral` in #4856. Anything opting out of rounding via `--radius-none` under these themes now renders with a true `0px` radius again, instead of a silent 2px.

#### Contributors

Thanks to everyone who contributed to this release:

- @is-jain

---

# 0.4.1

---

# 0.4.0

---

# 0.3.0

---

# 0.2.0

---

# 0.1.9

---

# 0.1.8

---

# 0.1.7

---

# 0.1.6

---

# 0.1.5

---

# 0.1.4

#### Fixes

- Stone theme: dark-mode overlay/accent-muted tokens missing alpha (#3624)
  The dark-mode values for `--color-accent-muted`, `--color-overlay-hover`, and `--color-overlay-pressed` were fully opaque `#f3f3f5`, unlike their light-mode counterparts which are semi-transparent tints. Because these tokens paint absolutely-positioned hover/press overlays and muted-accent fills, the opaque dark value covered the content underneath instead of tinting it. Changed the dark values to carry alpha suffixes following the conventions used by every other theme in the repo: overlays symmetric with light (`#f3f3f50d` hover / `#f3f3f51a` pressed, matching butter/chocolate/matcha/neutral/y2k), and accent-muted one step stronger in dark (`#f3f3f520`, matching the `14`-light/`20`-dark pattern in chocolate/matcha/y2k). Fixes #3622.
- Stone theme: restore dark-mode alpha for overlay/border/shadow tokens (#3626)
  The dark-mode values for `--color-overlay`, `--color-border`, and `--color-shadow` were fully opaque (`#28282a`, `#f3f3f5`, `#000000`), unlike their light-mode counterparts and their own original pre-regression values, which are semi-transparent tints. An opaque overlay hides the page behind a solid block instead of a translucent scrim, an opaque border paints a solid near-white line instead of a subtle hairline, and an opaque shadow has no falloff. Restored the exact values from Stone's introduction (30e9d122f, #2020), stripped by a later tooling pass (e2892c0ad, #2173): `--color-overlay` to `#28282acc` (80%), `--color-border` to `#f3f3f51a` (T96 · 10%), and `--color-shadow` to `#0000004d` (30%). Fixes #3625.

#### Contributors

Thanks to everyone who contributed to this release:

- @let-sunny

---

# 0.1.3

---

# 0.1.2

---

# 0.1.1

#### Fixes

- Stone theme: add ~10% transparency to dark-mode `--color-neutral`
  The dark-mode value was a fully opaque `#f3f3f5`, unlike every other theme which uses a semi-transparent (~10% alpha) neutral tint. Because `--color-neutral` fills the secondary `Button` variant, this rendered a solid near-white surface with near-white text in dark mode (unreadable). Changed dark value to `#f3f3f51a` to match the convention used across all other themes. Fixes #3119.

#### Contributors

Thanks to everyone who contributed to this release:

- @ernestt

---

# 0.1.0

---

# 0.0.15

#### Changes

- Tracks `@xds/core@0.0.15` (bare-name migration + data-attribute selector surface).

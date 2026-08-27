// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Astryx theme template — every `defineTheme` field, with a note on what it
 * does and when to reach for it.
 *
 * Only `name` is required. Delete what you do not need: the values here are
 * placeholders that reproduce the built-in defaults, so a field you leave
 * untouched changes nothing.
 *
 * Each section names the CLI command that prints the authoritative reference
 * for it. These comments are a map; the CLI is the territory — it reads the
 * same source the components do.  `astryx docs` lists every topic.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * HOW A THEME IS CONSUMED
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1. WRAP THE APP. A theme does nothing until it is provided.
 *
 *      import {Theme} from '@astryxdesign/core';
 *      import {myTheme} from './theme';
 *
 *      <Theme theme={myTheme} mode="system">   // 'system' | 'light' | 'dark'
 *        <App />
 *      </Theme>
 *
 *    `system` follows the OS. Nest a second `<Theme>` to give one region its
 *    own theme or mode — a dark sidebar inside a light page.
 *
 * 2. SHIP THE FONTS YOU NAME. Astryx sets the `--font-family-*` tokens; it
 *    never loads a font file, so use whatever typeface the design needs and
 *    load it yourself. Either add it to your app's <head>:
 *
 *      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
 *      <link rel="stylesheet"
 *            href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" />
 *
 *    or self-host it in your global CSS:
 *
 *      @font-face {
 *        font-family: 'Inter';
 *        src: url('/fonts/Inter.woff2') format('woff2');
 *        font-weight: 100 900;
 *        font-display: swap;
 *      }
 *
 *    Always give `fallbacks` as well. A named family with no file loads
 *    nothing and warns about nothing — the fallback silently becomes your
 *    theme.
 *
 * 3. BUILD IT FOR PRODUCTION.
 *
 *      astryx theme build src/theme.ts
 *
 *    writes `<name>.css` (tokens, component overrides and prose styles in
 *    `@scope` rules), `<name>.js` (the theme with `__built: true` and
 *    pre-resolved values), `<name>.d.ts`, and `<name>.variants.d.ts` when the
 *    theme adds custom prop values. Import the module and the CSS together:
 *
 *      import {myThemeTheme} from './theme/my-theme';
 *      import './theme/my-theme.css';
 *
 *    Unbuilt, `<Theme>` injects a <style> tag at hydration instead — fine for
 *    dev and client-only apps, but under SSR the component overrides flash on
 *    hydration. Build for Next.js and Remix. Run the build after every edit:
 *    it also validates the theme and regenerates the types for custom
 *    variants.
 *
 * 4. LOOK AT IT IN BOTH COLOUR MODES before you ship, including the states you
 *    did not write. Full guide: `astryx docs theme`.
 *
 * SYNC: this template mirrors the theme system. When you change one of these,
 * update it here — scripts/check-theme-template.test.mjs fails when they drift:
 * - /packages/core/src/theme/defineTheme.ts     (the fields)
 * - /packages/core/src/theme/tokens.stylex.ts   (the token families)
 * - /packages/core/src/theme/expandColorScale.ts
 * - /packages/core/src/theme/expandTypeScale.ts
 * - /packages/core/src/theme/expandRadiusScale.ts
 * - /packages/core/src/theme/expandMotionScale.ts
 */

import {defineTheme} from '@astryxdesign/core/theme';
// import {dracula} from '@astryxdesign/core/theme/syntax';
// import {neutralTheme} from '@astryxdesign/theme-neutral';

export const myTheme = defineTheme({
  /** Required. Becomes the `data-astryx-theme` attribute and the registry key. */
  name: 'my-theme',

  /**
   * Start from another theme instead of the defaults. Tokens are copied then
   * overridden, `components` deep-merge, `icons` shallow-merge — but the scale
   * configs below REPLACE the base's rather than merging, because they are
   * inputs to a generator, not values.
   *
   * Reference: `astryx theme list` (themes you can install and extend).
   */
  // extends: neutralTheme,

  // ───────────────────────────────────────────────────────────────────────
  // Scale configs — a few parameters generate a whole family of tokens.
  // Reach for these first. They keep a theme internally consistent and cover
  // far more ground than you would hand-write.
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Generates the neutral ramp and the accent tokens from a seed colour
   * using the HCT perceptual model: surfaces, text, icons, borders, muted
   * fills, hover and pressed overlays — light and dark both.
   *
   *   accent        seed hex, or a [light, dark] pair to seed each scheme's
   *                 palette from its own colour; omit to keep the default
   *                 accent and re-tone only the neutrals
   *   neutralStyle  'warm' | 'cool' | 'neutral' — the temperature of the greys
   *   contrast      'standard' | 'high' — 'high' widens the text/surface tone
   *                 gap, for dense data UI or bright and clinical screens
   *
   * Whatever seed you pass, generated text holds >= 4.5:1 against its surface
   * and --color-border-emphasized >= 3:1. Two limits on that guarantee:
   *
   *   - It covers what this config generates. Write one side of a pair by hand
   *     in `tokens` below — an accent without its --color-on-accent, a surface
   *     without its text — and you own the contrast for that pair.
   *   - Status colours (success, warning, error) and the categorical data hues
   *     are not derived from the accent. They keep their defaults, which are
   *     tuned for the default surfaces; check them against yours.
   *
   * Either way the check is the same: resolve the pair in BOTH modes and
   * measure it. `useTheme()` and `resolveThemeTokens()` return the resolved
   * values, and the rendered DOM is the final word.
   *
   * Reference: `astryx docs color` for what each semantic role means,
   * `astryx docs tokens` for every colour token and its light/dark default.
   */
  color: {accent: '#0064E0', neutralStyle: 'cool', contrast: 'standard'},

  /**
   * Type scale and the three font roles.
   *   scale.base   body size in px; scale.ratio  step between sizes
   *                (1.125 tight/dense · 1.2 default · 1.333 dramatic)
   *   body / heading / code: {family, fallbacks, weight, weights}
   *   heading inherits family and fallbacks from body when omitted; `weights`
   *   sets per-level weight for headings 1–6.
   *
   * See §2 above — naming a family here does not load it.
   *
   * Reference: `astryx docs typography`.
   */
  typography: {
    scale: {base: 16, ratio: 1.2},
    body: {family: 'Inter', fallbacks: '-apple-system, system-ui, sans-serif'},
    heading: {weight: 'semibold', weights: {1: 'bold', 2: 'bold'}},
    code: {
      family: 'Geist Mono',
      fallbacks: '"SF Mono", ui-monospace, monospace',
    },
  },

  /**
   * Radius scale. `base` is the unit in px; `multiplier` scales every step
   * (0 = square and brutalist, 2 = very soft). --radius-none and --radius-full
   * are fixed and never scaled.
   *
   * Reference: `astryx docs shape`.
   */
  radius: {base: 4, multiplier: 1},

  /**
   * Duration scale in ms. Each of fast/medium/slow also gets a -min and -max
   * sibling computed with `ratio` (min = base × ratio, max = base ÷ ratio), so
   * a component can pick a longer or shorter variant of the same tempo.
   *   Snappy {fast: 100, medium: 250} · Default {fast: 175, medium: 410, slow: 975}
   *   Cinematic {fast: 200, medium: 500, slow: 1200}
   * `easing` overrides --ease-standard.
   *
   * Reference: `astryx docs motion`.
   */
  motion: {fast: 175, medium: 410, slow: 975, ratio: 0.75},

  // ───────────────────────────────────────────────────────────────────────
  // tokens — explicit overrides, which beat anything the scales generated.
  // A string applies to both colour modes; a [light, dark] tuple compiles to
  // CSS light-dark(). List only what you want to change.
  //
  // `astryx docs tokens` PRINTS THE WHOLE TABLE — every token with its light
  // and dark default. Read it before hand-writing colours: most of what you
  // want already has a semantic name, and the defaults tell you what you are
  // moving away from.
  //
  // The families, so you know what exists:
  //   --color-*        accent, on-accent · background-{body,surface,card,popover,
  //                    muted,inverted} · text-* · icon-* · border,
  //                    border-emphasized · overlay{,-hover,-pressed} ·
  //                    success/warning/error (+ -muted, on-*) · skeleton, track,
  //                    shadow, tint-hover · categorical {blue,cyan,gray,green,
  //                    orange,pink,purple,red,teal,yellow} ×
  //                    {background,border,icon,text}
  //   --spacing-*      0 · 0-5 · 1 … 12
  //   --size-element-* sm · md · lg (control heights)
  //   --focus-outline-* width · style · color · offset
  //   --border-width   hairline thickness shared by bordered surfaces
  //   --radius-*       none · inner · element · container · page · chat · full
  //   --shadow-*       low/med/high + inset-{hover,selected,success,warning,error}
  //   --duration-*     {fast,medium,slow} × {-min, base, -max}
  //   --ease-standard
  //   --font-family-*  body · heading · code
  //   --font-size-*    4xs … 5xl
  //   --font-weight-*  normal · medium · semibold · bold
  //   --text-*         {heading-1…6, body, large, label, code, supporting,
  //                    display-1…3} × {-size, -weight, -leading}
  //   --color-syntax-* code highlighting · --color-data-* charts
  // ───────────────────────────────────────────────────────────────────────
  tokens: {
    '--color-accent': ['#0064E0', '#2694FE'],
    // Changing an accent means owning its on-colour: this is the label that
    // sits on top of the fill above, in each mode.
    '--color-on-accent': ['#FFFFFF', '#FFFFFF'],
    '--color-background-body': ['#F1F4F7', '#111112'],
    '--color-background-surface': ['#FFFFFF', '#1F1F22'],
    '--focus-outline-color': 'var(--color-accent)',
    '--shadow-low': '0 1px 2px light-dark(#0000001A, #00000066)',
  },

  // ───────────────────────────────────────────────────────────────────────
  // components — per-component CSS, emitted inside
  // `@scope ([data-astryx-theme="my-theme"])`, so it only touches your theme.
  //
  // Keys are the component's stable class minus the `astryx-` prefix
  // (`astryx-button` → `button`, `astryx-side-nav-item` → `side-nav-item`),
  // including inner parts like `progressbar-fill`.
  //
  // `astryx component <Name>` IS THE REFERENCE HERE. It prints that
  // component's theming targets, the visual props and states you can key on,
  // its public CSS variables with defaults, and which standard CSS properties
  // it expands. `astryx component --list` names every component, and
  // `astryx docs styling` covers the escape hatches outside a theme.
  //
  // Style-key forms:
  //   'base'                    every instance
  //   'variant:ghost'           one prop value (any visual prop, not just variant)
  //   'variant:ghost+size:sm'   intersection of two
  //   'checked'                 a state the component reflects
  //   ':hover' / ':focus-visible' / ':disabled' — nested inside any of the above
  //
  // Write ordinary CSS properties: `borderRadius` and `padding` expand into
  // the component's internal vars for you, concentric radius math included.
  // Set a public CSS var directly when no standard property reaches it — take
  // the name from `astryx component <Name>`, since a var no component defines
  // compiles to CSS that never applies. Never set a private `--_`-prefixed
  // var; the build rejects it.
  // ───────────────────────────────────────────────────────────────────────
  components: {
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
        fontWeight: 'var(--font-weight-semibold)',
        // A public var from `astryx component Button` — no CSS-property
        // equivalent exists for it.
        '--button-focus-offset': '2px',
        // Interaction states live inside the same block.
        ':hover': {transform: 'translateY(-1px)'},
        ':active': {transform: 'translateY(0)'},
      },
      'variant:ghost': {borderWidth: '1px', borderStyle: 'solid'},
      'variant:destructive+size:sm': {letterSpacing: '0.02em'},
      // A value that is not built in becomes a NEW variant: `astryx theme
      // build` writes the module augmentation, so <Button variant="quiet" />
      // typechecks wherever this theme is active. Add one only where the
      // product will render it — an unused variant is invisible work.
      'variant:quiet': {
        backgroundColor: 'var(--color-background-muted)',
        color: 'var(--color-text-secondary)',
      },
    },
    // Container components take `padding` too; it expands to their layout tokens.
    card: {
      base: {
        borderRadius: 'var(--radius-container)',
        padding: 'var(--spacing-6)',
      },
    },
    // The same mechanism adds custom Text types: <Text type="hero" />.
    text: {'type:hero': {fontSize: 'var(--font-size-4xl)', lineHeight: '1.05'}},
  },

  // ───────────────────────────────────────────────────────────────────────
  // Everything below takes React values, so it needs a .tsx file or an
  // imported module. Commented out for that reason.
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Swap the artwork behind semantic icon names — every component that asks
   * for `check`, `close`, `chevron-down` gets yours.
   * Reference: `astryx docs icons` lists the names.
   */
  // icons: {check: <MyCheck />, close: <MyClose />},

  /**
   * Replace the small components that DRAW control state — the checkbox box,
   * the radio dot, the mark on a chosen option — by indicator name rather than
   * per call site. Replacing `check` re-skins every single-selection mark in
   * the app at once.
   * Reference: `astryx component Indicator`.
   */
  // indicators: {check: RadioIndicator},

  /**
   * Code highlighting: sets the --color-syntax-* tokens. Presets live in
   * `@astryxdesign/core/theme/syntax`.
   */
  // syntax: dracula,

  /**
   * Content sitting on an inverted surface — a dark toast in light mode, a
   * light popover in dark mode. Same shape as the theme itself (tokens and
   * components). Sensible values are generated if you say nothing, so override
   * only where your palette needs it.
   * Reference: `astryx component MediaTheme`, which reads these.
   */
  // onDark: {tokens: {'--color-accent': '#90CAF9'}, components: {button: {'variant:ghost': {borderWidth: '1px'}}}},
  // onLight: {tokens: {'--color-accent': '#0B5FCC'}},
});

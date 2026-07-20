// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Neutral Theme
 *
 * A pure grayscale spine with a from-scratch OKLCH-derived categorical
 * palette. Hues are placed at evenly-spaced positions on the OKLCH wheel,
 * chosen to keep each color recognizable at every tone (no red drift for
 * orange, no blue drift for purple) and well-separated from its neighbors.
 *
 * Core neutral palette: #fafafa, #f5f5f5, #e5e5e5, #737373, #262626, #0a0a0a
 *
 * Categorical hues (OKLCH; chroma = max-in-gamut at the saturated stop):
 *   Red H=25    Orange H=65    Yellow H=90    Green H=145
 *   Teal H=180  Cyan H=215     Blue H=250     Purple H=320  Pink H=355
 *
 * Saturated badge stops:
 *   • Cool/medium hues sit at OKLCH L=0.48–0.50 with white text (AA+)
 *   • Bright warm hues (orange L=0.68, yellow L=0.80) use dark text
 *
 * Token tonal stops:
 *   bg     = T90 (light) / T20 (dark)
 *   border = T80         / T30
 *   icon   = T30         / T80
 *   text   = T30         / T80
 *
 * All 9 saturated badge values pass WCAG AA (5.6–9.6 contrast range).
 *
 * Only overrides tokens that differ from the defaults.
 */

import {defineTheme, defineSyntaxTheme} from '@astryxdesign/core/theme';
import {neutralIconRegistry} from './icons';

/**
 * Neutral syntax palette — pulled from the OKLCH T30 (light) / T80 (dark)
 * stops of the categorical ramps. Same colors used by --color-icon-* tokens.
 */
const neutralSyntax = defineSyntaxTheme({
  name: 'xds-neutral',
  tokens: {
    keyword: ['#700084', '#efa8ff'],    // purple T30/T80
    string: ['#005600', '#a6d2a2'],     // green (sat T30 / pastel T80)
    comment: ['#737373', '#a3a3a3'],    // neutral
    number: ['#6e3500', '#ffb37f'],     // orange
    function: ['#00458c', '#a0caff'],   // blue T30/T80 H=255
    type: ['#700084', '#efa8ff'],       // purple
    variable: ['#171717', '#e5e5e5'],   // near-black / near-white
    operator: ['#737373', '#a3a3a3'],   // neutral
    constant: ['#6e3500', '#ffb37f'],   // orange
    tag: ['#89001a', '#ffaeaa'],        // red
    attribute: ['#584400', '#eec12f'],  // yellow
    property: ['#005348', '#83dac9'],   // teal
    punctuation: ['#a3a3a3', '#525252'],// neutral
    background: ['#fafafa', '#0a0a0a'],
  },
});

export const neutralTheme = defineTheme({
  name: 'neutral',

  // Typography: Figtree across body, heading, and display sizes (display
  // size tokens inherit from heading.family). Monospace stays as the
  // platform default for code.
  // Scale: base=14, ratio=1.2. Bold weights on h3/h4 for subsection hierarchy.
  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'ui-monospace',
      fallbacks:
        '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },

  // Motion: snappier than default to match shadcn/Tailwind conventions.
  // Produces: fast-min=95ms, fast=125ms, fast-max=165ms,
  //           medium-min=225ms, medium=300ms, medium-max=400ms.
  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  syntax: neutralSyntax,

  tokens: {
    // =========================================================================
    // Core — pure grayscale spine (Tailwind neutral)
    // 50:#fafafa 100:#f5f5f5 200:#e5e5e5 300:#d4d4d4 400:#a3a3a3
    // 500:#737373 600:#525252 700:#404040 800:#262626 900:#171717 950:#0a0a0a
    // =========================================================================

    // =========================================================================
    // Backgrounds — Figma-style flat with a single lifted surface.
    //
    // Dark mode collapses card / popover / muted to body T10. Cards and
    // popovers lift purely via shadow + inset highlight (see --shadow-*
    // below) — they don't need a distinct tone.
    //
    // Surface is the exception: it's tonally LIGHTER than body (T15) so
    // interactive components that sit on top of body have a clear,
    // differentiated foreground. Real consumers of --color-background-surface
    // are: switches, radios, checkboxes, multi-selectors, dialogs, app
    // shells, sections — all things that need to lift above the canvas.
    //
    //   surface  T15 #262626  — interactive surfaces lifted above body
    //   body     T10 #1b1b1b  — main canvas
    //   card     T10 #1b1b1b  — same as body, lifts via --shadow-low
    //   popover  T10 #1b1b1b  — same as body, lifts via --shadow-med
    //   muted    T10 #1b1b1b  — same as body
    //
    // Light mode keeps the standard ladder (white surfaces float on tinted
    // body; shadows do most of the lifting):
    //   surface  T100 #ffffff
    //   body     T95  #f1f1f1
    //   card     T100 #ffffff
    //   popover  T100 #ffffff
    //   muted    T95  #f1f1f1
    //
    // All values use the OKLCH Neutral tonal palette (chroma=0).
    // =========================================================================
    '--color-background-surface': ['#ffffff', '#262626'],
    '--color-background-body':    ['#f1f1f1', '#1b1b1b'],
    '--color-background-card':    ['#ffffff', '#1b1b1b'],
    '--color-background-popover': ['#ffffff', '#1b1b1b'],
    '--color-background-muted':   ['#f1f1f1', '#1b1b1b'],

    // Accent + neutral surface tints (sit alongside backgrounds)
    '--color-accent':       ['#262626', '#ebebeb'],
    '--color-accent-muted': ['#f1f1f1', '#262626'],
    '--color-neutral':      ['#0000000F', '#FFFFFF1A'],

    // Overlays (modal scrims, hover/pressed tints)
    '--color-overlay':         ['#00000080', '#000000CC'],
    '--color-overlay-hover':   ['#0000000D', '#FFFFFF0D'],
    '--color-overlay-pressed': ['#0000001A', '#FFFFFF1A'],

    // Text
    '--color-text-primary':   ['#171717', '#fafafa'],
    '--color-text-secondary': ['#737373', '#a3a3a3'],
    '--color-text-disabled':  ['#a3a3a3', '#525252'],
    '--color-text-accent':    ['#262626', '#ebebeb'],
    '--color-on-dark':    '#ffffff',
    '--color-on-light':   '#171717',
    // Contrast: neutral accent is near-black (L) / near-white (D)
    '--color-on-accent':  ['#ffffff', '#171717'],
    '--color-on-success': ['#ffffff', '#171717'],
    '--color-on-error':   ['#ffffff', '#171717'],
    '--color-on-warning': '#171717',

    // Icon
    '--color-icon-accent':    ['#262626', '#ebebeb'],
    '--color-icon-primary':   ['#171717', '#fafafa'],
    '--color-icon-secondary': ['#737373', '#a3a3a3'],
    '--color-icon-disabled':  ['#a3a3a3', '#525252'],

    // Status / Sentiment — dark mode follows the issue #2150 rubric:
    //
    //   Light mode: pastel T90 banner bg + dark T30/T40 text/icon. Locked
    //               light values for cards/banners/inputs/destructive btn.
    //   Dark mode : tinted-dark T20 bg + light pastel T80 text. INVERTED
    //               from light. Avoids the §5 "pastel-in-both-modes"
    //               anti-pattern (locked pastels glow against a dark body).
    //
    //   --color-X         = "saturated text/icon stop":
    //                         light = T40 dark colored (sits on light pastel)
    //                         dark  = T80 light pastel  (sits on dark tinted bg)
    //                       Used by destructive button text, input border/icon
    //                       (in light), banner-status-* text overrides.
    //   --color-X-muted   = "muted bg stop":
    //                         light = T90 light pastel
    //                         dark  = hue-tinted alpha overlay (T70 stop @ 24%)
    //                       Used by banner bg, status-input message bg,
    //                       destructive button bg. Dark mode uses an alpha
    //                       overlay rather than a solid T20 tinted bg so
    //                       the surface composes onto whatever sits behind
    //                       it (body, card, popover) rather than reading
    //                       as a hard colored panel.
    //
    //   24% alpha = '3D' suffix. Hue values match --color-icon-{X} dark
    //   slots (palette T70). Composited onto body #1b1b1b, the effective
    //   bg luminance hits ~1.65-1.70:1 vs body — visible colored surface
    //   without the heaviness of a solid T20 panel.
    '--color-success': ['#007004', '#9fe59b'],
    '--color-error': ['#a50c25', '#ffc6c1'],
    '--color-warning': ['#745b00', '#fdcf4f'],
    '--color-success-muted': ['#c5e5c0', '#84c9803D'],
    '--color-error-muted': ['#facecb', '#ff9e973D'],
    '--color-warning-muted': ['#f8da9d', '#deb4333D'],

    // Border
    '--color-border': ['#ebebeb', '#FFFFFF1A'],
    '--color-border-emphasized': ['#d4d4d4', '#525252'],

    // Effects
    '--color-skeleton': ['#ebebeb', '#525252'],
    '--color-shadow': ['#0000001A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // =========================================================================
    // Categorical — light mode uses pastel surfaces + dark colored text;
    //               dark mode INVERTS to a hue-tinted alpha overlay surface +
    //               light pastel text (per #2150 rubric §3 — pick the tone
    //               that satisfies required contrast against every surface
    //               the token touches).
    //
    // Per-token tone choice (CIELab L*):
    //   bg     light=T87-T90 pastel       dark=T70 hue @ 24% alpha overlay
    //                                       (composites onto body to ~1.65:1
    //                                        vs body — colored surface that
    //                                        feels lighter than a solid T20
    //                                        panel; same hue as --color-icon-X
    //                                        dark slot, just at lower opacity)
    //   border light=T80 pastel           dark=T60 mid-bright (>=5.8:1 vs body)
    //   icon   light=T30 dark colored     dark=T70 light pastel
    //   text   light=T30 dark colored     dark=T80 light pastel (>=7:1 on bg)
    //
    // Light pastels still use the per-hue chroma table (red/blue C=0.05,
    // orange/green/purple/pink C=0.06, teal/cyan C=0.07, yellow H=85 C=0.10)
    // for equal PERCEIVED saturation. Dark stops (T60/T70/T80) come from
    // the dark-mode tonal palette (chroma×0.85, +5 tone lift tapering 80-95).
    // =========================================================================

    // Each row's dark slots are HCT-derived from the source hex listed in
    // apps/sandbox/src/app/(fullscreen)/pages/neutral-palette/page.tsx via
    // the canonical dark-ramp transform (chroma×0.85, +5 tone-lift taper)
    // — same algorithm the Tonal Palettes preview renders. Border=T60,
    // icon=T70, text=T80. Background uses the T70 hue at 24% alpha so the
    // overlay surface composites onto body to ~1.65:1 luminance.

    // Red  H=22 — source #eb183a
    '--color-background-red': ['#facecb', '#ff9e973D'],
    '--color-border-red': ['#e6bab8', '#ff6f6c'],
    '--color-icon-red': ['#89001a', '#ff9e97'],
    '--color-text-red': ['#89001a', '#ffc6c1'],

    // Orange  H=55 — source #d57113
    '--color-background-orange': ['#fad0b5', '#ffa2583D'],
    '--color-border-orange': ['#e6bda2', '#e2883e'],
    '--color-icon-orange': ['#6e3500', '#ffa258'],
    '--color-text-orange': ['#6e3500', '#ffc9a2'],

    // Yellow  H=90 — source #f8c723
    // Light-mode butter-yellow pastel at H=85 C=0.085 L=0.90 — yellow
    // sits at the green-cyan luminance peak so it feels louder than the
    // other status hues at the same canonical L. Picker decision: pull
    // L down one step (0.91→0.90) and C down to its identity floor
    // (0.10→0.085, just above the bronze threshold) so it sits closer
    // to red/blue's perceived brightness without losing yellow identity.
    // Dark-mode comes from the canonical H=90 ramp for tonal-palette
    // consistency.
    '--color-background-yellow': ['#f8da9d', '#deb4333D'],
    '--color-border-yellow': ['#e4c279', '#c0990e'],
    '--color-icon-yellow': ['#584400', '#deb433'],
    '--color-text-yellow': ['#584400', '#fdcf4f'],

    // Green  H=144 — source #358a3a
    '--color-background-green': ['#c5e5c0', '#84c9803D'],
    '--color-border-green': ['#b2d1ac', '#69ad67'],
    '--color-icon-green': ['#0c5700', '#84c980'],
    '--color-text-green': ['#0c5700', '#9fe59b'],

    // Teal  H=180 — source #0c7365
    // Light pastel uses L=0.87 C=0.065 (a step darker + less chroma than
    // the L=0.888 C=0.07 used by other hues) to compensate for the
    // green-cyan luminance overshoot — at the same OKLCH L, teal/cyan read
    // ~5% brighter than red/blue because the eye's luminance response
    // peaks in this band. Dropping L+C brings perceived brightness in
    // line with the rest of the palette without losing hue identity.
    '--color-background-teal': ['#a5e3d6', '#7ec6b83D'],
    '--color-border-teal': ['#94d6c8', '#63ab9d'],
    '--color-icon-teal': ['#005348', '#7ec6b8'],
    '--color-text-teal': ['#005348', '#99e2d3'],

    // Cyan  H=215 — source #0c6f82
    // Same L=0.87 C=0.065 pastel as teal (luminance overshoot compensation).
    '--color-background-cyan': ['#a3e0ef', '#83c2d43D'],
    '--color-border-cyan': ['#91d3e3', '#67a7b8'],
    '--color-icon-cyan': ['#00505f', '#83c2d4'],
    '--color-text-cyan': ['#00505f', '#9edef0'],

    // Blue  H=255 — source #0074e2
    //   T50 #0074e2 reserved for filled Info badge / progressbar / inset hover.
    '--color-background-blue': ['#c4ddfb', '#9eb7ff3D'],
    '--color-border-blue': ['#b1c9e7', '#6d9cfe'],
    '--color-icon-blue': ['#00458c', '#9eb7ff'],
    '--color-text-blue': ['#00458c', '#c7d3ff'],

    // Purple  H=320 — source #980fb2
    '--color-background-purple': ['#eccef3', '#f297ff3D'],
    '--color-border-purple': ['#d8bbdf', '#dd74f0'],
    '--color-icon-purple': ['#700084', '#f297ff'],
    '--color-text-purple': ['#700084', '#fac1ff'],

    // Pink  H=355 — source #b10e69
    '--color-background-pink': ['#fccadc', '#ff99c33D'],
    '--color-border-pink': ['#e7b7c8', '#f273aa'],
    '--color-icon-pink': ['#83004b', '#ff99c3'],
    '--color-text-pink': ['#83004b', '#ffc3da'],

    // Gray (categorical neutral, chroma 0)
    //   Light: #e5e5e5 (Neutral 200) so it's visibly distinct from the
    //          lighter body / muted surface (both #f5f5f5).
    //   Dark : var(--color-neutral) — semi-transparent white wash
    //          (#FFFFFF1A, 10%). Matches the same treatment the gray
    //          badge uses; clearly distinct from the body T10 #1b1b1b
    //          while staying chroma-0 neutral. Solid T15 #1c1c1c was
    //          indistinguishable from --color-background-muted.
    '--color-background-gray': ['#e5e5e5', 'var(--color-neutral)'],
    '--color-border-gray': ['#d4d4d4', '#262626'],
    '--color-icon-gray': ['#525252', '#a3a3a3'],
    '--color-text-gray': ['#262626', '#e5e5e5'],

    // =========================================================================
    // Radius — slightly larger than default (kept as-is)
    // =========================================================================
    '--radius-none': '0.25rem',
    '--radius-inner': '0.375rem',
    '--radius-element': '0.625rem',
    '--radius-container': '0.75rem',
    '--radius-page': '1.75rem',
    '--radius-full': '9999px',

    // =========================================================================
    // Shadows
    //
    // Light mode: matches origin/main exactly (5%/10% low+med, 10%/15% high).
    // Subtle drops; light surfaces don't need rim highlights.
    //
    // Dark mode: deepened drops + an all-around 1px white inset that wraps
    // every edge ("Figma-style bezel"). The inset mimics ambient light
    // catching the surface's rim on every side, giving cards/popovers/modals
    // a substantial "lit from above" feel that drop shadows alone can't
    // achieve against a dark canvas.
    //   low  :  drops 25%/40% + 8%  white all-around inset
    //   med  :  drops 35%/50% + 12% white all-around inset
    //   high :  drops 50%/70% + 15% white all-around inset
    //
    // The inset layer uses light-dark(transparent, ...) so light mode is
    // unaffected — main's exact light values are preserved.
    // =========================================================================
    '--shadow-low':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 25%)), ' +
      '0 4px 8px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 40%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 8%))',
    '--shadow-med':
      '0 2px 4px light-dark(oklch(0 0 0 / 5%), oklch(0 0 0 / 35%)), ' +
      '0 4px 12px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 50%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 12%))',
    '--shadow-high':
      '0 4px 6px light-dark(oklch(0 0 0 / 10%), oklch(0 0 0 / 50%)), ' +
      '0 12px 24px light-dark(oklch(0 0 0 / 15%), oklch(0 0 0 / 70%)), ' +
      'inset 0 0 0 1px light-dark(transparent, oklch(1 0 0 / 15%))',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #0074e24D',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #0074e280',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #1981004D',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #ffce2f4D',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #e33f4a4D',
  },

  components: {
    // =========================================================================
    // Button — primary gets white text, secondary gets a border, destructive
    // uses the OKLCH red filled treatment.
    // =========================================================================
    button: {
      'variant:destructive': {
        backgroundColor: 'var(--color-error-muted)',  // locked pastel red bg
        color: 'var(--color-error)',                  // locked T30 red — matches banner/input error text
      },
    },

    // =========================================================================
    // Badge —
    //   Semantic (info/success/warning/error): filled saturated T50 + contrasting
    //     text (white, or dark on yellow). The filled-button rule from #2150
    //     §3 — text contrast locks the bg tone, so this stays at T50 in
    //     BOTH modes, unlike pastel surfaces which invert by mode.
    //   Categorical (blue/green/red/orange/etc.): pastel-tinted hue surface +
    //     colored text — light mode = soft T87-T90 + dark T30 text; dark mode
    //     = T20 tinted + T80 light pastel text (sources: --color-background-X
    //     and --color-text-X tokens).
    //   Neutral: light gray bg + dark text (or inverted in dark mode).
    // =========================================================================
    badge: {
      // Semantic — filled saturated bg + contrasting text.
      //   Light: vivid T45-T55 from the OKLCH palette + white text
      //          (~4.5-5:1 — Material/Linear/Vercel pop).
      //   Dark : T60 stop from the dark-mode tonal palette (chroma×0.85,
      //          +5 tone-lift taper from issue #2150 §4) + DARK text.
      //          T60+white fails AA-large (~2.7:1); T60+dark hits 6.6-7:1
      //          and tames the §4 vibration. Same dark-text-on-bright-bg
      //          treatment that warning yellow uses in both modes.
      'variant:info': {
        // Light: T50 #0074e2 (palette saturated stop)
        // Dark : T60 stop from dark-mode tonal palette of source #0074e2
        backgroundColor: 'light-dark(#0074e2, #6d9cfe)',
        color: 'light-dark(#ffffff, #171717)',
      },
      'variant:neutral': {
        // Mirrors the gray categorical badge — same neutral chip treatment
        // (Neutral 200 light / semi-transparent white wash dark) sourced
        // from the gray hue tokens, so a single change at the token layer
        // updates both variants.
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
      },
      'variant:success': {
        // Light: T45 #198100 (palette saturated stop)
        // Dark : T60 stop from dark-mode tonal palette of source #198100
        backgroundColor: 'light-dark(#198100, #64af4c)',
        color: 'light-dark(#ffffff, #171717)',
      },
      'variant:warning': {
        // Yellow stays at the same hex in both modes — chroma reduction
        // is barely visible at T85, and dark text on yellow doesn't
        // suffer from the §4 vibration concern.
        backgroundColor: '#ffce2f',
        color: '#171717',
      },
      'variant:error': {
        // Light: T55 #e33f4a (palette saturated stop)
        // Dark : T60 stop from dark-mode tonal palette of Tailwind red-600
        //        source #dc2626 (kept on H=27 alarm-red rather than coral)
        backgroundColor: 'light-dark(#e33f4a, #ff705d)',
        color: 'light-dark(#ffffff, #171717)',
      },

      // Categorical — bg + text reference the per-hue tokens, so behavior
      // tracks the categorical palette automatically:
      //   Light: pastel T87-T90 bg + dark T30 colored text (low-key chip)
      //   Dark : tinted T20 bg + light T80 colored text (per #2150 §5,
      //          inverted from light to avoid the "pastel-in-both-modes"
      //          anti-pattern that makes locked light pastels glow on a
      //          dark body)
      'variant:red': {
        backgroundColor: 'var(--color-background-red)',
        color: 'var(--color-text-red)',
      },
      'variant:orange': {
        backgroundColor: 'var(--color-background-orange)',
        color: 'var(--color-text-orange)',
      },
      'variant:yellow': {
        backgroundColor: 'var(--color-background-yellow)',
        color: 'var(--color-text-yellow)',
      },
      'variant:green': {
        backgroundColor: 'var(--color-background-green)',
        color: 'var(--color-text-green)',
      },
      'variant:teal': {
        backgroundColor: 'var(--color-background-teal)',
        color: 'var(--color-text-teal)',
      },
      'variant:cyan': {
        backgroundColor: 'var(--color-background-cyan)',
        color: 'var(--color-text-cyan)',
      },
      'variant:blue': {
        backgroundColor: 'var(--color-background-blue)',
        color: 'var(--color-text-blue)',
      },
      'variant:purple': {
        backgroundColor: 'var(--color-background-purple)',
        color: 'var(--color-text-purple)',
      },
      'variant:pink': {
        backgroundColor: 'var(--color-background-pink)',
        color: 'var(--color-text-pink)',
      },
      'variant:gray': {
        backgroundColor: 'var(--color-background-gray)',
        color: 'var(--color-text-gray)',
      },
    },

    // =========================================================================
    // Banner — sits on a hue-tinted surface with colored text/icon:
    //   Light: pastel T90 bg (pulled from --color-{X}-muted / --color-background-blue)
    //          + dark T30 colored text (--color-text-{hue}).
    //   Dark : tinted T20 bg (same tokens, dark slot) + light T80 colored text.
    //          Per #2150 §5 — large hue-tinted surfaces in dark mode invert
    //          to a deep tinted bg + light text rather than locking the
    //          light-mode pastel.
    //
    // The inner-header *-muted token is forced transparent so the outer
    // tinted background shows through cleanly.
    //
    // Status overrides reference --color-text-{hue} so text/icon colors
    // stay in sync with the palette anchors automatically.
    banner: {
      'status:info': {
        backgroundColor: 'var(--color-background-blue)',
        '--color-accent-muted': 'transparent',
        '--color-text-primary': 'var(--color-text-blue)',
        '--color-text-secondary': 'var(--color-text-blue)',
        '--color-accent': 'var(--color-text-blue)',
      },
      // success/warning/error banner bgs come from --color-{X}-muted, which
      // already carries the correct light/dark tinted values. We only need
      // to redirect the text/icon to the palette colored stop.
      'status:success': {
        '--color-text-primary': 'var(--color-text-green)',
        '--color-text-secondary': 'var(--color-text-green)',
        '--color-success': 'var(--color-text-green)',
      },
      'status:warning': {
        '--color-text-primary': 'var(--color-text-yellow)',
        '--color-text-secondary': 'var(--color-text-yellow)',
        '--color-warning': 'var(--color-text-yellow)',
      },
      'status:error': {
        '--color-text-primary': 'var(--color-text-red)',
        '--color-text-secondary': 'var(--color-text-red)',
        '--color-error': 'var(--color-text-red)',
      },
    },

    // =========================================================================
    // TextInput — no per-status overrides needed. The global tokens
    // --color-{success,error,warning} carry the correct values in both
    // modes (light=T40 dark colored, dark=T80 light pastel) for both
    // surfaces the input border/icon touches: the input surface
    // (white/T15-dark) and the status message bubble (light pastel T90 /
    // dark T20). Verified all six combinations clear AA non-text 3:1.
    // =========================================================================

    // =========================================================================
    // Switch — off-state track uses the same lifted-neutral surface as the
    // ProgressBar track (--color-border-emphasized). Aligns the two
    // "channel-on-body" components so their off-states share one visual
    // language: light T85 #d4d4d4 sits one step darker than the body T95
    // bg, dark T35 #525252 sits one step lighter than the body T10. Each
    // is a defined channel, not a wash that blends in.
    // =========================================================================
    switch: {
      base: {
        '--color-background-gray': 'var(--color-border-emphasized)',
      },
    },

    progressbar: {
      base: {
        // Track uses --color-background-muted; override it to
        // --color-border-emphasized (Neutral T85 #d4d4d4 in light mode) so
        // the track is clearly darker than the body bg (Neutral T95 #f1f1f1)
        // and reads as a defined channel rather than blending in. Dark
        // mode inherits T35 #525252 — same one-step-lighter behavior.
        '--color-background-muted': 'var(--color-border-emphasized)',
      },
      // Vivid stops match the filled semantic badge colors (info/success/
      // warning/error variants in the badge override above). Same hex
      // values; documented per role with palette provenance.
      'variant:accent': {
        // Blue T50 saturated stop (= variant:info badge bg)
        '--color-accent': '#0074e2',
      },
      'variant:success': {
        // Green T45 saturated stop (= variant:success badge bg)
        '--color-success': '#198100',
      },
      'variant:warning': {
        // Yellow T85 saturated stop (= variant:warning badge bg)
        '--color-warning': '#ffce2f',
      },
      'variant:error': {
        // Red T55 saturated stop (= variant:error badge bg)
        '--color-error': '#e33f4a',
      },
    },

    // =========================================================================
    // Card — tighter padding via public card padding token
    // =========================================================================
    card: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },

    // =========================================================================
    // Section — tighter padding via public section padding token
    // =========================================================================
    section: {
      base: {
        padding: 'var(--spacing-3)',
      },
    },

    // Heading and text component overrides are auto-generated by typography.scale.
    // h3/h4 bold weights come from typography.heading.weights above.
  },

  icons: neutralIconRegistry,
});

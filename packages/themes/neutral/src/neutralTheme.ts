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

import {defineTheme, defineSyntaxTheme} from '@xds/core/theme';
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
    function: ['#004881', '#9acbff'],   // blue
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

    // Core semantic
    '--color-accent': ['#262626', '#ebebeb'],
    '--color-accent-muted': ['#f5f5f5', '#404040'],
    '--color-neutral': ['#0000000F', '#FFFFFF1A'],
    '--color-background-surface': ['#ffffff', '#141414'],
    '--color-background-body': ['#f5f5f5', '#404040'],
    '--color-overlay': ['#00000080', '#000000CC'],
    '--color-overlay-hover': ['#0000000D', '#FFFFFF0D'],
    '--color-overlay-pressed': ['#0000001A', '#FFFFFF1A'],
    '--color-background-muted': ['#f5f5f5', '#404040'],

    // Text
    '--color-text-primary': ['#171717', '#fafafa'],
    '--color-text-secondary': ['#737373', '#a3a3a3'],
    '--color-text-disabled': ['#a3a3a3', '#525252'],
    '--color-text-accent': ['#262626', '#ebebeb'],
    '--color-on-dark': '#ffffff',
    '--color-on-light': '#171717',
    // Contrast: neutral accent is near-black (L) / near-white (D)
    '--color-on-accent': ['#ffffff', '#171717'],
    '--color-on-success': ['#ffffff', '#171717'],
    '--color-on-error': ['#ffffff', '#171717'],
    '--color-on-warning': '#171717',

    // Icon
    '--color-icon-accent': ['#262626', '#ebebeb'],
    '--color-icon-primary': ['#171717', '#fafafa'],
    '--color-icon-secondary': ['#737373', '#a3a3a3'],
    '--color-icon-disabled': ['#a3a3a3', '#525252'],

    // Surface variants
    '--color-background-card': ['#ffffff', '#262626'],
    '--color-background-popover': ['#ffffff', '#404040'],

    // Status / Sentiment
    //   --color-X         = saturated stop (T40 light / T60 dark) for borders/icons
    //   --color-X-muted   = SOFTER pastel T90 / C=0.04-0.07 — used by large persistent
    //                       surfaces (banners, inputs, destructive button bg) where
    //                       higher saturation would feel overwhelming. The
    //                       --color-background-X tokens used by cards/badges sit
    //                       at the brighter T85 / C=0.08 stop instead.
    // Status saturated colors stay adaptive — light mode uses T40 saturated
    // (visible on white input bg), dark mode uses T30 darker (works against
    // the locked light pastel bg used by banners/inputs).
    '--color-success': ['#007004', '#005600'],
    '--color-error': ['#a50c25', '#89001a'],
    '--color-warning': ['#745b00', '#584400'],
    // Muted bgs differ by mode:
    //   • Light: T90 stops — visible color presence so banners/inputs read
    //     as clear status surfaces, not delicate washes.
    //   • Dark : T85 stops — same hex as the dark-mode badge variant slot,
    //     so banners/badges/inputs share one darker pastel family against
    //     the dark page.
    '--color-success-muted': ['#c3e2bd', '#b4e0af'],
    '--color-error-muted': ['#fdc9c6', '#ffc3c0'],
    '--color-warning-muted': ['#f1d589', '#f6d476'],

    // Border
    '--color-border': ['#ebebeb', '#FFFFFF1A'],
    '--color-border-emphasized': ['#d4d4d4', '#525252'],

    // Effects
    '--color-skeleton': ['#ebebeb', '#525252'],
    '--color-shadow': ['#0000001A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // =========================================================================
    // Categorical — OKLCH-from-scratch tonal palettes
    // bg=T90/T20  border=T80/T30  icon=T30/T80  text=T30/T80
    // =========================================================================

    // Red  H=22  (lowered from H=25 to feel less coral)
    '--color-background-red': ['#fdc9c6', '#ffc3c0'],
    '--color-border-red': ['#ffaeaa', '#89001a'],
    '--color-icon-red': '#89001a',
    '--color-text-red': '#89001a',

    // Orange  H=55  (lowered from H=65 for more orange, less yellow character)
    '--color-background-orange': ['#f8ceb2', '#ffcaa5'],
    '--color-border-orange': ['#ffb37f', '#6e3500'],
    '--color-icon-orange': '#6e3500',
    '--color-text-orange': '#6e3500',

    // Yellow  H=90
    '--color-background-yellow': ['#f1d589', '#f6d476'],
    '--color-border-yellow': ['#eec12f', '#584400'],
    '--color-icon-yellow': '#584400',
    '--color-text-yellow': '#584400',

    // Green  H=141  (decoupled palette: clearly-green saturated stops +
    // chroma-balanced pastel stops)
    //   • Saturated (text, icon, border-dark, success badge T50, destructive
    //     btn): HCT(141, C=55) source — T30 #005600 / T50 #328738 / T40 #007004
    //   • Pastel (bg, banner, input msg, badge bg): HCT(141, C=30) source —
    //     T80 #a6d2a2 / T85 #b4e0af / T90 #c2eebd. T90 lands at OKLCH C=0.08
    //     between the cool family (C=0.06) and warning yellow (C=0.10), so
    //     the success banner reads as visibly green like warning reads as
    //     yellow, without being zingy at the larger C=55-source pastel stops.
    '--color-background-green': ['#c3e2bd', '#b4e0af'],
    '--color-border-green': ['#a6d2a2', '#005600'],
    '--color-icon-green': '#005600',
    '--color-text-green': '#005600',

    // Teal  H=180
    '--color-background-teal': ['#ade5d9', '#9ce9d9'],
    '--color-border-teal': ['#83dac9', '#005348'],
    '--color-icon-teal': '#005348',
    '--color-text-teal': '#005348',

    // Cyan  H=215
    '--color-background-cyan': ['#abe2f0', '#99e6f9'],
    '--color-border-cyan': ['#82d5e9', '#00505f'],
    '--color-icon-cyan': '#00505f',
    '--color-text-cyan': '#00505f',

    // Blue  H=250
    '--color-background-blue': ['#badbfe', '#b0dcff'],
    '--color-border-blue': ['#9acbff', '#004881'],
    '--color-icon-blue': '#004881',
    '--color-text-blue': '#004881',

    // Purple  H=320  (high enough to keep dark tones purple, not blue)
    '--color-background-purple': ['#eacbf1', '#f0c7f9'],
    '--color-border-purple': ['#efa8ff', '#700084'],
    '--color-icon-purple': '#700084',
    '--color-text-purple': '#700084',

    // Pink  H=355
    '--color-background-pink': ['#f9c8d9', '#ffc2da'],
    '--color-border-pink': ['#ffa9ca', '#83004b'],
    '--color-icon-pink': '#83004b',
    '--color-text-pink': '#83004b',

    // Gray (categorical neutral, chroma 0)
    // Light=#e5e5e5 (Neutral 200) so it's visibly distinct from the lighter
    // --color-background-body / --color-background-muted (both #f5f5f5).
    '--color-background-gray': ['#e5e5e5', '#1c1c1c'],
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
    // =========================================================================
    '--shadow-low':
      '0 2px 4px light-dark(#0000000D, #00000026), 0 4px 8px light-dark(#0000001A, #00000033)',
    '--shadow-med':
      '0 2px 4px light-dark(#0000000D, #00000026), 0 4px 12px light-dark(#0000001A, #00000033)',
    '--shadow-high':
      '0 4px 6px light-dark(#0000001A, #00000040), 0 12px 24px light-dark(#00000026, #00000059)',
    '--shadow-inset-hover': 'inset 0px 0px 0px 2px #1679fa4D',
    '--shadow-inset-selected': 'inset 0px 0px 0px 2px #1679fa80',
    '--shadow-inset-success': 'inset 0px 0px 0px 2px #3287384D',
    '--shadow-inset-warning': 'inset 0px 0px 0px 2px #f8c7234D',
    '--shadow-inset-error': 'inset 0px 0px 0px 2px #eb183a4D',
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
    //     text (white, or dark on yellow). Bold "status pill" look for important
    //     state signaling.
    //   Categorical (blue/green/red/orange/etc.): soft pastel T90 + dark T30
    //     colored text. Lower-key labels for charts, categories, and tags.
    //   Neutral: light gray bg + dark text (or inverted in dark mode).
    // =========================================================================
    badge: {
      // Semantic — filled saturated at OKLCH T60 (warning at T85 for yellow's
      // higher natural L). Success/Error/Info pass AA-large (3.5–4.0); Warning
      // and Neutral pass AAA. Vibrant "Material You / Linear / Vercel" style.
      'variant:info': {
        backgroundColor: '#1679fa',   // OKLCH L=0.60 H=258
        color: '#ffffff',
      },
      'variant:neutral': {
        // Light: solid Neutral 200 chip (#e5e5e5) against the white body.
        // Dark : semi-transparent white wash (var(--color-neutral) ≈
        //        #FFFFFF1A) — distinct from the body #404040 which would
        //        otherwise make the chip invisible.
        backgroundColor: 'light-dark(#e5e5e5, var(--color-neutral))',
        color: 'light-dark(#171717, #fafafa)',
      },
      'variant:success': {
        backgroundColor: '#328738',   // medium-green T50 (white text passes 4.5x AA-large)
        color: '#ffffff',
      },
      'variant:warning': {
        backgroundColor: '#f8c723',   // OKLCH L=0.85 H=90
        color: '#171717',
      },
      'variant:error': {
        // Light: pink/coral H=22 (matches the rest of the rainbow palette
        //        which is hue-tuned to start at H=22 for the red family)
        // Dark : Tailwind red-600 (H=27) — pure alarm red reads better
        //        against the dark page than coral
        backgroundColor: 'light-dark(#eb183a, #dc2626)',
        color: '#ffffff',
      },

      // Categorical — pastel bg + T30 dark colored text.
      //   Light: "Set A" lighter pastel (OKLCH L=0.92 C=0.045) — same soft
      //          family as banners/inputs/categorical bgs in light mode.
      //   Dark : T85 (one step up from T90, OKLCH L=0.88 C=0.06) — slightly
      //          more saturated so badges read as colored chips against the
      //          dark page.
      'variant:red': {
        backgroundColor: 'light-dark(#fdc9c6, #ffc3c0)',
        color: '#89001a',
      },
      'variant:orange': {
        backgroundColor: 'light-dark(#f8ceb2, #ffcaa5)',
        color: '#6e3500',
      },
      'variant:yellow': {
        backgroundColor: 'light-dark(#f1d589, #f6d476)',
        color: '#584400',
      },
      'variant:green': {
        backgroundColor: 'light-dark(#c3e2bd, #b4e0af)',
        color: '#005600',
      },
      'variant:teal': {
        backgroundColor: 'light-dark(#ade5d9, #9ce9d9)',
        color: '#005348',
      },
      'variant:cyan': {
        backgroundColor: 'light-dark(#abe2f0, #99e6f9)',
        color: '#00505f',
      },
      'variant:blue': {
        backgroundColor: 'light-dark(#badbfe, #b0dcff)',
        color: '#004881',
      },
      'variant:purple': {
        backgroundColor: 'light-dark(#eacbf1, #f0c7f9)',
        color: '#700084',
      },
      'variant:pink': {
        backgroundColor: 'light-dark(#f9c8d9, #ffc2da)',
        color: '#83004b',
      },
      'variant:gray': {
        backgroundColor: 'light-dark(#e5e5e5, var(--color-neutral))',
        color: 'light-dark(#171717, #fafafa)',
      },
    },

    // =========================================================================
    // Banner — pastel tints (palette T90) with dark colored text (palette T30).
    // The inner-header *-muted token is forced transparent so the outer
    // pastel background shows through cleanly.
    // =========================================================================
    banner: {
      'status:info': {
        // Use the same blue pastel token as the rest of the family. Light
        // mode = Set A (#d6e7f8, OKLCH C=0.029), dark mode = T90 (#badbfe).
        backgroundColor: 'var(--color-background-blue)',
        '--color-accent-muted': 'transparent',
        '--color-text-primary': '#004881',             // blue T30
        '--color-text-secondary': '#004881',
        '--color-accent': '#004881',
      },
      // The bg matches --color-success-muted/warning-muted/error-muted, which are
      // already pastel T90 — so we only need to override the colored text/icon.
      'status:success': {
        '--color-text-primary': '#005600',
        '--color-text-secondary': '#005600',
        '--color-success': '#005600',
      },
      'status:warning': {
        '--color-text-primary': '#584400',
        '--color-text-secondary': '#584400',
        '--color-warning': '#584400',
      },
      'status:error': {
        '--color-text-primary': '#89001a',
        '--color-text-secondary': '#89001a',
        '--color-error': '#89001a',
      },
    },

    // =========================================================================
    // ProgressBar — fill color tracks the semantic badge palette (T60 vivid).
    // Achieved by overriding the underlying status token within the variant's
    // CSS scope so the fill's `background-color: var(--color-X)` resolves to
    // the brighter badge value (the global token stays at T50 for utility
    // uses like input borders / destructive button text that need AA on pastel).
    // =========================================================================
    // =========================================================================
    // TextInput — DARK MODE ONLY: redirect the saturated semantic token to its
    // muted (pastel) equivalent inside the input's scope, so the border + icon
    // match the status message background. The message text (uses
    // --color-text-X, locked separately) stays dark for readability.
    //
    // Light mode is left alone — the saturated T40 border/icon (e.g. #a50c25)
    // looks great against the white input bg and shouldn't be softened.
    //
    // Implementation: light-dark() with the light slot re-stating the original
    // global token value, so the override is a no-op in light mode.
    // =========================================================================
    'text-input': {
      'status:success': {
        '--color-success':
          'light-dark(#007004, var(--color-success-muted))',
      },
      'status:error': {
        '--color-error':
          'light-dark(#a50c25, var(--color-error-muted))',
      },
      'status:warning': {
        '--color-warning':
          'light-dark(#745b00, var(--color-warning-muted))',
      },
    },

    // =========================================================================
    // Switch — off-state track in dark mode reads as the gray category bg
    // (--color-background-gray = #1c1c1c), which is darker than the page bg
    // (#404040), making the switch lose definition. Override the token only
    // inside the switch scope so the off-state track sits on a slightly
    // lighter neutral wash that's clearly visible against the dark page.
    // Light mode keeps the existing solid #e5e5e5 (it's already visible on
    // the white page).
    // =========================================================================
    switch: {
      base: {
        '--color-background-gray': 'light-dark(#e5e5e5, var(--color-neutral))',
      },
    },

    progressbar: {
      base: {
        // Track uses --color-background-muted; override it to --color-border
        // so the track sits one step darker than the body bg (in light mode)
        // or a subtle lighter overlay (in dark mode), making it visible.
        '--color-background-muted': 'var(--color-border)',
      },
      'variant:accent': {
        '--color-accent': '#1679fa',
      },
      'variant:positive': {
        '--color-success': '#328738',
      },
      'variant:warning': {
        '--color-warning': '#f8c723',
      },
      'variant:negative': {
        '--color-error': '#eb183a',
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

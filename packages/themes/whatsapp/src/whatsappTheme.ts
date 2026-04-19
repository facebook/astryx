/**
 * WhatsApp Theme for XDS
 *
 * Derived from WhatsApp's internal design system (WDS). Colors are mapped
 * from WDS semantic tokens (WDSThemes.js) to XDS token names. Typography
 * uses Roboto — WhatsApp's primary typeface. Radius is slightly rounder
 * than XDS defaults to match WhatsApp's soft, approachable feel.
 *
 * Color palette source: WDS BaseColor + systemThemeTokenValue
 *   Light mode: warm grays (warmGray50–800) for surfaces, green500 accent
 *   Dark mode: neutral grays (neutralGray850–1000) for surfaces, green450 accent
 *
 * Key WDS design decisions preserved:
 *   - Alpha-based text colors (blackAlpha60 / whiteAlpha60 for secondary)
 *   - Warm gray tint in light mode surfaces (not pure white backgrounds)
 *   - Green accent that shifts slightly between light/dark (500 → 450)
 *   - on-accent flips: white in light mode, near-black in dark mode
 *   - Pill-shaped primary buttons
 *   - Generous border radius (16px containers, 8px elements)
 */

import {defineTheme} from '@xds/core/theme';
import {whatsappIconRegistry} from './icons';

export const whatsappTheme = defineTheme({
  name: 'whatsapp',

  // Typography: Roboto — WhatsApp's primary typeface across all platforms.
  // WDS uses a non-geometric type scale (Body1=16, Body2=14, Body3=12,
  // Headline1=24, Headline2=22, LargeTitle1=32, LargeTitle2=28).
  // base=14 ratio=1.2 produces a close approximation.
  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Roboto',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
    },
    heading: {
      weight: 'medium',
    },
    code: {
      family: 'Roboto Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
      url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap',
    },
  },

  // Radius: WhatsApp uses generously rounded surfaces — doubled radius scale.
  radius: {base: 4, multiplier: 2},

  // Motion: WhatsApp feels snappy but not jarring.
  // Slightly faster than XDS default, with ease-out for natural deceleration.
  motion: {fast: 150, medium: 350, slow: 825, ratio: 0.75},

  tokens: {
    // =========================================================================
    // Colors — derived from WDS systemThemeTokenValue (WDSThemes.js)
    // =========================================================================

    // Core accent: WDS green500 (light) / green450 (dark)
    '--color-accent': ['#1DAA61', '#21C063'],
    '--color-accent-muted': [
      'rgba(29, 170, 97, 0.2)',
      'rgba(33, 192, 99, 0.25)',
    ],

    // On-accent: WDS flips contrast — white on green (light), black on green (dark)
    '--color-on-accent': ['#FFFFFF', '#0A0A0A'],
    '--color-on-success': ['#FFFFFF', '#0A0A0A'],
    '--color-on-error': ['#FFFFFF', '#0A0A0A'],
    '--color-on-warning': ['#0A0A0A', '#0A0A0A'],
    '--color-on-dark': ['#FFFFFF', '#FFFFFF'],
    '--color-on-light': ['#000000', '#000000'],

    // Neutral: WDS surface-highlight (warmGray300Alpha15 / whiteAlpha10)
    '--color-neutral':
      'light-dark(rgba(194, 189, 184, 0.15), rgba(255, 255, 255, 0.1))',

    // Surfaces: WDS uses warm grays in light, neutral grays in dark
    // surface-default: whiteOpaque / neutralGray900
    '--color-background-surface': ['#FFFFFF', '#161717'],
    // background-wash: warmGray75 / neutralGray900
    '--color-background-body': ['#F7F5F3', '#161717'],
    // surface-elevated-default: whiteOpaque / neutralGray850
    '--color-background-card': ['#FFFFFF', '#1D1F1F'],
    // surface-elevated-default (same as card for popovers)
    '--color-background-popover': ['#FFFFFF', '#1D1F1F'],
    // background-muted: warmGray75 / neutralGray850
    '--color-background-muted': ['#F7F5F3', '#1D1F1F'],

    // Overlay: WDS background-dimmer
    '--color-overlay': ['rgba(0, 0, 0, 0.32)', 'rgba(0, 0, 0, 0.32)'],
    '--color-overlay-hover': [
      'rgba(0, 0, 0, 0.05)',
      'rgba(255, 255, 255, 0.05)',
    ],
    '--color-overlay-pressed': [
      'rgba(0, 0, 0, 0.2)',
      'rgba(255, 255, 255, 0.2)',
    ],

    // Text: WDS content-default (neutralGray1000/neutralGray50),
    //        content-deemphasized (blackAlpha60/whiteAlpha60),
    //        content-disabled (neutralGray300/neutralGray700)
    '--color-text-primary': ['#0A0A0A', '#FAFAFA'],
    '--color-text-secondary': [
      'rgba(0, 0, 0, 0.6)',
      'rgba(255, 255, 255, 0.6)',
    ],
    '--color-text-disabled': ['#BDBDBD', '#424445'],
    // content-action-emphasized: green600 / green450
    '--color-text-accent': ['#1B8755', '#21C063'],

    // Icons: follow same pattern as text
    '--color-icon-accent': ['#1DAA61', '#21C063'],
    '--color-icon-primary': ['#0A0A0A', '#FAFAFA'],
    '--color-icon-secondary': [
      'rgba(0, 0, 0, 0.6)',
      'rgba(255, 255, 255, 0.6)',
    ],
    '--color-icon-disabled': ['#BDBDBD', '#424445'],

    // Status: WDS secondary-negative (red), secondary-positive (green),
    //         secondary-warning (yellow)
    '--color-success': ['#1DAA61', '#71EB85'],
    '--color-success-muted': [
      'rgba(29, 170, 97, 0.2)',
      'rgba(113, 235, 133, 0.25)',
    ],
    '--color-error': ['#EA0038', '#FB5061'],
    '--color-error-muted': ['rgba(234, 0, 56, 0.2)', 'rgba(251, 80, 97, 0.25)'],
    '--color-warning': ['#FFB938', '#FFD279'],
    '--color-warning-muted': [
      'rgba(255, 185, 56, 0.2)',
      'rgba(255, 210, 121, 0.25)',
    ],

    // Border: WDS lines-divider (blackAlpha10/whiteAlpha10),
    //         lines-outline-default (neutralGray400/neutralGray500)
    '--color-border': ['rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)'],
    '--color-border-emphasized': ['#959393', '#757778'],

    // Effects
    '--color-skeleton': ['#EEEEEE', '#424445'],
    '--color-shadow': ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)'],
    '--color-tint-hover': ['black', 'white'],

    // =========================================================================
    // Semantic color palette — mapped from WDS BaseColor
    // =========================================================================

    // Blue (WDS cobalt)
    '--color-background-blue': [
      'rgba(0, 123, 252, 0.2)',
      'rgba(0, 123, 252, 0.2)',
    ],
    '--color-border-blue': ['#007BFC', '#53A6FD'],
    '--color-icon-blue': ['#0063CB', '#53A6FD'],
    '--color-text-blue': ['#073D76', '#99CAFE'],

    // Cyan (WDS skyBlue)
    '--color-background-cyan': [
      'rgba(0, 157, 226, 0.2)',
      'rgba(0, 157, 226, 0.2)',
    ],
    '--color-border-cyan': ['#009DE2', '#53BDEB'],
    '--color-icon-cyan': ['#027EB5', '#53BDEB'],
    '--color-text-cyan': ['#074B6A', '#93D7F5'],

    // Gray (WDS warmGray/neutralGray)
    '--color-background-gray': [
      'rgba(10, 10, 10, 0.05)',
      'rgba(255, 255, 255, 0.1)',
    ],
    '--color-border-gray': ['#9F9891', '#757778'],
    '--color-icon-gray': ['#7C7771', '#858586'],
    '--color-text-gray': ['#0A0A0A', '#FAFAFA'],

    // Green (WDS green — the signature WhatsApp green)
    '--color-background-green': [
      'rgba(29, 170, 97, 0.2)',
      'rgba(29, 170, 97, 0.2)',
    ],
    '--color-border-green': ['#1DAA61', '#71EB85'],
    '--color-icon-green': ['#1DAA61', '#71EB85'],
    '--color-text-green': ['#15603E', '#ACFCAC'],

    // Orange (WDS orange)
    '--color-background-orange': [
      'rgba(250, 101, 51, 0.2)',
      'rgba(250, 101, 51, 0.2)',
    ],
    '--color-border-orange': ['#FA6533', '#FC9775'],
    '--color-icon-orange': ['#C4532D', '#FC9775'],
    '--color-text-orange': ['#6B3424', '#FDC1AD'],

    // Pink (WDS pink)
    '--color-background-pink': [
      'rgba(255, 46, 116, 0.2)',
      'rgba(255, 46, 116, 0.2)',
    ],
    '--color-border-pink': ['#FF2E74', '#FF72A1'],
    '--color-icon-pink': ['#D42A66', '#FF72A1'],
    '--color-text-pink': ['#6D1E3E', '#FFABC7'],

    // Purple (WDS purple)
    '--color-background-purple': [
      'rgba(127, 102, 255, 0.2)',
      'rgba(127, 102, 255, 0.2)',
    ],
    '--color-border-purple': ['#7F66FF', '#A791FF'],
    '--color-icon-purple': ['#5E47DE', '#A791FF'],
    '--color-text-purple': ['#3A327B', '#D1C4FF'],

    // Red (WDS red)
    '--color-background-red': [
      'rgba(234, 0, 56, 0.2)',
      'rgba(251, 80, 97, 0.2)',
    ],
    '--color-border-red': ['#EA0038', '#FB5061'],
    '--color-icon-red': ['#B80531', '#FB5061'],
    '--color-text-red': ['#61182E', '#FA99A4'],

    // Teal (WDS teal)
    '--color-background-teal': [
      'rgba(2, 166, 152, 0.2)',
      'rgba(2, 166, 152, 0.2)',
    ],
    '--color-border-teal': ['#02A698', '#42C7B8'],
    '--color-icon-teal': ['#028377', '#42C7B8'],
    '--color-text-teal': ['#074D4A', '#95DBD4'],

    // Yellow (WDS yellow)
    '--color-background-yellow': [
      'rgba(255, 185, 56, 0.2)',
      'rgba(255, 210, 121, 0.2)',
    ],
    '--color-border-yellow': ['#FFB938', '#FFD279'],
    '--color-icon-yellow': ['#C58730', '#FFD279'],
    '--color-text-yellow': ['#6D4E26', '#FFE4AF'],

    // =========================================================================
    // Element sizes — WDS button heights: small=32px, medium=40px, large=56px
    // These tokens are used by buttons, inputs, selects, and other elements.
    // =========================================================================
    '--size-element-sm': '32px',
    '--size-element-md': '40px',
    '--size-element-lg': '56px',

    // =========================================================================
    // Shadows — soft, WhatsApp-style elevation
    // =========================================================================
    '--shadow-low':
      '0 1px 3px rgba(0, 0, 0, 0.08), 0 2px 6px light-dark(rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.2))',
    '--shadow-med':
      '0 2px 6px rgba(0, 0, 0, 0.08), 0 4px 12px light-dark(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.25))',
    // WDS popoverShadow: 0 12px 16px -4px rgb(10 10 10 / 0.1)
    '--shadow-high':
      '0 4px 8px rgba(0, 0, 0, 0.06), 0 12px 16px -4px light-dark(rgba(10, 10, 10, 0.1), rgba(0, 0, 0, 0.35))',
  },

  components: {
    // =========================================================================
    // Button — derived from WDSButton + WDSButtonColor*Config
    //
    // WDS variants:  filled / tonal / outline / borderless
    // XDS variants:  primary / secondary / ghost / destructive
    //
    // Mapping:
    //   primary     → WDS filled default (accent bg, on-accent text)
    //   secondary   → WDS tonal default (accent-deemphasized bg, accent-emphasized text)
    //   ghost       → WDS borderless default (transparent bg, accent-emphasized text)
    //   destructive → WDS filled destructive (negative bg, on-accent text)
    //
    // Key WDS button behaviors preserved:
    //   - Pill shape (borderRadius: 9999px) on all variants
    //   - 40px medium height (WDS medium button = 40px)
    //   - Body2Emphasized label (14px, weight 500)
    //   - Filled buttons scale on hover (1.04) and press (0.97)
    //   - Bouncy spring transition: 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)
    //   - Focus ring: accent color, 2px solid, 2px offset
    // =========================================================================
    button: {
      // =======================================================================
      // Base — shared across all WDS button variants
      //   - Pill shape (borderRadiusCircle = 9999px)
      //   - Body2Emphasized label (14px, weight 500)
      //   - Bouncy spring transition for hover/press transforms
      //   - Size-specific padding: sm=16px, md=24px, lg=28px
      // =======================================================================
      base: {
        borderRadius: '9999px',
        fontWeight: '500',
        paddingInline: '24px',
        transition:
          'background-image 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      'size:sm': {
        paddingInline: '16px',
      },
      'size:lg': {
        paddingInline: '28px',
      },

      // =======================================================================
      // primary → WDS "filled default"
      //   bg: accent, text: on-accent, scale hover/press
      // =======================================================================
      'variant:primary': {
        ':hover': {transform: 'scale(1.04)'},
        ':active': {transform: 'scale(0.97)'},
      },

      // =======================================================================
      // secondary → WDS "tonal default"
      //   bg: accent-deemphasized (green100/green800)
      //   text: accent-emphasized (green700/green100)
      // =======================================================================
      'variant:secondary': {
        backgroundColor: 'light-dark(#D9FDD3, #103529)',
        color: 'light-dark(#15603E, #D9FDD3)',
      },

      // =======================================================================
      // ghost → WDS "borderless default"
      //   bg: transparent, text: content-action-emphasized (green600/green450)
      // =======================================================================
      'variant:ghost': {
        color: 'light-dark(#1B8755, #21C063)',
      },

      // =======================================================================
      // destructive → WDS "filled destructive"
      //   bg: secondary-negative (red400/red300), text: on-accent, scale hover/press
      // =======================================================================
      'variant:destructive': {
        ':hover': {transform: 'scale(1.04)'},
        ':active': {transform: 'scale(0.97)'},
      },

      // =======================================================================
      // NEW: outline → WDS "outline default"
      //   bg: transparent, 1px border (lines-outline-deemphasized)
      //   text: content-action-emphasized (green600/green450)
      // =======================================================================
      'variant:outline': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(rgba(0, 0, 0, 0.2), rgba(255, 255, 255, 0.1))',
        color: 'light-dark(#1B8755, #21C063)',
      },

      // =======================================================================
      // NEW: tonal-destructive → WDS "tonal destructive"
      //   bg: secondary-negative-deemphasized (red75/red800)
      //   text: secondary-negative-emphasized (red500/red200)
      // =======================================================================
      'variant:tonal-destructive': {
        backgroundColor: 'light-dark(#FDE8EB, #321622)',
        color: 'light-dark(#B80531, #FA99A4)',
      },

      // =======================================================================
      // NEW: outline-destructive → WDS "outline destructive"
      //   bg: transparent, 1px border (lines-outline-deemphasized)
      //   text: secondary-negative-emphasized (red500/red200)
      // =======================================================================
      'variant:outline-destructive': {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(rgba(0, 0, 0, 0.2), rgba(255, 255, 255, 0.1))',
        color: 'light-dark(#B80531, #FA99A4)',
      },

      // =======================================================================
      // NEW: ghost-destructive → WDS "borderless destructive"
      //   bg: transparent, text: secondary-negative-emphasized (red500/red200)
      // =======================================================================
      'variant:ghost-destructive': {
        backgroundColor: 'transparent',
        color: 'light-dark(#B80531, #FA99A4)',
      },
    },

    // =========================================================================
    // Badge — rounded, medium weight
    // =========================================================================
    badge: {
      base: {
        fontWeight: '500',
      },
    },

    // =========================================================================
    // Card — clean, no heavy borders, elevation via shadow
    // =========================================================================
    card: {
      base: {
        borderColor:
          'light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.06))',
      },
    },

    // =========================================================================
    // Divider — subtle, WDS-style thin divider (lines-divider token)
    // =========================================================================
    divider: {
      base: {
        borderTopColor:
          'light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1))',
      },
    },

    // =========================================================================
    // TextInput — derived from WDSTextFieldVariants.web.js
    //
    // WDS web textfield:
    //   height: 40px (covered by --size-element-md token)
    //   borderRadius: borderRadiusSingle = 8px (covered by radius multiplier)
    //   border: 1px solid lines-outline-default
    //   focus: 2px outline, accent (green) color
    //   hover (unfocused): surface-highlight background
    //   caret: accent color
    //   padding: spacingSinglePlus (12px) inline
    //   disabled: 38% opacity + cursor not-allowed
    //   error: secondary-negative outline color
    // =========================================================================
    'text-input': {
      base: {
        borderColor: 'light-dark(#959393, #757778)',
        paddingInline: '12px',
        caretColor: 'light-dark(#1DAA61, #21C063)',
        ':focus-within': {
          outlineColor: 'light-dark(#1DAA61, #21C063)',
        },
      },
    },
  },

  icons: whatsappIconRegistry,
});

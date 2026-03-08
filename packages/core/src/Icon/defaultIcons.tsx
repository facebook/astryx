/**
 * @file defaultIcons.tsx
 * @input Uses React JSX for inline SVGs
 * @output Exports defaultIcons registry with lightweight SVG fallbacks
 * @position Fallback icons used when no theme provides an icon registry
 *
 * These are intentionally minimal inline SVGs (~1.4KB total) that provide
 * basic visual completeness without any external icon library dependency.
 * Themes should override these with higher-quality icons from a proper
 * icon library (heroicons, lucide, Material Symbols, etc.).
 *
 * All icons:
 * - Use a 24x24 viewBox
 * - Use currentColor for stroke/fill (inherits from parent)
 * - Are aria-hidden (decorative by default)
 * - Use stroke-based rendering with 1.5px stroke width (matching heroicons outline style)
 * - Status icons (checkCircle, xCircle, warning) use solid fills for better color visibility
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/globalIconRegistry.tsx (XDSIconName type if names change)
 * - /packages/core/src/Icon/Icon.doc.mjs (fallback icon documentation)
 */

import type {XDSIconRegistry} from './globalIconRegistry';

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: '1em',
  height: '1em',
  'aria-hidden': true as const,
};

/**
 * Props for solid/filled SVG icons.
 * Status icons (checkCircle, xCircle, warning) use solid fills for better
 * color visibility at small sizes, matching the heroicons solid style
 * used by themes.
 */
const solidSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  width: '1em',
  height: '1em',
  'aria-hidden': true as const,
};

export const defaultIcons: XDSIconRegistry = {
  /** ✕ — two diagonal lines */
  close: (
    <svg {...svgProps}>
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  ),

  /** ▾ — downward chevron */
  chevronDown: (
    <svg {...svgProps}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),

  /** ‹ — left chevron */
  chevronLeft: (
    <svg {...svgProps}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),

  /** › — right chevron */
  chevronRight: (
    <svg {...svgProps}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),

  /** ✓ — checkmark */
  check: (
    <svg {...svgProps}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),

  /** ✓ in circle — success (solid fill for status visibility) */
  checkCircle: (
    <svg {...solidSvgProps}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3a9 9 0 100 18 9 9 0 000-18zm4.06 6.56a.75.75 0 00-1.12-1l-3.94 4.4-1.94-1.94a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.09-.03l4.47-5z"
      />
    </svg>
  ),

  /** ✕ in circle — error (solid fill for status visibility) */
  xCircle: (
    <svg {...solidSvgProps}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3a9 9 0 100 18 9 9 0 000-18zm-2.47 5.47a.75.75 0 00-1.06 1.06L10.94 12l-2.47 2.47a.75.75 0 101.06 1.06L12 13.06l2.47 2.47a.75.75 0 101.06-1.06L13.06 12l2.47-2.47a.75.75 0 00-1.06-1.06L12 10.94l-2.47-2.47z"
      />
    </svg>
  ),

  /** △ with ! — warning (solid fill for status visibility) */
  warning: (
    <svg {...solidSvgProps}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.29 3.86L2.07 19.05A2 2 0 003.78 22h16.44a2 2 0 001.71-2.95L13.71 3.86a2 2 0 00-3.42 0zM12 9a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0112 9zm0 9a1 1 0 100-2 1 1 0 000 2z"
      />
    </svg>
  ),

  /** ⓘ — information */
  info: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),

  /** 📅 — calendar */
  calendar: (
    <svg {...svgProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),

  /** 🕐 — clock */
  clock: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),

  /** ↗ — external link arrow */
  externalLink: (
    <svg {...svgProps}>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  ),

  /** ☰ — hamburger menu (three horizontal lines) */
  menu: (
    <svg {...svgProps} strokeWidth={2}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),

  /** ⋯ — three horizontal dots (more/overflow) */
  moreHorizontal: (
    <svg {...solidSvgProps}>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  ),

  /** 🔍 — magnifying glass (search) */
  search: (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
};

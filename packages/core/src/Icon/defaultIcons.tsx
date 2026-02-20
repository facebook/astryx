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
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/IconRegistry.tsx (XDSIconName type if names change)
 * - /packages/core/src/Icon/README.md (fallback icon documentation)
 */

import type {XDSIconRegistry} from './IconRegistry';

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

  /** ✓ in circle — success */
  checkCircle: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),

  /** ✕ in circle — error */
  xCircle: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),

  /** △ with ! — warning */
  warning: (
    <svg {...svgProps}>
      <path d="M12 3L2 21h20L12 3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
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
};

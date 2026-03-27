/**
 * Empty state illustrations for the Meta theme.
 *
 * Modern SVG illustrations that use XDS color tokens via CSS custom
 * properties. They adapt automatically to light/dark mode and any theme.
 *
 * Usage:
 *   import { SearchIllustration } from '@xds/theme-meta';
 *   <XDSEmptyState icon={<SearchIllustration />} title="No results" />
 */

import type {CSSProperties} from 'react';

interface IllustrationProps {
  /** Width in pixels. Height scales proportionally. @default 200 */
  size?: number;
  style?: CSSProperties;
  className?: string;
}

/**
 * No results / search empty state.
 * Browser window with magnifying glass.
 */
export function SearchIllustration({
  size = 200,
  style,
  className,
}: IllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 240"
      fill="none"
      width={size}
      height={size * (240 / 280)}
      style={style}
      className={className}
      aria-hidden="true">
      <defs>
        <filter id="es-s1" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="var(--color-shadow, rgba(0,0,0,0.08))"
          />
        </filter>
        <filter id="es-s2" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="var(--color-shadow, rgba(0,0,0,0.06))"
          />
        </filter>
      </defs>
      <g filter="url(#es-s1)">
        <rect
          x="50"
          y="52"
          width="148"
          height="112"
          rx="14"
          fill="var(--color-card, white)"
        />
        <rect
          x="50"
          y="52"
          width="148"
          height="30"
          rx="14"
          fill="var(--color-muted, #E8EAF0)"
        />
        <rect
          x="50"
          y="68"
          width="148"
          height="14"
          fill="var(--color-muted, #E8EAF0)"
        />
        <circle cx="68" cy="67" r="4.5" fill="#FF7B7B" />
        <circle cx="82" cy="67" r="4.5" fill="#FFB84D" />
        <circle cx="96" cy="67" r="4.5" fill="#4DC870" />
        <rect
          x="70"
          y="96"
          width="60"
          height="7"
          rx="3.5"
          fill="var(--color-border-emphasized, #D0D4DE)"
        />
        <rect
          x="70"
          y="111"
          width="44"
          height="7"
          rx="3.5"
          fill="var(--color-border, #D8DBE4)"
        />
        <rect
          x="70"
          y="126"
          width="52"
          height="7"
          rx="3.5"
          fill="var(--color-border, #DFE2EA)"
        />
        <rect
          x="70"
          y="141"
          width="34"
          height="7"
          rx="3.5"
          fill="var(--color-border, #E4E7EE)"
        />
      </g>
      <g transform="translate(195, 68)" filter="url(#es-s2)">
        <circle
          cx="0"
          cy="0"
          r="32"
          fill="var(--color-accent-muted, #D4E6FF)"
          stroke="var(--color-accent, #0064E0)"
          strokeWidth="4"
        />
        <line
          x1="22"
          y1="22"
          x2="42"
          y2="42"
          stroke="var(--color-accent, #0064E0)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M-14 -18 C-6 -26, 8 -26, 16 -18"
          stroke="var(--color-card, white)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M-6 -8 C-6 -16, 8 -18, 8 -10 C8 -4, 0 -3, 0 1"
          stroke="var(--color-card, white)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <circle
          cx="0"
          cy="9"
          r="3"
          fill="var(--color-card, white)"
          opacity="0.9"
        />
      </g>
      <circle
        cx="42"
        cy="82"
        r="20"
        fill="none"
        stroke="var(--color-accent, #0064E0)"
        strokeWidth="2.5"
        opacity="0.15"
      />
      <circle
        cx="42"
        cy="152"
        r="8"
        fill="var(--color-accent, #0064E0)"
        opacity="0.12"
      />
      <circle
        cx="252"
        cy="155"
        r="16"
        fill="none"
        stroke="var(--color-accent, #0064E0)"
        strokeWidth="2"
        opacity="0.1"
      />
      <circle
        cx="252"
        cy="108"
        r="6"
        fill="var(--color-accent, #0064E0)"
        opacity="0.1"
      />
    </svg>
  );
}

/**
 * Empty inbox / no messages.
 * Tray with floating envelopes.
 */
export function InboxIllustration({
  size = 200,
  style,
  className,
}: IllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 240"
      fill="none"
      width={size}
      height={size * (240 / 280)}
      style={style}
      className={className}
      aria-hidden="true">
      <defs>
        <filter id="ei-i1" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="var(--color-shadow, rgba(0,0,0,0.08))"
          />
        </filter>
        <filter id="ei-i2" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="var(--color-shadow, rgba(0,0,0,0.06))"
          />
        </filter>
      </defs>
      <g filter="url(#ei-i1)">
        <rect
          x="55"
          y="125"
          width="170"
          height="68"
          rx="20"
          fill="var(--color-card, white)"
        />
        <rect
          x="72"
          y="139"
          width="136"
          height="42"
          rx="12"
          fill="var(--color-muted, #E8EAF0)"
        />
        <rect
          x="55"
          y="125"
          width="170"
          height="30"
          rx="20"
          fill="var(--color-card, white)"
        />
      </g>
      <g transform="translate(108, 55)" filter="url(#ei-i2)">
        <rect
          x="-45"
          y="-28"
          width="90"
          height="56"
          rx="10"
          fill="var(--color-card, white)"
          stroke="var(--color-border-emphasized, #D0D4DE)"
          strokeWidth="2"
        />
        <path
          d="M-45 -28 L0 8 L45 -28"
          stroke="var(--color-border-strong, #C0C4D0)"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="0"
          cy="15"
          r="10"
          fill="var(--color-accent, #0064E0)"
          opacity="0.2"
        />
        <circle
          cx="0"
          cy="15"
          r="5"
          fill="var(--color-accent, #0064E0)"
          opacity="0.45"
        />
      </g>
      <g transform="translate(200, 88) rotate(8)" filter="url(#ei-i2)">
        <rect
          x="-32"
          y="-22"
          width="64"
          height="44"
          rx="8"
          fill="var(--color-card, white)"
          stroke="var(--color-border-emphasized, #D0D4DE)"
          strokeWidth="1.5"
        />
        <path
          d="M-32 -22 L0 4 L32 -22"
          stroke="var(--color-border-strong, #C0C4D0)"
          strokeWidth="2"
          fill="none"
        />
        <rect
          x="-18"
          y="9"
          width="24"
          height="4"
          rx="2"
          fill="var(--color-accent, #0064E0)"
          opacity="0.25"
        />
      </g>
      <circle
        cx="48"
        cy="95"
        r="18"
        fill="none"
        stroke="var(--color-accent, #0064E0)"
        strokeWidth="2.5"
        opacity="0.15"
      />
      <circle
        cx="248"
        cy="70"
        r="14"
        fill="none"
        stroke="var(--color-accent, #0064E0)"
        strokeWidth="2"
        opacity="0.1"
      />
      <circle
        cx="42"
        cy="165"
        r="7"
        fill="var(--color-accent, #0064E0)"
        opacity="0.12"
      />
      <circle
        cx="255"
        cy="150"
        r="6"
        fill="var(--color-accent, #0064E0)"
        opacity="0.1"
      />
    </svg>
  );
}

/**
 * No data / empty chart.
 * Dashboard card with bar chart placeholder.
 */
export function NoDataIllustration({
  size = 200,
  style,
  className,
}: IllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 240"
      fill="none"
      width={size}
      height={size * (240 / 280)}
      style={style}
      className={className}
      aria-hidden="true">
      <defs>
        <filter id="ed-d1" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="var(--color-shadow, rgba(0,0,0,0.08))"
          />
        </filter>
      </defs>
      <g filter="url(#ed-d1)">
        <rect
          x="40"
          y="38"
          width="200"
          height="155"
          rx="16"
          fill="var(--color-card, white)"
        />
        <rect
          x="62"
          y="58"
          width="60"
          height="7"
          rx="3.5"
          fill="var(--color-border-emphasized, #C8CCD6)"
        />
        <rect
          x="62"
          y="72"
          width="42"
          height="6"
          rx="3"
          fill="var(--color-border, #D8DBE4)"
        />
      </g>
      <rect
        x="68"
        y="108"
        width="32"
        height="62"
        rx="8"
        fill="var(--color-accent, #0064E0)"
        opacity="0.35"
      />
      <rect
        x="112"
        y="85"
        width="32"
        height="85"
        rx="8"
        fill="var(--color-accent, #0064E0)"
        opacity="0.5"
      />
      <rect
        x="156"
        y="118"
        width="32"
        height="52"
        rx="8"
        fill="var(--color-accent, #0064E0)"
        opacity="0.25"
      />
      <rect
        x="200"
        y="98"
        width="32"
        height="72"
        rx="8"
        fill="var(--color-accent, #0064E0)"
        opacity="0.4"
      />
      <path
        d="M84 100 C110 82, 144 115, 172 105 C188 99, 208 88, 216 92"
        stroke="var(--color-accent, #0064E0)"
        strokeWidth="3"
        strokeDasharray="7 5"
        fill="none"
        opacity="0.35"
      />
      <circle
        cx="32"
        cy="85"
        r="18"
        fill="none"
        stroke="var(--color-accent, #0064E0)"
        strokeWidth="2.5"
        opacity="0.15"
      />
      <circle
        cx="258"
        cy="60"
        r="7"
        fill="var(--color-accent, #0064E0)"
        opacity="0.12"
      />
      <circle
        cx="30"
        cy="170"
        r="6"
        fill="var(--color-accent, #0064E0)"
        opacity="0.1"
      />
      <circle
        cx="260"
        cy="140"
        r="14"
        fill="none"
        stroke="var(--color-accent, #0064E0)"
        strokeWidth="2"
        opacity="0.1"
      />
    </svg>
  );
}

/**
 * Error / something went wrong.
 * Document with error badge and gear.
 */
export function ErrorIllustration({
  size = 200,
  style,
  className,
}: IllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 240"
      fill="none"
      width={size}
      height={size * (240 / 280)}
      style={style}
      className={className}
      aria-hidden="true">
      <defs>
        <filter id="ee-e1" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="var(--color-shadow, rgba(0,0,0,0.08))"
          />
        </filter>
        <filter id="ee-e2" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="var(--color-shadow, rgba(0,0,0,0.06))"
          />
        </filter>
      </defs>
      <g filter="url(#ee-e1)">
        <rect
          x="72"
          y="38"
          width="136"
          height="162"
          rx="14"
          fill="var(--color-card, white)"
        />
        <rect
          x="92"
          y="62"
          width="60"
          height="7"
          rx="3.5"
          fill="var(--color-border-emphasized, #D0D4DE)"
        />
        <rect
          x="92"
          y="77"
          width="42"
          height="6"
          rx="3"
          fill="var(--color-border, #D8DBE4)"
        />
        <rect
          x="92"
          y="100"
          width="96"
          height="6"
          rx="3"
          fill="var(--color-border, #E0E3EA)"
        />
        <rect
          x="92"
          y="114"
          width="74"
          height="6"
          rx="3"
          fill="var(--color-border, #E0E3EA)"
        />
        <rect
          x="92"
          y="128"
          width="84"
          height="6"
          rx="3"
          fill="var(--color-border, #E6E8EE)"
        />
        <rect
          x="92"
          y="142"
          width="58"
          height="6"
          rx="3"
          fill="var(--color-border, #E6E8EE)"
        />
        <rect
          x="92"
          y="156"
          width="68"
          height="6"
          rx="3"
          fill="var(--color-border, #ECEDF0)"
        />
      </g>
      <g transform="translate(190, 155)" filter="url(#ee-e2)">
        <circle
          cx="0"
          cy="0"
          r="35"
          fill="var(--color-error-muted, #FFE0E0)"
          stroke="var(--color-error, #D83030)"
          strokeWidth="3"
        />
        <line
          x1="-12"
          y1="-12"
          x2="12"
          y2="12"
          stroke="var(--color-error, #D83030)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="-12"
          x2="-12"
          y2="12"
          stroke="var(--color-error, #D83030)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <ellipse
          cx="-9"
          cy="-14"
          rx="14"
          ry="9"
          fill="var(--color-card, white)"
          opacity="0.35"
          transform="rotate(-15)"
        />
      </g>
      <g transform="translate(48, 158)" filter="url(#ee-e2)" opacity="0.7">
        <circle cx="0" cy="0" r="20" fill="var(--color-muted, #E0E3EA)" />
        <circle
          cx="0"
          cy="0"
          r="8"
          fill="var(--color-card, white)"
          stroke="var(--color-border-emphasized, #CDD0DA)"
          strokeWidth="2.5"
        />
        <rect
          x="-5"
          y="-26"
          width="10"
          height="12"
          rx="4"
          fill="var(--color-muted, #E0E3EA)"
        />
        <rect
          x="-5"
          y="14"
          width="10"
          height="12"
          rx="4"
          fill="var(--color-muted, #E0E3EA)"
        />
        <rect
          x="-26"
          y="-5"
          width="12"
          height="10"
          rx="4"
          fill="var(--color-muted, #E0E3EA)"
        />
        <rect
          x="14"
          y="-5"
          width="12"
          height="10"
          rx="4"
          fill="var(--color-muted, #E0E3EA)"
        />
      </g>
      <circle
        cx="50"
        cy="65"
        r="16"
        fill="none"
        stroke="var(--color-error, #D83030)"
        strokeWidth="2.5"
        opacity="0.12"
      />
      <circle
        cx="248"
        cy="80"
        r="12"
        fill="none"
        stroke="var(--color-error, #D83030)"
        strokeWidth="2"
        opacity="0.1"
      />
      <circle
        cx="250"
        cy="190"
        r="6"
        fill="var(--color-error-muted, #FFD0D0)"
        opacity="0.35"
      />
      <circle
        cx="38"
        cy="110"
        r="5"
        fill="var(--color-error, #D83030)"
        opacity="0.08"
      />
    </svg>
  );
}

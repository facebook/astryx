/**
 * @file styles.ts
 * @input Uses stylex, theme tokens
 * @output Exports calendar styles (structural) and theme styles (customizable)
 * @position Shared styles; used by XDSCalendar
 *
 * Style Organization:
 * - *Styles objects: Structural/layout styles (spacing, sizing, positioning)
 * - *Theme objects: Themeable styles (colors, borders) that can be overridden
 *
 * SYNC: When modified, update this header
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  durationVars,
  easingVars,
  textSizeVars,
  fontWeightVars,
} from '../theme/tokens.stylex';

// =============================================================================
// Calendar Container Styles
// =============================================================================

export const calendarStyles = stylex.create({
  calendar: {
    display: 'inline-block',
    padding: spacingVars['--spacing-3'],
    minWidth: '220px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacingVars['--spacing-2'],
    gap: spacingVars['--spacing-2'],
  },
  monthYearLabel: {
    flex: 1,
    textAlign: 'center',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    fontSize: textSizeVars['--text-base'],
    color: colorVars['--color-text-primary'],
  },
  monthsContainer: {
    display: 'flex',
    gap: spacingVars['--spacing-4'],
  },
  navIcon: {
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
  },
});

// =============================================================================
// Month Grid Styles
// =============================================================================

export const monthGridStyles = stylex.create({
  monthGrid: {
    flex: '1 1 0',
  },
  weekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: spacingVars['--spacing-1'],
  },
  weekHeaderWithNumbers: {
    gridTemplateColumns: 'auto repeat(7, 1fr)',
  },
  dayName: {
    width: sizeVars['--size-md'],
    height: sizeVars['--size-md'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  weekNumberHeader: {
    width: sizeVars['--size-md'],
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
  },
  daysGridWithNumbers: {
    gridTemplateColumns: 'auto repeat(7, 1fr)',
  },
  weekNumber: {
    width: sizeVars['--size-md'],
    height: sizeVars['--size-md'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  weekRow: {
    display: 'contents',
  },
});

// =============================================================================
// Day Cell Styles - Structural (layout, sizing, positioning)
// =============================================================================

export const dayCellStyles = stylex.create({
  // Cell container
  cell: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizeVars['--size-md'],
  },

  // Range background - structural positioning
  rangeBg: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    left: 0,
    right: 0,
  },
  rangeBgRadiusLeft: {
    left: '2px',
    borderTopLeftRadius: radiusVars['--radius-rounded'],
    borderBottomLeftRadius: radiusVars['--radius-rounded'],
  },
  rangeBgRadiusRight: {
    right: '2px',
    borderTopRightRadius: radiusVars['--radius-rounded'],
    borderBottomRightRadius: radiusVars['--radius-rounded'],
  },
  rangeInsetLeft: {
    left: '2px',
  },
  rangeInsetRight: {
    right: '2px',
  },

  // Preview background - structural positioning
  previewBg: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    left: 0,
    right: 0,
  },
  previewBgRadiusLeft: {
    left: '2px',
    borderTopLeftRadius: radiusVars['--radius-rounded'],
    borderBottomLeftRadius: radiusVars['--radius-rounded'],
  },
  previewBgRadiusRight: {
    right: '2px',
    borderTopRightRadius: radiusVars['--radius-rounded'],
    borderBottomRightRadius: radiusVars['--radius-rounded'],
  },
  previewStart: {
    left: '2px',
    borderTopLeftRadius: radiusVars['--radius-rounded'],
    borderBottomLeftRadius: radiusVars['--radius-rounded'],
  },
  previewEnd: {
    right: '2px',
    borderTopRightRadius: radiusVars['--radius-rounded'],
    borderBottomRightRadius: radiusVars['--radius-rounded'],
  },

  // Day button - structural
  day: {
    width: sizeVars['--size-sm'],
    height: sizeVars['--size-sm'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    borderWidth: 0,
    borderStyle: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-sm'],
    padding: 0,
    position: 'relative',
    zIndex: 1,
    transitionProperty: 'background-color, color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easingVars['--easing-standard'],
    // Expand hit target by 2px on each side to prevent gaps
    '::before': {
      content: '""',
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      bottom: '-2px',
      left: '-2px',
    },
  },

  // State modifiers - structural only
  dayOutside: {
    opacity: 0.5,
  },
  dayToday: {},
  dayTodayInRange: {},
  daySelected: {},
  dayDisabled: {
    cursor: 'not-allowed',
  },
});

// =============================================================================
// Day Cell Theme - Colors and visual appearance (customizable)
// =============================================================================

export const dayCellTheme = stylex.create({
  // Range background color
  rangeBg: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
  },

  // Preview background (muted overlay)
  previewBg: {
    backgroundColor: colorVars['--color-hover-overlay'],
  },

  // Day button - default state
  day: {
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },

  // Outside days (adjacent months)
  dayOutside: {
    color: colorVars['--color-text-secondary'],
  },

  // Today indicator
  dayToday: {
    boxShadow: `inset 0 0 0 1px ${colorVars['--color-divider-emphasized']}`,
  },

  // Today when inside a selected range
  dayTodayInRange: {
    boxShadow: `inset 0 0 0 1px ${colorVars['--color-text-primary']}`,
  },

  // Selected state (single selection or range endpoints)
  daySelected: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-text-on-media'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
    },
  },

  // Disabled state
  dayDisabled: {
    opacity: 0.3,
    backgroundImage: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': 'none',
      },
    },
  },
});

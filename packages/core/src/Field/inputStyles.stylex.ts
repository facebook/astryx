/**
 * @file inputStyles.stylex.ts
 * @input Uses theme tokens (color, spacing, radius, elevation, transition)
 * @output Exports shared input wrapper appearance styles
 * @position Shared styles consumed by TextInput, TextArea, NumberInput, DateInput,
 *   TimeInput, Selector, Typeahead, and Tokenizer
 *
 * Centralizes the input wrapper appearance (borders, focus outlines, hover shadows,
 * disabled state, status variants) so all input components stay in sync.
 * Individual components layer their own overrides (padding, alignment, etc.)
 * via stylex.props composition.
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  elevationVars,
  transitionVars,
} from '../theme/tokens.stylex';

/**
 * Base wrapper styles shared by all input components.
 * Components apply these as a foundation and override specific properties
 * (e.g. padding, alignItems, gap) as needed.
 */
export const inputWrapperStyles = stylex.create({
  base: {
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      ':hover': {
        '@media (hover: hover)': colorVars['--color-divider-high-contrast'],
      },
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'border-color, outline, box-shadow',
    transitionDuration: transitionVars['--transition-fast'],
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': elevationVars['--elevation-input-hover'],
      },
    },
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: '0',
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
  },
});

/**
 * Status border colors for input wrappers.
 * Keyed by XDSInputStatusType.
 */
export const inputStatusBorderStyles = stylex.create({
  warning: {
    borderColor: colorVars['--color-warning'],
  },
  error: {
    borderColor: colorVars['--color-negative'],
  },
  success: {
    borderColor: colorVars['--color-positive'],
  },
});

/**
 * Status hover shadow styles for input wrappers.
 * Keyed by XDSInputStatusType.
 */
export const inputStatusHoverShadowStyles = stylex.create({
  warning: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)':
          elevationVars['--elevation-input-hover-warning'],
      },
    },
  },
  error: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': elevationVars['--elevation-input-hover-error'],
      },
    },
  },
  success: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)':
          elevationVars['--elevation-input-hover-success'],
      },
    },
  },
});

/**
 * Status focus outline styles using :focus-within.
 * Used by input wrappers that contain a child input/textarea element.
 * Keyed by XDSInputStatusType.
 */
export const inputStatusFocusWithinStyles = stylex.create({
  warning: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-warning']}`,
    },
  },
  error: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-error']}`,
    },
  },
  success: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-success']}`,
    },
  },
});

/**
 * Status focus outline styles using :focus.
 * Used by components where the wrapper itself receives focus (e.g. Selector button).
 * Keyed by XDSInputStatusType.
 */
export const inputStatusFocusStyles = stylex.create({
  warning: {
    outline: {
      default: 'none',
      ':focus': `1px solid ${colorVars['--color-focus-outline-warning']}`,
    },
  },
  error: {
    outline: {
      default: 'none',
      ':focus': `1px solid ${colorVars['--color-focus-outline-error']}`,
    },
  },
  success: {
    outline: {
      default: 'none',
      ':focus': `1px solid ${colorVars['--color-focus-outline-success']}`,
    },
  },
});

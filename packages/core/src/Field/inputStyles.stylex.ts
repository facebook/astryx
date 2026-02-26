/**
 * @file inputStyles.stylex.ts
 * @input Uses StyleX, theme tokens (color, elevation)
 * @output Exports shared input appearance styles: status borders, focus outlines, hover shadows, disabled state
 * @position Shared style definitions for all input-like components (TextInput, TextArea, NumberInput, DateInput, TimeInput, Selector)
 *
 * Extracted from 6 components that previously duplicated ~346 lines of identical
 * status styling. Each component can still layer its own overrides via stylex.props
 * composition.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextInput/XDSTextInput.tsx (uses these styles)
 * - /packages/core/src/TextArea/XDSTextArea.tsx (uses these styles)
 * - /packages/core/src/NumberInput/XDSNumberInput.tsx (uses these styles)
 * - /packages/core/src/DateInput/XDSDateInput.tsx (uses these styles)
 * - /packages/core/src/TimeInput/XDSTimeInput.tsx (uses these styles)
 * - /packages/core/src/Selector/XDSSelector.tsx (uses statusFocusSelfStyles variant)
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars, elevationVars} from '../theme/tokens.stylex';

/**
 * Status-colored border overrides for input wrappers.
 * Applied when the input has a validation status.
 */
export const statusBorderStyles = stylex.create({
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
 * Status-colored hover shadow overrides for input wrappers.
 * Replaces the default hover shadow with a status-tinted variant.
 */
export const statusHoverShadowStyles = stylex.create({
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
 * Status-colored focus outline for text-based inputs.
 * Uses `:focus-within` — appropriate for wrappers containing a focusable child.
 * For components that are themselves focusable (e.g., Selector trigger button),
 * use `statusFocusSelfStyles` instead.
 */
export const statusFocusStyles = stylex.create({
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
 * Status-colored focus outline for self-focusable elements.
 * Uses `:focus` instead of `:focus-within` — for elements like Selector's
 * trigger button that receive focus directly.
 */
export const statusFocusSelfStyles = stylex.create({
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

/**
 * Disabled state for input wrappers.
 * Applied when `isDisabled` is true.
 */
export const inputDisabledStyles = stylex.create({
  wrapper: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
  },
});

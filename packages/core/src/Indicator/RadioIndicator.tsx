// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioIndicator.tsx
 * @input Indicator state props
 * @output Exports RadioIndicator — the default radio selection visual
 * @position Decorative radio visual shared by RadioList, decorative menu
 *           markers, and any selection slot themed to use a radio
 */

import * as stylex from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {mergeProps, themeProps} from '../utils';
import {indicatorScope} from './indicator.markers.stylex';
import type {IndicatorProps} from './types';

const styles = stylex.create({
  circle: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: '50%',
    transitionProperty: 'background-color, border-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  unchecked: {
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-border-emphasized']}, ${colorVars['--color-tint-hover']} 20%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-background-surface']}, ${colorVars['--color-tint-hover']} 5%)`,
      },
    },
  },
  checked: {
    borderColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  disabled: {
    opacity: 0.5,
    borderColor: {
      default: colorVars['--color-border'],
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': colorVars['--color-border'],
      },
    },
  },
  disabledUnchecked: {
    backgroundColor: {
      default: colorVars['--color-background-muted'],
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': colorVars['--color-background-muted'],
      },
    },
  },
  dot: {
    borderRadius: '50%',
    backgroundColor: {
      default: colorVars['--color-on-accent'],
      // Forced colors (Windows High Contrast) strips painted backgrounds,
      // which would make the selected dot invisible — checked and unchecked
      // radios would look identical. CanvasText keeps the dot perceivable on
      // the Canvas circle fill (WCAG 1.4.11).
      '@media (forced-colors: active)': 'CanvasText',
    },
  },
});

const circleSizeStyles = stylex.create({
  sm: {
    width: 20,
    height: 20,
  },
  md: {
    width: 24,
    height: 24,
  },
});

const dotSizeStyles = stylex.create({
  sm: {
    width: 8,
    height: 8,
  },
  md: {
    width: 10,
    height: 10,
  },
});

/**
 * The default radio visual: a circle with a filled inner dot when selected.
 *
 * Decorative and non-interactive — it renders `aria-hidden` and owns no input,
 * role, or focus behavior. Themes replace it wholesale through
 * `defineTheme({indicators: {radio: MyRadio}})`, or restyle it through the
 * `radio` / `radio-dot` theme targets like any other component.
 *
 * Unlike an icon, a radio draws in *both* states — an empty circle when
 * unchecked. That is what makes it usable as a selection indicator in
 * components whose default is "a checkmark when selected, nothing otherwise".
 *
 * @example
 * ```tsx
 * <RadioIndicator state="checked" size="md" />
 * ```
 */
export function RadioIndicator({
  state,
  size = 'md',
  isDisabled = false,
  children,
  ref,
  className,
  style,
  xstyle,
  ...rest
}: IndicatorProps) {
  // A radio has no partial state; anything other than unchecked reads as
  // selected.
  const isChecked = state !== 'unchecked';

  return (
    <span
      ref={ref}
      aria-hidden="true"
      {...mergeProps(
        themeProps('radio', {
          size,
          checked: isChecked ? 'checked' : null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        stylex.props(
          styles.circle,
          circleSizeStyles[size],
          isChecked ? styles.checked : styles.unchecked,
          isDisabled && styles.disabled,
          isDisabled && !isChecked && styles.disabledUnchecked,
          xstyle,
        ),
        className,
        style,
      )}
      {...rest}>
      {children ??
        (isChecked && (
          <span
            {...mergeProps(
              themeProps('radio-dot', {size}),
              stylex.props(styles.dot, dotSizeStyles[size]),
            )}
          />
        ))}
    </span>
  );
}

RadioIndicator.displayName = 'RadioIndicator';

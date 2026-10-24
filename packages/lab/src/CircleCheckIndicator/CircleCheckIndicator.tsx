// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CircleCheckIndicator.tsx
 * @input Indicator state props (`@astryxdesign/core/Indicator`), the theme's
 *   colour and radius tokens, the indicator scope marker, and UIKit's
 *   multiselect circle and mark clock as mirrored in circleCheck.stylex.ts
 * @output Exports CircleCheckIndicator — the iOS multiple-selection mark: an
 *   empty circle, a filled circle with a checkmark, or a filled circle with a
 *   bar for the partial state
 * @position Lab experiment. A multiSelection-family indicator: a theme maps
 *   it to `checkbox` (`defineTheme({indicators: {checkbox:
 *   CircleCheckIndicator}})`), and a list's edit mode can render it directly
 *
 * Geometry is UIKit's (`selection.multiselectCircle`: the circle's diameter
 * and stroke, the checkmark's ink box, stroke and offset below centre);
 * colours are the theme's: the accent fill, and the emphasized border the
 * checkbox's empty box uses for the empty ring.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/CircleCheckIndicator/CircleCheckIndicator.doc.mjs
 * - /packages/lab/src/CircleCheckIndicator/CircleCheckIndicator.test.tsx
 * - /packages/lab/src/CircleCheckIndicator/index.ts
 * - /apps/storybook/stories/CircleCheckIndicator.stories.tsx
 */

import * as stylex from '@stylexjs/stylex';
import type {IndicatorProps} from '@astryxdesign/core/Indicator';
import {indicatorScope} from '@astryxdesign/core/Indicator/indicator.markers.stylex';
import {colorVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {isRenderable, mergeProps, themeProps} from '@astryxdesign/core/utils';
import {
  circleCheckMotionStyles,
  circleCheckSizeStyles,
} from './circleCheck.stylex';

const styles = stylex.create({
  circle: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    // A circle in tokens: --radius-full on a square box.
    borderRadius: radiusVars['--radius-full'],
    // The ring is an inset shadow (circleCheck.stylex.ts); forced colors
    // drops shadows, so there it falls back to a system-coloured border.
    borderStyle: {default: 'none', '@media (forced-colors: active)': 'solid'},
    borderWidth: {default: 0, '@media (forced-colors: active)': '1px'},
    borderColor: {
      default: 'transparent',
      '@media (forced-colors: active)': 'CanvasText',
    },
  },
  // The empty circle is a ring: what is under it shows through, as under
  // UIKit's multiselect circle (a selected edit-mode row keeps its selected
  // background behind the mark).
  unchecked: {
    boxShadow: {
      default: `inset 0 0 0 var(--_circle-stroke) ${colorVars['--color-border-emphasized']}`,
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `inset 0 0 0 var(--_circle-stroke) color-mix(in srgb, ${colorVars['--color-border-emphasized']}, ${colorVars['--color-tint-hover']} 20%)`,
      },
    },
    backgroundColor: 'transparent',
  },
  checked: {
    // Foreground for an inherit-shade loading spinner (reads currentColor).
    color: colorVars['--color-on-accent'],
    boxShadow: 'none',
    backgroundColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  disabled: {
    opacity: 0.5,
  },
  checkmark: {
    display: 'none',
    flexShrink: 0,
    overflow: 'visible',
    color: {
      default: colorVars['--color-on-accent'],
      // Forced colors flattens the fill to Canvas and does not reliably force
      // an SVG stroke painted with currentColor: CanvasText keeps the check
      // perceivable on it (WCAG 1.4.11), as on the checkbox.
      '@media (forced-colors: active)': 'CanvasText',
    },
  },
  checkmarkVisible: {
    display: 'block',
  },
  bar: {
    display: 'none',
    flexShrink: 0,
    backgroundColor: {
      default: colorVars['--color-on-accent'],
      '@media (forced-colors: active)': 'CanvasText',
    },
    borderRadius: radiusVars['--radius-full'],
  },
  barVisible: {
    display: 'block',
  },
});

const CIRCLE = {
  sm: circleCheckSizeStyles.smCircle,
  md: circleCheckSizeStyles.mdCircle,
} as const;
const CHECK = {
  sm: circleCheckSizeStyles.smCheck,
  md: circleCheckSizeStyles.mdCheck,
} as const;
const BAR = {
  sm: circleCheckSizeStyles.smBar,
  md: circleCheckSizeStyles.mdBar,
} as const;

/**
 * The iOS multiple-selection mark: an empty circle when unchecked, a filled
 * circle with a checkmark when checked, and a filled circle with a bar for
 * the partial state.
 *
 * Decorative and non-interactive, like every indicator: it renders
 * `aria-hidden` and owns no input, role, or focus behavior. Map it to
 * `checkbox` in a theme and every CheckboxInput and CheckboxList follows; the
 * owning control keeps its semantics and paints its focus ring onto this
 * circle. Under a finger the mark changes in one frame, as UIKit's selection
 * marks do; with a mouse its colours fade over the theme duration.
 *
 * @example
 * ```
 * const theme = defineTheme({
 *   name: 'circle-checks',
 *   indicators: {checkbox: CircleCheckIndicator},
 * });
 * ```
 */
export function CircleCheckIndicator({
  state,
  size = 'md',
  isDisabled = false,
  children,
  ref,
  className,
  style,
  xstyle,
  ...rest
}: IndicatorProps<'multiSelection'>) {
  const isChecked = state === 'checked';
  const isIndeterminate = state === 'indeterminate';
  const isFilled = isChecked || isIndeterminate;

  return (
    <span
      // `{...rest}` first, own contract after: attribute order is what keeps
      // a caller from un-hiding a decorative element (see IndicatorProps).
      {...rest}
      ref={ref}
      aria-hidden="true"
      {...mergeProps(
        themeProps('circle-check-indicator', {
          size,
          checked: isChecked
            ? 'checked'
            : isIndeterminate
              ? 'indeterminate'
              : null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        stylex.props(
          styles.circle,
          circleCheckMotionStyles.mark,
          CIRCLE[size],
          isFilled ? styles.checked : styles.unchecked,
          isDisabled && styles.disabled,
          xstyle,
        ),
        className,
        style,
      )}>
      {isRenderable(children) ? (
        children
      ) : (
        <>
          {/* The check's ink fills its box: the round caps reach the edges. */}
          <svg
            viewBox="0 0 10 10"
            {...mergeProps(
              themeProps('circle-check-indicator-check', {size}),
              stylex.props(
                styles.checkmark,
                CHECK[size],
                isChecked && styles.checkmarkVisible,
              ),
            )}>
            <path
              d="M0.75 5.25L3.75 9.25L9.25 0.75"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            {...mergeProps(
              themeProps('circle-check-indicator-dash', {size}),
              stylex.props(
                styles.bar,
                BAR[size],
                isIndeterminate && styles.barVisible,
              ),
            )}
          />
        </>
      )}
    </span>
  );
}

CircleCheckIndicator.displayName = 'CircleCheckIndicator';

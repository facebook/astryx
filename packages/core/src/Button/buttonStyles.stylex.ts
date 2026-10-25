// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file buttonStyles.stylex.ts
 * @input Uses StyleX, theme tokens, the shared focus outline and interaction
 *   overlay
 * @output Exports Button's root StyleX styles, ButtonVariant, ButtonSize,
 *   iconSizeByButtonSize, getButtonStyleProps and getButtonRootProps
 * @position Server-safe half of Button: the classes, tokens and theme
 *   attributes of the root element. Shared by the client Button (Button.tsx)
 *   and the server shell (ButtonShell.tsx), so both render the same root.
 *
 * SYNC: When modified, update Button.tsx and ButtonShell.tsx, which both spread
 * getButtonRootProps on the root element.
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {CSSProperties} from 'react';
import type {Elevation, SizeValue} from '../utils/types';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
  shadowVars,
  focusVars,
} from '../theme/tokens.stylex';
import type {IconSize} from '../Icon/IconSize.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import type {ButtonVariantMap} from './index';

/**
 * Base button styles
 * Pseudo-classes are nested within properties per StyleX recommendation:
 * https://stylexjs.com/docs/learn/styling-ui/defining-styles#pseudo-classes
 */
export const styles = stylex.create({
  base: {
    // Kept as a public themeable var (documented in Button.doc.mjs) even though
    // it now defaults to the shared token: removing it would break any theme
    // setting it, for no gain. It overrides the shared offset, so a theme can
    // still tune the ring distance on buttons specifically.
    '--button-focus-offset': focusVars['--focus-outline-offset'],
    outlineOffset: {
      default: '0',
      ':focus-visible': 'var(--button-focus-offset)',
    },
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: 0,
    borderStyle: 'none',

    borderRadius: `var(--_button-radius, ${radiusVars['--radius-element']})`,
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
    // One line by construction, so a label wider than the space available
    // has to truncate. As a flex item the automatic minimum size would hold
    // the button at its full label width (and `nowrap` lets an inline button
    // run past its container), so the label's ellipsis never engaged. These
    // let a row shrink the button and cap it at its container.
    minWidth: 0,
    maxWidth: '100%',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    transitionProperty:
      'background-image, background-color, color, opacity, transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  pressable: {
    transform: {
      default: 'scale(1)',
      // A mouse press. Under a coarse pointer `:active` is not a press (it
      // paints on the touch and outlives a scroll), so the touch press model
      // writes `data-astryx-press` instead; see interactionOverlay.stylex.ts.
      ':active:where(:not(:disabled,[aria-disabled="true"]))': {
        default: 'scale(0.98)',
        '@media (pointer: coarse)': 'scale(1)',
      },
      '[data-astryx-press="on"]': 'scale(0.98)',
    },
  },
  inactive: {
    cursor: 'default',
    backgroundImage: 'none',
    transform: {
      default: 'none',
      ':active': 'none',
      '[data-astryx-press="on"]': 'none',
    },
  },
  disabled: {
    opacity: 0.5,
  },
  ariaDisabled: {
    // The variants' hover treatment already steps aside for
    // `[aria-disabled]`; `:active` still matches a press on an aria-disabled
    // button, so that one is suppressed here.
    backgroundImage: {
      default: 'none',
      ':active': 'none',
      '[data-astryx-press="on"]': 'none',
    },
  },
  iconOnly: {
    '--button-icon-only-aspect': '1 / 1',
    aspectRatio: 'var(--button-icon-only-aspect)',
    paddingInline: 0,
    paddingBlock: 0,
    // An icon-only button has no label to truncate: keep it square rather
    // than letting a crowded row squeeze it.
    flexShrink: 0,
    maxWidth: 'none',
  },

  link: {
    textDecoration: 'none',
  },
});

// Dynamic style for the consumer-controlled button width. Numbers are treated
// as pixels by StyleX; strings (e.g. '100%') are used as-is.
const dynamicStyles = stylex.create({
  width: (width: SizeValue | null) => ({width}),
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
  lg: {
    height: sizeVars['--size-element-lg'],
  },
});

/**
 * Resting elevation for floating buttons (e.g. a FAB). `none` is the default
 * flat button; `low`/`med`/`high` map to the shadow token scale. 'none' stays
 * a literal so it never conflicts with a variant's background layering.
 */
const elevationStyles = stylex.create({
  none: {boxShadow: 'none'},
  low: {boxShadow: shadowVars['--shadow-low']},
  med: {boxShadow: shadowVars['--shadow-med']},
  high: {boxShadow: shadowVars['--shadow-high']},
});

/**
 * Variant styles using backgroundImage for layered colors
 * Pseudo-classes are nested within properties per StyleX recommendation
 * Overlay is stacked on top of base color using multiple linear-gradients
 * Focus outline is shared across variants for consistent keyboard affordance.
 */
const variants = stylex.create({
  primary: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  secondary: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
  },
  destructive: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
    // The ring matches the variant it rings: an accent-colored outline on a
    // red button reads as another control's focus. Only the color differs —
    // width, style and offset come from the shared outline.
    outlineColor: {default: null, ':focus-visible': colorVars['--color-error']},
  },
});

/**
 * Button variant type derived from ButtonVariantMap.
 * Extensible via module augmentation of ButtonVariantMap.
 */
export type ButtonVariant = keyof ButtonVariantMap;

/**
 * Button size type derived from the sizeStyles StyleX object
 */
export type ButtonSize = keyof typeof sizeStyles;

export const iconSizeByButtonSize = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
} satisfies Record<ButtonSize, IconSize>;

export interface ButtonRootOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  elevation: Elevation;
  isIconOnly: boolean;
  /** Activation is blocked: truly disabled or busy-only. */
  isInactive: boolean;
  /** `isDisabled` or a disabled enclosing ButtonGroup. */
  isTrueDisabled: boolean;
  /** Exposed as `aria-disabled` instead of native `disabled`. */
  isAriaDisabled: boolean;
  isLink: boolean;
  /** Inside a ButtonGroup: the group owns press scale and elevation. */
  isGrouped: boolean;
  /**
   * Connected-group and InputGroup addon styles. Only the client Button
   * renders inside a group, so they stay in Button.tsx with the selector they
   * are keyed off.
   */
  groupXstyle: StyleXStyles | false;
  width: SizeValue | undefined;
  xstyle: StyleXStyles | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
}

/** The root element's StyleX props: the classes both Button renderers apply. */
export function getButtonStyleProps({
  variant,
  size,
  elevation,
  isIconOnly,
  isInactive,
  isTrueDisabled,
  isAriaDisabled,
  isLink,
  isGrouped,
  groupXstyle,
  width,
  xstyle,
}: Omit<ButtonRootOptions, 'className' | 'style'>) {
  return focusOutlineProps.focusVisible(
    styles.base,
    sizeStyles[size],
    isIconOnly && styles.iconOnly,
    interactionOverlayStyles.backgroundImage,
    isInactive && styles.inactive,
    isTrueDisabled && styles.disabled,
    isAriaDisabled && styles.ariaDisabled,
    isLink && styles.link,
    !isGrouped && styles.pressable,
    groupXstyle,
    // Standalone floating buttons only — a grouped button's elevation is owned
    // by the ButtonGroup so the shared surface lifts as one unit.
    !isGrouped && elevationStyles[elevation],
    width != null && dynamicStyles.width(width),
    // AFTER the shared focus outline: the outline supplies width/style/offset
    // for every variant, and `destructive` re-colors just the ring to match
    // its own surface. Ordering is the mechanism — StyleX is last-wins.
    variants[variant],
    xstyle,
  );
}

/**
 * The root element's `className`, `style` and theme attributes, for the
 * server shell. Button.tsx composes the same three parts inline (its
 * `themeProps('button', …)` call is what tooling reads to map the `button`
 * target to Button), so the two renderers carry the same classes, tokens and
 * `data-*` attributes; ButtonShell.test.tsx holds them equal.
 */
export function getButtonRootProps(options: ButtonRootOptions) {
  const {variant, size, elevation, isGrouped, className, style} = options;
  return mergeProps(
    // Inside a group the group owns the surface's elevation, so the button
    // reflects the tier it actually paints rather than the prop it was handed.
    themeProps('button', {
      variant,
      size,
      elevation: isGrouped ? 'none' : elevation,
    }),
    getButtonStyleProps(options),
    className,
    style,
  );
}

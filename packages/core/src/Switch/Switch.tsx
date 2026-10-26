// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Switch.tsx
 * @input Uses React, useId, ChangeEvent, FieldLabel, FieldStatus, IconType, InputStatus, useTooltip, i18n (useTranslator)
 * @output Exports Switch component, SwitchProps, SwitchLabelPosition, SwitchLabelSpacing
 * @position Core implementation; consumed by index.ts, tested by Switch.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Switch/Switch.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Switch/Switch.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Switch/index.ts (exports if types change)
 * - /apps/storybook/stories/Switch.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Switch/ (showcase blocks)
 */

import {
  Fragment,
  useId,
  useMemo,
  useOptimistic,
  useTransition,
  useEffect,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
  focusVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {FieldLabel} from '../Field/FieldLabel';
import {FieldStatus} from '../FieldStatus/FieldStatus';
import type {IconType} from '../Icon';
import type {InputStatus} from '../Field/types';
import {Spinner} from '../Spinner';
import {useTooltip} from '../Tooltip';
import {mergeProps, mergeRefs, rtlStyles} from '../utils';
import {switchFocusInput, switchScope} from './switch.markers.stylex';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {useAnnounce} from '../hooks/useAnnounce';
import {useResolvedRequired} from '../hooks/useResolvedRequired';
import {useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {controlPressConsts} from '../utils/controlPressLayer.stylex';
import {reducedMotionFadeConsts} from '../motion/reducedMotion.stylex';
import {PRESS_HOLDS_DRAG_ATTRIBUTE} from '../utils/pressFeedback';
import {switchPressLayerStyles} from './switchPressLayer';
import {useSwitchTouch, type SwitchTouchParts} from './useSwitchTouch';

/**
 * The track box of each size, px (width × height), for the touch
 * presentation's thumb geometry.
 * SYNC: wrapperSizeStyles, inputSizeStyles and trackSizeStyles below.
 */
const TRACK_SIZE = {sm: [32, 20], md: [40, 24]} as const;

/**
 * A finger: utils/touchPresentation.ts's TOUCH_QUERY. The touch presentation
 * is one model on every touch device (`spec:AST-094`): the lift, tracking,
 * flip rule and springs sit under it alone.
 * SYNC: utils/touchPresentation.ts TOUCH_QUERY.
 */
const TOUCH = '@media (pointer: coarse)';

const wrapperSizeStyles = stylex.create({
  sm: {
    width: 32,
    height: 20,
  },
  md: {
    width: 40,
    height: 24,
  },
});

const inputSizeStyles = stylex.create({
  sm: {
    width: 32,
    height: 20,
  },
  md: {
    width: 40,
    height: 24,
  },
});

// Every touch value sits in the same property as the mouse value (a nested
// condition), never in a later style: a later style that names a property
// replaces all of it, mouse value included.
const trackSizeStyles = stylex.create({
  sm: {
    width: 32,
    height: 20,
    padding: 2,
  },
  md: {
    width: 40,
    height: 24,
    padding: 4,
  },
});

// The thumb is one circle under any pointer, at each state's size (Switch
// FR4). Under a finger it rests by insets instead of a transform, centered in
// the track's height at each end, so the compositor moves and lifts it with
// translate and scale alone (useSwitchTouch measures the box it renders).
const thumbOffSizeStyles = stylex.create({
  sm: {
    width: 14,
    height: 14,
    insetInlineStart: {default: null, [TOUCH]: 3},
    transform: {
      default: 'translateX(0)',
      [TOUCH]: 'none',
    },
  },
  md: {
    width: 16,
    height: 16,
    insetInlineStart: {default: null, [TOUCH]: 4},
    transform: {
      default: 'translateX(0)',
      [TOUCH]: 'none',
    },
  },
});

const thumbOnSizeStyles = stylex.create({
  sm: {
    width: 16,
    height: 16,
    insetInlineStart: {default: null, [TOUCH]: 'auto'},
    insetInlineEnd: {default: null, [TOUCH]: 2},
    // The thumb rests at the inline-start edge (flex-start, which flexbox
    // already mirrors under RTL). The on-state travel toward the inline-end
    // edge is a physical translateX, so it must flip sign under RTL — right
    // in LTR, left in RTL — so the switch mirrors per convention (Material,
    // iOS): off-thumb on the reading-start side, on-thumb on the reading-end.
    transform: {
      default: 'translateX(12px)',
      ':is([dir="rtl"] *)': {
        default: 'translateX(-12px)',
        [TOUCH]: 'none',
      },
      [TOUCH]: 'none',
    },
  },
  md: {
    width: 20,
    height: 20,
    insetInlineStart: {default: null, [TOUCH]: 'auto'},
    insetInlineEnd: {default: null, [TOUCH]: 2},
    transform: {
      default: 'translateX(14px)',
      ':is([dir="rtl"] *)': {
        default: 'translateX(-14px)',
        [TOUCH]: 'none',
      },
      [TOUCH]: 'none',
    },
  },
});

// The pressed overlay, painted as a gradient layer OVER the track's and
// thumb's own fills so it composes with the on/off colors and the hover tint
// instead of replacing them. Same token Button's overlay paints with. The
// switch is a two-part control whose focusable input sits beside the track,
// so the press is read off the shared scope marker (the row), the way the
// hover tint already is: pressing the input, the track or the label all
// activate the row.
const pressedImage = `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`;

/**
 * The touch press's release: opacity 1 → 0, the same keyframes as a
 * control's release in controlPressLayer.ts (StyleX emits one rule).
 */
const pressLayerRelease = stylex.keyframes({
  from: {opacity: 1},
  to: {opacity: 0},
});

const labelWrapperSizeStyles = stylex.create({
  sm: {
    minHeight: 20,
  },
  md: {
    minHeight: 24,
  },
});

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  // A hidden label is sr-only, so its wrapper is a zero-width flex item — the
  // row gap would still be painted beside the track, making the field box
  // wider than the control it contains. Matches CheckboxInput.
  containerLabelHidden: {
    gap: 0,
  },
  containerSpread: {
    justifyContent: 'space-between',
    width: '100%',
  },
  statusGap: {
    marginTop: spacingVars['--spacing-2'],
  },
  switchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    isolation: 'isolate',
    // Under a finger, horizontal moves are the switch's drag and vertical
    // ones the page's scroll; set in CSS so it holds before hydration
    // (useSwitchTouch.ts).
    touchAction: {
      default: null,
      [TOUCH]: 'pan-y pinch-zoom',
    },
  },
  input: {
    position: 'absolute',
    top: '50%',
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    zIndex: 1,
  },
  // Under a coarse pointer the invisible input, centered on the track, is the
  // 44 × 44 px hit area a finger needs (Switch FR4); nothing visible grows.
  inputCoarse: {
    '@media (pointer: coarse)': {
      minInlineSize: 44,
      minBlockSize: 44,
    },
  },
  inputDisabled: {
    cursor: 'default',
  },
  inputBusy: {
    pointerEvents: 'none',
  },
  track: {
    display: 'flex',
    alignItems: 'center',
    // Under a finger the press layer (::before), the colour fade (::after)
    // and the thumb sit in the track, stacked in a context of the track's own.
    position: {default: null, [TOUCH]: 'relative'},
    isolation: {default: null, [TOUCH]: 'isolate'},
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'background-color',
    // Under a finger the track's fill changes at once and the fade layer
    // crossfades it on the compositor. Reduced motion (design:reduced-motion)
    // comes last so it holds everywhere: under a finger the fade layer
    // carries the colour, and with a mouse the change is immediate.
    transitionDuration: {
      default: durationVars['--duration-fast'],
      [TOUCH]: '0s',
      '@media (prefers-reduced-motion: reduce) and (pointer: coarse)': '0s',
      '@media (prefers-reduced-motion: reduce) and (not (pointer: coarse))':
        '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    boxSizing: 'border-box',
    // Forced colors (Windows High Contrast) strips painted backgrounds, which
    // would leave the track invisible. A system-color border keeps the
    // control's bounds perceivable (WCAG 1.4.11).
    borderWidth: {
      default: 0,
      '@media (forced-colors: active)': '1px',
    },
    borderStyle: {
      default: 'none',
      '@media (forced-colors: active)': 'solid',
    },
    borderColor: {
      default: null,
      '@media (forced-colors: active)': 'CanvasText',
    },
    // Pressed: the overlay rides on top of the on/off fill. Gated like the
    // hover tint so forced colors keeps its system-color track.
    backgroundImage: {
      default: null,
      [stylex.when.ancestor(':active', switchScope)]: {
        default: null,
        '@media (forced-colors: none)': {
          default: pressedImage,
          // Under a coarse pointer the touch press controller writes
          // `data-astryx-press` on the row instead, and the press layer
          // (::before) paints it.
          '@media (pointer: coarse)': 'none',
        },
      },
    },
    // The press, under a finger: a layer over the track's fill and colour
    // fade and under the thumb, present only while the row the press
    // controller writes to is pressed or releasing. Its opacity is the
    // press: on at once, then a control's release (UIButton's clock and
    // curve, shared with controlPressLayer.ts's `control`) that runs
    // on the compositor, so it never sticks while the main thread is busy;
    // under reduced motion the system's cross-fade (design:reduced-motion).
    '::before': {
      content: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="on"]', switchScope)]: {
          default: null,
          [TOUCH]: '""',
        },
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: '""',
        },
      },
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      backgroundColor: {
        default: null,
        '@media (forced-colors: none)': colorVars['--color-overlay-pressed'],
      },
      opacity: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="on"]', switchScope)]: {
          default: null,
          [TOUCH]: 1,
        },
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: 0,
        },
      },
      animationName: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: pressLayerRelease,
        },
      },
      animationDuration: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: {
            // UIButton's measured release, the table's internal constant
            // (`button.highlight.releaseMs`, mirrored for the stylesheet and
            // drift-tested): touch motion stays internal (spec:AST-094 DEC-11).
            default: `${controlPressConsts.controlReleaseMs}ms`,
            '@media (prefers-reduced-motion: reduce) and (pointer: coarse)':
              reducedMotionFadeConsts.duration,
          },
        },
      },
      animationTimingFunction: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: {
            default: controlPressConsts.controlReleaseEase,
            '@media (prefers-reduced-motion: reduce) and (pointer: coarse)':
              reducedMotionFadeConsts.easing,
          },
        },
      },
      animationFillMode: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: 'both',
        },
      },
    },
    // The colour fade, under a finger: over the track's own fill (themed in
    // both states), it shows the fill the track is leaving (or, mid-drag,
    // the one it is heading to) and fades it on the compositor. Its colour is
    // the theme's, read from the track (switchFill.ts) into a variable; the
    // animator owns its opacity, and at rest it is clear.
    '::after': {
      content: '""',
      display: {default: 'none', [TOUCH]: 'block'},
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      opacity: 0,
      backgroundColor: 'var(--_switch-fade-fill, transparent)',
      // Its own compositing layer from the start, so its fade runs off the
      // main thread (iOS Safari otherwise animates it on the main thread).
      willChange: {default: null, [TOUCH]: 'opacity'},
    },
  },
  // The one ring in the system not drawn by focusOutlineStyles. The focusable
  // input is the track's preceding sibling, so the condition reads that input
  // through its own marker: a sibling relation, never a `:has()` scan of the
  // row, which would restyle everything under it on any change. A marker
  // cannot be shared across components without leaking focus state from an
  // outer one, so it cannot live in the utility. StyleX also cannot inline a
  // constant imported from another module, so the values are read from the
  // tokens the utility reads.
  trackFocus: {
    outline: {
      default: 'none',
      [stylex.when.siblingBefore(':focus-visible', switchFocusInput)]:
        `${focusVars['--focus-outline-width']} ${focusVars['--focus-outline-style']} ${focusVars['--focus-outline-color']}`,
    },
    outlineOffset: {
      default: null,
      [stylex.when.siblingBefore(':focus-visible', switchFocusInput)]:
        focusVars['--focus-outline-offset'],
    },
  },
  // State-dependent colors with ancestor hover behavior
  trackOff: {
    backgroundColor: {
      default: colorVars['--color-background-gray'],
      // Off = empty (Canvas) track; on = Highlight track, so the two states
      // stay distinguishable under forced colors.
      '@media (forced-colors: active)': 'Canvas',
      // The ancestor-hover tint is a non-system color-mix, and its rule
      // outranks the plain forced-colors rule above. Left ungated it would
      // reassert on hover under forced colors, where the UA flattens the
      // color-mix back to Canvas — so the HighlightText thumb would sit on a
      // white track (white-on-white). Gating on `forced-colors: none` keeps
      // the tint out of forced colors and lets the system-color track stand.
      [stylex.when.ancestor(':hover', switchScope)]: {
        '@media (hover: hover) and (forced-colors: none)': `color-mix(in srgb, ${colorVars['--color-background-gray']}, ${colorVars['--color-tint-hover']} 5%)`,
      },
    },
  },
  trackOn: {
    backgroundColor: {
      default: colorVars['--color-accent'],
      '@media (forced-colors: active)': 'Highlight',
      // See trackOff: gate the hover tint out of forced colors so it cannot
      // flatten the Highlight track to white under the HighlightText thumb.
      [stylex.when.ancestor(':hover', switchScope)]: {
        '@media (hover: hover) and (forced-colors: none)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  trackDisabled: {
    opacity: 0.5,
    // Opacity dimming does not survive forced colors; GrayText is the
    // platform's disabled affordance there.
    borderColor: {
      default: null,
      '@media (forced-colors: active)': 'GrayText',
    },
  },
  trackDisabledOff: {
    backgroundColor: colorVars['--color-background-gray'],
  },
  thumb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-full'],
    // Under a finger it sits in the track, centered in its height, above the
    // track's colour fade (::after) and press layer (::before), and
    // useSwitchTouch moves and lifts it on the compositor: nothing of its
    // own transitions.
    position: {default: null, [TOUCH]: 'absolute'},
    insetBlock: {default: null, [TOUCH]: 0},
    marginBlock: {default: null, [TOUCH]: 'auto'},
    zIndex: {default: null, [TOUCH]: 2},
    pointerEvents: {default: null, [TOUCH]: 'none'},
    transitionProperty: {
      default: 'transform, width, height',
      [TOUCH]: 'none',
    },
    // Under reduced motion nothing slides: under a finger the thumb
    // cross-fades through the animator, and with a mouse it moves at once.
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce) and (pointer: coarse)': '0s',
      '@media (prefers-reduced-motion: reduce) and (not (pointer: coarse))':
        '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    // The lifted shadow, under a finger: the theme's elevation on a layer the
    // thumb's size, faded in with the lift on the compositor (useSwitchTouch
    // owns its opacity). At rest it is clear.
    // The press on the thumb too, under a finger (design:user-states DR1:
    // track and thumb both paint the pressed overlay): the same layer as the
    // track's, over the thumb's fill.
    '::before': {
      content: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="on"]', switchScope)]: {
          default: null,
          [TOUCH]: '""',
        },
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: '""',
        },
      },
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      backgroundColor: {
        default: null,
        '@media (forced-colors: none)': colorVars['--color-overlay-pressed'],
      },
      opacity: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="on"]', switchScope)]: {
          default: null,
          [TOUCH]: 1,
        },
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: 0,
        },
      },
      animationName: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: pressLayerRelease,
        },
      },
      animationDuration: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: {
            // UIButton's measured release, the table's internal constant
            // (`button.highlight.releaseMs`, mirrored for the stylesheet and
            // drift-tested): touch motion stays internal (spec:AST-094 DEC-11).
            default: `${controlPressConsts.controlReleaseMs}ms`,
            '@media (prefers-reduced-motion: reduce) and (pointer: coarse)':
              reducedMotionFadeConsts.duration,
          },
        },
      },
      animationTimingFunction: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: {
            default: controlPressConsts.controlReleaseEase,
            '@media (prefers-reduced-motion: reduce) and (pointer: coarse)':
              reducedMotionFadeConsts.easing,
          },
        },
      },
      animationFillMode: {
        default: null,
        [stylex.when.ancestor('[data-astryx-press="fading"]', switchScope)]: {
          default: null,
          [TOUCH]: 'both',
        },
      },
    },
    '::after': {
      content: '""',
      display: {default: 'none', [TOUCH]: 'block'},
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      opacity: 0,
      boxShadow: shadowVars['--shadow-low'],
      willChange: {default: null, [TOUCH]: 'opacity'},
    },
    // Pressed with a mouse: the same overlay as the track, so the whole
    // control darkens rather than the thumb standing out against a darker
    // track. Under a finger the track's press layer paints under the thumb,
    // which lifts.
    backgroundImage: {
      default: null,
      [stylex.when.ancestor(':active', switchScope)]: {
        default: null,
        '@media (forced-colors: none)': {
          default: pressedImage,
          '@media (pointer: coarse)': 'none',
        },
      },
    },
  },
  // The thumb fill lives on the on/off styles (not the shared thumb style)
  // because forced colors needs a per-state system color: CanvasText on the
  // empty off track, HighlightText on the Highlight on track. Sizing stays in
  // thumbOffSizeStyles/thumbOnSizeStyles; only the fill is state-dependent.
  thumbOff: {
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      '@media (forced-colors: active)': 'CanvasText',
    },
  },
  thumbOn: {
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      '@media (forced-colors: active)': 'HighlightText',
    },
  },
  // ---------------------------------------------------------------------
  // Under a finger the track keeps its own fill (the theme's) and a layer
  // over it fades the outgoing fill out on the compositor. The thumb is a
  // constant-size capsule in a box that useSwitchTouch moves and lifts on the
  // compositor (translate / scale / opacity only), as UISwitch's (iOS 26.2).
  // The thumb is the circle a mouse sees, at each state's size, resting at
  // its inset from its own end (the size styles above). Where a touch value
  // shares a property with the mouse (the fade; the thumb's place, travel and
  // transition) it is a nested condition of that property above; the parts
  // below exist only under a finger.
  // ---------------------------------------------------------------------
  // The fade layer: over the track's own fill (themed in both states), it
  // shows the fill the track is leaving (or, mid-drag, the one it is heading
  // to) and fades it on the compositor. Its colour is the theme's, read from
  // the track (switchFill.ts) and set inline; at rest it is clear. The
  // animator owns its opacity, so it has no transition of its own.
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  description: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
});

export type SwitchLabelPosition = 'start' | 'end';

export type SwitchLabelSpacing = 'hug' | 'spread';

export interface SwitchProps extends Omit<BaseProps, 'onChange'> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Label text for the switch (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed below the label.
   */
  description?: string;
  /**
   * Callback fired when the switch state changes.
   */
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Async action on change. Fires after onChange if not prevented.
   */
  changeAction?: (
    checked: boolean,
    e: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  /**
   * Whether the switch is in a loading state.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the switch is on or off.
   */
  value: boolean;
  /**
   * Whether the switch is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * The HTML name attribute for the underlying checkbox input.
   * Useful for form submissions.
   */
  htmlName?: string;

  /**
   * Explains why the switch is disabled. When set together with `isDisabled`,
   * the switch shows a tooltip with this text on hover and keyboard focus, and
   * the control stays focusable (via `aria-disabled`) so the reason is
   * discoverable by keyboard and assistive technology. Activation stays
   * blocked.
   *
   * Use this instead of wrapping a disabled switch in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <Switch
   *   label="Enable notifications"
   *   value={enabled}
   *   isDisabled
   *   disabledMessage="Notifications are turned off org-wide"
   * />
   * ```
   */
  disabledMessage?: string;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the switch is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Callback fired when the switch receives focus.
   */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the switch loses focus.
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: ReactNode | IconType;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Which side of the switch the label appears on.
   * - 'start': Label appears before the switch
   * - 'end': Label appears after the switch
   * @default 'end'
   */
  labelPosition?: SwitchLabelPosition;
  /**
   * Spacing behavior between label and switch.
   * - 'hug': Label and switch are positioned next to each other
   * - 'spread': Label and switch are pushed to opposite ends
   * @default 'hug'
   */
  labelSpacing?: SwitchLabelSpacing;
  /**
   * Status indicator for the switch.
   * When set with a message, displays a colored message box below the switch.
   */
  status?: InputStatus;
  /**
   * Size variant controlling track and thumb dimensions.
   * - 'sm': 32x20px (matches sm checkbox/radio vertical rhythm)
   * - 'md': 40x24px (default, matches md checkbox/radio vertical rhythm)
   * @default 'md'
   */
  size?: 'sm' | 'md';
}

// Dynamic field width (number -> px, string used as-is).
const dynamicWidthStyles = stylex.create({
  width: (width: SizeValue | null) => ({width}),
});

/**
 * A toggle switch component for boolean values.
 *
 * @example
 * ```
 * <Switch
 *   label="Enable notifications"
 *   value={enabled}
 *   onChange={setEnabled}
 * />
 * <Switch
 *   label="Dark mode"
 *   description="Switch to a darker color scheme"
 *   value={darkMode}
 *   onChange={setDarkMode}
 * />
 * ```
 */
export function Switch({
  label,
  isLabelHidden = false,
  description,
  onChange,
  changeAction,
  isLoading = false,
  value,
  isDisabled = false,
  htmlName,
  disabledMessage,
  isOptional = false,
  isRequired = false,
  onFocus,
  onBlur,
  labelIcon,
  labelTooltip,
  labelPosition = 'end',
  labelSpacing = 'hug',
  status,
  size = 'md',
  width,
  xstyle,
  className,
  style,
  ref,
  'aria-describedby': ariaDescribedByProp,
  'aria-labelledby': ariaLabelledByProp,
  ...rest
}: SwitchProps) {
  const t = useTranslator();
  const id = useId();
  // The row is the pressable: the input, the track and the label all sit
  // inside it, and the pressed arms above read the row's scope marker.
  const pressable = usePressFeedback();
  const descriptionID = useId();
  const statusMessageID = useId();
  // Announce the effective required state (form default included) while the
  // native `required` stays bound to the explicit `isRequired` so a layout
  // default never switches on browser validation.
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const announce = useAnnounce();
  // One announcement per busy start (spec:AST-086 FR6). The ref outlives
  // StrictMode's effect replay and rerenders, so only a new busy start (busy
  // again after settling) speaks again.
  const announcedBusyRef = useRef(false);
  useEffect(() => {
    if (!isBusy) {
      announcedBusyRef.current = false;
      return;
    }
    if (announcedBusyRef.current) {
      return;
    }
    announcedBusyRef.current = true;
    announce(t('@astryx.switch.loading'));
  }, [announce, isBusy, t]);

  const isOn = optimisticValue === true;

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the switch row (which already exists) and the
  // native checkbox stays perceivable via aria-disabled instead of the disabled
  // attribute. Toggling is blocked by the isDisabled guard in onChange.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container row is not naturally focusable; focusin bubbles up from the
    // native input, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  // Build aria-describedby from description and status message
  // Only include descriptionID when the element actually renders.
  // FieldLabel renders the description (with descriptionID) even when the
  // label is visually hidden — it's sr-only, so keep it linked.
  // A consumer's own `aria-describedby` describes the control, so it comes
  // first here rather than landing on the field wrapper via `...rest`.
  const describedByParts: string[] = [];
  if (ariaDescribedByProp) {
    describedByParts.push(ariaDescribedByProp);
  }
  if (description) {
    describedByParts.push(descriptionID);
  }
  if (status?.message) {
    describedByParts.push(statusMessageID);
  }
  if (showsDisabledMessage) {
    describedByParts.push(disabledMessageTooltip.describedBy);
  }
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  // The touch presentation (coarse pointer): its parts are always rendered;
  // CSS shows them under a finger and the hook animates and listens there.
  const surfaceRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchParts = useMemo<SwitchTouchParts>(
    () => ({
      surface: surfaceRef,
      input: inputRef,
      thumb: thumbRef,
      track: trackRef,
    }),
    [],
  );
  // The track in a state: its theme target and fill. The other state's, for
  // the fade layer's colour (switchFill.ts).
  const trackPropsFor = (on: boolean) =>
    mergeProps(
      themeProps('switch', {
        checked: on ? 'checked' : null,
        disabled: isDisabled ? 'disabled' : null,
        size,
      }),
      stylex.props(
        styles.track,
        trackSizeStyles[size],
        on ? styles.trackOn : styles.trackOff,
        styles.trackFocus,
        isDisabled && styles.trackDisabled,
        isDisabled && !on && styles.trackDisabledOff,
      ),
    );
  useSwitchTouch(touchParts, {
    isOn,
    isInteractive: !isDisabled && !isBusy,
    isDisabled,
    trackSize: TRACK_SIZE[size],
    otherTrackProps: trackPropsFor(!isOn),
  });

  const switchElement = (
    <div
      ref={surfaceRef}
      {...stylex.props(styles.switchWrapper, wrapperSizeStyles[size])}>
      <input
        ref={useMergedRefs(ref, disabledMessageTooltip.positionRef, inputRef)}
        id={id}
        type="checkbox"
        role="switch"
        // Withhold the name while disabled: the input stays focusable (not
        // natively disabled), and a disabled control must not submit.
        name={isDisabled ? undefined : htmlName}
        checked={isOn}
        // Focusable but detached from the form while disabled (spec:AST-085).
        aria-disabled={isDisabled ? 'true' : undefined}
        form={isDisabled ? '' : undefined}
        required={isRequired}
        aria-required={isEffectivelyRequired ? 'true' : undefined}
        onChange={e => {
          if (isDisabled || isBusy) {
            return;
          }
          const checked = e.target.checked;
          onChange?.(checked, e);
          if (changeAction && !e.defaultPrevented) {
            startTransition(async () => {
              setOptimisticValue(checked);
              await changeAction(checked, e);
            });
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        // A caller's `aria-labelledby` names the control (a visible title
        // elsewhere in the row, for example), so it reaches the input rather
        // than the field wrapper via `...rest`.
        aria-labelledby={ariaLabelledByProp}
        aria-describedby={ariaDescribedBy}
        aria-invalid={status?.type === 'error' ? true : undefined}
        aria-busy={isBusy || undefined}
        {...stylex.props(
          styles.input,
          rtlStyles.centerInline('-50%'),
          styles.inputCoarse,
          inputSizeStyles[size],
          isDisabled && styles.inputDisabled,
          isBusy && styles.inputBusy,
          switchFocusInput,
        )}
      />
      <div ref={trackRef} aria-hidden="true" {...trackPropsFor(isOn)}>
        <div
          ref={thumbRef}
          {...mergeProps(
            themeProps('switch-thumb', {
              checked: isOn ? 'checked' : null,
              size,
            }),
            stylex.props(
              styles.thumb,
              isOn ? thumbOnSizeStyles[size] : thumbOffSizeStyles[size],
              isOn ? styles.thumbOn : styles.thumbOff,
            ),
          )}>
          {isBusy && <Spinner size="sm" />}
        </div>
      </div>
    </div>
  );

  const labelElement = (
    <div {...stylex.props(styles.labelWrapper, labelWrapperSizeStyles[size])}>
      <FieldLabel
        // See CheckboxInput: the control names its own label target rather
        // than the label guessing at its placement.
        {...themeProps('switch-label')}
        label={label}
        inputID={id}
        isLabelHidden={isLabelHidden}
        isDisabled={isDisabled}
        isOptional={isOptional}
        isRequired={isRequired}
        labelIcon={labelIcon}
        labelTooltip={labelTooltip}
        description={description}
        descriptionID={descriptionID}
      />
    </div>
  );

  return (
    <div
      {...mergeProps(
        themeProps('switch-field', {
          labelPosition: labelPosition !== 'end' ? labelPosition : undefined,
          labelSpacing: labelSpacing !== 'hug' ? labelSpacing : undefined,
        }),
        stylex.props(width != null && dynamicWidthStyles.width(width), xstyle),
        className,
        style,
      )}
      {...rest}
      // Native `disabled` suppressed clicks on the switch (spec:AST-085 FR2).
      onClick={isDisabled ? undefined : rest.onClick}>
      <div
        ref={el => {
          // Interaction (hover/focus) listeners for the disabled-message
          // tooltip attach to the whole row for a larger trigger target;
          // positioning anchors on the switch itself (above) so the tooltip
          // appears next to the control, not the far edge of the row.
          // Handlers are gated internally by isEnabled, so attaching
          // unconditionally is safe.
          disabledMessageTooltip.interactionRef(el);
        }}
        {...(isDisabled ? undefined : pressable)}
        // The thumb's drag keeps the row's press painted (user-states DR1).
        {...(isDisabled ? undefined : {[PRESS_HOLDS_DRAG_ATTRIBUTE]: ''})}
        {...stylex.props(
          styles.container,
          isLabelHidden && styles.containerLabelHidden,
          labelSpacing === 'spread' && styles.containerSpread,
          !isDisabled && switchScope,
          // The touch press's strength and release live on the row the
          // controller writes to; the track and thumb inherit and paint it.
          !isDisabled && interactionOverlayStyles.pressedAlpha,
          !isDisabled && switchPressLayerStyles.pressedAlphaLayered,
        )}>
        {' '}
        {/* Keyed, so a labelPosition change moves the nodes instead of
            rebuilding them: the touch controller stays on the input, track
            and thumb it attached to (react-component-runtime INV6). */}
        {labelPosition === 'start'
          ? [
              <Fragment key="label">{labelElement}</Fragment>,
              <Fragment key="switch">{switchElement}</Fragment>,
            ]
          : [
              <Fragment key="switch">{switchElement}</Fragment>,
              <Fragment key="label">{labelElement}</Fragment>,
            ]}
      </div>
      {status?.message && (
        <FieldStatus
          type={status.type}
          message={status.message}
          id={statusMessageID}
          variant="detached"
          xstyle={styles.statusGap}
        />
      )}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </div>
  );
}

Switch.displayName = 'Switch';

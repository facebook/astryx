// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NumberInput.tsx
 * @input Uses React, useId, useState, useMemo, useCallback, Field, Icon, InputGroupContext
 * @output Exports NumberInput component, NumberInputProps
 * @position Core implementation; consumed by index.ts, tested by NumberInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/NumberInput/numberParser.ts (locale-aware parsing)
 * - /packages/core/src/NumberInput/numberInputCommit.ts (draft commit policy)
 * - /packages/core/src/NumberInput/NumberInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/NumberInput/NumberInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/NumberInput/index.ts (exports if types change)
 * - /apps/storybook/stories/NumberInput.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/NumberInput/ (showcase blocks)
 */

import {
  use,
  useId,
  useState,
  useMemo,
  useCallback,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  sizeVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {
  Field,
  InputClearButton,
  type InputStatus,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
  type FieldStatusVariant,
} from '../Field';
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {VisuallyHidden} from '../VisuallyHidden';
import {useTooltip} from '../Tooltip';
import {getInputARIA} from '../utils';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {useStepperTouch} from './NumberInputTouch';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {observeResize} from '../utils/sharedResizeObserver';
import {useTouchPresentation} from '../utils/touchPresentation';
import {inputDisabledFocusStyles} from '../Field/inputDisabledFocus';
import {useSize} from '../SizeContext/SizeContext';
import {useInputContainer} from '../hooks/useInputContainer';
import {useInputStatusIcon} from '../hooks/useInputStatusIcon';
import {useResolvedRequired} from '../hooks/useResolvedRequired';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {InputGroupInternalContext} from '../InputGroup/InputGroupInternalContext';

// Public padding tokens for the `number-input` theme target. A theme writes an
// ordinary `padding` (in ANY spelling — the shorthand, `paddingBlock`, or a
// single `paddingBlockStart`) and the pipeline's `container` expansion parses
// it and emits these normalized per-side tokens; the wrapper and the stepper
// column both read them, so the column tracks whatever the theme sets instead
// of assuming the default. Routing through the shared expansion rather than a
// hand-rolled property→var mapping is what makes every spelling work: a
// mapping only fires for the exact property name it names.
//
// Read order per level: `var(--astryx-…, <next level>)`, terminating at the
// shared field defaults (NOT the container default --spacing-4, which is a
// layout metric and would resize every themed field). Built as chained const
// strings — no function calls — so StyleX can statically analyze them; same
// shape as the card/section/dialog chains in Layout/container.stylex.ts.
const FIELD_PAD_BLOCK = spacingVars['--spacing-1'];
const FIELD_PAD_INLINE = spacingVars['--spacing-2'];
const padBlockAll = `var(--astryx-number-input-padding, ${FIELD_PAD_BLOCK})`;
const padInlineAll = `var(--astryx-number-input-padding, ${FIELD_PAD_INLINE})`;
const padInline = `var(--astryx-number-input-padding-inline, ${padInlineAll})`;
const padInlineStart = `var(--astryx-number-input-padding-inline-start, ${padInline})`;
const padInlineEnd = `var(--astryx-number-input-padding-inline-end, ${padInline})`;
const padBlockStart = `var(--astryx-number-input-padding-block-start, ${padBlockAll})`;
const padBlockEnd = `var(--astryx-number-input-padding-block-end, ${padBlockAll})`;

// A coarse primary pointer: the touch presentation resolver's TOUCH_QUERY
// (utils/touchPresentation.ts) as a StyleX media key, so the touch control
// paints before hydration on every touch device, iOS and Android alike.
// Spelled as a literal: the StyleX build gives an imported at-rule key a
// different priority than its literal, which reorders the cascade;
// NumberInput.stepperLook.test.tsx keeps it equal to TOUCH_QUERY.
const TOUCH = '@media (pointer: coarse)';
// UIStepper's glyphs (motion/uikit/stepper.ts `look`): 13pt paths with
// 1.67pt strokes, as SVG masks for the touch control's halves.
const TOUCH_GLYPH_MINUS_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 13'%3E%3Cpath d='M0 6.5H13' stroke='black' stroke-width='1.67'/%3E%3C/svg%3E\")";
const TOUCH_GLYPH_PLUS_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 13'%3E%3Cpath d='M0 6.5H13M6.5 0V13' stroke='black' stroke-width='1.67'/%3E%3C/svg%3E\")";
// The narrowest Field box the touch control fits in: the control (94 px), the
// gap and an input box that still shows a few digits. A narrower field keeps
// the column inside its box.
const TOUCH_CONTROL_MIN_FIELD_WIDTH = 170;

const styles = stylex.create({
  wrapper: {
    zIndex: 1,
    // Applied per side rather than through the shared field base's
    // `paddingBlock`/`paddingInline` shorthands, because the stepper column
    // has to cancel the block padding edge by edge — an asymmetric
    // `paddingBlock: 4px 12px` needs two different negative margins.
    paddingBlockStart: padBlockStart,
    paddingBlockEnd: padBlockEnd,
    paddingInlineStart: padInlineStart,
    paddingInlineEnd: padInlineEnd,
  },
  wrapperWithNumberSteppers: {
    paddingInlineEnd: 0,
  },
  // Under a finger the steppers leave the field (numberSteppersTouch): the
  // input box takes its own end padding back, and the Field box gives up the
  // control's width and a gap at its inline end (fieldWithTouchSteppers), so
  // the input box and an attached status under it end at the same edge.
  wrapperWithTouchSteppers: {
    paddingInlineEnd: {default: 0, [TOUCH]: padInlineEnd},
  },
  fieldWithTouchSteppers: {
    paddingInlineEnd: {
      default: 0,
      [TOUCH]: `calc(94px + ${spacingVars['--spacing-2']})`,
    },
  },
  input: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-family-body'],
    // The 16px floor is iOS-only: iOS Safari zooms the page when a focused
    // control sits under 16px, and only iOS WebKit implements
    // -webkit-touch-callout to key the coarse-pointer floor to it.
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': {
        '@supports (-webkit-touch-callout: none)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
      },
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
  inputDisabled: {
    cursor: 'default',
  },
  inputInvalid: {
    color: colorVars['--color-text-secondary'],
  },
  units: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-secondary'],
    flexShrink: 0,
  },
  numberSteppers: {
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    width: spacingVars['--spacing-4'],
    // Cancel the wrapper's block padding edge by edge so the column spans the
    // field's full height. Reading the same tokens the wrapper applies is what
    // keeps it flush under a themed padding — including an asymmetric one,
    // where a single `marginBlock` would be wrong at one end.
    marginBlockStart: `calc(-1 * ${padBlockStart})`,
    marginBlockEnd: `calc(-1 * ${padBlockEnd})`,
    borderInlineStartWidth: borderVars['--border-width'],
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border-emphasized'],
    overflow: 'hidden',
    borderStartEndRadius: 'var(--_field-radius)',
    borderEndEndRadius: 'var(--_field-radius)',
    // No touch-action, selection or touch-target style of its own: where the
    // primary pointer is coarse the gesture host gives the column's kept press
    // `touch-action: manipulation` (`spec:AST-094` FR18) and its selection
    // lock (FR41); a fine pointer keeps the browser's defaults (FR19). Each
    // half keeps its own size: the theme's touch target is not for spin
    // buttons.
  },
  // Every default here is a value, never null: a null default would erase the
  // same property of a style merged before it (the column's base, an icon's
  // own display) wherever the gate does not match. The ones the base does not
  // set are their CSS initial values.
  // Under a finger (TOUCH above), on iOS and Android alike, the steppers are
  // one control beside the field, shaped like iOS 26's UIStepper
  // (motion/uikit/stepper.ts `look`): a 94 px wide capsule of the theme's
  // neutral fill at the field size's element height (md: UIKit's 32), − at
  // the inline start and + at the inline end, and a 1 px divider 4 px from
  // the top and the bottom. StyleX inlines only same-file values, so the
  // table's numbers are spelled here; NumberInput.stepperLook.test.tsx keeps
  // them equal.
  numberSteppersTouch: {
    position: {default: 'static', [TOUCH]: 'absolute'},
    insetInlineStart: {
      default: 'auto',
      [TOUCH]: `calc(100% + ${borderVars['--border-width']} + ${spacingVars['--spacing-2']})`,
    },
    // Centred on the field at any height: pinned top and bottom, auto margins.
    insetBlockStart: {default: 'auto', [TOUCH]: 0},
    insetBlockEnd: {default: 'auto', [TOUCH]: 0},
    // The increment button comes first in the DOM: a reversed row puts it at
    // the inline end, so − is at the inline start and + at the end, mirrored
    // in a right-to-left page (design:bidirectionality DR3).
    flexDirection: {default: 'column', [TOUCH]: 'row-reverse'},
    width: {
      default: spacingVars['--spacing-4'],
      [TOUCH]: '94px',
    },
    // The field's size sets the height (the component-size rules): md is
    // UIKit's 32; touchControlSm and touchControlLg take theirs.
    height: {default: 'auto', [TOUCH]: sizeVars['--size-element-md']},
    marginBlockStart: {
      default: `calc(-1 * ${padBlockStart})`,
      [TOUCH]: 'auto',
    },
    marginBlockEnd: {
      default: `calc(-1 * ${padBlockEnd})`,
      [TOUCH]: 'auto',
    },
    borderInlineStartWidth: {
      default: borderVars['--border-width'],
      [TOUCH]: 0,
    },
    borderStartStartRadius: {
      default: 0,
      [TOUCH]: '9999px',
    },
    borderStartEndRadius: {
      default: 'var(--_field-radius)',
      [TOUCH]: '9999px',
    },
    borderEndStartRadius: {default: 0, [TOUCH]: '9999px'},
    borderEndEndRadius: {
      default: 'var(--_field-radius)',
      [TOUCH]: '9999px',
    },
    backgroundColor: {
      default: 'transparent',
      [TOUCH]: colorVars['--color-neutral'],
    },
    // Forced colors repaint that fill as Canvas: an outline keeps the
    // control's edge. Defaults are CSS initial values, so no base is erased.
    outlineStyle: {
      default: 'none',
      [TOUCH]: {default: 'none', '@media (forced-colors: active)': 'solid'},
    },
    outlineWidth: {
      default: 'medium',
      [TOUCH]: {default: 'medium', '@media (forced-colors: active)': '1px'},
    },
    outlineColor: {
      default: 'currentColor',
      [TOUCH]: {
        default: 'currentColor',
        '@media (forced-colors: active)': 'CanvasText',
      },
    },
    '::after': {
      content: {default: 'none', [TOUCH]: '""'},
      position: 'absolute',
      insetBlockStart: '4px',
      insetBlockEnd: '4px',
      insetInlineStart: 'calc(50% - 0.5px)',
      width: '1px',
      // Forced colors repaint backgrounds as Canvas: the divider, drawn as
      // one, opts out and takes the text colour.
      backgroundColor: {
        default: colorVars['--color-track'],
        '@media (forced-colors: active)': 'CanvasText',
      },
      forcedColorAdjust: {
        default: 'auto',
        '@media (forced-colors: active)': 'none',
      },
      pointerEvents: 'none',
    },
  },
  // The touch control at the sm and lg field sizes (md: numberSteppersTouch).
  touchControlSm: {
    height: {default: 'auto', [TOUCH]: sizeVars['--size-element-sm']},
  },
  touchControlLg: {
    height: {default: 'auto', [TOUCH]: sizeVars['--size-element-lg']},
  },
  numberStepperButton: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    color: colorVars['--color-icon-secondary'],
    backgroundColor: colorVars['--color-background-surface'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    outline: 'none',
  },
  // Each half of the touch control: transparent over the capsule, so the
  // press paint darkens just that half, with the glyph in the primary icon
  // colour.
  numberStepperButtonTouch: {
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      [TOUCH]: 'transparent',
    },
    color: {
      default: colorVars['--color-icon-secondary'],
      [TOUCH]: colorVars['--color-icon-primary'],
    },
  },
  // UIKit draws a disabled half's glyph in the divider's colour.
  numberStepperButtonDisabledTouch: {
    color: {
      default: colorVars['--color-icon-disabled'],
      [TOUCH]: colorVars['--color-track'],
    },
    '::before': {
      backgroundColor: {
        default: 'currentColor',
        '@media (forced-colors: active)': 'GrayText',
      },
    },
  },
  decrementButtonTouch: {
    borderBlockStartWidth: {
      default: borderVars['--border-width'],
      [TOUCH]: 0,
    },
  },
  // The column's chevrons, hidden under a finger for the touch control's
  // glyphs. Set on the icon itself; its default is the icon's own display
  // (inline-flex), so nothing of the icon's base style is erased.
  chevronNotTouch: {
    display: {default: 'inline-flex', [TOUCH]: 'none'},
  },
  // UIKit's glyphs, drawn under a finger only, as each half's own decoration
  // (the half's label names it, so no element of its own): the 13pt vector
  // glyph as a mask over the half's glyph colour, so its 1.67pt strokes keep
  // their weight at every pixel ratio (a box that thin snaps to whole device
  // pixels).
  touchGlyph: {
    position: {default: 'static', [TOUCH]: 'relative'},
    '::before': {
      content: {default: 'none', [TOUCH]: '""'},
      position: 'absolute',
      insetBlockStart: 'calc(50% - 6.5px)',
      insetInlineStart: 'calc(50% - 6.5px)',
      width: '13px',
      height: '13px',
      // Forced colors repaint backgrounds as Canvas: the glyph, drawn as one,
      // opts out and takes the text colour (GrayText at a bound).
      backgroundColor: {
        default: 'currentColor',
        '@media (forced-colors: active)': 'CanvasText',
      },
      forcedColorAdjust: {
        default: 'auto',
        '@media (forced-colors: active)': 'none',
      },
      maskRepeat: 'no-repeat',
      maskSize: '13px 13px',
      pointerEvents: 'none',
    },
  },
  touchGlyphMinus: {
    '::before': {maskImage: TOUCH_GLYPH_MINUS_MASK},
  },
  touchGlyphPlus: {
    '::before': {maskImage: TOUCH_GLYPH_PLUS_MASK},
  },
  numberStepperButtonDisabled: {
    color: colorVars['--color-icon-disabled'],
    cursor: 'default',
    backgroundImage: 'none',
  },
  decrementButton: {
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border-emphasized'],
  },
  incrementIcon: {
    transform: 'rotate(180deg)',
  },
  // The touch control's outer corners, on each half, so a pressed half's
  // paint keeps the capsule's shape on its own. − is at the inline start and
  // + at the inline end in either direction (numberSteppersTouch), so logical
  // corners mirror with the page; 9999px is clamped to half the height.
  incrementTouchCorners: {
    borderStartStartRadius: {default: 0, [TOUCH]: 0},
    borderEndStartRadius: {default: 0, [TOUCH]: 0},
    borderStartEndRadius: {default: 0, [TOUCH]: '9999px'},
    borderEndEndRadius: {default: 0, [TOUCH]: '9999px'},
  },
  decrementTouchCorners: {
    borderStartStartRadius: {default: 0, [TOUCH]: '9999px'},
    borderEndStartRadius: {default: 0, [TOUCH]: '9999px'},
    borderStartEndRadius: {default: 0, [TOUCH]: 0},
    borderEndEndRadius: {default: 0, [TOUCH]: 0},
  },
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

export type NumberInputSize = keyof typeof sizeStyles;

import {groupStyles, inputGroupItemProps} from '../InputGroup/groupStyles';

// Re-export shared types for convenience

export type {
  InputStatus as NumberInputStatus,
  InputStatusType as NumberInputStatusType,
} from '../Field';
import {isImeKeyEvent, mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {
  type FieldInputBaseProps,
  useFieldInputStyling,
} from '../Field/fieldParts';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {useTranslator, useLocale} from '../i18n';
import {formatEditableNumber} from './numberParser';
import {TOUCH_QUERY} from '../utils/touchPresentation';
import {parseNumberInput, resolveNumberInputCommit} from './numberInputCommit';

interface NumberInputPropsBase extends Omit<
  FieldInputBaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Label text for the input (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed between the label and input.
   */
  description?: string;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the input is read-only.
   * The value is shown at full opacity and still submits with the form, but
   * cannot be edited. Unlike `isDisabled`, a read-only input is not dimmed and
   * keeps its form value — use it for a value the user should see and send
   * but not change. Stepping is off in every form while read-only: arrow keys,
   * the wheel, and the number steppers. `isDisabled` takes precedence when both
   * are set.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Explains why the input is disabled. When set together with `isDisabled`,
   * the input shows a tooltip with this text on hover and keyboard focus, and
   * stays focusable (via `aria-disabled`) so the reason is discoverable by
   * keyboard and assistive technology. The field cannot be edited (it becomes
   * read-only) while disabled.
   *
   * Use this instead of wrapping a disabled input in `Tooltip`, so the reason
   * is attached to the field itself.
   *
   * @example
   * ```
   * <NumberInput
   *   label="Quantity"
   *   value={quantity}
   *   isDisabled
   *   disabledMessage="Editing is locked while the order is processing"
   * />
   * ```
   */
  disabledMessage?: string;
  /**
   * Icon to display at the start of the input.
   * Accepts a ReactNode (e.g. `<Icon icon={SearchIcon} />`) or an SVG icon component directly.
   */
  startIcon?: ReactNode | IconType;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: ReactNode | IconType;
  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a floating message box below the input.
   */
  status?: InputStatus;
  /**
   * How the status message is placed relative to the input.
   * - 'attached': message overlaps directly below the input (bordered treatment)
   * - 'detached': message floats below as a separate element with spacing
   * - 'tooltip': no message box; the status icon becomes a focusable info-tip button that reveals the message on hover, keyboard focus, or tap
   * @default 'attached'
   */
  statusVariant?: FieldStatusVariant;
  /**
   * The size of the input.
   * - 'sm': Compact size (28px height)
   * - 'md': Default size (32px height)
   * - 'lg': Large size (36px height)
   * @default 'md'
   */
  size?: NumberInputSize;
  // onChange and hasClear defined in discriminated union below
  /**
   * The current value of the input.
   * Use null or undefined to represent an empty/unset value.
   */
  value: number | null | undefined;
  /**
   * Placeholder text shown when the input is empty.
   */
  placeholder?: string;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `controlXstyle`/`controlClassName`/`controlStyle`.
   */
  width?: SizeValue;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Whether to automatically focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * The HTML name attribute for the input.
   * Useful for form submissions.
   */
  htmlName?: string;
  /**
   * The HTML autocomplete attribute for the input.
   */
  autoComplete?: string;
  /**
   * The minimum value allowed.
   * A smaller entry commits at this value on blur or Enter.
   */
  min?: number | null;
  /**
   * The maximum value allowed.
   * A larger entry commits at this value on blur or Enter.
   */
  max?: number | null;
  /**
   * The step increment for the input.
   * @default 1
   */
  step?: number | null;
  /**
   * Formats the committed value while the input is not being edited.
   * The raw numeric value is shown on focus so it remains editable.
   */
  formatValue?: (value: number) => string;
  /**
   * Whether scrolling the wheel over a focused input steps the value.
   * @default true
   */
  isWheelEnabled?: boolean;
  /**
   * Whether to show increment and decrement buttons at the end of the input.
   * @default false
   */
  hasNumberSteppers?: boolean;
  /**
   * Units text to display at the end of the input (e.g., "%" or "GB").
   */
  units?: string | null;
  /**
   * Whether to only allow integer values (no floating point).
   * @default false
   */
  isIntegerOnly?: boolean;
  /**
   * Callback fired when the input receives focus.
   */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the input loses focus.
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the user presses the Enter key.
   */
  onEnter?: () => void;
  /**
   * Callback fired on keydown events on the input.
   */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Without `hasClear`, onChange only receives valid numbers.
 * With `hasClear`, onChange also receives `null` when the user clears the input.
 */
type NumberInputPropsNonClearable = NumberInputPropsBase & {
  hasClear?: false;
  onChange: (value: number) => void;
};

type NumberInputPropsClearable = NumberInputPropsBase & {
  /**
   * Whether to show a clear button when a value is set.
   * When clicked, resets the value to null and returns focus to the input.
   *
   * When enabled, the `onChange` callback type widens to also accept `null`,
   * signaling that the user cleared the input.
   */
  hasClear: true;
  onChange: (value: number | null) => void;
};

export type NumberInputProps =
  NumberInputPropsNonClearable | NumberInputPropsClearable;

type StepDirection = -1 | 1;

function getDecimalPlaces(value: number): number {
  const [coefficient, exponentText] = String(value).toLowerCase().split('e');
  const fractionLength = coefficient.split('.')[1]?.length ?? 0;
  const exponent = exponentText == null ? 0 : Number(exponentText);
  return Math.max(0, fractionLength - exponent);
}

function getEffectiveStep(
  step: number | null | undefined,
  isIntegerOnly: boolean,
): number {
  if (
    step == null ||
    !Number.isFinite(step) ||
    step <= 0 ||
    (isIntegerOnly && !Number.isInteger(step))
  ) {
    return 1;
  }
  return step;
}

function getSteppedValue({
  currentValue,
  direction,
  min,
  max,
  step,
  isIntegerOnly,
}: {
  currentValue: number | null;
  direction: StepDirection;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  isIntegerOnly: boolean;
}): number | null {
  const effectiveStep = getEffectiveStep(step, isIntegerOnly);
  const stepBase =
    min != null && (!isIntegerOnly || Number.isInteger(min)) ? min : 0;

  let nextValue: number;
  if (currentValue == null) {
    nextValue = direction === 1 ? (min ?? 0) : (max ?? 0);
    if (isIntegerOnly) {
      nextValue =
        direction === 1 ? Math.ceil(nextValue) : Math.floor(nextValue);
    }
  } else {
    const stepPosition = (currentValue - stepBase) / effectiveStep;
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(stepPosition)) * 4;
    const nextStepPosition =
      direction === 1
        ? Math.floor(stepPosition + tolerance) + 1
        : Math.ceil(stepPosition - tolerance) - 1;
    nextValue = stepBase + nextStepPosition * effectiveStep;
  }

  const precision = Math.min(
    12,
    Math.max(getDecimalPlaces(effectiveStep), getDecimalPlaces(stepBase)),
  );
  nextValue = Number(nextValue.toFixed(precision));

  // Clamp after rounding so a bound with finer precision than the step cannot
  // be rounded back out of its own range.
  if (min != null) {
    nextValue = Math.max(min, nextValue);
  }
  if (max != null) {
    nextValue = Math.min(max, nextValue);
  }

  if (!Number.isFinite(nextValue)) {
    return currentValue;
  }
  if (isIntegerOnly && !Number.isInteger(nextValue)) {
    return currentValue;
  }
  return Object.is(nextValue, -0) ? 0 : nextValue;
}

/** Whether the primary pointer is coarse (a phone, a tablet). */
function isCoarsePrimaryPointer(view: Window | null): boolean {
  return (
    view != null &&
    typeof view.matchMedia === 'function' &&
    view.matchMedia(TOUCH_QUERY).matches
  );
}

/**
 * A number input component for collecting numeric user input.
 * Commits text edits on blur or Enter and only calls onChange when the whole
 * draft passes validation.
 *
 * @example
 * ```
 * <NumberInput label="Quantity" value={quantity} onChange={setQuantity} />
 * <NumberInput label="Price" value={price} onChange={setPrice} min={0} step={0.01} />
 * ```
 */
export function NumberInput({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled: isDisabledProp = false,
  isReadOnly = false,
  disabledMessage,
  startIcon,
  labelIcon,
  status,
  statusVariant = 'attached',
  size: sizeProp,
  onChange,
  value,
  placeholder,
  labelTooltip,
  hasAutoFocus = false,
  htmlName,
  autoComplete,
  min,
  max,
  step,
  formatValue,
  isWheelEnabled = true,
  hasNumberSteppers = false,
  units,
  isIntegerOnly = false,
  onFocus,
  onBlur,
  hasClear,
  onEnter,
  onKeyDown,
  width,
  containerXstyle,
  containerClassName,
  containerStyle,
  controlXstyle,
  controlClassName,
  controlStyle,
  ref,
  id: idProp,
  'aria-describedby': ariaDescribedByProp,
  ...restProps
}: NumberInputProps) {
  const {rest, container, hasFieldBox} = useFieldInputStyling(
    'NumberInput',
    restProps,
    {
      containerXstyle,
      containerClassName,
      containerStyle,
    },
  );
  const t = useTranslator();
  const locale = useLocale();
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});
  const size = useSize(sizeProp, 'md');
  const generatedID = useId();
  const id = idProp ?? generatedID;
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const unitsID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputGroup = useInputGroup();
  const inputGroupState = use(InputGroupInternalContext);
  const isDisabled = isDisabledProp || inputGroupState.isDisabled;

  // Pending input while user is typing (null = show formatted value)
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  // The value a stepper press has stepped to, shown while the press lasts;
  // the press commits it once, at its release (NumberInputTouch.tsx).
  const [pressValue, setPressValue] = useState<number | null>(null);

  // Disabled-reason tooltip. The tooltip listeners attach to the input container (which already exists) and
  // the input stays perceivable via aria-disabled instead of the native
  // disabled attribute. The field is made read-only so it can't be typed into,
  // and value mutation is blocked by the isDisabled guard in the handlers.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  // A disabled field keeps its tab stop but, like a natively disabled one,
  // runs no caller event handler other than focus and blur (`spec:AST-085` FR2).
  const fieldProps = isDisabled
    ? Object.fromEntries(
        Object.entries(rest).filter(
          ([key]) => !/^on[A-Z]/.test(key) || /^on(Focus|Blur)/.test(key),
        ),
      )
    : rest;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container div is not naturally focusable; focusin bubbles up from
    // the input, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  const {statusIcon, describedBy: statusTooltipDescribedBy} =
    useInputStatusIcon({
      status,
      statusVariant,
      isInGroup: !!inputGroup,
    });

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelID,
    [
      description ? descriptionID : null,
      // The status message element is rendered by Field, which is skipped
      // inside an InputGroup — only reference it when it actually exists.
      !inputGroup && statusVariant !== 'tooltip' && status?.message
        ? statusMessageID
        : null,
      // The tooltip variant renders no message box; describe the input by the
      // tooltip's content instead so the status is still announced.
      statusTooltipDescribedBy,
      units ? unitsID : null,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    inputGroup,
  );

  const parseInput = useCallback(
    (text: string) => parseNumberInput(text, {min, max, isIntegerOnly, locale}),
    [isIntegerOnly, locale, max, min],
  );

  const formattedValue = useMemo(() => {
    if (value == null) {
      return '';
    }
    return formatValue?.(value) ?? String(value);
  }, [formatValue, value]);

  // Preserve pending text while editing. Otherwise show the formatted value
  // at rest and the raw numeric value while focused so it remains editable.
  const displayValue = useMemo(() => {
    if (pressValue !== null) {
      return isFocused
        ? formatEditableNumber(pressValue, locale)
        : (formatValue?.(pressValue) ?? String(pressValue));
    }
    if (pendingInput !== null) {
      return pendingInput;
    }
    if (value == null) {
      return '';
    }
    return isFocused ? formatEditableNumber(value, locale) : formattedValue;
  }, [
    formatValue,
    formattedValue,
    isFocused,
    locale,
    pendingInput,
    pressValue,
    value,
  ]);

  // Check if current pending input is valid (for styling purposes)
  const isInputValid = useMemo(() => {
    if (pendingInput === null || !pendingInput.trim()) {
      return true;
    }
    return parseInput(pendingInput) !== null;
  }, [pendingInput, parseInput]);

  // Keep the whole text edit as a draft until an explicit commit boundary.
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Value can't change while showing a disabled message (the field is
      // read-only and non-native-disabled), but guard the handler too so the
      // pending value never changes.
      if (isDisabled || isReadOnly) {
        return;
      }
      setPendingInput(e.target.value);
    },
    [isDisabled, isReadOnly],
  );

  // Handle focus
  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const commitPendingInput = useCallback(
    (trigger: 'blur' | 'Enter') => {
      if (pendingInput === null) {
        return;
      }
      if (isDisabled) {
        // A field disabled mid-entry commits nothing; its draft is dropped, as
        // a natively disabled field's was (spec:AST-085 FR2).
        setPendingInput(null);
        return;
      }

      const decision = resolveNumberInputCommit(pendingInput, {
        min,
        max,
        isIntegerOnly,
        locale,
        hasClear: !!hasClear,
      });
      if (
        trigger === 'blur' ||
        (decision.type === 'commit' && decision.didClamp)
      ) {
        setPendingInput(null);
      }

      if (decision.type === 'clear') {
        if (hasClear && value != null) {
          onChange(null);
        }
      } else if (decision.type === 'commit' && decision.value !== value) {
        onChange(decision.value);
      }
    },
    [
      hasClear,
      isDisabled,
      isIntegerOnly,
      locale,
      max,
      min,
      onChange,
      pendingInput,
      value,
    ],
  );

  // Blur ends the edit and displays the resulting committed value.
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      commitPendingInput('blur');
      setIsFocused(false);
      onBlur?.(e);
    },
    [commitPendingInput, onBlur],
  );

  const valueForStepping = useMemo(() => {
    if (pendingInput === null) {
      return value ?? null;
    }
    if (pendingInput.trim() === '') {
      return null;
    }
    return parseInput(pendingInput) ?? value ?? null;
  }, [parseInput, pendingInput, value]);

  const getNextValue = useCallback(
    (direction: StepDirection) =>
      getSteppedValue({
        currentValue: valueForStepping,
        direction,
        min,
        max,
        step,
        isIntegerOnly,
      }),
    [isIntegerOnly, max, min, step, valueForStepping],
  );

  const stepValue = useCallback(
    (direction: StepDirection) => {
      // A read-only field is not steppable by any route: keyboard, wheel, or
      // the stepper buttons all land here.
      if (isDisabled || isReadOnly) {
        return;
      }
      const nextValue = getNextValue(direction);
      if (nextValue == null) {
        return;
      }
      setPendingInput(null);
      if (nextValue !== value) {
        onChange(nextValue);
      }
    },
    [getNextValue, isDisabled, isReadOnly, onChange, value],
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (isDisabled) {
        // A read-only field still submits its form on Enter.
        if (e.key === 'Enter') {
          e.preventDefault();
        }
        return;
      }
      // The field is type="text" for formatted display, so an IME can compose
      // into it: Enter commits the candidate and the arrows walk the candidate
      // window. The composing keydown fires before compositionend, so without
      // this guard those keystrokes would commit or step the value instead.
      // See utils/ime.ts.
      if (isImeKeyEvent(e.nativeEvent)) {
        return;
      }
      const hasModifier = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;
      if (!hasModifier && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        onKeyDown?.(e);
        if (e.defaultPrevented) {
          return;
        }
        e.preventDefault();
        stepValue(e.key === 'ArrowUp' ? 1 : -1);
        return;
      }
      if (e.key === 'Enter') {
        commitPendingInput('Enter');
        onEnter?.();
      }
      onKeyDown?.(e);
    },
    [commitPendingInput, isDisabled, onEnter, onKeyDown, stepValue],
  );

  // React's delegated wheel listener can be passive, so use a native,
  // explicitly non-passive listener to prevent page scrolling only when this
  // focused input is intentionally consuming the gesture to step its value.
  const wheelListenerRef = useCallback(
    (input: HTMLInputElement | null) => {
      if (input == null || !isWheelEnabled) {
        return;
      }

      const handleWheel = (event: WheelEvent) => {
        // Bail before preventDefault so a read-only input never swallows the
        // page scroll it cannot act on.
        if (
          document.activeElement !== input ||
          isDisabled ||
          isReadOnly ||
          event.deltaY === 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        stepValue(event.deltaY < 0 ? 1 : -1);
      };

      input.addEventListener('wheel', handleWheel, {passive: false});
      return () => input.removeEventListener('wheel', handleWheel);
    },
    [isDisabled, isReadOnly, isWheelEnabled, stepValue],
  );

  const mergedInputRef = useMemo(
    () => mergeRefs(ref, inputRef, wheelListenerRef),
    [ref, wheelListenerRef],
  );

  // One step from any value, for a press that steps from its own value.
  const stepFrom = useCallback(
    (current: number | null, direction: StepDirection) =>
      getSteppedValue({
        currentValue: current,
        direction,
        min,
        max,
        step,
        isIntegerOnly,
      }),
    [isIntegerOnly, max, min, step],
  );
  // The bounds follow the value on show, a press's while it lasts.
  const shownValue = pressValue ?? valueForStepping;
  const canIncrement = stepFrom(shownValue, 1) !== shownValue;
  const canDecrement = stepFrom(shownValue, -1) !== shownValue;

  // Commits a stepper press's final value, once, at its release.
  const commitValue = useCallback(
    (next: number) => {
      if (isDisabled || isReadOnly) {
        return;
      }
      setPendingInput(null);
      if (next !== value) {
        onChange(next);
      }
    },
    [isDisabled, isReadOnly, onChange, value],
  );

  // The kind of pointer that pressed a stepper, read when its click lands.
  const stepperPointerTypeRef = useRef<string | null>(null);

  const handleStepperPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    // The steppers never take focus: an editing field stays focused.
    event.preventDefault();
    stepperPointerTypeRef.current = event.pointerType;
  };

  // iOS Safari follows the second tap of a quick double tap with a
  // compatibility mousedown even though its pointerdown was prevented; that
  // mousedown's default would focus the stepper and blur an editing field, so
  // the column prevents it.
  const handleStepperMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  // Where a stepper press leaves focus (`component:NumberInput` FR5). A mouse
  // click moves focus to the field, so the arrow keys and the wheel keep
  // stepping, and so do a pen and an activation with no pointer (a screen
  // reader's) where the primary pointer is fine. A finger, and a pen or an
  // activation with no pointer where the primary pointer is coarse, step the
  // value without moving focus: there, focusing the field would bring up the
  // on-screen keyboard, which a stepper never does.
  const focusAfterPress = (
    pointerType: string | null,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    const isMouseClick = pointerType === 'mouse' && event.detail > 0;
    const isFinePointer = !isCoarsePrimaryPointer(
      event.currentTarget.ownerDocument.defaultView,
    );
    if (
      isMouseClick ||
      (isFinePointer && (pointerType === 'pen' || pointerType == null))
    ) {
      inputRef.current?.focus();
    }
  };

  const pressStepper = (
    direction: StepDirection,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const pointerType = stepperPointerTypeRef.current;
    stepperPointerTypeRef.current = null;
    // Every click answers the press layer: the click after a tracked tap
    // steps the half the press lifted on (spec:AST-094 FR11), the click after
    // a press that stepped while held steps nothing, and any other click
    // steps its own half.
    const click = stepperTouch.takeClick(event.nativeEvent);
    // An aria-disabled stepper does nothing, as a natively disabled one did
    // (spec:AST-085 FR2).
    if (
      isDisabled ||
      isReadOnly ||
      (direction === 1 ? !canIncrement : !canDecrement)
    ) {
      return;
    }
    focusAfterPress(pointerType, event);
    if (click === 'none') {
      return;
    }
    stepValue(click === 'own' ? direction : click === 'increment' ? 1 : -1);
  };

  // A click on the column itself, not on a half (its border), steps the half
  // the tap it follows lifted on (spec:AST-094 FR11), and nothing otherwise.
  // It never reaches the field's click-to-focus; a press there leaves focus
  // as one on a half does (focusAfterPress). Only a pointer presses the
  // column itself, so a click no pointer sent moves no focus there.
  const handleColumnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    event.stopPropagation();
    const pointerType = stepperPointerTypeRef.current;
    stepperPointerTypeRef.current = null;
    if (pointerType != null) {
      focusAfterPress(pointerType, event);
    }
    const click = stepperTouch.takeClick(event.nativeEvent);
    if (click === 'increment' || click === 'decrement') {
      stepValue(click === 'increment' ? 1 : -1);
    }
  };

  // A press on the steppers by any pointer is tracked by the press layer
  // (NumberInputTouch.tsx); a key or assistive technology steps by the click.
  const incrementRef = useRef<HTMLButtonElement | null>(null);
  const decrementRef = useRef<HTMLButtonElement | null>(null);
  const stepperColumnRef = useRef<HTMLDivElement | null>(null);
  const stepperTouch = useStepperTouch(
    {
      valueForStepping,
      stepFrom,
      showPressValue: setPressValue,
      commitValue,
      isDisabled,
      isReadOnly,
      hasSteppers: hasNumberSteppers,
    },
    incrementRef,
    decrementRef,
    stepperColumnRef,
  );
  // The touch control needs a Field box to give up its width (none renders in
  // an InputGroup or a horizontal-labels FormLayout) and one wide enough for
  // it: a numeric width is known now; under a finger, any other width is
  // measured, through the shared resize observer.
  const {isTouch} = useTouchPresentation();
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const [isMeasuredTooNarrow, setIsMeasuredTooNarrow] = useState(false);
  const canHaveTouchControl =
    hasNumberSteppers &&
    !inputGroup &&
    hasFieldBox &&
    !(typeof width === 'number' && width < TOUCH_CONTROL_MIN_FIELD_WIDTH);
  const measuresField = canHaveTouchControl && isTouch;
  const hasTouchControl =
    canHaveTouchControl && !(measuresField && isMeasuredTooNarrow);
  useIsomorphicLayoutEffect(() => {
    const field = fieldRef.current;
    if (!measuresField || field == null) {
      return undefined;
    }
    // The shared observer (one per document) answers once as it subscribes,
    // then on every resize. A box with no width is not laid out yet.
    return observeResize(field, () => {
      const fieldWidth = field.getBoundingClientRect().width;
      setIsMeasuredTooNarrow(
        fieldWidth > 0 && fieldWidth < TOUCH_CONTROL_MIN_FIELD_WIDTH,
      );
    });
  }, [measuresField]);

  // Handle clear button click
  const handleClear = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (hasClear) {
        onChange(null);
      }
      setPendingInput(null);
      if (!e || e.detail === 0) {
        inputRef.current?.focus();
      } else {
        // Focus inside the tap: iOS Safari brings up its keyboard only for a
        // focus made while handling the touch, so a field the tap reaches
        // unfocused gets its keyboard, as UIKit's clear button makes the
        // field first responder. `preventScroll` keeps a scrolled page where
        // it is.
        inputRef.current?.focus({preventScroll: true});
      }
    },
    [hasClear, onChange],
  );

  // Focus input when clicking anywhere on the wrapper (icons, padding, etc.)
  const {onClick: handleWrapperClick, onMouseUp: handleWrapperMouseUp} =
    useInputContainer({
      containerRef,
      inputRef,
      disabled: isDisabled,
    });

  const inputWrapper = (
    <div
      ref={el => {
        containerRef.current = el;
        // Anchor + hover/focus listeners for the disabled-message tooltip.
        // Handlers are gated internally by isEnabled, and anchor names
        // compose, so attaching unconditionally is safe.
        disabledMessageTooltip.ref(el);
      }}
      onClick={handleWrapperClick}
      onMouseUp={handleWrapperMouseUp}
      {...(inputGroup ? inputGroupItemProps : undefined)}
      {...mergeProps(
        themeProps('number-input', {
          size,
          status: status?.type ?? null,
          disabled: isDisabled ? 'disabled' : null,
          readonly: isReadOnly ? 'readonly' : null,
        }),
        stylex.props(
          inputWrapperStyles.base,
          styles.wrapper,
          hasNumberSteppers &&
            (hasTouchControl
              ? styles.wrapperWithTouchSteppers
              : styles.wrapperWithNumberSteppers),
          sizeStyles[size],
          isDisabled && inputWrapperStyles.disabled,
          isDisabled && inputDisabledFocusStyles.ring,
          status && inputStatusBorderStyles[status.type],
          status && !isDisabled && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          inputGroup && groupStyles.inGroup,
          controlXstyle,
        ),
        controlClassName,
        controlStyle,
      )}>
      {startIcon && renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
      {inputGroup && <VisuallyHidden id={inputLabelID}>{label}</VisuallyHidden>}
      <input
        {...fieldProps}
        ref={mergedInputRef}
        id={id}
        name={isDisabled || formatValue ? undefined : htmlName}
        type="text"
        inputMode={isIntegerOnly ? 'numeric' : 'decimal'}
        role="spinbutton"
        autoComplete={autoComplete}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        // A disabled input keeps its place in the tab order (spec:AST-085):
        // aria-disabled instead of the native attribute, with readOnly + the
        // handler guards keeping the value from changing.
        aria-disabled={isDisabled ? 'true' : undefined}
        readOnly={isReadOnly || isDisabled || undefined}
        autoFocus={hasAutoFocus}
        data-autofocus={hasAutoFocus || undefined}
        aria-valuemin={min ?? undefined}
        aria-valuemax={max ?? undefined}
        // The ARIA value and hidden form input expose the committed value;
        // pendingInput is still an uncommitted edit and may be invalid.
        aria-valuenow={value ?? undefined}
        aria-valuetext={
          value == null || !formatValue ? undefined : formattedValue
        }
        aria-describedby={
          [ariaDescribedByProp, ariaDescribedBy].filter(Boolean).join(' ') ||
          undefined
        }
        aria-required={isEffectivelyRequired ? 'true' : undefined}
        aria-invalid={
          status?.type === 'error' || !isInputValid ? 'true' : undefined
        }
        aria-labelledby={ariaLabelledBy}
        {...stylex.props(
          styles.input,
          isDisabled && styles.inputDisabled,
          !isInputValid && styles.inputInvalid,
        )}
      />
      {formatValue && htmlName && !isDisabled && (
        <input
          type="hidden"
          name={htmlName}
          value={value == null ? '' : String(value)}
        />
      )}
      {units && (
        <span id={unitsID} {...stylex.props(styles.units)}>
          {units}
        </span>
      )}
      {/*
        Live region announcing invalid typed input to assistive technology.
        The value silently reverts on blur, so without this a screen-reader
        user would get no feedback that their entry was rejected (WCAG 3.3.1).
      */}
      <VisuallyHidden as="div" role="alert" aria-live="assertive">
        {!isInputValid ? t('@astryx.numberInput.invalidNumber') : ''}
      </VisuallyHidden>
      {hasClear && value != null && !isDisabled && !isReadOnly && (
        <InputClearButton
          label={t('@astryx.numberInput.clearLabel', {label})}
          onClick={handleClear}
        />
      )}
      {statusIcon}
      {hasNumberSteppers && (
        <div
          ref={stepperColumnRef}
          onPointerDown={handleStepperPointerDown}
          onMouseDown={handleStepperMouseDown}
          onClick={handleColumnClick}
          {...stylex.props(
            styles.numberSteppers,
            hasTouchControl && styles.numberSteppersTouch,
            hasTouchControl && size === 'sm' && styles.touchControlSm,
            hasTouchControl && size === 'lg' && styles.touchControlLg,
          )}>
          <button
            ref={incrementRef}
            type="button"
            tabIndex={-1}
            aria-disabled={
              isDisabled || isReadOnly || !canIncrement || undefined
            }
            aria-label={t('@astryx.numberInput.incrementLabel', {label})}
            onClick={event => pressStepper(1, event)}
            {...stylex.props(
              styles.numberStepperButton,
              hasTouchControl && styles.numberStepperButtonTouch,
              hasTouchControl && styles.touchGlyph,
              hasTouchControl && styles.touchGlyphPlus,
              interactionOverlayStyles.backgroundImage,
              hasTouchControl && styles.incrementTouchCorners,
              (isDisabled || isReadOnly || !canIncrement) &&
                styles.numberStepperButtonDisabled,
              (isDisabled || isReadOnly || !canIncrement) &&
                hasTouchControl &&
                styles.numberStepperButtonDisabledTouch,
            )}>
            <Icon
              icon="numberInput:stepperDown"
              size="xsm"
              color="inherit"
              xstyle={[
                styles.incrementIcon,
                hasTouchControl && styles.chevronNotTouch,
              ]}
            />
          </button>
          <button
            ref={decrementRef}
            type="button"
            tabIndex={-1}
            aria-disabled={
              isDisabled || isReadOnly || !canDecrement || undefined
            }
            aria-label={t('@astryx.numberInput.decrementLabel', {label})}
            onClick={event => pressStepper(-1, event)}
            {...stylex.props(
              styles.numberStepperButton,
              hasTouchControl && styles.numberStepperButtonTouch,
              hasTouchControl && styles.touchGlyph,
              hasTouchControl && styles.touchGlyphMinus,
              interactionOverlayStyles.backgroundImage,
              styles.decrementButton,
              hasTouchControl && styles.decrementButtonTouch,
              hasTouchControl && styles.decrementTouchCorners,
              (isDisabled || isReadOnly || !canDecrement) &&
                styles.numberStepperButtonDisabled,
              (isDisabled || isReadOnly || !canDecrement) &&
                hasTouchControl &&
                styles.numberStepperButtonDisabledTouch,
            )}>
            <Icon
              icon="numberInput:stepperDown"
              size="xsm"
              color="inherit"
              xstyle={hasTouchControl ? styles.chevronNotTouch : undefined}
            />
          </button>
        </div>
      )}
    </div>
  );

  if (inputGroup) {
    return (
      <>
        {inputWrapper}
        {showsDisabledMessage &&
          disabledMessageTooltip.renderTooltip(disabledMessage)}
      </>
    );
  }

  return (
    <Field
      {...container}
      ref={fieldRef}
      xstyle={[
        hasTouchControl && styles.fieldWithTouchSteppers,
        'xstyle' in container ? container.xstyle : undefined,
      ]}
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      labelIcon={labelIcon}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      statusVariant={statusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </Field>
  );
}

NumberInput.displayName = 'NumberInput';

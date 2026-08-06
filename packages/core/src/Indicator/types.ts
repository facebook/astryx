// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input None (pure type definitions)
 * @output Exports the indicator contract: state, props, component, registry types
 * @position Type foundation for stateful selection visuals (checkbox, radio)
 */

import type {ComponentType, ReactNode, Ref} from 'react';
import type {BaseProps} from '../BaseProps';

/**
 * The selection state an indicator draws.
 *
 * `indeterminate` is only meaningful for indicators that can express a partial
 * state (checkbox); indicators that cannot should draw their unchecked form.
 */
export type IndicatorState = 'unchecked' | 'checked' | 'indeterminate';

/** Indicator size scale — matches the control sizes of the owning inputs. */
export type IndicatorSize = 'sm' | 'md';

/**
 * Props every indicator accepts.
 *
 * Indicators are **decorative**: they render `aria-hidden` visuals and own no
 * role, focus, keyboard handling, or state. The component that renders one
 * (CheckboxInput, RadioListItem, a menu row, a listbox option) keeps all of
 * that. An indicator's only job is to turn `state` into a picture.
 *
 * Interaction state is deliberately *not* a prop. Hover and focus reach an
 * indicator through the CSS ancestor marker (`indicatorScope`) applied by its
 * owner, so a row hover tints the control without anyone threading a boolean
 * through React.
 */
export interface IndicatorProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the indicator's root element. */
  ref?: Ref<HTMLSpanElement>;
  /** Which state to draw. */
  state: IndicatorState;
  /**
   * Control size.
   * @default 'md'
   */
  size?: IndicatorSize;
  /**
   * Whether the owning control is disabled. Purely visual — the owner still
   * owns the actual disabled semantics.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Content rendered inside the indicator chrome *instead of* the state mark.
   * CheckboxInput uses this to show a loading Spinner inside the box while a
   * change action is pending.
   */
  children?: ReactNode;
}

/** An indicator is any component accepting {@link IndicatorProps}. */
export type IndicatorComponent = ComponentType<IndicatorProps>;

/**
 * Named indicators a theme can replace.
 *
 * Declared as an interface so packages outside core can contribute their own
 * indicator names through module augmentation:
 *
 * ```ts
 * declare module '@astryxdesign/core/Indicator' {
 *   interface IndicatorMap {
 *     'brand-star': true;
 *   }
 * }
 * ```
 */
export interface IndicatorMap {
  checkbox: true;
  radio: true;
}

export type IndicatorName = keyof IndicatorMap & string;

/** Theme-provided indicator overrides, keyed by indicator name. */
export type IndicatorRegistry = Partial<
  Record<IndicatorName, IndicatorComponent>
>;

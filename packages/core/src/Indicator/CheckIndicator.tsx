// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CheckIndicator.tsx
 * @input Indicator state props
 * @output Exports CheckIndicator — the default single-selection mark
 * @position Decorative check visual used wherever "this one is chosen" is
 *           marked without a control: selector options, menu rows
 *
 * This is the indicator a product replaces to change what "chosen" looks like.
 * `defineTheme({indicators: {check: RadioIndicator}})` turns every
 * single-selection mark into a radio, in one line, without any component
 * knowing it happened.
 *
 * It draws NOTHING when unchecked, which is what makes it the default: a
 * listbox should not show an empty box beside every row. A replacement is free
 * to draw in both states — a radio does — and hosting components render the
 * indicator unconditionally so that works.
 *
 * Unlike the checkbox and radio indicators, this one renders no chrome of its
 * own: it IS the glyph. Two consequences, both deliberate:
 *
 *   - It renders `<Icon>` directly rather than wrapping one, so the class the
 *     host passes (`selector-check`, say) lands on the same element as
 *     `astryx-icon` — one element carrying the mark and its theme target, per
 *     the wrapper reduction in #4838/#4846.
 *   - It adds NO theme target of its own. `astryx-checkbox` and `astryx-radio`
 *     exist because those indicators draw chrome that needs styling; a check
 *     is an icon, and `astryx-icon` plus the host's target already reach it.
 */

import type {SVGProps} from 'react';
import {Icon} from '../Icon/Icon';
import type {IndicatorProps} from './types';

/** The check glyph matches the control sizes the indicator families share. */
const iconSizeForIndicator = {
  sm: 'sm',
  md: 'sm',
} as const;

/**
 * The default single-selection mark: a checkmark when chosen, nothing when not.
 *
 * Decorative and non-interactive — it renders `aria-hidden` and owns no role,
 * state, or focus behavior; the option or row that hosts it keeps all of that.
 *
 * @example
 * ```tsx
 * <CheckIndicator state={isSelected ? 'checked' : 'unchecked'} size="sm" />
 * ```
 *
 * Swap every single-selection mark for a radio:
 *
 * @example
 * ```tsx
 * import {RadioIndicator} from '@astryxdesign/core/Indicator';
 *
 * defineTheme({name: 'brand', indicators: {check: RadioIndicator}});
 * ```
 */
export function CheckIndicator({
  state,
  size = 'md',
  isDisabled = false,
  children,
  ref,
  className,
  style,
  xstyle,
  ...rest
}: IndicatorProps<'singleSelection'>) {
  const isChecked = state === 'checked';

  // Nothing to draw, and no box to reserve: an unmarked row keeps the layout
  // it would have without this indicator.
  if (!isChecked) {
    return null;
  }

  // `children` (a pending Spinner, say) replaces the mark but keeps the
  // indicator's place, matching the other indicators' contract. There is no
  // glyph to put the host's props on in that case, so they go on a span.
  if (children != null) {
    return (
      <span ref={ref} aria-hidden="true" className={className} style={style}>
        {children}
      </span>
    );
  }

  return (
    <Icon
      // Spread first so the indicator's own contract (below) wins over any
      // same-named DOM attribute a caller passed through.
      //
      // An indicator declares span props (BaseProps<HTMLSpanElement>) while
      // Icon declares SVG ones, so the handler types differ nominally. For a
      // registry icon the element that actually receives these IS a span
      // (IconFromRegistry renders one), so forwarding them is correct at
      // runtime; the cast only reconciles the two declarations.
      {...(rest as Omit<SVGProps<SVGSVGElement>, 'color' | 'ref'>)}
      icon="check"
      size={iconSizeForIndicator[size]}
      color={isDisabled ? 'disabled' : 'accent'}
      // The focus ring rides in through xstyle (composed at resolution), but
      // never paints here: it only activates under an owner's indicatorScope
      // marker, and a listbox row that marks selection takes focus itself
      // rather than marking its indicator.
      xstyle={xstyle}
      // Icon merges className/style with its own rather than shadowing them,
      // so the host's theme target composes with `astryx-icon`.
      className={className}
      style={style}
    />
  );
}

CheckIndicator.displayName = 'CheckIndicator';

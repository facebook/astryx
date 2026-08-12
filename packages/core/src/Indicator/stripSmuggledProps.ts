// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stripSmuggledProps.ts
 * @input An indicator's rest props
 * @output The same props without the ones the type already forbids
 * @position Internal to Indicator; not exported from the package
 *
 * `IndicatorProps` omits `tabIndex` (and the a11y props) because an indicator
 * is decorative: it is unconditionally `aria-hidden`, so a tab stop on it is a
 * focusable node inside a hidden subtree — axe `aria-hidden-focus`, measured
 * going from 0 violations to 1 the moment it is forwarded.
 *
 * The type cannot finish the job. TypeScript exempts JSX attribute names that
 * are not valid JS identifiers from excess-property checking, and a spread —
 * `<Mark {...props} />`, the ordinary host idiom — bypasses the check for every
 * member. So the omission states intent and catches the literal, and the rest
 * is enforced here and by attribute order at the call site.
 *
 * Only `tabIndex` needs removing. `aria-hidden` is settled by ordering (each
 * indicator emits its own after `{...rest}`), and `role` / `aria-label` are
 * inert inside an `aria-hidden` subtree, so they are left alone rather than
 * silently deleted.
 */

/**
 * Remove a smuggled `tabIndex`, returning the props unchanged when there is
 * none — which is the overwhelmingly common case, so it allocates nothing.
 */
export function stripSmuggledProps<T extends object>(rest: T): T {
  if (!('tabIndex' in rest)) {
    return rest;
  }
  const {tabIndex: _tabIndex, ...safe} = rest as T & {tabIndex?: number};
  return safe as unknown as T;
}

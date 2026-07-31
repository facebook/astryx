// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * A theming target — a stable selector surface that `defineTheme` can target
 * via `@scope` selectors. Each component renders one or more stable `xds-*`
 * class names and reflects visual props/states as `data-*` attributes via
 * `themeProps()`, so themes and external CSS have an explicit prop-aware selector surface.
 *
 * @example
 * ```
 * {className: 'astryx-button', visualProps: ['variant', 'size']}
 * {className: 'astryx-avatar-status-dot', visualProps: ['variant']}
 * {className: 'astryx-card'}
 * ```
 */
export interface ThemingTarget {
  /** The stable CSS class name rendered by the component.
   *  Always starts with `astryx-`.
   *  e.g. `"astryx-button"`, `"astryx-avatar-status-dot"`, `"astryx-card"` */
  className: string;
  /** Visual prop names reflected on this element.
   *  These are the props passed to `themeProps()` as the second argument.
   *  Use these names to derive preferred data selectors: `variant` →
   *  `[data-variant="secondary"]`, `level` → `[data-level="2"]`. Legacy bare
   *  classes are still emitted for compatibility but should not be the primary
   *  documentation surface. Omit if the component has no visual props (class
   *  name only). */
  visualProps?: string[];
  /** State names that appear on this element based on component state.
   *  Unlike visualProps (driven by props), these reflect runtime state
   *  (checked, selected, today, on, expanded, etc.). Use these names to derive preferred data selectors such as
   *  `[data-checked="checked"]`. Legacy state classes are still emitted for
   *  compatibility. Omit if the element has no state-driven selectors. */
  states?: string[];
}

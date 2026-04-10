/**
 * @file XDSBaseProps.ts
 * @input None (pure type definitions)
 * @output Exports XDSBaseProps — the shared base interface for all XDS components
 * @position Type foundation; extended by all component prop interfaces
 *
 * Starts with full HTMLAttributes and omits props that should require
 * intentional opt-in. `children` is excluded so slot-based components
 * don't silently accept and drop JSX children at runtime.
 */

import type React from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';

/**
 * Base props shared by all XDS components.
 *
 * Extends HTMLAttributes minus props that should be opt-in per component.
 * `children` is omitted so slot-based components don't silently accept
 * and drop JSX children; components that use children declare it explicitly.
 */
export interface XDSBaseProps<T extends HTMLElement = HTMLElement> extends Omit<
  React.HTMLAttributes<T>,
  | 'children'
  | 'contentEditable'
  | 'dangerouslySetInnerHTML'
  | 'suppressContentEditableWarning'
  | 'suppressHydrationWarning'
> {
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
}

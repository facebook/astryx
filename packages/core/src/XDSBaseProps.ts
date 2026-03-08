/**
 * @file XDSBaseProps.ts
 * @input None (pure type definitions)
 * @output Exports XDSBaseProps — the shared base interface for all XDS components
 * @position Type foundation; extended by all component prop interfaces
 *
 * Starts with full HTMLAttributes and omits the handful of props that make
 * no sense on design system components. Consumers get drag-and-drop, pointer
 * events, keyboard handlers, clipboard events — everything they'd expect
 * from a DOM element, without contentEditable or dangerouslySetInnerHTML.
 */

import type React from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';

/**
 * Base props shared by all XDS components.
 *
 * Extends HTMLAttributes minus the genuinely irrelevant props. Components
 * extend this and re-declare common props with better JSDoc where useful
 * (e.g. Button re-declares onClick with its specific event type).
 */
export interface XDSBaseProps<T extends HTMLElement = HTMLElement> extends Omit<
  React.HTMLAttributes<T>,
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

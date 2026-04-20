/**
 * @file XDSBaseProps.ts
 * @input None (pure type definitions)
 * @output Exports XDSBaseProps — the shared base interface for all XDS components
 * @position Type foundation; extended by all component prop interfaces
 *
 * Keeps: event handlers, aria-*, role, tabIndex, hidden, draggable, inert,
 * dir, className, style, id, xstyle, data-*.
 * Omits: title, contentEditable, and obscure/non-standard HTML attributes.
 */

import type React from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';

/**
 * Base props shared by all XDS components.
 *
 * Omits props that are footguns, deprecated, or irrelevant to component APIs.
 * Components that genuinely need an omitted prop can declare it explicitly.
 */
export interface XDSBaseProps<T extends HTMLElement = HTMLElement> extends Omit<
  React.HTMLAttributes<T>,
  | 'children'
  | 'title'
  | 'contentEditable'
  | 'dangerouslySetInnerHTML'
  | 'suppressContentEditableWarning'
  | 'suppressHydrationWarning'
  // Obscure
  | 'accessKey'
  | 'autoCapitalize'
  | 'autoFocus'
  | 'contextMenu'
  | 'enterKeyHint'
  | 'lang'
  | 'nonce'
  | 'slot'
  | 'spellCheck'
  | 'translate'
  | 'radioGroup'
  | 'inputMode'
  | 'is'
  // RDFa
  | 'about'
  | 'content'
  | 'datatype'
  | 'inlist'
  | 'prefix'
  | 'property'
  | 'rel'
  | 'resource'
  | 'rev'
  | 'typeof'
  | 'vocab'
  // Non-standard
  | 'autoCorrect'
  | 'autoSave'
  | 'color'
  | 'results'
  | 'security'
  | 'unselectable'
  // Microdata
  | 'itemProp'
  | 'itemScope'
  | 'itemType'
  | 'itemID'
  | 'itemRef'
  // Popover API (use XDSPopover)
  | 'popover'
  | 'popoverTargetAction'
  | 'popoverTarget'
  // Shadow DOM
  | 'exportparts'
  // Form defaults
  | 'defaultChecked'
  | 'defaultValue'
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

  /** Allow data-* attributes for telemetry, testing, and integration hooks. */
  [key: `data-${string}`]: string | undefined;
}

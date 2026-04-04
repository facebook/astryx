'use client';

/**
 * @file useXDSCollapsible.ts
 * @input Uses React useState/useContext, CollapsibleGroupContext
 * @output Exports useXDSCollapsible hook, XDSCollapsibleConfig (formerly CollapsibleConfig), UseXDSCollapsibleOptions, UseXDSCollapsibleReturn types
 * @position Reusable hook for collapsible behavior — used by XDSCard, XDSSection, etc.
 *
 * Encapsulates the full collapsible state machine:
 * - Parsing boolean | config into normalized config
 * - Checking for CollapsibleGroup context (group-controlled mode)
 * - Managing internal state for uncontrolled mode
 * - Providing a unified toggle handler
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Collapsible/index.ts (exports)
 * - /packages/core/src/Collapsible/Collapsible.doc.mjs
 *
 * NOTE: Public hooks use the `useXDS` prefix per XDS naming conventions.
 */

import {useState, useContext} from 'react';
import {CollapsibleGroupContext} from './XDSCollapsibleGroupContext';

/**
 * Configuration for collapsible behavior.
 */
export type XDSCollapsibleConfig = {
  /** Default open state for uncontrolled usage. @default true */
  defaultIsOpen?: boolean;
  /** Controlled open state. */
  isOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
};

export interface UseXDSCollapsibleOptions {
  /**
   * Whether the component is collapsible.
   * - `true` — self-managed, starts open
   * - `{ defaultIsOpen: false }` — self-managed, starts collapsed
   * - `{ isOpen, onOpenChange }` — controlled externally
   */
  isCollapsible?: boolean | XDSCollapsibleConfig;
  /**
   * Unique identifier within an XDSCollapsibleGroup.
   * When present and inside a group, defers state to the group.
   */
  value?: string;
}

export interface UseXDSCollapsibleReturn {
  /** Whether collapsible behavior is enabled. */
  isEnabled: boolean;
  /** Whether the content is currently open/expanded. */
  isOpen: boolean;
  /** Toggle the open/closed state. */
  toggle: () => void;
}

/**
 * Hook that encapsulates collapsible state management.
 *
 * Supports three modes:
 * 1. **Group-controlled**: When inside a CollapsibleGroup with a `value`, defers to group.
 * 2. **Controlled**: When `isOpen` and `onOpenChange` are provided in config.
 * 3. **Uncontrolled**: Self-managed internal state with optional `defaultIsOpen`.
 *
 * @example
 * ```
 * const {isEnabled, isOpen, toggle} = useXDSCollapsible({
 *   isCollapsible: true,
 *   value: 'section-1',
 * });
 * ```
 */
export function useXDSCollapsible(
  options: UseXDSCollapsibleOptions,
): UseXDSCollapsibleReturn {
  const {isCollapsible, value} = options;

  // Check for CollapsibleGroup context
  const group = useContext(CollapsibleGroupContext);
  const isControlledByGroup = group != null && value != null;

  // Parse config: true → empty config, object → as-is, false/undefined → null
  const config: XDSCollapsibleConfig | null =
    isCollapsible === true ? {} : isCollapsible ? isCollapsible : null;
  const isEnabled = config != null;

  // Internal state for uncontrolled mode
  const [internalIsOpen, setInternalIsOpen] = useState(() => {
    if (isControlledByGroup) return true; // group manages this
    if (config?.isOpen !== undefined) return config.isOpen;
    return config?.defaultIsOpen ?? true;
  });

  // Determine open state from the appropriate source
  let isOpen: boolean;
  if (isControlledByGroup) {
    isOpen = group.isOpen(value!);
  } else if (config?.isOpen !== undefined) {
    isOpen = config.isOpen;
  } else {
    isOpen = internalIsOpen;
  }

  // Toggle handler dispatches to the appropriate controller
  const toggle = () => {
    if (isControlledByGroup) {
      group.toggle(value!);
    } else if (config?.onOpenChange) {
      config.onOpenChange(!isOpen);
    } else {
      setInternalIsOpen(prev => !prev);
    }
  };

  return {isEnabled, isOpen, toggle};
}

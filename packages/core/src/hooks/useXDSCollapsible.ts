/**
 * @file useXDSCollapsible.ts
 * @input Uses React useState, useCallback
 * @output Exports useXDSCollapsible hook and XDSCollapsibleConfig type
 * @position Core hook; provides collapsible state for Card, ListItem, etc.
 *
 * Returns a config object that components accept via a `collapsible` prop.
 * Supports both controlled (isOpen) and uncontrolled (initialIsOpen) modes.
 *
 * Components receiving the config should wrap children in an animated container
 * using CSS grid-template-rows transition for smooth height animation:
 *
 * ```tsx
 * const collapsibleContentStyles = stylex.create({
 *   wrapper: {
 *     display: 'grid',
 *     transitionProperty: 'grid-template-rows',
 *     transitionDuration: '0.2s',
 *     transitionTimingFunction: 'ease',
 *   },
 *   open: { gridTemplateRows: '1fr' },
 *   closed: { gridTemplateRows: '0fr' },
 *   inner: { overflow: 'hidden' },
 * });
 * ```
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {type ReactNode, useCallback, useState} from 'react';

/**
 * Configuration object for collapsible behavior.
 * Passed to components via their `collapsible` prop.
 *
 * Can be constructed manually (it's just a plain object) or
 * obtained from the useXDSCollapsible hook.
 *
 * @example
 * ```tsx
 * // Via hook
 * const collapsible = useXDSCollapsible({ initialIsOpen: true });
 * <XDSCard collapsible={collapsible}>...</XDSCard>
 *
 * // Manual construction
 * const collapsible: XDSCollapsibleConfig = {
 *   isOpen: true,
 *   onOpenChange: (open) => console.log(open),
 * };
 * ```
 */
export interface XDSCollapsibleConfig {
  /** Whether the collapsible content is currently open/expanded. */
  isOpen: boolean;
  /** Callback fired when the open state should change. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Optional trigger element rendered by the component. */
  trigger?: ReactNode;
}

/**
 * Options for the useXDSCollapsible hook.
 */
export interface UseXDSCollapsibleOptions {
  /** Initial open state for uncontrolled mode. Defaults to false. */
  initialIsOpen?: boolean;
  /** Controlled open state. When provided, the hook operates in controlled mode. */
  isOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Hook that returns a collapsible config object for use with
 * components that accept a `collapsible` prop.
 *
 * Supports controlled and uncontrolled modes:
 * - **Uncontrolled:** Pass `initialIsOpen` to set the starting state.
 *   The hook manages state internally.
 * - **Controlled:** Pass `isOpen` to control the state externally.
 *   You must also handle `onOpenChange` to update your state.
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * const collapsible = useXDSCollapsible({ initialIsOpen: false });
 *
 * // Controlled
 * const [open, setOpen] = useState(false);
 * const collapsible = useXDSCollapsible({ isOpen: open, onOpenChange: setOpen });
 *
 * return <XDSCard collapsible={collapsible}>...</XDSCard>;
 * ```
 */
export function useXDSCollapsible(
  options?: UseXDSCollapsibleOptions,
): XDSCollapsibleConfig {
  const {
    initialIsOpen = false,
    isOpen: controlledIsOpen,
    onOpenChange: controlledOnOpenChange,
  } = options ?? {};

  const isControlled = controlledIsOpen !== undefined;

  const [internalIsOpen, setInternalIsOpen] = useState(initialIsOpen);

  const currentIsOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const onOpenChange = useCallback(
    (newIsOpen: boolean) => {
      if (!isControlled) {
        setInternalIsOpen(newIsOpen);
      }
      controlledOnOpenChange?.(newIsOpen);
    },
    [isControlled, controlledOnOpenChange],
  );

  return {
    isOpen: currentIsOpen,
    onOpenChange,
  };
}

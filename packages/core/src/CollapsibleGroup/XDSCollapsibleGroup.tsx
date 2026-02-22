/**
 * @file XDSCollapsibleGroup.tsx
 * @input Uses React useState, useCallback, CollapsibleGroupContext
 * @output Exports XDSCollapsibleGroup component and XDSCollapsibleGroupProps
 * @position Core collapsible group coordination provider — renders no wrapper DOM
 *
 * XDSCollapsibleGroup groups collapsible components (XDSCard, etc.) with
 * coordinated open/close behavior. It renders only `{children}` — no wrapper
 * DOM element.
 *
 * In "single" mode (default), only one item can be open at a time.
 * In "multiple" mode, any number of items can be open simultaneously.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CollapsibleGroup/XDSCollapsibleGroupContext.tsx (context type)
 * - /packages/core/src/CollapsibleGroup/README.md
 * - /packages/core/src/CollapsibleGroup/index.ts (exports)
 * - /apps/storybook/stories/CollapsibleGroup.stories.tsx
 */

'use client';

import {useCallback, useMemo, useState, type ReactNode} from 'react';
import {CollapsibleGroupContext} from './XDSCollapsibleGroupContext';
import type {CollapsibleGroupContextValue} from './XDSCollapsibleGroupContext';

export interface XDSCollapsibleGroupProps {
  /**
   * Whether only one item can be open at a time, or multiple.
   * @default "single"
   */
  type?: 'single' | 'multiple';

  /**
   * Default open item(s) — uncontrolled mode.
   * Use a string for single mode, string[] for multiple mode.
   */
  defaultValue?: string | string[];

  /**
   * Controlled open item(s).
   * When provided, the group is fully controlled externally.
   */
  value?: string | string[];

  /**
   * Callback when the open item(s) change.
   */
  onValueChange?: (value: string | string[]) => void;

  /**
   * Children — any components that support isCollapsible + value.
   *
   * @compositionHint Wrap XDSCollapsible instances (typically inside XDSCard).
   * Each XDSCollapsible needs a `value` prop to participate in the group.
   *
   * @example
   * ```tsx
   * <XDSCollapsibleGroup type="single" defaultValue="general">
   *   <XDSVStack gap="space2">
   *     <XDSCard>
   *       <XDSCollapsible trigger="General" value="general">
   *         <p>General settings content</p>
   *       </XDSCollapsible>
   *     </XDSCard>
   *     <XDSCard>
   *       <XDSCollapsible trigger="Advanced" value="advanced">
   *         <p>Advanced settings content</p>
   *       </XDSCollapsible>
   *     </XDSCard>
   *   </XDSVStack>
   * </XDSCollapsibleGroup>
   * ```
   */
  children: ReactNode;
}

function normalizeToArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Groups collapsible components with coordinated open/close behavior.
 * Renders no wrapper DOM.
 *
 * In "single" mode (default), opening one item closes the others.
 * In "multiple" mode, items toggle independently.
 *
 * @compositionHint Wrap XDSCollapsible instances to coordinate their open/close state.
 * Each XDSCollapsible needs a `value` prop to participate.
 *
 * @example
 * ```tsx
 * <XDSCollapsibleGroup type="single" defaultValue="faq1">
 *   <XDSVStack gap="space2">
 *     <XDSCard>
 *       <XDSCollapsible trigger="What is XDS?" value="faq1">
 *         XDS is a design system for building internal tools.
 *       </XDSCollapsible>
 *     </XDSCard>
 *     <XDSCard>
 *       <XDSCollapsible trigger="How do I start?" value="faq2">
 *         Install the package and import components.
 *       </XDSCollapsible>
 *     </XDSCard>
 *   </XDSVStack>
 * </XDSCollapsibleGroup>
 * ```
 */
export function XDSCollapsibleGroup({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
}: XDSCollapsibleGroupProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(() =>
    normalizeToArray(defaultValue),
  );

  const openValues = isControlled
    ? normalizeToArray(controlledValue)
    : internalValue;

  const isOpen = useCallback(
    (itemValue: string) => openValues.includes(itemValue),
    [openValues],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      let nextValues: string[];

      if (type === 'single') {
        // In single mode, toggling an open item closes it; toggling a closed item opens it (and closes others)
        nextValues = openValues.includes(itemValue) ? [] : [itemValue];
      } else {
        // In multiple mode, toggle the item independently
        nextValues = openValues.includes(itemValue)
          ? openValues.filter(v => v !== itemValue)
          : [...openValues, itemValue];
      }

      if (!isControlled) {
        setInternalValue(nextValues);
      }

      if (onValueChange) {
        // Return the value in the same shape as the type suggests
        if (type === 'single') {
          onValueChange(nextValues[0] ?? '');
        } else {
          onValueChange(nextValues);
        }
      }
    },
    [type, openValues, isControlled, onValueChange],
  );

  const contextValue = useMemo<CollapsibleGroupContextValue>(
    () => ({isOpen, toggle}),
    [isOpen, toggle],
  );

  return (
    <CollapsibleGroupContext.Provider value={contextValue}>
      {children}
    </CollapsibleGroupContext.Provider>
  );
}

XDSCollapsibleGroup.displayName = 'XDSCollapsibleGroup';

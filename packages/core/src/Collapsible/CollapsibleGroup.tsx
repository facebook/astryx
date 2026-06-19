// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CollapsibleGroup.tsx
 * @input Uses React useState, useCallback, CollapsibleGroupContext
 * @output Exports CollapsibleGroup component and CollapsibleGroupProps
 * @position Core collapsible group coordination provider — renders no wrapper DOM
 *
 * CollapsibleGroup groups collapsible components (Card, etc.) with
 * coordinated open/close behavior. It renders only `{children}` — no wrapper
 * DOM element.
 *
 * In "single" mode (default), only one item can be open at a time.
 * In "multiple" mode, any number of items can be open simultaneously.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Collapsible/CollapsibleGroupContext.tsx (context type)
 * - /packages/core/src/Collapsible/Collapsible.doc.mjs
 * - /packages/core/src/Collapsible/index.ts (exports)
 * - /apps/storybook/stories/Collapsible.stories.tsx
 * - /packages/cli/templates/blocks/components/Collapsible/ (showcase blocks)
 */

import React, {useCallback, useMemo, useState, type ReactNode} from 'react';
import {CollapsibleGroupContext} from './CollapsibleGroupContext';
import type {CollapsibleGroupContextValue} from './CollapsibleGroupContext';
import type {BaseProps} from '../BaseProps';

export interface CollapsibleGroupProps extends Omit<
  BaseProps<HTMLElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLElement>;
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
  onChange?: (value: string | string[]) => void;

  /**
   * Children — any components that support isCollapsible + value.
   *
   * @compositionHint Wrap Collapsible instances (typically inside Card).
   * Each Collapsible needs a `value` prop to participate in the group.
   *
   * @example
   * ```
   * <CollapsibleGroup type="single" defaultValue="general">
   *   <VStack gap={2}>
   *     <Card>
   *       <Collapsible trigger="General" value="general">
   *         <p>General settings content</p>
   *       </Collapsible>
   *     </Card>
   *     <Card>
   *       <Collapsible trigger="Advanced" value="advanced">
   *         <p>Advanced settings content</p>
   *       </Collapsible>
   *     </Card>
   *   </VStack>
   * </CollapsibleGroup>
   * ```
   */
  children: ReactNode;
}

function normalizeToArray(value: string | string[] | undefined): string[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Groups collapsible components with coordinated open/close behavior.
 * Renders no wrapper DOM.
 *
 * In "single" mode (default), opening one item closes the others.
 * In "multiple" mode, items toggle independently.
 *
 * @compositionHint Wrap Collapsible instances to coordinate their open/close state.
 * Each Collapsible needs a `value` prop to participate.
 *
 * @example
 * ```
 * <CollapsibleGroup type="single" defaultValue="faq1">
 *   <VStack gap={2}>
 *     <Card>
 *       <Collapsible trigger="What is XDS?" value="faq1">
 *         XDS is a design system for building internal tools.
 *       </Collapsible>
 *     </Card>
 *     <Card>
 *       <Collapsible trigger="How do I start?" value="faq2">
 *         Install the package and import components.
 *       </Collapsible>
 *     </Card>
 *   </VStack>
 * </CollapsibleGroup>
 * ```
 */
export function CollapsibleGroup({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onChange,
  children,
}: CollapsibleGroupProps) {
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

      if (onChange) {
        // Return the value in the same shape as the type suggests
        if (type === 'single') {
          onChange(nextValues[0] ?? '');
        } else {
          onChange(nextValues);
        }
      }
    },
    [type, openValues, isControlled, onChange],
  );

  const contextValue = useMemo<CollapsibleGroupContextValue>(
    () => ({isOpen, toggle}),
    [isOpen, toggle],
  );

  return (
    <CollapsibleGroupContext value={contextValue}>
      {children}
    </CollapsibleGroupContext>
  );
}

CollapsibleGroup.displayName = 'CollapsibleGroup';

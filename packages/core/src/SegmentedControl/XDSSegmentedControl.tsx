// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSSegmentedControl.tsx
 * @input Uses React, StyleX, XDSSegmentedControlContext
 * @output Exports XDSSegmentedControl component and XDSSegmentedControlProps type
 * @position Container wrapper; provides context to XDSSegmentedControlItem children
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 * - /packages/core/src/SegmentedControl/index.ts
 * - /packages/core/src/SegmentedControl/XDSSegmentedControl.test.tsx
 * - /packages/cli/templates/blocks/components/SegmentedControl/ (showcase blocks)
 */

import React, {useMemo, useRef, useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, radiusVars} from '../theme/tokens.stylex';
import {XDSSegmentedControlContext} from './XDSSegmentedControlContext';
import type {
  XDSSegmentedControlSize,
  XDSSegmentedControlLayout,
} from './XDSSegmentedControlContext';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import {useXDSSize} from '../SizeContext/XDSSizeContext';
import type {XDSBaseProps} from '../XDSBaseProps';

export interface XDSSegmentedControlProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The currently selected value (controlled).
   */
  value: string;
  /**
   * Callback fired when a segment is selected.
   */
  onChange: (value: string) => void;
  /**
   * Accessible label for the radio group (used as aria-label, never rendered visually).
   */
  label: string;
  /**
   * Size variant for the control.
   * @default 'md'
   */
  size?: XDSSegmentedControlSize;
  /**
   * Layout mode for segment sizing.
   * - `'hug'` (default): each segment hugs its content width.
   * - `'fill'`: segments stretch equally to fill the container width.
   * @default 'hug'
   */
  layout?: XDSSegmentedControlLayout;
  /**
   * Whether the entire control is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * XDSSegmentedControlItem children.
   */
  children: ReactNode;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
    '--_segmented-control-padding': spacingVars['--spacing-0-5'],
    padding: 'var(--_segmented-control-padding)',
    backgroundColor: colorVars['--color-neutral'],
  },
  fill: {
    display: 'flex',
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
});

const sizeStyles = stylex.create({
  sm: {
    '--_segmented-control-radius': radiusVars['--radius-element'],
    borderRadius: 'var(--_segmented-control-radius)',
  },
  md: {
    '--_segmented-control-radius': radiusVars['--radius-element'],
    borderRadius: 'var(--_segmented-control-radius)',
  },
  lg: {
    '--_segmented-control-radius': radiusVars['--radius-element'],
    borderRadius: 'var(--_segmented-control-radius)',
  },
});

/**
 * Segmented button group for single selection (radio group semantics).
 * Visually resembles a tab bar but controls a value, not a view.
 *
 * @example
 * ```
 * <XDSSegmentedControl value={view} onChange={setView} label="View mode">
 *   <XDSSegmentedControlItem value="grid" label="Grid" />
 *   <XDSSegmentedControlItem value="list" label="List" />
 *   <XDSSegmentedControlItem value="table" label="Table" />
 * </XDSSegmentedControl>
 * ```
 */
export function XDSSegmentedControl({
  ref,
  value,
  onChange,
  label,
  size: sizeProp,
  layout = 'hug',
  isDisabled = false,
  children,
  xstyle,
  className,
  style,
}: XDSSegmentedControlProps) {
  const size = useXDSSize(sizeProp, 'md') as XDSSegmentedControlSize;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const items = Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          '[role="radio"]:not([aria-disabled="true"])',
        ),
      );
      if (items.length === 0) {
        return;
      }

      const currentIndex = items.findIndex(
        item => item === document.activeElement,
      );
      let nextIndex: number;

      switch (e.key) {
        case 'ArrowRight':
          nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
          break;
        case 'ArrowLeft':
          nextIndex =
            currentIndex === -1
              ? items.length - 1
              : (currentIndex - 1 + items.length) % items.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const nextItem = items[nextIndex];
      nextItem.focus();
      const nextValue = nextItem.dataset.value;
      if (nextValue != null) {
        onChange(nextValue);
      }
    },
    [isDisabled, onChange],
  );

  const contextValue = useMemo(
    () => ({value, onChange, size, layout, isDisabled}),
    [value, onChange, size, layout, isDisabled],
  );

  return (
    <XDSSegmentedControlContext value={contextValue}>
      <div
        ref={mergeRefs(ref, containerRef)}
        role="radiogroup"
        aria-label={label}
        aria-disabled={isDisabled || undefined}
        onKeyDown={handleKeyDown}
        {...mergeProps(
          xdsClassName('segmented-control', {size}),
          stylex.props(
            styles.container,
            sizeStyles[size],
            layout === 'fill' && styles.fill,
            isDisabled && styles.disabled,
            xstyle,
          ),
          className,
          style,
        )}>
        {children}
      </div>
    </XDSSegmentedControlContext>
  );
}

XDSSegmentedControl.displayName = 'XDSSegmentedControl';

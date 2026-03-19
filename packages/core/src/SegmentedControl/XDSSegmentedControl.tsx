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
 */

'use client';

import {useMemo, useRef, useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, spacingVars, radiusVars} from '../theme/tokens.stylex';
import {XDSSegmentedControlContext} from './XDSSegmentedControlContext';
import type {XDSSegmentedControlSize} from './XDSSegmentedControlContext';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSSegmentedControlProps {
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
   * Whether the entire control is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * XDSSegmentedControlItem children.
   */
  children: ReactNode;
  /**
   * Additional StyleX styles for the container.
   */
  xstyle?: StyleXStyles;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
    '--segmented-padding': spacingVars['--spacing-0-5'],
    padding: 'var(--segmented-padding)',
    backgroundColor: colorVars['--color-secondary'],
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
});

const sizeStyles = stylex.create({
  sm: {
    '--segmented-radius': radiusVars['--radius-1'],
    borderRadius: 'var(--segmented-radius)',
  },
  md: {
    '--segmented-radius': radiusVars['--radius-2'],
    borderRadius: 'var(--segmented-radius)',
  },
  lg: {
    '--segmented-radius': radiusVars['--radius-2'],
    borderRadius: 'var(--segmented-radius)',
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
  value,
  onChange,
  label,
  size = 'md',
  isDisabled = false,
  children,
  xstyle,
}: XDSSegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled) return;

      const container = containerRef.current;
      if (!container) return;

      const items = Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          '[role="radio"]:not([aria-disabled="true"])',
        ),
      );
      if (items.length === 0) return;

      const currentIndex = items.findIndex(
        item => item === document.activeElement,
      );
      let nextIndex: number | null = null;

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

      if (nextIndex != null) {
        e.preventDefault();
        const nextItem = items[nextIndex];
        nextItem.focus();
        const nextValue = nextItem.dataset.value;
        if (nextValue != null) {
          onChange(nextValue);
        }
      }
    },
    [isDisabled, onChange],
  );

  const contextValue = useMemo(
    () => ({value, onChange, size, isDisabled}),
    [value, onChange, size, isDisabled],
  );

  return (
    <XDSSegmentedControlContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label={label}
        aria-disabled={isDisabled || undefined}
        onKeyDown={handleKeyDown}
        {...mergeProps(
          xdsClassName('segmented-control', {size}),
          stylex.props(
            styles.container,
            sizeStyles[size],
            isDisabled && styles.disabled,
            xstyle,
          ),
        )}>
        {children}
      </div>
    </XDSSegmentedControlContext.Provider>
  );
}

XDSSegmentedControl.displayName = 'XDSSegmentedControl';

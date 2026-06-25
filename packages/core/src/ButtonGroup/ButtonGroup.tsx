// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ButtonGroup.tsx
 * @input Uses React, StyleX, Button/IconButton children
 * @output Exports ButtonGroup component, context, and types
 * @position Groups buttons with connected styling; consumed by index.ts
 *
 * Children (Button, IconButton) consume the ButtonGroup context to
 * apply position-aware styles using CSS :first-child / :last-child
 * pseudo-classes — no cloneElement or wrapper divs needed.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ButtonGroup/ButtonGroup.doc.mjs (props table, features)
 * - /packages/core/src/ButtonGroup/ButtonGroup.test.tsx (tests)
 * - /packages/core/src/ButtonGroup/index.ts (exports if types change)
 * - /apps/storybook/stories/ButtonGroup.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/ButtonGroup/ (showcase blocks)
 */

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {ButtonSize} from '../Button';
import {SizeProvider, useSize} from '../SizeContext/SizeContext';
import {useListFocus} from '../hooks/useListFocus';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {ButtonGroupContext} from './ButtonGroupContext';
import type {ButtonGroupOrientation} from './ButtonGroupContext';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Props
// =============================================================================

export interface ButtonGroupProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Button or IconButton children.
   */
  children: ReactNode;

  /**
   * Accessible label for the group (used as aria-label).
   */
  label: string;

  /**
   * Orientation of the button group.
   * @default 'horizontal'
   */
  orientation?: ButtonGroupOrientation;

  /**
   * Default size for buttons in the group.
   * Individual buttons can override this with their own `size` prop.
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Whether all buttons in the group are disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  group: {
    display: 'inline-flex',
    alignItems: 'stretch',
  },
  vertical: {
    flexDirection: 'column',
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Groups buttons with connected styling — shared borders, proper border-radius
 * handling (only on outer edges), and horizontal or vertical orientation.
 *
 * Children automatically detect the group via context and apply position-aware
 * styles using CSS :first-child / :last-child pseudo-classes.
 *
 * @example
 * ```
 * <ButtonGroup label="Actions">
 *   <Button label="Copy" />
 *   <Button label="Cut" />
 *   <Button label="Paste" />
 * </ButtonGroup>
 * ```
 */
export function ButtonGroup({
  children,
  label,
  orientation = 'horizontal',
  size: sizeProp,
  isDisabled = false,
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
  ...props
}: ButtonGroupProps): ReactNode {
  const size = useSize(sizeProp, 'md');

  const {listRef, handleKeyDown} = useListFocus<HTMLDivElement>({
    itemSelector: 'button, [tabindex="0"]',
    orientation,
  });

  const contextValue = useMemo(
    () => ({orientation, isDisabled}),
    [orientation, isDisabled],
  );

  return (
    <ButtonGroupContext value={contextValue}>
      <SizeProvider value={size}>
        <div
          ref={mergeRefs(ref, listRef)}
          role="group"
          aria-label={label}
          onKeyDown={handleKeyDown}
          aria-orientation={orientation}
          aria-disabled={isDisabled || undefined}
          data-testid={testId}
          {...mergeProps(
            themeProps('button-group', {size, orientation}),
            stylex.props(
              styles.group,
              orientation === 'vertical' && styles.vertical,
              xstyle,
            ),
            className,
            style,
          )}
          {...props}>
          {children}
        </div>
      </SizeProvider>
    </ButtonGroupContext>
  );
}

ButtonGroup.displayName = 'ButtonGroup';

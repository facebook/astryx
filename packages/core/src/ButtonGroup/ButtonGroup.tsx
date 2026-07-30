// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ButtonGroup.tsx
 * @input Uses React, StyleX, Button/IconButton children
 * @output Exports ButtonGroup component, context, and types
 * @position Groups buttons with connected styling; consumed by index.ts
 *
 * Children (Button, IconButton) consume the ButtonGroup context to apply
 * position-aware styles in pure CSS — no cloneElement or wrapper divs needed.
 * The end-cap radius rules live in Button.tsx; see IS_LAST_ITEM there for why
 * the trailing edge cannot use :last-child (#2508).
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
import {radiusVars, shadowVars} from '../theme/tokens.stylex';
import type {Elevation} from '../utils/types';
import {SizeProvider, useSize} from '../SizeContext/SizeContext';
import {useListFocus} from '../hooks/useListFocus';
import {mergeProps, mergeRefs, composeEventHandlers} from '../utils';
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
   * Resting elevation for the group. The connected buttons share one surface,
   * so the shadow sits on the group and lifts them together. Use for a floating
   * group of actions above content.
   * @default 'none'
   */
  elevation?: Elevation;

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

// Resting elevation for the whole group — the connected buttons share one
// surface, so the shadow sits on the group wrapper and lifts them as a unit.
// The wrapper takes the element radius so the shadow follows the group's
// rounded outer corners rather than a bare rectangle. 'none' is the default.
const elevationStyles = stylex.create({
  none: {boxShadow: 'none'},
  low: {
    boxShadow: shadowVars['--shadow-low'],
    borderRadius: radiusVars['--radius-element'],
  },
  med: {
    boxShadow: shadowVars['--shadow-med'],
    borderRadius: radiusVars['--radius-element'],
  },
  high: {
    boxShadow: shadowVars['--shadow-high'],
    borderRadius: radiusVars['--radius-element'],
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
 * styles in pure CSS.
 *
 * Members that render their own layer — a Button with a `tooltip`, or a
 * DropdownMenu — compose correctly, including as the trailing member.
 *
 * @example
 * ```
 * <ButtonGroup label="Actions">
 *   <Button label="Copy" />
 *   <Button label="Cut" />
 *   <Button label="Paste" />
 * </ButtonGroup>
 * ```
 *
 * @example
 * ```
 * <ButtonGroup label="Approve action">
 *   <Button label="Allow once" variant="primary" />
 *   <DropdownMenu
 *     button={{label: 'Allow options', variant: 'primary', isIconOnly: true, icon: <Icon icon="chevronDown" />}}
 *     items={[{label: 'Allow for 30 minutes'}, {label: 'Always allow'}]}
 *   />
 * </ButtonGroup>
 * ```
 */
export function ButtonGroup({
  children,
  label,
  orientation = 'horizontal',
  size: sizeProp,
  isDisabled = false,
  elevation = 'none',
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
  onKeyDown,
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
          {...props}
          {...mergeProps(
            themeProps('button-group', {size, orientation}),
            stylex.props(
              styles.group,
              orientation === 'vertical' && styles.vertical,
              elevationStyles[elevation],
              xstyle,
            ),
            className,
            style,
          )}
          role="group"
          aria-label={label}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
          aria-disabled={isDisabled || undefined}
          data-testid={testId}>
          {children}
        </div>
      </SizeProvider>
    </ButtonGroupContext>
  );
}

ButtonGroup.displayName = 'ButtonGroup';

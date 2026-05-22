// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSToolbar.tsx
 * @input Uses XDSSection, XDSSizeContext, useListFocus, StyleX, spacingVars, sizeVars
 * @output Exports XDSToolbar component and XDSToolbarProps
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Toolbar/Toolbar.doc.mjs
 * - /packages/core/src/Toolbar/XDSToolbar.test.tsx
 * - /packages/core/src/Toolbar/index.ts
 * - /apps/storybook/stories/Toolbar.stories.tsx
 * - /packages/cli/templates/blocks/components/Toolbar/ (showcase blocks)
 */

import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import type {XDSSectionVariant} from '../Section/XDSSection';
import type {SpacingStep} from '../utils/types';
import type {XDSElementSize} from '../SizeContext/XDSSizeContext';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, sizeVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSSection} from '../Section/XDSSection';
import {useListFocus} from '../hooks/useListFocus';
import {XDSSizeProvider} from '../SizeContext/XDSSizeContext';
import {edgeCompSlot} from '../Layout/edgeCompensation.stylex';

/**
 * Map SpacingStep values to spacingVars keys.
 */
const spacingStepToVar: Record<SpacingStep, keyof typeof spacingVars> = {
  0: '--spacing-0',
  0.5: '--spacing-0-5',
  1: '--spacing-1',
  1.5: '--spacing-1-5',
  2: '--spacing-2',
  3: '--spacing-3',
  4: '--spacing-4',
  5: '--spacing-5',
  6: '--spacing-6',
  8: '--spacing-8',
  10: '--spacing-10',
};

const styles = stylex.create({
  // Two-slot layout (no centerContent): flex row, space-between
  baseFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Three-slot layout (with centerContent): CSS grid 1fr auto 1fr
  baseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
  },
  // Vertical orientation
  vertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  // Slot containers
  startSlot: {
    display: 'flex',
    alignItems: 'center',
  },
  centerSlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },
  endSlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // When only startContent is present, let it fill
  startOnly: {
    flex: '1 1 0%',
  },
  // When only endContent, push to end
  endOnly: {
    marginInlineStart: 'auto',
  },
});

const sizeStyles = stylex.create({
  base: {
    minHeight: sizeVars['--size-element-sm'],
  },
});

// Dynamic styles for configurable gap and tab indicator offset
const dynamicStyles = stylex.create({
  gap: (gapValue: string) => ({
    gap: gapValue,
  }),
  tabIndicatorBottom: (offset: string) => ({
    '--_tab-indicator-bottom': offset,
  }),
});

/**
 * Default block padding per toolbar size. Inline padding comes from the
 * parent container (Card, Section, LayoutHeader) via the Section's
 * theme default — the toolbar only controls its vertical tightness.
 */
const defaultBlockPaddingForSize: Record<XDSElementSize, SpacingStep> = {
  sm: 2,
  md: 2,
  lg: 2,
};

const blockPaddingVarForSize: Record<XDSElementSize, string> = {
  sm: spacingVars['--spacing-2'] as string,
  md: spacingVars['--spacing-2'] as string,
  lg: spacingVars['--spacing-2'] as string,
};

/**
 * Edge compensation inset amount per toolbar size.
 * Equals container-inline-padding minus the toolbar's block padding,
 * creating even spacing around edge-compensated items (ghost buttons, tabs).
 */
const edgeCompInsetForSize: Record<XDSElementSize, string> = {
  sm: `calc(var(--container-padding-inline-start, ${spacingVars['--spacing-4']}) - ${spacingVars['--spacing-2']})`,
  md: `calc(var(--container-padding-inline-start, ${spacingVars['--spacing-4']}) - ${spacingVars['--spacing-2']})`,
  lg: `calc(var(--container-padding-inline-start, ${spacingVars['--spacing-4']}) - ${spacingVars['--spacing-2']})`,
};

export type XDSToolbarSize = XDSElementSize;

export interface XDSToolbarProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root XDSSection element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content aligned to the start (left in LTR).
   */
  startContent?: ReactNode;
  /**
   * Content centered between start and end.
   * When provided, switches layout to CSS grid (1fr auto 1fr).
   */
  centerContent?: ReactNode;
  /**
   * Content aligned to the end (right in LTR).
   */
  endContent?: ReactNode;
  /**
   * Accessible label for the toolbar.
   * Applied as aria-label on the inner toolbar element.
   */
  label: string;
  /**
   * Size of the toolbar. Coordinates with Button, TextInput, TabList, and Selector —
   * children inherit this size as their default via XDSSizeContext.
   *
   * - `'sm'`: Compact — fits sm buttons/inputs (28px elements)
   * - `'md'`: Standard — fits md buttons/inputs (32px elements)
   * - `'lg'`: Spacious — fits lg buttons/inputs (36px elements)
   * @default 'md'
   */
  size?: XDSToolbarSize;
  /**
   * Gap between items within each slot, using the spacing scale.
   * @default 1
   */
  gap?: SpacingStep;
  /**
   * Orientation of the toolbar for keyboard navigation.
   * Controls which arrow keys navigate between items.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Visual variant passed through to XDSSection.
   * @default 'transparent'
   */
  variant?: XDSSectionVariant;

  /**
   * Which sides should have divider borders.
   * Passed through to XDSSection.
   * @example
   * ```
   * dividers={['bottom']}
   * ```
   */
  dividers?: Array<'top' | 'bottom' | 'start' | 'end'>;
}

/**
 * General-purpose toolbar with start, center, and end content slots.
 *
 * Built on XDSSection, provides flex/grid layout with roving tabindex
 * keyboard navigation via useListFocus. Cascades `size` to child components
 * (Button, TextInput, TabList, Selector) via XDSSizeContext, and applies
 * edge compensation so ghost buttons align flush at container edges.
 *
 * @example
 * ```
 * <XDSToolbar label="Actions" size="sm"
 *   startContent={<XDSButton label="Cut" variant="ghost" />}
 *   endContent={<XDSButton label="Settings" variant="ghost" />}
 * />
 * ```
 */
export function XDSToolbar({
  startContent,
  centerContent,
  endContent,
  label,
  size = 'md',
  gap = 1,
  orientation = 'horizontal',
  variant = 'transparent',
  dividers,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSToolbarProps) {
  const hasCenterContent = centerContent != null;
  const hasStartContent = startContent != null;
  const hasEndContent = endContent != null;

  const gapVar = spacingVars[spacingStepToVar[gap]] as string;

  const {listRef, handleKeyDown} = useListFocus<HTMLDivElement>({
    itemSelector: 'button, input, [tabindex="0"]',
    orientation,
  });

  return (
    <XDSSizeProvider value={size}>
      <XDSSection
        ref={ref}
        variant={variant}
        paddingBlock={defaultBlockPaddingForSize[size]}
        dividers={dividers}
        xstyle={xstyle}
        className={className}
        style={style}>
        <div
          ref={listRef}
          role="toolbar"
          aria-label={label}
          aria-orientation={orientation}
          onKeyDown={handleKeyDown}
          {...mergeProps(
            xdsClassName('toolbar', {size}),
            stylex.props(
              hasCenterContent ? styles.baseGrid : styles.baseFlex,
              orientation === 'vertical' && styles.vertical,
              sizeStyles.base,
              dynamicStyles.gap(gapVar),
              dynamicStyles.tabIndicatorBottom(
                `calc(-1 * (${blockPaddingVarForSize[size]}${dividers?.includes('bottom') ? ' + 1px' : ''}))`,
              ),
            ),
          )}
          {...props}>
          {hasCenterContent ? (
            // Three-slot grid layout
            <>
              <div
                {...stylex.props(
                  styles.startSlot,
                  edgeCompSlot.inset(edgeCompInsetForSize[size]),
                  dynamicStyles.gap(gapVar),
                )}>
                {startContent}
              </div>
              <div
                {...stylex.props(styles.centerSlot, dynamicStyles.gap(gapVar))}>
                {centerContent}
              </div>
              <div
                {...stylex.props(
                  styles.endSlot,
                  edgeCompSlot.inset(edgeCompInsetForSize[size]),
                  dynamicStyles.gap(gapVar),
                )}>
                {endContent}
              </div>
            </>
          ) : (
            // Two-slot flex layout
            <>
              {hasStartContent && (
                <div
                  {...stylex.props(
                    styles.startSlot,
                    !hasEndContent && styles.startOnly,
                    edgeCompSlot.inset(edgeCompInsetForSize[size]),
                    dynamicStyles.gap(gapVar),
                  )}>
                  {startContent}
                </div>
              )}
              {hasEndContent && (
                <div
                  {...stylex.props(
                    styles.endSlot,
                    !hasStartContent && styles.endOnly,
                    edgeCompSlot.inset(edgeCompInsetForSize[size]),
                    dynamicStyles.gap(gapVar),
                  )}>
                  {endContent}
                </div>
              )}
            </>
          )}
        </div>
      </XDSSection>
    </XDSSizeProvider>
  );
}

XDSToolbar.displayName = 'XDSToolbar';

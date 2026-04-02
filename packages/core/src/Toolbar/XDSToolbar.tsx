'use client';

/**
 * @file XDSToolbar.tsx
 * @input Uses XDSSection, useListFocus, StyleX, spacingVars
 * @output Exports XDSToolbar component and XDSToolbarProps
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Toolbar/Toolbar.doc.mjs
 * - /packages/core/src/Toolbar/XDSToolbar.test.tsx
 * - /packages/core/src/Toolbar/index.ts
 * - /apps/storybook/stories/Toolbar.stories.tsx
 */

import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import type {XDSSectionVariant} from '../Section/XDSSection';
import type {SpacingStep} from '../utils/types';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSSection} from '../Section/XDSSection';
import {useListFocus} from '../hooks/useListFocus';

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
  // Compact density: tighter height
  compact: {
    minHeight: spacingVars['--spacing-8'],
  },
  defaultDensity: {
    minHeight: spacingVars['--spacing-10'],
  },
  // Slot containers
  // Start and end slots add horizontal padding (spacing-2 = 8px) so that
  // combined with the section's 8px padding, content aligns at 16px from edges.
  // This split enables future edge compensation: ghost buttons can negate
  // the slot padding while the section padding remains.
  startSlot: {
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: spacingVars['--spacing-2'],
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
    paddingInlineEnd: spacingVars['--spacing-2'],
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

// Dynamic styles for configurable gap
const dynamicStyles = stylex.create({
  gap: (gapValue: string) => ({
    gap: gapValue,
  }),
});

export interface XDSToolbarProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root XDSSection element */
  ref?: React.Ref<HTMLElement>;
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
   * Density of the toolbar.
   * - 'default': Standard height (40px min)
   * - 'compact': Reduced height (32px min)
   * @default 'default'
   */
  density?: 'compact' | 'default';
  /**
   * Gap between items within each slot, using the spacing scale.
   * @default 2
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
   * Internal padding using the spacing scale.
   * Passed through to XDSSection.
   * @default 2 (8px) — combined with 8px slot padding = 16px from edges
   */
  padding?: SpacingStep;
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
 * keyboard navigation via useListFocus.
 *
 * @example
 * ```
 * <XDSToolbar
 *   label="Actions"
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
  density = 'default',
  gap = 2,
  orientation = 'horizontal',
  variant = 'transparent',
  padding,
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

  const {listRef, handleKeyDown} = useListFocus({
    itemSelector: 'button, input, [tabindex="0"]',
    orientation,
  });

  return (
    <XDSSection
      ref={ref}
      variant={variant}
      padding={padding ?? 2}
      dividers={dividers}
      xstyle={xstyle}
      className={className}
      style={style}>
      <div
        ref={listRef as React.RefObject<HTMLDivElement>}
        role="toolbar"
        aria-label={label}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        {...mergeProps(
          xdsClassName('toolbar', {density}),
          stylex.props(
            hasCenterContent ? styles.baseGrid : styles.baseFlex,
            orientation === 'vertical' && styles.vertical,
            density === 'compact' ? styles.compact : styles.defaultDensity,
            dynamicStyles.gap(gapVar),
          ),
        )}
        {...props}>
        {hasCenterContent ? (
          // Three-slot grid layout
          <>
            <div {...stylex.props(styles.startSlot, dynamicStyles.gap(gapVar))}>
              {startContent}
            </div>
            <div
              {...stylex.props(styles.centerSlot, dynamicStyles.gap(gapVar))}>
              {centerContent}
            </div>
            <div {...stylex.props(styles.endSlot, dynamicStyles.gap(gapVar))}>
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
                  dynamicStyles.gap(gapVar),
                )}>
                {endContent}
              </div>
            )}
          </>
        )}
      </div>
    </XDSSection>
  );
}

XDSToolbar.displayName = 'XDSToolbar';

/**
 * @file XDSScrollableArea.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSScrollableArea component and XDSScrollableAreaProps
 * @position Custom scrollable container with styled scrollbars — vertical, horizontal, or both
 *
 * CSS-styled native scrollbars. No custom thumb/track DOM structure — simpler,
 * better performance, and sufficient for internal tool UIs.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ScrollableArea/index.ts (exports)
 * - /packages/core/src/ScrollableArea/README.md
 * - /apps/storybook/stories/ScrollableArea.stories.tsx
 */

'use client';

import {
  forwardRef,
  useContext,
  type ReactNode,
  type CSSProperties,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';

// =============================================================================
// Types
// =============================================================================

export type XDSScrollableAreaOrientation = 'vertical' | 'horizontal' | 'both';
export type XDSScrollableAreaSize = 'sm' | 'md';

// =============================================================================
// Module Augmentation - Register component styles with ComponentStyles
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    scrollableArea?: {
      /** Root container styles */
      root?: ThemeStyleXStyles;
    };
  }
}

export interface XDSScrollableAreaProps {
  /**
   * Content to render inside the scrollable area.
   */
  children: ReactNode;

  /**
   * Which axes are scrollable.
   * @default "vertical"
   */
  orientation?: XDSScrollableAreaOrientation;

  /**
   * Size of the scrollbar track.
   * - sm: Thin scrollbar (4px), good for sidebars and compact UIs
   * - md: Standard scrollbar (8px), default for content areas
   * @default "md"
   */
  size?: XDSScrollableAreaSize;

  /**
   * Whether to always show the scrollbar or only on hover/scroll.
   * @default false
   */
  isAlwaysVisible?: boolean;

  /**
   * Maximum height constraint. Numbers are px, strings used as-is.
   * Only applies when orientation includes vertical scrolling.
   */
  maxHeight?: number | string;

  /**
   * Maximum width constraint. Numbers are px, strings used as-is.
   * Only applies when orientation includes horizontal scrolling.
   */
  maxWidth?: number | string;

  /**
   * Accessible label for the scrollable region.
   * When provided, adds `role="region"` and `aria-label` for landmark navigation.
   */
  label?: string;

  /**
   * Optional StyleX overrides for the outer container.
   */
  xstyle?: stylex.StyleXStyles;

  /**
   * Test ID for the scrollable container.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    position: 'relative',
    // Scrollbar styling (WebKit + standard)
    scrollbarColor: `${colorVars['--color-text-disabled']} transparent`,
  },
  // Orientation
  vertical: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  horizontal: {
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  both: {
    overflowX: 'auto',
    overflowY: 'auto',
  },
  // Size
  sizeSm: {
    scrollbarWidth: 'thin',
  },
  sizeMd: {
    scrollbarWidth: 'auto',
  },
  // Visibility
  autoHide: {
    scrollbarWidth: {
      default: 'none',
      ':hover': null,
      ':focus-within': null,
    },
  },
  // Focus
  focusVisible: {
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '-2px',
    },
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Custom scrollable container with styled scrollbars.
 *
 * Uses CSS-styled native scrollbars — no custom DOM structure.
 * Supports vertical, horizontal, or both-axis scrolling.
 *
 * @example
 * ```tsx
 * <XDSScrollableArea maxHeight={400}>
 *   <LongContent />
 * </XDSScrollableArea>
 *
 * <XDSScrollableArea orientation="horizontal" maxWidth="100%">
 *   <WideTable />
 * </XDSScrollableArea>
 *
 * <XDSScrollableArea
 *   orientation="vertical"
 *   size="sm"
 *   isAlwaysVisible
 *   maxHeight="calc(100vh - 64px)"
 *   label="Sidebar navigation"
 * >
 *   <SidebarNav />
 * </XDSScrollableArea>
 * ```
 */
export const XDSScrollableArea = forwardRef<
  HTMLDivElement,
  XDSScrollableAreaProps
>(
  (
    {
      children,
      orientation = 'vertical',
      size = 'md',
      isAlwaysVisible = false,
      maxHeight,
      maxWidth,
      label,
      xstyle,
      'data-testid': testId,
    },
    ref,
  ) => {
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.scrollableArea?.root;

    const orientationStyle =
      orientation === 'horizontal'
        ? styles.horizontal
        : orientation === 'both'
          ? styles.both
          : styles.vertical;

    const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;

    // Build inline style for dimension constraints
    const inlineStyle: CSSProperties = {};
    if (maxHeight != null) {
      inlineStyle.maxHeight =
        typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
    }
    if (maxWidth != null) {
      inlineStyle.maxWidth =
        typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
    }

    // Landmark semantics when label is provided
    const landmarkProps = label
      ? {role: 'region' as const, 'aria-label': label}
      : {};

    return (
      <div
        ref={ref}
        tabIndex={0}
        data-testid={testId}
        {...landmarkProps}
        style={inlineStyle}
        {...stylex.props(
          styles.root,
          orientationStyle,
          sizeStyle,
          !isAlwaysVisible && styles.autoHide,
          styles.focusVisible,
          rootOverride,
          xstyle,
        )}>
        {children}
      </div>
    );
  },
);

XDSScrollableArea.displayName = 'XDSScrollableArea';

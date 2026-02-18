/**
 * @file XDSFontWrapper.tsx
 * @input Uses React, StyleX, Theme, reset.css
 * @output Exports XDSFontWrapper component
 * @position Typography component; provides base styles for wrapped content
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/README.md
 * - /packages/core/src/Text/index.ts
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import {useTheme} from '../theme/XDSTheme';
import '../typography.css';

/**
 * Heading scale variant
 */
export type XDSFontWrapperVariant = 'default' | 'editorial';

/**
 * Props for XDSFontWrapper
 */
export interface XDSFontWrapperProps {
  /**
   * Heading scale variant
   * - 'default': Dense scale for internal tools (h1: 20px)
   * - 'editorial': Larger scale for content-heavy pages (h1: 32px)
   * @default 'default'
   */
  variant?: XDSFontWrapperVariant;

  /**
   * Children to render
   */
  children: React.ReactNode;

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * XDSFontWrapper
 *
 * Applies base typography styles to native HTML elements within its scope.
 * Uses the reset.css stylesheet which references theme CSS custom properties.
 *
 * @example
 * // Default variant (dense scale)
 * <XDSFontWrapper>
 *   <h1>Page Title</h1>
 *   <p>Body text with <strong>bold</strong> and <em>italic</em>.</p>
 *   <ul>
 *     <li>List item 1</li>
 *     <li>List item 2</li>
 *   </ul>
 * </XDSFontWrapper>
 *
 * @example
 * // Editorial variant (larger heading scale)
 * <XDSFontWrapper variant="editorial">
 *   <h1>Article Title</h1>
 *   <p>Body text for long-form content.</p>
 * </XDSFontWrapper>
 *
 * @example
 * // For global usage, apply to body:
 * // import '@xds/core/typography.css';
 * // <body className="xds-typography">
 */
export function XDSFontWrapper({
  variant = 'default',
  children,
  'data-testid': testId,
}: XDSFontWrapperProps): React.ReactElement {
  const {theme} = useTheme();
  const proseBase = theme.components?.prose?.base;

  // Combine StyleX base styles with CSS typography class
  const typographyClass =
    variant === 'editorial'
      ? 'xds-typography xds-typography--editorial'
      : 'xds-typography xds-typography--default';

  const stylexProps = stylex.props(proseBase);

  return (
    <div
      className={`${typographyClass} ${stylexProps.className ?? ''}`.trim()}
      style={stylexProps.style}
      data-testid={testId}>
      {children}
    </div>
  );
}

XDSFontWrapper.displayName = 'XDSFontWrapper';

/**
 * Hook to access font wrapper styles from the current theme.
 * Use this for applying styles to native HTML elements programmatically.
 *
 * @example
 * const { headingStyles, proseStyles } = useXDSFontWrapperStyles();
 *
 * <h1 {...stylex.props(headingStyles?.h1)}>Title</h1>
 * <p {...stylex.props(proseStyles?.p)}>Paragraph</p>
 */
export function useXDSFontWrapperStyles() {
  const {theme} = useTheme();

  return {
    /** Base wrapper styles */
    base: theme.components?.prose?.base,
    /** Default heading styles (h1-h6) */
    headingStyles: theme.components?.heading?.styles,
    /** Editorial heading styles (h1-h6, larger scale) */
    editorialHeadingStyles: theme.components?.heading?.editorialStyles,
    /** Prose element styles (p, ul, ol, li, blockquote, code, pre, hr, etc.) */
    proseStyles: theme.components?.prose?.styles,
  };
}

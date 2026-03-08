/**
 * @file XDSFontWrapper.tsx
 * @input Uses React, reset.css
 * @output Exports XDSFontWrapper component
 * @position Typography component; provides base styles for wrapped content
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/Text.doc.mjs
 * - /packages/core/src/Text/index.ts
 */

import * as React from 'react';
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
 * ```
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
 * // Editorial variant (larger heading scale)
 * <XDSFontWrapper variant="editorial">
 *   <h1>Article Title</h1>
 *   <p>Body text for long-form content.</p>
 * </XDSFontWrapper>
 *
 * // For global usage, apply to body:
 * // import '@xds/core/typography.css';
 * // <body className="xds-typography">
 * ```
 */
export function XDSFontWrapper({
  variant = 'default',
  children,
  'data-testid': testId,
}: XDSFontWrapperProps): React.ReactElement {
  // Combine CSS typography class for prose styling
  const typographyClass =
    variant === 'editorial'
      ? 'xds-typography xds-typography--editorial'
      : 'xds-typography xds-typography--default';

  return (
    <div className={typographyClass} data-testid={testId}>
      {children}
    </div>
  );
}

XDSFontWrapper.displayName = 'XDSFontWrapper';

/**
 * Hook to access font wrapper styles from the current theme.
 *
 * @deprecated Theme component styles are now applied via CSS classes.
 * Use the `.xds-typography` class instead of reading styles from context.
 */
export function useXDSFontWrapperStyles() {
  return {
    base: undefined,
    headingStyles: undefined,
    editorialHeadingStyles: undefined,
    proseStyles: undefined,
  };
}

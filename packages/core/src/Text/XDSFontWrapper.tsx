/**
 * @file XDSFontWrapper.tsx
 * @input Uses React, typography.css
 * @output Exports XDSFontWrapper component
 * @position Typography component; provides prose styles for wrapped HTML content
 *
 * XDSFontWrapper applies base typography styles to native HTML elements
 * (h1-h6, p, ul, ol, blockquote, code, etc.) within its scope. Sizing is
 * driven by type scale tokens set by the theme's typeScale configuration.
 *
 * For different density regions, nest <XDSTheme> with a different typeScale
 * rather than using a variant prop.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/Text.doc.mjs
 * - /packages/core/src/Text/index.ts
 */

import * as React from 'react';
import '../typography.css';

/**
 * Props for XDSFontWrapper
 */
export interface XDSFontWrapperProps {
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
 * Uses typography.css which references theme CSS custom properties (type scale tokens).
 *
 * Typography sizing is controlled by the theme's `typeScale` configuration.
 * For mixed density regions, nest a `<XDSTheme>` with a different `typeScale`
 * instead of using a variant prop.
 *
 * @example
 * ```
 * <XDSFontWrapper>
 *   <h1>Page Title</h1>
 *   <p>Body text with <strong>bold</strong> and <em>italic</em>.</p>
 *   <ul>
 *     <li>List item 1</li>
 *     <li>List item 2</li>
 *   </ul>
 * </XDSFontWrapper>
 * ```
 */
export function XDSFontWrapper({
  children,
  'data-testid': testId,
}: XDSFontWrapperProps): React.ReactElement {
  return (
    <div className="xds-typography" data-testid={testId}>
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
    proseStyles: undefined,
  };
}

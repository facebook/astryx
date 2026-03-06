/**
 * @file XDSAspectRatio.tsx
 * @input Uses React forwardRef, stylex
 * @output Exports XDSAspectRatio component and XDSAspectRatioProps
 * @position AspectRatio component; maintains a specific aspect ratio for its children
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AspectRatio/README.md
 * - /packages/core/src/AspectRatio/XDSAspectRatio.test.tsx
 * - /apps/storybook/stories/AspectRatio.stories.tsx
 */

'use client';

import {
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';

// =============================================================================
// Module Augmentation - Register component styles with ComponentStyles
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    aspectRatio?: {
      /** Root container styles */
      root?: ThemeStyleXStyles;
    };
  }
}
export interface XDSAspectRatioProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className'
> {
  /**
   * The aspect ratio as width/height (e.g., 16/9 = 1.777..., 4/3 = 1.333..., 1 for square).
   */
  ratio: number;

  /**
   * Content to render inside the aspect ratio container.
   * The child element will be positioned absolutely to fill the container.
   */
  children: ReactNode;

  /**
   * StyleX styles to apply to the aspect ratio container.
   */
  xstyle?: StyleXStyles;
}

const styles = stylex.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  child: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});

/**
 * AspectRatio component for maintaining a specific aspect ratio for its children.
 *
 * Uses the CSS aspect-ratio property to maintain the ratio. The child element
 * is positioned absolutely to fill the container, which is useful for images,
 * videos, embeds, and placeholders.
 *
 * @example
 * ```
 * <XDSAspectRatio ratio={16 / 9}>
 *   <img src="image.jpg" alt="Widescreen image" style={{objectFit: 'cover'}} />
 * </XDSAspectRatio>
 * ```
 */
export const XDSAspectRatio = forwardRef<HTMLElement, XDSAspectRatioProps>(
  function XDSAspectRatio({ratio, children, xstyle, ...props}, ref) {
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.aspectRatio?.root;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        {...stylex.props(styles.container, xstyle, rootOverride)}
        style={{aspectRatio: ratio}}
        {...props}>
        <div {...stylex.props(styles.child)}>{children}</div>
      </div>
    );
  },
);

XDSAspectRatio.displayName = 'XDSAspectRatio';

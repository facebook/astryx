/**
 * @file XDSTopNavTitleIcon.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSTopNavTitleIcon component and XDSTopNavTitleIconProps
 * @position Companion component for XDSTopNavTitle logo slot
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/README.md
 * - /packages/core/src/TopNav/XDSTopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 */

import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, sizeVars} from '../theme/tokens.stylex';

/**
 * TitleIcon styles
 */
const styles = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-icon-on-media'],
    flexShrink: 0,
  },
  sm: {
    width: sizeVars['--size-sm'],
    height: sizeVars['--size-sm'],
  },
  md: {
    width: sizeVars['--size-md'],
    height: sizeVars['--size-md'],
  },
  lg: {
    width: sizeVars['--size-lg'],
    height: sizeVars['--size-lg'],
  },
});

/**
 * Size variants for the title icon
 */
export type XDSTopNavTitleIconSize = 'sm' | 'md' | 'lg';

export interface XDSTopNavTitleIconProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'style' | 'className'
> {
  /**
   * The icon element to render inside the circular background.
   * Should be an XDSIcon or similar icon component.
   */
  icon: ReactNode;
  /**
   * Size of the circular icon container.
   * @default 'md'
   */
  size?: XDSTopNavTitleIconSize;
}

/**
 * Circular icon container for XDSTopNavTitle.
 *
 * Wraps an icon with a circular colored background, suitable for
 * use as a logo in the top navigation title area.
 *
 * @example
 * ```tsx
 * import {HomeIcon} from '@heroicons/react/24/solid';
 *
 * <XDSTopNavTitle
 *   title="Dashboard"
 *   logo={
 *     <XDSTopNavTitleIcon
 *       icon={<HomeIcon style={{width: 16, height: 16}} />}
 *     />
 *   }
 * />
 * ```
 */
export const XDSTopNavTitleIcon = forwardRef<
  HTMLSpanElement,
  XDSTopNavTitleIconProps
>(function XDSTopNavTitleIcon({icon, size = 'md', ...props}, ref) {
  return (
    <span ref={ref} {...stylex.props(styles.base, styles[size])} {...props}>
      {icon}
    </span>
  );
});

XDSTopNavTitleIcon.displayName = 'XDSTopNavTitleIcon';

/**
 * @file XDSNavIcon.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSNavIcon component and XDSNavIconProps
 * @position Shared circular icon container for navigation headers (TopNav, PageNav)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/NavIcon/NavIcon.doc.mjs
 * - /packages/core/src/NavIcon/XDSNavIcon.test.tsx
 * - /packages/core/src/NavIcon/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 * - /apps/storybook/stories/PageNav.stories.tsx
 */

import {forwardRef, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, sizeVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * NavIcon styles
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
    width: sizeVars['--size-md'],
    height: sizeVars['--size-md'],
  },
});

export interface XDSNavIconProps extends XDSBaseProps<HTMLDivElement> {
  /**
   * The icon element to render inside the circular background.
   * Should be an XDSIcon or similar icon component.
   */
  icon: ReactNode;
}

/**
 * Circular icon container for navigation headers.
 *
 * Wraps an icon with a circular accent-colored background, suitable for
 * use as a logo in top navigation or side navigation title areas.
 *
 * @example
 * ```
 * import {HomeIcon} from '@heroicons/react/24/solid';
 *
 * // In XDSTopNavTitle
 * <XDSTopNavTitle
 *   title="Dashboard"
 *   logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
 * />
 *
 * // In XDSPageNavHeader
 * <XDSPageNavHeader
 *   icon={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
 *   title="My App"
 * />
 * ```
 */
export const XDSNavIcon = forwardRef<HTMLSpanElement, XDSNavIconProps>(
  function XDSNavIcon({icon, className, style, ...props}, ref) {
    return (
      <span
        ref={ref}
        {...mergeProps(
          xdsClassName('navicon'),
          stylex.props(styles.base),
          className,
          style,
        )}
        {...props}>
        {icon}
      </span>
    );
  },
);

XDSNavIcon.displayName = 'XDSNavIcon';

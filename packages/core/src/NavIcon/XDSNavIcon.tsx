/**
 * @file XDSNavIcon.tsx
 * @input Uses React, HTMLAttributes, ReactNode
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

import {type ReactNode} from 'react';
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
    color: colorVars['--color-on-accent'],
    flexShrink: 0,
    width: sizeVars['--size-element-md'],
    height: sizeVars['--size-element-md'],
  },
});

export interface XDSNavIconProps extends XDSBaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
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
 * <XDSTopNavHeading
 *   heading="Dashboard"
 *   logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
 * />
 * <XDSPageNavHeader
 *   icon={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
 *   heading="My App"
 * />
 * ```
 */
export function XDSNavIcon({
  icon,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSNavIconProps) {
  return (
    <span
      ref={ref}
      {...mergeProps(
        xdsClassName('navicon'),
        stylex.props(styles.base, xstyle),
        className,
        style,
      )}
      {...props}>
      {icon}
    </span>
  );
}

XDSNavIcon.displayName = 'XDSNavIcon';

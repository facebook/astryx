// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavMobileBar.tsx
 * @input Uses StyleX, topNavStyles, themeProps
 * @output Exports TopNavMobileBar: TopNav in AppShell's mobile bar (heading,
 *   end content, drawer toggle)
 * @position Shared by the client TopNav (TopNav.tsx) and TopNavFrame.tsx, which
 *   renders it for a server-rendered TopNav the moment AppShell switches to
 *   its mobile bar, without waiting for the client TopNav to load. Reads no
 *   context: each caller supplies the label and the toggle.
 *
 * SYNC: When modified, update TopNav.tsx and TopNavFrame.tsx.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {topNavStyles as styles} from './topNavStyles';
import type {TopNavProps} from './TopNav';

export type TopNavMobileBarProps = Omit<
  TopNavProps,
  'startContent' | 'children' | 'centerContent' | 'label'
> & {
  /** The landmark's accessible name. */
  label: string;
  /** The drawer toggle, or null when there is no drawer to open. */
  toggle: ReactNode;
};

/** TopNav in AppShell's mobile bar: heading, end content and the toggle. */
export function TopNavMobileBar({
  ref,
  label,
  heading,
  endContent,
  toggle,
  xstyle,
  className,
  style,
  ...rest
}: TopNavMobileBarProps): ReactNode {
  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label={label}
      {...mergeProps(
        themeProps('top-nav', {mode: 'mobile-bar'}),
        stylex.props(styles.mobileBar, xstyle),
        className,
        style,
      )}
      {...rest}>
      {heading && (
        <div {...stylex.props(styles.mobileBarHeading)}>{heading}</div>
      )}
      <div {...stylex.props(styles.mobileBarEnd)}>
        {endContent}
        {toggle}
      </div>
    </nav>
  );
}

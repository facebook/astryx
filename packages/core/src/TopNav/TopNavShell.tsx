// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavShell.tsx
 * @input Uses topNavStyles, TopNavFrame, TopNavSlotScope, the client TopNav
 * @output Exports TopNav: the server shell resolved by the `react-server`
 *   entry (index.server.ts)
 * @position Server-safe TopNav. Imports no client React API, so a Server
 *   Component renders the desktop bar on the server: the same sections,
 *   classes and slots the client TopNav renders in its default mode. Its
 *   client parts are TopNavFrame (the landmark, and the hand-over to the
 *   client TopNav in AppShell's mobile bar and drawer), TopNavLocalizedFrame
 *   (only without a `label`: the default label in the page's locale) and
 *   TopNavSlotScope (the slot context menus read). A TopNav with
 *   a `ref` or another function-valued prop renders the client TopNav.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TopNav/TopNav.tsx (default mode markup)
 * - /packages/core/src/TopNav/TopNavFrame.tsx
 * - /packages/core/src/TopNav/TopNavShell.test.tsx
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {TopNav as ClientTopNav, type TopNavProps} from './TopNav';
import {TopNavFrame, TopNavSlotScope} from './TopNavFrame';
import {TopNavLocalizedFrame} from './TopNavLocalizedFrame';
import {getTopNavRootProps, topNavStyles as styles} from './topNavStyles';

/**
 * Whether these props need the client TopNav. Exported for the server-render
 * tests; not part of the public API.
 */
export function needsClientTopNav(props: TopNavProps): boolean {
  return (
    props.ref != null ||
    Object.values(props).some(value => typeof value === 'function')
  );
}

/**
 * Top navigation bar for application headers. Same API as the client TopNav;
 * see TopNav.tsx.
 */
export function TopNav(props: TopNavProps): ReactNode {
  if (needsClientTopNav(props)) {
    return <ClientTopNav {...props} />;
  }

  const {
    heading,
    startContent,
    children,
    centerContent,
    endContent,
    label,
    xstyle,
    className,
    style,
    ...rest
  } = props;
  const resolvedStartContent = startContent ?? children;
  const hasCenterContent = centerContent != null;

  const rootProps = {
    ...getTopNavRootProps({hasCenterContent, xstyle, className, style}),
    ...rest,
  };

  // TopNav.tsx default mode, section for section.
  const sections = (
    <>
      <div {...stylex.props(styles.leftSection)}>
        {heading && <div {...stylex.props(styles.heading)}>{heading}</div>}
        {resolvedStartContent && (
          <TopNavSlotScope slot="start">
            <div {...stylex.props(styles.startContent)}>
              {resolvedStartContent}
            </div>
          </TopNavSlotScope>
        )}
      </div>
      {hasCenterContent && (
        <TopNavSlotScope slot="center">
          <div {...stylex.props(styles.centerContent)}>{centerContent}</div>
        </TopNavSlotScope>
      )}
      {hasCenterContent ? (
        <div {...stylex.props(styles.rightSection)}>
          <TopNavSlotScope slot="end">{endContent}</TopNavSlotScope>
        </div>
      ) : (
        endContent && (
          <div {...stylex.props(styles.endContent)}>
            <TopNavSlotScope slot="end">{endContent}</TopNavSlotScope>
          </div>
        )
      )}
    </>
  );
  // Only a TopNav without a label loads the translator for its default one.
  return label != null ? (
    <TopNavFrame topNavProps={props} label={label} rootProps={rootProps}>
      {sections}
    </TopNavFrame>
  ) : (
    <TopNavLocalizedFrame topNavProps={props} rootProps={rootProps}>
      {sections}
    </TopNavLocalizedFrame>
  );
}

TopNav.displayName = 'TopNav';

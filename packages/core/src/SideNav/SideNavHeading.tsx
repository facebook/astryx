// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavHeading.tsx
 * @input Uses React lazy/Suspense, ReactNode, LinkComponentType
 * @output Exports SideNavHeading component and SideNavHeadingProps
 * @position Core implementation; used inside SideNav header slot
 *
 * Product/suite/account heading with smart interaction boundary logic.
 * Lazy-loads the popover implementation when menu prop is provided.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/SideNav/ (showcase blocks)
 */

import {lazy, Suspense, type ReactNode} from 'react';
import type {LinkComponentType} from '../Link/types';
import type {BaseProps} from '../BaseProps';
import {SideNavHeadingStatic} from './SideNavHeadingStatic';

const LazySideNavHeadingWithMenu = lazy(
  async () => import('./SideNavHeadingWithMenu'),
);

export interface SideNavHeadingProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Product/app icon.
   */
  icon?: ReactNode;
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by LinkProvider.
   * Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
  /**
   * Product/app name.
   */
  heading: string;
  /**
   * Link for the heading (e.g., product home).
   */
  headingHref?: string;
  /**
   * Text above the heading (e.g., suite name).
   */
  superheading?: string;
  /**
   * Link for the superheading (e.g., suite home).
   */
  superheadingHref?: string;
  /**
   * Text below the heading (e.g., account context).
   */
  subheading?: string;
  /**
   * Link for the subheading.
   */
  subheadingHref?: string;
  /**
   * Content rendered at the trailing edge of the heading row.
   * Hidden in collapsed mode.
   */
  headerEndContent?: ReactNode;
  /**
   * Menu content shown in a popover. When provided, the header composes
   * usePopover internally and shows a dropdown chevron. The trigger
   * boundary is determined automatically:
   * - No hrefs → whole header is the trigger
   * - With hrefs → links are independent, chevron/remaining area is the trigger
   */
  menu?: ReactNode;
}


export function SideNavHeading({menu, ...rest}: SideNavHeadingProps) {
  if (menu) {
    return (
      <Suspense fallback={<SideNavHeadingStatic {...rest} />}>
        <LazySideNavHeadingWithMenu menu={menu} {...rest} />
      </Suspense>
    );
  }
  return <SideNavHeadingStatic {...rest} />;
}

SideNavHeading.displayName = 'SideNavHeading';

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavHeading.tsx
 * @input Uses React, useRef, useCallback, ReactNode, StyleX, usePopover
 * @output Exports SideNavHeading component and SideNavHeadingProps
 * @position Core implementation; used inside SideNav header slot
 *
 * Product/suite/account heading with smart interaction boundary logic.
 * Composes usePopover internally when menu prop is provided.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/templates/blocks/components/SideNav/ (showcase blocks)
 */

import {lazy, Suspense, type ReactNode} from 'react';
import type {LinkComponentType} from '../Link/types';
import type {BaseProps} from '../BaseProps';
import {SideNavHeadingStatic} from './SideNavHeadingStatic';

const LazySideNavHeadingWithMenu = lazy(
  async () => import('./SideNavHeadingWithMenu'),
);

export interface SideNavHeadingProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  icon?: ReactNode;
  as?: LinkComponentType;
  heading: string;
  headingHref?: string;
  superheading?: string;
  superheadingHref?: string;
  subheading?: string;
  subheadingHref?: string;
  headerEndContent?: ReactNode;
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

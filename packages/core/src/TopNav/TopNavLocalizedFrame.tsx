// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavLocalizedFrame.tsx
 * @input Uses useTranslator and TopNavFrame
 * @output Exports TopNavLocalizedFrame: TopNavFrame with the default landmark
 *   label in the page's locale
 * @position Client part of TopNavShell.tsx, rendered only for a TopNav with no
 *   `label`. The locale is client context, so a Server Component cannot
 *   translate the default label; keeping the translator out of TopNavFrame
 *   means a labelled TopNav does not load the message catalog.
 *
 * SYNC: When modified, update TopNavFrame.tsx, TopNavShell.tsx and
 * /packages/core/src/__tests__/serverEntryClientParts.ts
 */

import type {ReactNode} from 'react';
import {useTranslator} from '../i18n';
import {TopNavFrame, type TopNavFrameProps} from './TopNavFrame';

export type TopNavLocalizedFrameProps = Omit<TopNavFrameProps, 'label'>;

/** TopNavFrame labelled with the localized default landmark label. */
export function TopNavLocalizedFrame(
  props: TopNavLocalizedFrameProps,
): ReactNode {
  const t = useTranslator();
  return <TopNavFrame {...props} label={t('@astryx.topNav.landmarkLabel')} />;
}

TopNavLocalizedFrame.displayName = 'TopNavLocalizedFrame';

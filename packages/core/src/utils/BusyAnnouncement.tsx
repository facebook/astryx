// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BusyAnnouncement.tsx
 * @input Effective task-owner busy state and an optional localized message
 * @output Private owner anchor delegating delivery to useBusyAnnouncement
 * @position AST-086 FR6/FR8 adapter for owners without a stable element ref;
 *   mounted outside conditional indicators and replaceable presentation slots
 */

import {useRef} from 'react';
import {useBusyAnnouncement} from '../hooks/useBusyAnnouncement';
import {useTranslator} from '../i18n';
import {VisuallyHidden} from '../VisuallyHidden';

/** Keep this owner anchor mounted across busy and presentation changes. */
export function BusyAnnouncement({
  isBusy,
  message,
}: {
  isBusy: boolean;
  message?: string;
}) {
  const t = useTranslator();
  const anchorRef = useRef<HTMLSpanElement>(null);
  useBusyAnnouncement(
    isBusy,
    message ?? t('@astryx.spinner.loading'),
    anchorRef,
  );
  return <VisuallyHidden ref={anchorRef}>{null}</VisuallyHidden>;
}

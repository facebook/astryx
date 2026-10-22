// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useBusyAnnouncement.ts
 * @input Whether the owning control is busy, and the words to announce
 * @output Announces each busy start once through the shared polite channel
 * @position Core a11y hook for controls that show a decorative busy Spinner
 *
 * A control that owns a task (a field validating, a selector loading its
 * options) shows a Spinner while busy. That Spinner is decorative: it is
 * hidden from assistive technology and carries no live role, and the owning
 * control announces its busy state instead, through the shared announcement
 * channel (`spec:AST-086` FR8). A Spinner that mounts as a live region already
 * holding its name is often skipped, and a busy control that also exposes
 * `aria-busy` would otherwise have two owners for the same feedback.
 *
 * The announcement is made once per busy start (`spec:AST-086` FR6): a
 * rerender, a StrictMode effect replay, or a change of words while still busy
 * does not repeat it. Settling re-arms it, so the next busy start speaks again.
 *
 * SYNC: deliberately NOT exported from /packages/core/src/hooks/index.ts —
 * this is a shared implementation detail of Astryx's busy controls.
 */

import {useEffect, useRef} from 'react';
import {useAnnounce} from './useAnnounce';

export function useBusyAnnouncement(isBusy: boolean, message: string): void {
  const announce = useAnnounce();
  // Survives StrictMode's effect replay and rerenders, so only a new busy
  // start (busy again after settling) announces again.
  const hasAnnouncedRef = useRef(false);
  useEffect(() => {
    if (!isBusy) {
      hasAnnouncedRef.current = false;
      return;
    }
    if (hasAnnouncedRef.current) {
      return;
    }
    hasAnnouncedRef.current = true;
    announce(message, 'polite');
  }, [announce, isBusy, message]);
}

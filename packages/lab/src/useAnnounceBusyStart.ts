// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAnnounceBusyStart.ts
 * @input Whether the owner is busy, and the message to say; core's shared
 *   announcement channel (`useAnnounce`)
 * @output useAnnounceBusyStart: announces the message once each time the owner
 *   starts being busy after page load
 * @position Shared by Lab owners whose loading indicator is silent (EmojiPicker,
 *   the Comments history dialog, Schedule): the owner announces its busy start
 *   once (`spec:AST-086` FR6, FR8), and a busy state present while the page
 *   loads stays silent (FR11)
 */

import {useEffect, useRef} from 'react';
import {useAnnounce} from '@astryxdesign/core/hooks';

export function useAnnounceBusyStart(isBusy: boolean, message: string): void {
  const announce = useAnnounce();
  const wasBusy = useRef(false);
  useEffect(() => {
    const started = isBusy && !wasBusy.current;
    wasBusy.current = isBusy;
    if (started && document.readyState === 'complete') {
      announce(message, 'polite');
    }
  }, [announce, isBusy, message]);
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ToastDismissSlot.tsx
 * @input A toast's own dismiss control, provided by `Toast`
 * @output `DismissButton` for a `renderContent` layout, plus the claim
 *   bookkeeping that lets `Toast` know whether the layout placed it
 * @position Internal to Toast; `DismissButton` is handed to `renderContent`
 *   rather than imported by consumers.
 *
 * A custom layout places the close by rendering `<DismissButton />`. Mounting
 * it *claims* the toast's dismiss slot, and `Toast` renders its own close in
 * the card's corner when nothing claimed it — so a layout that forgets the
 * control produces a toast with a close in the default position rather than a
 * toast with no way out.
 *
 * Claiming is a mount-time registration rather than a DOM scan because the
 * layout may place the control anywhere: nested inside its own components,
 * behind a conditional, or passed on as someone else's prop. Rendering it is
 * the claim, wherever it ends up.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Toast/Toast.tsx (provides the slot, renders the fallback)
 * - /packages/core/src/Toast/types.ts (ToastContentRenderProps.DismissButton)
 */

import {createContext, use} from 'react';
import type {ReactNode} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {devWarn} from '../utils/devWarning';

interface ToastDismissSlot {
  /** The toast's own dismiss control, already built. */
  button: ReactNode;
  /** Called on every commit by each mounted `DismissButton`. */
  claim: () => void;
}

const ToastDismissSlotContext = createContext<ToastDismissSlot | null>(null);
ToastDismissSlotContext.displayName = 'ToastDismissSlotContext';

export const ToastDismissSlotProvider = ToastDismissSlotContext.Provider;

/**
 * The toast's close, placed by a `renderContent` layout.
 *
 * Rendering it puts Astryx's own dismiss control at that spot — the same ghost
 * icon `Button`, with the translated `@astryx.toast.dismiss` label and the
 * `astryx-button` theme target. Omitting it is allowed: the toast then renders
 * its close in the card's default corner.
 */
export function DismissButton(): ReactNode {
  const slot = use(ToastDismissSlotContext);
  // Claim before the parent's own layout effect reads the count — a child's
  // layout effects always run first — and on every commit, not just mount, so
  // a layout that stops rendering the control is noticed on the render that
  // stops.
  useIsomorphicLayoutEffect(() => {
    slot?.claim();
  });
  if (slot == null) {
    devWarn(
      'Toast',
      'DismissButton was rendered outside a toast. It is the `DismissButton` ' +
        "passed to `renderContent`, not an import — render the one you're given.",
    );
    return null;
  }
  return slot.button;
}

DismissButton.displayName = 'Toast.DismissButton';

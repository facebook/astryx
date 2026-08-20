// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLayerDismissal.ts
 * @input Uses React hooks, the layer stack, and LayerDepthContext
 * @output Exports useLayerDismissal + its option/return types
 * @position The API overlays use to join the shared dismissal stack. Wraps
 *   layerStack (registration + the single Escape listener) and reads nesting
 *   depth from LayerDepthContext.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/index.ts
 * - /packages/core/src/Layer/useLayerDismissal.test.tsx
 * - /packages/core/src/Layer/layerStack.ts
 */

import {useCallback, useEffect, useRef} from 'react';

import {useLayerDepth} from './LayerDepthContext';
import {
  isTopmostLayer,
  registerLayer,
  type LayerEscapeBehavior,
} from './layerStack';

export type {LayerEscapeBehavior};

export interface UseLayerDismissalOptions {
  /**
   * Whether this layer is participating right now. Usually the layer's open
   * state. A layer whose open state lags the DOM should pass `true` for its
   * lifetime and answer `isPresent` from the DOM instead.
   */
  isActive: boolean;
  /**
   * Dismiss this layer. Called by the stack when this layer is the one that
   * should respond to an Escape press. Not called for `escapeBehavior: 'block'`.
   */
  onDismiss: () => void;
  /**
   * What this layer does with an Escape press that reaches it.
   * @default 'close'
   */
  escapeBehavior?: LayerEscapeBehavior;
  /**
   * This layer's container element, read lazily. Optional: supply it when the
   * layer cannot wrap its content in `LayerDepthProvider` (a bare focus trap
   * renders nothing), so nesting can still be recovered from the DOM.
   */
  getContainer?: () => HTMLElement | null;
  /**
   * Whether the layer is really on screen, asked at press time. Supply it when
   * `isActive` is `true` for the layer's lifetime because its open state lags
   * the DOM by a frame; the stack skips layers that answer `false`.
   */
  isPresent?: () => boolean;
  /**
   * Whether this layer takes part in the shared stack at all. When `false` the
   * layer is invisible to dismissal: a press flows past it to the layer below,
   * exactly as if it were not open.
   *
   * This is the opt-out, and it is deliberately separate from `escapeBehavior:
   * 'block'` — `'block'` is a layer that is present and swallows the press;
   * this is a layer that is not there at all. Reach for it when:
   *
   * - **The consumer owns the keyboard contract.** A controlled overlay whose
   *   visibility is driven by a prop: the app decides when it closes, and the
   *   system silently closing it would fight the state the app is holding.
   * - **The layer is not really an overlay.** `Dialog`'s inline rendering mode
   *   puts dialog content in normal flow with nothing layered over anything.
   * - **Escape means something else inside it.** A layer hosting an editor or a
   *   nested widget with its own Escape semantics. Prefer letting that content
   *   claim the press (`stopPropagation`/`preventDefault`, which the stack
   *   honors) — opting the whole layer out is the blunt version, and gives up
   *   dismissal even when focus is nowhere near the widget.
   * - **Something else already sequences it.** A layer whose dismissal is
   *   driven by an animation or gesture controller that must run the teardown.
   *
   * Layers that are never Escape-dismissible (toasts) should simply not call
   * this hook.
   *
   * @default true
   */
  isEnabled?: boolean;
}

export interface UseLayerDismissalReturn {
  /**
   * Whether this layer is currently top-most. The stack already routes Escape
   * for you; this is for dismissal channels it does not model yet (outside
   * press, swipe) so every channel agrees on who is on top.
   */
  isTopmost: () => boolean;
}

/**
 * Join the shared layer dismissal stack for as long as this layer is active.
 *
 * The layer does NOT attach a key listener — the stack owns one listener and
 * routes each Escape press to the top-most REGISTERED layer, so one press
 * dismisses exactly one of them. Dialog (and what is built on it), focus-
 * trapped layers (Popover, menus, Bottom Sheet), Tooltip and HoverCard
 * register today; Lightbox, MobileNav and InfoTip do not, so a press over one
 * of those can still dismiss a registered layer underneath.
 *
 * Wrap the layer's own content in `LayerDepthProvider` so anything opened from
 * inside it registers as nested.
 *
 * @example
 * ```tsx
 * const {isTopmost} = useLayerDismissal({
 *   isActive: isOpen,
 *   onDismiss: () => onOpenChange(false),
 * });
 * ```
 */
export function useLayerDismissal(
  options: UseLayerDismissalOptions,
): UseLayerDismissalReturn {
  const {
    isActive,
    onDismiss,
    escapeBehavior = 'close',
    getContainer,
    isPresent,
    isEnabled = true,
  } = options;

  const depth = useLayerDepth();

  // Identity for this layer's stack entry, stable across re-registration.
  const tokenRef = useRef<object>({});

  // The stack calls these during an event, outside React's render, so they must
  // reach the latest closures rather than the ones captured at registration.
  const onDismissRef = useRef(onDismiss);
  const getContainerRef = useRef(getContainer);
  const isPresentRef = useRef(isPresent);
  useEffect(() => {
    onDismissRef.current = onDismiss;
    getContainerRef.current = getContainer;
    isPresentRef.current = isPresent;
  });

  const isRegistered = isActive && isEnabled;

  useEffect(() => {
    if (!isRegistered) {
      return;
    }
    return registerLayer({
      token: tokenRef.current,
      depth,
      behavior: escapeBehavior,
      getContainer: () => getContainerRef.current?.() ?? null,
      isPresent: () => isPresentRef.current?.() ?? true,
      dismiss: () => onDismissRef.current(),
    });
  }, [isRegistered, depth, escapeBehavior]);

  const isTopmost = useCallback(
    () => isRegistered && isTopmostLayer(tokenRef.current),
    [isRegistered],
  );

  return {isTopmost};
}

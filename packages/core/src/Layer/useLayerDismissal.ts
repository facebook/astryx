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
  isTextComposing,
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
   * Deliberately separate from `escapeBehavior: 'block'` — `'block'` is a layer
   * that is present and swallows the press; this is a layer that is not there
   * at all. One case uses it: `Dialog`'s inline rendering mode, where content
   * sits in normal flow with nothing layered over anything.
   *
   * A controlled layer is NOT one of these. It stays registered and takes the
   * press like any other, answering it by calling the consumer's change
   * handler; whether it then closes is the consumer's decision.
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
   * Whether a close request the browser started on its own — a `<dialog>`'s
   * `cancel`, the Android back gesture, the platform close watcher — should
   * dismiss this layer. As well as the top-most rule the stack applies to an
   * Escape press, it declines a request that arrives while an IME composition
   * is running, which no `cancel` handler can tell on its own because the
   * event carries no composition state.
   */
  shouldDismissOnCloseRequest: () => boolean;
}

/**
 * Join the shared layer dismissal stack for as long as this layer is active.
 *
 * The layer does NOT attach a key listener — the stack owns one listener and
 * routes each Escape press to the top-most REGISTERED layer, so one press
 * dismisses exactly one of them. Dialog (and what is built on it), Popover and
 * the menus built on it, Tooltip, HoverCard, Lightbox and MobileNav register
 * today; `BottomSheetSwitcher` registers through its focus trap when modal and
 * still handles its own press when not.
 *
 * `BottomSheet`, `CommandPalette`, `ContextMenu`, `DropdownMenuSubMenu`,
 * `PowerSearchEditPopover` and lab's `Drawer` still run their own Escape
 * listener. They stay safe next to the stack only because each claims the press
 * at element level, and the stack stands down on an already-`defaultPrevented`
 * press — but a registered layer opened INSIDE one of them does not get the
 * press: the host takes it and closes instead. Migrating them is the fix.
 *
 * Wrap the layer's own content in `LayerDepthProvider` so anything opened from
 * inside it registers as nested.
 *
 * @example
 * ```tsx
 * useLayerDismissal({
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

  const shouldDismissOnCloseRequest = useCallback(
    () =>
      isRegistered && !isTextComposing() && isTopmostLayer(tokenRef.current),
    [isRegistered],
  );

  return {shouldDismissOnCloseRequest};
}

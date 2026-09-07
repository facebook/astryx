// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSelectorPresentation.ts
 * @input An already-resolved presentation value and usePopover
 * @output Coordinates popover and bottom-sheet disclosure state
 * @position Internal presentation controller shared by Selector and
 *   MultiSelector. Policy resolution is the CALLER's: Selector resolves its
 *   public `adaptations`/`presentation` policy and MultiSelector runs the
 *   legacy adaptive hook, so migrating one cannot move the other
 *   (spec:AST-031 IR5).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Selector/Selector.tsx (resolves the AST-031 policy)
 * - /packages/core/src/MultiSelector/MultiSelector.tsx (resolves the legacy
 *   adaptive policy)
 */

import {
  useCallback,
  useRef,
  useState,
  type FocusEvent,
  type RefObject,
} from 'react';
import {
  usePopover,
  type UsePopoverOptions,
  type UsePopoverReturn,
} from '../Popover/usePopover';
import type {ResolvedAdaptivePresentation} from '../hooks/useAdaptivePresentation';
import {useFocusReturnVisibility} from '../hooks/useFocusReturnVisibility';

interface UseSelectorPresentationOptions {
  /**
   * The surface to open, already resolved to an exact value. This controller
   * never reads the environment: it owns disclosure state, latching, and the
   * focus handoff, not which surface a caller's policy selects.
   */
  presentation: ResolvedAdaptivePresentation;
  onHide: () => void;
  onShow: () => void;
  popoverOptions: Omit<UsePopoverOptions, 'onHide' | 'onShow'>;
  triggerRef: RefObject<HTMLElement | null>;
}

interface SelectorPresentationController {
  activePresentation: ResolvedAdaptivePresentation;
  hide: () => void;
  isOpen: boolean;
  isSheetOpen: boolean;
  isSheetPresented: boolean;
  isTriggerFocusRingSuppressed: boolean;
  onSheetOpenChange: (isOpen: boolean) => void;
  onTriggerFocus: (event: FocusEvent<HTMLElement>) => void;
  popover: UsePopoverReturn;
  show: () => boolean;
}

export function useSelectorPresentation({
  presentation: resolvedPresentation,
  onHide,
  onShow,
  popoverOptions,
  triggerRef,
}: UseSelectorPresentationOptions): SelectorPresentationController {
  const activePresentationRef =
    useRef<ResolvedAdaptivePresentation>(resolvedPresentation);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isSheetOpenRef = useRef(false);
  // BottomSheet owns its exit animation and final-focus handoff. Keep it mounted
  // after the controlled open state turns false until that handoff reaches the
  // trigger, then consumers may remove the hidden surface tree.
  const [isSheetPresented, setIsSheetPresented] = useState(false);
  const onHideRef = useRef(onHide);
  const onShowRef = useRef(onShow);
  const didShowPopoverRef = useRef(false);
  const {
    isFocusRingSuppressed,
    onFocusReturnTargetFocus,
    prepareFocusReturn,
    resetFocusReturn,
  } = useFocusReturnVisibility();
  onHideRef.current = onHide;
  onShowRef.current = onShow;

  const handlePopoverHide = useCallback(() => {
    prepareFocusReturn();
    onHideRef.current();
    triggerRef.current?.focus();
  }, [prepareFocusReturn, triggerRef]);
  const handlePopoverShow = useCallback(() => {
    didShowPopoverRef.current = true;
    resetFocusReturn();
    onShowRef.current();
  }, [resetFocusReturn]);
  const popover = usePopover({
    ...popoverOptions,
    onHide: handlePopoverHide,
    onShow: handlePopoverShow,
  });
  const {hide: hidePopover, show: showPopover} = popover;

  const show = useCallback((): boolean => {
    activePresentationRef.current = resolvedPresentation;
    if (resolvedPresentation === 'bottom-sheet') {
      resetFocusReturn();
      onShowRef.current();
      isSheetOpenRef.current = true;
      setIsSheetPresented(true);
      setIsSheetOpen(true);
      return true;
    }
    setIsSheetPresented(false);
    didShowPopoverRef.current = false;
    showPopover();
    return didShowPopoverRef.current;
  }, [resetFocusReturn, resolvedPresentation, showPopover]);

  const hide = useCallback(() => {
    if (isSheetOpenRef.current) {
      prepareFocusReturn();
      isSheetOpenRef.current = false;
      setIsSheetOpen(false);
      onHideRef.current();
    } else {
      hidePopover();
    }
  }, [hidePopover, prepareFocusReturn]);

  const handleTriggerFocus = useCallback(
    (_event: FocusEvent<HTMLElement>) => {
      onFocusReturnTargetFocus();
      if (
        !isSheetOpenRef.current &&
        activePresentationRef.current === 'bottom-sheet'
      ) {
        // BottomSheet focuses finalFocusRef only after its exit completes. That
        // focus event is the lifecycle signal that the retained sheet can now
        // leave the tree without dropping focus to the document body.
        setIsSheetPresented(false);
      }
    },
    [onFocusReturnTargetFocus],
  );

  const handleSheetOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      if (nextIsOpen) {
        show();
      } else {
        hide();
      }
    },
    [hide, show],
  );

  const isOpen = popover.isOpen || isSheetOpen;
  const activePresentation =
    isOpen || isSheetPresented
      ? activePresentationRef.current
      : resolvedPresentation;

  return {
    activePresentation,
    hide,
    isOpen,
    isSheetOpen,
    isSheetPresented,
    isTriggerFocusRingSuppressed: isFocusRingSuppressed,
    onSheetOpenChange: handleSheetOpenChange,
    onTriggerFocus: handleTriggerFocus,
    popover,
    show,
  };
}

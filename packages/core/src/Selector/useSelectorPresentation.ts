// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSelectorPresentation.ts
 * @input Uses the shared adaptive presentation policy and usePopover
 * @output Coordinates popover and bottom-sheet disclosure state
 * @position Internal presentation controller shared by Selector and MultiSelector
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
import {
  useAdaptivePresentation,
  type AdaptivePresentation,
  type ResolvedAdaptivePresentation,
} from '../hooks/useAdaptivePresentation';
import {useFocusReturnVisibility} from '../hooks/useFocusReturnVisibility';
import {
  createPresentationHold,
  usePresentationHold,
} from '../Layer/presentationHold';

interface UseSelectorPresentationOptions {
  presentation: AdaptivePresentation;
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
  presentation,
  onHide,
  onShow,
  popoverOptions,
  triggerRef,
}: UseSelectorPresentationOptions): SelectorPresentationController {
  const resolvedPresentation = useAdaptivePresentation(presentation);
  // The layer runtime's presentation holds (Layer/presentationHold): the
  // presentation an opening chose, taken as it shows; and the sheet, held from
  // the render that opens it until its close settles. BottomSheet owns its
  // exit animation and final-focus handoff, so the sheet stays mounted after
  // the controlled open state turns false until that handoff reaches the
  // trigger; then consumers may remove the hidden surface tree.
  const [activePresentationHold] = useState(() =>
    createPresentationHold<ResolvedAdaptivePresentation>(),
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isSheetOpenRef = useRef(false);
  const {isHeld: isSheetPresented, release: releaseSheet} = usePresentationHold(
    {isOpen: isSheetOpen, presentation: true},
  );
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
    activePresentationHold.take(resolvedPresentation);
    if (resolvedPresentation === 'bottom-sheet') {
      resetFocusReturn();
      onShowRef.current();
      isSheetOpenRef.current = true;
      setIsSheetOpen(true);
      return true;
    }
    releaseSheet();
    didShowPopoverRef.current = false;
    showPopover();
    return didShowPopoverRef.current;
  }, [
    activePresentationHold,
    releaseSheet,
    resetFocusReturn,
    resolvedPresentation,
    showPopover,
  ]);

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
        activePresentationHold.current() === 'bottom-sheet'
      ) {
        // BottomSheet focuses finalFocusRef only after its exit completes. That
        // focus event is the lifecycle signal that the retained sheet can now
        // leave the tree without dropping focus to the document body: its
        // close has settled.
        activePresentationHold.release();
        releaseSheet();
      }
    },
    [activePresentationHold, onFocusReturnTargetFocus, releaseSheet],
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
      ? (activePresentationHold.current() ?? resolvedPresentation)
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

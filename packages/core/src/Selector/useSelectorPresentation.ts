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
  usePopoverInternal,
  type UsePopoverOptions,
  type UsePopoverReturn,
} from '../Popover/usePopover';
import {
  useAdaptivePresentation,
  type AdaptivePresentation,
  type ResolvedAdaptivePresentation,
} from '../hooks/useAdaptivePresentation';
import {useFocusReturnVisibility} from '../hooks/useFocusReturnVisibility';

interface UseSelectorPresentationOptions {
  presentation: AdaptivePresentation;
  onShow?: () => void;
  onHide: () => void;
  popoverOptions: Omit<UsePopoverOptions, 'onShow' | 'onHide'>;
  triggerRef: RefObject<HTMLElement | null>;
}

interface SelectorPresentationController {
  activePresentation: ResolvedAdaptivePresentation;
  hide: () => void;
  isOpen: boolean;
  isSheetOpen: boolean;
  isTriggerFocusRingSuppressed: boolean;
  onSheetOpenChange: (isOpen: boolean) => void;
  onTriggerFocus: (event: FocusEvent<HTMLElement>) => void;
  popover: UsePopoverReturn & {wasJustDismissed: () => boolean};
  show: () => void;
  wasJustDismissed: () => boolean;
}

export function useSelectorPresentation({
  presentation,
  onShow,
  onHide,
  popoverOptions,
  triggerRef,
}: UseSelectorPresentationOptions): SelectorPresentationController {
  const resolvedPresentation = useAdaptivePresentation(presentation);
  const activePresentationRef =
    useRef<ResolvedAdaptivePresentation>(resolvedPresentation);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isSheetOpenRef = useRef(false);
  const onShowRef = useRef(onShow);
  const onHideRef = useRef(onHide);
  const {
    isFocusRingSuppressed,
    onFocusReturnTargetFocus,
    prepareFocusReturn,
    resetFocusReturn,
  } = useFocusReturnVisibility();
  onShowRef.current = onShow;
  onHideRef.current = onHide;

  const handlePopoverShow = useCallback(() => {
    onShowRef.current?.();
  }, []);

  const handlePopoverHide = useCallback(() => {
    prepareFocusReturn();
    onHideRef.current();
    triggerRef.current?.focus();
  }, [prepareFocusReturn, triggerRef]);
  const popover = usePopoverInternal({
    ...popoverOptions,
    onShow: handlePopoverShow,
    onHide: handlePopoverHide,
  });
  const {
    hide: hidePopover,
    show: showPopover,
    wasJustDismissed: wasPopoverJustDismissed,
  } = popover;

  const show = useCallback(() => {
    resetFocusReturn();
    activePresentationRef.current = resolvedPresentation;
    if (resolvedPresentation === 'bottom-sheet') {
      if (isSheetOpenRef.current) {
        return;
      }
      isSheetOpenRef.current = true;
      setIsSheetOpen(true);
      onShowRef.current?.();
    } else {
      showPopover();
    }
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
    (_event: FocusEvent<HTMLElement>) => onFocusReturnTargetFocus(),
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
  const activePresentation = isOpen
    ? activePresentationRef.current
    : resolvedPresentation;

  const wasJustDismissed = useCallback(
    () =>
      activePresentationRef.current === 'popover' && wasPopoverJustDismissed(),
    [wasPopoverJustDismissed],
  );

  return {
    activePresentation,
    hide,
    isOpen,
    isSheetOpen,
    isTriggerFocusRingSuppressed: isFocusRingSuppressed,
    onSheetOpenChange: handleSheetOpenChange,
    onTriggerFocus: handleTriggerFocus,
    popover,
    show,
    wasJustDismissed,
  };
}

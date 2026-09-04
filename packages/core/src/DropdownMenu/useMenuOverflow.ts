// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMenuOverflow.ts
 * @input Menu element ref, rendered content, and open state
 * @output Returns whether the open menu overflows its block-size constraint
 * @position Shared responsive helper for DropdownMenu and DropdownMenuSubMenu
 */

import {useCallback, useState, type ReactNode, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';

/** Detect block-axis overflow without making a fitting menu a scroll container. */
export function useMenuOverflow(
  menuRef: RefObject<HTMLElement | null>,
  content: ReactNode,
  isOpen: boolean,
): boolean {
  const [hasOverflow, setHasOverflow] = useState(false);

  const measureOverflow = useCallback(() => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }
    const nextHasOverflow = menu.scrollHeight > menu.clientHeight + 1;
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- DOM overflow measurement controls whether this menu becomes a scroll container
    setHasOverflow(current =>
      current === nextHasOverflow ? current : nextHasOverflow,
    );
  }, [menuRef]);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const menu = menuRef.current;
    if (!menu) {
      return;
    }
    measureOverflow();
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measureOverflow);
    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(measureOverflow);
    resizeObserver?.observe(menu);
    mutationObserver?.observe(menu, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    menu.addEventListener('load', measureOverflow, true);
    window.addEventListener('resize', measureOverflow);
    window.visualViewport?.addEventListener('resize', measureOverflow);
    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      menu.removeEventListener('load', measureOverflow, true);
      window.removeEventListener('resize', measureOverflow);
      window.visualViewport?.removeEventListener('resize', measureOverflow);
    };
  }, [isOpen, measureOverflow, menuRef]);

  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      measureOverflow();
    }
  }, [content, isOpen, measureOverflow]);

  return hasOverflow;
}

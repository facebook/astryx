'use client';

/**
 * @file useOverlayTouchToggle.ts
 * @input Container ref
 * @output isOpen state + containerProps for tap-to-toggle on touch devices
 * @position Overlay system hook; handles touch interaction for full-cover overlays
 *
 * On touch devices, full-cover hover overlays need a tap-to-toggle pattern.
 * This hook provides the state and event handlers. Taps on interactive
 * children (buttons, links) are excluded — only "surface" taps toggle.
 *
 * On pointer devices (hover available), this hook is a no-op — returns
 * isOpen=undefined so the scrim falls through to CSS hover behavior.
 */

import {useState, useCallback, useSyncExternalStore} from 'react';

// Interactive selectors — taps on these don't toggle the overlay
const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [role="button"], [role="link"]';

/**
 * Subscribes to the (hover: none) media query so the hook
 * re-renders when the device type changes (e.g. DevTools toggle).
 */
function getIsTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none)').matches;
}

function subscribeToHoverChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(hover: none)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getServerSnapshot(): boolean {
  return false;
}

export interface OverlayTouchToggleResult {
  /**
   * Pass to XDSOverlayScrim's isOpen prop.
   * undefined on pointer devices (CSS hover handles it),
   * boolean on touch devices (tap toggles it).
   */
  isOpen: boolean | undefined;

  /**
   * Click handler — spread on the overlay container.
   * Only fires on touch devices. No-op on pointer devices.
   */
  onClick: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
}

/**
 * Hook for tap-to-toggle overlay behavior on touch devices.
 *
 * Returns isOpen=undefined on pointer devices so the scrim
 * uses its CSS showOn behavior. On touch, returns a boolean
 * toggled by taps on the container surface (excluding interactive children).
 *
 * @example
 * ```
 * const touch = useOverlayTouchToggle();
 *
 * <XDSOverlay>
 *   <img src={src} />
 *   <XDSOverlayScrim showOn="hover" isOpen={touch.isOpen}>
 *     <XDSButton label="Quick view" variant="ghost" />
 *   </XDSOverlayScrim>
 * </XDSOverlay>
 * ```
 */
export function useOverlayTouchToggle(): OverlayTouchToggleResult {
  const isTouchDevice = useSyncExternalStore(
    subscribeToHoverChange,
    getIsTouchDevice,
    getServerSnapshot,
  );

  const [touchOpen, setTouchOpen] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(INTERACTIVE_SELECTOR)) return;
    setTouchOpen(prev => !prev);
  }, []);

  if (!isTouchDevice) {
    return {isOpen: undefined, onClick: undefined};
  }

  return {
    isOpen: touchOpen,
    onClick: handleClick,
  };
}

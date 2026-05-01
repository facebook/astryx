'use client';

/**
 * @file useXDSOverlay.ts
 * @input Overlay options (showOn, scrim, position, etc.)
 * @output containerProps + scrimProps + context value
 * @position Core hook for overlay system; used by XDSOverlay and available to consumers
 *
 * Handles:
 * - Overlay marker (overlayScope) on the container
 * - Touch detection via (hover: none) media query
 * - Tap-to-toggle on touch via useClickableContainer
 * - Border radius detection from first child
 * - Context value for scrim to consume
 *
 * Used internally by XDSOverlay, or directly by consumers who want
 * to apply overlay behavior to an existing container (like XDSCard).
 */

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useClickableContainer} from '../hooks/useClickableContainer';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {overlayScope, overlayContainerStyles} from './overlay.markers.stylex';
import type {OverlayContextValue} from './OverlayContext';

// =============================================================================
// Touch detection
// =============================================================================

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

// =============================================================================
// Types
// =============================================================================

export interface UseXDSOverlayOptions {
  /**
   * Ref to the container element. If provided, the hook attaches
   * behavior to this element (border-radius detection, clickable container).
   * If omitted, the hook creates its own internal ref.
   */
  containerRef?: RefObject<HTMLElement | null>;
}

export interface UseXDSOverlayResult {
  /** Ref to the container — use if you didn't provide containerRef in options. */
  containerRef: RefObject<HTMLElement | null>;

  /**
   * Props to spread on the container element.
   * Includes: className (marker + positioning), onClick/onMouseUp (touch toggle).
   */
  containerProps: {
    className: string | undefined;
    style: React.CSSProperties | undefined;
    onClick: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
    onMouseUp: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
  };

  /** Context value to provide via OverlayContext. */
  contextValue: OverlayContextValue;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook that provides overlay container behavior: marker, positioning,
 * touch-toggle, and border-radius detection.
 *
 * Used internally by XDSOverlay. Also available to consumers who want
 * to apply overlay behavior to an existing container (like XDSCard).
 *
 * @example
 * ```
 * const overlay = useXDSOverlay();
 *
 * <XDSCard ref={overlay.containerRef} {...overlay.containerProps}>
 *   <XDSLayout content={...} />
 *   <OverlayContext value={overlay.contextValue}>
 *     <XDSOverlayScrim showOn="hover">
 *       <XDSButton label="Quick view" />
 *     </XDSOverlayScrim>
 *   </OverlayContext>
 * </XDSCard>
 * ```
 */
export function useXDSOverlay(
  options?: UseXDSOverlayOptions,
): UseXDSOverlayResult {
  const internalRef = useRef<HTMLElement | null>(null);
  const containerRef = options?.containerRef ?? internalRef;

  const isTouchDevice = useSyncExternalStore(
    subscribeToHoverChange,
    getIsTouchDevice,
    getServerSnapshot,
  );

  const [touchOpen, setTouchOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setTouchOpen(prev => !prev);
  }, []);

  // useClickableContainer excludes taps on interactive children
  const {onClick, onMouseUp} = useClickableContainer({
    containerRef: containerRef as RefObject<HTMLElement | null>,
    onClick: isTouchDevice ? handleToggle : undefined,
    disabled: !isTouchDevice,
  });

  // Border radius detection: mirror first child's radius onto container
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (!firstChild) return;

    const radius = getComputedStyle(firstChild).borderRadius;
    if (radius && radius !== '0px') {
      el.style.borderRadius = radius;
    }
  }, [containerRef]);

  // Container className from stylex
  const resolved = stylex.props(overlayScope, overlayContainerStyles.root);

  const containerProps = useMemo(
    () => ({
      className: resolved.className ?? undefined,
      style: resolved.style ?? undefined,
      onClick: isTouchDevice ? onClick : undefined,
      onMouseUp: isTouchDevice ? onMouseUp : undefined,
    }),
    [isTouchDevice, onClick, onMouseUp, resolved.className, resolved.style],
  );

  const contextValue = useMemo<OverlayContextValue>(
    () => ({touchOpen: isTouchDevice ? touchOpen : undefined}),
    [isTouchDevice, touchOpen],
  );

  return {
    containerRef,
    containerProps,
    contextValue,
  };
}

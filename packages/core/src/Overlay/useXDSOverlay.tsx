'use client';

/**
 * @file useXDSOverlay.ts
 * @input Overlay options (showOn, scrim, position, content, etc.)
 * @output containerRef, containerProps, element (rendered scrim)
 * @position Core hook for overlay system — same pattern as useXDSTooltip
 *
 * For applying overlay behavior to an existing container (XDSCard,
 * custom elements) without a wrapper. Returns props to spread on the
 * container and a pre-rendered scrim element to place inside it.
 *
 * Handles: marker, positioning, touch toggle (via useClickableContainer),
 * border-radius detection, and scrim rendering.
 */

import {
  type ReactNode,
  type ReactElement,
  useState,
  useRef,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useClickableContainer} from '../hooks/useClickableContainer';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {overlayScope, overlayContainerStyles} from './overlay.markers.stylex';
import {OverlayScrim} from './OverlayScrim';
import type {
  OverlayScrimMode,
  OverlayPosition,
  OverlayAlign,
  OverlayShowOn,
} from './OverlayScrim';

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
  /** Content rendered inside the scrim overlay. */
  content: ReactNode;

  /**
   * CSS-driven visibility trigger.
   * - `"always"` — always visible
   * - `"hover"` — hover + focus (accessible default). Touch: strip = always visible, fill = tap-to-toggle.
   * - `"focus"` — focus-within only
   * - `"hover-or-focus"` — alias for "hover"
   * @default "always"
   */
  showOn?: OverlayShowOn;

  /**
   * JS-controlled visibility override. Takes precedence over showOn + touch.
   */
  isOpen?: boolean;

  /**
   * Scrim background mode.
   * @default "dark"
   */
  scrim?: OverlayScrimMode;

  /**
   * Scrim placement.
   * @default "fill"
   */
  position?: OverlayPosition;

  /**
   * Content alignment.
   * @default "end"
   */
  align?: OverlayAlign;
}

export interface UseXDSOverlayResult {
  /** Ref — attach to the container element. */
  containerRef: React.RefObject<HTMLElement | null>;

  /**
   * Props to spread on the container element.
   * Includes marker className, positioning, and touch event handlers.
   */
  containerProps: Record<string, unknown>;

  /** The rendered scrim element — place inside the container. */
  element: ReactElement;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for overlay behavior on an existing container.
 * Returns containerRef, containerProps to spread, and the scrim element to render.
 *
 * @example
 * ```
 * const overlay = useXDSOverlay({
 *   showOn: 'hover',
 *   content: <XDSButton label="Quick view" variant="ghost" />,
 * });
 *
 * <XDSCard ref={overlay.containerRef} {...overlay.containerProps}>
 *   <XDSLayout content={...} />
 *   {overlay.element}
 * </XDSCard>
 * ```
 */
export function useXDSOverlay({
  content,
  showOn = 'always',
  isOpen: isOpenProp,
  scrim = 'dark',
  position = 'fill',
  align = 'end',
}: UseXDSOverlayOptions): UseXDSOverlayResult {
  const containerRef = useRef<HTMLElement | null>(null);

  const isTouchDevice = useSyncExternalStore(
    subscribeToHoverChange,
    getIsTouchDevice,
    getServerSnapshot,
  );

  const [touchOpen, setTouchOpen] = useState(false);

  const isHoverMode = showOn === 'hover' || showOn === 'hover-or-focus';
  const isStrip = position === 'bottom' || position === 'top';
  const needsTouchToggle = isTouchDevice && isHoverMode && !isStrip;

  const handleToggle = useCallback(() => {
    setTouchOpen(prev => !prev);
  }, []);

  // Touch tap-to-toggle via useClickableContainer (excludes interactive children)
  const {onClick, onMouseUp} = useClickableContainer({
    containerRef,
    onClick: needsTouchToggle ? handleToggle : undefined,
    disabled: !needsTouchToggle,
  });

  // Border radius: mirror first child's radius onto container
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (!firstChild) return;
    const radius = getComputedStyle(firstChild).borderRadius;
    if (radius && radius !== '0px') {
      el.style.borderRadius = radius;
    }
  }, []);

  // Resolve effective isOpen:
  // 1. Consumer isOpen prop takes precedence
  // 2. Touch toggle for full-cover hover scrims
  // 3. undefined = let CSS handle it
  const effectiveIsOpen =
    isOpenProp !== undefined
      ? isOpenProp
      : needsTouchToggle
        ? touchOpen
        : undefined;

  // Container styles
  const resolved = stylex.props(overlayScope, overlayContainerStyles.root);

  const containerProps = useMemo(
    () => ({
      className: resolved.className,
      style: resolved.style,
      ...(needsTouchToggle ? {onClick, onMouseUp} : {}),
    }),
    [resolved.className, resolved.style, needsTouchToggle, onClick, onMouseUp],
  );

  const element = (
    <OverlayScrim
      scrim={scrim}
      position={position}
      align={align}
      showOn={showOn}
      isOpen={effectiveIsOpen}>
      {content}
    </OverlayScrim>
  );

  return {
    containerRef,
    containerProps,
    element,
  };
}

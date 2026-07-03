// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useKeyboardHint.tsx
 * @input Uses React, StyleX, CSS anchor positioning, Popover API (top layer)
 * @output Exports useKeyboardHint hook — ephemeral arrow-key navigation hint
 * @position Core hook; shows sighted keyboard users how to navigate composite
 *   widgets that use roving tabindex (single Tab stop, arrows inside)
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {addAnchorName, removeAnchorName} from '../Layer/anchorName';
import {mergeProps} from '../utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KeyboardHintOrientation = 'horizontal' | 'vertical' | 'both';

export interface UseKeyboardHintOptions {
  /**
   * Orientation of the arrow-key navigation. Controls which arrow icons are
   * shown in the hint badge.
   * - `'horizontal'` → ← →
   * - `'vertical'` → ↑ ↓
   * - `'both'` → ← → ↑ ↓
   * @default 'horizontal'
   */
  orientation?: KeyboardHintOrientation;

  /**
   * Milliseconds before the hint auto-dismisses after appearing.
   * @default 3000
   */
  dismissAfterMs?: number;

  /**
   * Whether the hint is enabled. Set to false to disable for a specific
   * instance (e.g. when the widget is read-only or the user has dismissed
   * globally).
   * @default true
   */
  isEnabled?: boolean;
}

export interface UseKeyboardHintReturn {
  /**
   * The popover hint element to render inside your component tree (portals to
   * top layer via `popover="manual"`). Render unconditionally — it manages its
   * own visibility.
   */
  hintElement: ReactNode;

  /**
   * Attach to the composite container's `onFocus`. Shows the hint on the first
   * keyboard-focus (`:focus-visible`) entry from outside.
   */
  onFocus: (e: React.FocusEvent) => void;

  /**
   * Attach to the composite container's `onBlur`. Hides the hint when focus
   * leaves the composite entirely.
   */
  onBlur: (e: React.FocusEvent) => void;

  /**
   * Attach to the composite container's `onKeyDown`. Dismisses the hint on the
   * first arrow press (the user discovered the interaction).
   */
  onKeyDown: (e: React.KeyboardEvent) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

const styles = stylex.create({
  hint: {
    // Top layer + anchor positioned
    position: 'fixed',
    inset: 'auto',
    margin: 0,
    border: 'none',

    // Surface
    backgroundColor: colorVars['--color-background-popover'],
    borderRadius: radiusVars['--radius-element'],
    boxShadow: shadowVars['--shadow-low'],
    padding: `${spacingVars['--spacing-1']} ${spacingVars['--spacing-2']}`,

    // Typography
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',

    // Animation
    opacity: {
      default: 0,
      ':popover-open': 1,
    },
    transitionProperty: 'opacity, display, overlay',
    transitionDuration: '150ms',
    transitionBehavior: 'allow-discrete',

    // Don't capture pointer events (hint floats above content)
    pointerEvents: 'none',
  },
  keys: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: `0 ${spacingVars['--spacing-0-5']}`,
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
    fontSize: '11px',
    fontFamily: 'inherit',
    lineHeight: 1,
  },
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Shows an ephemeral visual hint ("← → to navigate") anchored to the focused
 * item when a composite widget first receives keyboard focus. Teaches sighted
 * keyboard users that arrows navigate within the group.
 *
 * The hint renders in the top layer (popover="manual") and is CSS-anchor-
 * positioned to the currently focused element, so it is never clipped by
 * overflow containers. It auto-dismisses on first arrow press, timeout, or
 * blur, and does not re-show for that instance.
 *
 * @example
 * ```
 * const hint = useKeyboardHint({orientation: 'horizontal'});
 * <div role="toolbar" onFocus={hint.onFocus} onBlur={hint.onBlur} onKeyDown={hint.onKeyDown}>
 *   {children}
 *   {hint.hintElement}
 * </div>
 * ```
 */
export function useKeyboardHint(
  options: UseKeyboardHintOptions = {},
): UseKeyboardHintReturn {
  const {
    orientation = 'horizontal',
    dismissAfterMs = 3000,
    isEnabled = true,
  } = options;

  const id = useId();
  const anchorId = `--astryx-hint-${id.replace(/:/g, '')}`;
  const popoverRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchoredElRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Show the popover (top layer)
  const show = useCallback(
    (anchor: HTMLElement) => {
      if (dismissedRef.current || !isEnabled) {return;}
      // Anchor to the focused element
      if (anchoredElRef.current && anchoredElRef.current !== anchor) {
        removeAnchorName(anchoredElRef.current, anchorId);
      }
      addAnchorName(anchor, anchorId);
      anchoredElRef.current = anchor;

      setIsVisible(true);
      const el = popoverRef.current;
      if (el && typeof el.showPopover === 'function') {
        try {
          el.showPopover();
        } catch {
          // already showing or unsupported
        }
      }

      // Auto-dismiss timeout
      if (timeoutRef.current) {clearTimeout(timeoutRef.current);}
      timeoutRef.current = setTimeout(() => {
        dismiss();
      }, dismissAfterMs);
    },
    [anchorId, dismissAfterMs, isEnabled],
  );

  // Hide + mark dismissed (won't re-show for this instance)
  const dismiss = useCallback(() => {
    dismissedRef.current = true;
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const el = popoverRef.current;
    if (el && typeof el.hidePopover === 'function') {
      try {
        el.hidePopover();
      } catch {
        // already hidden or unsupported
      }
    }
    if (anchoredElRef.current) {
      removeAnchorName(anchoredElRef.current, anchorId);
      anchoredElRef.current = null;
    }
  }, [anchorId]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {clearTimeout(timeoutRef.current);}
      if (anchoredElRef.current) {
        removeAnchorName(anchoredElRef.current, anchorId);
      }
    },
    [anchorId],
  );

  // --- Handlers ---

  const onFocus = useCallback(
    (e: React.FocusEvent) => {
      if (dismissedRef.current || !isEnabled) {return;}
      // Only show on keyboard focus (focus-visible)
      const target = e.target as HTMLElement;
      if (!target.matches(':focus-visible')) {return;}
      // Only show when focus enters from outside the container
      const container = e.currentTarget as HTMLElement;
      if (
        e.relatedTarget instanceof Node &&
        container.contains(e.relatedTarget)
      ) {
        return;
      }
      show(target);
    },
    [show, isEnabled],
  );

  const onBlur = useCallback(
    (e: React.FocusEvent) => {
      if (!isVisible) {return;}
      const container = e.currentTarget as HTMLElement;
      // Only dismiss when focus leaves the container entirely
      if (
        e.relatedTarget instanceof Node &&
        container.contains(e.relatedTarget)
      ) {
        // Focus moved within — re-anchor to the new target
        if (!dismissedRef.current && e.relatedTarget instanceof HTMLElement) {
          if (anchoredElRef.current) {
            removeAnchorName(anchoredElRef.current, anchorId);
          }
          addAnchorName(e.relatedTarget, anchorId);
          anchoredElRef.current = e.relatedTarget;
        }
        return;
      }
      dismiss();
    },
    [isVisible, dismiss, anchorId],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isVisible) {return;}
      if (ARROW_KEYS.has(e.key)) {
        dismiss();
      }
    },
    [isVisible, dismiss],
  );

  // --- Render the hint element ---

  const arrowContent =
    orientation === 'vertical' ? (
      <span {...stylex.props(styles.keys)}>
        <kbd {...stylex.props(styles.kbd)}>↑</kbd>
        <kbd {...stylex.props(styles.kbd)}>↓</kbd>
      </span>
    ) : orientation === 'both' ? (
      <span {...stylex.props(styles.keys)}>
        <kbd {...stylex.props(styles.kbd)}>←</kbd>
        <kbd {...stylex.props(styles.kbd)}>→</kbd>
        <kbd {...stylex.props(styles.kbd)}>↑</kbd>
        <kbd {...stylex.props(styles.kbd)}>↓</kbd>
      </span>
    ) : (
      <span {...stylex.props(styles.keys)}>
        <kbd {...stylex.props(styles.kbd)}>←</kbd>
        <kbd {...stylex.props(styles.kbd)}>→</kbd>
      </span>
    );

  const hintElement = (
    <div
      ref={popoverRef}
      // Top layer, no light-dismiss (we manage visibility ourselves)
      popover="manual"
      aria-hidden="true"
      {...mergeProps(
        stylex.props(styles.hint),
        undefined,
        // Anchor positioned to the currently-focused item
        {
          positionAnchor: anchorId,
          positionArea: 'block-end span-inline-end',
          positionTryFallbacks:
            'flip-block, flip-inline, flip-block flip-inline',
          marginBlockStart: spacingVars['--spacing-1'],
        },
      )}>
      {arrowContent}
      <span style={{marginInlineStart: spacingVars['--spacing-1']}}>
        to navigate
      </span>
    </div>
  );

  return {hintElement, onFocus, onBlur, onKeyDown};
}

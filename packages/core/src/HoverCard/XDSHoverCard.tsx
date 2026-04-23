'use client';

/**
 * @file XDSHoverCard.tsx
 * @input Uses React, useXDSHoverCard hook
 * @output Exports XDSHoverCard component for hover/focus triggered layers
 * @position Layer component; uses display:contents wrapper to avoid cloneElement
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/HoverCard/XDSHoverCard.test.tsx
 * - /packages/core/src/HoverCard/index.ts
 * - /apps/storybook/stories/HoverCard.stories.tsx
 */

import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSHoverCard, type HoverCardFocusTrigger} from './useXDSHoverCard';
import type {LayerAlignment, LayerPlacement} from '../Layer/useXDSLayer';
import {colorVars, spacingVars} from '../theme/tokens.stylex';

export type {HoverCardFocusTrigger} from './useXDSHoverCard';

const styles = stylex.create({
  wrapperContents: {
    display: 'contents',
  },
  wrapperInline: {
    display: 'inline',
  },
  hoverIndication: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: colorVars['--color-border-emphasized'],
    textUnderlineOffset: spacingVars['--spacing-0-5'],
  },
});

export interface XDSHoverCardProps {
  /**
   * The trigger element(s). Children refs are preserved.
   */
  children: ReactNode;

  /**
   * Content to display in the hover card.
   */
  content: ReactNode;

  /**
   * Position placement relative to anchor
   * @default 'above'
   */
  placement?: LayerPlacement;

  /**
   * Alignment along the placement axis
   * @default 'center'
   */
  alignment?: LayerAlignment;

  /**
   * Delay before showing on hover (ms)
   * @default 300
   */
  delay?: number;

  /**
   * Delay before hiding after mouse/focus leave (ms)
   * @default 200
   */
  hideDelay?: number;

  /**
   * When to trigger on focus:
   * - `auto`: Only if element is naturally focusable
   * - `always`: Always attach focus listeners
   * - `never`: Never attach focus listeners (for composite widgets)
   *
   * @default 'auto'
   */
  focusTrigger?: HoverCardFocusTrigger;

  /**
   * Whether the hover card is enabled.
   * When false, hover/focus triggers are disabled.
   *
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Callback fired when hover card visibility changes.
   * Called with `true` when shown and `false` when hidden.
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Whether to show hover indication (dashed underline) on the trigger.
   * - `'auto'`: Show for text-only children
   * - `true`: Always show
   * - `false`: Never show
   *
   * @default 'auto'
   */
  hasHoverIndication?: 'auto' | boolean;

  /**
   * Whether the hover card should be shown on mount.
   * The hover card is still dismissible — this just opens it initially.
   */
  isDefaultOpen?: boolean;
}

/**
 * Check if children are text-only (no React elements)
 */
function isTextOnly(children: ReactNode): boolean {
  return typeof children === 'string' || typeof children === 'number';
}

/**
 * Utility to merge ARIA ID strings
 */
function mergeIds(...ids: (string | undefined | null)[]): string | undefined {
  const filtered = ids.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * HoverCard component for displaying interactive content on hover/focus.
 *
 * Uses a display:contents wrapper so children refs are preserved.
 * Uses CSS anchor positioning and the Popover API for optimal performance.
 *
 * @example
 * ```
 * <XDSHoverCard
 *   content={<ProfileCard user={user} />}
 *   placement="above">
 *   <XDSButton>Hover me</XDSButton>
 * </XDSHoverCard>
 * ```
 */
export function XDSHoverCard({
  children,
  content,
  placement = 'above',
  alignment = 'center',
  delay = 300,
  hideDelay = 200,
  focusTrigger = 'auto',
  isEnabled = true,
  onOpenChange,
  hasHoverIndication = 'auto',
  isDefaultOpen,
}: XDSHoverCardProps): ReactElement {
  const wrapperRef = useRef<HTMLElement>(null);
  const textOnly = isTextOnly(children);

  // Determine if hover indication should be shown
  const showHoverIndication =
    hasHoverIndication === true || (hasHoverIndication === 'auto' && textOnly);

  const handleShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleHide = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Use the hook for all hover card behavior
  const hoverCard = useXDSHoverCard({
    placement,
    alignment,
    delay,
    hideDelay,
    focusTrigger,
    isEnabled,
    isDefaultOpen,
    onShow: handleShow,
    onHide: handleHide,
  });

  // For element children with display:contents, attach ref to first child
  useLayoutEffect(() => {
    if (textOnly) return; // Skip for text-only (ref is on wrapper)

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const firstChild = wrapper.firstElementChild as HTMLElement | null;
    if (!firstChild) return;

    // Use combined ref for position + interaction
    hoverCard.ref(firstChild);

    // Set aria-describedby, merging with existing
    const existingDescribedBy = firstChild.getAttribute('aria-describedby');
    firstChild.setAttribute(
      'aria-describedby',
      mergeIds(existingDescribedBy, hoverCard.describedBy) ?? '',
    );

    return () => {
      hoverCard.ref(null);
      if (existingDescribedBy) {
        firstChild.setAttribute('aria-describedby', existingDescribedBy);
      } else {
        firstChild.removeAttribute('aria-describedby');
      }
    };
  }, [textOnly, hoverCard.ref, hoverCard.describedBy]);

  // For text-only children: use inline span with ref on wrapper
  if (textOnly) {
    return (
      <>
        <span
          ref={hoverCard.ref}
          tabIndex={0}
          aria-describedby={hoverCard.describedBy}
          {...stylex.props(
            styles.wrapperInline,
            showHoverIndication && styles.hoverIndication,
          )}>
          {children}
        </span>
        {hoverCard.renderHoverCard(content)}
      </>
    );
  }

  // For element children: use display:contents, ref on first child
  return (
    <>
      <div
        ref={wrapperRef as React.RefObject<HTMLDivElement | null>}
        {...stylex.props(styles.wrapperContents)}>
        {children}
      </div>
      {hoverCard.renderHoverCard(content)}
    </>
  );
}

XDSHoverCard.displayName = 'XDSHoverCard';

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HoverCard.tsx
 * @input Uses React, useHoverCard hook
 * @output Exports HoverCard component for hover/focus triggered layers
 * @position Layer component; inline-safe trigger wrapper, floating layer hosted by useLayer
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/HoverCard/HoverCard.test.tsx
 * - /packages/core/src/HoverCard/index.ts
 * - /apps/storybook/stories/HoverCard.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/HoverCard/ (showcase blocks)
 */

import {useCallback, useRef, type ReactElement, type ReactNode} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import * as stylex from '@stylexjs/stylex';
import {
  useHoverCard,
  type HoverCardFocusTrigger,
  type HoverCardTouchTrigger,
} from './useHoverCard';
import type {LayerAlignment, LayerPlacement} from '../Layer/useLayer';
import type {BaseProps} from '../BaseProps';
import {colorVars, spacingVars} from '../theme/tokens.stylex';

export type {
  HoverCardFocusTrigger,
  HoverCardTouchTrigger,
} from './useHoverCard';

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

export interface HoverCardProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
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
   * What a tap does on a touch pointer, where there is no hover:
   * - `auto`: tap opens the card, unless the trigger performs an action of its
   *   own (a button, a link, a form control) — that tap belongs to the control
   * - `tap`: tap always opens the card, even on a trigger that acts
   * - `none`: touch never opens the card
   *
   * @default 'auto'
   */
  touchTrigger?: HoverCardTouchTrigger;

  /**
   * Whether the hover card is enabled.
   * When false, hover/focus triggers are disabled.
   *
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Accessible name for the hover card popup.
   *
   * When provided, the popup is exposed to assistive technology as a named
   * `role="dialog"`. When omitted, the popup falls back to `role="group"` —
   * a group may validly be unnamed, an unnamed dialog may not.
   */
  label?: string;

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
   * Controlled open state. When provided, overrides hover/focus triggers:
   * - `true`: force-show the hover card (hover/focus hide is suppressed)
   * - `false`: force-hide the hover card
   * - `undefined`: uncontrolled — hover/focus triggers manage visibility
   */
  isOpen?: boolean;

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
 * <HoverCard
 *   content={<ProfileCard user={user} />}
 *   placement="above">
 *   <Button>Hover me</Button>
 * </HoverCard>
 * ```
 */
export function HoverCard({
  children,
  content,
  placement = 'above',
  alignment = 'center',
  delay = 300,
  hideDelay = 200,
  focusTrigger = 'auto',
  touchTrigger = 'auto',
  isEnabled = true,
  label,
  onOpenChange,
  hasHoverIndication = 'auto',
  isOpen,
  isDefaultOpen,
  xstyle,
  className,
  style,
}: HoverCardProps): ReactElement {
  const wrapperRef = useRef<HTMLSpanElement>(null);
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
  const hoverCard = useHoverCard({
    placement,
    alignment,
    delay,
    hideDelay,
    focusTrigger,
    touchTrigger,
    isEnabled,
    label,
    isOpen,
    isDefaultOpen,
    onShow: handleShow,
    onHide: handleHide,
  });

  // For element children with display:contents, attach ref to first child
  useIsomorphicLayoutEffect(() => {
    if (textOnly) {
      return;
    } // Skip for text-only (ref is on wrapper)

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    const firstChild = wrapper.firstElementChild as HTMLElement | null;
    if (!firstChild) {
      return;
    }

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

  // While closed, useLayer leaves only an inert <template> marker at this JSX
  // position. When the card needs to open, it uses that marker to keep the
  // final layer inline when the parent is safe or portal it outside a <p>,
  // link, or other ancestor that cannot contain it safely.
  const renderedHoverCard = hoverCard.renderHoverCard(content, {
    xstyle,
    className,
    style,
  });

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
        {renderedHoverCard}
      </>
    );
  }

  // For element children: use inline-safe display:contents, ref on first child
  return (
    <>
      <span ref={wrapperRef} {...stylex.props(styles.wrapperContents)}>
        {children}
      </span>
      {renderedHoverCard}
    </>
  );
}

HoverCard.displayName = 'HoverCard';

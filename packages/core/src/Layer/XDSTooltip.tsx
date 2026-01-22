/**
 * @file XDSTooltip.tsx
 * @input Uses React, useXDSTooltip hook
 * @output Exports XDSTooltip component for hover/focus triggered tooltips
 * @position Layer component; uses display:contents wrapper to avoid cloneElement
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layer/README.md
 * - /packages/core/src/Layer/XDSTooltip.test.tsx
 * - /packages/core/src/Layer/index.ts
 * - /apps/storybook/stories/Tooltip.stories.tsx
 */

import React, {
  useContext,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {ThemeContext} from '../theme/ThemeContext';
import {useXDSTooltip, type TooltipFocusTrigger} from './useXDSTooltip';
import type {LayerAlignment, LayerPlacement} from './useXDSLayer';
import {color} from '../theme/tokens.stylex';

export type {TooltipFocusTrigger} from './useXDSTooltip';

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
    textDecorationColor: color.dividerEmphasized,
    textUnderlineOffset: '2px',
  },
});

export interface XDSTooltipProps {
  /**
   * The trigger element(s). Children refs are preserved.
   */
  children: ReactNode;

  /**
   * Content to display in the tooltip.
   * Typically short, non-interactive text.
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
   * @default 200
   */
  delay?: number;

  /**
   * Delay before hiding after mouse/focus leave (ms)
   * @default 0
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
  focusTrigger?: TooltipFocusTrigger;

  /**
   * Whether the tooltip is enabled.
   * When false, hover/focus triggers are disabled.
   *
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Callback fired when tooltip is shown
   */
  onShow?: () => void;

  /**
   * Callback fired when tooltip is hidden
   */
  onHide?: () => void;

  /**
   * Whether to show hover indication (dashed underline) on the trigger.
   * - `'auto'`: Show for text-only children
   * - `true`: Always show
   * - `false`: Never show
   *
   * @default 'auto'
   */
  hasHoverIndication?: 'auto' | boolean;
}

/**
 * Check if children are text-only (no React elements)
 */
function isTextOnly(children: ReactNode): boolean {
  let hasElement = false;
  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
      hasElement = true;
    }
  });
  return !hasElement;
}

/**
 * Utility to merge ARIA ID strings
 */
function mergeIds(...ids: (string | undefined | null)[]): string | undefined {
  const filtered = ids.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * Tooltip component for displaying informative text on hover/focus.
 *
 * Uses inverted colors (dark background, light text) for high contrast.
 * Uses a display:contents wrapper so children refs are preserved.
 * Uses CSS anchor positioning and the Popover API for optimal performance.
 *
 * @example
 * ```tsx
 * <XDSTooltip content="Helpful tooltip text" placement="above">
 *   <XDSButton>Hover me</XDSButton>
 * </XDSTooltip>
 * ```
 */
export function XDSTooltip({
  children,
  content,
  placement = 'above',
  alignment = 'center',
  delay = 200,
  hideDelay = 0,
  focusTrigger = 'auto',
  isEnabled = true,
  onShow,
  onHide,
  hasHoverIndication = 'auto',
}: XDSTooltipProps): ReactElement {
  const wrapperRef = useRef<HTMLElement>(null);
  const textOnly = isTextOnly(children);

  // Get theme context for hover indication override
  const themeContext = useContext(ThemeContext);
  const themeHoverIndicationOverride =
    themeContext?.theme.components?.tooltip?.hoverIndication;

  // Determine if hover indication should be shown
  const showHoverIndication =
    hasHoverIndication === true || (hasHoverIndication === 'auto' && textOnly);

  // Use the hook for all tooltip behavior
  const tooltip = useXDSTooltip({
    placement,
    alignment,
    delay,
    hideDelay,
    focusTrigger,
    isEnabled,
    onShow,
    onHide,
  });

  // For element children with display:contents, attach ref to first child
  useLayoutEffect(() => {
    if (textOnly) return; // Skip for text-only (ref is on wrapper)

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const firstChild = wrapper.firstElementChild as HTMLElement | null;
    if (!firstChild) return;

    // Use combined ref for position + interaction
    tooltip.ref(firstChild);

    // Set aria-describedby, merging with existing
    const existingDescribedBy = firstChild.getAttribute('aria-describedby');
    firstChild.setAttribute(
      'aria-describedby',
      mergeIds(existingDescribedBy, tooltip.describedBy) ?? '',
    );

    return () => {
      tooltip.ref(null);
      if (existingDescribedBy) {
        firstChild.setAttribute('aria-describedby', existingDescribedBy);
      } else {
        firstChild.removeAttribute('aria-describedby');
      }
    };
  }, [textOnly, tooltip.ref, tooltip.describedBy]);

  // For text-only children: use inline span with ref on wrapper
  if (textOnly) {
    return (
      <>
        <span
          ref={tooltip.ref}
          tabIndex={0}
          aria-describedby={tooltip.describedBy}
          {...stylex.props(
            styles.wrapperInline,
            showHoverIndication && styles.hoverIndication,
            showHoverIndication && themeHoverIndicationOverride,
          )}>
          {children}
        </span>
        {tooltip.renderTooltip(content)}
      </>
    );
  }

  // For element children: use display:contents, ref on first child
  return (
    <>
      <div
        ref={wrapperRef as React.RefObject<HTMLDivElement>}
        {...stylex.props(styles.wrapperContents)}>
        {children}
      </div>
      {tooltip.renderTooltip(content)}
    </>
  );
}

XDSTooltip.displayName = 'XDSTooltip';

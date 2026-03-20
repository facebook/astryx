/**
 * @file XDSPopover.tsx
 * @input Uses React, useXDSPopover hook
 * @output Exports XDSPopover component for click-triggered popovers
 * @position Layer component; declarative wrapper around useXDSPopover hook
 *
 * For hover-triggered overlays, use XDSHoverCard instead.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Popover/XDSPopover.test.tsx
 * - /packages/core/src/Popover/index.ts
 * - /apps/storybook/stories/Popover.stories.tsx
 */

'use client';

import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';
import type {StyleXStyles} from '@stylexjs/stylex';
import {useXDSPopover} from './useXDSPopover';
import type {LayerAlignment, LayerPlacement} from '../Layer/useXDSLayer';
import {
  colorVars,
  durationVars,
  easeVars,
  spacingVars,
  radiusVars,
  shadowVars,
} from '../theme/tokens.stylex';

// =============================================================================
// Helpers
// =============================================================================

const BUTTON_SELECTOR = 'button, [role="button"]';

/**
 * Find the trigger button inside a container element.
 * Looks for `<button>` or `[role="button"]` — either the element itself
 * or the first matching descendant.
 */
function findTriggerButton(el: HTMLElement): HTMLElement | null {
  if (el.matches(BUTTON_SELECTOR)) return el;
  return el.querySelector<HTMLElement>(BUTTON_SELECTOR);
}

// =============================================================================
// Types
// =============================================================================

export interface XDSPopoverProps {
  /**
   * The trigger element. Must contain a `<button>` or `[role="button"]`
   * element — the popover locates it and applies click/keydown handlers
   * and ARIA attributes (`aria-haspopup`, `aria-expanded`, `aria-controls`).
   *
   * The trigger is rendered inside an anchor wrapper used for CSS anchor
   * positioning. The wrapper is stable (no pressed-state transforms),
   * preventing popover position jitter.
   *
   * When `anchorRef` is provided, children can be omitted and the popover
   * attaches to the external ref element as a sibling.
   */
  children?: ReactNode;

  /**
   * External ref to use as the popover anchor.
   * When provided (and no children), the popover attaches to this element
   * instead of wrapping children. The referenced element must be a
   * `<button>` or `[role="button"]` — the popover applies click/keydown
   * handlers and ARIA attributes to it directly.
   */
  anchorRef?: React.RefObject<HTMLElement>;

  /**
   * Content to display inside the popover.
   */
  content: ReactNode;

  /**
   * Position placement relative to the trigger.
   * Uses CSS anchor positioning via useXDSLayer.
   * @default 'below'
   */
  placement?: LayerPlacement;

  /**
   * Alignment along the placement axis.
   * @default 'start'
   */
  alignment?: LayerAlignment;

  /**
   * Whether the popover is open (controlled mode).
   * Omit for uncontrolled behavior.
   */
  isOpen?: boolean;

  /**
   * Callback fired when the popover visibility changes.
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Whether the popover is enabled.
   * When false, trigger interactions are ignored.
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Width of the popover container.
   * Numbers are px, strings used as-is.
   * @default 'auto'
   */
  width?: number | string;

  /**
   * Accessible label for the popover dialog.
   * Recommended for accessibility (used as aria-label on the dialog).
   */
  label?: string;

  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;

  /**
   * Test ID for the popover container.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // Stable anchor wrapper — uses inline-flex to generate a box for CSS
  // anchor positioning without affecting layout. The trigger element (e.g.
  // XDSButton) renders inside this wrapper. Because the wrapper itself is
  // the anchor, pressed-state transforms on the child (e.g. :active scale)
  // don't shift the anchor position and cause popover jitter.
  anchorWrapper: {
    display: 'inline-flex',
  },
  // Animation styles for the popover element (the one with [popover] attribute).
  // :popover-open only matches the element with the popover attribute,
  // so these MUST be applied via xstyle to useXDSLayer's render wrapper.
  popoverAnimation: {
    opacity: {
      default: 0,
      ':popover-open': 1,
    },
    transform: {
      default: 'scale(0.95)',
      ':popover-open': 'scale(1)',
    },
    transitionProperty: 'opacity, transform, overlay, display',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    transitionBehavior: 'allow-discrete',
    '@starting-style': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
  },
  // Visual styles for the inner content container
  container: {
    backgroundColor: colorVars['--color-surface'],
    color: colorVars['--color-text-primary'],
    '--popover-radius': radiusVars['--radius-2'],
    borderRadius: 'var(--popover-radius)',
    boxShadow: shadowVars['--shadow-menu'],
  },
  contentPadding: {
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-3'],
    paddingInlineStart: spacingVars['--spacing-3'],
    paddingInlineEnd: spacingVars['--spacing-3'],
  },
  gap: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  customWidth: (width: string | number) => ({
    width: typeof width === 'number' ? `${width}px` : width,
  }),
  matchTrigger: {
    minWidth: 'anchor-size(width)',
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A click-triggered popover for displaying interactive content anchored to a trigger.
 *
 * Implements the button + dialog ARIA pattern. The trigger must contain a
 * `<button>` or `[role="button"]` element — the popover finds it and applies
 * click/keydown handlers and ARIA attributes automatically.
 *
 * Uses an inline-flex wrapper as the CSS anchor for stable positioning
 * (immune to pressed-state transforms like `:active { scale(0.98) }`).
 *
 * Focus is trapped inside the popover when open.
 * Supports light dismiss (click outside or Escape to close).
 *
 * For hover-triggered overlays, use {@link XDSHoverCard} instead.
 *
 * @example
 * ```
 * <XDSPopover label="Settings" content={<SettingsPanel />} placement="below">
 *   <XDSButton label="Settings" />
 * </XDSPopover>
 * <XDSPopover
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   label="Filter"
 *   content={<FilterForm />}>
 *   <XDSButton label="Filter" />
 * </XDSPopover>
 * <XDSPopover
 *   anchorRef={myButtonRef}
 *   label="Actions"
 *   content={<ActionMenu />}
 *   placement="below"
 * />
 * ```
 */
export function XDSPopover({
  children,
  anchorRef,
  content,
  placement = 'below',
  alignment = 'start',
  isOpen,
  onOpenChange,
  isEnabled = true,
  width,
  label,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: XDSPopoverProps): ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isControlled = isOpen !== undefined;
  // Track when the popover was last hidden by light dismiss to prevent
  // the trigger click from immediately re-opening it.
  const lastHideTimeRef = useRef(0);

  const handlePopoverShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handlePopoverHide = useCallback(() => {
    lastHideTimeRef.current = Date.now();
    onOpenChange?.(false);
  }, [onOpenChange]);

  const popover = useXDSPopover({
    dialogLabel: label,
    hasLightDismiss: true,
    onShow: handlePopoverShow,
    onHide: handlePopoverHide,
  });

  // Shared handler for click events on the trigger button.
  const handleTriggerClick = useCallback(() => {
    if (!isEnabled) return;
    // If the popover was just closed by light dismiss (clicking outside),
    // the trigger click fires in the same event — skip re-opening.
    if (Date.now() - lastHideTimeRef.current < 50) return;
    popover.toggle();
  }, [isEnabled, popover]);

  // Shared handler for keydown events on role="button" elements.
  // Native <button> synthesizes click on Enter/Space, but role="button"
  // does not — we need to handle it explicitly.
  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTriggerClick();
      }
    },
    [handleTriggerClick],
  );

  /**
   * Attach click/keydown handlers and ARIA attributes to a trigger button.
   * Used by both sibling mode and children mode.
   */
  const attachTrigger = useCallback(
    (button: HTMLElement) => {
      // ARIA attributes
      button.setAttribute(
        'aria-haspopup',
        popover.triggerProps['aria-haspopup'],
      );
      button.setAttribute(
        'aria-expanded',
        String(popover.triggerProps['aria-expanded']),
      );
      button.setAttribute(
        'aria-controls',
        popover.triggerProps['aria-controls'],
      );

      // Event handlers
      button.addEventListener('click', handleTriggerClick);
      // Only add keydown for role="button" — native <button> already
      // synthesizes click events for Enter/Space.
      const needsKeyDown =
        button.tagName !== 'BUTTON' && button.getAttribute('role') === 'button';
      if (needsKeyDown) {
        button.addEventListener('keydown', handleTriggerKeyDown);
      }

      return () => {
        button.removeAttribute('aria-haspopup');
        button.removeAttribute('aria-expanded');
        button.removeAttribute('aria-controls');
        button.removeEventListener('click', handleTriggerClick);
        if (needsKeyDown) {
          button.removeEventListener('keydown', handleTriggerKeyDown);
        }
      };
    },
    [popover, handleTriggerClick, handleTriggerKeyDown],
  );

  // Sibling mode: attach to external anchorRef
  useLayoutEffect(() => {
    if (!anchorRef) return;

    const el = anchorRef.current;
    if (!el) return;

    const button = findTriggerButton(el);
    if (!button) {
      console.warn(
        'XDSPopover: anchorRef must reference a <button> or [role="button"] element. ' +
          'The popover trigger implements the button + dialog ARIA pattern.',
      );
    }
    if (!button) return;

    // Set up anchor positioning on the anchorRef element itself
    popover.triggerRef(el);

    // Attach handlers + ARIA to the button
    const detach = attachTrigger(button);

    return () => {
      popover.triggerRef(null);
      detach();
    };
  }, [anchorRef, popover, attachTrigger]);

  // Children mode: use wrapper as CSS anchor, find button inside for
  // ARIA + event handlers.
  useLayoutEffect(() => {
    if (anchorRef) return; // Skip if using anchorRef mode

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Use the wrapper as the CSS anchor — it doesn't receive pressed-state
    // transforms, so the anchor position stays stable.
    popover.triggerRef(wrapper);

    // Find the button inside the wrapper
    const button = findTriggerButton(wrapper);
    if (!button) {
      console.warn(
        'XDSPopover: children must contain a <button> or [role="button"] element. ' +
          'The popover trigger implements the button + dialog ARIA pattern.',
      );
    }
    if (!button) return;

    const detach = attachTrigger(button);

    return () => {
      popover.triggerRef(null);
      detach();
    };
  }, [anchorRef, popover, attachTrigger]);

  // Sync controlled state
  useLayoutEffect(() => {
    if (!isControlled) return;
    if (isOpen && !popover.isOpen) {
      popover.show();
    } else if (!isOpen && popover.isOpen) {
      popover.hide();
    }
  }, [isOpen, isControlled, popover]);

  // Determine popover xstyle
  const popoverXstyle = width ? styles.customWidth(width) : styles.matchTrigger;

  // Sibling mode: render only the popover (no wrapper needed)
  if (anchorRef && children == null) {
    return (
      <>
        {popover.render(
          <div
            data-testid={testId}
            {...mergeProps(
              xdsClassName('popover'),
              stylex.props(styles.container, styles.contentPadding, xstyle),
              className,
              style,
            )}>
            {content}
          </div>,
          {
            placement,
            alignment,
            xstyle: [popoverXstyle, styles.gap, styles.popoverAnimation],
          },
        )}
      </>
    );
  }

  return (
    <>
      <div ref={wrapperRef} {...stylex.props(styles.anchorWrapper)}>
        {children}
      </div>
      {popover.render(
        <div
          data-testid={testId}
          {...mergeProps(
            xdsClassName('popover'),
            stylex.props(styles.container, styles.contentPadding, xstyle),
            className,
            style,
          )}>
          {content}
        </div>,
        {
          placement,
          alignment,
          xstyle: [popoverXstyle, styles.gap, styles.popoverAnimation],
        },
      )}
    </>
  );
}

XDSPopover.displayName = 'XDSPopover';

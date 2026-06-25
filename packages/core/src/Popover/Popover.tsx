// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Popover.tsx
 * @input Uses React, usePopover hook
 * @output Exports Popover component for click-triggered popovers
 * @position Layer component; declarative wrapper around usePopover hook
 *
 * For hover-triggered overlays, use HoverCard instead.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Popover/Popover.test.tsx
 * - /packages/core/src/Popover/index.ts
 * - /apps/storybook/stories/Popover.stories.tsx
 * - /packages/cli/templates/blocks/components/Popover/ (showcase blocks)
 */

import React, {
  useCallback,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {usePopover} from './usePopover';
import type {LayerAlignment, LayerPlacement} from '../Layer/useLayer';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {InteractiveRoleContext} from '../InteractiveRoleContext/InteractiveRoleContext';
import {themeProps} from '../utils/themeProps';

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
  if (el.matches(BUTTON_SELECTOR)) {
    return el;
  }
  return el.querySelector<HTMLElement>(BUTTON_SELECTOR);
}

// =============================================================================
// Types
// =============================================================================

/**
 * Props passed to render-prop children for explicit trigger wiring.
 */
export interface PopoverTriggerRenderProps {
  /** Ref callback — attach to the trigger element for anchor positioning. */
  ref: (el: HTMLElement | null) => void;
  /** Toggle the popover open/closed. */
  onClick: () => void;
  /** ARIA attribute: indicates the element triggers a dialog. */
  'aria-haspopup': 'dialog';
  /** ARIA attribute: whether the popover is currently open. */
  'aria-expanded': boolean;
  /** ARIA attribute: ID of the controlled popover element. */
  'aria-controls': string;
}

export interface PopoverProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
  /**
   * The trigger element. Accepts either:
   *
   * **ReactNode (automatic mode):** Must contain a `<button>` or
   * `[role="button"]` element — the popover locates it and applies
   * click/keydown handlers and ARIA attributes automatically.
   * Components that consume `InteractiveRoleContext` (e.g., Token)
   * will render as a button automatically when placed here.
   *
   * **Render function (explicit mode):** Receives `PopoverTriggerRenderProps`
   * with ref, onClick, and ARIA attributes. The consumer is responsible
   * for attaching these to their trigger element. Use this for custom
   * triggers or third-party components.
   *
   * The trigger is rendered inside an anchor wrapper used for CSS anchor
   * positioning. The wrapper is stable (no pressed-state transforms),
   * preventing popover position jitter.
   *
   * When `anchorRef` is provided, children can be omitted and the popover
   * attaches to the external ref element as a sibling.
   *
   * @example
   * ```
   * <Popover content={...}><Button label="Open" /></Popover>
   * <Popover content={...}><Token label="Filter" /></Popover>
   * <Popover content={...}>
   *   {(triggerProps) => <MyCustomTrigger {...triggerProps} />}
   * </Popover>
   * ```
   */
  children?: ReactNode | ((props: PopoverTriggerRenderProps) => ReactNode);

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
   * Uses CSS anchor positioning via useLayer.
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
   * Whether to include a hidden close button for accessibility.
   * The button appears when keyboard users tab past the last element.
   * @default true
   */
  hasCloseButton?: boolean;

  /**
   * Label for the hidden close button.
   * @default "Close popover"
   */
  closeButtonLabel?: string;

  /**
   * Whether to auto-focus the first focusable element when the popover opens.
   * Set to `false` for inline showcases or documentation previews.
   * @default true
   */
  hasAutoFocus?: boolean;

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
  // Button) renders inside this wrapper. Because the wrapper itself is
  // the anchor, pressed-state transforms on the child (e.g. :active scale)
  // don't shift the anchor position and cause popover jitter.
  anchorWrapper: {
    display: 'inline-flex',
  },
  // Visual styles for the inner content container
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
 * For hover-triggered overlays, use {@link HoverCard} instead.
 *
 * @example
 * ```
 * <Popover label="Settings" content={<SettingsPanel />} placement="below">
 *   <Button label="Settings" />
 * </Popover>
 * <Popover
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   label="Filter"
 *   content={<FilterForm />}>
 *   <Button label="Filter" />
 * </Popover>
 * <Popover
 *   anchorRef={myButtonRef}
 *   label="Actions"
 *   content={<ActionMenu />}
 *   placement="below"
 * />
 * ```
 */
export function Popover({
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
  hasCloseButton,
  closeButtonLabel,
  hasAutoFocus,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: PopoverProps): ReactElement {
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

  const popover = usePopover({
    dialogLabel: label,
    hasLightDismiss: true,
    hasCloseButton,
    closeButtonLabel,
    hasAutoFocus,
    onShow: handlePopoverShow,
    onHide: handlePopoverHide,
  });

  // Shared handler for click events on the trigger button.
  const handleTriggerClick = useCallback(() => {
    if (!isEnabled) {
      return;
    }
    // If the popover was just closed by light dismiss (clicking outside),
    // the trigger click fires in the same event — skip re-opening.
    if (Date.now() - lastHideTimeRef.current < 50) {
      return;
    }
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
  useIsomorphicLayoutEffect(() => {
    if (!anchorRef) {
      return;
    }

    const el = anchorRef.current;
    if (!el) {
      return;
    }

    const button = findTriggerButton(el);
    if (!button) {
      console.warn(
        'Popover: anchorRef must reference a <button> or [role="button"] element. ' +
          'The popover trigger implements the button + dialog ARIA pattern.',
      );
    }
    if (!button) {
      return;
    }

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
  useIsomorphicLayoutEffect(() => {
    if (anchorRef) {
      return;
    } // Skip if using anchorRef mode
    if (typeof children === 'function') {
      return;
    } // Skip if using render prop mode

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    // Use the wrapper as the CSS anchor — it doesn't receive pressed-state
    // transforms, so the anchor position stays stable.
    popover.triggerRef(wrapper);

    // Find the button inside the wrapper
    const button = findTriggerButton(wrapper);
    if (!button) {
      console.warn(
        'Popover: children must contain a <button> or [role="button"] element. ' +
          'The popover trigger implements the button + dialog ARIA pattern.',
      );
    }
    if (!button) {
      return;
    }

    const detach = attachTrigger(button);

    return () => {
      popover.triggerRef(null);
      detach();
    };
  }, [anchorRef, popover, attachTrigger]);

  // Sync controlled state
  useIsomorphicLayoutEffect(() => {
    if (!isControlled) {
      return;
    }
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
              themeProps('popover'),
              stylex.props(styles.contentPadding, xstyle),
              className,
              style,
            )}>
            {content}
          </div>,
          {
            placement,
            alignment,
            xstyle: [popoverXstyle, styles.gap, layerAnimations[placement]],
          },
        )}
      </>
    );
  }

  // Render prop mode: children is a function — pass trigger props directly
  const isRenderProp = typeof children === 'function';

  if (isRenderProp) {
    const triggerProps: PopoverTriggerRenderProps = {
      ref: popover.triggerRef,
      onClick: handleTriggerClick,
      'aria-haspopup': 'dialog',
      'aria-expanded': popover.isOpen,
      'aria-controls': popover.id,
    };

    return (
      <>
        {children(triggerProps)}
        {popover.render(
          <div
            data-testid={testId}
            {...mergeProps(
              themeProps('popover'),
              stylex.props(styles.contentPadding, xstyle),
              className,
              style,
            )}>
            {content}
          </div>,
          {
            placement,
            alignment,
            xstyle: [popoverXstyle, styles.gap, layerAnimations[placement]],
          },
        )}
      </>
    );
  }

  // Automatic mode: wrap children in context + anchor wrapper
  return (
    <>
      <InteractiveRoleContext value="button">
        <div ref={wrapperRef} {...stylex.props(styles.anchorWrapper)}>
          {children}
        </div>
      </InteractiveRoleContext>
      {popover.render(
        <div
          data-testid={testId}
          {...mergeProps(
            themeProps('popover'),
            stylex.props(styles.contentPadding, xstyle),
            className,
            style,
          )}>
          {content}
        </div>,
        {
          placement,
          alignment,
          xstyle: [popoverXstyle, styles.gap, layerAnimations[placement]],
        },
      )}
    </>
  );
}

Popover.displayName = 'Popover';

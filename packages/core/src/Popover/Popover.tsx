// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Popover.tsx
 * @input Uses React layout measurement and the usePopover hook
 * @output Exports Popover with viewport fitting and conditional overflow
 * @position Layer component; declarative wrapper around usePopover hook
 *
 * For hover-triggered overlays, use HoverCard instead.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Popover/Popover.test.tsx
 * - /packages/core/src/Popover/index.ts
 * - /apps/storybook/stories/Popover.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Popover/ (showcase blocks)
 */

import React, {
  useCallback,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import * as stylex from '@stylexjs/stylex';
import {devWarn} from '../utils/devWarning';
import type {BaseProps} from '../BaseProps';
import {usePopoverInternal} from './usePopover';
import type {LayerAlignment, LayerPlacement} from '../Layer/useLayer';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {InteractiveRoleContext} from '../InteractiveRoleContext/InteractiveRoleContext';

// =============================================================================
// Helpers
// =============================================================================

const BUTTON_SELECTOR = 'button, [role="button"]';
const POPOVER_VIEWPORT_GUTTER = spacingVars['--spacing-4'];
const POPOVER_MAX_INLINE_SIZE = `calc(100vi - max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px)) - max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-right, 0px)))`;
const POPOVER_MAX_INLINE_SIZE_FALLBACK = `calc(100vw - ${POPOVER_VIEWPORT_GUTTER} - ${POPOVER_VIEWPORT_GUTTER})`;
const POPOVER_MAX_BLOCK_SIZE = `calc(100dvb - max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px)) - max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px)))`;
const POPOVER_MAX_BLOCK_SIZE_FALLBACK = `calc(100vh - ${POPOVER_VIEWPORT_GUTTER} - ${POPOVER_VIEWPORT_GUTTER})`;
const POPOVER_POSITION_AREA_MAX_INLINE_SIZE = `calc(100% - max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px)))`;
const POPOVER_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK = `calc(100% - ${POPOVER_VIEWPORT_GUTTER})`;
const POPOVER_INLINE_EDGE_GUTTER = `max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px))`;

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
  /** Toggle the popover open/closed. Pass the click event through so pointer and keyboard focus behavior can differ. */
  onClick: (event?: {detail: number}) => void;
  /** ARIA attribute: indicates the trigger opens a dialog-style popover. */
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
   * Recommended for accessibility when `role` is `'dialog'`.
   */
  label?: string;

  /**
   * ARIA role stamped on the popover content wrapper.
   *
   * Use `'dialog'` for dialog-style popovers. Use `'none'` when the popup
   * content owns its own role, such as a child `role="menu"` or
   * `role="listbox"`.
   *
   * @default 'dialog'
   */
  role?: 'dialog' | 'none';

  /**
   * Whether a dialog-style popover is modal (`aria-modal`). Only applies when
   * `role` is `'dialog'`.
   *
   * @default true
   */
  isModal?: boolean;

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
   * Whether to move focus into the popover when it opens. Keyboard activation
   * focuses the first content control; pointer activation focuses the labeled
   * dialog container so an action does not appear preselected.
   * Set to `false` for inline showcases or documentation previews.
   * @default true
   */
  hasAutoFocus?: boolean;

  /**
   * Whether clicking outside dismisses the popover.
   * Set to `false` for surfaces that should stay open until explicitly
   * dismissed, like onboarding coachmarks or multi-step flows.
   * @default true
   */
  hasLightDismiss?: boolean;

  /**
   * Whether pressing Escape dismisses the popover.
   *
   * Only takes full effect together with `hasLightDismiss={false}`: with
   * light dismiss on, the browser's native light dismiss also closes on
   * Escape. Set both to `false` for explicit-dismiss-only surfaces.
   * @default true
   */
  hasEscapeDismiss?: boolean;

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
  viewportFit: {
    boxSizing: 'border-box',
    maxBlockSize: stylex.firstThatWorks(
      POPOVER_MAX_BLOCK_SIZE,
      POPOVER_MAX_BLOCK_SIZE_FALLBACK,
    ),
  },
  viewportAligned: {
    maxInlineSize: stylex.firstThatWorks(
      POPOVER_POSITION_AREA_MAX_INLINE_SIZE,
      POPOVER_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  viewportStart: {
    marginInlineEnd: POPOVER_INLINE_EDGE_GUTTER,
  },
  viewportEnd: {
    marginInlineStart: POPOVER_INLINE_EDGE_GUTTER,
  },
  viewportBlockStart: {
    marginBlockEnd: `max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))`,
  },
  viewportBlockEnd: {
    marginBlockStart: `max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px))`,
  },
  viewportCentered: {
    marginInlineStart: POPOVER_INLINE_EDGE_GUTTER,
    marginInlineEnd: POPOVER_INLINE_EDGE_GUTTER,
    maxInlineSize: stylex.firstThatWorks(
      POPOVER_MAX_INLINE_SIZE,
      POPOVER_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  viewportBlockCentered: {
    marginBlockStart: `max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px))`,
    marginBlockEnd: `max(${POPOVER_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))`,
    maxInlineSize: stylex.firstThatWorks(
      POPOVER_MAX_INLINE_SIZE,
      POPOVER_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  surfaceViewportFit: {
    boxSizing: 'border-box',
    maxInlineSize: stylex.firstThatWorks(
      POPOVER_MAX_INLINE_SIZE,
      POPOVER_MAX_INLINE_SIZE_FALLBACK,
    ),
    maxBlockSize: stylex.firstThatWorks(
      POPOVER_MAX_BLOCK_SIZE,
      POPOVER_MAX_BLOCK_SIZE_FALLBACK,
    ),
  },
  surfaceScrollable: {
    overflow: 'auto',
    overscrollBehavior: 'contain',
  },
  // Content padding, applied to the popup surface so a theme's `padding`
  // replaces it instead of nesting inside it.
  contentPadding: {
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-3'],
    paddingInlineStart: spacingVars['--spacing-3'],
    paddingInlineEnd: spacingVars['--spacing-3'],
  },
  customWidth: (width: string | number) => ({
    width: typeof width === 'number' ? `${width}px` : width,
  }),
  matchTriggerAligned: {
    minWidth: stylex.firstThatWorks(
      `min(anchor-size(width), ${POPOVER_POSITION_AREA_MAX_INLINE_SIZE})`,
      `min(anchor-size(width), ${POPOVER_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK})`,
      'anchor-size(width)',
    ),
  },
  matchTriggerCentered: {
    minWidth: stylex.firstThatWorks(
      `min(anchor-size(width), ${POPOVER_MAX_INLINE_SIZE})`,
      `min(anchor-size(width), ${POPOVER_MAX_INLINE_SIZE_FALLBACK})`,
      'anchor-size(width)',
    ),
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
 * Supports light dismiss by default (click outside or Escape to close).
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
  role = 'dialog',
  isModal,
  hasCloseButton,
  closeButtonLabel,
  hasAutoFocus,
  hasLightDismiss = true,
  hasEscapeDismiss = true,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: PopoverProps): ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const measurementFrameRef = useRef<number | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const isControlled = isOpen !== undefined;

  const handlePopoverShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handlePopoverHide = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const popover = usePopoverInternal({
    dialogLabel: label,
    role,
    isModal,
    hasLightDismiss,
    hasEscapeDismiss,
    hasCloseButton,
    closeButtonLabel,
    hasAutoFocus,
    // The surface is the box that paints background, radius and elevation, so
    // it is the element the `popover` theme target has to sit on — a target on
    // the content div inside it styles a box that paints nothing.
    surfaceTarget: 'popover',
    xstyle: [
      styles.contentPadding,
      styles.surfaceViewportFit,
      hasOverflow && styles.surfaceScrollable,
      xstyle,
    ],
    className,
    style,
    onShow: handlePopoverShow,
    onHide: handlePopoverHide,
  });

  const measureOverflow = useCallback(() => {
    const surface = popover.contentRef.current;
    if (!surface) {
      return;
    }
    const nextHasOverflow =
      surface.scrollHeight > surface.clientHeight + 1 ||
      surface.scrollWidth > surface.clientWidth + 1;
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- DOM overflow measurement controls whether this surface becomes a scroll container
    setHasOverflow(current =>
      current === nextHasOverflow ? current : nextHasOverflow,
    );
  }, [popover.contentRef]);

  const scheduleOverflowMeasurement = useCallback(() => {
    if (measurementFrameRef.current != null) {
      return;
    }
    measurementFrameRef.current = window.requestAnimationFrame(() => {
      measurementFrameRef.current = null;
      measureOverflow();
    });
  }, [measureOverflow]);

  useIsomorphicLayoutEffect(() => {
    if (!popover.isOpen) {
      return;
    }
    const surface = popover.contentRef.current;
    if (!surface) {
      return;
    }
    measureOverflow();
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleOverflowMeasurement);
    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(scheduleOverflowMeasurement);
    resizeObserver?.observe(surface);
    mutationObserver?.observe(surface, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    surface.addEventListener('load', scheduleOverflowMeasurement, true);
    window.addEventListener('resize', scheduleOverflowMeasurement);
    window.visualViewport?.addEventListener(
      'resize',
      scheduleOverflowMeasurement,
    );
    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      surface.removeEventListener('load', scheduleOverflowMeasurement, true);
      window.removeEventListener('resize', scheduleOverflowMeasurement);
      window.visualViewport?.removeEventListener(
        'resize',
        scheduleOverflowMeasurement,
      );
      if (measurementFrameRef.current != null) {
        window.cancelAnimationFrame(measurementFrameRef.current);
        measurementFrameRef.current = null;
      }
    };
  }, [measureOverflow, popover.isOpen, scheduleOverflowMeasurement]);

  useIsomorphicLayoutEffect(() => {
    if (!popover.isOpen) {
      return;
    }
    scheduleOverflowMeasurement();
  }, [content, popover.isOpen, scheduleOverflowMeasurement]);

  // Shared handler for click events on the trigger button.
  const handleTriggerClick = useCallback(
    (event?: {detail: number}) => {
      if (!isEnabled) {
        return;
      }
      // Pointer/touch activation should not make the first action look
      // preselected. Keep focus inside the modal dialog by focusing its
      // labeled container; keyboard and AT activation still focus the first
      // content control and expose the expected focus ring.
      popover.toggleWithOptions({
        focusTarget:
          role === 'dialog' && event != null && event.detail > 0
            ? 'container'
            : 'first',
      });
    },
    [isEnabled, popover, role],
  );

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
      devWarn(
        'Popover',
        'anchorRef must reference a <button> or [role="button"] element. ' +
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
      devWarn(
        'Popover',
        'children must contain a <button> or [role="button"] element. ' +
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
  const popoverSizeXstyle = width
    ? styles.customWidth(width)
    : alignment === 'center'
      ? styles.matchTriggerCentered
      : styles.matchTriggerAligned;
  const isSidePlacement = placement === 'start' || placement === 'end';
  const popoverViewportXstyle =
    alignment === 'center'
      ? isSidePlacement
        ? styles.viewportBlockCentered
        : styles.viewportCentered
      : [
          styles.viewportAligned,
          isSidePlacement
            ? alignment === 'start'
              ? styles.viewportBlockStart
              : styles.viewportBlockEnd
            : alignment === 'start'
              ? styles.viewportStart
              : styles.viewportEnd,
        ];

  // Sibling mode: render only the popover (no wrapper needed)
  if (anchorRef && children == null) {
    return (
      <>
        {popover.render(<div data-testid={testId}>{content}</div>, {
          placement,
          alignment,
          offset: spacingVars['--spacing-1'],
          xstyle: [
            styles.viewportFit,
            popoverViewportXstyle,
            popoverSizeXstyle,
            layerAnimations[placement],
          ],
        })}
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
        {popover.render(<div data-testid={testId}>{content}</div>, {
          placement,
          alignment,
          offset: spacingVars['--spacing-1'],
          xstyle: [
            styles.viewportFit,
            popoverViewportXstyle,
            popoverSizeXstyle,
            layerAnimations[placement],
          ],
        })}
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
      {popover.render(<div data-testid={testId}>{content}</div>, {
        placement,
        alignment,
        offset: spacingVars['--spacing-1'],
        xstyle: [
          styles.viewportFit,
          popoverViewportXstyle,
          popoverSizeXstyle,
          layerAnimations[placement],
        ],
      })}
    </>
  );
}

Popover.displayName = 'Popover';

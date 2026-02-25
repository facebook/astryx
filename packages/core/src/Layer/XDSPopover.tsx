/**
 * @file XDSPopover.tsx
 * @input Uses React, useXDSPopover hook
 * @output Exports XDSPopover component for click-triggered popovers
 * @position Layer component; declarative wrapper around useXDSPopover hook
 *
 * For hover-triggered overlays, use XDSHoverCard instead.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layer/README.md
 * - /packages/core/src/Layer/XDSPopover.test.tsx
 * - /packages/core/src/Layer/index.ts
 * - /apps/storybook/stories/Popover.stories.tsx
 */

import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {useXDSPopover} from './useXDSPopover';
import type {LayerAlignment, LayerPlacement} from './useXDSLayer';
import {
  colorVars,
  spacingVars,
  radiusVars,
  elevationVars,
} from '../theme/tokens.stylex';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';

// =============================================================================
// Module Augmentation
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    popover?: {
      container?: ThemeStyleXStyles;
    };
  }
}

// =============================================================================
// Types
// =============================================================================

export interface XDSPopoverProps {
  /**
   * The trigger element. Rendered inside an anchor wrapper that handles
   * click interactions and CSS anchor positioning. Click events from
   * children bubble up to the wrapper, so buttons work naturally with
   * both mouse and keyboard (Enter/Space).
   *
   * When `anchorRef` is provided, children can be omitted and the popover
   * attaches to the external ref element as a sibling.
   */
  children?: ReactNode;

  /**
   * External ref to use as the popover anchor.
   * When provided (and no children), the popover attaches to this element
   * instead of wrapping children. This enables sibling-mode rendering,
   * useful when the trigger element is managed externally.
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
   * Whether the popover is shown (controlled mode).
   * Omit for uncontrolled behavior.
   */
  isShown?: boolean;

  /**
   * Callback fired when the popover visibility changes.
   */
  onToggle?: (isShown: boolean) => void;

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
   * Optional StyleX overrides for the popover container.
   */
  xstyle?: StyleXStyles;

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
  //
  // Click events from children bubble up to this wrapper, so keyboard
  // interactions (Enter/Space on buttons) work naturally without needing
  // imperative addEventListener on child DOM elements.
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
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
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
    borderRadius: radiusVars['--radius-element'],
    boxShadow: elevationVars['--elevation-menu'],
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
 * Uses an inline-flex wrapper as the CSS anchor. The wrapper serves two purposes:
 * 1. Stable anchor — doesn't receive pressed-state transforms (e.g. `:active { scale(0.98) }`)
 *    that the child trigger element may have, preventing popover position jitter.
 * 2. Click target — handles click events via React's event system (bubbled from children),
 *    so keyboard interactions (Enter/Space on buttons) work naturally.
 *
 * Focus is trapped inside the popover when open.
 * Supports light dismiss (click outside or Escape to close).
 *
 * For hover-triggered overlays, use {@link XDSHoverCard} instead.
 *
 * @example
 * ```tsx
 * // Basic popover
 * <XDSPopover label="Settings" content={<SettingsPanel />} placement="below">
 *   <XDSButton label="Settings" />
 * </XDSPopover>
 *
 * // Controlled popover
 * <XDSPopover
 *   isShown={isOpen}
 *   onToggle={setIsOpen}
 *   label="Filter"
 *   content={<FilterForm />}
 * >
 *   <XDSButton label="Filter" />
 * </XDSPopover>
 *
 * // Sibling mode with anchorRef
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
  isShown,
  onToggle,
  isEnabled = true,
  width,
  label,
  xstyle,
  'data-testid': testId,
}: XDSPopoverProps): ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isControlled = isShown !== undefined;
  // Track when the popover was last hidden by light dismiss to prevent
  // the trigger click from immediately re-opening it.
  const lastHideTimeRef = useRef(0);

  const popover = useXDSPopover({
    dialogLabel: label,
    hasLightDismiss: true,
    onShow: () => onToggle?.(true),
    onHide: () => {
      lastHideTimeRef.current = Date.now();
      onToggle?.(false);
    },
  });

  // Handle click on the anchor wrapper. Click events from children (e.g.
  // XDSButton) bubble up here, including keyboard-synthesized clicks
  // (Enter/Space on native buttons). No imperative addEventListener needed.
  const handleClick = useCallback(
    (_e: React.MouseEvent) => {
      if (!isEnabled) return;
      // If the popover was just closed by light dismiss (clicking outside),
      // the trigger click fires in the same event — skip re-opening.
      if (Date.now() - lastHideTimeRef.current < 50) return;
      popover.toggle();
    },
    [isEnabled, popover],
  );

  // Sibling mode: attach to external anchorRef
  useLayoutEffect(() => {
    if (!anchorRef) return;

    const el = anchorRef.current;
    if (!el) return;

    // Set up anchor positioning
    popover.triggerRef(el);

    // Set ARIA attributes
    el.setAttribute('aria-haspopup', popover.triggerProps['aria-haspopup']);
    el.setAttribute(
      'aria-expanded',
      String(popover.triggerProps['aria-expanded']),
    );
    el.setAttribute('aria-controls', popover.triggerProps['aria-controls']);

    // Add click handler (imperative for sibling mode since we don't wrap)
    const handleSiblingClick = () => {
      if (!isEnabled) return;
      if (Date.now() - lastHideTimeRef.current < 50) return;
      popover.toggle();
    };
    el.addEventListener('click', handleSiblingClick);

    return () => {
      popover.triggerRef(null);
      el.removeAttribute('aria-haspopup');
      el.removeAttribute('aria-expanded');
      el.removeAttribute('aria-controls');
      el.removeEventListener('click', handleSiblingClick);
    };
  }, [anchorRef, popover, isEnabled]);

  // Children mode: set up the wrapper as the CSS anchor and apply ARIA
  // attributes to the first child (the interactive trigger element).
  // Click handling is on the wrapper via React onClick — no imperative
  // event listeners needed.
  useLayoutEffect(() => {
    if (anchorRef) return; // Skip if using anchorRef mode

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Use the wrapper as the anchor — it doesn't receive pressed-state
    // transforms, so the anchor position stays stable.
    popover.triggerRef(wrapper);

    // ARIA attributes go on the interactive child element (the button),
    // not the wrapper, for correct screen reader announcements.
    const firstChild = wrapper.firstElementChild as HTMLElement | null;
    if (!firstChild) return;

    firstChild.setAttribute(
      'aria-haspopup',
      popover.triggerProps['aria-haspopup'],
    );
    firstChild.setAttribute(
      'aria-expanded',
      String(popover.triggerProps['aria-expanded']),
    );
    firstChild.setAttribute(
      'aria-controls',
      popover.triggerProps['aria-controls'],
    );

    return () => {
      popover.triggerRef(null);
      firstChild.removeAttribute('aria-haspopup');
      firstChild.removeAttribute('aria-expanded');
      firstChild.removeAttribute('aria-controls');
    };
  }, [anchorRef, popover]);

  // Sync controlled state
  useLayoutEffect(() => {
    if (!isControlled) return;
    if (isShown && !popover.isOpen) {
      popover.show();
    } else if (!isShown && popover.isOpen) {
      popover.hide();
    }
  }, [isShown, isControlled, popover]);

  // Determine popover xstyle
  const popoverXstyle = width ? styles.customWidth(width) : styles.matchTrigger;

  // Sibling mode: render only the popover (no wrapper needed)
  if (anchorRef && children == null) {
    return (
      <>
        {popover.render(
          <div
            data-testid={testId}
            {...stylex.props(styles.container, styles.contentPadding, xstyle)}>
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
      <div
        ref={wrapperRef}
        onClick={handleClick}
        {...stylex.props(styles.anchorWrapper)}>
        {children}
      </div>
      {popover.render(
        <div
          data-testid={testId}
          {...stylex.props(styles.container, styles.contentPadding, xstyle)}>
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

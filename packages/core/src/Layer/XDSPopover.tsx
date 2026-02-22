/**
 * @file XDSPopover.tsx
 * @input Uses React, useXDSPopover hook, XDSHoverCard
 * @output Exports XDSPopover component for click/hover triggered popovers
 * @position Layer component; declarative wrapper around useXDSPopover hook
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layer/README.md
 * - /packages/core/src/Layer/XDSPopover.test.tsx
 * - /packages/core/src/Layer/index.ts
 * - /apps/storybook/stories/Popover.stories.tsx
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {useXDSPopover} from './useXDSPopover';
import {XDSHoverCard} from './XDSHoverCard';
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

/**
 * How the popover is triggered.
 */
export type XDSPopoverTrigger = 'click' | 'hover';

export interface XDSPopoverProps {
  /**
   * The trigger element. Must accept a ref.
   * For click trigger: receives onClick, aria-expanded, aria-haspopup, aria-controls.
   * For hover trigger: delegates to XDSHoverCard behavior.
   */
  children: ReactNode;

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
   * @default 'center'
   */
  alignment?: LayerAlignment;

  /**
   * How the popover is triggered.
   * - click: Opens on click, closes on click outside or Escape
   * - hover: Opens on hover/focus, closes on mouse leave (delegates to XDSHoverCard)
   * @default 'click'
   */
  trigger?: XDSPopoverTrigger;

  /**
   * Whether the popover is shown (controlled mode).
   * Omit for uncontrolled behavior.
   */
  isShown?: boolean;

  /**
   * Default shown state for uncontrolled mode.
   * @default false
   */
  initialIsShown?: boolean;

  /**
   * Callback fired when the popover visibility changes.
   */
  onToggle?: (isShown: boolean) => void;

  /**
   * Whether to trap focus inside the popover when open.
   * @default true for click trigger, false for hover trigger
   */
  hasFocusTrap?: boolean;

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
   * Recommended for click-triggered popovers (which use role="dialog").
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
  wrapperContents: {
    display: 'contents',
  },
  container: {
    backgroundColor: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-element'],
    boxShadow: `0 4px 12px ${colorVars['--color-shadow-elevation']}`,
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
 * A popover component for displaying interactive content anchored to a trigger.
 *
 * Uses a display:contents wrapper so children refs are preserved.
 * For click trigger, uses useXDSPopover with focus trap and light dismiss.
 * For hover trigger, delegates to XDSHoverCard.
 *
 * @example
 * ```tsx
 * // Click-triggered popover
 * <XDSPopover
 *   label="Settings"
 *   content={<SettingsPanel />}
 *   placement="below"
 * >
 *   <XDSButton label="Settings" />
 * </XDSPopover>
 *
 * // Hover-triggered popover (delegates to HoverCard)
 * <XDSPopover trigger="hover" content={<UserCard />}>
 *   <XDSAvatar src={avatar} label={name} />
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
 * ```
 */
export function XDSPopover({
  children,
  content,
  placement = 'below',
  alignment = 'center',
  trigger = 'click',
  isShown,
  initialIsShown = false,
  onToggle,
  hasFocusTrap,
  isEnabled = true,
  width,
  label,
  xstyle,
  'data-testid': testId,
}: XDSPopoverProps): ReactElement {
  // Hover trigger delegates to XDSHoverCard
  if (trigger === 'hover') {
    return (
      <XDSHoverCard
        content={content}
        placement={placement}
        alignment={alignment}
        isEnabled={isEnabled}
        onShow={() => onToggle?.(true)}
        onHide={() => onToggle?.(false)}>
        {children}
      </XDSHoverCard>
    );
  }

  // Click trigger uses useXDSPopover
  return (
    <ClickPopover
      content={content}
      placement={placement}
      alignment={alignment}
      isShown={isShown}
      initialIsShown={initialIsShown}
      onToggle={onToggle}
      isEnabled={isEnabled}
      width={width}
      label={label}
      xstyle={xstyle}
      data-testid={testId}>
      {children}
    </ClickPopover>
  );
}

// =============================================================================
// Click Popover (internal)
// =============================================================================

interface ClickPopoverProps {
  children: ReactNode;
  content: ReactNode;
  placement: LayerPlacement;
  alignment: LayerAlignment;
  isShown?: boolean;
  initialIsShown: boolean;
  onToggle?: (isShown: boolean) => void;
  isEnabled: boolean;
  width?: number | string;
  label?: string;
  xstyle?: StyleXStyles;
  'data-testid'?: string;
}

/**
 * Internal click-triggered popover implementation.
 * Extracted to a separate component so hooks are called unconditionally.
 */
function ClickPopover({
  children,
  content,
  placement,
  alignment,
  isShown,
  initialIsShown,
  onToggle,
  isEnabled,
  width,
  label,
  xstyle,
  'data-testid': testId,
}: ClickPopoverProps): ReactElement {
  const wrapperRef = useRef<HTMLElement>(null);
  const isControlled = isShown !== undefined;
  const initializedRef = useRef(false);

  const popover = useXDSPopover({
    dialogLabel: label,
    hasLightDismiss: true,
    onShow: () => onToggle?.(true),
    onHide: () => onToggle?.(false),
  });

  // Sync controlled state
  useEffect(() => {
    if (!isControlled) return;
    if (isShown && !popover.isOpen) {
      popover.show();
    } else if (!isShown && popover.isOpen) {
      popover.hide();
    }
  }, [isShown, isControlled, popover]);

  // Handle initialIsShown
  useEffect(() => {
    if (!isControlled && initialIsShown && !initializedRef.current) {
      initializedRef.current = true;
      popover.show();
    }
  }, [initialIsShown, isControlled, popover]);

  // Handle click on trigger
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isEnabled) return;
      e.preventDefault();
      if (isControlled) {
        onToggle?.(!isShown);
      } else {
        popover.toggle();
      }
    },
    [isEnabled, isControlled, isShown, onToggle, popover],
  );

  // Attach click handler and popover ref to first child element
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const firstChild = wrapper.firstElementChild as HTMLElement | null;
    if (!firstChild) return;

    // Set up anchor positioning
    popover.triggerRef(firstChild);

    // Set ARIA attributes
    firstChild.setAttribute('aria-haspopup', 'dialog');
    firstChild.setAttribute('aria-expanded', String(popover.isOpen));
    firstChild.setAttribute('aria-controls', popover.id);

    // Add click handler
    firstChild.addEventListener('click', handleClick);

    return () => {
      popover.triggerRef(null);
      firstChild.removeAttribute('aria-haspopup');
      firstChild.removeAttribute('aria-expanded');
      firstChild.removeAttribute('aria-controls');
      firstChild.removeEventListener('click', handleClick);
    };
  }, [popover, handleClick]);

  // Determine popover xstyle
  const popoverXstyle = width ? styles.customWidth(width) : styles.matchTrigger;

  return (
    <>
      <div
        ref={wrapperRef as React.RefObject<HTMLDivElement>}
        {...stylex.props(styles.wrapperContents)}>
        {children}
      </div>
      {popover.render(
        <div data-testid={testId} {...stylex.props(styles.container, xstyle)}>
          {content}
        </div>,
        {
          placement,
          alignment,
          xstyle: [popoverXstyle, styles.gap],
        },
      )}
    </>
  );
}

XDSPopover.displayName = 'XDSPopover';

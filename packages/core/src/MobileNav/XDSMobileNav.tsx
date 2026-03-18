/**
 * @file XDSMobileNav.tsx
 * @input Uses React, useEffect, useRef, useCallback, ReactNode, StyleX
 * @output Exports XDSMobileNav component and XDSMobileNavProps
 * @position Core implementation; consumed by index.ts
 *
 * Full-height slide-out drawer overlay for mobile navigation.
 * The mobile counterpart to XDSSideNav — accepts the same children
 * (XDSSideNavSection, XDSSideNavItem, or any ReactNode).
 *
 * Uses the native `<dialog>` element with `showModal()` for top-layer rendering.
 * This eliminates z-index stacking issues — the drawer renders above everything
 * without manual z-index management. The browser provides:
 * - Top layer promotion (no z-index needed)
 * - `::backdrop` pseudo-element
 * - Body scroll lock
 * - Focus trapping
 * - Escape key handling via `cancel` event
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/MobileNav/index.ts (exports if types change)
 */

'use client';

import {useCallback, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  durationVars,
  easingVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {XDSHeading} from '../Text/XDSHeading';
import {useXDSAppShellMobile} from '../AppShell/XDSAppShellMobileContext';
import {xdsClassName, mergeProps} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  dialog: {
    // Reset native <dialog> defaults
    position: 'fixed',
    margin: 0,
    padding: 0,
    border: 'none',
    maxWidth: 'none',
    maxHeight: 'none',
    // Full viewport overlay — the dialog itself is the full-screen container
    inset: 0,
    width: '100vw',
    height: '100dvh',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    overscrollBehavior: 'contain',
    // Prevent touch gestures (pull-to-refresh, background scroll) passing through
    touchAction: 'none',
    outline: 'none',
    // Native <dialog> uses display:none when closed — we preserve that
    // by only setting display when [open] via :where() selector.
    // This prevents the dialog from blocking pointer events when closed.
    display: {
      default: 'none',
      ':where([open])': 'flex',
    },
  },
  // ::backdrop is provided by the browser's top layer
  backdrop: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'blur(2px)',
      opacity: 0,
      transitionProperty: 'opacity',
      transitionDuration: durationVars['--duration-medium'],
      transitionTimingFunction: easingVars['--easing-standard'],
    },
    '@media (prefers-reduced-motion: reduce)': {
      '::backdrop': {
        transitionDuration: '0.01s',
      },
    },
  },
  backdropOpen: {
    '::backdrop': {
      opacity: 1,
    },
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colorVars['--color-surface'],
    boxSizing: 'border-box',
    overflow: 'hidden',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easingVars['--easing-standard'],
    outline: 'none',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  drawerStart: {
    insetInlineStart: 0,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-divider'],
    transform: {
      default: 'translateX(-100%)',
      ':is([dir="rtl"] *)': 'translateX(100%)',
    },
  },
  drawerStartOpen: {
    transform: 'translateX(0)',
  },
  drawerEnd: {
    insetInlineEnd: 0,
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-divider'],
    transform: {
      default: 'translateX(100%)',
      ':is([dir="rtl"] *)': 'translateX(-100%)',
    },
  },
  drawerEndOpen: {
    transform: 'translateX(0)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingInline: spacingVars['--spacing-2'],
    flexShrink: 0,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-divider'],
  },
  headerNoTitle: {
    justifyContent: 'flex-end',
  },
  headerText: {
    marginInlineStart: spacingVars['--spacing-1'],
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    // Re-enable vertical touch scrolling inside the drawer content
    // (dialog root has touch-action: none to block pull-to-refresh)
    touchAction: 'pan-y',
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
  },
});

const dynamicStyles = stylex.create({
  width: (w: number) => ({
    width: '100vw',
    maxWidth: `${w}px`,
  }),
});

// =============================================================================
// Types
// =============================================================================

export interface XDSMobileNavProps extends Omit<XDSBaseProps, 'title'> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDialogElement>;
  /**
   * Whether the drawer is open.
   * Inside XDSAppShell, this is managed automatically via context.
   * Outside XDSAppShell, provide this prop to control the drawer yourself.
   */
  isOpen?: boolean;

  /**
   * Callback fired when the drawer visibility changes.
   * Called with `false` when the drawer should close
   * (backdrop click, escape, close button).
   * Inside XDSAppShell, this is managed automatically via context.
   * Outside XDSAppShell, provide this prop to control the drawer yourself.
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Drawer content — typically XDSSideNavSection/XDSSideNavItem, or any ReactNode.
   */
  children: ReactNode;

  /**
   * Header content for the drawer. Rendered next to the close button.
   * Pass a string for a simple text heading, or a ReactNode for
   * custom content (logo, SideNavHeading, search bar, etc.).
   */
  header?: ReactNode;

  /**
   * Width of the drawer in pixels.
   * @default 320
   */
  width?: number;

  /**
   * Which side the drawer slides from.
   * @default 'end'
   */
  side?: 'start' | 'end';

  /**
   * Accessible label for the drawer. Falls back to header string, then 'Navigation'.
   */
  label?: string;

  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A slide-out drawer overlay for mobile navigation.
 *
 * The mobile counterpart to XDSSideNav. Renders a full-height drawer that slides
 * in from the start (left in LTR) or end (right in LTR) edge of the viewport,
 * with a semi-transparent backdrop behind it.
 *
 * Uses the native `<dialog>` element with `showModal()` for top-layer rendering,
 * which provides built-in focus trapping, body scroll lock, and `::backdrop`.
 * No manual z-index needed — the browser's top layer handles stacking.
 *
 * When used inside XDSAppShell, `isOpen` and `onOpenChange` are managed
 * automatically via context. When used standalone, provide them as props.
 *
 * @example
 * ```
 * <XDSAppShell mobileNav={
 *   <XDSMobileNav header="Navigation">
 *     <XDSSideNavItem label="Home" href="/" />
 *   </XDSMobileNav>
 * }>
 * <XDSMobileNav isOpen={isOpen} onOpenChange={setIsOpen} header="Navigation">
 *   <XDSSideNavItem label="Home" href="/" />
 * </XDSMobileNav>
 * ```
 */
export function XDSMobileNav({
  isOpen: isOpenProp,
  onOpenChange: onOpenChangeProp,
  children,
  header,
  width = 320,
  side = 'end',
  label,
  'data-testid': testId,
  xstyle,
  className,
  style,
  ref,
}: XDSMobileNavProps) {
  // Read from AppShell context as fallback
  const appShellMobile = useXDSAppShellMobile();
  const isOpen = isOpenProp ?? appShellMobile.isMobileNavOpen;
  const onOpenChange =
    onOpenChangeProp ??
    ((open: boolean) => {
      if (open) {
        appShellMobile.openMobileNav();
      } else {
        appShellMobile.closeMobileNav();
      }
    });

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Merge refs
  const setRefs = useCallback(
    (element: HTMLDialogElement | null) => {
      (dialogRef as React.MutableRefObject<HTMLDialogElement | null>).current =
        element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    },
    [ref],
  );

  // Open/close the dialog via showModal()/close()
  // close() is delayed so the slide-out transition can play.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // Prevent background scrolling and iOS pull-to-refresh.
      // overflow: clip avoids creating a scroll container (unlike hidden),
      // so there's no scroll bounce and no need to save/restore scroll position.
      document.documentElement.style.overflow = 'clip';
    } else if (dialog.open) {
      document.documentElement.style.overflow = '';

      const duration = window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches
        ? 10
        : 250;
      closeTimeoutRef.current = setTimeout(() => {
        dialog.close();
      }, duration);
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Handle native cancel event (Escape key) — prevent default and route through onOpenChange
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      onOpenChange(false);
    },
    [onOpenChange],
  );

  // Handle clicks on the dialog backdrop area (outside the drawer)
  const handleDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      // Only close if click was directly on the dialog element (the transparent overlay),
      // not on the drawer or its children
      if (event.target === event.currentTarget) {
        onOpenChange(false);
      }
    },
    [onOpenChange],
  );

  const isStart = side === 'start';

  return (
    <dialog
      ref={setRefs}
      data-testid={testId}
      aria-label={label ?? (typeof header === 'string' ? header : 'Navigation')}
      onClick={handleDialogClick}
      onCancel={handleCancel}
      {...mergeProps(
        xdsClassName('mobile-nav', {side}),
        stylex.props(
          styles.dialog,
          styles.backdrop,
          isOpen && styles.backdropOpen,
          xstyle,
        ),
      )}>
      {/* Drawer panel — tabIndex so showModal() focuses the drawer, not the close button */}
      <div
        tabIndex={-1}
        {...stylex.props(
          styles.drawer,
          dynamicStyles.width(width),
          isStart && styles.drawerStart,
          isStart && isOpen && styles.drawerStartOpen,
          !isStart && styles.drawerEnd,
          !isStart && isOpen && styles.drawerEndOpen,
        )}>
        {/* Header — content + close button */}
        <div {...stylex.props(styles.header, !header && styles.headerNoTitle)}>
          {typeof header === 'string' ? (
            <span {...stylex.props(styles.headerText)}>
              <XDSHeading level={2}>{header}</XDSHeading>
            </span>
          ) : (
            (header ?? null)
          )}
          <XDSButton
            variant="ghost"
            label="Close navigation"
            icon={<XDSIcon icon="close" color="inherit" />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        {/* Scrollable content */}
        <div {...stylex.props(styles.content)}>{children}</div>
      </div>
    </dialog>
  );
}

XDSMobileNav.displayName = 'XDSMobileNav';

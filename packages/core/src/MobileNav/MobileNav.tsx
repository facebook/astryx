// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MobileNav.tsx
 * @input Uses React, useEffect, useRef, useCallback, ReactNode, StyleX
 * @output Exports MobileNav component and MobileNavProps
 * @position Core implementation; consumed by index.ts
 *
 * Full-height slide-out drawer overlay for mobile navigation.
 * The mobile counterpart to SideNav — accepts the same children
 * (SideNavSection, SideNavItem, or any ReactNode).
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
 * - /packages/cli/templates/blocks/components/MobileNav/ (showcase blocks)
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Heading} from '../Heading/Heading';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {mergeProps, mergeRefs, composeEventHandlers} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

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
    // Native <dialog> uses display:none when closed.
    // Open state applied via isOpen prop to avoid :where([open]) specificity issues.
    display: 'none',
  },
  open: {
    display: 'flex',
  },
  // ::backdrop is provided by the browser's top layer
  backdrop: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'blur(2px)',
      opacity: 0,
      transitionProperty: 'opacity',
      transitionDuration: durationVars['--duration-medium'],
      transitionTimingFunction: easeVars['--ease-standard'],
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
    backgroundColor: colorVars['--color-background-surface'],
    boxSizing: 'border-box',
    overflow: 'hidden',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: 'none',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  drawerStart: {
    insetInlineStart: 0,
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
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
    borderInlineStartWidth: borderVars['--border-width'],
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
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
    height: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-2'],
    flexShrink: 0,
    borderBlockEndWidth: borderVars['--border-width'],
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
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

export interface MobileNavProps extends Omit<BaseProps, 'title'> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDialogElement>;
  /**
   * Whether the drawer is open.
   * Inside AppShell, this is managed automatically via context.
   * Outside AppShell, provide this prop to control the drawer yourself.
   */
  isOpen?: boolean;

  /**
   * Callback fired when the drawer visibility changes.
   * Called with `false` when the drawer should close
   * (backdrop click, escape, close button).
   * Inside AppShell, this is managed automatically via context.
   * Outside AppShell, provide this prop to control the drawer yourself.
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Drawer content — typically SideNavSection/SideNavItem, or any ReactNode.
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
   * - `'start'` — slides from the inline-start edge (left in LTR)
   * - `'end'` — slides from the inline-end edge (right in LTR)
   * - `'auto'` — determined by the trigger element's position: if the
   *   toggle is in the start half of the viewport the drawer opens from
   *   start, otherwise from end.
   * @default 'auto'
   */
  side?: 'start' | 'end' | 'auto';

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
 * The mobile counterpart to SideNav. Renders a full-height drawer that slides
 * in from the start (left in LTR) or end (right in LTR) edge of the viewport,
 * with a semi-transparent backdrop behind it.
 *
 * Uses the native `<dialog>` element with `showModal()` for top-layer rendering,
 * which provides built-in focus trapping, body scroll lock, and `::backdrop`.
 * No manual z-index needed — the browser's top layer handles stacking.
 *
 * When used inside AppShell, `isOpen` and `onOpenChange` are managed
 * automatically via context. When used standalone, provide them as props.
 *
 * @example
 * ```
 * <AppShell mobileNav={
 *   <MobileNav header="Navigation">
 *     <SideNavItem label="Home" href="/" />
 *   </MobileNav>
 * }>
 * <MobileNav isOpen={isOpen} onOpenChange={setIsOpen} header="Navigation">
 *   <SideNavItem label="Home" href="/" />
 * </MobileNav>
 * ```
 */
export function MobileNav({
  isOpen: isOpenProp,
  onOpenChange: onOpenChangeProp,
  children,
  header,
  width = 320,
  side = 'auto',
  label,
  'data-testid': testId,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  ref,
  ...rest
}: MobileNavProps) {
  const t = useTranslator();
  // Read from AppShell context as fallback
  const appShellMobile = useAppShellMobile();
  const isOpen = isOpenProp ?? appShellMobile.isMobileNavOpen;
  // Share the id from AppShell context so the toggle's aria-controls resolves to
  // this drawer; fall back to a locally generated id when used standalone.
  const fallbackId = useId();
  const dialogId = appShellMobile.mobileNavId || fallbackId;
  const onOpenChange = useMemo(
    () =>
      onOpenChangeProp ??
      ((open: boolean) => {
        if (open) {
          appShellMobile.openMobileNav();
        } else {
          appShellMobile.closeMobileNav();
        }
      }),
    [onOpenChangeProp, appShellMobile],
  );

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  // Resolved side — computed from trigger position when side='auto'
  const [resolvedSide, setResolvedSide] = useState<'start' | 'end'>(
    side === 'auto' ? 'end' : side,
  );

  // Open/close the dialog via showModal()/close()
  // close() is delayed so the slide-out transition can play.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (isOpen) {
      // Determine drawer side from trigger position when auto
      if (side === 'auto') {
        const trigger = document.activeElement as HTMLElement | null;
        if (trigger && trigger !== document.body) {
          const rect = trigger.getBoundingClientRect();
          const triggerCenter = rect.left + rect.width / 2;
          // eslint-disable-next-line @eslint-react/set-state-in-effect -- side is resolved from trigger layout immediately before showModal()
          setResolvedSide(
            triggerCenter < window.innerWidth / 2 ? 'start' : 'end',
          );
        }
      } else {
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- side prop changes must update the open dialog placement
        setResolvedSide(side);
      }

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
        closeTimeoutRef.current = null;
      }
      document.documentElement.style.overflow = '';
      // Close the native dialog on teardown if it's still open. Inside AppShell
      // the drawer is mounted in an <Activity> that switches to mode="hidden"
      // when the drawer closes; React then runs this cleanup (with a stale
      // isOpen) instead of re-running the effect with isOpen=false, so the
      // close branch above never fires. If we leave the <dialog> `open` here,
      // showModal() is skipped on the next open (the dialog is already open in
      // the hidden tree) and the drawer can never be re-opened. Closing it
      // unconditionally on teardown keeps the native dialog state in sync so a
      // subsequent open cleanly calls showModal() again.
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isOpen, side]);

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

  const isStart = resolvedSide === 'start';

  return (
    <dialog
      ref={mergeRefs(ref, dialogRef)}
      id={dialogId}
      {...mergeProps(
        themeProps('mobile-nav', {side: resolvedSide}),
        stylex.props(
          styles.dialog,
          isOpen && styles.open,
          styles.backdrop,
          isOpen && styles.backdropOpen,
          xstyle,
        ),
        className,
        style,
      )}
      {...rest}
      data-testid={testId}
      aria-label={
        label ??
        (typeof header === 'string'
          ? header
          : t('@astryx.mobileNav.navigation'))
      }
      onClick={composeEventHandlers(onClickProp, handleDialogClick)}
      onCancel={handleCancel}>
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
              <Heading level={2}>{header}</Heading>
            </span>
          ) : (
            (header ?? null)
          )}
          <Button
            variant="ghost"
            label={t('@astryx.mobileNav.closeNavigation')}
            icon={<Icon icon="close" color="inherit" />}
            onClick={() => onOpenChange(false)}
            isIconOnly
          />
        </div>

        {/* Scrollable content */}
        <div {...stylex.props(styles.content)}>{children}</div>
      </div>
    </dialog>
  );
}

MobileNav.displayName = 'MobileNav';

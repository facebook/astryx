/**
 * @file XDSMobileNav.tsx
 * @input Uses React forwardRef, useEffect, useRef, useCallback, ReactNode, StyleX
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

import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {XDSHeading} from '../Text/XDSHeading';

// =============================================================================
// Styles
// =============================================================================

const SLIDE_DURATION = '0.25s';
const SLIDE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

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
      opacity: 0,
      transition: `opacity ${SLIDE_DURATION} ${SLIDE_EASING}`,
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
    transition: `transform ${SLIDE_DURATION} ${SLIDE_EASING}`,
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
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    flexShrink: 0,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-divider'],
  },
  headerNoTitle: {
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
  },
});

const dynamicStyles = stylex.create({
  width: (w: number) => ({
    width: `${w}px`,
    maxWidth: '85vw',
  }),
});

// =============================================================================
// Module Augmentation
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    mobileNav?: {
      /** Root dialog styles */
      root?: ThemeStyleXStyles;
      /** Drawer panel styles */
      drawer?: ThemeStyleXStyles;
    };
  }
}

// =============================================================================
// Types
// =============================================================================

export interface XDSMobileNavProps {
  /**
   * Whether the drawer is open.
   */
  isOpen: boolean;

  /**
   * Callback fired when the drawer visibility changes.
   * Called with `false` when the drawer should close
   * (backdrop click, escape, close button).
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Drawer content — typically XDSSideNavSection/XDSSideNavItem, or any ReactNode.
   */
  children: ReactNode;

  /**
   * Optional title shown at the top of the drawer.
   */
  title?: string;

  /**
   * Width of the drawer in pixels.
   * @default 280
   */
  width?: number;

  /**
   * Which side the drawer slides from.
   * @default 'start'
   */
  side?: 'start' | 'end';

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
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <XDSButton label="Menu" onClick={() => setIsOpen(true)} />
 *
 * <XDSMobileNav
 *   isOpen={isOpen}
 *   onOpenChange={(open) => setIsOpen(open)}
 *   title="Navigation"
 * >
 *   <XDSSideNavSection title="Main">
 *     <XDSSideNavItem label="Home" icon={HomeIcon} isSelected href="/" />
 *     <XDSSideNavItem label="Settings" icon={SettingsIcon} href="/settings" />
 *   </XDSSideNavSection>
 * </XDSMobileNav>
 * ```
 */
export const XDSMobileNav = forwardRef<HTMLDialogElement, XDSMobileNavProps>(
  function XDSMobileNav(
    {
      isOpen,
      onOpenChange,
      children,
      title,
      width = 280,
      side = 'start',
      'data-testid': testId,
    },
    ref,
  ) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Merge refs
    const setRefs = useCallback(
      (element: HTMLDialogElement | null) => {
        (
          dialogRef as React.MutableRefObject<HTMLDialogElement | null>
        ).current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref],
    );

    // Open/close the dialog via showModal()/close()
    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (isOpen) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        if (dialog.open) {
          dialog.close();
        }
      }
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

    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.mobileNav?.root;
    const drawerOverride = themeContext?.theme.components?.mobileNav?.drawer;

    const isStart = side === 'start';

    return (
      <dialog
        ref={setRefs}
        data-testid={testId}
        aria-label={title ?? 'Navigation'}
        onClick={handleDialogClick}
        onCancel={handleCancel}
        {...stylex.props(
          styles.dialog,
          styles.backdrop,
          isOpen && styles.backdropOpen,
          rootOverride,
        )}>
        {/* Drawer panel */}
        <div
          {...stylex.props(
            styles.drawer,
            dynamicStyles.width(width),
            isStart && styles.drawerStart,
            isStart && isOpen && styles.drawerStartOpen,
            !isStart && styles.drawerEnd,
            !isStart && isOpen && styles.drawerEndOpen,
            drawerOverride,
          )}>
          {/* Header with optional title and close button */}
          <div {...stylex.props(styles.header, !title && styles.headerNoTitle)}>
            {title && <XDSHeading level={2}>{title}</XDSHeading>}
            <XDSButton
              variant="ghost"
              label="Close navigation"
              tooltip="Close"
              icon={<XDSIcon icon="close" color="inherit" />}
              onClick={() => onOpenChange(false)}
            />
          </div>

          {/* Scrollable content */}
          <div {...stylex.props(styles.content)}>{children}</div>
        </div>
      </dialog>
    );
  },
);

XDSMobileNav.displayName = 'XDSMobileNav';

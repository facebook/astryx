/**
 * @file XDSMobileNav.tsx
 * @input Uses React forwardRef, useEffect, useRef, useCallback, ReactNode, StyleX, useFocusTrap
 * @output Exports XDSMobileNav component and XDSMobileNavProps
 * @position Core implementation; consumed by index.ts
 *
 * Full-height slide-out drawer overlay for mobile navigation.
 * The mobile counterpart to XDSSideNav — accepts the same children
 * (XDSSideNavSection, XDSSideNavItem, or any ReactNode).
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
import {useFocusTrap} from '../hooks/useFocusTrap';

// =============================================================================
// Styles
// =============================================================================

const SLIDE_DURATION = '0.25s';
const SLIDE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    visibility: 'hidden',
    pointerEvents: 'none',
  },
  overlayOpen: {
    visibility: 'visible',
    pointerEvents: 'auto',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colorVars['--color-overlay'],
    opacity: 0,
    transition: `opacity ${SLIDE_DURATION} ${SLIDE_EASING}`,
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  backdropOpen: {
    opacity: 1,
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
    borderInlineEnd: `1px solid ${colorVars['--color-divider']}`,
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
    borderInlineStart: `1px solid ${colorVars['--color-divider']}`,
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
    borderBlockEnd: `1px solid ${colorVars['--color-divider']}`,
  },
  headerTitleOnly: {
    borderBlockEnd: 'none',
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
      /** Root overlay styles */
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
   * Called when the drawer should close (backdrop click, escape, close button).
   */
  onClose: () => void;

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
 * Supports keyboard dismissal (Escape), backdrop click to close, focus trapping,
 * and body scroll lock while open.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <XDSButton label="Menu" onClick={() => setIsOpen(true)} />
 *
 * <XDSMobileNav
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Navigation"
 * >
 *   <XDSSideNavSection title="Main">
 *     <XDSSideNavItem label="Home" icon={HomeIcon} isSelected href="/" />
 *     <XDSSideNavItem label="Settings" icon={SettingsIcon} href="/settings" />
 *   </XDSSideNavSection>
 * </XDSMobileNav>
 * ```
 */
export const XDSMobileNav = forwardRef<HTMLDivElement, XDSMobileNavProps>(
  function XDSMobileNav(
    {
      isOpen,
      onClose,
      children,
      title,
      width = 280,
      side = 'start',
      'data-testid': testId,
    },
    ref,
  ) {
    const previousActiveElement = useRef<Element | null>(null);

    // Focus trap + Escape handling via shared hook
    const {containerRef, focusFirst} = useFocusTrap({
      isActive: isOpen,
      onEscape: onClose,
    });

    // Merge refs (containerRef from useFocusTrap + forwarded ref)
    const setRefs = useCallback(
      (element: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLElement | null>).current =
          element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref, containerRef],
    );

    // Focus management: focus first focusable on open, restore focus on close
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement;
        // Delay focus slightly to allow transition to start
        requestAnimationFrame(() => {
          focusFirst();
        });
      } else {
        if (
          previousActiveElement.current &&
          previousActiveElement.current instanceof HTMLElement
        ) {
          previousActiveElement.current.focus();
        }
      }
    }, [isOpen, focusFirst]);

    // Body scroll lock
    useEffect(() => {
      if (!isOpen) return;

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = useCallback(() => {
      onClose();
    }, [onClose]);

    // Prevent clicks inside the drawer from closing
    const handleDrawerClick = useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
    }, []);

    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.mobileNav?.root;
    const drawerOverride = themeContext?.theme.components?.mobileNav?.drawer;

    const isStart = side === 'start';

    return (
      <div
        data-testid={testId}
        role="presentation"
        {...stylex.props(
          styles.overlay,
          isOpen && styles.overlayOpen,
          rootOverride,
        )}>
        {/* Backdrop */}
        <div
          aria-hidden="true"
          onClick={handleBackdropClick}
          {...stylex.props(styles.backdrop, isOpen && styles.backdropOpen)}
        />

        {/* Drawer */}
        <div
          ref={setRefs}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? 'Navigation'}
          tabIndex={-1}
          onClick={handleDrawerClick}
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
          <div
            {...stylex.props(styles.header, !title && styles.headerTitleOnly)}>
            {title ? <XDSHeading level={2}>{title}</XDSHeading> : <span />}
            <XDSButton
              variant="ghost"
              label="Close navigation"
              tooltip="Close"
              icon={<XDSIcon icon="close" color="inherit" />}
              onClick={onClose}
            />
          </div>

          {/* Scrollable content */}
          <div {...stylex.props(styles.content)}>{children}</div>
        </div>
      </div>
    );
  },
);

XDSMobileNav.displayName = 'XDSMobileNav';

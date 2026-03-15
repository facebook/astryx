/**
 * @file XDSSideNavCollapseButton.tsx
 * @input Uses React, StyleX, SideNavCollapseContext, getIcon
 * @output Exports XDSSideNavCollapseButton component
 * @position Composable toggle button for sidenav collapse
 *
 * Place inside XDSSideNav (reads context automatically) or outside
 * (pass sideNavRef to connect). Customizable via label/children.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/index.ts
 */

'use client';

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
} from '../theme/tokens.stylex';
import {getIcon} from '../Icon/globalIconRegistry';
import {useSideNavCollapse} from './SideNavCollapseContext';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    minWidth: spacingVars['--spacing-7'],
    minHeight: spacingVars['--spacing-7'],
    padding: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-element'],
    border: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-icon-secondary'],
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    transitionProperty: 'background-color, color',
    transitionDuration: transitionVars['--transition-fast'],
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-hover-overlay'],
      },
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: transitionVars['--transition-fast'],
  },
  chevronCollapsed: {
    transform: 'rotate(180deg)',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSSideNavCollapseButtonProps {
  /**
   * Ref to the XDSSideNav element. Only needed when the button is
   * rendered outside the sidenav (reads collapse state via ref instead
   * of context).
   */
  sideNavRef?: React.RefObject<HTMLElement | null>;

  /**
   * Custom button label text. When provided, renders as a text button
   * with the chevron icon. When omitted, renders as an icon-only button.
   */
  label?: string;

  /**
   * Custom button content. Overrides the default chevron icon and label.
   */
  children?: ReactNode;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Composable toggle button for sidenav collapse.
 *
 * Place anywhere inside XDSSideNav (header, topContent, footer, footerIcons)
 * and it reads collapse state from context automatically. For placement
 * outside the sidenav (e.g. in TopNav or content area), pass sideNavRef.
 *
 * @example
 * ```
 * <XDSSideNav isCollapsible footerIcons={<XDSSideNavCollapseButton />}>
 *   ...
 * </XDSSideNav>
 * ```
 *
 * @example
 * ```
 * const ref = useRef(null);
 * <XDSTopNav endContent={<XDSSideNavCollapseButton sideNavRef={ref} />} />
 * <XDSSideNav ref={ref} isCollapsible>...</XDSSideNav>
 * ```
 */
export function XDSSideNavCollapseButton({
  sideNavRef: _sideNavRef,
  label,
  children,
}: XDSSideNavCollapseButtonProps) {
  const {isCollapsed, toggle, isCollapsible} = useSideNavCollapse();

  const handleClick = useCallback(() => {
    toggle();
  }, [toggle]);

  // TODO: sideNavRef-based wiring for outside-sidenav usage
  // For now, the button only works via context (inside sidenav or
  // when AppShell provides the context at the shell level).

  if (!isCollapsible) {
    return null;
  }

  const defaultContent = (
    <span
      {...stylex.props(styles.chevron, isCollapsed && styles.chevronCollapsed)}>
      {getIcon('chevronLeft')}
    </span>
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        label ?? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')
      }
      {...mergeProps(
        xdsClassName('side-nav-collapse-button'),
        stylex.props(styles.button),
      )}>
      {children ?? (
        <>
          {defaultContent}
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}

XDSSideNavCollapseButton.displayName = 'XDSSideNavCollapseButton';

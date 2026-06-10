// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSChatComposerDrawer.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSChatComposerDrawer component
 * @position Collapsible drawer panel for XDSChatComposer.
 *   Supports expanded (full content) and collapsed (count + label) states
 *   with fade animation and grid-template-rows height transition.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/cli/templates/blocks/components/ChatComposerDrawer/ (block examples)
 */

import {useState, type ReactNode} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {XDSBadge} from '../Badge';
import {xdsClassName, mergeProps} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';

export interface XDSChatComposerDrawerProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content to render inside the drawer — attachments, context chips, previews, etc.
   */
  children: ReactNode;
  /**
   * Total item count — shown in the collapsed badge.
   * When omitted, the component doesn't support collapse.
   */
  count?: number;
  /**
   * Label shown next to the count in collapsed state.
   * @default 'Items'
   */
  label?: string;
  /**
   * Whether the drawer is collapsed.
   * Uncontrolled by default (internal toggle).
   */
  isCollapsed?: boolean;
  /**
   * Default collapsed state for uncontrolled usage.
   * @default false
   */
  defaultIsCollapsed?: boolean;
  /**
   * Callback when collapsed state changes.
   */
  onCollapsedChange?: (isCollapsed: boolean) => void;

  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   *
   * @example
   * ```
   * const styles = stylex.create({ wrapper: { marginTop: 8 } });
   * <XDSChatComposerDrawer xstyle={styles.wrapper} />
   * ```
   */
  xstyle?: StyleXStyles;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

const styles = stylex.create({
  root: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: `calc(${spacingVars['--spacing-3']} + ${radiusVars['--radius-page']})`,
    marginBlockEnd: `calc(-1 * ${radiusVars['--radius-page']})`,
    // Surface base with a muted tint layered on top, both in the element's
    // own background layer. The muted backgroundImage composites over the
    // surface backgroundColor and — by CSS rule — paints behind all in-flow
    // content (tokens, labels, collapse handle) automatically. This restores
    // the original "surface bg + muted tint" intent (#1182) without a
    // positioned ::before, so it needs no z-index and works whether muted is
    // opaque or translucent.
    backgroundColor: colorVars['--color-background-surface'],
    backgroundImage: `linear-gradient(${colorVars['--color-background-muted']}, ${colorVars['--color-background-muted']})`,
    borderTopLeftRadius: radiusVars['--radius-page'],
    borderTopRightRadius: radiusVars['--radius-page'],
  },

  // Toggle row — both the bar handle and badge+label live in the
  // same grid cell so they crossfade without layout shift.
  toggleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    alignItems: 'center',
    height: spacingVars['--spacing-5'],
    paddingInline: spacingVars['--spacing-4'],
    marginInline: `calc(-1 * ${spacingVars['--spacing-4']})`,
    cursor: 'pointer',
    userSelect: 'none',
  },
  toggleCollapsed: {},
  toggleContent: {
    gridRow: 1,
    gridColumn: 1,
    justifySelf: 'start',
    display: 'inline-flex',
    alignItems: 'center',
    height: spacingVars['--spacing-5'],
    gap: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-full'],
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  toggleContentHidden: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },
  collapseLabel: {
    color: {
      default: colorVars['--color-text-secondary'],
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': colorVars['--color-text-primary'],
      },
    },
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: spacingVars['--spacing-5'],
    transitionProperty: 'color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  collapseBarHandle: {
    gridRow: 1,
    gridColumn: 1,
    justifySelf: 'center',
    alignSelf: 'start',
    width: '20px',
    height: '2px',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: {
      default: colorVars['--color-icon-secondary'],
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': colorVars['--color-icon-primary'],
      },
    },
    opacity: 1,
    transitionProperty: 'background-color, opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  collapseBarHandleHidden: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },

  // Animated content area — height collapses via grid-template-rows,
  // items stay in place and fade in/out (no translateY slide).
  contentGrid: {
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  contentGridCollapsed: {
    gridTemplateRows: '0fr',
  },
  content: {
    minHeight: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
    alignItems: 'flex-start',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-medium'],
    transitionDelay: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  contentCollapsed: {
    opacity: 0,
    transitionDelay: '0ms',
    transitionDuration: durationVars['--duration-fast'],
  },
});

/**
 * Collapsible drawer panel for a chat composer.
 * Use for attachments, context chips, or any supplementary content above the input.
 *
 * @example
 * ```
 * <XDSChatComposerDrawer count={3}>
 *   <AttachmentThumbnail />
 *   <AttachmentThumbnail />
 * </XDSChatComposerDrawer>
 * ```
 */
export function XDSChatComposerDrawer({
  ref,
  children,
  count,
  label = 'Items',
  isCollapsed: controlledCollapsed,
  defaultIsCollapsed = false,
  onCollapsedChange,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...htmlProps
}: XDSChatComposerDrawerProps): React.ReactElement {
  const [internalCollapsed, setInternalCollapsed] =
    useState(defaultIsCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const canCollapse = count != null;

  const toggle = () => {
    const next = !isCollapsed;
    if (!isControlled) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('chat-composer-drawer', {
          collapsed: isCollapsed ? 'collapsed' : null,
        }),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...htmlProps}>
      {canCollapse && (
        <div
          {...stylex.props(
            styles.toggleRow,
            isCollapsed && styles.toggleCollapsed,
            stylex.defaultMarker(),
          )}
          role="button"
          tabIndex={0}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? `Expand ${label}` : `Collapse ${label}`}
          onClick={toggle}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}>
          <div
            {...stylex.props(
              styles.toggleContent,
              !isCollapsed && styles.toggleContentHidden,
            )}>
            <XDSBadge variant="neutral" label={count} />
            <span {...stylex.props(styles.collapseLabel)}>{label}</span>
          </div>
          <div
            {...stylex.props(
              styles.collapseBarHandle,
              isCollapsed && styles.collapseBarHandleHidden,
            )}
          />
        </div>
      )}

      <div
        {...stylex.props(
          styles.contentGrid,
          canCollapse && isCollapsed && styles.contentGridCollapsed,
        )}>
        <div
          {...stylex.props(
            styles.content,
            canCollapse && isCollapsed && styles.contentCollapsed,
          )}>
          {children}
        </div>
      </div>
    </div>
  );
}

XDSChatComposerDrawer.displayName = 'XDSChatComposerDrawer';

'use client';

/**
 * @file XDSChatComposerAttachments.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSChatComposerAttachments component
 * @position Layout container for attachment items inside XDSChatComposer.
 *   Supports expanded (full content) and collapsed (count + label) states
 *   with animated grid-template-rows transition.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
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

export interface XDSChatComposerAttachmentsProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Attachment items — thumbnails, tokens, previews.
   */
  children: ReactNode;
  /**
   * Total attachment count — shown in the collapsed badge.
   * When omitted, the component doesn't support collapse.
   */
  count?: number;
  /**
   * Label shown next to the count in collapsed state.
   * @default 'Attachments'
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
    backgroundColor: colorVars['--color-background-surface'],
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderTopLeftRadius: 'inherit',
      borderTopRightRadius: 'inherit',
      backgroundColor: colorVars['--color-background-muted'],
      pointerEvents: 'none',
    },
    borderTopLeftRadius: radiusVars['--radius-page'],
    borderTopRightRadius: radiusVars['--radius-page'],
  },

  // Toggle row — click target area for collapse/expand
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    marginBlockStart: `calc(-1 * ${spacingVars['--spacing-2']})`,
    marginInline: `calc(-1 * ${spacingVars['--spacing-4']})`,
    cursor: 'pointer',
    userSelect: 'none',
  },
  toggleCollapsed: {
    justifyContent: 'flex-start',
    paddingBlockEnd: 0,
  },
  toggleContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-full'],
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@starting-style': {
      opacity: 0,
    },
  },
  collapseLabel: {
    color: {
      default: colorVars['--color-text-secondary'],
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': colorVars['--color-text-primary'],
      },
    },
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    transitionProperty: 'color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  collapseBarHandle: {
    width: '20px',
    height: '2px',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: {
      default: colorVars['--color-border-emphasized'],
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': colorVars['--color-text-primary'],
      },
    },
    opacity: 1,
    transitionProperty: 'background-color, opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@starting-style': {
      opacity: 0,
    },
  },

  // Animated content area
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
    transform: 'translateY(0)',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  contentCollapsed: {
    transform: `translateY(calc(100% + ${spacingVars['--spacing-3']} + ${radiusVars['--radius-page']}))`,
  },
});

export function XDSChatComposerAttachments({
  ref,
  children,
  count,
  label = 'Attachments',
  isCollapsed: controlledCollapsed,
  defaultIsCollapsed = false,
  onCollapsedChange,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...htmlProps
}: XDSChatComposerAttachmentsProps): React.ReactElement {
  const [internalCollapsed, setInternalCollapsed] =
    useState(defaultIsCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const canCollapse = count != null;

  const toggle = () => {
    const next = !isCollapsed;
    if (!isControlled) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('chat-composer-attachments', {
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
          onClick={toggle}>
          {isCollapsed ? (
            <div
              role="button"
              tabIndex={0}
              aria-expanded={false}
              aria-label={`Expand ${label}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle();
                }
              }}
              {...stylex.props(styles.toggleContent)}>
              <XDSBadge variant="neutral" label={count} />
              <span {...stylex.props(styles.collapseLabel)}>{label}</span>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-expanded={true}
              aria-label={`Collapse ${label}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle();
                }
              }}
              {...stylex.props(styles.collapseBarHandle)}
            />
          )}
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

XDSChatComposerAttachments.displayName = 'XDSChatComposerAttachments';

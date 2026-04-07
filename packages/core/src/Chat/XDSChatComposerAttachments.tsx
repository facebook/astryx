'use client';

/**
 * @file XDSChatComposerAttachments.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSChatComposerAttachments component
 * @position Layout container for attachment items inside XDSChatComposer.
 *   Supports expanded (full content) and collapsed (count + label) states.
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
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
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
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
    alignItems: 'center',
  },
  collapsed: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    cursor: 'pointer',
    userSelect: 'none',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '24px',
    paddingInline: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-accent-muted'],
    color: colorVars['--color-accent'],
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  collapseLabel: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
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
  const [internalCollapsed, setInternalCollapsed] = useState(defaultIsCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const canCollapse = count != null;

  const toggle = () => {
    const next = !isCollapsed;
    if (!isControlled) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  if (canCollapse && isCollapsed) {
    return (
      <div
        ref={ref}
        data-testid={testId}
        role="button"
        tabIndex={0}
        aria-expanded={false}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        {...mergeProps(
          xdsClassName('chat-composer-attachments.collapsed'),
          stylex.props(styles.collapsed, xstyle),
          className,
          style,
        )}
        {...htmlProps}
      >
        <span {...stylex.props(styles.badge)}>{count}</span>
        <span {...stylex.props(styles.collapseLabel)}>{label}</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('chat-composer-attachments'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...htmlProps}
    >
      {canCollapse && (
        <div
          role="button"
          tabIndex={0}
          aria-expanded={true}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
          {...stylex.props(styles.collapsed)}
        >
          <span {...stylex.props(styles.badge)}>{count}</span>
          <span {...stylex.props(styles.collapseLabel)}>{label}</span>
        </div>
      )}
      <div {...stylex.props(styles.content)}>
        {children}
      </div>
    </div>
  );
}

XDSChatComposerAttachments.displayName = 'XDSChatComposerAttachments';

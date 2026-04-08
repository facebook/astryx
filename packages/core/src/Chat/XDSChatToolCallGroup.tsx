'use client';

/**
 * @file XDSChatToolCallGroup.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSChatToolCallGroup component
 * @position Chat component — groups multiple tool calls under a summary
 *
 * When a single child is provided, renders it inline without group chrome.
 * When multiple children are provided, wraps them in a collapsible container
 * with an auto-generated or custom summary label.
 */

import React, {useState, useCallback, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
  fontWeightVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSChatToolCallGroupProps extends XDSBaseProps<HTMLDivElement> {
  /** XDSChatToolCall children. */
  children: ReactNode;
  /** Custom summary label. Auto-generated from children count if omitted. */
  label?: string;
  /** Whether the group is expanded. Uncontrolled by default. */
  isExpanded?: boolean;
  /** Default expanded state. @default true */
  defaultIsExpanded?: boolean;
  /** Callback when expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1-5'],
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: '24px',
    paddingBlock: spacingVars['--spacing-0-5'],
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '16px',
    height: '16px',
    color: colorVars['--color-text-secondary'],
  },
  label: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '14px',
    height: '14px',
    color: colorVars['--color-text-disabled'],
    transition: `transform ${durationVars['--duration-fast']} ${easeVars['--ease-standard']}`,
    marginInlineStart: 'auto',
  },
  chevronExpanded: {
    transform: 'rotate(90deg)',
  },
  content: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transition: `grid-template-rows ${durationVars['--duration-medium']} ${easeVars['--ease-standard']}`,
  },
  contentExpanded: {
    gridTemplateRows: '1fr',
  },
  contentInner: {
    overflow: 'hidden',
    minHeight: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    paddingInlineStart: spacingVars['--spacing-2'],
  },
});

// =============================================================================
// Icons
// =============================================================================

function ToolsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M8.5 2.5L11.5 5.5M2 12L5.5 8.5M9.5 5.5L5.5 9.5L2 12L2 9.5L8.5 3L11 5.5L9.5 5.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M4 2.5L7 5L4 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Groups multiple tool calls under a collapsible summary.
 *
 * Single child renders inline without group chrome. Multiple children
 * get a summary header with expand/collapse.
 *
 * @example
 * ```
 * <XDSChatToolCallGroup>
 *   <XDSChatToolCall name="searchCode" status="complete" duration="1.2s" />
 *   <XDSChatToolCall name="readFile" status="complete" duration="0.3s" />
 *   <XDSChatToolCall name="editFile" status="running" />
 * </XDSChatToolCallGroup>
 * ```
 */
export function XDSChatToolCallGroup(props: XDSChatToolCallGroupProps) {
  const {
    children,
    label: customLabel,
    isExpanded: controlledExpanded,
    defaultIsExpanded = true,
    onExpandedChange,
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const [internalExpanded, setInternalExpanded] = useState(defaultIsExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const toggle = useCallback(() => {
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange]);

  const childArray = React.Children.toArray(children);
  const count = childArray.length;

  // Single child: render inline, no group chrome
  if (count <= 1) {
    return <>{children}</>;
  }

  const label = customLabel ?? `${count} tool calls`;

  return (
    <div
      {...mergeProps(
        xdsClassName('chat-tool-call-group'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...rest}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.icon)}>
          <ToolsIcon />
        </span>
        <span {...stylex.props(styles.label)}>{label}</span>
        <span
          {...stylex.props(
            styles.chevron,
            isExpanded && styles.chevronExpanded,
          )}>
          <ChevronIcon />
        </span>
      </div>

      <div
        {...stylex.props(styles.content, isExpanded && styles.contentExpanded)}>
        <div {...stylex.props(styles.contentInner)}>
          <div {...stylex.props(styles.list)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

XDSChatToolCallGroup.displayName = 'XDSChatToolCallGroup';

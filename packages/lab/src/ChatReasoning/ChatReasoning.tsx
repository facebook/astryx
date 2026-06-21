// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatReasoning.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports ChatReasoning component
 * @position Chat component — compact collapsible reasoning/thinking display
 *
 * Renders model reasoning/thinking content as a compact single-line
 * collapsed element. Expanding reveals the full reasoning text.
 *
 * Design: extremely compact by default. One line with ellipsis overflow.
 * Expandable on click.
 */

import {useState, useCallback, type ReactNode} from 'react';
import type {BaseProps} from '@xds/core';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
  fontWeightVars,
  durationVars,
  easeVars,
} from '@xds/core/theme/tokens.stylex';
import {mergeProps} from '@xds/core/utils';
import {xdsThemeProps} from '../../../core/src/utils/xdsThemeProps';

// =============================================================================
// Types
// =============================================================================

export interface ChatReasoningProps extends BaseProps<HTMLDivElement> {
  /** Reasoning content. String renders as plain text; ReactNode for Markdown etc. */
  children: ReactNode;
  /** Header label. @default 'Thinking' */
  label?: string;
  /** Duration string shown after label (e.g. "12s"). */
  duration?: string;
  /** Whether reasoning is still streaming. Shows shimmer on label. */
  isStreaming?: boolean;
  /** Controlled expanded state. */
  isExpanded?: boolean;
  /** Default expanded state (uncontrolled). @default false */
  defaultIsExpanded?: boolean;
  /** Callback when expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void;
}

// =============================================================================
// Animations
// =============================================================================

const shimmerKeyframes = stylex.keyframes({
  '0%': {backgroundPosition: '200% 0'},
  '100%': {backgroundPosition: '-200% 0'},
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginBlockStart: spacingVars['--spacing-2'],
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
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    minWidth: 0,
    overflow: 'hidden',
  },
  label: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  duration: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-disabled'],
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  separator: {
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-disabled'],
    flexShrink: 0,
  },
  preview: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-disabled'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
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
  },
  chevronExpanded: {
    transform: 'rotate(180deg)',
  },
  shimmer: {
    backgroundImage: `linear-gradient(90deg, ${colorVars['--color-text-secondary']} 0%, ${colorVars['--color-text-disabled']} 50%, ${colorVars['--color-text-secondary']} 100%)`,
    backgroundSize: '200% 100%',
    backgroundClip: 'text',
    color: 'transparent',
    animationName: shimmerKeyframes,
    animationDuration: '4s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
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
  contentPadding: {
    paddingBlockStart: spacingVars['--spacing-2'],
    paddingInlineStart: `calc(16px + ${spacingVars['--spacing-1-5']})`,
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-secondary'],
  },
});

// =============================================================================
// Icons
// =============================================================================

function ThinkingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <circle cx="5.5" cy="7" r="0.75" fill="currentColor" />
      <circle cx="8.5" cy="7" r="0.75" fill="currentColor" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M3 4.5L6 7.5L9 4.5"
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
 * Compact collapsible display for model reasoning/thinking content.
 *
 * Renders as a single line: icon + label + duration + ellipsized preview.
 * Expands to show full reasoning on click.
 *
 * @example
 * ```
 * <ChatMessage sender="assistant">
 *   <ChatReasoning duration="12s">
 *     Let me work through the constraints on adjacent fields...
 *   </ChatReasoning>
 *   <Markdown>{response}</Markdown>
 * </ChatMessage>
 * ```
 */
export function ChatReasoning(props: ChatReasoningProps) {
  const {
    children,
    label = 'Thinking',
    duration,
    isStreaming = false,
    isExpanded: controlledExpanded,
    defaultIsExpanded = false,
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
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange]);

  const previewText = typeof children === 'string' ? children : null;

  return (
    <div
      {...mergeProps(
        xdsThemeProps('chat-reasoning', {
          expanded: isExpanded ? 'expanded' : null,
          streaming: isStreaming ? 'streaming' : null,
        }),
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
          <ThinkingIcon />
        </span>
        <div {...stylex.props(styles.labelRow)}>
          <span {...stylex.props(styles.label, isStreaming && styles.shimmer)}>
            {label}
          </span>
          {duration != null && !isStreaming && (
            <>
              <span {...stylex.props(styles.separator)}>·</span>
              <span {...stylex.props(styles.duration)}>{duration}</span>
            </>
          )}
          {!isExpanded && previewText && !isStreaming && (
            <>
              <span {...stylex.props(styles.separator)}>—</span>
              <span {...stylex.props(styles.preview)}>{previewText}</span>
            </>
          )}
        </div>
        <span
          {...stylex.props(
            styles.chevron,
            isExpanded && styles.chevronExpanded,
          )}>
          <ChevronDownIcon />
        </span>
      </div>

      <div
        {...stylex.props(styles.content, isExpanded && styles.contentExpanded)}>
        <div {...stylex.props(styles.contentInner)}>
          <div {...stylex.props(styles.contentPadding)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

ChatReasoning.displayName = 'ChatReasoning';

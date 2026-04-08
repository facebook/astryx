'use client';

/**
 * @file XDSChatToolCall.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSChatToolCall component
 * @position Chat component — individual tool call invocation display
 *
 * Renders a single tool/function call with name, status indicator,
 * optional duration, and expandable args/result content.
 *
 * Status: pending → running → complete | error
 */

import {useState, useCallback, type ReactNode, type ReactElement} from 'react';
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

export type XDSChatToolCallStatus =
  | 'pending'
  | 'running'
  | 'complete'
  | 'error';

export interface XDSChatToolCallProps extends XDSBaseProps<HTMLDivElement> {
  /** Tool/function name. */
  name: string;
  /** Current execution status. */
  status?: XDSChatToolCallStatus;
  /** Duration string (e.g. "1.2s", "340ms"). Shown when complete. */
  duration?: string;
  /** Expandable detail content — args, result, logs. */
  children?: ReactNode;
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

const spinKeyframes = stylex.keyframes({
  '0%': {transform: 'rotate(0deg)'},
  '100%': {transform: 'rotate(360deg)'},
});

const pulseKeyframes = stylex.keyframes({
  '0%, 100%': {opacity: 1},
  '50%': {opacity: 0.4},
});

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
    minHeight: '24px',
    paddingBlock: spacingVars['--spacing-0-5'],
  },
  headerClickable: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  statusIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '14px',
    height: '14px',
  },
  spinning: {
    animationName: spinKeyframes,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  pulsing: {
    animationName: pulseKeyframes,
    animationDuration: '1.5s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  name: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-code'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  duration: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-disabled'],
    whiteSpace: 'nowrap',
    flexShrink: 0,
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
  contentPadding: {
    paddingBlockStart: spacingVars['--spacing-1'],
    paddingBlockEnd: spacingVars['--spacing-2'],
    paddingInlineStart: `calc(14px + ${spacingVars['--spacing-1-5']})`,
  },
  // Status colors
  colorPending: {color: colorVars['--color-text-disabled']},
  colorRunning: {color: colorVars['--color-accent']},
  colorComplete: {color: colorVars['--color-success']},
  colorError: {color: colorVars['--color-error']},
});

// =============================================================================
// Status Icons
// =============================================================================

function PendingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function RunningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="8 6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CompleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" fill="currentColor" fillOpacity="0.15" />
      <path
        d="M4.5 7L6.5 9L10 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" fill="currentColor" fillOpacity="0.15" />
      <path
        d="M5 5L9 9M9 5L5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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

const STATUS_ICON: Record<XDSChatToolCallStatus, () => ReactElement> = {
  pending: PendingIcon,
  running: RunningIcon,
  complete: CompleteIcon,
  error: ErrorIcon,
};

const STATUS_COLOR_STYLE: Record<
  XDSChatToolCallStatus,
  ReturnType<typeof stylex.create>[string]
> = {
  pending: styles.colorPending,
  running: styles.colorRunning,
  complete: styles.colorComplete,
  error: styles.colorError,
};

// =============================================================================
// Component
// =============================================================================

/**
 * Individual tool/function call display.
 *
 * Compact single-line row: status icon + tool name + duration.
 * Expandable to show args/result as children.
 *
 * @example
 * ```
 * <XDSChatToolCall name="searchCode" status="complete" duration="1.2s">
 *   <XDSCodeBlock code={argsJson} language="json" />
 * </XDSChatToolCall>
 * ```
 */
export function XDSChatToolCall(props: XDSChatToolCallProps) {
  const {
    name,
    status = 'complete',
    duration,
    children,
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
  const hasContent = children != null;

  const toggle = useCallback(() => {
    if (!hasContent) return;
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange, hasContent]);

  const StatusIconComponent = STATUS_ICON[status];

  return (
    <div
      {...mergeProps(
        xdsClassName('chat-tool-call', {status}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...rest}>
      <div
        role={hasContent ? 'button' : undefined}
        tabIndex={hasContent ? 0 : undefined}
        aria-expanded={hasContent ? isExpanded : undefined}
        onClick={hasContent ? toggle : undefined}
        onKeyDown={
          hasContent
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle();
                }
              }
            : undefined
        }
        {...stylex.props(styles.header, hasContent && styles.headerClickable)}>
        <span
          {...stylex.props(
            styles.statusIcon,
            STATUS_COLOR_STYLE[status],
            status === 'running' && styles.spinning,
            status === 'pending' && styles.pulsing,
          )}>
          <StatusIconComponent />
        </span>
        <span {...stylex.props(styles.name)}>{name}</span>
        {duration != null && status === 'complete' && (
          <span {...stylex.props(styles.duration)}>{duration}</span>
        )}
        {hasContent && (
          <span
            {...stylex.props(
              styles.chevron,
              isExpanded && styles.chevronExpanded,
            )}>
            <ChevronIcon />
          </span>
        )}
      </div>

      {hasContent && (
        <div
          {...stylex.props(
            styles.content,
            isExpanded && styles.contentExpanded,
          )}>
          <div {...stylex.props(styles.contentInner)}>
            <div {...stylex.props(styles.contentPadding)}>{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}

XDSChatToolCall.displayName = 'XDSChatToolCall';

'use client';

/**
 * @file XDSChatToolCalls.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSChatToolCalls component
 * @position Chat component — displays tool/function call invocations
 *
 * Single component that handles both individual and grouped tool calls.
 * Accepts an array of call data matching the shape LLM APIs already return.
 * Single call renders inline; multiple calls get a collapsible summary.
 *
 * Design rationale: every LLM API (Vercel AI SDK, Anthropic, OpenAI)
 * returns tool calls as an array on the message. One component with a
 * data prop matches that shape directly — no nested compound components
 * for builders to wire up.
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
  radiusVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSBadge} from '../Badge';

// =============================================================================
// Types
// =============================================================================

export type XDSChatToolCallStatus =
  | 'pending'
  | 'running'
  | 'complete'
  | 'error';

export interface XDSChatToolCallStats {
  /** Number of lines/characters added */
  additions?: number;
  /** Number of lines/characters removed */
  deletions?: number;
  /** Number of files affected */
  files?: number;
  /** Number of search matches */
  matches?: number;
}

export interface XDSChatToolCallItem {
  /** Tool/function name. */
  name: string;
  /** Current execution status. @default 'complete' */
  status?: XDSChatToolCallStatus;
  /** Short summary label (e.g. "Edit Button.tsx", "git status"). Shown alongside name. */
  label?: string;
  /** Duration string (e.g. "1.2s", "340ms"). Shown when complete. */
  duration?: string;
  /** Sandbox/node name (e.g. "navi", "xds"). Shown as a pill badge. */
  node?: string;
  /** Stats like additions/deletions for edits, file/match counts. */
  stats?: XDSChatToolCallStats;
  /** Error message when status is 'error'. Shown in a tooltip on the status icon. */
  errorMessage?: string;
  /** Unique key for React list rendering. Falls back to index. */
  key?: string;
  /** Arbitrary data passed through to renderDetail. Store tool args, result, etc. */
  data?: unknown;
  /** Click handler for the call row. When provided, the row is interactive (pointer cursor, hover state). */
  onClick?: () => void;
}

export interface XDSChatToolCallsProps extends XDSBaseProps<HTMLDivElement> {
  /** Array of tool call data. */
  calls: XDSChatToolCallItem[];
  /** Custom summary label for groups. Auto-generated from count if omitted. */
  label?: string;
  /** Whether the group is expanded. Uncontrolled by default. */
  isExpanded?: boolean;
  /** Default expanded state. @default true for ≤3 calls, false for >3. */
  defaultIsExpanded?: boolean;
  /** Callback when expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void;
  /** Optional render function for per-call detail content. */
  renderDetail?: (call: XDSChatToolCallItem, index: number) => ReactNode;
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
    marginBlockStart: spacingVars['--spacing-2'],
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1-5'],
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: '24px',
    paddingBlock: spacingVars['--spacing-0-5'],
  },
  groupIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '16px',
    height: '16px',
    color: colorVars['--color-text-secondary'],
  },
  groupLabel: {
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
  },
  chevronExpanded: {
    transform: 'rotate(180deg)',
  },
  groupContent: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transition: `grid-template-rows ${durationVars['--duration-medium']} ${easeVars['--ease-standard']}`,
  },
  groupContentExpanded: {
    gridTemplateRows: '1fr',
  },
  groupContentInner: {
    overflow: 'hidden',
    minHeight: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  listIndented: {
    paddingInlineStart: spacingVars['--spacing-2'],
  },

  // Individual call row
  callRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1-5'],
    minHeight: '24px',
    paddingBlock: spacingVars['--spacing-0-5'],
  },
  callRowClickable: {
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    paddingInline: spacingVars['--spacing-1'],
    marginInline: `calc(-1 * ${spacingVars['--spacing-1']})`,
    ':hover': {
      backgroundColor: colorVars['--color-overlay-hover'],
    },
  },
  statusIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '16px',
    height: '16px',
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
  callName: {
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
  callLabel: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-disabled'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  callDuration: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-disabled'],
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  nodePill: {
    flexShrink: 0,
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-disabled'],
    flexShrink: 0,
  },
  statsAdditions: {
    color: colorVars['--color-success'],
  },
  statsDeletions: {
    color: colorVars['--color-error'],
  },
  // Pile effect for grouped tool calls
  pileWrapper: {
    position: 'relative',
  },
  pileCard: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: '100%',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
    opacity: 0.5,
  },
  pileCard1: {
    transform: 'translateY(-3px) scale(0.985)',
    opacity: 0.3,
  },
  pileCard2: {
    transform: 'translateY(-6px) scale(0.97)',
    opacity: 0.15,
  },
  detailContent: {
    paddingInlineStart: `calc(14px + ${spacingVars['--spacing-1-5']})`,
    paddingBlockEnd: spacingVars['--spacing-1'],
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

function WrenchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
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

const STATUS_ICONS: Record<XDSChatToolCallStatus, React.FC> = {
  pending: PendingIcon,
  running: RunningIcon,
  complete: CompleteIcon,
  error: ErrorIcon,
};

const STATUS_STYLES: Record<
  XDSChatToolCallStatus,
  ReturnType<typeof stylex.create>[string]
> = {
  pending: styles.colorPending,
  running: styles.colorRunning,
  complete: styles.colorComplete,
  error: styles.colorError,
};

// =============================================================================
// Internal: single call row
// =============================================================================

function CallRow({
  call,
  detail,
}: {
  call: XDSChatToolCallItem;
  detail?: ReactNode;
}) {
  const status = call.status ?? 'complete';
  const Icon = STATUS_ICONS[status];
  const isClickable = call.onClick != null;

  return (
    <div>
      <div
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={call.onClick}
        onKeyDown={isClickable ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            call.onClick?.();
          }
        } : undefined}
        {...stylex.props(
          styles.callRow,
          isClickable && styles.callRowClickable,
        )}>
        <span
          title={status === 'error' ? call.errorMessage : undefined}
          {...stylex.props(
            styles.statusIcon,
            STATUS_STYLES[status],
            status === 'running' && styles.spinning,
            status === 'pending' && styles.pulsing,
          )}>
          <Icon />
        </span>
        <span {...stylex.props(styles.callName)}>{call.name}</span>
        {call.node != null && (
          <XDSBadge label={call.node} variant="neutral" xstyle={styles.nodePill} />
        )}
        {call.label != null && (
          <span {...stylex.props(styles.callLabel)}>{call.label}</span>
        )}
        {call.stats != null && (
          <span {...stylex.props(styles.stats)}>
            {call.stats.files != null && (
              <span>{call.stats.files} file{call.stats.files !== 1 ? 's' : ''}</span>
            )}
            {call.stats.matches != null && (
              <span>{call.stats.matches} match{call.stats.matches !== 1 ? 'es' : ''}</span>
            )}
            {call.stats.additions != null && (
              <span {...stylex.props(styles.statsAdditions)}>+{call.stats.additions}</span>
            )}
            {call.stats.deletions != null && (
              <span {...stylex.props(styles.statsDeletions)}>-{call.stats.deletions}</span>
            )}
          </span>
        )}
        {call.duration != null && status === 'complete' && (
          <span {...stylex.props(styles.callDuration)}>{call.duration}</span>
        )}
      </div>
      {detail != null && (
        <div {...stylex.props(styles.detailContent)}>{detail}</div>
      )}
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays tool/function call invocations from an LLM response.
 *
 * Accepts a `calls` array matching the shape LLM APIs return. Single call
 * renders inline without group chrome. Multiple calls get a collapsible
 * summary header.
 *
 * @example
 * ```
 * // Basic — pass the array from your LLM response
 * <XDSChatToolCalls
 *   calls={message.toolCalls.map(tc => ({
 *     name: tc.toolName,
 *     status: tc.state,
 *     duration: tc.duration,
 *   }))}
 * />
 * ```
 *
 * @example
 * ```
 * // With detail rendering
 * <XDSChatToolCalls
 *   calls={toolCalls}
 *   renderDetail={(call) => (
 *     <XDSCodeBlock code={call.args} language="json" />
 *   )}
 * />
 * ```
 */
export function XDSChatToolCalls(props: XDSChatToolCallsProps) {
  const {
    calls,
    label: customLabel,
    isExpanded: controlledExpanded,
    defaultIsExpanded,
    onExpandedChange,
    renderDetail,
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const autoDefault = defaultIsExpanded ?? calls.length <= 3;
  const [internalExpanded, setInternalExpanded] = useState(autoDefault);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const toggle = useCallback(() => {
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange]);

  if (calls.length === 0) return null;

  // Single call: render inline, no group chrome
  if (calls.length === 1) {
    return (
      <div
        {...mergeProps(
          xdsClassName('chat-tool-calls'),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}
        {...rest}>
        <CallRow call={calls[0]} detail={renderDetail?.(calls[0], 0)} />
      </div>
    );
  }

  // Multiple calls: collapsible group
  const label = customLabel ?? `${calls.length} tool calls`;

  return (
    <div
      {...mergeProps(
        xdsClassName('chat-tool-calls'),
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
        {...stylex.props(styles.groupHeader)}>
        <span {...stylex.props(styles.groupIcon)}>
          <WrenchIcon />
        </span>
        <span {...stylex.props(styles.groupLabel)}>{label}</span>
        <span
          {...stylex.props(
            styles.chevron,
            isExpanded && styles.chevronExpanded,
          )}>
          <ChevronDownIcon />
        </span>
      </div>

      <div
        {...stylex.props(
          styles.groupContent,
          isExpanded && styles.groupContentExpanded,
        )}>
        <div {...stylex.props(styles.groupContentInner)}>
          <div {...stylex.props(styles.list, styles.listIndented)}>
            {calls.map((call, i) => (
              <CallRow
                key={call.key ?? i}
                call={call}
                detail={renderDetail?.(call, i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

XDSChatToolCalls.displayName = 'XDSChatToolCalls';

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
import {XDSIcon, type XDSIconName} from '../Icon';
import {XDSSpinner} from '../Spinner';

// =============================================================================
// Types
// =============================================================================

export type XDSChatToolCallStatus =
  | 'pending'
  | 'running'
  | 'complete'
  | 'error';

export interface XDSChatToolCallItem {
  /** Tool/function name. */
  name: string;
  /** Current execution status. @default 'complete' */
  status?: XDSChatToolCallStatus;
  /** The target of the action (e.g. "XDSButton.tsx", "yarn test", "CSS anchor positioning"). */
  target?: string;
  /** Duration string (e.g. "1.2s", "340ms"). Shown when complete. */
  duration?: string;
  /** Sandbox/node name (e.g. "navi", "xds"). Shown as a pill badge. */
  node?: string;
  /** Lines/characters added. Rendered in green (e.g. "+12"). */
  additions?: number;
  /** Lines/characters removed. Rendered in red (e.g. "-3"). */
  deletions?: number;
  /** Additional info rendered after the label. Free-form ReactNode. */
  stats?: ReactNode;
  /** Error message when status is 'error'. Shown in a tooltip on the status icon. */
  errorMessage?: string;
  /** Unique key for React list rendering. Falls back to index. */
  key?: string;
  /** Arbitrary data passed through to renderDetail. Store tool args, result, etc. */
  data?: unknown;
  /** Inline detail content shown when the row is expanded (e.g. code diff, command output). */
  resultDetail?: ReactNode;
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
}

// =============================================================================
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
    paddingInline: spacingVars['--spacing-1'],
    marginInline: `calc(-1 * ${spacingVars['--spacing-1']})`,
  },
  listIndented: {
    paddingInlineStart: 0,
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
  callRowToggle: {
    cursor: 'pointer',
  },
  statusIcon: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '16px',
    height: '16px',
    borderRadius: radiusVars['--radius-full'],
  },
  statusIconCircle: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    backgroundColor: 'currentColor',
    opacity: 0.15,
  },
  statusIconInner: {
    position: 'relative',
    display: 'inline-flex',
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
  errorText: {
    color: colorVars['--color-error'],
  },

  // Inline result detail
  callDetailChevron: {
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
  callDetailContent: {
    paddingInlineStart: `calc(16px + ${spacingVars['--spacing-1-5']})`,
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
  callCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-disabled'],
    flexShrink: 0,
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

  // Status colors
  colorPending: {color: colorVars['--color-text-disabled']},
  colorRunning: {color: colorVars['--color-accent']},
  colorComplete: {color: colorVars['--color-success']},
  colorError: {color: colorVars['--color-error']},
});

// =============================================================================
// Status Icons
// =============================================================================

const STATUS_ICON_NAMES: Record<XDSChatToolCallStatus, XDSIconName | null> = {
  pending: 'clock',
  running: null,
  complete: 'check',
  error: 'close',
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

function CallRow({call}: {call: XDSChatToolCallItem}) {
  const status = call.status ?? 'complete';
  const hasDetail = call.resultDetail != null;
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const toggleDetail = hasDetail
    ? () => setIsDetailOpen(prev => !prev)
    : undefined;

  const row = (
    <div
      role={hasDetail ? 'button' : undefined}
      tabIndex={hasDetail ? 0 : undefined}
      onClick={toggleDetail}
      onKeyDown={
        hasDetail
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDetail?.();
              }
            }
          : undefined
      }
      {...stylex.props(styles.callRow, hasDetail && styles.callRowClickable)}>
      <span
        title={status === 'error' ? call.errorMessage : undefined}
        {...stylex.props(styles.statusIcon, STATUS_STYLES[status])}>
        {status === 'running' ? (
          <XDSSpinner size="sm" shade="subtle" />
        ) : status === 'pending' ? (
          <XDSSpinner size="sm" shade="subtle" />
        ) : (
          <>
            <span {...stylex.props(styles.statusIconCircle)} />
            <span {...stylex.props(styles.statusIconInner)}>
              <XDSIcon
                icon={STATUS_ICON_NAMES[status]!}
                size="xsm"
                color="inherit"
              />
            </span>
          </>
        )}
      </span>
      <span {...stylex.props(styles.callName)}>{call.name}</span>
      {call.node != null && (
        <XDSBadge
          label={call.node}
          variant="neutral"
          xstyle={styles.nodePill}
        />
      )}
      {call.target != null && (
        <span {...stylex.props(styles.callLabel)}>{call.target}</span>
      )}
      {(call.additions != null ||
        call.deletions != null ||
        call.stats != null) && (
        <span {...stylex.props(styles.stats)}>
          {call.additions != null && (
            <span {...stylex.props(styles.statsAdditions)}>
              +{call.additions}
            </span>
          )}
          {call.deletions != null && (
            <span {...stylex.props(styles.statsDeletions)}>
              -{call.deletions}
            </span>
          )}
          {call.stats}
        </span>
      )}
      {call.duration != null && status === 'complete' && (
        <span {...stylex.props(styles.callDuration)}>{call.duration}</span>
      )}
      {hasDetail && (
        <span
          {...stylex.props(
            styles.callDetailChevron,
            isDetailOpen && styles.chevronExpanded,
          )}>
          <XDSIcon icon="chevronDown" size="xsm" color="inherit" />
        </span>
      )}
    </div>
  );

  if (!hasDetail) return row;

  return (
    <div>
      {row}
      {isDetailOpen && (
        <div {...stylex.props(styles.callDetailContent)}>
          {call.resultDetail}
        </div>
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
 * <XDSChatToolCalls
 *   calls={message.toolCalls.map(tc => ({
 *     name: tc.toolName,
 *     status: tc.state,
 *     duration: tc.duration,
 *   }))}
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
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const hasErrors = calls.some(c => c.status === 'error');
  const errorCount = calls.filter(c => c.status === 'error').length;
  const isStreaming = calls.some(
    c => c.status === 'running' || c.status === 'pending',
  );
  const autoDefault = defaultIsExpanded ?? false;
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
        <CallRow call={calls[0]} />
      </div>
    );
  }

  // Multiple calls: latest call at surface with chevron to expand all
  const latestCall = calls[calls.length - 1];
  const latestStatus = latestCall.status ?? 'complete';

  return (
    <div
      {...mergeProps(
        xdsClassName('chat-tool-calls'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...rest}>
      {/* Header: collapsed shows latest call + count, expanded shows summary label */}
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
        {...stylex.props(styles.callRow, styles.callRowToggle)}>
        {isExpanded ? (
          <>
            <span {...stylex.props(styles.groupIcon)}>
              <XDSIcon icon="wrench" size="sm" color="inherit" />
            </span>
            <span {...stylex.props(styles.groupLabel)}>
              {calls.length} tool calls
            </span>
          </>
        ) : (
          <>
            <span
              {...stylex.props(styles.statusIcon, STATUS_STYLES[latestStatus])}>
              {latestStatus === 'running' ? (
                <XDSSpinner size="sm" shade="subtle" />
              ) : latestStatus === 'pending' ? (
                <XDSSpinner size="sm" shade="subtle" />
              ) : (
                <>
                  <span {...stylex.props(styles.statusIconCircle)} />
                  <span {...stylex.props(styles.statusIconInner)}>
                    <XDSIcon
                      icon={STATUS_ICON_NAMES[latestStatus]!}
                      size="xsm"
                      color="inherit"
                    />
                  </span>
                </>
              )}
            </span>
            <span {...stylex.props(styles.callName)}>{latestCall.name}</span>
            {latestCall.target != null && (
              <span {...stylex.props(styles.callLabel)}>
                {latestCall.target}
              </span>
            )}
          </>
        )}
        <span {...stylex.props(styles.callCount)}>
          {!isExpanded && (
            <>
              <XDSIcon icon="wrench" size="xsm" color="inherit" />
              {calls.length}
            </>
          )}
        </span>
        <span
          {...stylex.props(
            styles.chevron,
            isExpanded && styles.chevronExpanded,
          )}>
          <XDSIcon icon="chevronDown" size="xsm" color="inherit" />
        </span>
      </div>

      {/* Expanded: all calls with full metadata */}
      <div
        {...stylex.props(
          styles.groupContent,
          isExpanded && styles.groupContentExpanded,
        )}>
        <div {...stylex.props(styles.groupContentInner)}>
          <div {...stylex.props(styles.list)}>
            {calls.map((call, i) => (
              <CallRow key={call.key ?? i} call={call} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

XDSChatToolCalls.displayName = 'XDSChatToolCalls';

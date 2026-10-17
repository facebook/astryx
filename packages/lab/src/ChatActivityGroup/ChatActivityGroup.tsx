// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatActivityGroup.tsx
 * @input Uses React, StyleX, ChatToolCalls, ChatReasoning, i18n, Icon, Spinner, theme tokens
 * @output Exports ChatActivityGroup component and item/prop types
 * @position Lab Chat component — folds mixed reasoning + tool-call activity
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/ChatActivityGroup/ChatActivityGroup.test.tsx
 * - /packages/lab/src/ChatActivityGroup/ChatActivityGroup.doc.mjs
 * - /packages/lab/src/index.ts
 */

import {useCallback, useId, useState, type ReactNode} from 'react';
import type {BaseProps} from '@astryxdesign/core';
import * as stylex from '@stylexjs/stylex';
import {
  ChatToolCalls,
  type ChatToolCallItem,
  type ChatToolCallStatus,
} from '@astryxdesign/core/Chat';
import {Icon, type IconName} from '@astryxdesign/core/Icon';
import {Spinner} from '@astryxdesign/core/Spinner';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {useTranslator} from '@astryxdesign/core/i18n';
import {
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps} from '@astryxdesign/core/utils';
import {themeProps} from '@astryxdesign/core/utils';
import {ChatReasoning} from '../ChatReasoning/ChatReasoning';

export type ChatActivityToolItem = {kind: 'tool'} & ChatToolCallItem;

export type ChatActivityReasoningItem = {
  kind: 'reasoning';
  content: ReactNode;
  label?: string;
  duration?: string;
  isStreaming?: boolean;
  key?: string;
};

export type ChatActivityItem = ChatActivityToolItem | ChatActivityReasoningItem;

export interface ChatActivityGroupProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Ordered mixed activity items (reasoning blocks and tool calls). */
  items: ChatActivityItem[];
  /** Custom summary label for the expanded group header. */
  label?: string;
  /** Controlled expanded state. */
  isExpanded?: boolean;
  /** Default expanded state when uncontrolled. @default false */
  defaultIsExpanded?: boolean;
  /** Callback when expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void;
}

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
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    userSelect: 'none',
    minHeight: '24px',
    paddingBlock: spacingVars['--spacing-0-5'],
  },
  preview: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-code'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 1,
    minWidth: '4ch',
  },
  groupLabel: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
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
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '14px',
    height: '14px',
    color: colorVars['--color-text-disabled'],
  },
  chevronTransition: {
    transition: {
      default: `transform ${durationVars['--duration-fast']} ${easeVars['--ease-standard']}`,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
  },
  chevronExpanded: {
    transform: 'rotate(180deg)',
  },
  colorPending: {color: colorVars['--color-text-disabled']},
  colorRunning: {color: colorVars['--color-accent']},
  colorComplete: {color: colorVars['--color-success']},
  colorError: {color: colorVars['--color-error']},
  groupContent: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transition: {
      default: `grid-template-rows ${durationVars['--duration-medium']} ${easeVars['--ease-standard']}`,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
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
  nestedItem: {
    marginBlockStart: '0',
  },
});

function previewLabel(item: ChatActivityItem): string {
  return item.kind === 'tool' ? item.name : (item.label ?? 'Thinking');
}

function surfaceStatus(item: ChatActivityItem): ChatToolCallStatus {
  if (item.kind === 'tool') {
    return item.status ?? 'complete';
  }
  return item.isStreaming ? 'running' : 'complete';
}

const STATUS_ICON_NAMES: Record<ChatToolCallStatus, IconName | null> = {
  pending: 'clock',
  running: null,
  complete: 'success',
  error: 'error',
};

const STATUS_STYLES: Record<
  ChatToolCallStatus,
  ReturnType<typeof stylex.create>[string]
> = {
  pending: styles.colorPending,
  running: styles.colorRunning,
  complete: styles.colorComplete,
  error: styles.colorError,
};

function getStatusAnnouncement(
  t: ReturnType<typeof useTranslator>,
  item: ChatActivityItem,
): string {
  const status = surfaceStatus(item);
  if (item.kind === 'tool' && status === 'error' && item.errorMessage != null) {
    return t('@astryx.chatToolCalls.error', {message: item.errorMessage});
  }
  switch (status) {
    case 'pending':
      return t('@astryx.chatToolCalls.status.pending');
    case 'running':
      return t('@astryx.chatToolCalls.status.running');
    case 'complete':
      return t('@astryx.chatToolCalls.status.complete');
    case 'error':
      return t('@astryx.chatToolCalls.status.error');
  }
}

function itemKey(item: ChatActivityItem, index: number): string {
  if (item.key != null) {
    return item.key;
  }
  if (item.kind === 'tool') {
    return `tool-${item.name}-${index}`;
  }
  return `reasoning-${index}`;
}

function renderActivityItem(item: ChatActivityItem) {
  if (item.kind === 'tool') {
    const {kind: _kind, ...call} = item;
    return <ChatToolCalls calls={[call]} xstyle={styles.nestedItem} />;
  }
  return (
    <ChatReasoning
      label={item.label}
      duration={item.duration}
      isStreaming={item.isStreaming}
      xstyle={styles.nestedItem}>
      {item.content}
    </ChatReasoning>
  );
}

/**
 * Folds an ordered mixed sequence of reasoning blocks and tool calls into one
 * scannable collapsed row. Expanding reveals each item with its own disclosure.
 *
 * @example
 * ```
 * <ChatActivityGroup
 *   items={[
 *     {kind: 'reasoning', content: 'Planning the edit'},
 *     {kind: 'tool', name: 'readFile', status: 'complete', target: 'Button.tsx'},
 *     {kind: 'tool', name: 'editFile', status: 'running', target: 'Button.tsx'},
 *   ]}
 * />
 * ```
 */
export function ChatActivityGroup(props: ChatActivityGroupProps) {
  const t = useTranslator();
  const {
    items,
    label: customLabel,
    isExpanded: controlledExpanded,
    defaultIsExpanded = false,
    onExpandedChange,
    xstyle,
    className,
    style,
    ref,
    ...rest
  } = props;

  const [internalExpanded, setInternalExpanded] = useState(defaultIsExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  const [hasExpanded, setHasExpanded] = useState(isExpanded);
  if (isExpanded && !hasExpanded) {
    setHasExpanded(true);
  }
  const contentId = useId();

  const toggle = useCallback(() => {
    const next = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange]);

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return renderActivityItem(items[0]);
  }

  const latest = items[items.length - 1];
  const latestStatus = surfaceStatus(latest);
  const latestAnnouncement = getStatusAnnouncement(t, latest);
  const groupLabel =
    customLabel ??
    t('@astryx.chatActivityGroup.groupLabel', {count: items.length});

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('chat-activity-group'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...rest}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        {...stylex.props(styles.header)}>
        {isExpanded ? (
          <span {...stylex.props(styles.groupLabel)}>{groupLabel}</span>
        ) : (
          <>
            <span
              title={
                latest.kind === 'tool' && latestStatus === 'error'
                  ? latest.errorMessage
                  : undefined
              }
              {...stylex.props(styles.statusIcon, STATUS_STYLES[latestStatus])}>
              {latestStatus === 'running' || latestStatus === 'pending' ? (
                <Spinner size="sm" shade="subtle" aria-hidden="true" />
              ) : (
                <Icon
                  icon={STATUS_ICON_NAMES[latestStatus] ?? 'success'}
                  size="xsm"
                  color="inherit"
                />
              )}
              <VisuallyHidden>{latestAnnouncement}</VisuallyHidden>
            </span>
            <span {...stylex.props(styles.preview)}>
              {previewLabel(latest)}
            </span>
            <span {...stylex.props(styles.callCount)}>{items.length}</span>
          </>
        )}
        <span {...stylex.props(styles.chevron)}>
          <Icon
            icon="chevronDown"
            size="xsm"
            color="inherit"
            xstyle={[
              styles.chevronTransition,
              isExpanded && styles.chevronExpanded,
            ]}
          />
        </span>
      </div>
      <div
        id={contentId}
        inert={!isExpanded}
        {...stylex.props(
          styles.groupContent,
          isExpanded && styles.groupContentExpanded,
        )}>
        <div {...stylex.props(styles.groupContentInner)}>
          {hasExpanded ? (
            <div {...stylex.props(styles.list)}>
              {items.map((item, index) => (
                <div key={itemKey(item, index)}>{renderActivityItem(item)}</div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

ChatActivityGroup.displayName = 'ChatActivityGroup';

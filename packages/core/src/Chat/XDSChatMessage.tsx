'use client';

/**
 * @file XDSChatMessage.tsx
 * @input Uses React, StyleX, XDSChatContext, theme tokens
 * @output Exports XDSChatMessage component and XDSChatMessageProps
 * @position Sender context wrapper — handles avatar, name, alignment by sender role
 *
 * Layout (with avatar):
 *   [Avatar] [Name              ]
 *            [Content/Bubbles   ]
 *            [Metadata          ]
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 */

import {type ReactNode, useMemo, useId} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {
  XDSChatMessageContext,
  useXDSChatListContext,
  type XDSChatMessageSender,
  type XDSChatDensity,
} from './XDSChatContext';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSChatMessageProps {
  ref?: React.Ref<HTMLDivElement>;
  sender: XDSChatMessageSender;
  children: ReactNode;
  avatar?: ReactNode;
  /**
   * Sender name rendered above the message body.
   * Use when the first child is raw content (not a bubble).
   * If the first child is a XDSChatMessageBubble, put the name on the
   * bubble's `name` prop instead — it aligns with the bubble's padding.
   */
  name?: ReactNode;
  /**
   * Metadata rendered below the message body.
   * Use when the last child is raw content (not a bubble).
   * If the last child is a XDSChatMessageBubble, put metadata on the
   * bubble's `metadata` prop instead — it aligns with the bubble's padding.
   */
  metadata?: ReactNode;
  density?: XDSChatDensity;
  xstyle?: StyleXStyles;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  rootGapCompact: {
    gap: spacingVars['--spacing-1-5'],
  },
  rootGapBalanced: {
    gap: spacingVars['--spacing-2'],
  },
  rootGapSpacious: {
    gap: spacingVars['--spacing-3'],
  },
  rootAssistant: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rootUser: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  rootSystem: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  avatarWrap: {
    flexShrink: 0,
    ':has(~ * [data-chat-name])': {
      marginBlockStart: spacingVars['--spacing-5'],
    },
  },
  contentColumn: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    maxWidth: '80%',
  },
  contentColumnSystem: {
    maxWidth: '90%',
    alignItems: 'center',
  },
  contentColumnAssistant: {
    alignItems: 'flex-start',
  },
  contentColumnUser: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  childrenWrap: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  childrenAssistant: {
    alignItems: 'flex-start',
  },
  childrenUser: {
    alignItems: 'flex-end',
  },
  childrenSystem: {
    alignItems: 'center',
  },
  childrenGapCompact: {
    gap: spacingVars['--spacing-0-5'],
  },
  childrenGapBalanced: {
    gap: spacingVars['--spacing-1'],
  },
  childrenGapSpacious: {
    gap: spacingVars['--spacing-1-5'],
  },
});

/**
 * Sender context wrapper for chat messages.
 *
 * Provides sender and density context to child components.
 * Use XDSChatMessageMetadata as a child for timestamp, status, and footer.
 *
 * @example
 * ```
 * <XDSChatMessage sender="assistant" name="Navi" avatar={<XDSAvatar name="Navi" size="small" />}>
 *   <XDSChatMessageBubble>Hello!</XDSChatMessageBubble>
 *   <XDSChatMessageMetadata timestamp="2:30 PM" />
 * </XDSChatMessage>
 * ```
 */
export function XDSChatMessage({
  sender,
  children,
  avatar,
  name,
  metadata,
  density: densityProp,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
}: XDSChatMessageProps) {
  const listContext = useXDSChatListContext();
  const density = densityProp ?? listContext?.density ?? 'balanced';

  const contextValue = useMemo(() => ({sender, density}), [sender, density]);

  const rootGap =
    density === 'compact'
      ? styles.rootGapCompact
      : density === 'spacious'
        ? styles.rootGapSpacious
        : styles.rootGapBalanced;

  const childrenGap =
    density === 'compact'
      ? styles.childrenGapCompact
      : density === 'spacious'
        ? styles.childrenGapSpacious
        : styles.childrenGapBalanced;

  const rootAlignment =
    sender === 'system'
      ? styles.rootSystem
      : sender === 'user'
        ? styles.rootUser
        : styles.rootAssistant;

  const columnAlignment =
    sender === 'system'
      ? styles.contentColumnSystem
      : sender === 'user'
        ? styles.contentColumnUser
        : styles.contentColumnAssistant;

  const childrenAlignment =
    sender === 'system'
      ? styles.childrenSystem
      : sender === 'user'
        ? styles.childrenUser
        : styles.childrenAssistant;

  const isSystem = sender === 'system';
  const hasAvatar = avatar != null && !isSystem;
  const hasName = name != null && !isSystem;
  const nameId = useId();

  return (
    <XDSChatMessageContext.Provider value={contextValue}>
      <article
        ref={ref}
        data-testid={testId}
        aria-label={!hasName ? `Message from ${sender}` : undefined}
        aria-labelledby={hasName ? nameId : undefined}
        {...mergeProps(
          xdsClassName('chat-message', {sender}),
          stylex.props(
            styles.root,
            rootAlignment,
            hasAvatar && rootGap,
            xstyle,
          ),
          className,
          styleProp,
        )}>
        {hasAvatar && <div {...stylex.props(styles.avatarWrap)}>{avatar}</div>}

        <div {...stylex.props(styles.contentColumn, columnAlignment)}>
          {hasName && (
            <div id={nameId} {...stylex.props(styles.name)}>{name}</div>
          )}

          <div
            {...stylex.props(
              styles.childrenWrap,
              childrenAlignment,
              childrenGap,
            )}>
            {children}
          </div>

          {metadata != null && !isSystem && (
            <div>{metadata}</div>
          )}
        </div>
      </article>
    </XDSChatMessageContext.Provider>
  );
}

XDSChatMessage.displayName = 'XDSChatMessage';

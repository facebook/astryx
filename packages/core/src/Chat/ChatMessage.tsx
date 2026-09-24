// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatMessage.tsx
 * @input Uses React, StyleX, ChatContext, theme tokens
 * @output Exports ChatMessage component and ChatMessageProps
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
 * - /apps/storybook/stories/ChatMessage.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ChatMessage/ (block examples)
 */

import {
  createElement,
  Fragment,
  isValidElement,
  type ReactNode,
  useMemo,
  useId,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {
  ChatMessageContext,
  useChatListContext,
  type ChatMessageSender,
  type ChatDensity,
} from './ChatContext';
import {isRenderable, mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

export interface ChatMessageProps extends BaseProps<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  sender: ChatMessageSender;
  /**
   * Message body — bubbles, tool calls, images, or any free-form content.
   * Custom (non-bubble) children render flush with the message edge; wrap
   * them in a ghost bubble (`<ChatMessageBubble variant="ghost">`) to align
   * them with the bubble's text column, and add `width="100%"` when they
   * should span the full message column.
   */
  children: ReactNode;
  /**
   * Avatar content rendered beside a non-system message.
   * Booleans, empty strings, and arrays, Fragments, or synchronous iterables
   * with no renderable descendants do not create a slot. Non-Fragment elements
   * are treated as content; component output is not inspected. Cyclic composite
   * content is rejected.
   */
  avatar?: ReactNode;
  /**
   * Sender name rendered above the message body.
   * Booleans, empty strings, and arrays, Fragments, or synchronous iterables
   * with no renderable descendants use the translated sender fallback label.
   * Non-Fragment elements are treated as content; component output is not
   * inspected. Cyclic composite content is rejected.
   * Use when the first child is raw content (not a bubble).
   * If the first child is a ChatMessageBubble, put the name on the
   * bubble's `name` prop instead — it aligns with the bubble's padding.
   */
  name?: ReactNode;
  /**
   * Metadata rendered below the message body.
   * Booleans, empty strings, and arrays, Fragments, or synchronous iterables
   * with no renderable descendants do not create a slot. Non-Fragment elements
   * are treated as content; component output is not inspected. Cyclic composite
   * content is rejected.
   * Use when the last child is raw content (not a bubble).
   * If the last child is a ChatMessageBubble, put metadata on the
   * bubble's `metadata` prop instead — it aligns with the bubble's padding.
   */
  metadata?: ReactNode;
  density?: ChatDensity;
}

type SlotContentInspection = {
  content: ReactNode;
  hasContent: boolean;
};

const emptySlot: SlotContentInspection = {content: null, hasContent: false};

function getInspectedContent(child: SlotContentInspection): ReactNode {
  return child.content;
}

function inspectSlotContent(
  node: ReactNode,
  ancestors: Set<object> = new Set(),
): SlotContentInspection {
  if (!isRenderable(node)) {
    return {content: node, hasContent: false};
  }

  if (Array.isArray(node)) {
    if (ancestors.has(node)) {
      throw new TypeError('ChatMessage slot content cannot contain a cycle');
    }
    ancestors.add(node);
    try {
      const children = node.map(child => inspectSlotContent(child, ancestors));
      return {
        content: children.map(getInspectedContent),
        hasContent: children.some(child => child.hasContent),
      };
    } finally {
      ancestors.delete(node);
    }
  }

  if (isValidElement<{children?: ReactNode}>(node) && node.type === Fragment) {
    if (ancestors.has(node)) {
      throw new TypeError('ChatMessage slot content cannot contain a cycle');
    }
    ancestors.add(node);
    try {
      const children = inspectSlotContent(node.props.children, ancestors);
      return {
        content: createElement(Fragment, {key: node.key}, children.content),
        hasContent: children.hasContent,
      };
    } finally {
      ancestors.delete(node);
    }
  }

  if (typeof node === 'object' && node !== null) {
    const iterator = (node as Iterable<ReactNode>)[Symbol.iterator];
    if (typeof iterator === 'function') {
      if (ancestors.has(node)) {
        throw new TypeError('ChatMessage slot content cannot contain a cycle');
      }
      ancestors.add(node);
      try {
        const children: SlotContentInspection[] = [];
        for (const child of node as Iterable<ReactNode>) {
          children.push(inspectSlotContent(child, ancestors));
        }
        return {
          // Materialize iterables so one-shot iterators are not consumed before
          // React renders the slot.
          content: children.map(getInspectedContent),
          hasContent: children.some(child => child.hasContent),
        };
      } finally {
        ancestors.delete(node);
      }
    }
  }

  // Non-Fragment elements are content. Component output cannot be inspected
  // without executing caller code.
  return {content: node, hasContent: true};
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
    flex: 1,
    minWidth: 0,
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
    minWidth: 0,
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
 * Use ChatMessageMetadata as a child for timestamp, status, and footer.
 *
 * @example
 * ```
 * <ChatMessage sender="assistant" name="Navi" avatar={<Avatar name="Navi" size="md" />}>
 *   <ChatMessageBubble>Hello!</ChatMessageBubble>
 *   <ChatMessageMetadata timestamp="2:30 PM" />
 * </ChatMessage>
 * ```
 */
export function ChatMessage({
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
  ...rest
}: ChatMessageProps) {
  const t = useTranslator();
  const listContext = useChatListContext();
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
  const avatarSlot = isSystem ? emptySlot : inspectSlotContent(avatar);
  const nameSlot = isSystem ? emptySlot : inspectSlotContent(name);
  const metadataSlot = isSystem ? emptySlot : inspectSlotContent(metadata);
  const nameId = useId();

  return (
    <ChatMessageContext value={contextValue}>
      <article
        {...rest}
        ref={ref}
        data-testid={testId}
        aria-label={
          !nameSlot.hasContent
            ? t('@astryx.chatMessage.messageFrom', {sender})
            : undefined
        }
        aria-labelledby={nameSlot.hasContent ? nameId : undefined}
        {...mergeProps(
          themeProps('chat-message', {sender, density}),
          stylex.props(
            styles.root,
            rootAlignment,
            avatarSlot.hasContent && rootGap,
            xstyle,
          ),
          className,
          styleProp,
        )}>
        {avatarSlot.hasContent && (
          <div {...stylex.props(styles.avatarWrap)}>{avatarSlot.content}</div>
        )}

        <div {...stylex.props(styles.contentColumn, columnAlignment)}>
          {nameSlot.hasContent && (
            <div id={nameId} {...stylex.props(styles.name)}>
              {nameSlot.content}
            </div>
          )}

          <div
            {...stylex.props(
              styles.childrenWrap,
              childrenAlignment,
              childrenGap,
            )}>
            {children}
          </div>

          {metadataSlot.hasContent && <div>{metadataSlot.content}</div>}
        </div>
      </article>
    </ChatMessageContext>
  );
}

ChatMessage.displayName = 'ChatMessage';

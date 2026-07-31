// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input None
 * @output ChatLayout Playground — a tool to eyeball ChatLayout across its
 *   states (empty, short, long, streaming) inside a fixed-height host so the
 *   scroll/dock behavior is observable. Mirrors the composition used in
 *   apps/storybook/stories/ChatLayout.stories.tsx.
 * @position Sandbox tool page (/pages/chat-playground)
 *
 * The primary purpose is manual validation of ChatLayout — e.g. confirming the
 * flex-column root fix (#4202) so short content does not produce a phantom
 * vertical scrollbar, and that the dock stays pinned to the scrollport bottom.
 */

import {useCallback, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {VStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Markdown} from '@astryxdesign/core/Markdown';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {
  ChatLayout,
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
  ChatSystemMessage,
  ChatComposer,
  ChatComposerInput,
} from '@astryxdesign/core/Chat';

// =============================================================================
// State registry — the single place that describes the toggleable states.
// =============================================================================

type PlaygroundState = 'empty' | 'short' | 'long' | 'streaming';

interface StateMeta {
  id: PlaygroundState;
  label: string;
  description: string;
}

const STATES: StateMeta[] = [
  {
    id: 'empty',
    label: 'Empty',
    description:
      'No messages — validates the empty ChatLayout (no phantom scrollbar).',
  },
  {
    id: 'short',
    label: 'Short',
    description:
      'A couple of messages — the #4202 case: short content must not add phantom scroll height; the dock sits at the bottom.',
  },
  {
    id: 'long',
    label: 'Long',
    description:
      'Many messages — overflows and self-scrolls; the dock stays pinned to the scrollport bottom.',
  },
  {
    id: 'streaming',
    label: 'Streaming',
    description:
      'A message streams in progressively — exercises the streaming / auto-scroll state.',
  },
];

// =============================================================================
// Data
// =============================================================================

type Message =
  | {id: number; role: 'system'; text: string}
  | {id: number; role: 'user'; text: string; sentAt?: string}
  | {id: number; role: 'assistant'; text: string; isStreaming?: boolean};

const SHORT_MESSAGES: Message[] = [
  {id: 1, role: 'system', text: 'Today'},
  {
    id: 2,
    role: 'user',
    text: 'Does the empty ChatLayout show a phantom scrollbar?',
    sentAt: '2026-03-15T14:30:00',
  },
  {
    id: 3,
    role: 'assistant',
    text: 'No — with the flex-column root fix, short content no longer adds phantom scroll height and the dock stays pinned to the bottom.',
  },
];

const USER_LINES = [
  'How do I compose a ChatLayout?',
  'Where does the composer dock live?',
  'Does the message list scroll on its own?',
  'What happens when content is shorter than the viewport?',
  'How is auto-scroll handled while streaming?',
];

const ASSISTANT_LINES = [
  'Wrap `ChatMessageList` in `ChatLayout` and pass `ChatComposer` to the `composer` prop.',
  'The composer is fixed to the bottom of the layout with a frosted-glass dock.',
  'Yes — the layout root is the scroll container, so the message list self-scrolls.',
  'Short content stays anchored at the top and the dock sits at the bottom, with no phantom scrollbar.',
  'While streaming, the layout keeps the newest content in view as text arrives.',
];

const LONG_MESSAGES: Message[] = (() => {
  const out: Message[] = [{id: 1, role: 'system', text: 'Today'}];
  let id = 2;
  for (let i = 0; i < 30; i++) {
    out.push({
      id: id++,
      role: 'user',
      text: USER_LINES[i % USER_LINES.length],
      sentAt: '2026-03-15T14:30:00',
    });
    out.push({
      id: id++,
      role: 'assistant',
      text: ASSISTANT_LINES[i % ASSISTANT_LINES.length],
    });
  }
  return out;
})();

const STREAM_TEXT =
  'While streaming, the layout keeps the newest content in view as tokens arrive. ' +
  'This lets you eyeball the auto-scroll behavior: the dock stays pinned to the bottom ' +
  'and the message list follows along as the assistant response grows word by word.';

// =============================================================================
// Page
// =============================================================================

export default function ChatPlaygroundPage() {
  const [state, setState] = useState<PlaygroundState>('short');

  const [streamMessages, setStreamMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const stopStream = useCallback(() => {
    clearInterval(streamRef.current);
    setIsStreaming(false);
  }, []);

  const runStream = useCallback(() => {
    clearInterval(streamRef.current);
    const assistantId = 3;
    setStreamMessages([
      {id: 1, role: 'system', text: 'Today'},
      {
        id: 2,
        role: 'user',
        text: 'Show me the streaming state.',
        sentAt: '2026-03-15T14:30:00',
      },
      {id: assistantId, role: 'assistant', text: '', isStreaming: true},
    ]);
    setIsStreaming(true);

    let i = 0;
    streamRef.current = setInterval(() => {
      i += 2 + Math.floor(Math.random() * 4);
      if (i >= STREAM_TEXT.length) {
        clearInterval(streamRef.current);
        setStreamMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? {...m, text: STREAM_TEXT, isStreaming: false}
              : m,
          ),
        );
        setIsStreaming(false);
        return;
      }
      setStreamMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? {...m, text: STREAM_TEXT.slice(0, i)} : m,
        ),
      );
    }, 40);
  }, []);

  const handleStateChange = useCallback(
    (next: PlaygroundState) => {
      stopStream();
      setState(next);
      if (next === 'streaming') {
        runStream();
      }
    },
    [runStream, stopStream],
  );

  const activeMeta = STATES.find(s => s.id === state) ?? STATES[0];

  const messages: Message[] =
    state === 'empty'
      ? []
      : state === 'short'
        ? SHORT_MESSAGES
        : state === 'long'
          ? LONG_MESSAGES
          : streamMessages;

  const composerEl = (
    <ChatComposer
      onSubmit={() => {}}
      onStop={stopStream}
      isStopShown={isStreaming}
      input={<ChatComposerInput placeholder="Ask something…" />}
    />
  );

  return (
    <VStack gap={6} {...stylex.props(styles.root)}>
      <VStack gap={2}>
        <Heading level={1}>ChatLayout Playground</Heading>
        <Text type="body" color="secondary">
          Toggle between ChatLayout states to eyeball scroll and dock behavior
          inside a fixed-height host. Mirrors the composition in the Storybook
          ChatLayout example.
        </Text>
      </VStack>

      <VStack gap={3}>
        <SegmentedControl
          label="ChatLayout state"
          value={state}
          onChange={value => handleStateChange(value as PlaygroundState)}>
          {STATES.map(s => (
            <SegmentedControlItem key={s.id} value={s.id} label={s.label} />
          ))}
        </SegmentedControl>
        <Text type="supporting" color="secondary">
          {activeMeta.description}
        </Text>
      </VStack>

      <div {...stylex.props(styles.host)}>
        <ChatLayout
          composer={composerEl}
          emptyState={
            <EmptyState
              title="No messages yet"
              description="Start a conversation by typing below."
            />
          }>
          {messages.length > 0 ? (
            <ChatMessageList>
              {messages.map(msg => {
                if (msg.role === 'system') {
                  return (
                    <ChatSystemMessage key={msg.id} variant="divider">
                      {msg.text}
                    </ChatSystemMessage>
                  );
                }
                if (msg.role === 'user') {
                  return (
                    <ChatMessage key={msg.id} sender="user">
                      <ChatMessageBubble
                        metadata={
                          msg.sentAt ? (
                            <ChatMessageMetadata
                              timestamp={
                                <Timestamp value={msg.sentAt} format="time" />
                              }
                            />
                          ) : undefined
                        }>
                        {msg.text}
                      </ChatMessageBubble>
                    </ChatMessage>
                  );
                }
                return (
                  <ChatMessage key={msg.id} sender="assistant">
                    {msg.text && (
                      <Markdown density="compact">{msg.text}</Markdown>
                    )}
                  </ChatMessage>
                );
              })}
            </ChatMessageList>
          ) : (
            []
          )}
        </ChatLayout>
      </div>
    </VStack>
  );
}

const styles = stylex.create({
  root: {
    padding: 24,
    maxWidth: 900,
    marginInline: 'auto',
    width: '100%',
  },
  host: {
    height: 600,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
});

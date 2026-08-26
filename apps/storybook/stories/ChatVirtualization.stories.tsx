// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Demonstrates windowed (virtualized) rendering inside the Chat family:
 * ChatLayout keeps the scroller, ChatMessageList keeps the semantics
 * (role="log", aria-busy), and the experimental lab ChatVirtualizer renders
 * only the rows near the viewport between two document-flow spacers.
 *
 * Related: facebook/astryx#4102 (virtualized chat survey),
 * facebook/astryx#2282 (auto-scroll ownership), facebook/astryx#3942
 * (anchoring policy).
 *
 * Why: an unvirtualized transcript degrades with history length, and the
 * cost center is UPDATES, not passive scrolling (scrolling a static list is
 * compositor-cheap either way): streaming a reply re-renders every mounted
 * row, and with 3000 messages mounted the baseline story measures ~8fps for
 * the duration of the stream (144Hz machine), while the windowed list holds
 * the machine's full frame rate with a couple dozen rows in the DOM. Send a
 * message here, then send one in the "Unvirtualized Baseline" story at the
 * same messageCount to feel the difference; the status pill shows mounted
 * rows and a live fps counter in both.
 *
 * The virtualizer owns follow-at-end (scroll up during a stream to
 * disengage; the scroll button re-engages declaratively) and read-position
 * stability (rows above the viewport re-measuring must not move the text
 * being read).
 */

import type {Meta, StoryObj} from '@storybook/react';
import {
  ChatLayout,
  ChatLayoutScrollButton,
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatComposer,
  useChatLayoutContext,
} from '@astryxdesign/core/Chat';
import {ChatVirtualizer, type ChatVirtualizerHandle} from '@astryxdesign/lab';
import {Markdown} from '@astryxdesign/core/Markdown';
import {Badge} from '@astryxdesign/core/Badge';
import {Text} from '@astryxdesign/core/Text';
import {useCallback, useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';

const meta: Meta = {
  title: 'Lab/ChatVirtualization',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // "Show code" must render the story SOURCE, not the dynamic snippet:
    // the dynamic mode serializes the rendered element tree, and at
    // messageCount=3000 that walk freezes the docs panel.
    docs: {source: {type: 'code'}},
  },
};
export default meta;

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    // dvh, not vh: on mobile Safari 100vh is taller than the visible
    // viewport, so the page itself scrolls and rubber-bands under the list.
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  controls: {
    display: 'flex',
    gap: 8,
    padding: 12,
    borderBottom: '1px solid #e5e5e5',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  statusPill: {
    marginInlineStart: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  // Row spacing must live INSIDE the rows: the virtualizer measures
  // offsetHeight, which cannot see flex gap or margins, so the list shell
  // runs with gap=0 and every row carries its own padding.
  rowPad: {
    paddingBottom: 12,
  },
});

// =============================================================================
// Deterministic transcript corpus — mixed row shapes so per-type size
// estimation has real work to do (short prompts, long markdown, code fences).
// =============================================================================

const REPLY_SENTENCES = [
  'The scroll system keeps the desired position as a distance from the bottom edge, so tail growth is an identity operation. ',
  'Rows above the viewport swapping their estimated size for a measured one must not move the text being read. ',
  'Each streamed chunk grows the last row, and the geometry catches up in the same pre-paint pass. ',
  'When a code fence closes, the block re-parses and its height jumps by several lines at once. ',
];

const CODE_FENCE = [
  '```tsx',
  'const dist = el.scrollHeight - el.clientHeight - el.scrollTop;',
  'if (dist <= endThreshold) engageFollow();',
  '```',
].join('\n');

type DemoMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

function makeCorpus(count: number): DemoMessage[] {
  const out: DemoMessage[] = [];
  for (let i = 0; i < count; i++) {
    const isUser = i % 2 === 0;
    if (isUser) {
      out.push({
        id: `m-${i}`,
        role: 'user',
        text: `Question ${i / 2 + 1}: how does follow-at-end interact with row ${i} re-measuring?`,
      });
    } else {
      const sentences = 1 + (i % 4);
      let text = '';
      for (let s = 0; s < sentences; s++) {
        text += REPLY_SENTENCES[(i + s) % REPLY_SENTENCES.length];
      }
      if (i % 7 === 1) {
        text += `\n\n${CODE_FENCE}\n`;
      }
      out.push({id: `m-${i}`, role: 'assistant', text});
    }
  }
  return out;
}

const STREAM_REPLY = `Here is what happens when this reply streams in while you read:

1. **Following**: the list keeps the bottom pinned as the text grows — each chunk is absorbed pre-paint, so there is no tail flicker.
2. **Disengaging**: scroll up (wheel or trackpad) and the list anchors the row you are reading; the stream keeps growing below without moving your text.
3. **Re-engaging**: scroll back to the bottom, or press the scroll button — a declarative jump that converges even while the content is still growing.

${CODE_FENCE}

The window stays a few dozen rows regardless of transcript length, which is the whole point: the same interaction quality at 100 messages and at 3000.`;

// =============================================================================
// Status pill: mounted-DOM-rows + a live fps counter. The fps number is the
// story's evidence — without it, a reviewer cannot tell 60fps-with-40-rows
// from 4fps-with-3000-rows without opening the profiler.
// =============================================================================

function useFps(): number {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return fps;
}

function StatusPill({
  total,
  virtualized,
  isStreaming,
}: {
  total: number;
  virtualized: boolean;
  isStreaming: boolean;
}) {
  const fps = useFps();
  const [mounted, setMounted] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setMounted(
        virtualized ? document.querySelectorAll('[data-pkey]').length : total,
      );
    }, 500);
    return () => clearInterval(id);
  }, [virtualized, total]);
  return (
    <div {...stylex.props(styles.statusPill)}>
      <Text type="supporting" color="secondary">
        DOM rows: {mounted} / {total}
      </Text>
      <Text type="supporting" color="secondary">
        {fps} fps
      </Text>
      <Badge
        variant={isStreaming ? 'green' : 'neutral'}
        label={isStreaming ? 'Streaming' : 'Idle'}
      />
    </div>
  );
}

// =============================================================================
// Virtualized message area. The layout formula: ChatLayout owns the
// scroller, ChatMessageList keeps its shell semantics with gap=0, and the
// virtualizer attaches to the layout's scroll element from context.
// =============================================================================

function VirtualizedMessages({
  messages,
  isStreaming,
  apiRef,
  scrollElRef,
  endThreshold,
}: {
  messages: DemoMessage[];
  isStreaming: boolean;
  apiRef: React.RefObject<ChatVirtualizerHandle | null>;
  scrollElRef: React.RefObject<HTMLElement | null>;
  endThreshold: number;
}) {
  const ctx = useChatLayoutContext();
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  // The layout's ref is populated during commit, after this child's effects,
  // so read it on a passive effect and keep it in state (null keeps the
  // virtualizer in attach-pending mode — it must never fall back to its own
  // container inside a parent that doesn't bound its height).
  useEffect(() => {
    const el = ctx?.scrollContainerRef?.current ?? null;
    setScrollEl(el);
    scrollElRef.current = el;
  }, [ctx, scrollElRef]);
  return (
    <ChatMessageList gap={0} isStreaming={isStreaming}>
      <ChatVirtualizer<DemoMessage>
        scrollElement={scrollEl}
        apiRef={apiRef}
        data={messages}
        keyExtractor={m => m.id}
        getItemType={m => m.role}
        estimatedItemSize={120}
        endThreshold={endThreshold}
        renderItem={({item}) => (
          <div {...stylex.props(styles.rowPad)}>
            <ChatMessage sender={item.role}>
              {item.role === 'user' ? (
                <ChatMessageBubble>
                  <Markdown density="compact">{item.text}</Markdown>
                </ChatMessageBubble>
              ) : (
                <Markdown density="compact">{item.text}</Markdown>
              )}
            </ChatMessage>
          </div>
        )}
      />
    </ChatMessageList>
  );
}

// The layout's own scroll button springs to the scrollHeight captured at
// click time — but traversing a virtualized list replaces estimates with
// measurements, so the bottom moves mid-flight and a DOM-space spring lands
// short. The layout's documented `scrollButton` override exists for exactly
// this: the same visual button, wired to the virtualizer's declarative jump,
// which computes the window from the desired bottom and converges regardless
// of estimate drift.
function VirtScrollButton({
  apiRef,
  getScrollEl,
}: {
  apiRef: React.RefObject<ChatVirtualizerHandle | null>;
  getScrollEl: () => HTMLElement | null;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = getScrollEl();
    if (!el) {
      return;
    }
    const onScroll = () =>
      setVisible(el.scrollHeight - el.clientHeight - el.scrollTop > 100);
    el.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  });
  return (
    <ChatLayoutScrollButton
      isVisible={visible}
      onClick={() => apiRef.current?.scrollToDistanceFromBottomPx(0)}
    />
  );
}

// =============================================================================
// Shared demo shell: corpus + composer + streamed reply. The two stories are
// the two arms — same machinery, virtualization fixed per story so the
// comparison is a story switch, not a control that turns the subject off.
// =============================================================================

const STREAM_SPEEDS = {
  relaxed: {intervalMs: 50, minChunk: 1, maxChunk: 3},
  default: {intervalMs: 25, minChunk: 2, maxChunk: 6},
  fast: {intervalMs: 10, minChunk: 6, maxChunk: 14},
} as const;

type StreamSpeed = keyof typeof STREAM_SPEEDS;

function TranscriptDemo({
  virtualized,
  messageCount,
  streamSpeed,
  endThreshold = 24,
  startAtTop = false,
}: {
  virtualized: boolean;
  messageCount: number;
  streamSpeed: StreamSpeed;
  endThreshold?: number;
  startAtTop?: boolean;
}) {
  const [messages, setMessages] = useState<DemoMessage[]>(() =>
    makeCorpus(messageCount),
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const virtApiRef = useRef<ChatVirtualizerHandle | null>(null);
  const scrollElRef = useRef<HTMLElement | null>(null);

  // Rebuild the corpus when the control changes.
  const countRef = useRef(messageCount);
  useEffect(() => {
    if (countRef.current !== messageCount) {
      countRef.current = messageCount;
      clearInterval(streamRef.current);
      setIsStreaming(false);
      setMessages(makeCorpus(messageCount));
    }
  }, [messageCount]);
  useEffect(() => () => clearInterval(streamRef.current), []);

  // startAtTop demos the OTHER half of the imperative API: anchorToKey pins
  // the first row to the viewport top (log-reading mode — the stream grows
  // below without moving the viewport; the scroll button re-engages follow).
  // Declaring before the scroller attaches is fine: the declaration is a
  // mode, not a scroll action, and it lands on the attach commit. Flipping
  // the control live jumps between the two declarations.
  const firstIdRef = useRef<string | null>(null);
  firstIdRef.current = messages[0]?.id ?? null;
  const startAtTopSeen = useRef(false);
  useEffect(() => {
    if (!virtualized) {
      return;
    }
    if (startAtTop) {
      if (firstIdRef.current !== null) {
        virtApiRef.current?.anchorToKey(firstIdRef.current);
      }
      startAtTopSeen.current = true;
    } else if (startAtTopSeen.current) {
      virtApiRef.current?.scrollToDistanceFromBottomPx(0);
    }
  }, [startAtTop, virtualized]);

  const speed = STREAM_SPEEDS[streamSpeed];
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const handleSubmit = useCallback((value: string) => {
    const base = Date.now();
    const userId = `u-${base}`;
    const replyId = `a-${base}`;
    setMessages(prev => [
      ...prev,
      {
        id: userId,
        role: 'user',
        text: value || 'Show me the streaming follow behavior.',
      },
      {id: replyId, role: 'assistant', text: ''},
    ]);
    setIsStreaming(true);
    let charIdx = 0;
    const {intervalMs, minChunk, maxChunk} = speedRef.current;
    streamRef.current = setInterval(() => {
      charIdx +=
        minChunk + Math.floor(Math.random() * (maxChunk - minChunk + 1));
      const done = charIdx >= STREAM_REPLY.length;
      const text = done ? STREAM_REPLY : STREAM_REPLY.slice(0, charIdx);
      setMessages(prev => prev.map(m => (m.id === replyId ? {...m, text} : m)));
      if (done) {
        clearInterval(streamRef.current);
        setIsStreaming(false);
      }
    }, intervalMs);
  }, []);

  return (
    <div {...stylex.props(styles.wrapper)}>
      <div {...stylex.props(styles.controls)}>
        <Text type="supporting" color="secondary">
          {virtualized
            ? 'Send a message, then scroll up mid-stream and back down — ' +
              'compare with the "Unvirtualized Baseline" story.'
            : 'Same corpus and stream, no virtualization — send a message ' +
              'at 3000 rows and watch the fps counter.'}
        </Text>
        <StatusPill
          total={messages.length}
          virtualized={virtualized}
          isStreaming={isStreaming}
        />
      </div>
      <ChatLayout
        {...(virtualized
          ? {
              scrollButton: (
                <VirtScrollButton
                  apiRef={virtApiRef}
                  getScrollEl={() => scrollElRef.current}
                />
              ),
            }
          : {})}
        composer={
          <ChatComposer
            onSubmit={handleSubmit}
            placeholder="Send a message to stream a reply…"
            isStopShown={isStreaming}
          />
        }>
        {virtualized ? (
          <VirtualizedMessages
            messages={messages}
            isStreaming={isStreaming}
            apiRef={virtApiRef}
            scrollElRef={scrollElRef}
            endThreshold={endThreshold}
          />
        ) : (
          <ChatMessageList isStreaming={isStreaming}>
            {messages.map(msg => (
              <ChatMessage key={msg.id} sender={msg.role}>
                {msg.role === 'user' ? (
                  <ChatMessageBubble>
                    <Markdown density="compact">{msg.text}</Markdown>
                  </ChatMessageBubble>
                ) : (
                  <Markdown density="compact">{msg.text}</Markdown>
                )}
              </ChatMessage>
            ))}
          </ChatMessageList>
        )}
      </ChatLayout>
    </div>
  );
}

// =============================================================================
// Stories
// =============================================================================

const sharedArgTypes = {
  messageCount: {
    control: {type: 'select' as const},
    options: [100, 1000, 3000],
  },
  streamSpeed: {
    control: {type: 'select' as const},
    options: ['relaxed', 'default', 'fast'],
    description:
      'Chunk cadence of the streamed reply. `fast` stresses the ' +
      'follow machinery: disengage mid-stream, scroll back, re-engage.',
  },
};

type VirtualizedArgs = {
  messageCount: number;
  endThreshold: number;
  streamSpeed: StreamSpeed;
  startAtTop: boolean;
};

export const ThousandsOfMessages: StoryObj<VirtualizedArgs> = {
  name: 'Thousands of Messages',
  args: {
    messageCount: 3000,
    endThreshold: 24,
    streamSpeed: 'default',
    startAtTop: false,
  },
  argTypes: {
    ...sharedArgTypes,
    endThreshold: {
      control: {type: 'select'},
      options: [1, 24, 96],
      description:
        'How close to the bottom (px) a scroll must land to re-engage ' +
        'follow. At 1 (TanStack Virtual\'s default), stopping "visually at ' +
        'the bottom" — trackpad inertia, fractional row heights — often ' +
        'leaves follow silently disengaged while a stream grows below; 24 ' +
        "is a production chat transcript's value.",
    },
    startAtTop: {
      control: 'boolean',
      description:
        'Open the transcript at its first row via the anchorToKey handle ' +
        '(log-reading mode): streamed content grows below without moving ' +
        'the viewport, and the scroll button re-engages follow. Flipping ' +
        'this live jumps between the two declarations.',
    },
  },
  render: args => (
    <TranscriptDemo
      virtualized
      messageCount={args.messageCount}
      streamSpeed={args.streamSpeed}
      endThreshold={args.endThreshold}
      startAtTop={args.startAtTop}
    />
  ),
};

type BaselineArgs = {
  messageCount: number;
  streamSpeed: StreamSpeed;
};

export const UnvirtualizedBaseline: StoryObj<BaselineArgs> = {
  name: 'Unvirtualized Baseline',
  args: {
    messageCount: 3000,
    streamSpeed: 'default',
  },
  argTypes: sharedArgTypes,
  render: args => (
    <TranscriptDemo
      virtualized={false}
      messageCount={args.messageCount}
      streamSpeed={args.streamSpeed}
    />
  ),
};

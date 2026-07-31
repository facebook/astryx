// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {ChatMessageList} from './ChatMessageList';
import {ChatMessage} from './ChatMessage';
import {ChatMessageBubble} from './ChatMessageBubble';
import {ChatLayoutContext} from './ChatContext';

describe('ChatMessageList', () => {
  it('renders children', () => {
    render(
      <ChatMessageList>
        <ChatMessage sender="assistant">
          <ChatMessageBubble>Hello</ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>,
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders with role="log"', () => {
    render(
      <ChatMessageList data-testid="list">
        <div>msg</div>
      </ChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.getAttribute('role')).toBe('log');
  });

  it('is not aria-busy by default', () => {
    render(
      <ChatMessageList data-testid="list">
        <div>msg</div>
      </ChatMessageList>,
    );
    expect(screen.getByTestId('list')).not.toHaveAttribute('aria-busy');
  });

  it('marks the log aria-busy while streaming', () => {
    render(
      <ChatMessageList data-testid="list" isStreaming>
        <div>msg</div>
      </ChatMessageList>,
    );
    expect(screen.getByTestId('list')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders empty state when no children', () => {
    render(
      <ChatMessageList emptyState={<div>No messages yet</div>}>
        {[]}
      </ChatMessageList>,
    );
    expect(screen.getByText('No messages yet')).toBeTruthy();
  });

  it('applies density class', () => {
    render(
      <ChatMessageList density="compact" data-testid="list">
        <div>msg</div>
      </ChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.className).toContain('compact');
  });

  it('accepts gap independently from density', () => {
    render(
      <ChatMessageList density="compact" gap={6} data-testid="list">
        <div>msg</div>
      </ChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.className).toContain('compact');
  });

  it('applies data-testid', () => {
    render(
      <ChatMessageList data-testid="chat-list">
        <div>msg</div>
      </ChatMessageList>,
    );
    expect(screen.getByTestId('chat-list')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// scrollToTopAction — load-earlier behavior
//
// jsdom has no layout engine, so IntersectionObserver is stubbed and element
// geometry (getBoundingClientRect) is faked per element. Only the synchronous
// contract is asserted here — observer wiring, pending guard, and the
// scroll-position compensation math. Real scrolling is verified via the
// Storybook load-earlier story (see useChatStreamScroll.test.tsx rationale).
// ---------------------------------------------------------------------------

let ioInstances: FakeIntersectionObserver[] = [];

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  observed = new Set<Element>();

  constructor(
    cb: IntersectionObserverCallback,
    opts?: IntersectionObserverInit,
  ) {
    this.callback = cb;
    this.options = opts;
    ioInstances.push(this);
  }

  observe(el: Element) {
    this.observed.add(el);
  }

  unobserve(el: Element) {
    this.observed.delete(el);
  }

  disconnect() {
    this.observed.clear();
  }
}

/**
 * Fire an intersection notification on every live observer. Multiple
 * states model coalesced delivery — entries arrive oldest-first.
 */
function fireIntersect(...states: boolean[]) {
  const entries = (states.length > 0 ? states : [true]).map(
    isIntersecting => ({isIntersecting}) as IntersectionObserverEntry,
  );
  act(() => {
    for (const io of ioInstances) {
      if (io.observed.size > 0) {
        io.callback(entries, io as unknown as IntersectionObserver);
      }
    }
  });
}

/** Stub an element's rect with a live top value read from a getter. */
function stubRect(el: Element, getTop: () => number) {
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      ({
        top: getTop(),
        bottom: getTop(),
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: getTop(),
        toJSON: () => ({}),
      }) as DOMRect,
  });
}

function makeScrollContainer(): HTMLElement {
  const container = document.createElement('div');
  stubRect(container, () => 0);
  container.scrollTop = 0;
  return container;
}

function layoutCtx(container: HTMLElement) {
  return {
    scrollContainerRef: {current: container},
    contentRef: () => {},
  };
}

describe('ChatMessageList — scrollToTopAction', () => {
  beforeEach(() => {
    ioInstances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not observe anything without scrollToTopAction', () => {
    render(
      <ChatMessageList>
        <div>msg</div>
      </ChatMessageList>,
    );
    expect(ioInstances.filter(io => io.observed.size > 0)).toHaveLength(0);
  });

  it('fires the action when the top sentinel becomes visible', async () => {
    const action = vi.fn(async () => {});
    render(
      <ChatMessageList scrollToTopAction={action}>
        <div>msg</div>
      </ChatMessageList>,
    );
    fireIntersect();
    await act(async () => {});
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner while the action is pending', async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );
    render(
      <ChatMessageList scrollToTopAction={action}>
        <div>msg</div>
      </ChatMessageList>,
    );
    expect(screen.queryByRole('status')).toBeNull();

    fireIntersect();
    await act(async () => {});
    expect(screen.getByRole('status')).toBeTruthy();

    await act(async () => resolveAction());
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('invokes the action once while a load is already pending', async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );
    render(
      <ChatMessageList scrollToTopAction={action}>
        <div>msg</div>
      </ChatMessageList>,
    );

    fireIntersect();
    fireIntersect(false);
    fireIntersect();
    await act(async () => {});
    expect(action).toHaveBeenCalledTimes(1);

    await act(async () => resolveAction());
  });

  it('re-arms after a completed load', async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );
    render(
      <ChatMessageList scrollToTopAction={action}>
        <div>msg</div>
      </ChatMessageList>,
    );

    fireIntersect();
    await act(async () => resolveAction());

    fireIntersect(false);
    fireIntersect();
    await act(async () => resolveAction());
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('keeps the same observer when the action prop identity changes', () => {
    const {rerender} = render(
      <ChatMessageList scrollToTopAction={async () => {}}>
        <div>msg</div>
      </ChatMessageList>,
    );
    const connectedBefore = ioInstances.length;

    rerender(
      <ChatMessageList scrollToTopAction={async () => {}}>
        <div>msg</div>
      </ChatMessageList>,
    );
    expect(ioInstances.length).toBe(connectedBefore);
  });

  it("preserves the reader's viewport position when earlier messages prepend", async () => {
    const container = makeScrollContainer();
    container.scrollTop = 37;
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );

    const ui = (messages: string[]) => (
      <ChatLayoutContext value={layoutCtx(container)}>
        <ChatMessageList scrollToTopAction={action}>
          {messages.map(m => (
            <div key={m}>{m}</div>
          ))}
        </ChatMessageList>
      </ChatLayoutContext>
    );

    const view = render(ui(['oldest-visible']));

    // The reader is parked near the top, looking at the oldest loaded message.
    const anchor = screen.getByText('oldest-visible');
    let anchorTop = 100;
    stubRect(anchor, () => anchorTop);

    fireIntersect();
    await act(async () => {});

    // The consumer prepends a page of earlier history; the anchor message
    // is pushed 400px further down the document.
    view.rerender(ui(['earlier-1', 'earlier-2', 'oldest-visible']));
    anchorTop = 500;

    await act(async () => resolveAction());

    // Compensation keeps the anchor where the reader left it — relative to
    // where the scroll already was, not an absolute reposition.
    expect(container.scrollTop).toBe(437);
  });

  it('marks the log aria-busy while loading earlier messages', async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );
    render(
      <ChatMessageList scrollToTopAction={action} data-testid="list">
        <div>msg</div>
      </ChatMessageList>,
    );
    expect(screen.getByTestId('list')).not.toHaveAttribute('aria-busy');

    fireIntersect();
    await act(async () => {});
    // Prepended history must not be read out as new log entries.
    expect(screen.getByTestId('list')).toHaveAttribute('aria-busy', 'true');

    await act(async () => resolveAction());
    expect(screen.getByTestId('list')).not.toHaveAttribute('aria-busy');
  });

  it('leaves the scroll alone when the reader moved during the load', async () => {
    const container = makeScrollContainer();
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );

    const ui = (messages: string[]) => (
      <ChatLayoutContext value={layoutCtx(container)}>
        <ChatMessageList scrollToTopAction={action}>
          {messages.map(m => (
            <div key={m}>{m}</div>
          ))}
        </ChatMessageList>
      </ChatLayoutContext>
    );

    const view = render(ui(['oldest-visible']));
    const anchor = screen.getByText('oldest-visible');
    let anchorTop = 100;
    stubRect(anchor, () => anchorTop);

    fireIntersect();
    await act(async () => {});

    // The reader scrolls away from the top while the page is loading —
    // native scroll anchoring (active once scrollTop > 0) now owns their
    // stability across the prepend.
    container.scrollTop = 300;
    view.rerender(ui(['earlier-1', 'earlier-2', 'oldest-visible']));
    anchorTop = 500;

    await act(async () => resolveAction());

    // Compensating on top of native anchoring would yank the reader back.
    expect(container.scrollTop).toBe(300);
  });

  it('compensates even when the prepend commits after the action resolves', async () => {
    const container = makeScrollContainer();
    const action = vi.fn(async () => {});

    const ui = (messages: string[]) => (
      <ChatLayoutContext value={layoutCtx(container)}>
        <ChatMessageList scrollToTopAction={action}>
          {messages.map(m => (
            <div key={m}>{m}</div>
          ))}
        </ChatMessageList>
      </ChatLayoutContext>
    );

    const view = render(ui(['oldest-visible']));
    const anchor = screen.getByText('oldest-visible');
    let anchorTop = 100;
    stubRect(anchor, () => anchorTop);

    fireIntersect();
    // The action resolves immediately — before the consumer's store has
    // notified subscribers (React Query / SWR pattern).
    await act(async () => {});
    expect(container.scrollTop).toBe(0);

    // The prepend lands in a later commit of its own — the anchor's rect
    // moves in that same commit, so the stub moves first.
    anchorTop = 500;
    view.rerender(ui(['earlier-1', 'earlier-2', 'oldest-visible']));
    await act(async () => {});

    expect(container.scrollTop).toBe(400);
  });

  it('keeps loading pages while the list has no room to scroll', async () => {
    const container = makeScrollContainer();
    // An underfilled list cannot scroll: every write clamps back to 0.
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      get: () => 0,
      set: () => {},
    });
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );

    const ui = (messages: string[]) => (
      <ChatLayoutContext value={layoutCtx(container)}>
        <ChatMessageList scrollToTopAction={action}>
          {messages.map(m => (
            <div key={m}>{m}</div>
          ))}
        </ChatMessageList>
      </ChatLayoutContext>
    );

    const view = render(ui(['oldest-visible']));
    fireIntersect();
    await act(async () => {});
    expect(action).toHaveBeenCalledTimes(1);

    // The first page lands but the sentinel is still pinned in view.
    view.rerender(ui(['earlier-1', 'earlier-2', 'oldest-visible']));
    await act(async () => resolveAction());

    // The list keeps filling without another manual scroll.
    expect(action).toHaveBeenCalledTimes(2);

    // Settle the second load: React runs async transition actions on one
    // global chain, so a load left forever-pending here would wedge every
    // later transition commit in this file.
    await act(async () => resolveAction());
  });

  it('fires the latest action after the prop changes', async () => {
    const staleAction = vi.fn(async () => {});
    const freshAction = vi.fn(async () => {});
    const {rerender} = render(
      <ChatMessageList scrollToTopAction={staleAction}>
        <div>msg</div>
      </ChatMessageList>,
    );

    rerender(
      <ChatMessageList scrollToTopAction={freshAction}>
        <div>msg</div>
      </ChatMessageList>,
    );
    fireIntersect();
    await act(async () => {});

    expect(staleAction).not.toHaveBeenCalled();
    expect(freshAction).toHaveBeenCalledTimes(1);
  });

  it('stops observing when the action is removed', async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );
    const {rerender} = render(
      <ChatMessageList scrollToTopAction={action}>
        <div>msg</div>
      </ChatMessageList>,
    );

    fireIntersect();
    await act(async () => resolveAction());
    expect(action).toHaveBeenCalledTimes(1);

    // History exhausted — the consumer swaps the action for undefined.
    rerender(
      <ChatMessageList scrollToTopAction={undefined}>
        <div>msg</div>
      </ChatMessageList>,
    );
    fireIntersect(false);
    fireIntersect();
    await act(async () => {});
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('skips compensation when the anchor message was replaced', async () => {
    const container = makeScrollContainer();
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );

    const ui = (messages: string[]) => (
      <ChatLayoutContext value={layoutCtx(container)}>
        <ChatMessageList scrollToTopAction={action}>
          {messages.map(m => (
            <div key={m}>{m}</div>
          ))}
        </ChatMessageList>
      </ChatLayoutContext>
    );

    const view = render(ui(['oldest-visible']));
    stubRect(screen.getByText('oldest-visible'), () => 100);

    fireIntersect();
    await act(async () => {});

    // The consumer re-keyed the list — the anchor element unmounted.
    view.rerender(ui(['replaced-a', 'replaced-b', 'replaced-c']));
    await act(async () => resolveAction());

    expect(container.scrollTop).toBe(0);
  });

  it('leaves the scroll untouched when the action loads nothing', async () => {
    const container = makeScrollContainer();
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );

    render(
      <ChatLayoutContext value={layoutCtx(container)}>
        <ChatMessageList scrollToTopAction={action}>
          <div>only-message</div>
        </ChatMessageList>
      </ChatLayoutContext>,
    );
    stubRect(screen.getByText('only-message'), () => 100);

    fireIntersect();
    await act(async () => resolveAction());

    expect(container.scrollTop).toBe(0);
    // An empty page must also stop the auto-refill cycle.
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('acts on the latest entry when the observer coalesces notifications', async () => {
    const action = vi.fn(async () => {});
    render(
      <ChatMessageList scrollToTopAction={action}>
        <div>msg</div>
      </ChatMessageList>,
    );

    // Delayed delivery batches threshold crossings, oldest first.
    // Enter-then-leave means the sentinel is already gone — no load.
    fireIntersect(true, false);
    await act(async () => {});
    expect(action).not.toHaveBeenCalled();

    // Leave-then-enter is a real arrival at the top.
    fireIntersect(false, true);
    await act(async () => {});
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('compensates against the nearest scrollable ancestor when standalone', async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );

    const ui = (messages: string[]) => (
      <div style={{overflowY: 'auto'}} data-testid="scroller">
        <ChatMessageList scrollToTopAction={action}>
          {messages.map(m => (
            <div key={m}>{m}</div>
          ))}
        </ChatMessageList>
      </div>
    );

    const view = render(ui(['oldest-visible']));
    const scroller = screen.getByTestId('scroller');
    stubRect(scroller, () => 0);
    const anchor = screen.getByText('oldest-visible');
    let anchorTop = 100;
    stubRect(anchor, () => anchorTop);

    fireIntersect();
    await act(async () => {});

    view.rerender(ui(['earlier-1', 'earlier-2', 'oldest-visible']));
    anchorTop = 500;
    await act(async () => resolveAction());

    // Compensation lands on the wrapper that clips the list — not the page.
    expect(scroller.scrollTop).toBe(400);
  });

  it('finds legacy overlay-scrollbar containers when standalone', async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      async () => new Promise<void>(resolve => (resolveAction = resolve)),
    );

    const ui = (messages: string[]) => (
      <div data-testid="scroller">
        <ChatMessageList scrollToTopAction={action}>
          {messages.map(m => (
            <div key={m}>{m}</div>
          ))}
        </ChatMessageList>
      </div>
    );

    // Older Chromium still computes the deprecated `overflow-y: overlay`,
    // which jsdom's inline styles cannot express — stub the computed style.
    // Installed before render: the observer effect resolves its container
    // once, on mount.
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    const spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((el, pseudo) =>
        (el as HTMLElement).getAttribute?.('data-testid') === 'scroller'
          ? ({overflowY: 'overlay'} as CSSStyleDeclaration)
          : realGetComputedStyle(el, pseudo ?? undefined),
      );

    const view = render(ui(['oldest-visible']));
    const scroller = screen.getByTestId('scroller');
    stubRect(scroller, () => 0);
    const anchor = screen.getByText('oldest-visible');
    let anchorTop = 100;
    stubRect(anchor, () => anchorTop);

    fireIntersect();
    await act(async () => {});

    view.rerender(ui(['earlier-1', 'earlier-2', 'oldest-visible']));
    anchorTop = 500;
    await act(async () => resolveAction());
    spy.mockRestore();

    expect(scroller.scrollTop).toBe(400);
  });
});

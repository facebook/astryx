// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {ChatLayout} from './ChatLayout';
import {ChatMessageList} from './ChatMessageList';
import {ChatMessage} from './ChatMessage';
import {ChatMessageBubble} from './ChatMessageBubble';

describe('ChatLayout', () => {
  it('renders children in the message area', () => {
    render(
      <ChatLayout composer={<div>composer</div>}>
        <div>Hello message</div>
      </ChatLayout>,
    );
    expect(screen.getByText('Hello message')).toBeTruthy();
  });

  it('renders composer in dock', () => {
    render(
      <ChatLayout composer={<div data-testid="composer">Compose</div>}>
        <div>msg</div>
      </ChatLayout>,
    );
    expect(screen.getByTestId('composer')).toBeTruthy();
  });

  it('renders empty state when children is empty array', () => {
    render(
      <ChatLayout
        composer={<div>composer</div>}
        emptyState={<div>No messages yet</div>}>
        {[]}
      </ChatLayout>,
    );
    expect(screen.getByText('No messages yet')).toBeTruthy();
  });

  it('prefers children over empty state when both present', () => {
    render(
      <ChatLayout
        composer={<div>composer</div>}
        emptyState={<div>No messages yet</div>}>
        <div>A message</div>
      </ChatLayout>,
    );
    expect(screen.getByText('A message')).toBeTruthy();
    expect(screen.queryByText('No messages yet')).toBeNull();
  });

  it('applies density attribute to root element', () => {
    const {rerender} = render(
      <ChatLayout
        composer={<div>composer</div>}
        data-testid="layout"
        density="compact">
        <div>msg</div>
      </ChatLayout>,
    );
    const root = screen.getByTestId('layout');
    expect(root.className).toContain('compact');

    rerender(
      <ChatLayout
        composer={<div>composer</div>}
        data-testid="layout"
        density="spacious">
        <div>msg</div>
      </ChatLayout>,
    );
    expect(root.className).toContain('spacious');
  });

  it('defaults density to balanced', () => {
    render(
      <ChatLayout composer={<div>composer</div>} data-testid="layout">
        <div>msg</div>
      </ChatLayout>,
    );
    const root = screen.getByTestId('layout');
    expect(root.className).toContain('balanced');
  });

  it('renders custom scrollButton slot', () => {
    render(
      <ChatLayout
        composer={<div>composer</div>}
        scrollButton={<button type="button">Scroll down</button>}>
        <div>msg</div>
      </ChatLayout>,
    );
    expect(screen.getByRole('button', {name: /Scroll down/})).toBeTruthy();
  });

  it('hides scrollButton when null', () => {
    render(
      <ChatLayout composer={<div>composer</div>} scrollButton={null}>
        <div>msg</div>
      </ChatLayout>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// initial — first-fill scroll positioning
//
// jsdom has no layout, so geometry is stubbed and only the synchronous
// paths are asserted (see useChatStreamScroll.test.tsx for the rationale).
// The ResizeObserver stub mirrors useChatNewMessages.test.tsx.
// ---------------------------------------------------------------------------

type ObserverEntry = {element: Element; callback: ResizeObserverCallback};
let activeObservations: ObserverEntry[] = [];

class FakeResizeObserver {
  callback: ResizeObserverCallback;
  observed = new Set<Element>();

  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }

  observe(el: Element) {
    this.observed.add(el);
    activeObservations.push({element: el, callback: this.callback});
    this.callback([{target: el} as ResizeObserverEntry], this);
  }

  unobserve(el: Element) {
    this.observed.delete(el);
    activeObservations = activeObservations.filter(o => o.element !== el);
  }

  disconnect() {
    for (const el of this.observed) {
      activeObservations = activeObservations.filter(o => o.element !== el);
    }
    this.observed.clear();
  }
}

describe('ChatLayout — initial scroll positioning', () => {
  let rafQueue: FrameRequestCallback[] = [];

  beforeEach(() => {
    activeObservations = [];
    rafQueue = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setGeometry(el: HTMLElement, scrollHeight: number) {
    Object.defineProperty(el, 'scrollHeight', {
      value: scrollHeight,
      configurable: true,
    });
    Object.defineProperty(el, 'clientHeight', {value: 400, configurable: true});
    Object.defineProperty(el, 'offsetHeight', {
      value: 400,
      configurable: true,
    });
  }

  function fireContentResize() {
    act(() => {
      for (const {element, callback} of [...activeObservations]) {
        callback([{target: element} as ResizeObserverEntry], null!);
      }
    });
  }

  function renderLayout(initial?: 'spring' | 'instant' | false) {
    render(
      <ChatLayout
        composer={<div>composer</div>}
        data-testid="layout"
        initial={initial}>
        <ChatMessageList>
          <ChatMessage sender="assistant">
            <ChatMessageBubble>Hello</ChatMessageBubble>
          </ChatMessage>
        </ChatMessageList>
      </ChatLayout>,
    );
    return screen.getByTestId('layout');
  }

  it("initial='instant' positions async-loaded content synchronously", () => {
    const root = renderLayout('instant');
    // Mounted while content is short (loading) — not scrollable.
    setGeometry(root, 400);
    act(() => rafQueue.splice(0).forEach(cb => cb(0)));
    expect(root.scrollTop).toBe(0);

    // Content lands: the message list's ResizeObserver fires.
    setGeometry(root, 1400);
    fireContentResize();
    // Positioned in the same synchronous step — no animation frames.
    expect(root.scrollTop).toBe(1000);
  });

  it('default (spring) does not jump on async content — animation owns it', () => {
    const root = renderLayout();
    setGeometry(root, 400);
    act(() => rafQueue.splice(0).forEach(cb => cb(0)));

    setGeometry(root, 1400);
    fireContentResize();
    // Spring path: nothing moves until animation frames run.
    expect(root.scrollTop).toBe(0);
    expect(rafQueue.length).toBeGreaterThan(0);
  });

  it('initial={false} stays at the top when content lands', () => {
    const root = renderLayout(false);
    setGeometry(root, 1400);
    act(() => rafQueue.splice(0).forEach(cb => cb(0)));
    fireContentResize();
    act(() => rafQueue.splice(0).forEach(cb => cb(0)));
    expect(root.scrollTop).toBe(0);
  });
});

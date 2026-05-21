// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, act} from '@testing-library/react';
import {useRef, useState} from 'react';
import {XDSChatLayout} from './XDSChatLayout';
import {XDSChatMessageList} from './XDSChatMessageList';
import {XDSChatMessage} from './XDSChatMessage';
import {XDSChatMessageBubble} from './XDSChatMessageBubble';
import {useXDSChatNewMessages} from './useXDSChatNewMessages';

// ---------------------------------------------------------------------------
// Test infrastructure: track which elements ResizeObserver is observing
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
    // Fire initial callback (matches real ResizeObserver behavior)
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

beforeEach(() => {
  activeObservations = [];
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Fire a resize on all currently-observed elements */
function fireAllResizes() {
  for (const {element, callback} of activeObservations) {
    callback([{target: element} as ResizeObserverEntry], {} as ResizeObserver);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useXDSChatNewMessages — late content mount (issue #2282)', () => {
  it('calls onResize when XDSChatMessageList is present from initial render', () => {
    const onResize = vi.fn();

    // Minimal test: hook directly with a pre-set ref
    function TestHarness() {
      const ref = useRef<HTMLDivElement>(null);
      useXDSChatNewMessages({contentRef: ref, isLocked: true, onResize});
      return (
        <div ref={ref} data-testid="content">
          <div className="xds-chat-message">msg</div>
        </div>
      );
    }

    render(<TestHarness />);

    // observeResize fires immediately on registration, so onResize should
    // have been called at least once
    expect(onResize).toHaveBeenCalled();
  });

  it('does NOT call onResize when contentRef is set after initial effect (the bug)', () => {
    const onResize = vi.fn();

    // Reproduces the Clio pattern: contentRef starts null, gets set later
    function TestHarness() {
      const contentRef = useRef<HTMLElement | null>(null);
      const [mounted, setMounted] = useState(false);

      useXDSChatNewMessages({contentRef, isLocked: true, onResize});

      return (
        <>
          <button data-testid="mount" onClick={() => setMounted(true)}>
            Mount
          </button>
          {mounted && (
            <div
              ref={el => {
                contentRef.current = el;
              }}
              data-testid="content">
              <div className="xds-chat-message">msg</div>
            </div>
          )}
        </>
      );
    }

    const {getByTestId} = render(<TestHarness />);

    // onResize should NOT have been called — contentRef.current was null
    expect(onResize).not.toHaveBeenCalled();

    // Now mount the content element (sets contentRef.current)
    act(() => {
      getByTestId('mount').click();
    });

    // Fire resizes on all observed elements
    fireAllResizes();

    // BUG: onResize is STILL not called because the effect never re-ran
    // to observe the newly-set contentRef.current.
    // When this test fails (after the fix), change the assertion to:
    //   expect(onResize).toHaveBeenCalled();
    expect(onResize).not.toHaveBeenCalled();
  });

  it('does NOT observe content element in full XDSChatLayout with late XDSChatMessageList mount', () => {
    // End-to-end reproduction of the Clio bug:
    // XDSChatLayout starts with emptyState, then XDSChatMessageList
    // mounts when the first message arrives.
    function TestApp() {
      const [messages, setMessages] = useState<string[]>([]);

      return (
        <>
          <button
            data-testid="add-message"
            onClick={() =>
              setMessages(prev => [...prev, `msg-${prev.length}`])
            }>
            Add
          </button>
          <XDSChatLayout
            composer={<div>composer</div>}
            emptyState={<div>Empty state</div>}>
            {messages.length > 0 && (
              <XDSChatMessageList>
                {messages.map(msg => (
                  <XDSChatMessage key={msg} sender="assistant">
                    <XDSChatMessageBubble>{msg}</XDSChatMessageBubble>
                  </XDSChatMessage>
                ))}
              </XDSChatMessageList>
            )}
          </XDSChatLayout>
        </>
      );
    }

    const {getByTestId, getByText} = render(<TestApp />);

    // Verify empty state is showing
    expect(getByText('Empty state')).toBeInTheDocument();

    // Record observations before message
    const observationCountBefore = activeObservations.length;

    // Add first message — triggers XDSChatMessageList mount
    act(() => {
      getByTestId('add-message').click();
    });

    // Verify message rendered
    expect(getByText('msg-0')).toBeInTheDocument();

    // Check if the inner content div (inside XDSChatMessageList) got observed.
    // The inner div has the message list gap styles applied.
    // We look for an observation on an element that contains .xds-chat-message
    // AND is not the root layout element.
    const contentObservation = activeObservations.find(o => {
      const el = o.element;
      // Must contain a chat message
      if (!el.querySelector?.('.xds-chat-message')) {return false;}
      // Must NOT be the root chat-layout (that's the density observer)
      if (el.className?.includes('xds-chat-layout')) {return false;}
      return true;
    });

    // BUG: The content inner div is NOT being observed because
    // useXDSChatNewMessages's effect ran when contentRef.current was null
    // and never re-ran after XDSChatMessageList set it.
    // When the fix is applied, change this to:
    //   expect(contentObservation).toBeDefined();
    expect(contentObservation).toBeUndefined();
  });
});

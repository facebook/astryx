// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useChatKeyboard.test.tsx
 * @input vitest, Testing Library, ChatLayout, a stand-in visual viewport
 * @output Tests ChatLayout's keyboard behavior in jsdom: the dock lifts by
 *   the keyboard's cover and makes room after the messages, a transcript at
 *   its newest message stays there, the dock comes down when the composer's
 *   text blurs, nothing moves without a keyboard, a hide under a scrolling
 *   finger keeps the room until the scroll ends
 * @position Unit tests for Chat/useChatKeyboard.ts (motion and the tap claim
 *   are proven in Mobile Safari; see the pull request evidence)
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {ChatLayout} from './ChatLayout';

type FakeViewport = EventTarget & {
  height: number;
  offsetTop: number;
  scale: number;
};

let viewport: FakeViewport;

function report(height: number) {
  viewport.height = height;
  act(() => {
    viewport.dispatchEvent(new Event('resize'));
  });
}

function dockOf(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('[data-testid="composer"]')!
    .parentElement!.parentElement!.parentElement!;
}

function spacerOf(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('[aria-hidden="true"]')!;
}

function renderLayout() {
  const result = render(
    <ChatLayout
      data-testid="layout"
      composer={
        <div data-testid="composer">
          <textarea aria-label="Message" />
        </div>
      }>
      <p>Hello</p>
    </ChatLayout>,
  );
  // jsdom has no layout: the root fills the viewport, as a full-page chat does.
  screen.getByTestId('layout').getBoundingClientRect = () =>
    new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  return result;
}

describe('ChatLayout and the software keyboard', () => {
  beforeEach(() => {
    viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      offsetTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
    // Mobile Safari's reports (keyboard/keyboardModel.ts): iOS is the browser
    // that supports -webkit-touch-callout.
    Object.defineProperty(window, 'CSS', {
      configurable: true,
      value: {
        supports: (property: string) => property === '-webkit-touch-callout',
      },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'visualViewport');
    Reflect.deleteProperty(window, 'CSS');
  });

  it('lifts the dock by the keyboard over it and makes room after the messages', () => {
    const {container} = renderLayout();
    report(window.innerHeight - 300);
    expect(dockOf(container).style.translate).toBe('0px -300px');
    expect(spacerOf(container).style.height).toBe('300px');
  });

  it('keeps a transcript at its newest message there', () => {
    const {container} = renderLayout();
    const root = screen.getByTestId('layout');
    const spacer = spacerOf(container);
    let scrollTop = 1000 - 600;
    Object.defineProperties(root, {
      clientHeight: {configurable: true, get: () => 600},
      scrollHeight: {
        configurable: true,
        get: () => 1000 + (parseFloat(spacer.style.height) || 0),
      },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value;
        },
      },
    });
    report(window.innerHeight - 300);
    expect(scrollTop).toBe(1300 - 600);
  });

  it('leaves a transcript the reader scrolled up where it is', () => {
    const {container} = renderLayout();
    const root = screen.getByTestId('layout');
    const spacer = spacerOf(container);
    let scrollTop = 100;
    Object.defineProperties(root, {
      clientHeight: {configurable: true, get: () => 600},
      scrollHeight: {
        configurable: true,
        get: () => 1000 + (parseFloat(spacer.style.height) || 0),
      },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value;
        },
      },
    });
    report(window.innerHeight - 300);
    expect(scrollTop).toBe(100);
  });

  it('brings the dock down when the composer text loses focus to nothing', () => {
    const {container} = renderLayout();
    const field = screen.getByRole('textbox', {name: 'Message'});
    act(() => field.focus());
    report(window.innerHeight - 300);
    act(() => field.blur());
    expect(dockOf(container).style.translate).toBe('0px 0px');
    expect(spacerOf(container).style.height).toBe('0px');
  });

  it('keeps the room after the messages until a scrolling finger lifts and the scroll ends', () => {
    vi.useFakeTimers();
    try {
      const {container} = renderLayout();
      const layout = screen.getByTestId('layout');
      const field = screen.getByRole('textbox', {name: 'Message'});
      act(() => field.focus());
      report(window.innerHeight - 300);
      // A finger over the conversation, as a TouchEvent carries it.
      const touch = {identifier: 0, clientX: 100, clientY: 100};
      const finger = (type: string, count: number) => {
        const event = new Event(type, {bubbles: true});
        Object.assign(event, {
          touches: count === 0 ? [] : [touch],
          changedTouches: [touch],
        });
        act(() => {
          layout.dispatchEvent(event);
        });
      };
      finger('touchstart', 1);
      // The drag dismisses the keyboard: the dock comes down at once, the
      // room stays while the finger scrolls.
      act(() => field.blur());
      expect(dockOf(container).style.translate).toBe('0px 0px');
      expect(spacerOf(container).style.height).toBe('300px');
      finger('touchend', 0);
      act(() => {
        layout.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(100);
      });
      expect(spacerOf(container).style.height).toBe('300px');
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(spacerOf(container).style.height).toBe('0px');
    } finally {
      vi.useRealTimers();
    }
  });

  it('moves nothing while no keyboard is up', () => {
    const {container} = renderLayout();
    report(window.innerHeight);
    expect(dockOf(container).style.translate).toBe('');
    expect(spacerOf(container).style.height).toBe('');
  });
});

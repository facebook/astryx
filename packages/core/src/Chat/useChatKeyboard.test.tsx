// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useChatKeyboard.test.tsx
 * @input vitest, Testing Library, ChatLayout, a stand-in visual viewport
 * @output Tests ChatLayout's keyboard behavior in jsdom: the dock lifts by
 *   the keyboard's cover and makes room after the messages, a transcript at
 *   its newest message stays there, the dock comes down when the composer's
 *   text blurs, nothing moves without a keyboard
 * @position Unit tests for Chat/useChatKeyboard.ts (motion and the tap claim
 *   are proven in Mobile Safari; see the pull request evidence)
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
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
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'visualViewport');
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

  it('moves nothing while no keyboard is up', () => {
    const {container} = renderLayout();
    report(window.innerHeight);
    expect(dockOf(container).style.translate).toBe('');
    expect(spacerOf(container).style.height).toBe('');
  });
});

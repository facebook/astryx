// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useChatKeyboard.test.tsx
 * @input vitest, Testing Library, ChatLayout, a stand-in visual viewport
 * @output Tests ChatLayout's keyboard behavior in jsdom: the dock lifts by
 *   the keyboard's cover and makes room after the messages, a transcript at
 *   its newest message stays there, the dock comes down when the composer's
 *   text blurs, nothing moves without a keyboard, a hide under a scrolling
 *   finger keeps the room until the scroll ends; which touches the composer
 *   claims (unfocused contenteditable text, never a token's control or a
 *   text control)
 * @position Unit tests for Chat/useChatKeyboard.ts (motion and the tap claim
 *   are proven in Mobile Safari; see the pull request evidence)
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {ChatLayout} from './ChatLayout';
import {editableToClaim} from './useChatKeyboard';

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

// The lift an element is laid out with: the value its functional style
// (a StyleX dynamic style, an inline custom property) carries, CSS px.
function layoutLift(element: HTMLElement): number {
  const match = /--[\w-]+:\s*(-?[\d.]+)px/.exec(
    element.getAttribute('style') ?? '',
  );
  return match == null ? 0 : Number(match[1]);
}

// Lets the ride end (the animator's clock) and its end reach the layout.
async function settle() {
  await act(async () => {
    await vi.waitFor(
      () => {
        if (document.getAnimations?.().some(a => a.playState === 'running')) {
          throw new Error('still riding');
        }
      },
      {timeout: 3000, interval: 20},
    );
    await new Promise(resolve => setTimeout(resolve, 50));
  });
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

  it('lays the dock and the room after the messages out from the keyboard height', async () => {
    const {container} = renderLayout();
    report(window.innerHeight - 300);
    await settle();
    // spec:AST-099 FR3: the layout is right with no animation running, and
    // the ride's translate is handed back to it: back at identity, the
    // animator takes it off the element.
    expect(layoutLift(dockOf(container))).toBe(300);
    expect(layoutLift(spacerOf(container))).toBe(300);
    expect(dockOf(container).style.translate).toBe('');
  });

  it('keeps a transcript at its newest message there', async () => {
    const {container} = renderLayout();
    // Past the mount's own first-frame scroll to the end.
    await settle();
    const root = screen.getByTestId('layout');
    const spacer = spacerOf(container);
    let scrollTop = 1000 - 600;
    Object.defineProperties(root, {
      clientHeight: {configurable: true, get: () => 600},
      scrollHeight: {
        configurable: true,
        get: () => 1000 + layoutLift(spacer),
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
    await settle();
    expect(scrollTop).toBe(1300 - 600);
  });

  it('leaves a transcript the reader scrolled up where it is', async () => {
    const {container} = renderLayout();
    // Past the mount's own first-frame scroll to the end.
    await settle();
    const root = screen.getByTestId('layout');
    const spacer = spacerOf(container);
    let scrollTop = 100;
    Object.defineProperties(root, {
      clientHeight: {configurable: true, get: () => 600},
      scrollHeight: {
        configurable: true,
        get: () => 1000 + layoutLift(spacer),
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
    await settle();
    expect(scrollTop).toBe(100);
  });

  it('rides the dock down from the blur, ahead of the layout, which follows the keyboard', async () => {
    const {container} = renderLayout();
    const field = screen.getByRole('textbox', {name: 'Message'});
    act(() => field.focus());
    report(window.innerHeight - 300);
    await settle();
    act(() => field.blur());
    await settle();
    // The keyboard is still up (no report yet): the layout keeps its lift,
    // and the ride has taken the dock down on top of it.
    expect(layoutLift(dockOf(container))).toBe(300);
    expect(dockOf(container).style.translate).toBe('0px 300px');
    report(window.innerHeight);
    await settle();
    expect(layoutLift(dockOf(container))).toBe(0);
    expect(layoutLift(spacerOf(container))).toBe(0);
    expect(dockOf(container).style.translate).toBe('');
  });

  it('keeps the room after the messages until a scrolling finger lifts and the scroll ends', async () => {
    const {container} = renderLayout();
    const layout = screen.getByTestId('layout');
    const field = screen.getByRole('textbox', {name: 'Message'});
    act(() => field.focus());
    report(window.innerHeight - 300);
    await settle();
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
    const wait = async (ms: number) =>
      act(async () => {
        await new Promise(resolve => setTimeout(resolve, ms));
      });
    finger('touchstart', 1);
    // The drag dismisses the keyboard: the dock rides down on top of the
    // layout, which keeps its room while the finger scrolls, even once the
    // keyboard is reported gone.
    act(() => field.blur());
    await settle();
    report(window.innerHeight);
    await wait(50);
    expect(dockOf(container).style.translate).toBe('0px 300px');
    expect(layoutLift(spacerOf(container))).toBe(300);
    finger('touchend', 0);
    act(() => {
      layout.dispatchEvent(new Event('scroll'));
    });
    await wait(100);
    expect(layoutLift(spacerOf(container))).toBe(300);
    await wait(200);
    expect(layoutLift(spacerOf(container))).toBe(0);
    expect(dockOf(container).style.translate).toBe('');
  });

  it('moves nothing while no keyboard is up', async () => {
    const {container} = renderLayout();
    report(window.innerHeight);
    await settle();
    expect(dockOf(container).style.translate).toBe('');
    expect(layoutLift(dockOf(container))).toBe(0);
    expect(layoutLift(spacerOf(container))).toBe(0);
  });
});

describe('the taps the composer claims', () => {
  // jsdom has no isContentEditable: the nearest contenteditable decides.
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'isContentEditable', {
      configurable: true,
      get(this: HTMLElement) {
        const host = this.closest('[contenteditable]');
        return host != null && host.getAttribute('contenteditable') !== 'false';
      },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'isContentEditable');
    document.body.innerHTML = '';
  });

  it('claims a touch on unfocused contenteditable text', () => {
    document.body.innerHTML =
      '<div contenteditable="true" id="editor"><p><span id="word">Hello</span></p></div>';
    expect(editableToClaim(document.getElementById('word'))).toBe(
      document.getElementById('editor'),
    );
  });

  it('leaves a control inside a token its own tap', () => {
    document.body.innerHTML =
      '<div contenteditable="true"><p>Hi <span contenteditable="false" data-astryx-token=""><button id="remove">×</button><span id="label">@Ada</span></span></p></div>';
    expect(editableToClaim(document.getElementById('remove'))).toBeNull();
    expect(editableToClaim(document.getElementById('label'))).toBeNull();
  });

  it('leaves a text control to put its own caret under the finger', () => {
    document.body.innerHTML =
      '<textarea id="draft">A long draft</textarea><input id="line" value="One line">';
    expect(editableToClaim(document.getElementById('draft'))).toBeNull();
    expect(editableToClaim(document.getElementById('line'))).toBeNull();
  });

  it('claims nothing that already has focus', () => {
    document.body.innerHTML =
      '<div contenteditable="true" id="editor"><p id="text">Hello</p></div>';
    document.getElementById('editor')!.focus();
    expect(editableToClaim(document.getElementById('text'))).toBeNull();
  });
});

describe('what ChatLayout loads for the keyboard', () => {
  it('imports no gesture system: the composer tap is the keyboard module\u2019s focus route', () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    for (const file of ['ChatLayout.tsx', 'useChatKeyboard.ts']) {
      const source = fs.readFileSync(path.join(here, file), 'utf8');
      expect(source, file).not.toMatch(/from '\.\.\/gestures/);
    }
  });
});

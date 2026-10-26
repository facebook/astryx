// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useChatKeyboard.test.tsx
 * @input vitest, Testing Library, ChatLayout, a stand-in visual viewport
 * @output Tests ChatLayout's keyboard behavior in jsdom: the dock lifts by
 *   the keyboard's cover and the message area's end padding makes the same
 *   room, with no element added for it, a transcript at its newest message
 *   stays there, the dock comes down when the composer's text blurs, nothing
 *   moves without a keyboard, a hide under a scrolling finger keeps the room
 *   until the scroll ends; which touches the composer claims (unfocused
 *   contenteditable text, never a token's control or a text control); focus
 *   moves into the composer's text delivered without the browser's reveal
 *   under a finger, and left to the browser under a mouse; the caret a
 *   claimed tap places, where the browser has either caret-from-point API
 * @position Unit tests for Chat/useChatKeyboard.ts (motion and the tap claim
 *   are proven in Mobile Safari; see the pull request evidence)
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {ChatLayout} from './ChatLayout';
import {editableToClaim, focusAtPoint} from './useChatKeyboard';

type FakeViewport = EventTarget & {
  height: number;
  offsetTop: number;
  scale: number;
  width?: number;
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

function messagesOf(): HTMLElement {
  return screen.getByTestId('layout').firstElementChild as HTMLElement;
}

// The room the message area's end padding makes for the keyboard, CSS px: the
// `+ Npx` its functional style adds to the density's own padding.
function keyboardRoom(element: HTMLElement): number {
  const match = /--[\w-]+:\s*calc\([^;]*\+\s*(-?[\d.]+)px\)/.exec(
    element.getAttribute('style') ?? '',
  );
  return match == null ? 0 : Number(match[1]);
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
    expect(keyboardRoom(messagesOf())).toBe(300);
    expect(dockOf(container).style.translate).toBe('');
  });

  it('adds no element for the keyboard: the root holds the message area and the dock', async () => {
    renderLayout();
    report(window.innerHeight - 300);
    await settle();
    // architecture:component-style-authoring INV7: the room is the message
    // area's end padding (spec:AST-099 FR3), not an element of its own.
    expect(screen.getByTestId('layout').children).toHaveLength(2);
  });

  it('keeps a transcript at its newest message there', async () => {
    renderLayout();
    // Past the mount's own first-frame scroll to the end.
    await settle();
    const root = screen.getByTestId('layout');
    let scrollTop = 1000 - 600;
    Object.defineProperties(root, {
      clientHeight: {configurable: true, get: () => 600},
      scrollHeight: {
        configurable: true,
        get: () => 1000 + keyboardRoom(messagesOf()),
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
    renderLayout();
    // Past the mount's own first-frame scroll to the end.
    await settle();
    const root = screen.getByTestId('layout');
    let scrollTop = 100;
    Object.defineProperties(root, {
      clientHeight: {configurable: true, get: () => 600},
      scrollHeight: {
        configurable: true,
        get: () => 1000 + keyboardRoom(messagesOf()),
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
    expect(keyboardRoom(messagesOf())).toBe(0);
    expect(dockOf(container).style.translate).toBe('');
  });

  it('keeps the message area\u2019s room until a scrolling finger lifts and the scroll ends', async () => {
    // A finger counts only under a coarse primary pointer (spec:AST-094 FR19).
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
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
    expect(keyboardRoom(messagesOf())).toBe(300);
    finger('touchend', 0);
    act(() => {
      layout.dispatchEvent(new Event('scroll'));
    });
    await wait(100);
    expect(keyboardRoom(messagesOf())).toBe(300);
    await wait(200);
    expect(keyboardRoom(messagesOf())).toBe(0);
    expect(dockOf(container).style.translate).toBe('');
    vi.unstubAllGlobals();
  });

  it('keeps no room for a finger under a fine primary pointer, which registers no touch listener (FR19)', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(pointer: fine)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const added: string[] = [];
    const addEventListener = HTMLElement.prototype.addEventListener;
    vi.spyOn(HTMLElement.prototype, 'addEventListener').mockImplementation(
      function (
        this: HTMLElement,
        ...args: Parameters<typeof addEventListener>
      ) {
        if (this.getAttribute('data-testid') === 'layout') {
          added.push(String(args[0]));
        }
        return addEventListener.apply(this, args);
      },
    );
    try {
      renderLayout();
      report(window.innerHeight - 300);
      await settle();
      expect(added.filter(type => type.startsWith('touch'))).toEqual([]);
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });

  it('keeps the lift when the page is pinch-zoomed past 2x with the keyboard up', async () => {
    // WebKit reports innerWidth and innerHeight in the zoomed visual
    // viewport's px (spec:AST-099 FR2): at 2x, innerHeight alone reads no
    // keyboard, and the dock would drop under it.
    try {
      vi.stubGlobal('innerHeight', 714);
      vi.stubGlobal('innerWidth', 402);
      Object.assign(viewport, {width: 402});
      const {container} = renderLayout();
      screen.getByTestId('layout').getBoundingClientRect = () =>
        new DOMRect(0, 0, 402, 714);
      report(714 - 337);
      await settle();
      expect(layoutLift(dockOf(container))).toBe(337);

      vi.stubGlobal('innerHeight', 357);
      vi.stubGlobal('innerWidth', 201);
      Object.assign(viewport, {scale: 2, width: 201});
      report((714 - 337) / 2);
      await settle();
      expect(layoutLift(dockOf(container))).toBe(337);
      expect(keyboardRoom(messagesOf())).toBe(337);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('moves nothing while no keyboard is up', async () => {
    const {container} = renderLayout();
    report(window.innerHeight);
    await settle();
    expect(dockOf(container).style.translate).toBe('');
    expect(layoutLift(dockOf(container))).toBe(0);
    expect(keyboardRoom(messagesOf())).toBe(0);
  });
});

describe('focus moves into the composer (spec:AST-099 FR4)', () => {
  // The primary pointer `matchMedia` reports: a touch screen's coarse finger,
  // or a desktop's fine mouse.
  function primaryPointer(pointer: 'coarse' | 'fine') {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === `(pointer: ${pointer})`,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  }

  function renderWithSearch(composerText: 'textarea' | 'contenteditable') {
    render(
      <>
        <input aria-label="Search" />
        <ChatLayout
          data-testid="layout"
          composer={
            composerText === 'textarea' ? (
              <textarea aria-label="Message" />
            ) : (
              <div
                aria-label="Message"
                contentEditable
                role="textbox"
                suppressContentEditableWarning
              />
            )
          }>
          <p>Hello</p>
        </ChatLayout>
      </>,
    );
    return {
      search: screen.getByRole('textbox', {name: 'Search'}),
      message: screen.getByRole('textbox', {name: 'Message'}),
    };
  }

  beforeEach(() => {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: Object.assign(new EventTarget(), {
        height: window.innerHeight,
        offsetTop: 0,
        scale: 1,
      }),
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'visualViewport');
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('delivers a move from another field into the composer without the browser\u2019s reveal', () => {
    primaryPointer('coarse');
    const {search, message} = renderWithSearch('textarea');
    act(() => search.focus());
    const focus = vi.spyOn(message, 'focus');
    // The keyboard's next button, Tab, or a script moving focus.
    act(() => message.focus());
    expect(focus).toHaveBeenCalledWith({preventScroll: true});
    expect(document.activeElement).toBe(message);
  });

  it('delivers a move into contenteditable composer text the same way', () => {
    primaryPointer('coarse');
    const {search, message} = renderWithSearch('contenteditable');
    act(() => search.focus());
    const focus = vi.spyOn(message, 'focus');
    act(() => message.focus());
    expect(focus).toHaveBeenCalledWith({preventScroll: true});
  });

  it('leaves focus moves to the browser under a mouse', () => {
    primaryPointer('fine');
    const {search, message} = renderWithSearch('textarea');
    act(() => search.focus());
    const focus = vi.spyOn(message, 'focus');
    act(() => message.focus());
    expect(focus).not.toHaveBeenCalledWith({preventScroll: true});
  });

  it('moves focus to the named composer region when the keyboard\u2019s Done ends entry', () => {
    primaryPointer('coarse');
    const {message} = renderWithSearch('textarea');
    const region = screen.getByRole('group', {name: 'Message composer'});
    act(() => message.focus());
    const focus = vi.spyOn(region, 'focus');
    // Done blurs the composer's text, and focus goes to nothing.
    act(() => message.blur());
    expect(document.activeElement).toBe(region);
    expect(focus).toHaveBeenCalledWith({preventScroll: true});
  });

  it('names the composer region without a landmark, so two layouts on a page repeat none', () => {
    primaryPointer('coarse');
    render(
      <>
        <ChatLayout composer={<textarea aria-label="First" />}>
          <p>One</p>
        </ChatLayout>
        <ChatLayout composer={<textarea aria-label="Second" />}>
          <p>Two</p>
        </ChatLayout>
      </>,
    );
    expect(screen.queryAllByRole('region')).toHaveLength(0);
    expect(
      screen.getAllByRole('group', {name: 'Message composer'}),
    ).toHaveLength(2);
  });

  it('adds no tab stop for the composer region', () => {
    primaryPointer('coarse');
    renderWithSearch('textarea');
    const region = screen.getByRole('group', {name: 'Message composer'});
    expect(region.tabIndex).toBe(-1);
  });

  it('leaves focus where the browser puts it when it moves on to another field', () => {
    primaryPointer('coarse');
    const {search, message} = renderWithSearch('textarea');
    act(() => message.focus());
    act(() => search.focus());
    expect(document.activeElement).toBe(search);
  });

  it('leaves a blur to nothing to the browser under a mouse', () => {
    primaryPointer('fine');
    const {message} = renderWithSearch('textarea');
    act(() => message.focus());
    act(() => message.blur());
    expect(document.activeElement).toBe(document.body);
  });

  it('moves focus nowhere when a drag dismisses the keyboard, not to the composer group (FR10)', () => {
    primaryPointer('coarse');
    const {message} = renderWithSearch('textarea');
    const viewport = window.visualViewport as unknown as EventTarget & {
      height: number;
    };
    viewport.height = window.innerHeight - 300;
    act(() => {
      viewport.dispatchEvent(new Event('resize'));
    });
    // The composer rests at the keyboard's top edge, so the drag dismisses
    // where the finger reaches the keyboard.
    screen.getByRole('group', {
      name: 'Message composer',
    }).getBoundingClientRect = () =>
      new DOMRect(0, window.innerHeight - 300, 400, 60);
    act(() => message.focus());
    const transcript = screen.getByText('Hello');
    const finger = (type: string, clientY: number, time: number) => {
      const point = {identifier: 0, clientX: 100, clientY};
      const event = new Event(type, {bubbles: true});
      Object.assign(event, {
        touches: type === 'touchend' ? [] : [point],
        changedTouches: [point],
      });
      Object.defineProperty(event, 'timeStamp', {value: time});
      act(() => {
        transcript.dispatchEvent(event);
      });
    };
    finger('touchstart', 100, 0);
    finger('touchmove', window.innerHeight - 300, 16);
    // The drag decides at the lift (spec:AST-094 FR36).
    expect(document.activeElement).toBe(message);
    finger('touchend', window.innerHeight - 300, 116);
    expect(document.activeElement).toBe(document.body);
  });

  it('dismisses from the composer\u2019s top on a page WebKit pinch-zooms', () => {
    primaryPointer('coarse');
    const {message} = renderWithSearch('textarea');
    // WebKit at 2x: innerWidth and innerHeight in the zoomed visual
    // viewport's px; rects and clientY in layout px (spec:AST-099 FR2).
    vi.stubGlobal('innerHeight', 384);
    vi.stubGlobal('innerWidth', 512);
    const viewport = window.visualViewport as unknown as EventTarget & {
      height: number;
      scale: number;
      width: number;
    };
    Object.assign(viewport, {scale: 2, width: 512, height: (768 - 300) / 2});
    act(() => {
      viewport.dispatchEvent(new Event('resize'));
    });
    // The composer's top is 68 px above the keyboard's (at 468).
    screen.getByRole('group', {
      name: 'Message composer',
    }).getBoundingClientRect = () => new DOMRect(0, 400, 400, 60);
    act(() => message.focus());
    const transcript = screen.getByText('Hello');
    const finger = (type: string, clientY: number, time: number) => {
      const point = {identifier: 0, clientX: 100, clientY};
      const event = new Event(type, {bubbles: true});
      Object.assign(event, {
        touches: type === 'touchend' ? [] : [point],
        changedTouches: [point],
      });
      Object.defineProperty(event, 'timeStamp', {value: time});
      act(() => {
        transcript.dispatchEvent(event);
      });
    };
    // Lifted at rest, so the finger's own position decides (FR36).
    finger('touchstart', 100, 0);
    finger('touchmove', 399, 16);
    finger('touchend', 399, 116);
    expect(document.activeElement).toBe(message);
    finger('touchstart', 100, 1000);
    finger('touchmove', 420, 1016);
    finger('touchend', 420, 1116);
    expect(document.activeElement).not.toBe(message);
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

describe('the caret a claimed tap places', () => {
  // Installs (or, with undefined, removes) one caret-from-point API on the
  // document, as each engine has its own.
  function stubCaretApi(
    name: 'caretPositionFromPoint' | 'caretRangeFromPoint',
    value: unknown,
  ) {
    Object.defineProperty(document, name, {configurable: true, value});
  }

  function editable(): {element: HTMLElement; text: Text} {
    const element = document.createElement('div');
    element.setAttribute('contenteditable', 'true');
    // jsdom does not compute isContentEditable.
    Object.defineProperty(element, 'isContentEditable', {value: true});
    const text = document.createTextNode('Hello there');
    element.append(text);
    document.body.append(element);
    return {element, text};
  }

  afterEach(() => {
    Reflect.deleteProperty(document, 'caretPositionFromPoint');
    Reflect.deleteProperty(document, 'caretRangeFromPoint');
    document.body.replaceChildren();
  });

  it('reads the standard caretPositionFromPoint, the only one Firefox has', () => {
    const {element, text} = editable();
    stubCaretApi(
      'caretPositionFromPoint',
      vi.fn(() => ({offsetNode: text, offset: 3})),
    );

    focusAtPoint(element, 20, 10);

    expect(document.activeElement).toBe(element);
    const selection = document.getSelection();
    expect(selection?.anchorNode).toBe(text);
    expect(selection?.anchorOffset).toBe(3);
    expect(selection?.isCollapsed).toBe(true);
  });

  it('falls back to caretRangeFromPoint where only WebKit\u2019s exists', () => {
    const {element, text} = editable();
    stubCaretApi(
      'caretRangeFromPoint',
      vi.fn(() => {
        const range = document.createRange();
        range.setStart(text, 5);
        range.collapse(true);
        return range;
      }),
    );

    focusAtPoint(element, 20, 10);

    expect(document.getSelection()?.anchorOffset).toBe(5);
  });
});

describe('what ChatLayout loads for the keyboard', () => {
  it('imports no gesture recognizer: the composer tap is the keyboard module\u2019s focus route, and the dismissal reads only the shared velocity tracker', () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    for (const file of ['ChatLayout.tsx', 'useChatKeyboard.ts']) {
      const source = fs.readFileSync(path.join(here, file), 'utf8');
      expect(source, file).not.toMatch(/from '\.\.\/gestures/);
    }
    const dismissal = fs.readFileSync(
      path.join(here, '../keyboard/keyboardDismiss.ts'),
      'utf8',
    );
    expect(dismissal.match(/from '\.\.\/gestures\/[^']*'/g)).toEqual([
      "from '../gestures/VelocityTracker'",
    ]);
  });
});

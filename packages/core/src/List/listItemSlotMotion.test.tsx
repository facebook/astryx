// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listItemSlotMotion.test.tsx
 * @input vitest, List and ListItem, `useAnimatedLayout`, a stubbed layout
 *   (rows 40 px tall; inside a row its parts side by side, a slot 24 px wide
 *   or 64 px with a wide control) and a recording `Element.animate`
 * @output Unit proofs for a row's start and end content changes through its
 *   List's `animatedLayout` handle (`component:List` FR12): which part
 *   enters, which comes back for its exit (inert, hidden, focus handed to
 *   the row's target without scrolling), which swaps in place, and when the
 *   row changes at once
 * @position Unit tests for List/listItemSlotMotion.tsx; the motion itself is
 *   proven in List/__tests__/ListItemSlots.a11y.browser.spec.ts
 */

import {useRef, useState} from 'react';
import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {List} from './List';
import {ListItem} from './ListItem';
import {useAnimatedLayout} from '../hooks/useAnimatedLayout';

interface Played {
  readonly element: Element;
  readonly keyframes: Keyframe[];
  readonly animation: Animation;
}

let played: Played[] = [];
const originalAnimate = Element.prototype.animate;
const originalRect = Element.prototype.getBoundingClientRect;
const originalGetAnimations = Element.prototype.getAnimations;

const ROW = 40;
const WIDTH = 400;

/** What a row's part takes across the row: 0 while it exits. */
function widthOf(part: Element): number {
  const {style} = part as HTMLElement;
  if (
    style.position === 'absolute' ||
    style.marginInlineEnd.startsWith('-') ||
    style.marginRight.startsWith('-')
  ) {
    return 0;
  }
  if (part.hasAttribute('data-astryx-item-slot')) {
    return part.querySelector('[data-wide]') != null ? 64 : 24;
  }
  return -1;
}

/** Rows 40 px tall in DOM order; a row's parts side by side, its content filling. */
function rectOf(element: Element): DOMRect {
  if (element.id === 'area') {
    return new DOMRect(0, 0, WIDTH, 600);
  }
  const list = document.querySelector('ul');
  if (list == null) {
    return new DOMRect(0, 0, 0, 0);
  }
  const rows = [...list.children];
  if (element === list) {
    return new DOMRect(0, 0, WIDTH, rows.length * ROW);
  }
  const row = element.closest('li');
  if (row == null || row.parentElement !== list) {
    return new DOMRect(0, 0, 0, 0);
  }
  const top = rows.indexOf(row) * ROW;
  if (element === row) {
    return new DOMRect(0, top, WIDTH, ROW);
  }
  // A part of the row (or something inside one): the parts sit side by side.
  const parts = [...row.children];
  const fixed = parts
    .map(widthOf)
    .reduce((sum, width) => sum + Math.max(width, 0), 0);
  let x = 0;
  for (const part of parts) {
    const own = widthOf(part);
    const width = own < 0 ? WIDTH - fixed : own;
    if (part === element || part.contains(element)) {
      return new DOMRect(x, top, width, ROW);
    }
    x += width;
  }
  return new DOMRect(0, top, 0, 0);
}

beforeEach(() => {
  played = [];
  Element.prototype.animate = function (
    this: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  ) {
    const animation = {
      cancel: () => undefined,
      addEventListener: () => undefined,
      finished: new Promise(() => undefined),
      currentTime: 0,
    } as unknown as Animation;
    played.push({element: this, keyframes: keyframes as Keyframe[], animation});
    return animation;
  };
  Element.prototype.getBoundingClientRect = function (this: Element) {
    return rectOf(this);
  };
  Element.prototype.getAnimations = function (this: Element) {
    return played
      .filter(entry => entry.element === this)
      .map(entry => entry.animation);
  };
});

afterEach(() => {
  Element.prototype.animate = originalAnimate;
  Element.prototype.getBoundingClientRect = originalRect;
  Element.prototype.getAnimations = originalGetAnimations;
  vi.restoreAllMocks();
});

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

type Mode =
  | 'plain'
  | 'empty'
  | 'select'
  | 'select-wide'
  | 'remove'
  | 'confirm'
  | 'confirm-narrow';

let setMode: (mode: Mode) => void = () => undefined;
let setChecked: (isChecked: boolean) => void = () => undefined;

function endFor(mode: Mode) {
  if (mode === 'remove') {
    return (
      <button key="remove" type="button" aria-label="Remove Ada">
        ×
      </button>
    );
  }
  if (mode === 'confirm') {
    return (
      <button key="confirm" type="button" data-wide="">
        Delete
      </button>
    );
  }
  if (mode === 'confirm-narrow') {
    return (
      <button key="confirm" type="button">
        Del
      </button>
    );
  }
  // A `text && control` slot whose text is empty: it shows nothing.
  return mode === 'empty' ? '' : undefined;
}

function Demo({withHandle = true}: {withHandle?: boolean}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedLayout = useAnimatedLayout({containerRef});
  const [mode, set] = useState<Mode>('plain');
  const [isChecked, check] = useState(false);
  setMode = set;
  setChecked = check;
  return (
    <div id="area" ref={containerRef}>
      <List animatedLayout={withHandle ? animatedLayout : undefined}>
        <ListItem
          itemKey="ada"
          label="Ada"
          onClick={() => undefined}
          isSelected={isChecked}
          startContent={
            mode === 'select' || mode === 'select-wide' ? (
              <input
                type="checkbox"
                aria-label="Select Ada"
                checked={isChecked}
                data-wide={mode === 'select-wide' ? '' : undefined}
                onChange={() => undefined}
              />
            ) : undefined
          }
          endContent={endFor(mode)}
        />
        <ListItem itemKey="grace" label="Grace" />
      </List>
    </div>
  );
}

async function to(mode: Mode) {
  act(() => setMode(mode));
  await flush();
}

const slot = (which: 'start' | 'end') =>
  document.querySelector<HTMLElement>(
    `li [data-astryx-item-slot="${which}"]:not([aria-hidden])`,
  );

/** The horizontal start of each glide, by the element it played on. */
function horizontalGlides(): Map<Element, number> {
  const out = new Map<Element, number>();
  for (const entry of played) {
    const first = String(entry.keyframes[0]?.translate ?? '');
    const match = /^(-?[\d.e+-]+)px/.exec(first);
    if (match != null) {
      out.set(entry.element, Math.round(Number(match[1])));
    }
  }
  return out;
}

describe("a row's start and end content through its List's animatedLayout (component:List FR12)", () => {
  it('content that appears in the start slot enters, and the label glides over from where it was', async () => {
    render(<Demo />);
    await to('select');
    const start = slot('start');
    expect(start).not.toBeNull();
    // The checkbox's slot plays an entrance.
    expect(
      played.some(
        entry => entry.element === start && entry.keyframes.length > 0,
      ),
    ).toBe(true);
    // The row's main content moved 24 px along the row and glides from there.
    const label = document.querySelector('li button');
    const glides = horizontalGlides();
    expect(
      [...glides.entries()].some(
        ([element, x]) => element.contains(label) && x === -24,
      ),
    ).toBe(true);
  });

  it('content that leaves plays out in place as an inert copy hidden from assistive technology, and hands its focus to the row without scrolling', async () => {
    render(<Demo />);
    await to('remove');
    const remove = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove Ada"]',
    );
    act(() => remove?.focus());
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    await to('plain');
    const leaving = document.querySelector<HTMLElement>(
      'li [data-astryx-item-slot="end"]',
    );
    expect(leaving).not.toBeNull();
    expect(leaving?.getAttribute('aria-hidden')).toBe('true');
    expect(leaving?.hasAttribute('inert')).toBe(true);
    const rowTarget = document
      .querySelector('li')
      ?.querySelector(':scope > button');
    expect(document.activeElement).toBe(rowTarget);
    expect(focus).toHaveBeenCalledWith({preventScroll: true});
  });

  it("content that leaves as '' (it shows nothing) leaves as an exit, not a swap", async () => {
    render(<Demo />);
    await to('remove');
    played = [];
    await to('empty');
    // The remove button plays out as an inert copy, as it does leaving as
    // undefined.
    const copies = [...document.querySelectorAll('li [inert]')].filter(
      element => element.textContent === '×',
    );
    expect(copies).toHaveLength(1);
    expect(
      played.some(
        entry =>
          copies.includes(entry.element) &&
          Number(entry.keyframes[0]?.opacity) === 1,
      ),
    ).toBe(true);
  });

  it('content replaced in the same slot swaps in place: the old content as a transient copy while the new one fades in', async () => {
    render(<Demo />);
    await to('remove');
    played = [];
    await to('confirm');
    const end = slot('end');
    expect(end?.textContent).toBe('Delete');
    // The incoming slot fades in.
    expect(
      played.some(
        entry => entry.element === end && entry.keyframes[0]?.opacity === 0,
      ),
    ).toBe(true);
    // One copy of the old content, inert, on its way out.
    const copies = [...document.querySelectorAll('li [inert]')].filter(
      element => element.textContent === '×',
    );
    expect(copies).toHaveLength(1);
  });

  it('content replaced at the same size does not animate', async () => {
    render(<Demo />);
    await to('remove');
    played = [];
    await to('confirm-narrow');
    expect(played).toHaveLength(0);
    expect(document.querySelectorAll('li [inert]')).toHaveLength(0);
  });

  it('the same control changing at the same size (a checkbox toggling) plays nothing', async () => {
    render(<Demo />);
    await to('select');
    played = [];
    act(() => setChecked(true));
    await flush();
    expect(played).toHaveLength(0);
  });

  it('the same control changing size in place moves the label along the row', async () => {
    render(<Demo />);
    await to('select');
    played = [];
    await to('select-wide');
    const label = document.querySelector('li button');
    const glides = horizontalGlides();
    expect(
      [...glides.entries()].some(
        ([element, x]) => element.contains(label) && x === -40,
      ),
    ).toBe(true);
  });

  it('a fragment in a slot renders, with and without a handle', () => {
    const rows = (withHandle: boolean) => {
      function Fragments() {
        const containerRef = useRef<HTMLDivElement>(null);
        const animatedLayout = useAnimatedLayout({containerRef});
        return (
          <div id="area" ref={containerRef}>
            <List animatedLayout={withHandle ? animatedLayout : undefined}>
              <ListItem
                label="Risk"
                startContent={
                  <>
                    <span>!</span>
                    <span>Risk</span>
                  </>
                }
                endContent={
                  <>
                    <span>High</span>
                    <span>3</span>
                  </>
                }
              />
            </List>
          </div>
        );
      }
      return <Fragments />;
    };
    for (const withHandle of [false, true]) {
      const {unmount, getByText} = render(rows(withHandle));
      expect(getByText('High')).toBeTruthy();
      unmount();
    }
  });

  it('without a handle the row changes at once', async () => {
    render(<Demo withHandle={false} />);
    await to('select');
    await to('remove');
    await to('plain');
    expect(played).toHaveLength(0);
    expect(
      document.querySelectorAll('li [data-astryx-item-slot]'),
    ).toHaveLength(0);
  });
});

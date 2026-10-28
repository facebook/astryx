// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listLayoutUpdates.test.tsx
 * @input vitest, List and ListItem, `useAnimatedLayout`, a stubbed layout
 *   (each row 40 px tall in DOM order) and a recording `Element.animate`
 * @output Unit proofs for List's row updates through its `animatedLayout`
 *   handle (`component:List` FR12): which elements glide and by how much,
 *   which row enters, which row comes back for its exit, and when the list
 *   changes at once
 * @position Unit tests for List/listLayoutUpdates.ts; the motion itself is
 *   proven in List/__tests__/ListUpdates.interaction.browser.spec.ts
 */

import {use, useRef, useState} from 'react';
import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {List} from './List';
import {ListItem} from './ListItem';
import {useAnimatedLayout} from '../hooks/useAnimatedLayout';
import {TRAVELLING_ATTRIBUTE} from './listLayoutUpdates';
import {ListContext} from './ListContext';

interface Played {
  readonly element: Element;
  readonly keyframes: Keyframe[];
  readonly animation: Animation;
}

let played: Played[] = [];
const originalAnimate = Element.prototype.animate;
const originalRect = Element.prototype.getBoundingClientRect;
const originalGetAnimations = Element.prototype.getAnimations;
const offsetHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'offsetHeight',
);

const ROW = 40;

/**
 * A layout where each row is 40 px tall, in the list's current DOM order;
 * a row given a negative end margin (an exit giving up its space) keeps its
 * place but takes none.
 */
function rectOf(element: Element): DOMRect {
  if (element.id === 'area') {
    return new DOMRect(0, 0, 400, 600);
  }
  const list = document.querySelector('ul');
  if (list == null) {
    return new DOMRect(0, 0, 0, 0);
  }
  const takes = (row: Element) => {
    const {style} = row as HTMLElement;
    return style.position === 'absolute' || style.marginBlockEnd.startsWith('-')
      ? 0
      : ROW;
  };
  if (element.parentElement === list) {
    // The rows before it, summed without copying the list (the linear-work
    // case below counts copies).
    let top = 0;
    for (
      let row = list.firstElementChild;
      row != null && row !== element;
      row = row.nextElementSibling
    ) {
      top += takes(row);
    }
    return new DOMRect(0, top, 400, ROW);
  }
  if (element !== list && element.id !== 'after') {
    return new DOMRect(0, 0, 0, 0);
  }
  let height = 0;
  for (
    let row = list.firstElementChild;
    row != null;
    row = row.nextElementSibling
  ) {
    height += takes(row);
  }
  return element === list
    ? new DOMRect(0, 0, 400, height)
    : new DOMRect(0, height, 400, ROW);
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
  // The animations played on an element, still running (they never finish
  // here).
  Element.prototype.getAnimations = function (this: Element) {
    return played
      .filter(entry => entry.element === this)
      .map(entry => entry.animation);
  };
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.parentElement?.tagName === 'UL' ? ROW : 0;
    },
  });
});

afterEach(() => {
  Element.prototype.animate = originalAnimate;
  Element.prototype.getBoundingClientRect = originalRect;
  Element.prototype.getAnimations = originalGetAnimations;
  if (offsetHeight != null) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight);
  }
  vi.restoreAllMocks();
});

const flushMicrotasks = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

/** The vertical start of each glide played, by the row's text or id. */
function glides(): Map<string, number> {
  const out = new Map<string, number>();
  for (const entry of played) {
    const first = String(entry.keyframes[0]?.translate ?? '');
    const match = /^(-?[\d.e+-]+)px\s+(-?[\d.e+-]+)px/.exec(first);
    if (match == null) {
      continue;
    }
    const element = entry.element as HTMLElement;
    out.set(
      element.id !== '' ? element.id : (element.textContent ?? '').trim(),
      Math.round(Number(match[2])),
    );
  }
  return out;
}

/** The rows that played an entrance (a reveal), by their text. */
function entrances(): string[] {
  return played
    .filter(entry => entry.keyframes[0]?.clipPath != null)
    .map(entry => (entry.element.textContent ?? '').trim());
}

let setRows: (rows: string[]) => void = () => undefined;

function Demo({
  initial,
  withHandle = true,
  keyed = true,
  listStyle,
}: {
  initial: string[];
  withHandle?: boolean;
  keyed?: boolean;
  listStyle?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedLayout = useAnimatedLayout({containerRef});
  const [rows, set] = useState(initial);
  setRows = set;
  return (
    <div id="area" ref={containerRef}>
      <List
        animatedLayout={withHandle ? animatedLayout : undefined}
        style={listStyle}>
        {rows.map(label => (
          <ListItem
            key={label}
            itemKey={keyed ? label : undefined}
            label={label}
          />
        ))}
      </List>
      <div id="after">After</div>
    </div>
  );
}

/** Keyed rows, then one row without an itemKey. */
function Mixed({initial}: {initial: string[]}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedLayout = useAnimatedLayout({containerRef});
  const [rows, set] = useState(initial);
  setRows = set;
  return (
    <div id="area" ref={containerRef}>
      <List animatedLayout={animatedLayout}>
        {rows.map(label => (
          <ListItem key={label} itemKey={label} label={label} />
        ))}
        <ListItem key="note" label="Note" />
      </List>
    </div>
  );
}

async function change(rows: string[]) {
  act(() => setRows(rows));
  await flushMicrotasks();
}

describe('List row updates through animatedLayout (component:List FR12)', () => {
  it('inserting a row at the top: the old first row and every row after it glide down from their old places, the content after the list too, and the new row enters', async () => {
    render(<Demo initial={['Inbox', 'Sent', 'Drafts']} />);
    await change(['New', 'Inbox', 'Sent', 'Drafts']);
    const moved = glides();
    expect(moved.get('Inbox')).toBe(-ROW);
    expect(moved.get('Sent')).toBe(-ROW);
    expect(moved.get('Drafts')).toBe(-ROW);
    expect(moved.get('after')).toBe(-ROW);
    expect(moved.has('New')).toBe(false);
    expect(entrances()).toEqual(['New']);
  });

  it('moving the last row first: it glides up from its old place riding above the rows it crosses, and they glide down', async () => {
    render(<Demo initial={['Inbox', 'Sent', 'Drafts']} />);
    await change(['Drafts', 'Inbox', 'Sent']);
    const moved = glides();
    expect(moved.get('Drafts')).toBe(2 * ROW);
    expect(moved.get('Inbox')).toBe(-ROW);
    expect(moved.get('Sent')).toBe(-ROW);
    // Nothing after the list moved: its height is the same.
    expect(moved.has('after')).toBe(false);
    const drafts = [...document.querySelectorAll('li')].find(
      row => row.textContent?.trim() === 'Drafts',
    );
    expect(drafts).toHaveAttribute(TRAVELLING_ATTRIBUTE);
    expect(entrances()).toEqual([]);
  });

  it('removing a row: it comes back where it was, inert and hidden from assistive technology, while the rows after it and the content after the list glide up into its place', async () => {
    render(<Demo initial={['Inbox', 'Sent', 'Drafts']} />);
    await change(['Inbox', 'Drafts']);
    const leaving = [...document.querySelectorAll('li')].find(
      row => row.textContent?.trim() === 'Sent',
    );
    expect(leaving).toBeDefined();
    expect(leaving).toHaveAttribute('inert');
    expect(leaving).toHaveAttribute('aria-hidden', 'true');
    // It conceals on the shared motion.
    expect(
      played.some(
        entry => entry.element === leaving && entry.keyframes[0]?.clipPath,
      ),
    ).toBe(true);
    const moved = glides();
    expect(moved.get('Drafts')).toBe(ROW);
    expect(moved.get('after')).toBe(ROW);
    expect(moved.has('Inbox')).toBe(false);
  });

  it("keeps a caller's inline overflow-y, while a removal exits and after it", async () => {
    render(
      <Demo
        initial={['Inbox', 'Sent', 'Drafts']}
        listStyle={{overflowY: 'auto'}}
      />,
    );
    const list = () => document.querySelector('ul') as HTMLElement;
    expect(list().style.overflowY).toBe('auto');
    await change(['Inbox', 'Drafts']);
    // The removed row's exit is under way.
    expect(document.querySelector('li[data-astryx-leaving]')).not.toBeNull();
    expect(list().style.overflowY).toBe('auto');
    await change(['New', 'Inbox', 'Drafts']);
    expect(list().style.overflowY).toBe('auto');
  });

  it("puts the handle in List's context for its rows", () => {
    let seen: unknown = 'unset';
    function Probe() {
      seen = use(ListContext)?.animatedLayout;
      return null;
    }
    let handle: unknown = null;
    function WithHandle() {
      const containerRef = useRef<HTMLDivElement>(null);
      const animatedLayout = useAnimatedLayout({containerRef});
      handle = animatedLayout;
      return (
        <div ref={containerRef}>
          <List animatedLayout={animatedLayout}>
            <Probe />
          </List>
        </div>
      );
    }
    render(<WithHandle />);
    expect(handle).not.toBeNull();
    expect(seen).toBe(handle);
    render(
      <List>
        <Probe />
      </List>,
    );
    expect(seen).toBeUndefined();
  });

  it('removing two adjacent rows: both come back in their places, in order', async () => {
    render(<Demo initial={['Inbox', 'Sent', 'Drafts', 'Archive']} />);
    await change(['Inbox', 'Archive']);
    expect(
      [...document.querySelectorAll('li')].map(row => row.textContent?.trim()),
    ).toEqual(['Inbox', 'Sent', 'Drafts', 'Archive']);
    expect(
      [...document.querySelectorAll('li[data-astryx-leaving]')].map(row =>
        row.textContent?.trim(),
      ),
    ).toEqual(['Sent', 'Drafts']);
  });

  it('measuring a change keeps no list of the later rows per row: linear work in the row count', async () => {
    const labels = Array.from({length: 300}, (_, i) => `Row ${i}`);
    render(<Demo initial={labels} />);
    // Copies of a 300-row list made while the change is measured and played.
    const copies: number[] = [];
    const slice = Array.prototype.slice;
    const spy = vi.spyOn(Array.prototype, 'slice').mockImplementation(function (
      this: unknown[],
      ...args
    ) {
      if (this.length === labels.length) {
        copies.push(this.length);
      }
      return slice.apply(this, args);
    });
    try {
      await change(['New', ...labels]);
    } finally {
      spy.mockRestore();
    }
    expect(copies.length).toBeLessThan(3);
  });

  describe('a long list (`architecture:react-component-runtime` INV12)', () => {
    /** The places of rows read for one insert near the top of `length` rows. */
    async function rowReads(length: number): Promise<number> {
      const labels = Array.from({length}, (_, index) => `Row ${index}`);
      const {unmount} = render(<Demo initial={labels} />);
      let reads = 0;
      const stub = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function (this: Element) {
        if (this.tagName === 'LI') {
          reads += 1;
        }
        return stub.call(this);
      };
      try {
        await change([labels[0], 'New', ...labels.slice(1)]);
      } finally {
        Element.prototype.getBoundingClientRect = stub;
      }
      unmount();
      return reads;
    }

    it('one update reads the places of the rows near the visible part only: as many for 300 rows as for 150', async () => {
      const short = await rowReads(150);
      const long = await rowReads(300);
      expect(short).toBeLessThan(300);
      expect(long - short).toBeLessThan(20);
    });

    it('the rows in view below an insert glide from their old places; a row far below does not move', async () => {
      const labels = Array.from({length: 300}, (_, index) => `Row ${index}`);
      render(<Demo initial={labels} />);
      await change([labels[0], 'New', ...labels.slice(1)]);
      const moved = glides();
      expect(moved.get('Row 1')).toBe(-ROW);
      expect(moved.get('Row 10')).toBe(-ROW);
      expect(moved.has('Row 200')).toBe(false);
      expect(entrances()).toEqual(['New']);
    });

    it('a removal near the top finds the rows that cross in one pass, not by comparing every moved row with every other', async () => {
      const labels = Array.from({length: 300}, (_, index) => `Row ${index}`);
      render(<Demo initial={labels} />);
      // Every check a predicate makes while the change is played.
      let checks = 0;
      const some = Array.prototype.some;
      vi.spyOn(Array.prototype, 'some').mockImplementation(function (
        this: unknown[],
        predicate,
        thisArg,
      ) {
        return some.call(
          this,
          (...args): boolean => {
            checks += 1;
            return Boolean(predicate.apply(thisArg, args));
          },
          thisArg,
        );
      });
      await change(labels.filter(label => label !== 'Row 1'));
      vi.restoreAllMocks();
      expect(checks).toBeLessThan(labels.length);
    });
  });

  it('a re-render with the same rows in the same order plays nothing', async () => {
    render(<Demo initial={['Inbox', 'Sent']} />);
    await change(['Inbox', 'Sent']);
    expect(played).toEqual([]);
  });

  it('without a handle, the list changes at once', async () => {
    render(<Demo initial={['Inbox', 'Sent', 'Drafts']} withHandle={false} />);
    await change(['New', 'Inbox', 'Sent', 'Drafts']);
    expect(played).toEqual([]);
  });

  it('a row without an itemKey changes at once: its insertion plays no entrance and reports nothing', async () => {
    render(<Demo initial={['Inbox', 'Sent', 'Drafts']} keyed={false} />);
    await change(['New', 'Inbox', 'Sent', 'Drafts']);
    expect(played).toEqual([]);
  });

  it('beside rows without one, a keyed row still enters and the rows after it glide', async () => {
    render(<Mixed initial={['Inbox', 'Sent']} />);
    await change(['Inbox', 'New', 'Sent']);
    expect(entrances()).toEqual(['New']);
    const moved = glides();
    // The unkeyed row after it is content like any other: it glides.
    expect(moved.get('Sent')).toBe(-ROW);
    expect(moved.get('Note')).toBe(-ROW);
  });
});

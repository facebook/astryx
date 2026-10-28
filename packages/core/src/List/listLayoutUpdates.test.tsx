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
  const rows = [...list.children];
  const height = rows.reduce((sum, row) => sum + takes(row), 0);
  if (element === list) {
    return new DOMRect(0, 0, 400, height);
  }
  if (element.parentElement === list) {
    const index = rows.indexOf(element);
    const top = rows.slice(0, index).reduce((sum, row) => sum + takes(row), 0);
    return new DOMRect(0, top, 400, ROW);
  }
  if (element.id === 'after') {
    return new DOMRect(0, height, 400, ROW);
  }
  return new DOMRect(0, 0, 0, 0);
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

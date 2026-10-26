// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useListUpdateMotion.test.tsx
 * @input vitest, List with `hasAnimatedChanges`, a stubbed pointer (a finger,
 *   iOS and Android alike, or a mouse) and stubbed row positions
 *   (jsdom lays nothing out)
 * @output Unit tests for when List's update motion moves rows: survivors whose
 *   place changed get a motion under any finger; a removed row collapses in
 *   place as a ghost, the row below glued to its edge; a new row shows nothing
 *   until the row it displaced has cleared its band; a row crossing rows
 *   that move the other way rides above them; nothing moves with a mouse,
 *   without `hasAnimatedChanges`,
 *   on the first render, or
 *   while a reorder session owns the list; content after the list is never
 *   moved, and a list that got shorter clips its rows to its box while they
 *   move; with
 *   motion off nothing is read; a resize of the list between commits
 *   refreshes where its rows are
 * @position Beside List/useListUpdateMotion.ts; the motion itself is proven
 *   in a real engine by List/__tests__/ListUpdates.interaction.browser.spec.ts
 */

import {act, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {List} from './List';
import {ListItem} from './ListItem';
import {
  motionNow,
  motionOf,
  presentation,
  type RowMotion,
} from '../utils/rowMotion';

const ROW = 40;
/** Each row's height as the stubbed layout reports it. */
let rowHeight = ROW;

beforeAll(() => {
  // jsdom lays nothing out: place each list row by its index.
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
      // Content below the list sits under its rows; a pinned footer never
      // moves.
      if (this.hasAttribute('data-pinned')) {
        return 500;
      }
      if (this.dataset.testid === 'below') {
        return (
          document.querySelectorAll('ul > li:not([data-astryx-leaving])')
            .length * rowHeight
        );
      }
      const parent = this.parentElement;
      if (this.tagName !== 'LI' || parent == null) {
        return 0;
      }
      // A removed row's ghost is out of flow: it takes no place.
      return (
        Array.from(parent.children)
          .filter(child => !child.hasAttribute('data-astryx-leaving'))
          .indexOf(this) * rowHeight
      );
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.tagName === 'LI' ? rowHeight : 0;
    },
  });
});

/**
 * The page under a finger (a coarse primary pointer: one touch model, iOS
 * and Android alike) or a mouse.
 */
function stubPointer(pointer: 'touch' | 'mouse') {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: pointer === 'touch' && query.includes('pointer: coarse'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  rowHeight = ROW;
});

function Rows({
  labels,
  hasAnimatedChanges = true,
}: {
  labels: string[];
  hasAnimatedChanges?: boolean;
}) {
  return (
    <div>
      <List hasAnimatedChanges={hasAnimatedChanges}>
        {labels.map(label => (
          <ListItem key={label} label={label} />
        ))}
      </List>
      <p data-testid="below">Below the list</p>
      <p data-testid="pinned" data-pinned="">
        A footer layout does not move
      </p>
    </div>
  );
}

const rowOf = (label: string) =>
  Array.from(document.querySelectorAll('li')).find(
    li => li.textContent === label,
  ) as HTMLElement;

describe('List update motion', () => {
  it('under a finger, rows that change place move and new rows fade in', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    expect(motionOf(rowOf('C'))).toBeUndefined();
    // Remove B: C moves up one row; A stays.
    rerender(<Rows labels={['A', 'C']} />);
    expect(motionOf(rowOf('C'))).toBeDefined();
    expect(motionOf(rowOf('A'))).toBeUndefined();
    // Insert D first: everything below moves down, D fades in.
    rerender(<Rows labels={['D', 'A', 'C']} />);
    expect(motionOf(rowOf('D'), 'opacity')).toBeDefined();
    expect(motionOf(rowOf('A'))).toBeDefined();
  });

  it('a new row shows nothing while the row it displaced still crosses its band, then fades in, arriving with it', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'C']} />);
    await act(async () => undefined);
    // Insert B second: C slides down out of B's band.
    rerender(<Rows labels={['A', 'B', 'C']} />);
    const inserted = rowOf('B');
    const displaced = rowOf('C');
    expect(motionOf(inserted, 'opacity')).toBeDefined();
    // Sampled from the one start the browser gives the commit's motions
    // (calls from rest start when it commits them), never from a clock read
    // after the rerender, which a busy runner moves.
    const at = await (motionOf(displaced, 'y') as RowMotion).handle.started;
    let crossing = 0;
    let previous = 0;
    for (let t = 0; t <= 600; t += 5) {
      const y = presentation(displaced, 'y', at + t);
      const shown = presentation(inserted, 'opacity', at + t);
      // C's label within half a row of B's: B shows nothing (the labels
      // would overlap; rows have no background to hide one).
      if (y < -ROW / 2 - 0.01) {
        expect(shown, `t=${t}`).toBe(0);
        crossing += 1;
      }
      expect(shown, `t=${t}`).toBeGreaterThanOrEqual(previous);
      previous = shown;
    }
    expect(crossing).toBeGreaterThan(3);
    expect(presentation(inserted, 'opacity', at + 600)).toBe(1);
  });

  it('a removed row collapses in place, the row below glued to its bottom edge, then goes', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    const removed = rowOf('B');
    // One instant for the whole commit, as a browser's frame gives every
    // motion started in it (here each would start when it is created).
    const at = motionNow();
    const clock = vi.spyOn(performance, 'now').mockReturnValue(at);
    rerender(<Rows labels={['A', 'C']} />);
    clock.mockRestore();
    // B is back for its exit, in a ghost hidden from assistive tech, at its
    // old place.
    expect(removed.isConnected).toBe(true);
    const ghost = removed.parentElement as HTMLElement;
    expect(ghost.hasAttribute('data-astryx-leaving')).toBe(true);
    expect(ghost.getAttribute('aria-hidden')).toBe('true');
    expect(ghost.inert).toBe(true);
    expect(ghost.nextElementSibling).toBe(rowOf('C'));
    const next = rowOf('C');
    for (let t = 0; t <= 600; t += 10) {
      const ghostY = presentation(ghost, 'y', at + t);
      // B's content stays where it was while the clip closes over it.
      expect(ghostY + presentation(removed, 'y', at + t), `t=${t}`).toBeCloseTo(
        0,
        6,
      );
      // The clip's bottom edge (B's old top + its height + the ghost's
      // offset) is C's top (its new place + its offset), every frame.
      expect(ROW + ROW + ghostY, `t=${t}`).toBeCloseTo(
        ROW + presentation(next, 'y', at + t),
        6,
      );
    }
    expect(presentation(ghost, 'y', at + 600)).toBeCloseTo(-ROW, 1);
    // Gone once it rests.
    await vi.waitFor(() => expect(ghost.isConnected).toBe(false), {
      timeout: 3000,
    });
  });

  it('a removed row collapses on the table spring and stays exactly as long as its collapse, whatever a theme writes', async () => {
    stubPointer('touch');
    // The table spring is an internal constant: a variable written the way a
    // theme would write one (1.5 s, on the root, which a theme switch brings
    // in) changes nothing.
    document.documentElement.style.setProperty(
      '--motion-list-update-table-spring',
      '1.5s 0',
    );
    document.documentElement.setAttribute('data-theme', 'slow-table');
    try {
      const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
      await act(async () => undefined);
      const removed = rowOf('B');
      const at = motionNow();
      const clock = vi.spyOn(performance, 'now').mockReturnValue(at);
      rerender(<Rows labels={['A', 'C']} />);
      clock.mockRestore();
      const ghost = removed.parentElement as HTMLElement;
      expect(ghost.hasAttribute('data-astryx-leaving')).toBe(true);
      const collapse = motionOf(ghost, 'y') as RowMotion;
      expect(collapse).toBeDefined();
      // Closed where the table's spring arrives, where the theme's 1.5 s
      // spring would still be on its way.
      expect(presentation(ghost, 'y', at + 600)).toBeCloseTo(-ROW, 1);
      // Gone when the collapse ends, with nothing left behind.
      await collapse.handle.finished;
      await Promise.resolve();
      expect(ghost.isConnected).toBe(false);
    } finally {
      document.documentElement.style.removeProperty(
        '--motion-list-update-table-spring',
      );
      document.documentElement.removeAttribute('data-theme');
    }
  });

  it('a removed row leaves in the same commit that turns the motion off', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    const removed = rowOf('B');
    rerender(<Rows labels={['A', 'C']} />);
    const ghost = removed.parentElement as HTMLElement;
    expect(ghost.hasAttribute('data-astryx-leaving')).toBe(true);
    rerender(<Rows labels={['A', 'C']} hasAnimatedChanges={false} />);
    expect(ghost.isConnected).toBe(false);
    expect(motionOf(ghost, 'y')).toBeUndefined();
  });

  it('on the default table spring a removed row leaves within a second (INV7)', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    const removed = rowOf('B');
    rerender(<Rows labels={['A', 'C']} />);
    const ghost = removed.parentElement as HTMLElement;
    expect(ghost.hasAttribute('data-astryx-leaving')).toBe(true);
    await vi.waitFor(() => expect(ghost.isConnected).toBe(false), {
      timeout: 1000,
    });
  });

  it('a row that slides across rows moving the other way rides above them for its slide', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'B', 'C', 'D']} />);
    await act(async () => undefined);
    const rides = (label: string) =>
      rowOf(label).hasAttribute('data-astryx-travelling');
    // D moves first: it crosses A, B and C, which each move down one row.
    rerender(<Rows labels={['D', 'A', 'B', 'C']} />);
    expect(rides('D')).toBe(true);
    expect(['A', 'B', 'C'].filter(rides)).toEqual([]);
    // Once its slide rests, it rides with the others again.
    await vi.waitFor(() => expect(motionOf(rowOf('D'))).toBeUndefined(), {
      timeout: 3000,
    });
    expect(rides('D')).toBe(false);
    // A removal moves every row the same way: nothing crosses, nothing rides.
    rerender(<Rows labels={['D', 'B', 'C']} />);
    expect(motionOf(rowOf('B'))).toBeDefined();
    expect(['D', 'B', 'C'].filter(rides)).toEqual([]);
  });

  it('reads no layout at all without hasAnimatedChanges', async () => {
    stubPointer('touch');
    const reads = vi.fn();
    const top = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetTop',
    );
    Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
      configurable: true,
      get(this: HTMLElement) {
        reads();
        return top?.get?.call(this) as number;
      },
    });
    const off = render(
      <Rows labels={['A', 'B', 'C']} hasAnimatedChanges={false} />,
    );
    await act(async () => undefined);
    off.rerender(<Rows labels={['A', 'C']} hasAnimatedChanges={false} />);
    expect(reads).not.toHaveBeenCalled();
    if (top != null) {
      Object.defineProperty(HTMLElement.prototype, 'offsetTop', top);
    }
  });

  it('never moves the content after the list: it takes its place by layout', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    rerender(<Rows labels={['A', 'C']} />);
    const below = screen.getByTestId('below');
    expect(motionOf(below)).toBeUndefined();
    expect(below.style.translate).toBe('');
    // The rows inside the list still move.
    expect(motionOf(rowOf('C'))).toBeDefined();
  });

  it('moves nothing with a mouse, or without hasAnimatedChanges', async () => {
    stubPointer('mouse');
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    const first = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    first.rerender(<Rows labels={['A', 'C']} />);
    expect(motionOf(rowOf('C'))).toBeUndefined();
    first.rerender(<Rows labels={['D', 'A', 'C']} />);
    expect(motionOf(rowOf('D'), 'opacity')).toBeUndefined();
    expect(motionOf(screen.getByTestId('below'))).toBeUndefined();
    first.unmount();

    stubPointer('touch');
    const second = render(
      <Rows labels={['A', 'B', 'C']} hasAnimatedChanges={false} />,
    );
    await act(async () => undefined);
    second.rerender(<Rows labels={['A', 'C']} hasAnimatedChanges={false} />);
    expect(motionOf(rowOf('C'))).toBeUndefined();
  });

  it('clips its rows to its box while they move after it gets shorter, and only then', async () => {
    stubPointer('touch');
    // jsdom lays nothing out: the list is as tall as its rows.
    const height = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'UL') {
          return (
            this.querySelectorAll(':scope > li:not([data-astryx-leaving])')
              .length * ROW
          );
        }
        return this.tagName === 'LI' ? ROW : 0;
      });
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    const list = document.querySelector('ul') as HTMLElement;
    // Taller: nothing to clip.
    rerender(<Rows labels={['A', 'B', 'C', 'D']} />);
    expect(list.style.overflowY).toBe('');
    // Shorter: its rows are clipped to its box while they move, not after.
    rerender(<Rows labels={['A', 'C', 'D']} />);
    expect(list.style.overflowY).toBe('clip');
    await waitFor(() => expect(list.style.overflowY).toBe(''), {
      timeout: 3000,
    });
    height.mockRestore();
  });

  it('reads the rows again when the list resizes between commits, so an update starts each row where it was', async () => {
    // The browser's resize notifications, delivered when the test says.
    let notify = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        targets: Element[] = [];
        constructor(callback: ResizeObserverCallback) {
          notify = () =>
            callback(
              this.targets.map(target => ({target}) as ResizeObserverEntry),
              this,
            );
        }
        observe(target: Element) {
          this.targets.push(target);
        }
        unobserve(target: Element) {
          this.targets = this.targets.filter(other => other !== target);
        }
        disconnect() {
          this.targets = [];
        }
      },
    );
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    // Every row grows with no commit (a stylesheet, a web font): the list
    // resizes.
    rowHeight = 52;
    notify();
    // Read at the commit's own instant (the removal's exit takes a moment).
    const now = motionNow();
    const clock = vi.spyOn(performance, 'now').mockReturnValue(now);
    rerender(<Rows labels={['A', 'C']} />);
    // C sat two 52 px rows down and now sits one down: it starts 52 px below
    // its new place, not the 28 px the first commit's layout would say.
    expect(presentation(rowOf('C'), 'y', now)).toBeCloseTo(52, 0);
    clock.mockRestore();
  });

  it('leaves a list a reorder session owns to the reorder', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    document.querySelector('ul')?.setAttribute('data-astryx-reordering', '');
    rerender(<Rows labels={['C', 'A', 'B']} />);
    expect(motionOf(rowOf('C'))).toBeUndefined();
    expect(motionOf(rowOf('A'))).toBeUndefined();
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useListUpdateMotion.test.tsx
 * @input vitest, List with `hasAnimatedChanges`, a stubbed idiom (a finger on
 *   WebKit for iOS, an Android finger, a mouse) and stubbed row positions
 *   (jsdom lays nothing out)
 * @output Unit tests for when List's update motion moves rows: survivors whose
 *   place changed get a motion in the iOS idiom; a removed row collapses in
 *   place as a ghost, the row below glued to its edge; a new row shows nothing
 *   until the row it displaced has cleared its band; a row crossing rows
 *   that move the other way rides above them; nothing moves with an Android
 *   finger or a mouse, without `hasAnimatedChanges`, on the first render, or
 *   while a reorder session owns the list; content below the list moves with
 *   it unless the list keeps it still; a resize of the list between commits
 *   refreshes where its rows are
 * @position Beside utils/useListUpdateMotion.ts; the motion itself is proven
 *   in a real engine by List/__tests__/ListUpdates.interaction.browser.spec.ts
 */

import {act, render, screen} from '@testing-library/react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {List, ListItem} from '../List';
import {motionNow, motionOf, presentation, type RowMotion} from './rowMotion';

const ROW = 40;
/** Each row's height as the stubbed layout reports it. */
let rowHeight = ROW;

beforeAll(() => {
  // jsdom lays nothing out: place each list row by its index.
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
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

/** The page as a finger on WebKit for iOS (`ios`) or anywhere else sees it. */
function stubIdiom(idiom: 'ios' | 'android' | 'mouse') {
  vi.stubGlobal('CSS', {
    supports: (condition: string) =>
      idiom === 'ios' && condition.includes('-webkit-touch-callout'),
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: idiom !== 'mouse' && query.includes('pointer: coarse'),
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
  followingContent,
}: {
  labels: string[];
  hasAnimatedChanges?: boolean;
  followingContent?: 'moves' | 'stays';
}) {
  return (
    <div>
      <List
        hasAnimatedChanges={hasAnimatedChanges}
        followingContent={followingContent}>
        {labels.map(label => (
          <ListItem key={label} label={label} />
        ))}
      </List>
      <p data-testid="below">Below the list</p>
    </div>
  );
}

const rowOf = (label: string) =>
  Array.from(document.querySelectorAll('li')).find(
    li => li.textContent === label,
  ) as HTMLElement;

describe('List update motion', () => {
  it('in the iOS idiom, rows that change place move and new rows fade in', async () => {
    stubIdiom('ios');
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
    stubIdiom('ios');
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
    stubIdiom('ios');
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

  it('a row that slides across rows moving the other way rides above them for its slide', async () => {
    stubIdiom('ios');
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

  it('moves nothing with an Android finger or a mouse, or without hasAnimatedChanges', async () => {
    for (const idiom of ['android', 'mouse'] as const) {
      stubIdiom(idiom);
      const first = render(<Rows labels={['A', 'B', 'C']} />);
      await act(async () => undefined);
      first.rerender(<Rows labels={['A', 'C']} />);
      expect(motionOf(rowOf('C'))).toBeUndefined();
      first.rerender(<Rows labels={['D', 'A', 'C']} />);
      expect(motionOf(rowOf('D'), 'opacity')).toBeUndefined();
      expect(motionOf(screen.getByTestId('below'))).toBeUndefined();
      first.unmount();
    }

    stubIdiom('ios');
    const second = render(
      <Rows labels={['A', 'B', 'C']} hasAnimatedChanges={false} />,
    );
    await act(async () => undefined);
    second.rerender(<Rows labels={['A', 'C']} hasAnimatedChanges={false} />);
    expect(motionOf(rowOf('C'))).toBeUndefined();
  });

  it("moves the content below with the rows, unless followingContent is 'stays'", async () => {
    stubIdiom('ios');
    // jsdom lays nothing out: the list is as tall as its rows.
    const height = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.tagName === 'UL' ? this.children.length * ROW : 0;
      });
    const moves = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    moves.rerender(<Rows labels={['A', 'C']} />);
    expect(motionOf(screen.getByTestId('below'))).toBeDefined();
    moves.unmount();

    const stays = render(
      <Rows labels={['A', 'B', 'C']} followingContent="stays" />,
    );
    await act(async () => undefined);
    stays.rerender(<Rows labels={['A', 'C']} followingContent="stays" />);
    expect(motionOf(screen.getByTestId('below'))).toBeUndefined();
    // The rows inside the list still move.
    expect(motionOf(rowOf('C'))).toBeDefined();
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
    stubIdiom('ios');
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
    stubIdiom('ios');
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    document.querySelector('ul')?.setAttribute('data-astryx-reordering', '');
    rerender(<Rows labels={['C', 'A', 'B']} />);
    expect(motionOf(rowOf('C'))).toBeUndefined();
    expect(motionOf(rowOf('A'))).toBeUndefined();
  });
});

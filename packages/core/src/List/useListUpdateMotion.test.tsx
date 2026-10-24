// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useListUpdateMotion.test.tsx
 * @input vitest, List with `hasAnimatedChanges`, a stubbed idiom (a finger on
 *   WebKit for iOS, an Android finger, a mouse) and stubbed row positions
 *   (jsdom lays nothing out)
 * @output Unit tests for when List's update motion moves rows: survivors whose
 *   place changed get a motion in the iOS idiom; nothing moves with an Android
 *   finger or a mouse, without `hasAnimatedChanges`, on the first render, or
 *   while a reorder session owns the list; content below the list moves with
 *   it unless the list keeps it still; a resize of the list between commits
 *   refreshes where its rows are
 * @position Beside List/useListUpdateMotion.ts; the motion itself is proven
 *   in a real engine by List/__tests__/ListUpdates.interaction.browser.spec.ts
 */

import {act, render, screen} from '@testing-library/react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {List} from './List';
import {ListItem} from './ListItem';
import {motionNow, motionOf, presentation} from '../utils/rowMotion';

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
      return Array.from(parent.children).indexOf(this) * rowHeight;
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
    rerender(<Rows labels={['A', 'C']} />);
    // C sat two 52 px rows down and now sits one down: it starts 52 px below
    // its new place, not the 28 px the first commit's layout would say.
    expect(presentation(rowOf('C'), 'y', motionNow())).toBeCloseTo(52, 0);
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

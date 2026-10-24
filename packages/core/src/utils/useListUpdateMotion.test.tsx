// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useListUpdateMotion.test.tsx
 * @input vitest, List with `hasAnimatedChanges`, a stubbed primary pointer and
 *   stubbed row positions (jsdom lays nothing out)
 * @output Unit tests for when List's update motion moves rows: survivors whose
 *   place changed get a motion on a touch screen; nothing moves with a mouse,
 *   without `hasAnimatedChanges`, on the first render, or while a reorder session
 *   owns the list; content below the list moves with it unless the list
 *   keeps it still
 * @position Beside utils/useListUpdateMotion.ts; the motion itself is proven
 *   in a real engine by List/__tests__/ListUpdates.interaction.browser.spec.ts
 */

import {act, render, screen} from '@testing-library/react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {List, ListItem} from '../List';
import {motionOf} from './rowMotion';

const ROW = 40;

beforeAll(() => {
  // jsdom lays nothing out: place each list row by its index.
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
      const parent = this.parentElement;
      if (this.tagName !== 'LI' || parent == null) {
        return 0;
      }
      return Array.from(parent.children).indexOf(this) * ROW;
    },
  });
});

function stubPointer(coarse: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: coarse && query.includes('pointer: coarse'),
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
  it('on a touch screen, rows that change place move and new rows fade in', async () => {
    stubPointer(true);
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

  it('moves nothing with a mouse, or without hasAnimatedChanges', async () => {
    stubPointer(false);
    const first = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    first.rerender(<Rows labels={['A', 'C']} />);
    expect(motionOf(rowOf('C'))).toBeUndefined();
    first.unmount();

    stubPointer(true);
    const second = render(
      <Rows labels={['A', 'B', 'C']} hasAnimatedChanges={false} />,
    );
    await act(async () => undefined);
    second.rerender(<Rows labels={['A', 'C']} hasAnimatedChanges={false} />);
    expect(motionOf(rowOf('C'))).toBeUndefined();
  });

  it("moves the content below with the rows, unless followingContent is 'stays'", async () => {
    stubPointer(true);
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

  it('leaves a list a reorder session owns to the reorder', async () => {
    stubPointer(true);
    const {rerender} = render(<Rows labels={['A', 'B', 'C']} />);
    await act(async () => undefined);
    document.querySelector('ul')?.setAttribute('data-astryx-reordering', '');
    rerender(<Rows labels={['C', 'A', 'B']} />);
    expect(motionOf(rowOf('C'))).toBeUndefined();
    expect(motionOf(rowOf('A'))).toBeUndefined();
  });
});

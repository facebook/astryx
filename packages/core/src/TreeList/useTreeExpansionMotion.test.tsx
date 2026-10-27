// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTreeExpansionMotion.test.tsx
 * @input vitest, TreeList, a stubbed pointer (a finger, iOS and Android
 *   alike, or a mouse)
 * @output Unit tests for the expansion's presence rules: with a mouse a
 *   collapse removes the children at once; under any finger (iOS and Android
 *   alike) they stay, inert and out of the arrow keys' reach, until they have
 *   slid away, and an expand that interrupts the collapse keeps them; with no
 *   animated layout handle nothing outside the group moves, neither the rows
 *   after it in the tree nor the page content after the tree (both take their
 *   places by layout, `spec:AST-105` FR2); the group's rows release their
 *   translate at their own arrival and are left at rest when the tree
 *   unmounts mid-collapse
 * @position Beside TreeList/useTreeExpansionMotion.ts; the motion itself is
 *   proven in a real engine by
 *   TreeList/__tests__/TreeListExpand.interaction.browser.spec.ts
 */

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {TreeList} from './TreeList';
import type {TreeListItemData} from './TreeListTypes';
import {motionOf} from '../utils/rowMotion';

/** Each group's height in the stubbed layout. */
const GROUP_HEIGHT = 40;

/**
 * jsdom lays nothing out: an element sits one group's height lower for each
 * laid-out group before it in the document (`pinned` elements never move,
 * like a footer held at the bottom of its column).
 */
function stubLayout() {
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(
    function (this: HTMLElement) {
      if (this.hasAttribute('data-pinned')) {
        return 500;
      }
      let top = 0;
      for (const laid of document.querySelectorAll<HTMLElement>(
        '[role="group"]',
      )) {
        if (
          laid.style.display !== 'none' &&
          !laid.contains(this) &&
          (laid.compareDocumentPosition(this) &
            Node.DOCUMENT_POSITION_FOLLOWING) !==
            0
        ) {
          top += GROUP_HEIGHT;
        }
      }
      return top;
    },
  );
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.getAttribute('role') === 'group' ? GROUP_HEIGHT : 0;
    },
  );
}

const items: TreeListItemData[] = [
  {
    id: 'components',
    label: 'components',
    isExpanded: true,
    children: [
      {id: 'button', label: 'Button.tsx'},
      {id: 'card', label: 'Card.tsx'},
    ],
  },
  {id: 'app', label: 'App.tsx'},
];

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
  vi.restoreAllMocks();
});

const row = (id: string) =>
  document.querySelector<HTMLElement>(`[data-tree-id="${id}"]`);
const group = () =>
  row('components')?.querySelector<HTMLElement>(':scope > [role="group"]') ??
  null;
const toggle = () =>
  row('components')?.querySelector<HTMLElement>(
    ':scope > :not([role="group"]) [data-tree-toggle]',
  ) ?? null;

describe('TreeList expansion presence', () => {
  it('with a mouse, a collapse removes the children at once', () => {
    stubPointer('mouse');
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    render(<TreeList items={items} />);
    expect(group()).not.toBeNull();
    fireEvent.click(toggle() as HTMLElement);
    expect(group()).toBeNull();
  });

  it('under a finger, the children stay, inert and skipped by the arrow keys, until they have slid away', async () => {
    stubPointer('touch');
    render(<TreeList items={items} />);
    // Let the touch presentation settle after mount.
    await act(async () => undefined);
    fireEvent.click(toggle() as HTMLElement);
    expect(row('components')).toHaveAttribute('aria-expanded', 'false');
    // Still rendered while it slides away, but inert.
    expect(group()).not.toBeNull();
    expect(group()).toHaveAttribute('inert');
    // The arrow keys roam as if the children were already gone.
    const components = row('components') as HTMLElement;
    components.focus();
    fireEvent.keyDown(components, {key: 'ArrowDown'});
    expect(document.activeElement).toBe(row('app'));
    // Gone once the motion settles.
    await waitFor(() => expect(group()).toBeNull(), {timeout: 2000});
  });

  it('under a finger, an expand that interrupts the collapse keeps the children', async () => {
    stubPointer('touch');
    render(<TreeList items={items} />);
    await act(async () => undefined);
    const before = group();
    fireEvent.click(toggle() as HTMLElement);
    fireEvent.click(toggle() as HTMLElement);
    expect(row('components')).toHaveAttribute('aria-expanded', 'true');
    // The same group, never removed, and in reach again.
    expect(group()).toBe(before);
    expect(group()).not.toHaveAttribute('inert');
    await new Promise(resolve => setTimeout(resolve, 800));
    expect(group()).toBe(before);
    expect(screen.getByText('Card.tsx')).toBeInTheDocument();
  });
});

describe('content after the tree', () => {
  const collapsed: TreeListItemData[] = [
    {
      id: 'components',
      label: 'components',
      children: [{id: 'button', label: 'Button.tsx'}],
    },
    {id: 'app', label: 'App.tsx'},
  ];

  function Page() {
    return (
      <div>
        <TreeList items={collapsed} />
        <p data-testid="below">Below the tree</p>
      </div>
    );
  }

  it('is never moved by an expansion, nor are the rows after the group: they take their places by layout', async () => {
    stubPointer('touch');
    stubLayout();
    render(<Page />);
    await act(async () => undefined);
    fireEvent.click(toggle() as HTMLElement);
    const below = screen.getByTestId('below');
    expect(motionOf(below)).toBeUndefined();
    expect(below.style.translate).toBe('');
    // With no animated layout handle the row after the group takes its new
    // place at once (`spec:AST-105` FR2); only the group's own rows move.
    const app = row('app') as HTMLElement;
    expect(motionOf(app)).toBeUndefined();
    expect(app.style.translate).toBe('');
    expect(motionOf(row('button') as HTMLElement)).toBeDefined();
  });

  it('is never moved by a collapse either', async () => {
    stubPointer('touch');
    stubLayout();
    render(<Page />);
    await act(async () => undefined);
    fireEvent.click(toggle() as HTMLElement);
    await waitFor(
      () => expect(motionOf(row('button') as HTMLElement)).toBeUndefined(),
      {timeout: 3000},
    );
    fireEvent.click(toggle() as HTMLElement);
    const below = screen.getByTestId('below');
    expect(motionOf(row('button') as HTMLElement)).toBeDefined();
    expect(motionOf(row('app') as HTMLElement)).toBeUndefined();
    expect(motionOf(below)).toBeUndefined();
    expect(below.style.translate).toBe('');
  });

  it("releases each of the group's rows' translate when its own spring arrives", async () => {
    stubPointer('touch');
    stubLayout();
    render(<Page />);
    await act(async () => undefined);
    fireEvent.click(toggle() as HTMLElement);
    const child = row('button') as HTMLElement;
    // Moved: its spring starts when the browser commits it.
    expect(motionOf(child)).toBeDefined();
    await waitFor(() => expect(child.style.translate).toBe(''), {
      timeout: 3000,
    });
  });

  it('leaves nothing moved when the tree unmounts mid-collapse', async () => {
    stubPointer('touch');
    stubLayout();
    const {rerender} = render(<Page />);
    await act(async () => undefined);
    fireEvent.click(toggle() as HTMLElement);
    await waitFor(
      () => expect(motionOf(row('button') as HTMLElement)).toBeUndefined(),
      {timeout: 3000},
    );
    // Collapse, and take the tree away while it runs: the row after the
    // group was never moved, and nothing is left moving.
    fireEvent.click(toggle() as HTMLElement);
    const app = row('app') as HTMLElement;
    const child = row('button') as HTMLElement;
    expect(motionOf(child)).toBeDefined();
    expect(motionOf(app)).toBeUndefined();
    rerender(
      <div>
        <p data-testid="below">Below the tree</p>
      </div>,
    );
    expect(app.style.translate).toBe('');
    expect(motionOf(app)).toBeUndefined();
  });

  it('stays still with a mouse, where nothing moves', async () => {
    stubPointer('mouse');
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    stubLayout();
    render(<Page />);
    await act(async () => undefined);
    fireEvent.click(toggle() as HTMLElement);
    expect(motionOf(screen.getByTestId('below'))).toBeUndefined();
    expect(motionOf(row('app') as HTMLElement)).toBeUndefined();
  });
});

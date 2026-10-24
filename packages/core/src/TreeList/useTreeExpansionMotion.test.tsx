// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTreeExpansionMotion.test.tsx
 * @input vitest, TreeList, a stubbed primary pointer (coarse or fine)
 * @output Unit tests for the expansion's presence rules: with a mouse a
 *   collapse removes the children at once; on a touch screen they stay,
 *   inert and out of the arrow keys' reach, until they have slid away, and an
 *   expand that interrupts the collapse keeps them; page content below the
 *   tree moves with an expansion unless the tree keeps it still
 * @position Beside TreeList/useTreeExpansionMotion.ts; the motion itself is
 *   proven in a real engine by
 *   TreeList/__tests__/TreeListExpand.interaction.browser.spec.ts
 */

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {TreeList} from './TreeList';
import type {TreeListItemData} from './TreeListTypes';
import {motionOf} from '../utils/rowMotion';

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
    stubPointer(false);
    render(<TreeList items={items} />);
    expect(group()).not.toBeNull();
    fireEvent.click(toggle() as HTMLElement);
    expect(group()).toBeNull();
  });

  it('on a touch screen, the children stay, inert and skipped by the arrow keys, until they have slid away', async () => {
    stubPointer(true);
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

  it('on a touch screen, an expand that interrupts the collapse keeps the children', async () => {
    stubPointer(true);
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

describe('content below the tree', () => {
  const collapsed: TreeListItemData[] = [
    {
      id: 'components',
      label: 'components',
      children: [{id: 'button', label: 'Button.tsx'}],
    },
    {id: 'app', label: 'App.tsx'},
  ];

  function Page({followingContent}: {followingContent?: 'moves' | 'stays'}) {
    return (
      <div>
        <TreeList items={collapsed} followingContent={followingContent} />
        <p data-testid="below">Below the tree</p>
      </div>
    );
  }

  it('moves with an expansion on a touch screen', async () => {
    stubPointer(true);
    render(<Page />);
    await act(async () => undefined);
    fireEvent.click(toggle() as HTMLElement);
    expect(motionOf(screen.getByTestId('below'))).toBeDefined();
  });

  it("stays still with followingContent: 'stays'", async () => {
    stubPointer(true);
    render(<Page followingContent="stays" />);
    await act(async () => undefined);
    fireEvent.click(toggle() as HTMLElement);
    expect(motionOf(screen.getByTestId('below'))).toBeUndefined();
    // The rows inside the tree still move.
    expect(motionOf(row('app') as HTMLElement)).toBeDefined();
  });
});

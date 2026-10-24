// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTreeExpansionMotion.test.tsx
 * @input vitest, TreeList, a stubbed primary pointer (coarse or fine)
 * @output Unit tests for the expansion's presence rules: with a mouse a
 *   collapse removes the children at once; on a touch screen they stay,
 *   inert and out of the arrow keys' reach, until they have slid away, and an
 *   expand that interrupts the collapse keeps them
 * @position Beside TreeList/useTreeExpansionMotion.ts; the motion itself is
 *   proven in a real engine by
 *   TreeList/__tests__/TreeListExpand.interaction.browser.spec.ts
 */

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {TreeList} from './TreeList';
import type {TreeListItemData} from './TreeListTypes';

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
  it('with an Android finger, a collapse removes the children at once', () => {
    stubIdiom('android');
    render(<TreeList items={items} />);
    expect(group()).not.toBeNull();
    fireEvent.click(toggle() as HTMLElement);
    expect(group()).toBeNull();
  });

  it('with a mouse, a collapse removes the children at once', () => {
    stubIdiom('mouse');
    render(<TreeList items={items} />);
    expect(group()).not.toBeNull();
    fireEvent.click(toggle() as HTMLElement);
    expect(group()).toBeNull();
  });

  it('in the iOS idiom, the children stay, inert and skipped by the arrow keys, until they have slid away', async () => {
    stubIdiom('ios');
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

  it('in the iOS idiom, an expand that interrupts the collapse keeps the children', async () => {
    stubIdiom('ios');
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

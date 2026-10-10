// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Item.swipeLayer.test.tsx
 * @input Item with and without swipe actions; the swipe layer module, spied
 * @output Verifies a row without swipe actions never renders the swipe layer,
 *   and a row with them renders it into the root once it has loaded
 * @position Companion to Item.test.tsx for the lazily loaded swipe layer
 */

import {createElement, type ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {act, render, screen, waitFor} from '@testing-library/react';
import {Item} from './Item';
import type {ItemSwipeLayerProps} from './ItemSwipeLayer';

const {layerRenders} = vi.hoisted(() => ({layerRenders: vi.fn()}));

vi.mock('./ItemSwipeLayer', async importOriginal => {
  const actual = await importOriginal<{
    default: (props: ItemSwipeLayerProps) => ReactNode;
  }>();
  return {
    ...actual,
    default: (props: ItemSwipeLayerProps) => {
      layerRenders();
      return createElement(actual.default, props);
    },
  };
});

describe('Item and the swipe layer', () => {
  it('renders a row without swipe actions with no swipe layer at all', async () => {
    render(
      <ul>
        <Item
          as="li"
          label="Inbox"
          description="12 unread"
          onClick={() => {}}
        />
        <Item as="li" label="Drafts" href="/drafts" data-testid="row" />
        <Item as="li" label="Archive" />
      </ul>,
    );
    // Let anything the first render scheduled — a lazy chunk resolving, an
    // effect — run before looking.
    await act(async () => {});
    expect(layerRenders).not.toHaveBeenCalled();
    expect(document.querySelector('[data-swipe-panel]')).toBeNull();
    expect(screen.getByTestId('row').childElementCount).toBe(1);
  });

  it('renders the swipe layer into the root of a row with swipe actions', async () => {
    render(
      <Item
        label="Inbox"
        data-testid="row"
        swipeActions={{trailing: [{label: 'Archive', onActivate: () => {}}]}}
      />,
    );
    const row = screen.getByTestId('row');
    const panel = await waitFor(() => {
      const found = row.querySelector('[data-swipe-panel="trailing"]');
      expect(found).not.toBeNull();
      return found;
    });
    expect(layerRenders).toHaveBeenCalled();
    // The layer adds nothing but the panel: the root is still the content
    // followed by the out-of-flow panel, with no wrapper for either.
    expect(panel?.parentElement).toBe(row);
    expect(row.childElementCount).toBe(2);
  });
});

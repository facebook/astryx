// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file attachHintChunk.test.ts
 * @input createReorderable's attach with `react-dom/client` held unloaded
 * @output Proof that attach's keyboard path never waits for the hint's
 *   renderer, which loads when attach runs (spec:AST-103 FR4, FR4b)
 * @position Tests of packages/core/src/reorderable. Its own file: the held
 *   module is mocked for the whole file, and no React testing library is
 *   imported, since that loads `react-dom/client` itself.
 */

import {fireEvent, waitFor} from '@testing-library/dom';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {__resetLiveRegionsForTest} from '../../hooks/useAnnounce';
import {createReorderable} from '../createReorderable';

// The hint's renderer, held until a test releases it.
const chunk = vi.hoisted(() => {
  let release = () => {};
  const held = new Promise<void>(resolve => {
    release = resolve;
  });
  return {held, release: () => release()};
});

vi.mock('react-dom/client', async importOriginal => {
  await chunk.held;
  return importOriginal();
});

/** A container of plain cards, each with its own grip element. */
function deck(names: ReadonlyArray<string>) {
  const container = document.createElement('div');
  document.body.append(container);
  const cards = names.map(name => {
    const el = document.createElement('div');
    el.append(name);
    const grip = document.createElement('span');
    el.append(grip);
    container.append(el);
    return {id: name.toLowerCase(), el, grip};
  });
  const items = () =>
    cards.map(card => ({key: card.id, element: card.el, handle: card.grip}));
  const move = (key: string, to: number) => {
    const from = cards.findIndex(card => card.id === key);
    const [card] = cards.splice(from, 1);
    cards.splice(to, 0, card);
    container.append(...cards.map(each => each.el));
  };
  return {container, cards, items, move};
}

/** The element attach renders reorder mode's hint into, after `container`. */
function hintHostOf(container: HTMLElement): HTMLElement | null {
  const next = container.nextElementSibling;
  return next instanceof HTMLElement &&
    next.hasAttribute('data-astryx-reorder-hint-host')
    ? next
    : null;
}

afterEach(() => {
  __resetLiveRegionsForTest();
});

describe('createReorderable attach before its hint loads', () => {
  it('runs reorder mode from the keyboard while the hint is unloaded, then shows the hint for a mode still on, and renders nothing after detach', async () => {
    const {container, cards, items, move} = deck(['Milk', 'Eggs', 'Bread']);
    const onReorder = vi.fn(({key, to}: {key: string; to: number}) =>
      move(key, to),
    );
    const {detach} = createReorderable<string>({onReorder}).attach(container, {
      items,
    });
    // A second container, detached before the renderer loads.
    const other = deck(['Tea', 'Coffee']);
    const second = createReorderable<string>({onReorder: () => {}}).attach(
      other.container,
      {items: other.items},
    );
    const host = hintHostOf(container);
    const otherHost = hintHostOf(other.container);
    expect(host).not.toBeNull();
    expect(otherHost).not.toBeNull();
    // The renderer is still loading: the hint's host holds no hint.
    const hintButtons = () =>
      host?.querySelectorAll('button, [role="button"]').length ?? 0;
    expect(hintButtons()).toBe(0);

    const milk = cards[0].grip;
    milk.focus();
    fireEvent.keyDown(milk, {key: 'Enter'});
    expect(milk).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(milk, {key: 'ArrowDown'});
    expect(onReorder).toHaveBeenCalledWith({key: 'milk', to: 1});
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Milk, position 2 of 3, after Eggs, before Bread',
      ),
    );
    fireEvent.keyDown(milk, {key: 'Escape'});
    expect(milk).toHaveAttribute('aria-pressed', 'false');
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Done, Milk at position 2 of 3'),
    );
    expect(hintButtons()).toBe(0);

    // A mode that is on when the renderer arrives shows its hint then.
    fireEvent.keyDown(milk, {key: 'Enter'});
    expect(milk).toHaveAttribute('aria-pressed', 'true');
    second.detach();
    expect(otherHost?.isConnected).toBe(false);
    chunk.release();
    await waitFor(() => expect(hintButtons()).toBeGreaterThan(0));
    // The container detached first rendered nothing.
    expect(
      otherHost?.querySelectorAll('button, [role="button"]').length ?? 0,
    ).toBe(0);
    expect(otherHost?.lastElementChild?.childElementCount).toBe(0);
    expect(
      document.querySelectorAll('[data-astryx-reorder-hint-host]'),
    ).toHaveLength(1);
    detach();
  });
});

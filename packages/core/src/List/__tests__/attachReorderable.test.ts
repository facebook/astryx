// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file attachReorderable.test.ts
 * @input createReorderable's `attach` on plain elements, synthetic pointer
 *   and key events in jsdom
 * @output spec:AST-103 FR4b: a plain container gets the List's drag, reorder
 *   mode and announcements; each handle takes the toggle role and the name
 *   "Reorder" and its item's name; a move commits when `items()` reports the
 *   new order and is refused when it does not; a rejected item's handle is
 *   hidden; `detach` removes every listener and element `attach` added; and
 *   creating the object does no DOM work
 * @position Unit tests of packages/core/src/List/attachReorderable.ts
 */

import {act, fireEvent, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {createReorderable} from '../../reorderable';
import {MOUSE_DRAG_SLOP} from '../listReorderEngine';
import {pointerQuery} from '../../gestures/__tests__/pointerQuery';

const cleanups: (() => void)[] = [];

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) {
    cleanup();
  }
  document.body.innerHTML = '';
});

/** A plain list: one `li` per label, each with a `span` grip as its handle. */
function mountList(labels: ReadonlyArray<string>) {
  const list = document.createElement('ul');
  for (const label of labels) {
    const row = document.createElement('li');
    row.dataset.key = label;
    row.append(document.createTextNode(label));
    const grip = document.createElement('span');
    grip.className = 'grip';
    row.append(grip);
    list.append(row);
  }
  document.body.append(list);
  return list;
}

const items = (list: HTMLElement) => () =>
  Array.from(list.children as HTMLCollectionOf<HTMLElement>, row => ({
    key: row.dataset.key ?? '',
    element: row,
    handle: row.querySelector<HTMLElement>('.grip') as HTMLElement,
  }));

/** jsdom lays nothing out: 44 px rows from 300 px down the viewport. */
function layOut(list: HTMLElement) {
  const place = (row: Element) => Array.from(list.children).indexOf(row);
  for (const row of Array.from(list.children)) {
    Object.defineProperty(row, 'offsetParent', {
      configurable: true,
      get: () => list,
    });
    Object.defineProperty(row, 'offsetTop', {
      configurable: true,
      get: () => place(row) * 44,
    });
    Object.defineProperty(row, 'offsetHeight', {configurable: true, value: 44});
    row.getBoundingClientRect = () =>
      DOMRect.fromRect({
        x: 0,
        y: 300 + place(row) * 44,
        width: 300,
        height: 44,
      });
  }
}

/** Moves the row with `key` to index `to`, as a caller's onReorder would. */
function moveRow(list: HTMLElement, key: unknown, to: number) {
  const row = Array.from(list.children).find(
    child => (child as HTMLElement).dataset.key === key,
  );
  if (row == null) {
    return;
  }
  row.remove();
  list.insertBefore(row, list.children[to] ?? null);
}

const handleOf = (list: HTMLElement, label: string) =>
  list.querySelector<HTMLElement>(`[data-key="${label}"] .grip`) as HTMLElement;

const MOUSE = {pointerType: 'mouse', pointerId: 1, button: 0, clientX: 280};

describe('reorderable.attach (spec:AST-103 FR4b)', () => {
  it('names each handle "Reorder" and its item, as a toggle described by the instructions', () => {
    const list = mountList(['Milk', 'Eggs']);
    const {detach} = createReorderable({onReorder: () => {}}).attach(list, {
      items: items(list),
    });
    cleanups.push(detach);
    const handle = handleOf(list, 'Milk');
    expect(handle).toHaveAttribute('role', 'button');
    expect(handle).toHaveAttribute('tabindex', '0');
    expect(handle).toHaveAttribute('aria-pressed', 'false');
    expect(handle).toHaveAttribute('aria-label', 'Reorder Milk');
    const describedBy = handle.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)).not.toBeNull();
  });

  it('drags an item with a mouse and commits once the caller applies the new order', async () => {
    restorePointer = pointerQuery(false).restore;
    const list = mountList(['A', 'B', 'C']);
    layOut(list);
    const onReorder = vi.fn(({key, to}: {key: unknown; to: number}) => {
      moveRow(list, key, to);
      layOut(list);
    });
    const {detach} = createReorderable({onReorder}).attach(list, {
      items: items(list),
    });
    cleanups.push(detach);
    const handle = handleOf(list, 'A');
    fireEvent.pointerDown(handle, {...MOUSE, clientY: 322});
    fireEvent.pointerMove(handle, {...MOUSE, clientY: 322 + MOUSE_DRAG_SLOP});
    fireEvent.pointerMove(handle, {...MOUSE, clientY: 392});
    act(() => {
      fireEvent.pointerUp(handle, {...MOUSE, clientY: 392});
    });
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith({key: 'A', to: 2});
    expect(Array.from(list.children, row => row.textContent)).toEqual([
      'B',
      'C',
      'A',
    ]);
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Dropped, position 3 of 3'),
    );
  });

  it('enters reorder mode from a handle, commits each arrow at once, and ends it with Escape', async () => {
    const list = mountList(['Milk', 'Eggs', 'Bread']);
    layOut(list);
    const onReorder = vi.fn(({key, to}: {key: unknown; to: number}) =>
      moveRow(list, key, to),
    );
    const {detach} = createReorderable({onReorder}).attach(list, {
      items: items(list),
    });
    cleanups.push(detach);
    const handle = handleOf(list, 'Milk');
    handle.focus();
    fireEvent.keyDown(handle, {key: 'Enter'});
    expect(handle).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(handle, {key: 'ArrowDown'});
    expect(onReorder).toHaveBeenCalledWith({key: 'Milk', to: 1});
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Milk, position 2 of 3'),
    );
    fireEvent.keyDown(handle, {key: 'Escape'});
    expect(handle).toHaveAttribute('aria-pressed', 'false');
    expect(onReorder).toHaveBeenCalledTimes(1);
  });

  it('refuses a move whose order the caller keeps, and announces the place kept', async () => {
    const list = mountList(['Milk', 'Eggs']);
    layOut(list);
    const onReorder = vi.fn();
    const {detach} = createReorderable({onReorder}).attach(list, {
      items: items(list),
    });
    cleanups.push(detach);
    const handle = handleOf(list, 'Milk');
    handle.focus();
    fireEvent.click(handle);
    fireEvent.keyDown(handle, {key: 'ArrowDown'});
    expect(onReorder).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Milk, position 1 of 2'),
    );
    expect(Array.from(list.children, row => row.textContent)).toEqual([
      'Milk',
      'Eggs',
    ]);
  });

  it('hides the handle of an item isReorderable rejects', () => {
    const list = mountList(['Pinned', 'Milk']);
    const {detach} = createReorderable({
      onReorder: () => {},
      isReorderable: key => key !== 'Pinned',
    }).attach(list, {items: items(list)});
    cleanups.push(detach);
    expect(handleOf(list, 'Pinned')).toHaveAttribute('hidden');
    expect(handleOf(list, 'Milk')).not.toHaveAttribute('hidden');
  });

  it('starts reorder mode on an attached item from the app with start(key)', () => {
    const list = mountList(['Milk', 'Eggs']);
    const reorderable = createReorderable({onReorder: () => {}});
    const {detach} = reorderable.attach(list, {items: items(list)});
    cleanups.push(detach);
    reorderable.start('Eggs');
    expect(handleOf(list, 'Eggs')).toHaveAttribute('aria-pressed', 'true');
    expect(handleOf(list, 'Eggs')).toHaveFocus();
  });

  it('removes every listener and element it added on detach, and restores the handles', () => {
    const list = mountList(['Milk', 'Eggs']);
    const add = vi.spyOn(list, 'addEventListener');
    const remove = vi.spyOn(list, 'removeEventListener');
    const before = document.body.children.length;
    const {detach} = createReorderable({onReorder: () => {}}).attach(list, {
      items: items(list),
    });
    const added = add.mock.calls.map(([type]) => type);
    expect(added.length).toBeGreaterThan(0);
    detach();
    expect(remove.mock.calls.map(([type]) => type).sort()).toEqual(
      [...added].sort(),
    );
    expect(document.body.children.length).toBe(before);
    for (const label of ['Milk', 'Eggs']) {
      const handle = handleOf(list, label);
      for (const name of [
        'role',
        'tabindex',
        'aria-pressed',
        'aria-label',
        'aria-describedby',
        'data-astryx-list-reorder',
      ]) {
        expect(handle, `${label} ${name}`).not.toHaveAttribute(name);
      }
    }
  });

  it('does no DOM work until attach: the object is safe to make on the server', () => {
    const create = vi.spyOn(document, 'createElement');
    const listen = vi.spyOn(EventTarget.prototype, 'addEventListener');
    createReorderable({onReorder: () => {}});
    expect(create).not.toHaveBeenCalled();
    expect(listen).not.toHaveBeenCalled();
    create.mockRestore();
    listen.mockRestore();
  });
});

let restorePointer: (() => void) | null = null;
afterEach(() => {
  restorePointer?.();
  restorePointer = null;
});

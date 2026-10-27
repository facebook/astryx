// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file attach.test.ts
 * @input createReorderable's attach() on plain elements, in jsdom
 * @output The attach contract: each handle's toggle, name and tab order, what
 *   detach restores, reorder mode's moves and their announcements, and a
 *   refused move (spec:AST-103 FR4b)
 * @position Unit tests for reorderable/createReorderable.ts's attach
 */

import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {createReorderable} from '../createReorderable';
import {__resetLiveRegionsForTest} from '../../hooks/useAnnounce';

interface Card {
  readonly id: string;
  readonly el: HTMLElement;
  readonly grip: HTMLElement;
}

/** A container of plain cards, each with its own grip element. */
function deck(names: ReadonlyArray<string>) {
  const container = document.createElement('div');
  document.body.append(container);
  const cards: Card[] = names.map(name => {
    const el = document.createElement('div');
    el.append(name);
    const grip = document.createElement('span');
    grip.setAttribute('role', 'img');
    grip.setAttribute('aria-label', 'grip');
    grip.tabIndex = -1;
    el.append(grip);
    container.append(el);
    return {id: name.toLowerCase(), el, grip};
  });
  const items = () =>
    cards.map(card => ({key: card.id, element: card.el, handle: card.grip}));
  /** The app's own move: its data, then its DOM. */
  const move = (key: string, to: number) => {
    const from = cards.findIndex(card => card.id === key);
    const [card] = cards.splice(from, 1);
    cards.splice(to, 0, card);
    container.append(...cards.map(each => each.el));
  };
  return {container, cards, items, move};
}

afterEach(() => {
  document.body.replaceChildren();
  // The shared announcement channel keeps its regions; they went with the
  // body.
  __resetLiveRegionsForTest();
});

describe('createReorderable attach', () => {
  it('does no DOM work until attached (spec:AST-103 FR4b)', () => {
    const create = vi.spyOn(document, 'createElement');
    const listen = vi.spyOn(document, 'addEventListener');
    createReorderable({onReorder: () => {}});
    expect(create).not.toHaveBeenCalled();
    expect(listen).not.toHaveBeenCalled();
    create.mockRestore();
    listen.mockRestore();
  });

  it('does no DOM work when its module is imported, as on a server', async () => {
    vi.resetModules();
    const create = vi.spyOn(document, 'createElement');
    const listen = vi.spyOn(EventTarget.prototype, 'addEventListener');
    const module = await import('../createReorderable');
    module.createReorderable({onReorder: () => {}});
    expect(create).not.toHaveBeenCalled();
    expect(listen).not.toHaveBeenCalled();
    create.mockRestore();
    listen.mockRestore();
  });

  it('names handles from the shipped English catalog on a page in another language', () => {
    document.documentElement.lang = 'fr';
    try {
      const {container, cards, items} = deck(['Lait', 'Oeufs']);
      const {detach} = createReorderable({onReorder: () => {}}).attach(
        container,
        {items},
      );
      expect(cards[0].grip).toHaveAccessibleName('Reorder Lait');
      detach();
    } finally {
      document.documentElement.lang = '';
    }
  });

  it('warns in development about an item with no accessible name and no text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {container, cards, items} = deck(['', 'Eggs']);
    cards[0].el.replaceChildren(cards[0].grip);
    const {detach} = createReorderable({onReorder: () => {}}).attach(
      container,
      {items},
    );
    expect(
      warn.mock.calls.some(call =>
        call.join(' ').includes('no accessible name'),
      ),
    ).toBe(true);
    detach();
    warn.mockRestore();
  });

  it('reorders two containers one object is attached to each on its own, and start warns, reaching the latest', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const first = deck(['Milk', 'Eggs']);
    const second = deck(['Red', 'Blue']);
    const onReorder = vi.fn();
    const reorderable = createReorderable({onReorder});
    const one = reorderable.attach(first.container, {items: first.items});
    const two = reorderable.attach(second.container, {items: second.items});
    act(() => {
      reorderable.start('blue');
    });
    expect(second.cards[1].grip).toHaveAttribute('aria-pressed', 'true');
    expect(
      warn.mock.calls.some(call => call.join(' ').includes('more than one')),
    ).toBe(true);
    // The first container's handles reorder its own items only.
    first.cards[0].grip.focus();
    fireEvent.keyDown(first.cards[0].grip, {key: 'Enter'});
    fireEvent.keyDown(first.cards[0].grip, {key: 'ArrowDown'});
    expect(onReorder).toHaveBeenLastCalledWith({key: 'milk', to: 1});
    one.detach();
    two.detach();
    warn.mockRestore();
  });

  it("gives each handle reorder mode's toggle, named Reorder and the item's name, in the Tab order", () => {
    const {container, cards, items} = deck(['Milk', 'Eggs', 'Bread']);
    const {detach} = createReorderable({onReorder: () => {}}).attach(
      container,
      {items},
    );
    for (const {grip, el} of cards) {
      expect(grip).toHaveAttribute('role', 'button');
      expect(grip).toHaveAttribute('aria-pressed', 'false');
      expect(grip).toHaveAccessibleName(`Reorder ${el.textContent}`);
      expect(grip.tabIndex).toBe(0);
    }
    detach();
  });

  it("gives a rejected item's handle, and a keyless item's, none of it", () => {
    const {container, cards, items} = deck(['Milk', 'Eggs', 'Bread']);
    const {detach} = createReorderable({
      onReorder: () => {},
      isReorderable: key => key !== 'eggs',
    }).attach(container, {
      items: () =>
        items().map(item =>
          item.key === 'bread' ? {...item, key: undefined} : item,
        ),
    });
    for (const {grip} of cards.slice(1)) {
      expect(grip).toHaveAttribute('role', 'img');
      expect(grip).not.toHaveAttribute('aria-pressed');
      expect(grip).toHaveAttribute('aria-label', 'grip');
      expect(grip.tabIndex).toBe(-1);
      // A row that stays shows no handle (spec:AST-103 FR1, DEC-2).
      expect(grip.hidden).toBe(true);
    }
    expect(cards[0].grip).toHaveAttribute('role', 'button');
    expect(cards[0].grip.hidden).toBe(false);
    detach();
    for (const {grip} of cards) {
      expect(grip.hidden).toBe(false);
    }
  });

  it('names a row that stays in the refusal of a move past it (spec:AST-103 FR1, FR4)', async () => {
    const {container, cards, items, move} = deck(['Pinned', 'Milk', 'Eggs']);
    const onReorder = vi.fn(({key, to}: {key: string | number; to: number}) =>
      move(String(key), to),
    );
    const {detach} = createReorderable({
      onReorder,
      isReorderable: key => key !== 'pinned',
    }).attach(container, {items});
    const milk = cards[1].grip;
    milk.focus();
    fireEvent.keyDown(milk, {key: 'Enter'});
    fireEvent.keyDown(milk, {key: 'ArrowUp'});
    expect(onReorder).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(document.body).toHaveTextContent("Can't move past Pinned"),
    );
    detach();
  });

  it('listens on the container only: none on a handle or an item (spec:AST-103 FR5)', () => {
    const {container, cards, items} = deck(['Milk', 'Eggs']);
    const add = vi.spyOn(EventTarget.prototype, 'addEventListener');
    const {detach} = createReorderable({onReorder: () => {}}).attach(
      container,
      {items},
    );
    const targets = add.mock.contexts;
    for (const {el, grip} of cards) {
      expect(
        targets.filter(target => target === grip || target === el),
      ).toEqual([]);
    }
    const onContainer = add.mock.calls
      .filter((_, index) => targets[index] === container)
      .map(([type]) => type);
    expect(onContainer).toEqual(
      expect.arrayContaining(['click', 'keydown', 'focusout']),
    );
    add.mockRestore();
    detach();
  });

  it('announces through the shared polite channel, adding no live region of its own (spec:AST-103 FR4)', async () => {
    const {container, cards, items, move} = deck(['Milk', 'Eggs', 'Bread']);
    const {detach} = createReorderable({
      onReorder: ({key, to}) => move(String(key), to),
    }).attach(container, {items});
    const milk = cards[0].grip;
    milk.focus();
    fireEvent.keyDown(milk, {key: 'Enter'});
    fireEvent.keyDown(milk, {key: 'ArrowDown'});
    // The shared channel's page region (hooks/useAnnounce.ts).
    await waitFor(() =>
      expect(
        document.querySelector('[data-astryx-live-region="polite"]'),
      ).toHaveTextContent('Milk, position 2 of 3, after Eggs, before Bread'),
    );
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
    detach();
  });

  it("restores each handle's own role, name and tab order on detach, and leaves nothing of its own", () => {
    const {container, cards, items} = deck(['Milk', 'Eggs', 'Bread']);
    const before = document.body.innerHTML;
    const added: [EventTarget, string, unknown][] = [];
    const removed: [EventTarget, string][] = [];
    const add = vi
      .spyOn(EventTarget.prototype, 'addEventListener')
      .mockImplementation(function (
        this: EventTarget,
        type: string,
        _listener: unknown,
        options?: unknown,
      ) {
        added.push([this, type, options]);
      });
    const remove = vi
      .spyOn(EventTarget.prototype, 'removeEventListener')
      .mockImplementation(function (this: EventTarget, type: string) {
        removed.push([this, type]);
      });
    const reorderable = createReorderable({onReorder: () => {}});
    const {detach} = reorderable.attach(container, {items});
    expect(added.length).toBeGreaterThan(0);
    // Into reorder mode, then out by detach: it ends the mode, calling nothing.
    act(() => {
      reorderable.start('milk');
    });
    detach();
    add.mockRestore();
    remove.mockRestore();
    for (const [target, type, options] of added) {
      // A listener added with a signal goes when the signal aborts.
      const signal =
        typeof options === 'object' && options != null && 'signal' in options
          ? (options as {signal?: AbortSignal}).signal
          : undefined;
      // An element attach made and removed goes with its listeners.
      const isRemovedOwnElement = target instanceof Node && !target.isConnected;
      if (
        target instanceof AbortSignal ||
        signal?.aborted === true ||
        isRemovedOwnElement
      ) {
        continue;
      }
      expect(
        removed.some(([t, ty]) => t === target && ty === type),
        `${type} on ${Object.prototype.toString.call(target)}`,
      ).toBe(true);
    }
    for (const {grip} of cards) {
      expect(grip).toHaveAttribute('role', 'img');
      expect(grip).not.toHaveAttribute('aria-pressed');
      expect(grip).toHaveAccessibleName('grip');
      expect(grip.tabIndex).toBe(-1);
    }
    expect(document.body.innerHTML).toBe(before);
  });

  it('moves an item in reorder mode with the arrow keys and announces each move once it lands (spec:AST-103 FR4, FR4b)', async () => {
    const {container, cards, items, move} = deck(['Milk', 'Eggs', 'Bread']);
    const onReorder = vi.fn(({key, to}: {key: string | number; to: number}) =>
      move(String(key), to),
    );
    const {detach} = createReorderable({onReorder}).attach(container, {
      items,
    });
    const milk = cards[0].grip;
    milk.focus();
    // Enter on the handle, which is not a native button: reorder mode.
    fireEvent.keyDown(milk, {key: 'Enter'});
    expect(milk).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(milk, {key: 'ArrowDown'});
    expect(onReorder).toHaveBeenCalledWith({key: 'milk', to: 1});
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Milk, position 2 of 3, after Eggs, before Bread',
      ),
    );
    expect(document.activeElement).toBe(milk);
    detach();
  });

  it('starts reorder mode on an attached item with start(key) (spec:AST-103 FR4a)', () => {
    const {container, cards, items} = deck(['Milk', 'Eggs', 'Bread']);
    const reorderable = createReorderable({onReorder: () => {}});
    const {detach} = reorderable.attach(container, {items});
    act(() => {
      reorderable.start('eggs');
    });
    expect(cards[1].grip).toHaveAttribute('aria-pressed', 'true');
    expect(document.activeElement).toBe(cards[1].grip);
    detach();
    expect(cards[1].grip).not.toHaveAttribute('aria-pressed');
  });

  it('ends a drag on detach, reporting nothing, and leaves no preview', () => {
    const {container, cards, items} = deck(['Milk', 'Eggs', 'Bread']);
    for (const card of cards) {
      const place = () => Array.from(container.children).indexOf(card.el);
      Object.defineProperty(card.el, 'offsetParent', {
        configurable: true,
        get: () => container,
      });
      Object.defineProperty(card.el, 'offsetTop', {
        configurable: true,
        get: () => place() * 44,
      });
      Object.defineProperty(card.el, 'offsetHeight', {
        configurable: true,
        value: 44,
      });
      card.el.getBoundingClientRect = () =>
        DOMRect.fromRect({x: 0, y: 300 + place() * 44, width: 300, height: 44});
    }
    const onReorder = vi.fn();
    const {detach} = createReorderable({onReorder}).attach(container, {
      items,
    });
    const MOUSE = {pointerType: 'mouse', pointerId: 1, button: 0, clientX: 280};
    const grip = cards[0].grip;
    fireEvent.pointerDown(grip, {...MOUSE, clientY: 322});
    fireEvent.pointerMove(grip, {...MOUSE, clientY: 330});
    fireEvent.pointerMove(grip, {...MOUSE, clientY: 322 + 70});
    expect(
      document.querySelector('[data-astryx-reorder-preview]'),
    ).not.toBeNull();
    detach();
    expect(document.querySelector('[data-astryx-reorder-preview]')).toBeNull();
    fireEvent.pointerUp(grip, {...MOUSE, clientY: 322 + 70});
    expect(onReorder).not.toHaveBeenCalled();
    expect(Array.from(container.children)).toEqual(cards.map(card => card.el));
  });

  it("keeps reorder mode and the focus on the moved item's handle when the app rebuilds its markup (spec:AST-103 FR4b)", async () => {
    // An app that renders its items anew on each change: new elements, the
    // same keys.
    const container = document.createElement('div');
    document.body.append(container);
    let order = ['milk', 'eggs', 'bread'];
    const render = () => {
      container.replaceChildren(
        ...order.map(key => {
          const element = document.createElement('div');
          element.dataset.key = key;
          element.append(key[0].toUpperCase() + key.slice(1));
          const grip = document.createElement('span');
          grip.dataset.grip = '';
          element.append(grip);
          return element;
        }),
      );
    };
    render();
    const items = () =>
      Array.from(container.querySelectorAll<HTMLElement>('[data-key]')).map(
        element => ({
          key: element.dataset.key,
          element,
          handle: element.querySelector<HTMLElement>('[data-grip]') ?? element,
        }),
      );
    const gripOf = (key: string) =>
      container.querySelector<HTMLElement>(`[data-key="${key}"] [data-grip]`)!;
    const onReorder = vi.fn(({key, to}: {key: string | number; to: number}) => {
      order = order.filter(each => each !== key);
      order.splice(to, 0, String(key));
      render();
    });
    const {detach} = createReorderable({onReorder}).attach(container, {items});
    gripOf('milk').focus();
    fireEvent.keyDown(gripOf('milk'), {key: 'Enter'});
    fireEvent.keyDown(gripOf('milk'), {key: 'ArrowDown'});
    expect(onReorder).toHaveBeenCalledWith({key: 'milk', to: 1});
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Milk, position 2 of 3, after Eggs, before Bread',
      ),
    );
    // The new handle is the mode's, and has the focus.
    expect(gripOf('milk')).toHaveAttribute('aria-pressed', 'true');
    expect(document.activeElement).toBe(gripOf('milk'));
    // Its arrows move the item again.
    fireEvent.keyDown(gripOf('milk'), {key: 'ArrowDown'});
    expect(onReorder).toHaveBeenLastCalledWith({key: 'milk', to: 2});
    await waitFor(() => expect(document.activeElement).toBe(gripOf('milk')));
    detach();
  });

  it("refuses and announces a move whose order hasn't changed by the end of its task", async () => {
    const {container, cards, items} = deck(['Milk', 'Eggs', 'Bread']);
    const onReorder = vi.fn();
    const {detach} = createReorderable({onReorder}).attach(container, {
      items,
    });
    const milk = cards[0].grip;
    milk.focus();
    fireEvent.click(milk);
    fireEvent.keyDown(milk, {key: 'ArrowDown'});
    expect(onReorder).toHaveBeenCalledWith({key: 'milk', to: 1});
    // The move is refused and announced as one (spec:AST-103 FR4b).
    await waitFor(() =>
      expect(document.body).toHaveTextContent("Can't move Milk"),
    );
    expect(document.body).not.toHaveTextContent('position 2 of 3');
    detach();
  });

  it("focuses the dropped item's handle once a drop commits, however the app rendered it (spec:AST-103 FR4b)", async () => {
    const container = document.createElement('div');
    document.body.append(container);
    let order = ['milk', 'eggs', 'bread'];
    const render = () => {
      container.replaceChildren(
        ...order.map((key, index) => {
          const element = document.createElement('div');
          element.dataset.key = key;
          element.append(key);
          Object.defineProperty(element, 'offsetParent', {
            configurable: true,
            get: () => container,
          });
          Object.defineProperty(element, 'offsetTop', {
            configurable: true,
            value: index * 44,
          });
          Object.defineProperty(element, 'offsetHeight', {
            configurable: true,
            value: 44,
          });
          element.getBoundingClientRect = () =>
            DOMRect.fromRect({
              x: 0,
              y: 300 + index * 44,
              width: 300,
              height: 44,
            });
          const grip = document.createElement('span');
          grip.dataset.grip = '';
          element.append(grip);
          return element;
        }),
      );
    };
    render();
    const items = () =>
      Array.from(container.querySelectorAll<HTMLElement>('[data-key]')).map(
        element => ({
          key: element.dataset.key,
          element,
          handle: element.querySelector<HTMLElement>('[data-grip]') ?? element,
        }),
      );
    const gripOf = (key: string) =>
      container.querySelector<HTMLElement>(`[data-key="${key}"] [data-grip]`)!;
    const {detach} = createReorderable({
      onReorder: ({key, to}) => {
        order = order.filter(each => each !== key);
        order.splice(to, 0, String(key));
        render();
      },
    }).attach(container, {items});
    const MOUSE = {pointerType: 'mouse', pointerId: 1, button: 0, clientX: 280};
    const grip = gripOf('milk');
    fireEvent.pointerDown(grip, {...MOUSE, clientY: 322});
    fireEvent.pointerMove(grip, {...MOUSE, clientY: 330});
    fireEvent.pointerMove(grip, {...MOUSE, clientY: 322 + 70});
    act(() => {
      fireEvent.pointerUp(grip, {...MOUSE, clientY: 322 + 70});
    });
    expect(order).toEqual(['eggs', 'bread', 'milk']);
    await waitFor(() => expect(document.activeElement).toBe(gripOf('milk')));
    detach();
  });

  it.each([
    ['its own list', false],
    // A query over the container also finds the drag's preview, a copy of
    // an item: attach leaves its own copies out.
    ['a query over the container', true],
  ])(
    'lets a mouse drag an item by its handle, with one report at the drop, items() being %s (spec:AST-103 FR3, FR4b)',
    async (_name, byQuery) => {
      const deckOf = deck(['Milk', 'Eggs', 'Bread']);
      const {container, cards, move} = deckOf;
      for (const card of cards) {
        card.el.dataset.card = card.id;
        card.grip.dataset.grip = '';
      }
      const items = byQuery
        ? () =>
            Array.from(
              container.querySelectorAll<HTMLElement>('[data-card]'),
            ).map(element => ({
              key: element.dataset.card,
              element,
              handle:
                element.querySelector<HTMLElement>('[data-grip]') ?? element,
            }))
        : deckOf.items;
      // jsdom lays nothing out: 44 px items from 300 px down the viewport.
      for (const card of cards) {
        const place = () => Array.from(container.children).indexOf(card.el);
        Object.defineProperty(card.el, 'offsetParent', {
          configurable: true,
          get: () => container,
        });
        Object.defineProperty(card.el, 'offsetTop', {
          configurable: true,
          get: () => place() * 44,
        });
        Object.defineProperty(card.el, 'offsetHeight', {
          configurable: true,
          value: 44,
        });
        card.el.getBoundingClientRect = () =>
          DOMRect.fromRect({
            x: 0,
            y: 300 + place() * 44,
            width: 300,
            height: 44,
          });
      }
      const onReorder = vi.fn(({key, to}: {key: string | number; to: number}) =>
        move(String(key), to),
      );
      const {detach} = createReorderable({onReorder}).attach(container, {
        items,
      });
      const MOUSE = {
        pointerType: 'mouse',
        pointerId: 1,
        button: 0,
        clientX: 280,
      };
      const grip = cards[0].grip;
      fireEvent.pointerDown(grip, {...MOUSE, clientY: 322});
      fireEvent.pointerMove(grip, {...MOUSE, clientY: 330});
      fireEvent.pointerMove(grip, {...MOUSE, clientY: 322 + 70});
      // The browser delivers the container's mutations (the preview going
      // in) before the next pointer event.
      await act(async () => {
        await Promise.resolve();
      });
      // A preview follows; the items stay where they are.
      expect(
        document.querySelector('[data-astryx-reorder-preview]'),
      ).not.toBeNull();
      expect(onReorder).not.toHaveBeenCalled();
      act(() => {
        fireEvent.pointerUp(grip, {...MOUSE, clientY: 322 + 70});
      });
      expect(onReorder).toHaveBeenCalledTimes(1);
      expect(onReorder).toHaveBeenCalledWith({key: 'milk', to: 2});
      await waitFor(() =>
        expect(
          document.querySelector('[data-astryx-reorder-preview]'),
        ).toBeNull(),
      );
      expect(cards.map(card => card.id)).toEqual(['eggs', 'bread', 'milk']);
      detach();
    },
  );

  it('announces inside the open native modal that encloses the container (spec:AST-086 FR14)', async () => {
    // jsdom has no showModal(), so an open dialog never matches `:modal`;
    // stand in for a dialog opened modally.
    const matches = Element.prototype.matches;
    const modal = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    const dialog = document.createElement('dialog');
    dialog.open = true;
    document.body.append(dialog);
    const {container, cards, items, move} = deck(['Milk', 'Eggs', 'Bread']);
    dialog.append(container);
    const {detach} = createReorderable({
      onReorder: ({key, to}) => move(String(key), to),
    }).attach(container, {items});
    const milk = cards[0].grip;
    milk.focus();
    fireEvent.keyDown(milk, {key: 'Enter'});
    fireEvent.keyDown(milk, {key: 'ArrowDown'});
    await waitFor(() =>
      expect(dialog).toHaveTextContent(
        'Milk, position 2 of 3, after Eggs, before Bread',
      ),
    );
    expect(dialog.querySelector('[aria-live="polite"]')).not.toBeNull();
    detach();
    modal.mockRestore();
  });

  it('drops an item in a positions() layout on the slot whose centre is nearest its own (spec:AST-103 FR1)', () => {
    // A row of three 60 x 40 cards, 80 px apart, laid out by the app.
    const {container, cards, items, move} = deck(['A', 'B', 'C']);
    const slots = [
      {x: 40, y: 20},
      {x: 120, y: 20},
      {x: 200, y: 20},
    ];
    container.getBoundingClientRect = () =>
      DOMRect.fromRect({x: 100, y: 300, width: 240, height: 40});
    for (const card of cards) {
      const place = () => cards.indexOf(card);
      Object.defineProperty(card.el, 'offsetParent', {
        configurable: true,
        get: () => container,
      });
      Object.defineProperty(card.el, 'offsetTop', {
        configurable: true,
        value: 0,
      });
      Object.defineProperty(card.el, 'offsetLeft', {
        configurable: true,
        get: () => slots[place()].x - 30,
      });
      Object.defineProperty(card.el, 'offsetHeight', {
        configurable: true,
        value: 40,
      });
      Object.defineProperty(card.el, 'offsetWidth', {
        configurable: true,
        value: 60,
      });
      card.el.getBoundingClientRect = () =>
        DOMRect.fromRect({
          x: 100 + slots[place()].x - 30,
          y: 300,
          width: 60,
          height: 40,
        });
    }
    const onReorder = vi.fn(({key, to}: {key: string | number; to: number}) =>
      move(String(key), to),
    );
    const {detach} = createReorderable({
      onReorder,
      positions: () => slots,
    }).attach(container, {items});
    const MOUSE = {pointerType: 'mouse', pointerId: 1, button: 0, clientY: 320};
    const grip = cards[0].grip;
    // From A's centre (140, 320) to just past C's (305, 322).
    fireEvent.pointerDown(grip, {...MOUSE, clientX: 140});
    fireEvent.pointerMove(grip, {...MOUSE, clientX: 150});
    fireEvent.pointerMove(grip, {...MOUSE, clientX: 305, clientY: 322});
    const preview = document.querySelector<HTMLElement>(
      '[data-astryx-reorder-preview]',
    );
    // The preview follows the pointer on both axes.
    expect(preview?.style.translate).toBe('165px 2px');
    act(() => {
      fireEvent.pointerUp(grip, {...MOUSE, clientX: 305, clientY: 322});
    });
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith({key: 'a', to: 2});
    detach();
  });

  describe('reorder mode in a positions() layout (spec:AST-103 FR4)', () => {
    /** A deck whose cards sit on `slots`, moved by the app on each report. */
    function laidOut(
      names: ReadonlyArray<string>,
      slots: ReadonlyArray<{x: number; y: number}>,
    ) {
      const deckOf = deck(names);
      const onReorder = vi.fn(({key, to}: {key: string | number; to: number}) =>
        deckOf.move(String(key), to),
      );
      const {detach} = createReorderable({
        onReorder,
        positions: () => slots,
      }).attach(deckOf.container, {items: deckOf.items});
      const grip = (name: string) => {
        const card = deckOf.cards.find(each =>
          each.el.textContent?.startsWith(name),
        );
        if (card == null) {
          throw new Error(`no card ${name}`);
        }
        return card.grip;
      };
      return {...deckOf, onReorder, detach, grip};
    }

    it('moves along a row with Left and Right, and Up and Down do nothing', async () => {
      const {onReorder, detach, grip} = laidOut(
        ['A', 'B', 'C'],
        [
          {x: 40, y: 20},
          {x: 120, y: 20},
          {x: 200, y: 20},
        ],
      );
      const a = grip('A');
      a.focus();
      fireEvent.keyDown(a, {key: 'Enter'});
      fireEvent.keyDown(a, {key: 'ArrowDown'});
      expect(onReorder).not.toHaveBeenCalled();
      fireEvent.keyDown(a, {key: 'ArrowRight'});
      expect(onReorder).toHaveBeenCalledWith({key: 'a', to: 1});
      await waitFor(() =>
        expect(document.body).toHaveTextContent(
          'A, position 2 of 3, after B, before C',
        ),
      );
      detach();
    });

    it('moves Left and Right the other way in right-to-left', () => {
      const {container, onReorder, detach, grip} = laidOut(
        ['A', 'B', 'C'],
        [
          {x: 200, y: 20},
          {x: 120, y: 20},
          {x: 40, y: 20},
        ],
      );
      container.dir = 'rtl';
      container.style.direction = 'rtl';
      const a = grip('A');
      a.focus();
      fireEvent.keyDown(a, {key: 'Enter'});
      fireEvent.keyDown(a, {key: 'ArrowLeft'});
      expect(onReorder).toHaveBeenCalledWith({key: 'a', to: 1});
      detach();
    });

    it('moves on both axes in a grid: Up and Down keep the column, and a row and a column join the announcement', async () => {
      // Three columns, two rows.
      const {onReorder, detach, grip} = laidOut(
        ['A', 'B', 'C', 'D', 'E', 'F'],
        [
          {x: 40, y: 20},
          {x: 120, y: 20},
          {x: 200, y: 20},
          {x: 40, y: 80},
          {x: 120, y: 80},
          {x: 200, y: 80},
        ],
      );
      const a = grip('A');
      a.focus();
      fireEvent.keyDown(a, {key: 'Enter'});
      fireEvent.keyDown(a, {key: 'ArrowDown'});
      expect(onReorder).toHaveBeenCalledWith({key: 'a', to: 3});
      await waitFor(() =>
        expect(document.body).toHaveTextContent(
          'A, row 2, column 1, position 4 of 6',
        ),
      );
      fireEvent.keyDown(a, {key: 'ArrowRight'});
      expect(onReorder).toHaveBeenLastCalledWith({key: 'a', to: 4});
      detach();
    });

    it("shows the row's moves in the hint, each doing what its key does", async () => {
      const {onReorder, detach, grip} = laidOut(
        ['A', 'B', 'C'],
        [
          {x: 40, y: 20},
          {x: 120, y: 20},
          {x: 200, y: 20},
        ],
      );
      const a = grip('A');
      a.focus();
      fireEvent.keyDown(a, {key: 'Enter'});
      // jsdom opens no popover: the hint's layer stays hidden.
      const button = (name: string) =>
        screen.queryByRole('button', {name, hidden: true});
      await waitFor(() => expect(button('Move right')).not.toBeNull());
      expect(button('Move left')).not.toBeNull();
      expect(button('Move up')).toBeNull();
      expect(button('Move down')).toBeNull();
      fireEvent.click(button('Move right')!);
      expect(onReorder).toHaveBeenCalledWith({key: 'a', to: 1});
      // Once the move commits, the focus is on the handle.
      await waitFor(() => expect(document.activeElement).toBe(a));
      detach();
    });

    it('follows a resize that changes the column count', () => {
      // Three columns, then, after a resize, two.
      let slots = [
        {x: 40, y: 20},
        {x: 120, y: 20},
        {x: 200, y: 20},
        {x: 40, y: 80},
      ];
      const deckOf = deck(['A', 'B', 'C', 'D']);
      const onReorder = vi.fn();
      const {detach} = createReorderable({
        onReorder,
        positions: () => slots,
      }).attach(deckOf.container, {items: deckOf.items});
      const a = deckOf.cards[0].grip;
      a.focus();
      fireEvent.keyDown(a, {key: 'Enter'});
      fireEvent.keyDown(a, {key: 'ArrowDown'});
      expect(onReorder).toHaveBeenLastCalledWith({key: 'a', to: 3});
      slots = [
        {x: 40, y: 20},
        {x: 120, y: 20},
        {x: 40, y: 80},
        {x: 120, y: 80},
      ];
      fireEvent.keyDown(a, {key: 'ArrowDown'});
      expect(onReorder).toHaveBeenLastCalledWith({key: 'a', to: 2});
      detach();
    });

    it('ignores a positions() array of another length: the measured layout decides', () => {
      // Two slots for three items, side by side; the items are a column.
      const deckOf = deck(['A', 'B', 'C']);
      const onReorder = vi.fn();
      const {detach} = createReorderable({
        onReorder,
        positions: () => [
          {x: 40, y: 20},
          {x: 120, y: 20},
        ],
      }).attach(deckOf.container, {items: deckOf.items});
      const a = deckOf.cards[0].grip;
      a.focus();
      fireEvent.keyDown(a, {key: 'Enter'});
      // A column (jsdom lays nothing out): Right does nothing, Down moves.
      fireEvent.keyDown(a, {key: 'ArrowRight'});
      expect(onReorder).not.toHaveBeenCalled();
      fireEvent.keyDown(a, {key: 'ArrowDown'});
      expect(onReorder).toHaveBeenCalledWith({key: 'a', to: 1});
      detach();
    });

    it("moves Down to a shorter row's last position", () => {
      // Three, then two.
      const {onReorder, detach, grip} = laidOut(
        ['A', 'B', 'C', 'D', 'E'],
        [
          {x: 40, y: 20},
          {x: 120, y: 20},
          {x: 200, y: 20},
          {x: 40, y: 80},
          {x: 120, y: 80},
        ],
      );
      const c = grip('C');
      c.focus();
      fireEvent.keyDown(c, {key: 'Enter'});
      fireEvent.keyDown(c, {key: 'ArrowDown'});
      expect(onReorder).toHaveBeenCalledWith({key: 'c', to: 4});
      detach();
    });
  });
});

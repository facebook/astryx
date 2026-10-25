// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListReorder.test.tsx
 * @input List with `onReorder`, ListItem `isReorderDisabled` and
 *   `reorderLabel`, the reorder session itself, Testing Library
 * @output jsdom proofs of a reorderable List: each row gets a named reorder
 *   handle described by the list's instructions, a fixed row gets none and
 *   bounds the others (its end content kept in line), the handle's keys move
 *   its row (arrows, Home, End), Space picks it up and Escape puts it back, a
 *   move is announced once it lands and a declined one as kept, activating a
 *   handle opens only the moves its row can make, a row of any tag moves, the
 *   handle keeps focus across the commit of a move, modified keys move
 *   nothing, a disabled row's handle stays focusable but inert, and handles
 *   listen for touches on the document only while mounted
 * @position Tests for List/useListReorder.ts and List/ListReorderHandle.tsx
 */

import {useRef, useState} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {List} from '../List';
import {ListItem} from '../ListItem';
import {
  ListReorderContext,
  useListReorder,
  type ListReorderContextValue,
} from '../useListReorder';
import {ListReorderHandle, MOUSE_DRAG_SLOP} from '../ListReorderHandle';
import {DRAG_SLOP} from '../../DateInput/usePointerDragScroll';
import {useAnnounce} from '../../hooks/useAnnounce';
import {motionRole} from '../../motion/roles';

function move<T>(items: ReadonlyArray<T>, from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

const NONE: ReadonlyArray<string> = [];

function Reorderable({
  initial,
  fixed = NONE,
  onReorder,
}: {
  initial: ReadonlyArray<string>;
  fixed?: ReadonlyArray<string>;
  onReorder?: (from: number, to: number) => void;
}) {
  const [items, setItems] = useState(initial);
  return (
    <List
      onReorder={(from, to) => {
        onReorder?.(from, to);
        setItems(previous => move(previous, from, to));
      }}>
      {items.map(item => (
        <ListItem
          key={item}
          label={item}
          isReorderDisabled={fixed.includes(item)}
        />
      ))}
    </List>
  );
}

/** The primary pointer: coarse (a touch screen) or fine (a mouse). */
function stubPrimaryPointer(coarse: boolean) {
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

const labels = () =>
  Array.from(document.querySelectorAll('li')).map(row => row.textContent);

describe('List onReorder', () => {
  // The live region outlives each test: clear it, so one test's message is
  // never read by the next.
  afterEach(() => {
    const {result, unmount} = renderHook(() => useAnnounce());
    act(() => result.current(''));
    unmount();
  });

  it('adds no handle without onReorder', () => {
    render(
      <List>
        <ListItem label="Inbox" />
        <ListItem label="Sent" />
      </List>,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(document.querySelector('[data-astryx-list-reorder]')).toBeNull();
  });

  it('gives each row a reorder handle named after it and described by the instructions', () => {
    render(<Reorderable initial={['Inbox', 'Sent', 'Drafts']} />);
    const handle = screen.getByRole('button', {name: 'Reorder Inbox'});
    expect(handle).toHaveAttribute('type', 'button');
    expect(handle).toHaveAccessibleDescription(
      'Drag to move this item, or press Arrow Up or Arrow Down. Press Space to pick it up and Escape to put it back.',
    );
    expect(screen.getAllByRole('button', {name: /^Reorder /})).toHaveLength(3);
    // The instructions are not shown, and sit outside the list.
    const hint = document.getElementById(
      handle.getAttribute('aria-describedby') ?? '',
    );
    expect(hint).not.toBeNull();
    expect(hint).toHaveAttribute('hidden');
    expect(hint?.closest('ul')).toBeNull();
    expect(screen.getByRole('list').children).toHaveLength(3);
  });

  it('names the handle of a row without a text label after its place', () => {
    render(
      <List onReorder={() => {}}>
        <ListItem label="Inbox" />
        <ListItem label={<strong>Sent</strong>} />
      </List>,
    );
    expect(
      screen.getByRole('button', {name: 'Reorder item 2'}),
    ).toBeInTheDocument();
  });

  it('names the handle of a row with a rich label after its reorderLabel', () => {
    render(
      <List onReorder={() => {}}>
        <ListItem label={<strong>Name</strong>} reorderLabel="Name" />
        <ListItem label={<strong>Owner</strong>} />
      </List>,
    );
    expect(screen.getByRole('button', {name: 'Reorder Name'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Reorder item 2'})).toBeVisible();
  });

  it('keeps a fixed row in place: no handle, and a marker the drag reads', () => {
    render(
      <Reorderable initial={['Inbox', 'Sent', 'Trash']} fixed={['Trash']} />,
    );
    expect(screen.queryByRole('button', {name: 'Reorder Trash'})).toBeNull();
    const trash = screen.getByText('Trash').closest('li');
    expect(trash).toHaveAttribute('data-astryx-reorder-fixed');
    expect(screen.getByText('Inbox').closest('li')).not.toHaveAttribute(
      'data-astryx-reorder-fixed',
    );
  });

  it('ignores isReorderDisabled in a list without onReorder', () => {
    render(
      <List>
        <ListItem label="Trash" isReorderDisabled />
      </List>,
    );
    expect(screen.getByText('Trash').closest('li')).not.toHaveAttribute(
      'data-astryx-reorder-fixed',
    );
  });

  it('moves a row one place with the arrow keys and keeps the handle focused', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <Reorderable
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    const handle = screen.getByRole('button', {name: 'Reorder Inbox'});
    handle.focus();
    await user.keyboard('{ArrowUp}');
    expect(onReorder).not.toHaveBeenCalled();
    await user.keyboard('{ArrowDown}');
    expect(onReorder).toHaveBeenLastCalledWith(0, 1);
    expect(labels()).toEqual(['Sent', 'Inbox', 'Drafts']);
    expect(handle).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(onReorder).toHaveBeenLastCalledWith(1, 2);
    expect(labels()).toEqual(['Sent', 'Drafts', 'Inbox']);
    expect(handle).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(onReorder).toHaveBeenCalledTimes(2);
  });

  it('moves a row to either end with Home and End, stopping at a fixed row', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <Reorderable
        initial={['Inbox', 'Sent', 'Drafts', 'Trash', 'Archive']}
        fixed={['Trash']}
        onReorder={onReorder}
      />,
    );
    screen.getByRole('button', {name: 'Reorder Inbox'}).focus();
    await user.keyboard('{End}');
    expect(onReorder).toHaveBeenLastCalledWith(0, 2);
    expect(labels()).toEqual(['Sent', 'Drafts', 'Inbox', 'Trash', 'Archive']);
    await user.keyboard('{Home}');
    expect(onReorder).toHaveBeenLastCalledWith(2, 0);
    // Past the fixed row: Archive cannot go up.
    screen.getByRole('button', {name: 'Reorder Archive'}).focus();
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Home}');
    expect(onReorder).toHaveBeenCalledTimes(2);
  });

  it('picks a row up with Space and puts it back with Escape', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <Reorderable
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    const handle = screen.getByRole('button', {name: 'Reorder Inbox'});
    handle.focus();
    await user.keyboard(' ');
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Picked up, position 1 of 3. Press Arrow Up or Arrow Down to move, Space to drop, Escape to cancel.',
      ),
    );
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(labels()).toEqual(['Sent', 'Drafts', 'Inbox']);
    await user.keyboard('{Escape}');
    expect(onReorder).toHaveBeenLastCalledWith(2, 0);
    expect(labels()).toEqual(['Inbox', 'Sent', 'Drafts']);
    expect(handle).toHaveFocus();
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Reorder cancelled, back to position 1 of 3',
      ),
    );
  });

  it('drops a picked-up row with Space where it is', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <Reorderable
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    screen.getByRole('button', {name: 'Reorder Inbox'}).focus();
    await user.keyboard(' {ArrowDown} ');
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Dropped, position 2 of 3'),
    );
    await user.keyboard('{Escape}');
    // Dropped: Escape no longer moves it.
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(labels()).toEqual(['Sent', 'Inbox', 'Drafts']);
  });

  it('ignores arrow keys with a modifier: they are shortcuts', async () => {
    const onReorder = vi.fn();
    const user = userEvent.setup();
    render(
      <Reorderable
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    screen.getByRole('button', {name: 'Reorder Inbox'}).focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await user.keyboard('{Control>}{ArrowDown}{/Control}');
    await user.keyboard('{Meta>}{ArrowDown}{/Meta}');
    expect(onReorder).not.toHaveBeenCalled();
    expect(labels()).toEqual(['Inbox', 'Sent', 'Drafts']);
  });

  it("keeps a disabled row's handle focusable but moves nothing from it", async () => {
    const onReorder = vi.fn();
    const user = userEvent.setup();
    render(
      <List onReorder={onReorder}>
        <ListItem label="Inbox" isDisabled />
        <ListItem label="Sent" />
      </List>,
    );
    const handle = screen.getByRole('button', {name: 'Reorder Inbox'});
    expect(handle).toHaveAttribute('aria-disabled', 'true');
    expect(handle).not.toHaveAttribute('disabled');
    handle.focus();
    expect(handle).toHaveFocus();
    await user.keyboard('{ArrowDown}{End}{ }{ArrowDown}');
    expect(onReorder).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', {name: 'Reorder Sent'}),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('announces the new position after a key move', async () => {
    const user = userEvent.setup();
    render(<Reorderable initial={['Inbox', 'Sent', 'Drafts']} />);
    screen.getByRole('button', {name: 'Reorder Drafts'}).focus();
    await user.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Position 2 of 3'),
    );
  });

  it('announces a key move only once it lands, and a declined one as kept', async () => {
    const user = userEvent.setup();
    // A consumer that keeps its order: the row never moves.
    render(
      <List onReorder={() => {}}>
        {['Inbox', 'Sent', 'Drafts'].map(item => (
          <ListItem key={item} label={item} />
        ))}
      </List>,
    );
    screen.getByRole('button', {name: 'Reorder Drafts'}).focus();
    await user.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Reorder cancelled, back to position 3 of 3',
      ),
    );
    expect(document.body).not.toHaveTextContent('Position 2 of 3');
    expect(labels()).toEqual(['Inbox', 'Sent', 'Drafts']);
  });

  it.each([
    ['lands', true, 'Dropped, position 3 of 3'],
    ['is declined', false, 'Reorder cancelled, back to position 1 of 3'],
  ])('announces a drop once it %s', async (_, accept, message) => {
    const session: {current: ListReorderContextValue | null} = {
      current: null,
    };
    function Rows() {
      const listRef = useRef<HTMLUListElement>(null);
      const [items, setItems] = useState(['A', 'B', 'C']);
      session.current = useListReorder(
        listRef,
        (from, to) => {
          if (accept) {
            setItems(previous => move(previous, from, to));
          }
        },
        'hint',
      );
      return (
        <ul ref={listRef}>
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }
    const {container} = render(<Rows />);
    const list = container.querySelector('ul') as HTMLUListElement;
    // jsdom lays nothing out: 44 px rows from 300 px down the viewport.
    const place = (row: Element) => Array.from(list.children).indexOf(row);
    for (const row of Array.from(list.children)) {
      Object.defineProperty(row, 'offsetParent', {get: () => list});
      Object.defineProperty(row, 'offsetTop', {get: () => place(row) * 44});
      Object.defineProperty(row, 'offsetHeight', {value: 44});
      row.getBoundingClientRect = () =>
        DOMRect.fromRect({
          x: 0,
          y: 300 + place(row) * 44,
          width: 300,
          height: 44,
        });
    }
    const controller = session.current?.controller;
    const first = list.children[0] as HTMLElement;
    act(() => {
      controller?.gesture(first, {state: 'began', y: 322});
      // Past both boundaries: slot 2.
      controller?.gesture(null, {state: 'changed', y: 322 + 70});
      controller?.gesture(null, {state: 'ended', y: 322 + 70});
    });
    expect(document.body).not.toHaveTextContent('Dropped');
    await waitFor(() => expect(document.body).toHaveTextContent(message));
    expect(Array.from(list.children).map(row => row.textContent)).toEqual(
      accept ? ['B', 'C', 'A'] : ['A', 'B', 'C'],
    );
  });

  it("registers the slides' motion role only for a touch drag, before its first slide", () => {
    const stubCoarse = (coarse: boolean) =>
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
    const drag = () => {
      const session: {current: ListReorderContextValue | null} = {
        current: null,
      };
      function Rows() {
        const listRef = useRef<HTMLUListElement>(null);
        session.current = useListReorder(listRef, () => {}, 'hint');
        return (
          <ul ref={listRef}>
            {['A', 'B', 'C'].map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      }
      const {container, unmount} = render(<Rows />);
      const list = container.querySelector('ul') as HTMLUListElement;
      const place = (row: Element) => Array.from(list.children).indexOf(row);
      for (const row of Array.from(list.children)) {
        Object.defineProperty(row, 'offsetParent', {get: () => list});
        Object.defineProperty(row, 'offsetTop', {get: () => place(row) * 44});
        Object.defineProperty(row, 'offsetHeight', {value: 44});
      }
      act(() => {
        session.current?.controller.gesture(list.children[0] as HTMLElement, {
          state: 'began',
          y: 22,
        });
        session.current?.controller.gesture(null, {state: 'cancelled', y: 22});
      });
      unmount();
    };
    try {
      // A mouse's rows take their places at once: nothing registers.
      stubCoarse(false);
      drag();
      expect(motionRole('reorder.slide.spring')).toBeUndefined();
      // Under a finger the rows slide on a role a theme may retune.
      stubCoarse(true);
      drag();
      expect(motionRole('reorder.slide.spring')).toBeDefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it.each([
    ['its row is disabled', {isDisabled: true}],
    ['the list stops being reorderable', {isReorderable: false}],
  ])(
    'a drag goes home when %s mid-drag',
    async (_, change: {isDisabled?: boolean; isReorderable?: boolean}) => {
      const onReorder = vi.fn();
      const session: {current: ListReorderContextValue | null} = {
        current: null,
      };
      function Rows({
        isDisabled = false,
        isReorderable = true,
      }: {
        isDisabled?: boolean;
        isReorderable?: boolean;
      }) {
        const listRef = useRef<HTMLUListElement>(null);
        session.current = useListReorder(
          listRef,
          isReorderable ? onReorder : undefined,
          'hint',
        );
        return (
          <ListReorderContext value={session.current}>
            <ul ref={listRef}>
              {['A', 'B', 'C'].map(item => (
                <li key={item}>
                  {item}
                  <ListReorderHandle
                    label={item}
                    isDisabled={item === 'A' && isDisabled}
                  />
                </li>
              ))}
            </ul>
          </ListReorderContext>
        );
      }
      const {container, rerender} = render(<Rows />);
      const list = container.querySelector('ul') as HTMLUListElement;
      const place = (row: Element) => Array.from(list.children).indexOf(row);
      for (const row of Array.from(list.children)) {
        Object.defineProperty(row, 'offsetParent', {get: () => list});
        Object.defineProperty(row, 'offsetTop', {get: () => place(row) * 44});
        Object.defineProperty(row, 'offsetHeight', {value: 44});
        row.getBoundingClientRect = () =>
          DOMRect.fromRect({
            x: 0,
            y: 300 + place(row) * 44,
            width: 300,
            height: 44,
          });
      }
      const controller = session.current?.controller;
      act(() => {
        controller?.gesture(list.children[0] as HTMLElement, {
          state: 'began',
          y: 322,
        });
        controller?.gesture(null, {state: 'changed', y: 322 + 70});
      });
      expect(list).toHaveAttribute('data-astryx-reordering');
      rerender(<Rows {...change} />);
      // No recognizer reports this end: the session sends the row home.
      await waitFor(() =>
        expect(document.body).toHaveTextContent(
          'Reorder cancelled, back to position 1 of 3',
        ),
      );
      expect(onReorder).not.toHaveBeenCalled();
      expect(Array.from(list.children).map(row => row.textContent)).toEqual([
        'A',
        'B',
        'C',
      ]);
    },
  );

  it('listens for touches on the document only while a handle is mounted', () => {
    // A touch screen: the hold attaches where the primary pointer is coarse.
    stubPrimaryPointer(true);
    // A document of its own, so no earlier test has touched it.
    const doc = document.implementation.createHTMLDocument('handles');
    const touches = new Set(['touchstart', 'touchend', 'touchcancel']);
    const added = vi.spyOn(doc, 'addEventListener');
    const removed = vi.spyOn(doc, 'removeEventListener');
    const mount = () => {
      const container = doc.createElement('div');
      doc.body.append(container);
      return render(<Reorderable initial={['Inbox', 'Sent']} />, {
        container,
        baseElement: doc.body,
      });
    };
    const first = mount();
    const second = mount();
    const listeners = added.mock.calls.filter(([type]) => touches.has(type));
    expect(listeners.length).toBeGreaterThan(0);
    first.unmount();
    second.unmount();
    // Every touch listener the handles put on the document went with them.
    for (const [type, listener, options] of listeners) {
      expect(
        removed.mock.calls.some(
          ([removedType, removedListener]) =>
            removedType === type && removedListener === listener,
        ),
        `${type} ${JSON.stringify(options)}`,
      ).toBe(true);
    }
    added.mockRestore();
    removed.mockRestore();
    vi.unstubAllGlobals();
  });

  it('with a fine primary pointer attaches no recognizer and registers no touch listener', () => {
    // spec:AST-094 FR19, FR24: a finger there gets the browser's defaults.
    stubPrimaryPointer(false);
    const doc = document.implementation.createHTMLDocument('fine');
    const added = vi.spyOn(doc, 'addEventListener');
    const container = doc.createElement('div');
    doc.body.append(container);
    const {unmount} = render(<Reorderable initial={['Inbox', 'Sent']} />, {
      container,
      baseElement: doc.body,
    });
    expect(
      added.mock.calls.filter(([type]) => type.startsWith('touch')),
    ).toEqual([]);
    unmount();
    added.mockRestore();
    vi.unstubAllGlobals();
  });

  it("keeps the mouse drag slop equal to the date wheel's", () => {
    expect(MOUSE_DRAG_SLOP).toBe(DRAG_SLOP);
  });

  it('drags with a mouse once it moves the slop, from where it pressed; a smaller move stays a click', async () => {
    stubPrimaryPointer(false);
    const onReorder = vi.fn();
    function Rows() {
      const listRef = useRef<HTMLUListElement>(null);
      const session = useListReorder(listRef, onReorder, 'hint');
      return (
        <ListReorderContext value={session}>
          <ul ref={listRef}>
            {['A', 'B', 'C'].map(item => (
              <li key={item}>
                {item}
                <ListReorderHandle label={item} />
              </li>
            ))}
          </ul>
        </ListReorderContext>
      );
    }
    const {container} = render(<Rows />);
    const list = container.querySelector('ul') as HTMLUListElement;
    // jsdom lays nothing out: 44 px rows from 300 px down the viewport.
    const place = (row: Element) => Array.from(list.children).indexOf(row);
    for (const row of Array.from(list.children)) {
      Object.defineProperty(row, 'offsetParent', {get: () => list});
      Object.defineProperty(row, 'offsetTop', {get: () => place(row) * 44});
      Object.defineProperty(row, 'offsetHeight', {value: 44});
      row.getBoundingClientRect = () =>
        DOMRect.fromRect({
          x: 0,
          y: 300 + place(row) * 44,
          width: 300,
          height: 44,
        });
    }
    const handle = screen.getByRole('button', {name: 'Reorder A'});
    const mouse = {pointerType: 'mouse', pointerId: 1, button: 0, clientX: 280};
    // Under the slop: a click, so nothing is picked up and nothing announced.
    fireEvent.pointerDown(handle, {...mouse, clientY: 322});
    fireEvent.pointerMove(handle, {
      ...mouse,
      clientY: 322 + MOUSE_DRAG_SLOP - 1,
    });
    expect(list).not.toHaveAttribute('data-astryx-reordering');
    fireEvent.pointerUp(handle, {...mouse, clientY: 322 + MOUSE_DRAG_SLOP - 1});
    expect(document.body).not.toHaveTextContent('Dropped');
    // Past it the row follows from the press point: past both boundaries.
    fireEvent.pointerDown(handle, {...mouse, clientY: 322});
    fireEvent.pointerMove(handle, {...mouse, clientY: 322 + MOUSE_DRAG_SLOP});
    expect(list).toHaveAttribute('data-astryx-reordering');
    fireEvent.pointerMove(handle, {...mouse, clientY: 322 + 70});
    act(() => {
      fireEvent.pointerUp(handle, {...mouse, clientY: 322 + 70});
    });
    expect(onReorder).toHaveBeenCalledWith(0, 2);
    vi.unstubAllGlobals();
  });

  it('moves a row of any tag: the row is the list child that holds the handle', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    function Rows() {
      const listRef = useRef<HTMLDivElement>(null);
      const session = useListReorder(listRef, onReorder, 'hint');
      return (
        <ListReorderContext value={session}>
          <div ref={listRef} role="list">
            {['A', 'B'].map(item => (
              <div key={item} role="listitem">
                <span>
                  {item}
                  <ListReorderHandle label={item} />
                </span>
              </div>
            ))}
          </div>
        </ListReorderContext>
      );
    }
    render(<Rows />);
    screen.getByRole('button', {name: 'Reorder A'}).focus();
    await user.keyboard('{ArrowDown}');
    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });

  it('opens the moves a row can make when its handle is activated', async () => {
    const user = userEvent.setup();
    render(<Reorderable initial={['Inbox', 'Sent', 'Drafts']} />);
    await user.click(screen.getByRole('button', {name: 'Reorder Inbox'}));
    // The menu is named by its handle (jsdom never shows the popover).
    const menu = await screen.findByRole('menu', {
      name: 'Reorder Inbox',
      hidden: true,
    });
    // The first row cannot go up: only the moves that move it.
    expect(
      within(menu)
        .getAllByRole('menuitem', {hidden: true})
        .map(item => item.textContent),
    ).toEqual(['Move down', 'Move to bottom']);
    fireEvent.click(
      within(menu).getByRole('menuitem', {
        name: 'Move to bottom',
        hidden: true,
      }),
    );
    expect(labels()).toEqual(['Sent', 'Drafts', 'Inbox']);
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Position 3 of 3'),
    );
  });

  it('opens the moves on a mouse click, and not after a mouse press that moved past the slop', async () => {
    stubPrimaryPointer(false);
    render(<Reorderable initial={['Inbox', 'Sent', 'Drafts']} />);
    const handle = screen.getByRole('button', {name: 'Reorder Inbox'});
    const mouse = {pointerType: 'mouse', pointerId: 1, button: 0, clientX: 10};
    // A press that drags: it opens nothing when the click follows the lift.
    fireEvent.pointerDown(handle, {...mouse, clientY: 10});
    fireEvent.pointerMove(handle, {...mouse, clientY: 10 + MOUSE_DRAG_SLOP});
    fireEvent.pointerUp(handle, {...mouse, clientY: 10 + MOUSE_DRAG_SLOP});
    fireEvent.click(handle);
    await act(async () => undefined);
    expect(screen.queryByRole('menu', {hidden: true})).toBeNull();
    // A click: the press stays under the slop, and the moves open.
    fireEvent.pointerDown(handle, {...mouse, clientY: 10});
    fireEvent.pointerUp(handle, {...mouse, clientY: 10});
    fireEvent.click(handle);
    expect(
      await screen.findByRole('menu', {name: 'Reorder Inbox', hidden: true}),
    ).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('offers no moves from a disabled row, nor from a row that cannot move', () => {
    render(
      <List onReorder={() => {}}>
        <ListItem label="Inbox" isDisabled />
        <ListItem label="Sent" isReorderDisabled />
        <ListItem label="Drafts" />
      </List>,
    );
    // A screen reader activates a handle with a click, whatever its paint.
    fireEvent.click(screen.getByRole('button', {name: 'Reorder Inbox'}));
    // Drafts sits alone below the fixed Sent: no move moves it.
    fireEvent.click(screen.getByRole('button', {name: 'Reorder Drafts'}));
    expect(screen.queryAllByRole('menuitem', {hidden: true})).toHaveLength(0);
    for (const name of ['Reorder Inbox', 'Reorder Drafts']) {
      expect(screen.getByRole('button', {name})).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    }
  });

  it("keeps a fixed row's end content in the movable rows' column", () => {
    render(
      <List onReorder={() => {}}>
        <ListItem
          label="Name"
          isReorderDisabled
          endContent={<span>Locked</span>}
        />
        <ListItem label="Owner" endContent={<span>Remove</span>} />
        <ListItem label="Status" isReorderDisabled />
      </List>,
    );
    const slot = (label: string) =>
      screen
        .getByText(label)
        .closest('li')
        ?.querySelector('[data-astryx-list-reorder-slot]');
    // An empty, hidden place where a handle would be, after the end content.
    expect(slot('Name')).toHaveAttribute('aria-hidden', 'true');
    // A movable row has its handle there; a fixed row with no end content
    // has nothing to line up.
    expect(slot('Owner')).toBeNull();
    expect(slot('Status')).toBeNull();
  });

  it('does not activate an interactive row from its handle', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List onReorder={() => {}}>
        <ListItem label="Inbox" onClick={onClick} />
      </List>,
    );
    await user.click(screen.getByRole('button', {name: 'Reorder Inbox'}));
    expect(onClick).not.toHaveBeenCalled();
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListReorder.test.tsx
 * @input List with `reorderable` (createReorderable), ListItem `itemKey`,
 *   Testing Library
 * @output jsdom proofs of a reorderable List (spec:AST-103): each row with an
 *   item key gets a named reorder handle described by the list's
 *   instructions; a row without a key, or one `isReorderable` rejects, gets
 *   none, and only such rows at either end bound the others; Space or Enter
 *   picks a row up, the arrows, Home and End move it without reporting, the
 *   drop reports once with the row's key and its index after the move, and
 *   Escape or a lost focus reports nothing; pick-up, moves, drop and cancel
 *   are announced, a drop only once it lands; a mouse drags past the slop; a
 *   new object mid-drag keeps the drag and the drop calls the latest
 *   callback; one object serves two lists apart; the reorder adds one element
 *   to a row and no listener to a row or handle, and a List without it loads
 *   no reorder module
 * @position Tests for List/listReorderEngine.tsx, List/ListReorderHandle.tsx
 *   and reorderable/createReorderable.ts
 */

import {readFileSync} from 'node:fs';
import {useState, type Key} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {List} from '../List';
import {ListItem} from '../ListItem';
import {MOUSE_DRAG_SLOP} from '../listReorderEngine';
import {
  createReorderable,
  type Reorderable,
  type ReorderMove,
} from '../../reorderable';
import {DRAG_SLOP} from '../../DateInput/usePointerDragScroll';
import {useAnnounce} from '../../hooks/useAnnounce';
import {motionRole} from '../../motion/roles';
import {getGestureHost} from '../../gestures/GestureHost';
import {pointerQuery} from '../../gestures/__tests__/pointerQuery';

function moveKey<T extends Key>(
  items: ReadonlyArray<T>,
  key: Key,
  to: number,
): T[] {
  const next = items.filter(item => item !== key);
  next.splice(to, 0, key as T);
  return next;
}

const NONE: ReadonlyArray<string> = [];

function ReorderableRows({
  initial,
  fixed = NONE,
  onReorder,
  isDisabled = NONE,
}: {
  initial: ReadonlyArray<string>;
  fixed?: ReadonlyArray<string>;
  onReorder?: (move: ReorderMove) => void;
  isDisabled?: ReadonlyArray<string>;
}) {
  const [items, setItems] = useState(initial);
  // A new object on every render, as a caller may make it.
  const reorderable = createReorderable({
    onReorder: move => {
      onReorder?.(move);
      setItems(previous => moveKey(previous, move.key, move.to));
    },
    isReorderable: key => !fixed.includes(key as string),
  });
  return (
    <List reorderable={reorderable}>
      {items.map(item => (
        <ListItem
          key={item}
          itemKey={item}
          label={item}
          isDisabled={isDisabled.includes(item)}
        />
      ))}
    </List>
  );
}

/** The primary pointer: coarse (a touch screen) or fine (a mouse). */
let restorePointer: (() => void) | null = null;

/** The primary pointer a test needs (jsdom's is fine), until it ends. */
function stubPrimaryPointer(coarse: boolean) {
  restorePointer?.();
  restorePointer = pointerQuery(coarse).restore;
}

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

const MOUSE = {pointerType: 'mouse', pointerId: 1, button: 0, clientX: 280};

/** A mouse presses `handle` at `from`, moves past the slop, then to `to`. */
function mouseDrag(handle: Element, from: number, to: number) {
  fireEvent.pointerDown(handle, {...MOUSE, clientY: from});
  fireEvent.pointerMove(handle, {...MOUSE, clientY: from + MOUSE_DRAG_SLOP});
  fireEvent.pointerMove(handle, {...MOUSE, clientY: to});
}

const labels = () =>
  Array.from(document.querySelectorAll('li')).map(row => row.textContent);

const handleOf = (label: string) =>
  screen.getByRole('button', {name: `Reorder ${label}`});

describe('List reorderable', () => {
  // The live region outlives each test: clear it, so one test's message is
  // never read by the next.
  afterEach(() => {
    const {result, unmount} = renderHook(() => useAnnounce());
    act(() => result.current(''));
    unmount();
    restorePointer?.();
    restorePointer = null;
  });

  it('adds no handle and no listener without reorderable', () => {
    render(
      <List>
        <ListItem itemKey="inbox" label="Inbox" />
        <ListItem itemKey="sent" label="Sent" />
      </List>,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(document.querySelector('[data-astryx-list-reorder]')).toBeNull();
  });

  it('loads no reorder module from List or ListItem: they import its type and context only', () => {
    // spec:AST-103 FR2: the machinery ships with createReorderable.
    for (const file of ['../List.tsx', '../ListItem.tsx']) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');
      const imports = Array.from(
        source.matchAll(/^import\s+(type\s+)?[^;]*?from\s+'([^']+)';/gms),
        match => ({isType: match[1] != null, from: match[2]}),
      );
      for (const {isType, from} of imports) {
        if (/reorder/i.test(from)) {
          expect(
            isType || from === './listReorderContext',
            `${file} imports ${from}`,
          ).toBe(true);
        }
      }
    }
  });

  it('gives each row with an item key a handle named after it and described by the instructions', () => {
    render(<ReorderableRows initial={['Inbox', 'Sent', 'Drafts']} />);
    const handle = handleOf('Inbox');
    expect(handle).toHaveAttribute('type', 'button');
    expect(handle).toHaveAccessibleDescription(
      'Drag to move this item, or press Space or Enter to pick it up, the arrow keys to move it, and Space or Enter again to drop it. Escape puts it back.',
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

  it('names the handle of a row with a rich label after its text, and of one that shows no text after its place', async () => {
    render(
      <List reorderable={createReorderable({onReorder: () => {}})}>
        <ListItem itemKey="inbox" label="Inbox" />
        <ListItem
          itemKey="sent"
          label={
            <span>
              <strong>Sent</strong> {'mail'}
            </span>
          }
        />
        <ListItem itemKey="star" label={<svg aria-label="Starred" />} />
      </List>,
    );
    expect(handleOf('Sent mail')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {name: 'Reorder item 3'}),
    ).toBeInTheDocument();
  });

  it('adds one element to a row, the handle, whose lines are a pseudo-element', () => {
    const rows = (reorderable?: Reorderable) => (
      <List reorderable={reorderable}>
        <ListItem itemKey="inbox" label="Inbox" endContent={<span>3</span>} />
      </List>
    );
    const {rerender} = render(rows());
    const row = screen.getByText('Inbox').closest('li') as HTMLElement;
    const before = row.querySelectorAll('*').length;
    rerender(rows(createReorderable({onReorder: () => {}})));
    expect(row.querySelectorAll('*').length).toBe(before + 1);
    const handle = handleOf('Inbox');
    expect(handle.children).toHaveLength(0);
    expect(handle.textContent).toBe('');
  });

  it('keeps a row the object rejects in place: no handle, and nothing added to it', () => {
    const rows = (reorderable?: Reorderable) => (
      <List reorderable={reorderable}>
        <ListItem itemKey="inbox" label="Inbox" />
        <ListItem itemKey="trash" label="Trash" endContent={<span>9</span>} />
      </List>
    );
    const {rerender} = render(rows());
    const trash = screen.getByText('Trash').closest('li') as HTMLElement;
    const before = trash.outerHTML;
    rerender(
      rows(
        createReorderable({
          onReorder: () => {},
          isReorderable: key => key !== 'trash',
        }),
      ),
    );
    expect(screen.queryByRole('button', {name: 'Reorder Trash'})).toBeNull();
    expect(handleOf('Inbox')).toBeInTheDocument();
    expect(trash.outerHTML).toBe(before);
  });

  it('keeps a row without an item key in place, and warns in development when no row has one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const warnings = () =>
      warn.mock.calls.filter(([message]) =>
        String(message).includes('`itemKey`'),
      );
    const {unmount} = render(
      <List reorderable={createReorderable({onReorder: () => {}})}>
        <ListItem itemKey="inbox" label="Inbox" />
        <ListItem label="Sent" />
      </List>,
    );
    expect(screen.queryByRole('button', {name: 'Reorder Sent'})).toBeNull();
    expect(handleOf('Inbox')).toBeInTheDocument();
    expect(warnings()).toHaveLength(0);
    unmount();
    render(
      <List reorderable={createReorderable({onReorder: () => {}})}>
        <ListItem label="Sent" />
        <ListItem label="Drafts" />
      </List>,
    );
    expect(warnings()).toHaveLength(1);
    warn.mockRestore();
  });

  it.each([' ', 'Enter'])(
    'picks a row up with %j, moves it with the arrows without reporting, and reports once at the drop',
    async key => {
      const user = userEvent.setup();
      const onReorder = vi.fn();
      render(
        <ReorderableRows
          initial={['Inbox', 'Sent', 'Drafts']}
          onReorder={onReorder}
        />,
      );
      const handle = handleOf('Inbox');
      handle.focus();
      const press = key === ' ' ? ' ' : '{Enter}';
      await user.keyboard(press);
      await waitFor(() =>
        expect(document.body).toHaveTextContent('Picked up, position 1 of 3'),
      );
      await user.keyboard('{ArrowDown}');
      await waitFor(() =>
        expect(document.body).toHaveTextContent('Position 2 of 3'),
      );
      await user.keyboard('{ArrowDown}{ArrowDown}');
      // Nothing is reported while the row is up, and the order is the
      // caller's until the drop.
      expect(onReorder).not.toHaveBeenCalled();
      expect(labels()).toEqual(['Inbox', 'Sent', 'Drafts']);
      expect(screen.getByRole('list')).toHaveAttribute(
        'data-astryx-reordering',
      );
      await user.keyboard(press);
      expect(onReorder).toHaveBeenCalledTimes(1);
      expect(onReorder).toHaveBeenCalledWith({key: 'Inbox', to: 2});
      expect(labels()).toEqual(['Sent', 'Drafts', 'Inbox']);
      expect(handle).toHaveFocus();
      await waitFor(() =>
        expect(document.body).toHaveTextContent('Dropped, position 3 of 3'),
      );
    },
  );

  it('puts a picked-up row back with Escape and reports nothing', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <ReorderableRows
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    const handle = handleOf('Inbox');
    handle.focus();
    await user.keyboard(' {ArrowDown}{ArrowDown}{Escape}');
    expect(onReorder).not.toHaveBeenCalled();
    expect(labels()).toEqual(['Inbox', 'Sent', 'Drafts']);
    expect(screen.getByRole('list')).not.toHaveAttribute(
      'data-astryx-reordering',
    );
    expect(handle).toHaveFocus();
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Reorder cancelled, back to position 1 of 3',
      ),
    );
    // Put back: the arrows no longer move it.
    await user.keyboard('{ArrowDown} ');
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('moves nothing with the arrows until the row is picked up', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <ReorderableRows
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    handleOf('Inbox').focus();
    await user.keyboard('{ArrowDown}{End}{Home}');
    expect(screen.getByRole('list')).not.toHaveAttribute(
      'data-astryx-reordering',
    );
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('drops a row where it was picked up without reporting', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <ReorderableRows
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    handleOf('Sent').focus();
    await user.keyboard(' {ArrowDown}{ArrowUp} ');
    expect(onReorder).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Dropped, position 2 of 3'),
    );
  });

  it('bounds a picked-up row by the rows the object rejects at either end, and passes one in the middle', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <ReorderableRows
        initial={['Pinned', 'Inbox', 'Sent', 'Locked', 'Drafts', 'Trash']}
        fixed={['Pinned', 'Locked', 'Trash']}
        onReorder={onReorder}
      />,
    );
    handleOf('Inbox').focus();
    // End: past Locked, up to Trash.
    await user.keyboard(' {End}{ArrowDown} ');
    expect(onReorder).toHaveBeenLastCalledWith({key: 'Inbox', to: 4});
    expect(labels()).toEqual([
      'Pinned',
      'Sent',
      'Locked',
      'Drafts',
      'Inbox',
      'Trash',
    ]);
    // Home: down to Pinned, never above it.
    await user.keyboard(' {Home}{ArrowUp} ');
    expect(onReorder).toHaveBeenLastCalledWith({key: 'Inbox', to: 1});
    expect(onReorder).toHaveBeenCalledTimes(2);
  });

  it('puts a picked-up row back when its handle loses focus', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <ReorderableRows
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    handleOf('Inbox').focus();
    await user.keyboard(' {ArrowDown}');
    await user.tab();
    expect(onReorder).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Reorder cancelled, back to position 1 of 3',
      ),
    );
  });

  it('ignores keys with a modifier: they are shortcuts', async () => {
    const onReorder = vi.fn();
    const user = userEvent.setup();
    render(
      <ReorderableRows
        initial={['Inbox', 'Sent', 'Drafts']}
        onReorder={onReorder}
      />,
    );
    handleOf('Inbox').focus();
    await user.keyboard('{Alt>} {/Alt}{Control>}{Enter}{/Control}');
    expect(screen.getByRole('list')).not.toHaveAttribute(
      'data-astryx-reordering',
    );
    await user.keyboard(' {Meta>}{ArrowDown}{/Meta} ');
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("keeps a disabled row's handle focusable but moves nothing from it", async () => {
    const onReorder = vi.fn();
    const user = userEvent.setup();
    render(
      <ReorderableRows
        initial={['Inbox', 'Sent']}
        isDisabled={['Inbox']}
        onReorder={onReorder}
      />,
    );
    const handle = handleOf('Inbox');
    expect(handle).toHaveAttribute('aria-disabled', 'true');
    expect(handle).not.toHaveAttribute('disabled');
    handle.focus();
    expect(handle).toHaveFocus();
    await user.keyboard(' {ArrowDown} ');
    expect(onReorder).not.toHaveBeenCalled();
    expect(handleOf('Sent')).not.toHaveAttribute('aria-disabled');
  });

  it('announces a drop only once it lands, and a declined one as kept', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    // A caller that keeps its order: the row never moves.
    render(
      <List reorderable={createReorderable({onReorder})}>
        {['Inbox', 'Sent', 'Drafts'].map(item => (
          <ListItem key={item} itemKey={item} label={item} />
        ))}
      </List>,
    );
    handleOf('Drafts').focus();
    await user.keyboard(' {ArrowUp} ');
    expect(onReorder).toHaveBeenCalledWith({key: 'Drafts', to: 1});
    await waitFor(() =>
      expect(document.body).toHaveTextContent(
        'Reorder cancelled, back to position 3 of 3',
      ),
    );
    expect(document.body).not.toHaveTextContent('Dropped');
    expect(labels()).toEqual(['Inbox', 'Sent', 'Drafts']);
  });

  it('reports the item key as given: a number stays a number', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <List reorderable={createReorderable<number>({onReorder})}>
        <ListItem itemKey={7} label="Seven" />
        <ListItem itemKey={8} label="Eight" />
      </List>,
    );
    handleOf('Seven').focus();
    await user.keyboard(' {ArrowDown} ');
    expect(onReorder).toHaveBeenCalledWith({key: 7, to: 1});
  });

  it('keeps a drag when the object is made anew mid-drag, and calls the latest onReorder at the drop', async () => {
    const user = userEvent.setup();
    const first = vi.fn();
    const second = vi.fn();
    const rows = (onReorder: (move: ReorderMove) => void) => (
      <List reorderable={createReorderable({onReorder})}>
        {['Inbox', 'Sent', 'Drafts'].map(item => (
          <ListItem key={item} itemKey={item} label={item} />
        ))}
      </List>
    );
    const {rerender} = render(rows(first));
    handleOf('Inbox').focus();
    await user.keyboard(' {ArrowDown}');
    rerender(rows(second));
    expect(screen.getByRole('list')).toHaveAttribute('data-astryx-reordering');
    await user.keyboard(' ');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith({key: 'Inbox', to: 1});
  });

  it('reorders two lists that share one object each on its own', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const reorderable = createReorderable({onReorder});
    render(
      <>
        <List reorderable={reorderable} aria-label="Today">
          <ListItem itemKey="a1" label="A1" />
          <ListItem itemKey="a2" label="A2" />
        </List>
        <List reorderable={reorderable} aria-label="Later">
          <ListItem itemKey="b1" label="B1" />
          <ListItem itemKey="b2" label="B2" />
        </List>
      </>,
    );
    const [today, later] = screen.getAllByRole('list');
    handleOf('B1').focus();
    await user.keyboard(' {ArrowDown}');
    expect(later).toHaveAttribute('data-astryx-reordering');
    expect(today).not.toHaveAttribute('data-astryx-reordering');
    // The other list's handle still picks up its own row.
    await user.keyboard(' ');
    expect(onReorder).toHaveBeenLastCalledWith({key: 'b1', to: 1});
    handleOf('A2').focus();
    await user.keyboard(' {ArrowUp} ');
    expect(onReorder).toHaveBeenLastCalledWith({key: 'a2', to: 0});
  });

  it("keeps the mouse drag slop equal to the date wheel's", () => {
    expect(MOUSE_DRAG_SLOP).toBe(DRAG_SLOP);
  });

  it('drags with a mouse once it moves the slop, from where it pressed; a smaller move stays a click', async () => {
    stubPrimaryPointer(false);
    const onReorder = vi.fn();
    render(<ReorderableRows initial={['A', 'B', 'C']} onReorder={onReorder} />);
    const list = screen.getByRole('list');
    layOut(list);
    const handle = handleOf('A');
    // Under the slop: a click, so nothing is picked up and nothing announced.
    fireEvent.pointerDown(handle, {...MOUSE, clientY: 322});
    fireEvent.pointerMove(handle, {
      ...MOUSE,
      clientY: 322 + MOUSE_DRAG_SLOP - 1,
    });
    expect(list).not.toHaveAttribute('data-astryx-reordering');
    fireEvent.pointerUp(handle, {...MOUSE, clientY: 322 + MOUSE_DRAG_SLOP - 1});
    expect(document.body).not.toHaveTextContent('Picked up');
    // Past it the row follows from the press point: past both boundaries.
    mouseDrag(handle, 322, 322 + 70);
    expect(list).toHaveAttribute('data-astryx-reordering');
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Picked up, position 1 of 3'),
    );
    act(() => {
      fireEvent.pointerUp(handle, {...MOUSE, clientY: 322 + 70});
    });
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith({key: 'A', to: 2});
    expect(labels()).toEqual(['B', 'C', 'A']);
    await waitFor(() =>
      expect(document.body).toHaveTextContent('Dropped, position 3 of 3'),
    );
  });

  it.each([
    ['its row is disabled', {isDisabled: ['A']}],
    ['its row stops being reorderable', {fixed: ['A']}],
    ['the list stops being reorderable', {isReorderable: false}],
  ])(
    'sends a mouse drag home when %s mid-drag',
    async (
      _,
      change: {
        isDisabled?: ReadonlyArray<string>;
        fixed?: ReadonlyArray<string>;
        isReorderable?: boolean;
      },
    ) => {
      stubPrimaryPointer(false);
      const onReorder = vi.fn();
      const rows = ({
        isDisabled = NONE,
        fixed = NONE,
        isReorderable = true,
      }: typeof change) => (
        <List
          reorderable={
            isReorderable
              ? createReorderable({
                  onReorder,
                  isReorderable: key => !fixed.includes(key as string),
                })
              : undefined
          }>
          {['A', 'B', 'C'].map(item => (
            <ListItem
              key={item}
              itemKey={item}
              label={item}
              isDisabled={isDisabled.includes(item)}
            />
          ))}
        </List>
      );
      const {rerender} = render(rows({}));
      const list = screen.getByRole('list');
      layOut(list);
      mouseDrag(handleOf('A'), 322, 322 + 70);
      expect(list).toHaveAttribute('data-astryx-reordering');
      rerender(rows(change));
      // No pointer reports this end: the session sends the row home.
      await waitFor(() =>
        expect(document.body).toHaveTextContent(
          'Reorder cancelled, back to position 1 of 3',
        ),
      );
      expect(list).not.toHaveAttribute('data-astryx-reordering');
      fireEvent.pointerUp(list, {...MOUSE, clientY: 322 + 70});
      expect(onReorder).not.toHaveBeenCalled();
      expect(labels()).toEqual(['A', 'B', 'C']);
    },
  );

  it("registers the slides' motion role only for a touch presentation's drag, before its first slide", () => {
    const drag = (coarse: boolean) => {
      stubPrimaryPointer(coarse);
      const {unmount} = render(<ReorderableRows initial={['A', 'B', 'C']} />);
      const list = screen.getByRole('list');
      layOut(list);
      const handle = handleOf('A');
      mouseDrag(handle, 322, 322);
      fireEvent.pointerCancel(handle, {...MOUSE, clientY: 322});
      unmount();
    };
    // A mouse's rows take their places at once: nothing registers.
    drag(false);
    expect(motionRole('reorder.slide.spring')).toBeUndefined();
    // Under a finger's presentation the rows slide on a role a theme may
    // retune.
    drag(true);
    expect(motionRole('reorder.slide.spring')).toBeDefined();
  });

  it('puts its listeners on the list: none on a row or a handle', () => {
    stubPrimaryPointer(true);
    const add = vi.spyOn(EventTarget.prototype, 'addEventListener');
    render(<ReorderableRows initial={['Inbox', 'Sent', 'Drafts']} />);
    const list = screen.getByRole('list');
    const targets = add.mock.contexts;
    const rows = Array.from(list.children);
    const handles = Array.from(
      list.querySelectorAll('[data-astryx-list-reorder]'),
    );
    expect(handles).toHaveLength(3);
    expect(
      targets.filter(target => handles.includes(target as Element)),
    ).toEqual([]);
    expect(targets.filter(target => rows.includes(target as Element))).toEqual(
      [],
    );
    expect(
      add.mock.calls.filter(
        (_, index) => targets[index] === list && _[0] === 'pointerdown',
      ),
    ).toHaveLength(1);
    add.mockRestore();
  });

  it('attaches one hold to the list where the primary pointer is coarse, and none where it is fine', () => {
    const attached = (coarse: boolean) => {
      stubPrimaryPointer(coarse);
      const host = getGestureHost(document);
      const attach = vi.spyOn(host, 'attach');
      const {unmount} = render(
        <ReorderableRows initial={['Inbox', 'Sent', 'Drafts']} />,
      );
      const elements = attach.mock.calls.map(([element]) => element);
      const list = screen.getByRole('list');
      unmount();
      attach.mockRestore();
      return {elements, list};
    };
    const coarse = attached(true);
    expect(coarse.elements).toEqual([coarse.list]);
    expect(attached(false).elements).toEqual([]);
  });

  it('listens for touches on the document only while the list is mounted', () => {
    // A touch screen: the hold attaches where the primary pointer is coarse.
    stubPrimaryPointer(true);
    // A document of its own, so no earlier test has touched it, in a window
    // whose primary pointer is the page's.
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const doc = frame.contentDocument as Document;
    Object.defineProperty(frame.contentWindow, 'matchMedia', {
      configurable: true,
      value: (query: string) => window.matchMedia(query),
    });
    const touches = new Set(['touchstart', 'touchend', 'touchcancel']);
    const added = vi.spyOn(doc, 'addEventListener');
    const removed = vi.spyOn(doc, 'removeEventListener');
    const mount = () => {
      const container = doc.createElement('div');
      doc.body.append(container);
      return render(<ReorderableRows initial={['Inbox', 'Sent']} />, {
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
    // Every touch listener the lists put on the document went with them.
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
    frame.remove();
  });

  it('with a fine primary pointer attaches no recognizer and registers no touch listener', () => {
    // spec:AST-094 FR19, FR24: a finger there gets the browser's defaults.
    stubPrimaryPointer(false);
    const doc = document.implementation.createHTMLDocument('fine');
    const added = vi.spyOn(doc, 'addEventListener');
    const container = doc.createElement('div');
    doc.body.append(container);
    const {unmount} = render(<ReorderableRows initial={['Inbox', 'Sent']} />, {
      container,
      baseElement: doc.body,
    });
    expect(
      added.mock.calls.filter(([type]) => type.startsWith('touch')),
    ).toEqual([]);
    unmount();
    added.mockRestore();
  });

  it('does not activate an interactive row from its handle', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List reorderable={createReorderable({onReorder: () => {}})}>
        <ListItem itemKey="inbox" label="Inbox" onClick={onClick} />
      </List>,
    );
    await user.click(handleOf('Inbox'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

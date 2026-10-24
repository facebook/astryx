// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListReorder.test.tsx
 * @input List with `onReorder`, ListItem `isReorderDisabled`, Testing Library
 * @output jsdom proofs of a reorderable List: each row gets a named reorder
 *   handle described by the list's instructions, a fixed row gets none and
 *   bounds the others, the handle's keys move its row (arrows, Home, End),
 *   Space picks it up and Escape puts it back, the moves are announced, the
 *   handle keeps focus across the commit of a move, modified keys move
 *   nothing, and a disabled row's handle stays focusable but inert
 * @position Tests for List/useListReorder.ts and List/ListReorderHandle.tsx;
 *   the touch and mouse drags are proven in a real browser by
 *   ListReorder.interaction.browser.spec.ts
 */

import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {List} from '../List';
import {ListItem} from '../ListItem';

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

const labels = () =>
  Array.from(document.querySelectorAll('li')).map(row => row.textContent);

describe('List onReorder', () => {
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

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListInput.test.tsx
 * @input Uses vitest, @testing-library/react, ListInput component
 * @output Unit tests for ListInput behavior, validation, focus, and reorder
 * @position Testing; validates ListInput.tsx implementation (RFC facebook/astryx#4531)
 *
 * SYNC: When ListInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ListInput} from './ListInput';
import type {
  ListInputChange,
  ListInputColumn,
  ListInputProps,
  ListInputRenderContext,
} from './ListInput';

// The useAnnounce live regions are singletons appended to document.body (not
// React-rendered), so testing-library cleanup leaves them behind. Clearing
// their text between tests keeps announcements from leaking across tests.
afterEach(() => {
  document
    .querySelectorAll('[data-astryx-live-region]')
    .forEach(node => (node.textContent = ''));
});

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}

type Guest = {id: string; name: string; email: string};

const guests: Guest[] = [
  {id: 'g1', name: 'Ada', email: 'ada@example.com'},
  {id: 'g2', name: 'Grace', email: 'grace@example.com'},
  {id: 'g3', name: 'Lin', email: 'lin@example.com'},
];

/** Render contexts captured by the probe email column, most recent last. */
let emailContexts: Array<ListInputRenderContext<Guest>> = [];

const columns: Array<ListInputColumn<Guest>> = [
  {
    key: 'name',
    header: 'Name',
    renderInput: ({item, updateItem, label, status, ...state}) => (
      <TextInput
        label={label}
        isLabelHidden
        value={item.name}
        onChange={name => updateItem({...item, name})}
        status={status}
        {...state}
      />
    ),
    renderValue: ({item}) => <span>NAME:{item.name}</span>,
  },
  {
    key: 'email',
    header: 'Email',
    renderInput: context => {
      emailContexts.push(context);
      const {item, updateItem, label, isDisabled} = context;
      return (
        <input
          aria-label={label}
          value={item.email}
          disabled={isDisabled}
          onChange={event => updateItem({...item, email: event.target.value})}
        />
      );
    },
  },
];

afterEach(() => {
  emailContexts = [];
});

type HarnessProps = Partial<Omit<ListInputProps<Guest>, 'onChange'>> & {
  initial?: Guest[];
  onChange?: (next: Guest[], change: ListInputChange<Guest>) => void;
};

/** Controlled harness: applies every change so the rendered list stays live. */
function Harness({initial = guests, onChange, ...rest}: HarnessProps) {
  const [value, setValue] = useState(initial);
  return (
    <ListInput
      label="Guests"
      itemName="guest"
      value={value}
      onChange={(next, change) => {
        setValue(next);
        onChange?.(next, change);
      }}
      getItemKey={guest => guest.id}
      createItem={() => ({id: 'new-1', name: '', email: ''})}
      columns={columns}
      {...rest}
    />
  );
}

/** Data-row order, read as the Name column's values top to bottom. */
function nameValues(): string[] {
  return screen
    .getAllByLabelText(/^Name, guest \d+$/)
    .map(input => (input as HTMLInputElement).value);
}

// =============================================================================
// Semantics
// =============================================================================

describe('semantics', () => {
  it('renders a table named by the field label with a column header per column', () => {
    render(<Harness />);
    const table = screen.getByRole('table');
    expect(table).toHaveAccessibleName('Guests');
    expect(
      screen.getByRole('columnheader', {name: 'Name'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Email'}),
    ).toBeInTheDocument();
  });

  it('associates the description with the table', () => {
    render(<Harness description="Who is coming." />);
    expect(screen.getByRole('table')).toHaveAccessibleDescription(
      'Who is coming.',
    );
  });

  it('labels every cell input with column and item position', () => {
    render(<Harness />);
    expect(screen.getByLabelText('Name, guest 1')).toHaveValue('Ada');
    expect(screen.getByLabelText('Email, guest 3')).toHaveValue(
      'lin@example.com',
    );
  });

  it('renders specifically-named Add, Remove, and Reorder controls', () => {
    render(<Harness isReorderable />);
    expect(screen.getByRole('button', {name: 'Add guest'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Remove guest 2'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Reorder guest 3'}),
    ).toBeInTheDocument();
  });

  it('renders no reorder handles unless isReorderable is set', () => {
    render(<Harness />);
    expect(
      screen.queryByRole('button', {name: /^Reorder guest/}),
    ).not.toBeInTheDocument();
  });

  it('renders only headers and the Add action when the collection is empty', () => {
    render(<Harness initial={[]} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Name, guest/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Add guest'})).toBeEnabled();
  });
});

// =============================================================================
// Add
// =============================================================================

describe('add', () => {
  it('adds a created item at the end and reports an add change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(screen.getByRole('button', {name: 'Add guest'}));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [next, change] = onChange.mock.calls[0];
    expect(next).toEqual([...guests, {id: 'new-1', name: '', email: ''}]);
    expect(change).toEqual({
      type: 'add',
      item: {id: 'new-1', name: '', email: ''},
      key: 'new-1',
      index: 3,
    });
  });

  it('focuses the first editable control of the new row after add', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', {name: 'Add guest'}));

    await waitFor(() => {
      expect(screen.getByLabelText('Name, guest 4')).toHaveFocus();
    });
  });

  it('disables Add at maxItems', () => {
    render(<Harness maxItems={3} />);
    expect(screen.getByRole('button', {name: 'Add guest'})).toBeDisabled();
  });
});

// =============================================================================
// Update
// =============================================================================

describe('update', () => {
  it('applies updateItem to the right item and reports the column key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.type(screen.getByLabelText('Email, guest 2'), '!');

    const [next, change] = onChange.mock.calls.at(-1)!;
    expect(next[1]).toEqual({
      id: 'g2',
      name: 'Grace',
      email: 'grace@example.com!',
    });
    expect(change).toEqual({
      type: 'update',
      item: next[1],
      key: 'g2',
      index: 1,
      columnKey: 'email',
    });
  });

  it('leaves sibling items referentially untouched on update', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.type(screen.getByLabelText('Email, guest 2'), '!');

    const [next] = onChange.mock.calls.at(-1)!;
    expect(next[0]).toBe(guests[0]);
    expect(next[2]).toBe(guests[2]);
  });
});

// =============================================================================
// Remove
// =============================================================================

describe('remove', () => {
  it('removes the item and reports a remove change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(screen.getByRole('button', {name: 'Remove guest 1'}));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [next, change] = onChange.mock.calls[0];
    expect(next).toEqual([guests[1], guests[2]]);
    expect(change).toEqual({
      type: 'remove',
      item: guests[0],
      key: 'g1',
      index: 0,
    });
  });

  it("moves focus to the next row's remove action after removal", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', {name: 'Remove guest 1'}));

    // The former guest 2 is now guest 1; its remove action holds focus.
    await waitFor(() => {
      expect(
        screen.getByRole('button', {name: 'Remove guest 1'}),
      ).toHaveFocus();
    });
    expect(nameValues()).toEqual(['Grace', 'Lin']);
  });

  it('moves focus to the previous remove action when the last row is removed', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', {name: 'Remove guest 3'}));

    await waitFor(() => {
      expect(
        screen.getByRole('button', {name: 'Remove guest 2'}),
      ).toHaveFocus();
    });
  });

  it('moves focus to Add and still removes when the only, invalid row is removed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        initial={[guests[0]]}
        onChange={onChange}
        status={{type: 'error', message: 'At least one guest is required.'}}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Remove guest 1'}));

    expect(onChange).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'Add guest'})).toHaveFocus();
    });
  });
});

// =============================================================================
// Validation
// =============================================================================

describe('validation', () => {
  it('passes field status into the column render context', () => {
    render(
      <Harness
        getFieldStatus={(guest, columnKey) =>
          guest.id === 'g2' && columnKey === 'email'
            ? {type: 'error', message: 'Email looks wrong.'}
            : undefined
        }
      />,
    );

    const g2Context = emailContexts.find(ctx => ctx.item.id === 'g2');
    expect(g2Context?.status).toEqual({
      type: 'error',
      message: 'Email looks wrong.',
    });
    const g1Context = emailContexts.find(ctx => ctx.item.id === 'g1');
    expect(g1Context?.status).toBeUndefined();
  });

  it('renders an item-scope message associated with its row', () => {
    render(
      <Harness
        getItemStatus={guest =>
          guest.id === 'g2'
            ? {type: 'error', message: 'Guest 2 is incomplete.'}
            : undefined
        }
      />,
    );

    const row = screen.getByLabelText('Name, guest 2').closest('tr');
    const describedBy = row?.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const message = document.getElementById(describedBy!);
    expect(message).toHaveTextContent('Guest 2 is incomplete.');
  });

  it('renders the list-scope message after the Add action', () => {
    render(
      <Harness
        status={{type: 'error', message: 'At least two guests are required.'}}
      />,
    );

    const message = screen.getByText('At least two guests are required.');
    const addButton = screen.getByRole('button', {name: 'Add guest'});
    expect(
      addButton.compareDocumentPosition(message) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('keeps item messages attached to their items across external reorder', () => {
    const props = {
      label: 'Guests',
      itemName: 'guest',
      onChange: () => {},
      getItemKey: (guest: Guest) => guest.id,
      createItem: () => ({id: 'new-1', name: '', email: ''}),
      columns,
      getItemStatus: (guest: Guest) =>
        guest.id === 'g1'
          ? {type: 'error' as const, message: 'Guest incomplete.'}
          : undefined,
    };
    const {rerender} = render(<ListInput {...props} value={guests} />);

    rerender(<ListInput {...props} value={[...guests].reverse()} />);

    // g1 (Ada) moved from position 1 to position 3 — its message moves too.
    expect(nameValues()).toEqual(['Lin', 'Grace', 'Ada']);
    const adaRow = screen
      .getByDisplayValue('Ada')
      .closest('tr') as HTMLTableRowElement;
    const describedBy = adaRow.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent(
      'Guest incomplete.',
    );
    // The old position (now Lin's row) carries no leftover association.
    const linRow = screen
      .getByDisplayValue('Lin')
      .closest('tr') as HTMLTableRowElement;
    expect(linRow).not.toHaveAttribute('aria-describedby');
  });
});

// =============================================================================
// Keyboard reorder
// =============================================================================

describe('keyboard reorder', () => {
  it('grabs a row with the reorder handle and announces instructions', async () => {
    const user = userEvent.setup();
    render(<Harness isReorderable />);

    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    await user.click(handle);

    expect(handle).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent(
        'Grabbed guest 1 of 3. Use the arrow keys to move, space to drop, escape to cancel.',
      );
    });
  });

  it('moves the grabbed row with ArrowDown, previewing without committing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness isReorderable onChange={onChange} />);

    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    await user.click(handle);
    await user.keyboard('{ArrowDown}');

    expect(nameValues()).toEqual(['Grace', 'Ada', 'Lin']);
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('Moved to position 2 of 3.');
    });
  });

  it('commits the reorder on drop and reports a reorder change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness isReorderable onChange={onChange} />);

    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    await user.click(handle);
    await user.keyboard('{ArrowDown}');
    await user.keyboard(' ');

    expect(onChange).toHaveBeenCalledTimes(1);
    const [next, change] = onChange.mock.calls[0];
    expect((next as Guest[]).map(guest => guest.id)).toEqual([
      'g2',
      'g1',
      'g3',
    ]);
    expect(change).toEqual({
      type: 'reorder',
      item: guests[0],
      key: 'g1',
      fromIndex: 0,
      toIndex: 1,
    });
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('Dropped at position 2 of 3.');
    });
  });

  it("keeps focus on the moved row's handle after drop", async () => {
    const user = userEvent.setup();
    render(<Harness isReorderable />);

    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    await user.click(handle);
    await user.keyboard('{ArrowDown}');
    await user.keyboard(' ');

    // Same DOM node, now labeled for its new position.
    expect(handle).toHaveFocus();
    expect(handle).toHaveAccessibleName('Reorder guest 2');
    expect(handle).toHaveAttribute('aria-pressed', 'false');
  });

  it('cancels with Escape and restores the original order without committing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness isReorderable onChange={onChange} />);

    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    await user.click(handle);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Escape}');

    expect(nameValues()).toEqual(['Ada', 'Grace', 'Lin']);
    expect(onChange).not.toHaveBeenCalled();
    expect(handle).toHaveAttribute('aria-pressed', 'false');
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('Reorder canceled.');
    });
  });

  it('ignores ArrowUp at the top boundary', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness isReorderable onChange={onChange} />);

    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    await user.click(handle);
    await user.keyboard('{ArrowUp}');

    expect(nameValues()).toEqual(['Ada', 'Grace', 'Lin']);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cancels an active grab when the value changes externally', async () => {
    const user = userEvent.setup();
    const props = {
      label: 'Guests',
      itemName: 'guest',
      onChange: () => {},
      getItemKey: (guest: Guest) => guest.id,
      createItem: () => ({id: 'new-1', name: '', email: ''}),
      columns,
      isReorderable: true,
    };
    const {rerender} = render(<ListInput {...props} value={guests} />);

    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    await user.click(handle);
    expect(handle).toHaveAttribute('aria-pressed', 'true');

    rerender(
      <ListInput
        {...props}
        value={[...guests, {id: 'g4', name: 'New', email: ''}]}
      />,
    );

    expect(handle).toHaveAttribute('aria-pressed', 'false');
    expect(nameValues()).toEqual(['Ada', 'Grace', 'Lin', 'New']);
  });
});

// =============================================================================
// Pointer reorder
// =============================================================================

describe('pointer reorder', () => {
  it('commits a pointer drag through the same single onChange path', async () => {
    const onChange = vi.fn();
    render(<Harness isReorderable onChange={onChange} />);

    const handles = screen.getAllByRole('button', {name: /^Reorder guest/});
    const rows = handles.map(
      handle => handle.closest('tr') as HTMLTableRowElement,
    );
    rows.forEach((row, index) => {
      vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({
        top: index * 40,
        bottom: index * 40 + 40,
        height: 40,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: index * 40,
        toJSON: () => ({}),
      } as DOMRect);
    });

    // Drag guest 1's handle from y=20 to y=70 (inside row 2's slot), then drop.
    fireEvent.pointerDown(handles[0], {clientY: 20, pointerId: 1, button: 0});
    fireEvent.pointerMove(window, {clientY: 70, pointerId: 1});
    expect(nameValues()).toEqual(['Grace', 'Ada', 'Lin']);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.pointerUp(window, {clientY: 70, pointerId: 1});
    expect(onChange).toHaveBeenCalledTimes(1);
    const [next, change] = onChange.mock.calls[0];
    expect((next as Guest[]).map(guest => guest.id)).toEqual([
      'g2',
      'g1',
      'g3',
    ]);
    expect(change).toMatchObject({type: 'reorder', fromIndex: 0, toIndex: 1});
  });
});

// =============================================================================
// States
// =============================================================================

describe('states', () => {
  it('disables every control when isDisabled', () => {
    render(<Harness isReorderable isDisabled />);

    expect(screen.getByRole('button', {name: 'Add guest'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Remove guest 1'})).toBeDisabled();
    expect(
      screen.getByRole('button', {name: 'Reorder guest 1'}),
    ).toBeDisabled();
    expect(emailContexts.at(-1)?.isDisabled).toBe(true);
    expect(screen.getByLabelText('Email, guest 3')).toBeDisabled();
  });

  it('marks the table busy and disables controls when isLoading', () => {
    render(<Harness isReorderable isLoading />);

    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', {name: 'Add guest'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Remove guest 2'})).toBeDisabled();
    expect(
      screen.getByRole('button', {name: 'Reorder guest 2'}),
    ).toBeDisabled();
    expect(emailContexts.at(-1)?.isDisabled).toBe(true);
  });

  it('renders values instead of inputs when isReadOnly', () => {
    render(<Harness isReorderable isReadOnly />);

    // Name column has renderValue; email column falls back to the raw value.
    expect(screen.getByText('NAME:Ada')).toBeInTheDocument();
    expect(screen.getByText('grace@example.com')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Name, guest/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Add guest'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /^Remove guest/}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /^Reorder guest/}),
    ).not.toBeInTheDocument();
  });
});

// =============================================================================
// Stable identity
// =============================================================================

describe('stable identity', () => {
  it('preserves DOM nodes for rows across external reorder', () => {
    const props = {
      label: 'Guests',
      itemName: 'guest',
      onChange: () => {},
      getItemKey: (guest: Guest) => guest.id,
      createItem: () => ({id: 'new-1', name: '', email: ''}),
      columns,
    };
    const {rerender} = render(<ListInput {...props} value={guests} />);
    // Ada moves from position 1 to position 3 in the reversed order, so an
    // index-keyed row would render her value in a different DOM node.
    const adaInput = screen.getByDisplayValue('ada@example.com');

    rerender(<ListInput {...props} value={[...guests].reverse()} />);

    // Same node, new position: values, DOM identity, and focusability survive.
    expect(screen.getByDisplayValue('ada@example.com')).toBe(adaInput);
    expect(nameValues()).toEqual(['Lin', 'Grace', 'Ada']);
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListInput.test.tsx
 * @input Uses Vitest, Testing Library, and the controlled ListInput API
 * @output Behavioral coverage for list editing, validation, focus, and free-floating stationary-list reordering
 * @position Lab tests; validates ListInput.tsx
 *
 * SYNC: When ListInput.tsx behavior changes, update these tests.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {useState} from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ListInput,
  type ListInputColumn,
  type ListInputProps,
} from './ListInput';

type Guest = {
  id: string;
  name: string;
};

const guests: Guest[] = [
  {id: 'ada', name: 'Ada'},
  {id: 'grace', name: 'Grace'},
];

const createdGuest: Guest = {id: 'linus', name: 'Linus'};

const columns = [
  {
    key: 'name',
    header: 'Name',
    renderInput: ({
      item,
      label,
      isLabelHidden,
      status,
      statusVariant,
      isDisabled,
      isLoading,
      updateItem,
    }) => (
      <label>
        <span hidden={isLabelHidden}>{label}</span>
        <input
          aria-invalid={status?.type === 'error' || undefined}
          aria-label={label}
          data-label-hidden={String(isLabelHidden)}
          data-status-type={status?.type}
          data-status-message={status?.message}
          data-status-variant={statusVariant}
          disabled={isDisabled || isLoading}
          value={item.name}
          onChange={event =>
            updateItem({...item, name: event.currentTarget.value}, 'name')
          }
        />
      </label>
    ),
  },
] satisfies ListInputColumn<Guest>[];

const nativeStatusColumns = [
  {
    key: 'name',
    header: 'Name',
    renderInput: ({
      item,
      label,
      isLabelHidden,
      status,
      statusVariant,
      isDisabled,
      isLoading,
      updateItem,
    }) => (
      <TextInput
        label={label}
        isLabelHidden={isLabelHidden}
        value={item.name}
        status={status}
        statusVariant={statusVariant}
        isDisabled={isDisabled}
        isLoading={isLoading}
        onChange={name => updateItem({...item, name}, 'name')}
      />
    ),
  },
] satisfies ListInputColumn<Guest>[];

function renderListInput(overrides: Partial<ListInputProps<Guest>> = {}) {
  const props: ListInputProps<Guest> = {
    label: 'Guests',
    itemName: 'guest',
    value: guests,
    onChange: () => {},
    getItemKey: guest => guest.id,
    createItem: () => createdGuest,
    columns,
    ...overrides,
  };

  return render(<ListInput<Guest> {...props} />);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ListInput', () => {
  it('uses list semantics and shows field labels only on the first record', () => {
    renderListInput();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('data-label-hidden', 'true');
    expect(inputs[0]).toHaveAccessibleName('Name');
    expect(inputs[1]).toHaveAttribute('data-label-hidden', 'true');
    expect(inputs[1]).toHaveAccessibleName('Name, guest 2 of 2');
    expect(inputs[0]).toHaveAttribute('data-status-variant', 'tooltip');
    const primaryLabel = document.querySelector(
      '[data-list-input-column-label="primary"]',
    );
    const responsiveLabel = document.querySelector(
      '[data-list-input-column-label="responsive"]',
    );
    expect(primaryLabel).toHaveTextContent('Name');
    expect(primaryLabel).toHaveAttribute('aria-hidden', 'true');
    expect(responsiveLabel).toHaveTextContent('Name');
    expect(responsiveLabel).toHaveAttribute('aria-hidden', 'true');
    expect(primaryLabel?.closest('[data-list-input-cell]')).toContainElement(
      inputs[0],
    );
    expect(responsiveLabel?.closest('[data-list-input-cell]')).toContainElement(
      inputs[1],
    );
  });

  it('renders a compact centered EmptyState and keeps Add available', () => {
    const {container} = renderListInput({value: []});

    const emptyState = container.querySelector<HTMLElement>(
      '.astryx-empty-state',
    );
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveClass('astryx-empty-state', 'compact');
    expect(emptyState).toHaveAttribute('data-variant', 'compact');
    expect(getComputedStyle(emptyState!).alignItems).toBe('center');
    expect(getComputedStyle(emptyState!).justifyContent).toBe('center');
    expect(getComputedStyle(emptyState!).textAlign).toBe('center');
    expect(
      screen.getByRole('heading', {name: 'No guests yet'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Add a guest to get started.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Add guest'})).toBeEnabled();
  });

  it('emits add and remove changes with the affected item and index', () => {
    const onChange = vi.fn();
    renderListInput({onChange});

    fireEvent.click(screen.getByRole('button', {name: 'Add guest'}));
    expect(onChange).toHaveBeenCalledWith([...guests, createdGuest], {
      type: 'add',
      item: createdGuest,
      index: 2,
    });

    onChange.mockClear();
    fireEvent.click(screen.getByRole('button', {name: 'Remove guest 1'}));
    expect(onChange).toHaveBeenCalledWith([guests[1]], {
      type: 'remove',
      item: guests[0],
      index: 0,
    });
  });

  it('renders list/item messages and presents field messages in a tooltip', () => {
    renderListInput({
      columns: nativeStatusColumns,
      status: {type: 'error', message: 'Add at least three guests'},
      getItemStatus: guest =>
        guest.id === 'ada'
          ? {type: 'error', message: 'This guest is duplicated'}
          : undefined,
      getFieldStatus: (guest, columnKey) =>
        guest.id === 'ada' && columnKey === 'name'
          ? {type: 'error', message: 'Enter a different name'}
          : undefined,
    });

    expect(screen.getByText('Add at least three guests')).toBeInTheDocument();
    expect(screen.getByText('This guest is duplicated')).toBeInTheDocument();
    const firstInput = screen.getAllByRole('textbox')[0];
    expect(firstInput).toHaveAttribute('aria-invalid', 'true');
    const tooltip = screen
      .getAllByRole('tooltip', {hidden: true})
      .find(node => node.textContent === 'Enter a different name');
    expect(tooltip).toBeDefined();
    expect(tooltip).toHaveTextContent('Enter a different name');
    expect(firstInput.getAttribute('aria-describedby')).toContain(tooltip!.id);
    const fieldCell = firstInput.closest('[data-list-input-cell]');
    expect(fieldCell?.querySelector('.astryx-field-status')).toBeNull();
    expect(
      within(fieldCell as HTMLElement).getByRole('button', {
        name: /error details/i,
      }),
    ).toBeInTheDocument();
    expect(
      firstInput.closest('[role="group"][aria-invalid="true"]'),
    ).toBeNull();

    const itemStatus = screen
      .getByText('This guest is duplicated')
      .closest('[data-list-input-item-status]');
    const itemRow = document.querySelector('[data-list-input-row="ada"]');
    expect(itemStatus).toBeDefined();
    expect(itemStatus?.parentElement).toBe(itemRow);
    expect(
      screen.getAllByRole('listitem')[0].getAttribute('aria-describedby'),
    ).toContain(itemStatus?.id);
  });

  it('fills the fields track with Add and omits reorder handles by default', () => {
    const {container} = renderListInput();

    const addContent = container.querySelector('[data-list-input-add-content]');
    expect(addContent).toContainElement(
      screen.getByRole('button', {name: 'Add guest'}),
    );
    expect(
      screen.queryByRole('button', {name: 'Reorder guest 1'}),
    ).not.toBeInTheDocument();
  });

  it('supports consumer-owned validation that appears after blur', () => {
    function BlurValidatedList() {
      const [value, setValue] = useState<Guest[]>([guests[0]]);
      const [touchedItems, setTouchedItems] = useState<ReadonlySet<string>>(
        () => new Set(),
      );
      const blurColumns = [
        {
          key: 'name',
          header: 'Name',
          renderInput: ({
            item,
            label,
            isLabelHidden,
            status,
            statusVariant,
            updateItem,
          }) => (
            <TextInput
              label={label}
              isLabelHidden={isLabelHidden}
              value={item.name}
              status={status}
              statusVariant={statusVariant}
              onChange={name => updateItem({...item, name}, 'name')}
              onBlur={() =>
                setTouchedItems(current => {
                  const next = new Set(current);
                  next.add(item.id);
                  return next;
                })
              }
            />
          ),
        },
      ] satisfies ListInputColumn<Guest>[];

      return (
        <ListInput<Guest>
          label="Guests"
          itemName="guest"
          value={value}
          onChange={nextValue => setValue(nextValue)}
          getItemKey={guest => guest.id}
          createItem={() => ({id: 'blank', name: ''})}
          columns={blurColumns}
          getFieldStatus={(guest, columnKey) =>
            touchedItems.has(guest.id) &&
            columnKey === 'name' &&
            guest.name.trim() === ''
              ? {type: 'error', message: 'Enter a name'}
              : undefined
          }
        />
      );
    }

    render(<BlurValidatedList />);
    fireEvent.click(screen.getByRole('button', {name: 'Add guest'}));

    const addedInput = screen.getByRole('textbox', {
      name: 'Name, guest 2 of 2',
    });
    expect(addedInput).toHaveFocus();
    expect(addedInput).not.toHaveAttribute('aria-invalid');
    expect(
      screen
        .queryAllByRole('tooltip', {hidden: true})
        .some(node => node.textContent === 'Enter a name'),
    ).toBe(false);

    fireEvent.blur(addedInput);

    expect(
      screen.getByRole('textbox', {name: 'Name, guest 2 of 2'}),
    ).toHaveAttribute('aria-invalid', 'true');
    expect(
      screen
        .getAllByRole('tooltip', {hidden: true})
        .some(node => node.textContent === 'Enter a name'),
    ).toBe(true);
  });

  it('disables Add at maxItems while keeping removal available', () => {
    const onChange = vi.fn();

    renderListInput({maxItems: 2, onChange});

    expect(screen.getByRole('button', {name: 'Add guest'})).toBeDisabled();
    const remove = screen.getByRole('button', {name: 'Remove guest 1'});
    expect(remove).toBeEnabled();

    fireEvent.click(remove);
    expect(onChange).toHaveBeenCalledWith([guests[1]], {
      type: 'remove',
      item: guests[0],
      index: 0,
    });
  });

  it('moves a focused handle with arrow keys without showing a tooltip', () => {
    const onChange = vi.fn();

    function ArrowReorderList() {
      const [value, setValue] = useState(guests);
      return (
        <ListInput<Guest>
          label="Guests"
          itemName="guest"
          value={value}
          onChange={(nextValue, change) => {
            onChange(nextValue, change);
            setValue(nextValue);
          }}
          getItemKey={guest => guest.id}
          createItem={() => createdGuest}
          columns={columns}
          isReorderable
        />
      );
    }

    render(<ArrowReorderList />);
    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    expect(
      screen
        .queryAllByRole('tooltip', {hidden: true})
        .some(tooltip => tooltip.textContent === 'Reorder guest 1'),
    ).toBe(false);
    expect(handle).toHaveAccessibleDescription(
      'Use Arrow Up or Arrow Down to move this item one position. Press Space or Enter to pick it up for extended keyboard reordering.',
    );

    handle.focus();
    fireEvent.keyDown(handle, {key: 'ArrowDown', altKey: true});
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(handle, {key: 'ArrowUp'});
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(handle, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([guests[1], guests[0]], {
      type: 'reorder',
      item: guests[0],
      fromIndex: 0,
      toIndex: 1,
    });
    expect(
      screen
        .getAllByRole('textbox')
        .map(input => (input as HTMLInputElement).value),
    ).toEqual(['Grace', 'Ada']);
    expect(handle).toHaveFocus();
    expect(handle).toHaveAccessibleName('Reorder guest 2');
    expect(
      document.querySelector('[data-list-input-reorder-source]'),
    ).not.toBeInTheDocument();
  });

  it('commits a keyboard reorder with change metadata', () => {
    const onChange = vi.fn();
    renderListInput({isReorderable: true, onChange});
    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});
    expect(handle.querySelectorAll('circle')).toHaveLength(6);

    handle.focus();
    fireEvent.keyDown(handle, {key: ' ', code: 'Space'});
    let source = document.querySelector('[data-list-input-reorder-source]');
    expect(source?.closest('li')).toHaveAttribute('aria-posinset', '1');
    expect(source?.querySelector('input')).toHaveValue('Ada');

    fireEvent.keyDown(handle, {key: 'ArrowDown'});
    source = document.querySelector('[data-list-input-reorder-source]');
    expect(source?.closest('li')).toHaveAttribute('aria-posinset', '2');
    expect(source?.querySelector('input')).toHaveValue('Ada');

    fireEvent.keyDown(handle, {key: 'Enter'});

    expect(onChange).toHaveBeenCalledWith([guests[1], guests[0]], {
      type: 'reorder',
      item: guests[0],
      fromIndex: 0,
      toIndex: 1,
    });
    expect(
      document.querySelector('[data-list-input-reorder-source]'),
    ).not.toBeInTheDocument();
  });

  it('keeps pointer order stationary, follows both pointer axes, and commits once', () => {
    const onChange = vi.fn();
    const {container} = renderListInput({
      isReorderable: true,
      onChange,
      value: [...guests, createdGuest],
    });
    const rows = container.querySelectorAll<HTMLElement>(
      '[data-list-input-row]',
    );
    vi.spyOn(rows[0], 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 400,
      bottom: 40,
      left: 0,
      width: 400,
      height: 40,
      toJSON: () => {},
    });
    vi.spyOn(rows[1], 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 40,
      top: 40,
      right: 400,
      bottom: 80,
      left: 0,
      width: 400,
      height: 40,
      toJSON: () => {},
    });
    vi.spyOn(rows[2], 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 80,
      top: 80,
      right: 400,
      bottom: 120,
      left: 0,
      width: 400,
      height: 40,
      toJSON: () => {},
    });
    const remove = screen.getByRole('button', {name: 'Remove guest 2'});
    const handle = screen.getByRole('button', {name: 'Reorder guest 2'});
    expect(within(rows[1]).getAllByRole('button')).toEqual([remove, handle]);

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 7,
      clientX: 300,
      clientY: 50,
    });

    const source = container.querySelector<HTMLElement>(
      '[data-list-input-reorder-source]',
    );
    const preview = document.querySelector<HTMLElement>(
      '[data-list-input-drag-preview]',
    );
    const previewLayer = preview?.closest<HTMLElement>('[popover="manual"]');
    expect(source).toBe(rows[1]);
    expect(getComputedStyle(source!).opacity).toBe('0.5');
    expect(container).toContainElement(preview);
    expect(preview).toBeInTheDocument();
    expect(previewLayer).toBeInTheDocument();
    expect(getComputedStyle(previewLayer!).opacity).toBe('0.5');
    expect(preview).toHaveAttribute('aria-hidden', 'true');
    expect(preview?.querySelector('input')).toHaveValue('Grace');
    expect(previewLayer!.style.getPropertyValue('--x-transform')).toBe(
      'translate3d(0px, 40px, 0)',
    );
    expect(
      container.querySelector('[data-list-input-drop-target]'),
    ).not.toBeInTheDocument();

    fireEvent.pointerMove(handle, {pointerId: 7, clientX: 345, clientY: 5});
    expect(previewLayer!.style.getPropertyValue('--x-transform')).toBe(
      'translate3d(45px, -5px, 0)',
    );
    expect([
      ...container.querySelectorAll<HTMLElement>('[data-list-input-row]'),
    ]).toEqual([...rows]);
    expect(
      screen
        .getAllByRole('textbox')
        .map(input => (input as HTMLInputElement).value),
    ).toEqual(['Ada', 'Grace', 'Linus']);
    expect(onChange).not.toHaveBeenCalled();
    expect(rows[0].closest('li')).toHaveAttribute(
      'data-list-input-drop-target',
      'before',
    );

    fireEvent.pointerMove(handle, {pointerId: 7, clientX: 245, clientY: 115});
    expect(previewLayer!.style.getPropertyValue('--x-transform')).toBe(
      'translate3d(-55px, 105px, 0)',
    );
    expect(rows[0].closest('li')).not.toHaveAttribute(
      'data-list-input-drop-target',
    );
    expect(rows[2].closest('li')).toHaveAttribute(
      'data-list-input-drop-target',
      'after',
    );
    expect([
      ...container.querySelectorAll<HTMLElement>('[data-list-input-row]'),
    ]).toEqual([...rows]);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.pointerUp(handle, {pointerId: 7, clientX: 245, clientY: 115});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      [guests[0], createdGuest, guests[1]],
      {
        type: 'reorder',
        item: guests[1],
        fromIndex: 1,
        toIndex: 2,
      },
    );
    expect(
      document.querySelector('[data-list-input-drop-target]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-list-input-drag-preview]'),
    ).not.toBeInTheDocument();
  });

  it('clears a sub-threshold pointer drag without reordering', () => {
    const onChange = vi.fn();
    const {container} = renderListInput({isReorderable: true, onChange});
    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 8,
      clientX: 10,
      clientY: 10,
    });
    expect(
      fireEvent.pointerMove(handle, {
        pointerId: 8,
        clientX: 14,
        clientY: 10,
      }),
    ).toBe(true);

    expect(
      container.querySelector('[data-list-input-reorder-source]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-list-input-drag-preview]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-list-input-drop-target]'),
    ).not.toBeInTheDocument();

    fireEvent.pointerUp(handle, {pointerId: 8, clientX: 14, clientY: 10});

    expect(onChange).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-list-input-reorder-source]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-list-input-drag-preview]'),
    ).not.toBeInTheDocument();
  });

  it('activates a pointer drag after horizontal threshold movement', () => {
    const onChange = vi.fn();
    renderListInput({isReorderable: true, onChange});
    const rows = document.querySelectorAll<HTMLElement>(
      '[data-list-input-row]',
    );
    vi.spyOn(rows[1], 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 40,
      top: 40,
      right: 400,
      bottom: 80,
      left: 0,
      width: 400,
      height: 40,
      toJSON: () => {},
    });

    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});

    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 9,
      clientX: 10,
      clientY: 10,
    });

    expect(
      fireEvent.pointerMove(handle, {
        pointerId: 9,
        clientX: 15,
        clientY: 10,
      }),
    ).toBe(false);

    fireEvent.pointerUp(handle, {pointerId: 9, clientX: 15, clientY: 10});

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText('guest returned to position 1.'),
    ).toBeInTheDocument();
  });

  it('cancels a keyboard reorder with Escape', () => {
    const onChange = vi.fn();
    renderListInput({isReorderable: true, onChange});
    const handle = screen.getByRole('button', {name: 'Reorder guest 1'});

    handle.focus();
    fireEvent.keyDown(handle, {key: 'Enter'});
    fireEvent.keyDown(handle, {key: 'ArrowDown'});
    fireEvent.keyDown(handle, {key: 'Escape'});

    expect(onChange).not.toHaveBeenCalled();
    expect(
      document.querySelector('[data-list-input-reorder-source]'),
    ).not.toBeInTheDocument();
    expect(
      screen
        .getAllByRole('textbox')
        .map(input => (input as HTMLInputElement).value),
    ).toEqual(['Ada', 'Grace']);
  });

  it('warns in development when getItemKey returns a duplicate key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderListInput({
      value: [guests[0], {...guests[1], id: guests[0].id}],
    });

    expect(warn.mock.calls.flat().join(' ')).toContain(
      'ListInput: getItemKey returned duplicate key',
    );
  });
});

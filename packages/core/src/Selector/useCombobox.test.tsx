// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useCombobox.test.tsx
 * @input Uses vitest, @testing-library/react, @testing-library/user-event,
 *   useCombobox, the shared announcer and the layer dismissal stack
 * @output Unit tests for useCombobox over a text field the caller renders
 * @position Tests; validates the field props, keys, pointer model and result
 *   announcements of hooks.ts against spec:AST-075 FR1–FR7
 *
 * SYNC: When useCombobox's field props or keys change, update these tests.
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRef, useState, type ReactNode} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  COMBOBOX_PATTERN,
  expectAccessibilitySpec,
  type ComboboxStateFacts,
} from '@astryxdesign/a11y-spec';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {resetLayerStackForTests} from '../Layer/layerStack';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {useCombobox} from './hooks';

type Person = {value: string; label: string; disabled?: boolean};
type Field = 'input' | 'textarea' | 'contenteditable';

const PEOPLE: Person[] = [
  {value: 'ada', label: 'Ada'},
  {value: 'bea', label: 'Bea', disabled: true},
  {value: 'cy', label: 'Cy'},
];

afterEach(() => {
  __resetLiveRegionsForTest();
  resetLayerStackForTests();
});

interface PickerProps {
  field: Field;
  options?: Person[];
  isInitiallyOpen?: boolean;
  query?: string;
  onSelect?: (value: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onFieldKeyDown?: (event: React.KeyboardEvent) => void;
}

/** A field the test renders itself, with its list in the page's flow. */
function Picker({
  field,
  options = PEOPLE,
  isInitiallyOpen = true,
  query,
  onSelect,
  onOpen,
  onClose,
  onFieldKeyDown,
}: PickerProps) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const combobox = useCombobox({
    selectableItems: options,
    isOpen,
    onOpen: () => {
      onOpen?.();
      setIsOpen(true);
    },
    onClose: () => {
      onClose?.();
      setIsOpen(false);
    },
    onSelect,
    listboxId: 'people',
    field,
    query,
  });
  const fieldProps = combobox.getFieldProps({onKeyDown: onFieldKeyDown});
  return (
    <>
      {field === 'input' ? (
        <input aria-label="To" {...fieldProps} />
      ) : field === 'textarea' ? (
        <textarea aria-label="Message" {...fieldProps} />
      ) : (
        <div
          contentEditable
          suppressContentEditableWarning
          aria-label="Message"
          {...fieldProps}
        />
      )}
      {isOpen && options.length > 0 ? (
        <div aria-label="People" {...combobox.getListboxProps()}>
          {options.map((person, index) => (
            <div key={person.value} {...combobox.getOptionProps(index)}>
              {person.label}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

/** A registered layer, like a Dialog or Popover, around the field. */
function Layer({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useLayerDismissal({
    isActive: true,
    onDismiss,
    getContainer: () => containerRef.current,
  });
  return (
    <div ref={containerRef}>
      <LayerDepthProvider>{children}</LayerDepthProvider>
    </div>
  );
}

function fieldFor(field: Field): HTMLElement {
  return field === 'textarea'
    ? screen.getByRole('textbox', {name: 'Message'})
    : screen.getByRole('combobox', {
        name: field === 'input' ? 'To' : 'Message',
      });
}

function option(name: string): HTMLElement {
  return screen.getByRole('option', {name});
}

describe('useCombobox field props — roles and state (FR1–FR3)', () => {
  it.each(['input', 'contenteditable'] as const)(
    'a hidden list leaves the %s collapsed with nothing to reference',
    field => {
      render(<Picker field={field} isInitiallyOpen={false} />);
      const box = fieldFor(field);
      expect(box).toHaveAttribute('role', 'combobox');
      expect(box).toHaveAttribute('aria-autocomplete', 'list');
      expect(box).toHaveAttribute('aria-expanded', 'false');
      expect(box).not.toHaveAttribute('aria-controls');
      expect(box).not.toHaveAttribute('aria-activedescendant');
    },
  );

  it.each(['input', 'contenteditable'] as const)(
    'a shown list expands the %s and names the listbox',
    field => {
      render(<Picker field={field} />);
      const box = fieldFor(field);
      const listbox = screen.getByRole('listbox', {name: 'People'});
      expect(box).toHaveAttribute('aria-expanded', 'true');
      expect(box).toHaveAttribute('aria-controls', listbox.id);
      expect(screen.getAllByRole('option')).toHaveLength(3);
      // No option is active until the person moves to one.
      expect(box).not.toHaveAttribute('aria-activedescendant');
    },
  );

  it('a textarea keeps its textbox role and carries no aria-expanded', () => {
    const {unmount} = render(
      <Picker field="textarea" isInitiallyOpen={false} />,
    );
    let box = fieldFor('textarea');
    expect(box).not.toHaveAttribute('role');
    expect(box).not.toHaveAttribute('aria-expanded');
    expect(box).toHaveAttribute('aria-autocomplete', 'list');
    expect(box).not.toHaveAttribute('aria-controls');
    unmount();

    render(<Picker field="textarea" />);
    box = fieldFor('textarea');
    expect(box).not.toHaveAttribute('aria-expanded');
    expect(box).toHaveAttribute(
      'aria-controls',
      screen.getByRole('listbox').id,
    );
  });

  it('an open list with no options renders no listbox, so the field stays collapsed', () => {
    render(<Picker field="input" options={[]} />);
    const box = fieldFor('input');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(box).toHaveAttribute('aria-expanded', 'false');
    expect(box).not.toHaveAttribute('aria-controls');
  });

  it('moving the active option keeps focus in the field and names it (FR1)', async () => {
    const user = userEvent.setup();
    render(<Picker field="input" />);
    const box = fieldFor('input');
    await user.click(box);

    await user.keyboard('{ArrowDown}');
    expect(box).toHaveFocus();
    expect(box).toHaveAttribute('aria-activedescendant', option('Ada').id);
    expect(option('Ada')).toHaveAttribute('aria-selected', 'true');
    expect(option('Cy')).toHaveAttribute('aria-selected', 'false');

    // The disabled option is skipped, and the arrows wrap at either end.
    await user.keyboard('{ArrowDown}');
    expect(box).toHaveAttribute('aria-activedescendant', option('Cy').id);
    await user.keyboard('{ArrowDown}');
    expect(box).toHaveAttribute('aria-activedescendant', option('Ada').id);
    await user.keyboard('{ArrowUp}');
    expect(box).toHaveAttribute('aria-activedescendant', option('Cy').id);
    expect(box).toHaveFocus();
    expect(option('Bea')).toHaveAttribute('aria-disabled', 'true');
  });

  it('ArrowUp with nothing active starts at the last option', async () => {
    const user = userEvent.setup();
    render(<Picker field="textarea" />);
    const box = fieldFor('textarea');
    await user.click(box);
    await user.keyboard('{ArrowUp}');
    expect(box).toHaveAttribute('aria-activedescendant', option('Cy').id);
  });
});

describe('useCombobox field props — the reusable Combobox contract', () => {
  const closed: ComboboxStateFacts = {
    name: 'To',
    expanded: false,
    popupRole: 'listbox',
    popupVisible: false,
    activeDescendant: false,
    readOnly: false,
    busy: false,
    inertUnderOwnModal: false,
  };

  it.each([
    {field: 'input', open: false, facts: closed},
    {
      field: 'input',
      open: true,
      facts: {
        ...closed,
        expanded: true,
        popupVisible: true,
        activeDescendant: true,
      },
    },
    {
      field: 'contenteditable',
      open: true,
      facts: {
        ...closed,
        name: 'Message',
        expanded: true,
        popupVisible: true,
        activeDescendant: true,
      },
    },
  ] as const)('$field, list shown: $open', async ({field, open, facts}) => {
    await expectAccessibilitySpec({
      spec: COMBOBOX_PATTERN,
      binding: 'useCombobox.field',
      state: `${field}-${open ? 'shown' : 'hidden'}`,
      facts,
      render: async () => {
        render(<Picker field={field} isInitiallyOpen={open} />);
        if (open) {
          fieldFor(field).focus();
          fireEvent.keyDown(fieldFor(field), {key: 'ArrowDown'});
        }
      },
      subject: () => fieldFor(field),
      related: (): Record<string, Element> =>
        open
          ? {
              popup: screen.getByRole('listbox'),
              'active-descendant': option('Ada'),
            }
          : {},
      cleanup,
    });
  });
});

describe('useCombobox field props — keys (FR4)', () => {
  it('Enter picks only an active option, and only then stops the field’s own Enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onFieldKeyDown = vi.fn();
    render(
      <Picker
        field="textarea"
        onSelect={onSelect}
        onFieldKeyDown={onFieldKeyDown}
      />,
    );
    const box = fieldFor('textarea');
    await user.click(box);

    // Nothing active: Enter is the field's, so it types its newline.
    await user.keyboard('{Enter}');
    expect(onSelect).not.toHaveBeenCalled();
    expect(onFieldKeyDown).toHaveBeenCalledTimes(1);
    expect(box).toHaveValue('\n');

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('ada');
    // The arrow and the pick never reached the field's handler or its text.
    expect(onFieldKeyDown).toHaveBeenCalledTimes(1);
    expect(box).toHaveValue('\n');
    // Picking hides the list; focus never left the field.
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(box).toHaveFocus();
  });

  it('Escape hides the list without dismissing the enclosing layer on the same press', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Layer onDismiss={onDismiss}>
        <Picker field="input" />
      </Layer>,
    );
    await user.click(fieldFor('input'));

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();

    // With the list hidden, Escape belongs to the layer again.
    await user.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('Escape also hides an open list that has no options', () => {
    const onClose = vi.fn();
    render(<Picker field="input" options={[]} onClose={onClose} />);
    expect(fireEvent.keyDown(fieldFor('input'), {key: 'Escape'})).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ArrowDown shows a hidden list in a single-line field', async () => {
    const user = userEvent.setup();
    render(<Picker field="input" isInitiallyOpen={false} />);
    const box = fieldFor('input');
    await user.click(box);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(box).toHaveAttribute('aria-expanded', 'true');
    expect(box).toHaveAttribute('aria-activedescendant', option('Ada').id);
  });

  it('ArrowDown leaves a hidden list alone when there is nothing to show', () => {
    const onOpen = vi.fn();
    render(
      <Picker
        field="input"
        options={[]}
        isInitiallyOpen={false}
        onOpen={onOpen}
      />,
    );
    expect(fireEvent.keyDown(fieldFor('input'), {key: 'ArrowDown'})).toBe(true);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it.each(['textarea', 'contenteditable'] as const)(
    'every key reaches a multi-line %s while the list is hidden',
    field => {
      const onOpen = vi.fn();
      const onFieldKeyDown = vi.fn();
      render(
        <Picker
          field={field}
          isInitiallyOpen={false}
          onOpen={onOpen}
          onFieldKeyDown={onFieldKeyDown}
        />,
      );
      const box = fieldFor(field);
      for (const key of ['ArrowDown', 'ArrowUp', 'Enter', 'Escape']) {
        expect(fireEvent.keyDown(box, {key})).toBe(true);
      }
      expect(onOpen).not.toHaveBeenCalled();
      expect(onFieldKeyDown).toHaveBeenCalledTimes(4);
      expect(screen.queryByRole('listbox')).toBeNull();
    },
  );

  it.each(['textarea', 'contenteditable'] as const)(
    'an open list with no options leaves every key to a multi-line %s, as its collapsed state says',
    field => {
      const onClose = vi.fn();
      const onFieldKeyDown = vi.fn();
      render(
        <Picker
          field={field}
          options={[]}
          onClose={onClose}
          onFieldKeyDown={onFieldKeyDown}
        />,
      );
      const box = fieldFor(field);
      expect(box).not.toHaveAttribute('aria-controls');
      for (const key of ['ArrowDown', 'ArrowUp', 'Enter', 'Escape']) {
        expect(fireEvent.keyDown(box, {key})).toBe(true);
      }
      expect(onClose).not.toHaveBeenCalled();
      expect(onFieldKeyDown).toHaveBeenCalledTimes(4);
    },
  );

  it('keys other than the arrows, Enter and Escape reach the field while the list is shown', async () => {
    const user = userEvent.setup();
    const onFieldKeyDown = vi.fn();
    render(<Picker field="input" onFieldKeyDown={onFieldKeyDown} />);
    const box = fieldFor('input');
    await user.click(box);
    await user.keyboard('{ArrowDown}');
    const active = box.getAttribute('aria-activedescendant');

    // Home and End stay with the caret: their combobox meaning is undecided.
    for (const key of ['Home', 'End', 'PageDown', 'Tab', ' ', 'a']) {
      expect(fireEvent.keyDown(box, {key})).toBe(true);
    }
    expect(onFieldKeyDown).toHaveBeenCalledTimes(6);
    expect(box).toHaveAttribute('aria-activedescendant', active);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('a chord such as Shift+Enter is the field’s own command', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Picker field="textarea" onSelect={onSelect} />);
    const box = fieldFor('textarea');
    await user.click(box);
    await user.keyboard('{ArrowDown}');
    expect(fireEvent.keyDown(box, {key: 'Enter', shiftKey: true})).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('leaves onKeyDown with the trigger model it already had', async () => {
    const user = userEvent.setup();
    function Trigger() {
      const [isOpen, setIsOpen] = useState(true);
      const combobox = useCombobox({
        selectableItems: PEOPLE,
        isOpen,
        onOpen: () => setIsOpen(true),
        onClose: () => setIsOpen(false),
        listboxId: 'trigger',
        field: 'input',
      });
      return (
        <button
          type="button"
          aria-activedescendant={
            combobox.highlightedIndex >= 0
              ? combobox.getItemId(combobox.highlightedIndex)
              : undefined
          }
          onKeyDown={combobox.onKeyDown}>
          Pick
        </button>
      );
    }
    render(<Trigger />);
    const button = screen.getByRole('button', {name: 'Pick'});
    button.focus();
    await user.keyboard('{End}');
    expect(button).toHaveAttribute('aria-activedescendant', 'trigger-item-2');
  });
});

describe('useCombobox field props — input-method composition (FR5)', () => {
  it('a composing key neither moves, picks nor hides', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<Picker field="input" onSelect={onSelect} onClose={onClose} />);
    const box = fieldFor('input');
    await user.click(box);
    await user.keyboard('{ArrowDown}');
    const active = option('Ada').id;

    for (const init of [
      {key: 'ArrowDown', isComposing: true},
      {key: 'Enter', isComposing: true},
      {key: 'Escape', isComposing: true},
      {key: 'Enter', keyCode: 229},
    ]) {
      expect(fireEvent.keyDown(box, init)).toBe(true);
    }
    expect(box).toHaveAttribute('aria-activedescendant', active);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    // Once the composition ends, Enter picks again.
    fireEvent.keyDown(box, {key: 'Enter'});
    expect(onSelect).toHaveBeenCalledWith('ada');
  });
});

describe('useCombobox field props — pointer (FR6)', () => {
  it('hovering makes an option active and pressing picks it, with focus kept in the field', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Picker field="input" onSelect={onSelect} />);
    const box = fieldFor('input');
    await user.click(box);

    await user.hover(option('Cy'));
    expect(box).toHaveAttribute('aria-activedescendant', option('Cy').id);
    expect(box).toHaveFocus();

    // A disabled option never becomes active and cannot be picked.
    await user.hover(option('Bea'));
    expect(box).toHaveAttribute('aria-activedescendant', option('Cy').id);
    await user.click(option('Bea'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(box).toHaveFocus();

    await user.click(option('Cy'));
    expect(onSelect).toHaveBeenCalledWith('cy');
    expect(box).toHaveFocus();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('a press on the listbox itself keeps focus in the field', () => {
    render(<Picker field="input" />);
    const box = fieldFor('input');
    box.focus();
    expect(fireEvent.mouseDown(screen.getByRole('listbox'))).toBe(false);
    expect(fireEvent.mouseDown(option('Ada'))).toBe(false);
  });
});

describe('useCombobox field props — result count (FR7)', () => {
  function politeText(): string {
    return (
      document.querySelector('[data-astryx-live-region="polite"]')
        ?.textContent ?? ''
    );
  }

  async function nextFrames(): Promise<void> {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  }

  it('announces the count for each new query through the shared announcer', async () => {
    const {rerender} = render(<Picker field="input" query="" />);
    rerender(<Picker field="input" query="a" />);
    await waitFor(() => expect(politeText()).toBe('3 results'));

    rerender(<Picker field="input" query="ad" options={PEOPLE.slice(0, 1)} />);
    await waitFor(() => expect(politeText()).toBe('1 result'));

    rerender(<Picker field="input" query="zz" options={[]} />);
    await waitFor(() => expect(politeText()).toBe('No results found'));

    // Every live region on the page is the shared announcer's; the field
    // renders none of its own.
    const regions = Array.from(document.querySelectorAll('[aria-live]'));
    expect(regions.length).toBeGreaterThan(0);
    for (const region of regions) {
      expect(region).toHaveAttribute('data-astryx-live-region');
    }
  });

  it('announces nothing for the query a field mounts with, an empty query, or the same query again', async () => {
    const {rerender} = render(<Picker field="input" query="a" />);
    await nextFrames();
    expect(politeText()).toBe('');

    rerender(<Picker field="input" query="" />);
    await nextFrames();
    expect(politeText()).toBe('');

    rerender(<Picker field="input" query="c" />);
    await waitFor(() => expect(politeText()).toBe('3 results'));
    // Options that change under the same query are not a new query.
    rerender(<Picker field="input" query="c" options={PEOPLE.slice(2)} />);
    await nextFrames();
    expect(politeText()).toBe('3 results');
  });

  it('announces nothing while the list is hidden, and the count once it shows', async () => {
    const user = userEvent.setup();
    const {rerender} = render(
      <Picker field="input" query="" isInitiallyOpen={false} />,
    );
    rerender(<Picker field="input" query="a" isInitiallyOpen={false} />);
    await nextFrames();
    expect(politeText()).toBe('');

    await user.click(fieldFor('input'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(politeText()).toBe('3 results'));
  });
});

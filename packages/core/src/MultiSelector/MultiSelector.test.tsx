// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MultiSelector.test.tsx
 * @input Uses vitest, @testing-library/react, @testing-library/user-event
 * @output Unit tests for MultiSelector
 * @position Tests; validates MultiSelector behavior
 *
 * SYNC: When MultiSelector.tsx API changes, update these tests.
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MultiSelector} from './MultiSelector';
import {Icon} from '../Icon';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';
import {defineTheme} from '../theme/defineTheme';
import {generateThemeCSS} from '../theme/generateThemeRules';

function generateThemeTestCSS(theme: Parameters<typeof generateThemeCSS>[0]) {
  const {prose, component} = generateThemeCSS(theme);
  return [prose, component].filter(Boolean).join('\n\n');
}
// Module-level constants to satisfy @eslint-react/no-unstable-default-props.
const ANNOUNCE_OPTIONS = ['Apple', 'Banana', 'Orange'] as const;
const EMPTY_VALUE: string[] = [];

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}

// Mock showPopover and hidePopover methods since they're not implemented in jsdom
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

afterEach(() => {
  __resetLiveRegionsForTest();
});

// Helper: jsdom popover content is in the DOM but may not be
// "visible" in the accessibility tree. Use hidden: true to find it.
const h = {hidden: true} as const;

describe('MultiSelector', () => {
  const defaultOptions = ['Apple', 'Banana', 'Orange'];

  it('renders with label', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Fruit')).toBeInTheDocument();
  });

  it('renders custom option content with renderOption', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={[{value: 'apple', label: 'Apple'}]}
        value={[]}
        onChange={() => {}}
        renderOption={option => (
          <span data-testid="custom-option">{option.label}</span>
        )}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByTestId('custom-option')).toHaveTextContent('Apple');
  });
  it('renders placeholder when no value selected', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        placeholder="Pick fruits..."
      />,
    );
    expect(screen.getByText('Pick fruits...')).toBeInTheDocument();
  });

  it('shows count display by default', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={['Apple', 'Banana']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('shows labels display', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={['Apple', 'Banana']}
        onChange={() => {}}
        triggerDisplay="labels"
      />,
    );
    expect(screen.getByText('Apple, Banana')).toBeInTheDocument();
  });

  it('shows labels display with overflow', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
        value={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
        onChange={() => {}}
        triggerDisplay="labels"
      />,
    );
    expect(screen.getByText('Apple, Banana, Orange, +2')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
      />,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles item on click without closing dropdown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));

    const options = screen.getAllByRole('option', h);
    await user.click(options[0]);

    expect(onChange).toHaveBeenCalledWith(['Apple']);
    // Dropdown should still be open
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('deselects item when clicking selected item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={['Apple', 'Banana']}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option', h);
    await user.click(options[0]); // Click Apple to deselect

    expect(onChange).toHaveBeenCalledWith(['Banana']);
  });

  it('does not toggle disabled items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple', disabled: true},
          {value: 'banana', label: 'Banana'},
        ]}
        value={[]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option', h);
    await user.click(options[0]); // Click disabled Apple

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders disabled state', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('has correct ARIA attributes', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        isRequired
      />,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-required', 'true');
  });

  it('renders listbox with aria-multiselectable', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox', h);
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('marks selected options with aria-selected', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={['Apple']}
        onChange={() => {}}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option', h);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('shows error status with aria-invalid', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes combobox on Tab and moves focus to next element', async () => {
    const user = userEvent.setup();
    render(
      <>
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
        />
        <button type="button">Next</button>
      </>,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Tab}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports keyboard navigation with ArrowDown/ArrowUp', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    await user.keyboard('{ArrowDown}');
    const activeId = trigger.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
  });

  it('End/Home jump the highlight to the last/first option (non-search)', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const options = screen.getAllByRole('option', h);

    await user.keyboard('{End}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      options[options.length - 1].id,
    );
    await user.keyboard('{Home}');
    expect(trigger).toHaveAttribute('aria-activedescendant', options[0].id);
  });

  it('toggles item with Enter key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['Apple']);
  });

  it('toggles the correct item when selected items are sorted to top', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Orange is selected, so sorted order is: Orange, Apple, Banana
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={['Orange']}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    // highlightedIndex starts at 0 which is Orange (sorted first)
    await user.keyboard('{ArrowDown}');
    // Now at index 1 which should be Apple
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['Orange', 'Apple']);
  });

  it('renders select-all checkbox when hasSelectAll', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSelectAll
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('Select all')).toBeInTheDocument();
  });

  it('select-all selects all enabled items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana', disabled: true},
          {value: 'orange', label: 'Orange'},
        ]}
        value={[]}
        onChange={onChange}
        hasSelectAll
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const selectAll = screen.getByText('Select all');
    await user.click(selectAll);

    expect(onChange).toHaveBeenCalledWith(['apple', 'orange']);
  });

  it('select-all deselects all when all are selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={['Apple', 'Banana', 'Orange']}
        onChange={onChange}
        hasSelectAll
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const selectAll = screen.getByText('Select all');
    await user.click(selectAll);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('select-all is a role="option" in the listbox', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSelectAll
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option', h);
    expect(options[0]).toHaveTextContent('Select all');
  });

  it('select-all accessible name reflects none/partial/all selection', async () => {
    const user = userEvent.setup();
    const options = [
      {value: 'apple', label: 'Apple'},
      {value: 'banana', label: 'Banana'},
    ];
    const {rerender} = render(
      <MultiSelector
        label="Fruit"
        options={options}
        value={[]}
        onChange={() => {}}
        hasSelectAll
      />,
    );

    await user.click(screen.getByRole('combobox'));

    // None selected: plain name, not selected
    let selectAll = screen.getAllByRole('option', h)[0];
    expect(selectAll).not.toHaveAccessibleName(/partially selected/);
    expect(selectAll).toHaveAttribute('aria-selected', 'false');

    // Partial: aria-selected="mixed" is invalid on role="option", so the
    // indeterminate state must be conveyed through the accessible name.
    rerender(
      <MultiSelector
        label="Fruit"
        options={options}
        value={['apple']}
        onChange={() => {}}
        hasSelectAll
      />,
    );
    selectAll = screen.getAllByRole('option', h)[0];
    expect(selectAll).toHaveAccessibleName('Select all, partially selected');
    expect(selectAll).toHaveAttribute('aria-selected', 'false');

    // All selected: plain name again, selected
    rerender(
      <MultiSelector
        label="Fruit"
        options={options}
        value={['apple', 'banana']}
        onChange={() => {}}
        hasSelectAll
      />,
    );
    selectAll = screen.getAllByRole('option', h)[0];
    expect(selectAll).not.toHaveAccessibleName(/partially selected/);
    expect(selectAll).toHaveAttribute('aria-selected', 'true');
  });

  it('select-all toggles via keyboard Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={onChange}
        hasSelectAll
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    // highlightedIndex starts at 0 which is select-all
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['Apple', 'Banana', 'Orange']);
  });

  it('renders search input when hasSearch', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const searchInput = screen.getByRole('combobox', h);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('filters options when searching', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const searchInput = screen.getByRole('combobox', h);
    await user.type(searchInput, 'app');

    const options = screen.getAllByRole('option', h);
    expect(options).toHaveLength(1);
  });

  describe('grouped search', () => {
    const GROUPED = [
      {
        type: 'section' as const,
        title: 'Citrus',
        options: [
          {value: 'orange', label: 'Orange'},
          {value: 'lemon', label: 'Lemon'},
        ],
      },
      {
        type: 'section' as const,
        title: 'Berries',
        options: [
          {value: 'strawberry', label: 'Strawberry'},
          {value: 'blueberry', label: 'Blueberry'},
        ],
      },
    ];

    it('keeps the group header above matching items while searching', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={GROUPED}
          value={[]}
          onChange={() => {}}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      await user.type(screen.getByRole('combobox', h), 'orange');

      expect(
        screen.getByRole('group', {name: 'Citrus', ...h}),
      ).toBeInTheDocument();
      const options = screen.getAllByRole('option', h);
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Orange');
    });

    it('hides a group whose items have no match', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={GROUPED}
          value={[]}
          onChange={() => {}}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      await user.type(screen.getByRole('combobox', h), 'berry');

      expect(
        screen.getByRole('group', {name: 'Berries', ...h}),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('group', {name: 'Citrus', ...h}),
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole('option', h)).toHaveLength(2);
    });
  });

  it('PageDown/PageUp jump the highlight to the last/first filtered option', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const searchInput = screen.getByRole('combobox', h);
    // Filter to Banana and Orange so "last" means last *visible* option.
    await user.type(searchInput, 'an');
    const options = screen.getAllByRole('option', h);
    expect(options).toHaveLength(2);

    await user.keyboard('{PageDown}');
    expect(searchInput).toHaveAttribute(
      'aria-activedescendant',
      options[options.length - 1].id,
    );
    await user.keyboard('{PageUp}');
    expect(searchInput).toHaveAttribute('aria-activedescendant', options[0].id);
  });

  it('Home/End move the search caret, not the option highlight', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const searchInput = screen.getByRole<HTMLInputElement>('combobox', h);
    await user.type(searchInput, 'an');
    expect(searchInput.selectionStart).toBe(2);
    const activeBefore = searchInput.getAttribute('aria-activedescendant');
    // Home/End stay on the input for caret movement (APG editable combobox);
    // the option highlight must not move.
    await user.keyboard('{Home}');
    expect(searchInput.selectionStart).toBe(0);
    expect(searchInput.getAttribute('aria-activedescendant')).toBe(
      activeBefore,
    );
    await user.keyboard('{End}');
    expect(searchInput.selectionStart).toBe(2);
    expect(searchInput.getAttribute('aria-activedescendant')).toBe(
      activeBefore,
    );
  });

  it('shows empty state when search has no results', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const searchInput = screen.getByRole('combobox', h);
    await user.type(searchInput, 'xyz');

    expect(
      within(screen.getByRole('listbox', h)).getByText('No results found'),
    ).toBeInTheDocument();
  });

  it('empty-state message is not exposed as a listbox child', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    await user.type(screen.getByRole('combobox', h), 'xyz');

    // role="listbox" only permits option/group children — the visual
    // empty-state message must be presentational (it is announced through
    // the result-count live region instead).
    const listbox = screen.getByRole('listbox', h);
    const empty = within(listbox).getByText('No results found');
    expect(empty).toHaveAttribute('role', 'presentation');
  });

  describe('result announcements', () => {
    it('announces the match count politely while searching', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={EMPTY_VALUE}
          onChange={() => {}}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      // "an" matches Banana and Orange.
      await user.type(screen.getByRole('combobox', h), 'an');
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('2 results');
      });
    });

    it('announces the singular form when one option matches', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={EMPTY_VALUE}
          onChange={() => {}}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      // "app" matches only Apple. Anchored so it cannot pass on "1 results".
      await user.type(screen.getByRole('combobox', h), 'app');
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent(/^1 result$/);
      });
    });

    it('announces "No results found" when nothing matches', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={EMPTY_VALUE}
          onChange={() => {}}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      await user.type(screen.getByRole('combobox', h), 'xyz');
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('No results found');
      });
    });

    it('does not announce results until the user searches', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={EMPTY_VALUE}
          onChange={() => {}}
          hasSearch
        />,
      );
      // Popover closed: nothing announced.
      expect(politeRegion()?.textContent ?? '').toBe('');
      // Open with an empty query: still nothing announced.
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      expect(politeRegion()?.textContent ?? '').toBe('');
    });
  });

  it('renders with description', () => {
    render(
      <MultiSelector
        label="Fruit"
        description="Choose your fruits"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Choose your fruits')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        data-testid="fruit-selector"
      />,
    );
    expect(screen.getByTestId('fruit-selector')).toBeInTheDocument();
  });

  it('renders sections with dividers', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple'},
          {
            type: 'section',
            title: 'Citrus',
            options: [
              {value: 'orange', label: 'Orange'},
              {value: 'lemon', label: 'Lemon'},
            ],
          },
        ]}
        value={[]}
        onChange={() => {}}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option', h);
    expect(options).toHaveLength(3);
    const group = screen.getByRole('group', h);
    expect(group).toHaveAttribute('aria-label', 'Citrus');
  });

  it('shows loading state with aria-busy', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        isLoading
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders with custom selectAllLabel', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSelectAll
        selectAllLabel="Check all"
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('Check all')).toBeInTheDocument();
  });

  it('sorts selected items to top', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={['Orange']}
        onChange={() => {}}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option', h);
    // Orange is selected so it should appear first
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).toHaveTextContent('Orange');
    expect(options[1]).toHaveTextContent('Apple');
    expect(options[2]).toHaveTextContent('Banana');
  });

  it('sorts selected items to top within sections', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={[
          {
            type: 'section',
            title: 'Citrus',
            options: [
              {value: 'orange', label: 'Orange'},
              {value: 'lemon', label: 'Lemon'},
              {value: 'lime', label: 'Lime'},
            ],
          },
        ]}
        value={['lime']}
        onChange={() => {}}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option', h);
    // Lime is selected so it should appear first within the section
    expect(options[0]).toHaveTextContent('Lime');
    expect(options[1]).toHaveTextContent('Orange');
    expect(options[2]).toHaveTextContent('Lemon');
  });

  it('has displayName', () => {
    expect(MultiSelector.displayName).toBe('MultiSelector');
  });

  describe('keyboard accessibility', () => {
    it('trigger is focusable via Tab when enabled', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
        />,
      );
      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('trigger is not focusable when disabled', () => {
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.getByRole('combobox')).toHaveAttribute('tabIndex', '-1');
    });

    it('opens the listbox with ArrowDown from a focused trigger', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
        />,
      );
      const trigger = screen.getByRole('combobox');
      await user.tab();
      expect(trigger).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('clear button is reachable by keyboard', () => {
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={['Apple', 'Banana']}
          onChange={() => {}}
          hasClear
        />,
      );
      const clear = screen.getByRole('button', {name: 'Clear all Fruit'});
      expect(clear).not.toHaveAttribute('tabIndex', '-1');
    });

    it('scrolls the highlighted option into view during arrow navigation', async () => {
      const scrollIntoView = vi.fn();
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: scrollIntoView,
      });
      try {
        const user = userEvent.setup();
        const longOptions = Array.from(
          {length: 20},
          (_, i) => `Option ${i + 1}`,
        );
        render(
          <MultiSelector
            label="Fruit"
            options={longOptions}
            value={[]}
            onChange={() => {}}
          />,
        );

        const trigger = screen.getByRole('combobox');
        await user.click(trigger);
        scrollIntoView.mockClear();
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowDown}');

        expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
      } finally {
        delete (HTMLElement.prototype as unknown as {scrollIntoView?: unknown})
          .scrollIntoView;
      }
    });

    it('clears all values via Delete on the focused trigger', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={['Apple', 'Banana']}
          onChange={onChange}
          hasClear
        />,
      );
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Delete}');
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('clears all values via Backspace on the focused trigger', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={['Apple', 'Banana']}
          onChange={onChange}
          hasClear
        />,
      );
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Backspace}');
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('does not clear via Delete when nothing is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={onChange}
          hasClear
        />,
      );
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Delete}');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('announcements', () => {
    it('announces the selection count politely when toggling an option', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={[...ANNOUNCE_OPTIONS]}
          value={EMPTY_VALUE}
          onChange={() => {}}
        />,
      );
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option', {hidden: true});
      await user.click(options[0]);
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('1 of 3 selected');
      });
    });

    it('announces "All selected" when select-all selects everything', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={[...ANNOUNCE_OPTIONS]}
          value={EMPTY_VALUE}
          onChange={() => {}}
          hasSelectAll
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Select all'));
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('All selected');
      });
    });

    it('announces "Selection cleared" when clearing', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={[...ANNOUNCE_OPTIONS]}
          value={['Apple', 'Banana']}
          onChange={() => {}}
          hasClear
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Clear all Fruit'}));
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('Selection cleared');
      });
    });
  });

  describe('disabledMessage', () => {
    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          isDisabled
          disabledMessage="Select a table first"
          data-testid="fruit-multi-selector"
        />,
      );

      const container = screen.getByTestId('fruit-multi-selector');
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent('Select a table first');

      fireEvent.mouseEnter(container);
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });

      fireEvent.mouseLeave(container);
      await waitFor(() => {
        expect(tooltip).not.toHaveAttribute('popover-open');
      });
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          isDisabled
          disabledMessage="Select a table first"
        />,
      );

      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          disabledMessage="Select a table first"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the trigger focusable via aria-disabled when a reason is provided', () => {
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          isDisabled
          disabledMessage="Select a table first"
        />,
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      expect(trigger).toHaveAttribute('tabIndex', '0');
    });

    it('links the reason tooltip from the trigger via aria-describedby', () => {
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          isDisabled
          disabledMessage="Select a table first"
        />,
      );
      const trigger = screen.getByRole('combobox');
      const tooltip = screen.getByRole('tooltip', h);
      expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks activation while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={onChange}
          isDisabled
          disabledMessage="Select a table first"
        />,
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('remains non-focusable when disabled without a reason', () => {
      render(
        <MultiSelector
          label="Fruit"
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          isDisabled
        />,
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('tabIndex', '-1');
    });
  });
  describe('form participation', () => {
    it('submits one entry per selected value under htmlName', () => {
      const {container} = render(
        <form>
          <MultiSelector
            label="Fruit"
            htmlName="fruit"
            options={['Apple', 'Banana', 'Orange']}
            value={['Apple', 'Orange']}
            onChange={() => {}}
          />
        </form>,
      );
      const data = new FormData(container.querySelector('form')!);
      expect(data.getAll('fruit')).toEqual(['Apple', 'Orange']);
    });

    it('is excluded from form data when disabled', () => {
      const {container} = render(
        <form>
          <MultiSelector
            label="Fruit"
            htmlName="fruit"
            options={['Apple']}
            value={['Apple']}
            onChange={() => {}}
            isDisabled
          />
        </form>,
      );
      expect([
        ...new FormData(container.querySelector('form')!).keys(),
      ]).toEqual([]);
    });
  });
});

describe('MultiSelector statusVariant forwarding', () => {
  it('defaults to attached (status renders with data-variant="attached")', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(container.querySelector('.astryx-field-status')).toHaveAttribute(
      'data-variant',
      'attached',
    );
  });

  it('forwards statusVariant="detached" to the underlying Field status', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
        statusVariant="detached"
      />,
    );
    expect(container.querySelector('.astryx-field-status')).toHaveAttribute(
      'data-variant',
      'detached',
    );
  });

  it('keeps the on-field status icon for the attached variant', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    // Attached: the status glyph replaces the chevron indicator on the field.
    expect(
      container.querySelector('.astryx-multi-selector-indicator-icon'),
    ).toBeNull();
  });

  it('suppresses the on-field status icon for the detached variant', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
        statusVariant="detached"
      />,
    );
    // Detached: the message box below carries its own leading icon, so the
    // field keeps its chevron indicator rather than duplicating the glyph.
    expect(
      container.querySelector('.astryx-multi-selector-indicator-icon'),
    ).not.toBeNull();
  });

  it('detaches attached status by default for the ghost variant', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        value={[]}
        onChange={() => {}}
        variant="ghost"
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(container.querySelector('.astryx-multi-selector')).toHaveAttribute(
      'data-variant',
      'ghost',
    );
    expect(container.querySelector('.astryx-field-status')).toHaveAttribute(
      'data-variant',
      'detached',
    );
  });

  it('uses a status tooltip for ghost multi-selectors when requested', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        value={[]}
        onChange={() => {}}
        variant="ghost"
        status={{type: 'warning', message: 'Some rows are hidden'}}
        statusVariant="tooltip"
      />,
    );
    expect(container.querySelector('.astryx-field-status')).toBeNull();
    const statusButton = screen.getByRole('button', {
      name: /warning details/i,
    });
    const tooltip = screen.getByRole('tooltip', h);
    expect(tooltip).toHaveTextContent('Some rows are hidden');
    expect(statusButton.getAttribute('aria-describedby')).toContain(tooltip.id);
    expect(
      screen.getByRole('combobox').getAttribute('aria-describedby'),
    ).toContain(tooltip.id);
  });
});

describe('MultiSelector clear icon theme target', () => {
  const ICON_OPTIONS = ['Apple', 'Banana', 'Orange'];

  // Resolve the clear glyph span (the astryx-icon element inside the clear
  // button), independent of the theme target class.
  const getClearIcon = (): HTMLElement => {
    const button = screen.getByRole('button', {name: 'Clear all Fruit'});
    const icon = button.querySelector('.astryx-icon');
    if (icon == null) {
      throw new Error('clear icon not found');
    }
    return icon as HTMLElement;
  };

  it('renders the astryx-multi-selector-clear-icon target on the clear glyph', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={ICON_OPTIONS}
        value={['Banana']}
        onChange={() => {}}
        hasClear
      />,
    );
    // The stable theme target lands on the icon element itself (not the
    // button), so a theme can restyle just this glyph (color, size, hover)
    // via `defineTheme` — a button-level target could not reach the icon's
    // own color/size.
    const icon = getClearIcon();
    expect(icon).toHaveClass('astryx-multi-selector-clear-icon');
    expect(icon).toHaveClass('astryx-icon');
  });

  it('keeps the clear button functional alongside the target', () => {
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={ICON_OPTIONS}
        value={['Banana']}
        onChange={onChange}
        hasClear
      />,
    );
    const clear = screen.getByRole('button', {name: 'Clear all Fruit'});
    expect(clear.tagName).toBe('BUTTON');
    fireEvent.click(clear);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renders the default icon (secondary color, sm size) byte-identically', () => {
    // Pixel-identical default guard: the clear glyph must carry the exact same
    // StyleX color/size classes as a standalone secondary/sm icon. The added
    // target class is purely additive — it changes nothing until a theme
    // targets it.
    render(
      <MultiSelector
        label="Fruit"
        options={ICON_OPTIONS}
        value={['Banana']}
        onChange={() => {}}
        hasClear
      />,
    );
    const icon = getClearIcon();

    const {container: refContainer} = render(
      <Icon icon="close" size="sm" color="secondary" />,
    );
    const refIcon = refContainer.querySelector('.astryx-icon') as HTMLElement;

    const styleClasses = (el: HTMLElement) =>
      el.className
        .split(' ')
        .filter(c => c !== 'astryx-multi-selector-clear-icon')
        .sort();

    expect(styleClasses(icon)).toEqual(styleClasses(refIcon));
  });

  it('exposes multi-selector-clear-icon so a theme reaches the icon color, size, and hover', () => {
    // jsdom cannot resolve the @layer cascade, so the DOM-class assertion above
    // (target lands on the icon element) plus this generation assertion (the
    // theme emits same-element icon rules in @layer astryx-theme) together
    // prove the seam: a same-element theme rule wins over the icon's own
    // base-layer color/size.
    const theme = defineTheme({
      name: 'multi-selector-clear-icon-test',
      components: {
        'multi-selector-clear-icon': {
          base: {
            width: '12px',
            height: '12px',
            fontSize: '12px',
            color: 'var(--color-icon-secondary)',
            ':hover': {color: 'var(--color-icon-primary)'},
          },
        },
      },
    });
    const css = generateThemeTestCSS(theme);
    expect(css).toContain('.astryx-multi-selector-clear-icon {');
    expect(css).toContain('width: 12px');
    expect(css).toContain('height: 12px');
    expect(css).toContain('.astryx-multi-selector-clear-icon:hover {');
    expect(css).toContain('color: var(--color-icon-primary)');
  });
});

describe('MultiSelector indicator (chevron) icon theme target', () => {
  const ICON_OPTIONS = ['Apple', 'Banana', 'Orange'];

  const getIndicatorIcon = (container: HTMLElement): HTMLElement => {
    // The chevron is the only glyph carrying the indicator target class.
    const icon = container.querySelector(
      '.astryx-multi-selector-indicator-icon',
    );
    if (icon == null) {
      throw new Error('indicator icon not found');
    }
    return icon as HTMLElement;
  };

  it('renders the astryx-multi-selector-indicator-icon target on the chevron glyph', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={ICON_OPTIONS}
        value={[]}
        onChange={() => {}}
      />,
    );
    // The stable theme target lands on the icon element itself (not the trigger
    // button), so a theme can restyle just this glyph (color, size, hover) —
    // and each open/closed state — via `defineTheme`. A button-level target
    // could not reach the icon's own color/size.
    const icon = getIndicatorIcon(container);
    expect(icon).toHaveClass('astryx-multi-selector-indicator-icon');
    expect(icon).toHaveClass('astryx-icon');
    // Open/closed state is reflected so a theme can target each state alone.
    expect(icon).toHaveAttribute('data-state', 'collapsed');
  });

  it('reflects the expanded state on the chevron when the popover is open', async () => {
    const user = userEvent.setup();
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={ICON_OPTIONS}
        value={[]}
        onChange={() => {}}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(getIndicatorIcon(container)).toHaveAttribute(
        'data-state',
        'expanded',
      );
    });
  });

  it('renders the default icon (inherit color, sm size) byte-identically', () => {
    // Pixel-identical default guard: the chevron glyph must carry the exact
    // same StyleX color/size classes as a standalone inherit/sm icon. The added
    // target class + data-state are purely additive — they change nothing until
    // a theme targets them.
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={ICON_OPTIONS}
        value={[]}
        onChange={() => {}}
      />,
    );
    const icon = getIndicatorIcon(container);

    const {container: refContainer} = render(
      <Icon icon="chevronDown" size="sm" color="inherit" />,
    );
    const refIcon = refContainer.querySelector('.astryx-icon') as HTMLElement;

    // Exclude the additive theme-target classes (the stable target + its
    // reflected state class) so only the StyleX color/size classes remain.
    const themeTargetClasses = new Set([
      'astryx-multi-selector-indicator-icon',
      'collapsed',
      'expanded',
    ]);
    const styleClasses = (el: HTMLElement) =>
      el.className
        .split(' ')
        .filter(c => !themeTargetClasses.has(c))
        .sort();

    expect(styleClasses(icon)).toEqual(styleClasses(refIcon));
  });

  it('exposes multi-selector-indicator-icon so a theme reaches the icon size and per-state color', () => {
    // jsdom cannot resolve the @layer cascade, so the DOM-class assertions
    // above (target lands on the icon element) plus this generation assertion
    // (the theme emits same-element icon rules in @layer astryx-theme) together
    // prove the seam: a same-element theme rule wins over the icon's own
    // base-layer color/size.
    const theme = defineTheme({
      name: 'multi-selector-indicator-icon-test',
      components: {
        'multi-selector-indicator-icon': {
          base: {width: '14px', height: '14px', fontSize: '14px'},
          'state:expanded': {color: 'var(--color-icon-primary)'},
        },
      },
    });
    const css = generateThemeTestCSS(theme);
    expect(css).toContain('.astryx-multi-selector-indicator-icon {');
    expect(css).toContain('width: 14px');
    expect(css).toContain('height: 14px');
    expect(css).toContain('.astryx-multi-selector-indicator-icon.expanded');
    expect(css).toContain('color: var(--color-icon-primary)');
  });
});

describe('MultiSelector search affordances', () => {
  it('renders a decorative (aria-hidden) magnifier icon whenever hasSearch is on', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const search = screen.getByRole('combobox', h);
    // The search field is a TextInput; the magnifier is its startIcon, so it
    // sits inside the input container as a sibling of the <input>.
    const wrapper = search.parentElement;
    const magnifier = wrapper?.querySelector('.astryx-icon');
    expect(magnifier).toBeTruthy();
    expect(magnifier?.getAttribute('aria-hidden')).toBe('true');
    expect(magnifier?.getAttribute('aria-label')).toBeNull();
  });

  it('renders the clear button once a query is typed and clears + refocuses on click', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const search = screen.getByRole('combobox', h);
    await user.type(search, 'ap');
    expect(search).toHaveValue('ap');

    // The clear button is TextInput's built-in hasClear affordance; its name is
    // derived from the field label ("Search options").
    const clear = screen.getByRole('button', {
      name: 'Clear Search options',
      hidden: true,
    });

    await user.click(clear);
    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
  });

  it('does not render the clear button when the query is empty', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    expect(
      screen.queryByRole('button', {
        name: 'Clear Search options',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
  });

  it('keeps the combobox contract on the input, not the affordances', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const search = screen.getByRole('combobox', h);
    expect(search.tagName).toBe('INPUT');
    expect(search).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('tabs from the search input to the clear button (keeping the popup open) when a query is showing it', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const trigger = screen.getByRole('button', {name: 'Fruit'});
    const search = screen.getByRole('combobox', h);
    await user.type(search, 'ap');
    expect(search).toHaveFocus();

    // Forward-tab lands on the clear (✕) button and the popup stays open, so
    // the affordance is keyboard-reachable rather than being skipped when the
    // input's Tab dismisses the popup.
    await user.tab();
    const clear = screen.getByRole('button', {
      name: 'Clear Search options',
      hidden: true,
    });
    expect(clear).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('dismisses on Tab from the search input when there is no query (no clear button)', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );
    const trigger = screen.getByRole('button', {name: 'Fruit'});
    await user.click(trigger);
    const search = screen.getByRole('combobox', h);
    // Focus moves into the search input on open (via rAF).
    await waitFor(() => expect(search).toHaveFocus());

    // With no query there is no clear button, so Tab dismisses the popup as a
    // plain combobox does.
    await user.tab();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

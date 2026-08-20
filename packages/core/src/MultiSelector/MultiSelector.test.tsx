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
import {InternationalizationProvider} from '../i18n';
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

  it('does not toggle the highlighted option on a composing Enter (IME)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={onChange}
        hasSearch
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    const search = screen.getByRole('combobox', h);
    // Filter to Banana and highlight it so an unguarded Enter would toggle it.
    await user.type(search, 'ban');
    await user.keyboard('{ArrowDown}');
    expect(search).toHaveAttribute('aria-activedescendant');

    // The composing keydown (isComposing / legacy keyCode 229) that commits an
    // IME candidate must not be read as "toggle the highlighted option".
    fireEvent.keyDown(search, {key: 'Enter', isComposing: true});
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(search, {key: 'Enter', keyCode: 229});
    expect(onChange).not.toHaveBeenCalled();

    // A real, non-composing Enter still toggles the highlighted option.
    fireEvent.keyDown(search, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith(['Banana']);
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
        <InternationalizationProvider
          locale="fr"
          overrides={{
            fr: {
              '@astryx.multiSelector.resultCount':
                '{count, number} {count, plural, one {résultat} other {résultats}}',
            },
          }}>
          <MultiSelector
            label="Fruit"
            options={defaultOptions}
            value={EMPTY_VALUE}
            onChange={() => {}}
            hasSearch
          />
        </InternationalizationProvider>,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      // "an" matches Banana and Orange.
      await user.type(screen.getByRole('combobox', h), 'an');
      await waitFor(() => {
        // The plural branch of a message no catalog supplies.
        expect(politeRegion()?.textContent).toBe('2 résultats');
      });
    });

    it('announces the singular form when one option matches', async () => {
      const user = userEvent.setup();
      render(
        <InternationalizationProvider
          locale="fr"
          overrides={{
            fr: {
              '@astryx.multiSelector.resultCount':
                '{count, number} {count, plural, one {résultat} other {résultats}}',
            },
          }}>
          <MultiSelector
            label="Fruit"
            options={defaultOptions}
            value={EMPTY_VALUE}
            onChange={() => {}}
            hasSearch
          />
        </InternationalizationProvider>,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      // "app" matches only Apple. Exact match, so "1 résultats" would fail.
      await user.type(screen.getByRole('combobox', h), 'app');
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('1 résultat');
      });
    });

    it('announces the empty-results message when nothing matches', async () => {
      const user = userEvent.setup();
      render(
        <InternationalizationProvider
          locale="fr"
          overrides={{
            fr: {'@astryx.multiSelector.emptySearchResults': 'Aucun résultat'},
          }}>
          <MultiSelector
            label="Fruit"
            options={defaultOptions}
            value={EMPTY_VALUE}
            onChange={() => {}}
            hasSearch
          />
        </InternationalizationProvider>,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      await user.type(screen.getByRole('combobox', h), 'xyz');
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('Aucun résultat');
      });
    });

    it('speaks the result count from a provider catalog (plural)', async () => {
      const user = userEvent.setup();
      render(
        <InternationalizationProvider
          locale="fr"
          messages={{
            fr: {
              '@astryx.multiSelector.resultCount': {
                defaultMessage:
                  '{count, number} {count, plural, one {résultat} other {résultats}}',
              },
            },
          }}>
          <MultiSelector
            label="Fruit"
            options={defaultOptions}
            value={EMPTY_VALUE}
            onChange={() => {}}
            hasSearch
          />
        </InternationalizationProvider>,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit'}));
      // "an" matches Banana and Orange.
      await user.type(screen.getByRole('combobox', h), 'an');
      await waitFor(() => {
        // Same key through the catalog path rather than `overrides`.
        expect(politeRegion()?.textContent).toBe('2 résultats');
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
        <InternationalizationProvider
          locale="fr"
          overrides={{
            fr: {
              '@astryx.multiSelector.selectionCount':
                '{count, number} sur {total, number} sélectionnés',
            },
          }}>
          <MultiSelector
            label="Fruit"
            options={[...ANNOUNCE_OPTIONS]}
            value={EMPTY_VALUE}
            onChange={() => {}}
          />
        </InternationalizationProvider>,
      );
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option', {hidden: true});
      await user.click(options[0]);
      await waitFor(() => {
        // Both arguments land, in the order the message asks for them.
        expect(politeRegion()?.textContent).toBe('1 sur 3 sélectionnés');
      });
    });

    it('announces the all-selected message when select-all selects everything', async () => {
      const user = userEvent.setup();
      render(
        <InternationalizationProvider
          locale="fr"
          overrides={{
            fr: {'@astryx.multiSelector.allSelected': 'Tout est là'},
          }}>
          <MultiSelector
            label="Fruit"
            options={[...ANNOUNCE_OPTIONS]}
            value={EMPTY_VALUE}
            onChange={() => {}}
            hasSelectAll
          />
        </InternationalizationProvider>,
      );
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Select all'));
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('Tout est là');
      });
    });

    it('announces the selection-cleared message when clearing', async () => {
      const user = userEvent.setup();
      render(
        <InternationalizationProvider
          locale="fr"
          overrides={{
            fr: {'@astryx.multiSelector.selectionCleared': 'Plus rien'},
          }}>
          <MultiSelector
            label="Fruit"
            options={[...ANNOUNCE_OPTIONS]}
            value={['Apple', 'Banana']}
            onChange={() => {}}
            hasClear
          />
        </InternationalizationProvider>,
      );
      await user.click(screen.getByRole('button', {name: 'Clear all Fruit'}));
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('Plus rien');
      });
    });

    it('prefers a provider override over the provider catalog', async () => {
      const user = userEvent.setup();
      render(
        <InternationalizationProvider
          locale="fr"
          messages={{
            fr: {
              '@astryx.multiSelector.selectionCount': {
                defaultMessage: '{count, number} du catalogue',
              },
            },
          }}
          overrides={{
            fr: {
              '@astryx.multiSelector.selectionCount':
                '{count, number} remplacé',
            },
          }}>
          <MultiSelector
            label="Fruit"
            options={[...ANNOUNCE_OPTIONS]}
            value={EMPTY_VALUE}
            onChange={() => {}}
          />
        </InternationalizationProvider>,
      );
      await user.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option', {hidden: true});
      await user.click(options[0]);
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('1 remplacé');
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

describe('MultiSelector empty-state theme target', () => {
  const OPTIONS = ['Apple', 'Banana', 'Cherry'];

  it('renders the astryx-multi-selector-empty-state target on the "No results found" element', async () => {
    const user = userEvent.setup();
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={OPTIONS}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    await user.type(screen.getByRole('combobox', h), 'xyz');

    const empty = container.querySelector('.astryx-multi-selector-empty-state');
    expect(empty).not.toBeNull();
    expect(empty).toHaveTextContent('No results found');
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

  it('renders the astryx-input-clear-icon target (plus the legacy alias) on the clear glyph', () => {
    render(
      <MultiSelector
        label="Fruit"
        options={ICON_OPTIONS}
        value={['Banana']}
        onChange={() => {}}
        hasClear
      />,
    );
    // The canonical target lands on the icon element itself (not the button),
    // so a theme can restyle just this glyph (color, size, hover) via
    // `defineTheme` — a button-level target could not reach the icon's own
    // color/size. The original per-component name rides along for a
    // deprecation window.
    const icon = getClearIcon();
    expect(icon).toHaveClass('astryx-input-clear-icon');
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

  it('routes the clear glyph through the shared clear button, keeping the legacy target', () => {
    // The clear affordance now composes the shared InputClearButton (a ghost
    // Button with a secondary/sm glyph), so the icon carries the canonical
    // `astryx-input-clear-icon` target and — for a deprecation window — the
    // original `astryx-multi-selector-clear-icon`. Aside from those target
    // classes it matches the shared button's own `close`/`sm`/`secondary`
    // glyph exactly, so the default look is defined in one place.
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
    expect(icon).toHaveClass('astryx-input-clear-icon');
    expect(icon).toHaveClass('astryx-multi-selector-clear-icon');

    const {container: refContainer} = render(
      <Icon icon="close" size="sm" color="secondary" />,
    );
    const refIcon = refContainer.querySelector('.astryx-icon') as HTMLElement;

    const styleClasses = (el: HTMLElement) =>
      el.className
        .split(' ')
        .filter(
          c =>
            c !== 'astryx-input-clear-icon' &&
            c !== 'astryx-multi-selector-clear-icon',
        )
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
    expect(css).toContain('.astryx-multi-selector-clear-icon:hover');
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

  it('renders the default icon (secondary color, sm size) byte-identically', () => {
    // Pixel-identical default guard: the chevron glyph must carry the exact
    // same StyleX color/size classes as a standalone secondary/sm icon. The
    // glyph now sets --color-icon-secondary itself rather than inheriting it
    // from a wrapper span that set the same token, so the rendered color is
    // unchanged. The added
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
      <Icon icon="chevronDown" size="sm" color="secondary" />,
    );
    const refIcon = refContainer.querySelector('.astryx-icon') as HTMLElement;

    // Exclude the additive theme-target classes (the stable target + its
    // reflected state class) so only StyleX classes remain.
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

    // A superset, not an exact match: the chevron additionally carries the
    // rotation styles, which live on the glyph precisely so a theme can reach
    // the transform through the same selector as the color. The guard that
    // matters is that every color/size class of a standalone icon is still
    // present — i.e. the default look has not drifted.
    expect(styleClasses(icon)).toEqual(
      expect.arrayContaining(styleClasses(refIcon)),
    );
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

describe('MultiSelector list structure', () => {
  it('does not draw a divider under select-all', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
        hasSelectAll
      />,
    );
    await user.click(screen.getByRole('combobox'));
    // Select-all is the first row of the list, not a section of its own. No
    // option here declares a divider and there is no search row, so the panel
    // should contain no rule at all.
    expect(document.querySelectorAll('[role="separator"]')).toHaveLength(0);
    const [first] = screen.getAllByRole('option', h);
    expect(first).toHaveTextContent('Select all');
  });

  it('renders a section title as a plain heading inside the group, not a divider', async () => {
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
            ],
          },
        ]}
        value={[]}
        onChange={() => {}}
      />,
    );
    await user.click(screen.getByRole('combobox'));

    // A labeled Divider used to stand in for the heading; it rendered a
    // role="separator" as a direct child of the listbox and stacked a second
    // rule under the search row's own.
    expect(document.querySelectorAll('[role="separator"]')).toHaveLength(0);

    const group = screen.getByRole('group', {name: 'Citrus', ...h});
    const heading = group.querySelector(
      '.astryx-multi-selector-section-heading',
    );
    expect(heading).toBeTruthy();
    expect(heading).toHaveTextContent('Citrus');
    // The group already carries the title as its accessible name, so the
    // visible heading must not announce it a second time.
    expect(heading).toHaveAttribute('aria-hidden', 'true');
    // ...and it precedes the options it heads.
    const [firstOption] = within(group).getAllByRole('option', h);
    expect(
      heading!.compareDocumentPosition(firstOption) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe('MultiSelector search affordances', () => {
  it('renders the search row seamlessly — no nested input box, a divider under it', async () => {
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
    // The row is the outer gutter; the input sits inside the rounded field.
    const row = search.closest('.astryx-multi-selector-search');
    const field = search.parentElement;
    if (!row || !field) {
      throw new Error('search row not found');
    }
    // The panel is already a bordered surface: the field inside it must not be
    // a second bordered box (this used to render a TextInput).
    expect(row).not.toHaveClass('astryx-text-input');
    expect(search.closest('.astryx-text-input')).toBeNull();
    // The field is a rounded box inset from the panel edge, shaped like the
    // option rows under it — not a full-bleed header strip.
    expect(field).not.toBe(row);
    // ...and a divider separates it from the options.
    const separator = document.querySelector('[role="separator"]');
    if (!separator) {
      throw new Error('divider not found');
    }
    // Order: row, then divider, then the listbox.
    expect(
      row.compareDocumentPosition(separator) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const listbox = screen.getByRole('listbox', h);
    expect(
      separator.compareDocumentPosition(listbox) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('keeps the search row outside the scrolling option list', async () => {
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
    // The options scroll under the header rather than carrying it away, so the
    // field stays reachable in a long list.
    const search = screen.getByRole('combobox', h);
    const listbox = screen.getByRole('listbox', h);
    expect(listbox.contains(search)).toBe(false);
  });

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
    // The magnifier leads the search row, as a sibling of the <input>.
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

describe('MultiSelector disabled state theme target', () => {
  const getSelectorRoot = (container: HTMLElement): HTMLElement => {
    const root = container.querySelector('.astryx-multi-selector');
    if (root == null) {
      throw new Error('multi-selector root not found');
    }
    return root as HTMLElement;
  };

  it('reflects data-state="disabled" on the root when disabled', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(getSelectorRoot(container)).toHaveAttribute(
      'data-disabled',
      'disabled',
    );
  });

  it('omits the disabled class/attribute when enabled', () => {
    const {container} = render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        value={[]}
        onChange={() => {}}
      />,
    );
    const root = getSelectorRoot(container);
    expect(root).not.toHaveAttribute('data-disabled');
    expect(root).not.toHaveClass('disabled');
  });

  it('exposes the disabled state so a theme can key on it', () => {
    const theme = defineTheme({
      name: 'multi-selector-disabled-state-test',
      components: {
        'multi-selector': {
          'disabled:disabled': {opacity: '0.4'},
        },
      },
    });
    const css = generateThemeTestCSS(theme);
    expect(css).toContain('.astryx-multi-selector.disabled');
    expect(css).toContain('opacity: 0.4');
  });
});

describe('MultiSelector dropdown option theme target', () => {
  const ROW_OPTIONS = ['Apple', 'Banana', 'Orange'];

  it('renders astryx-multi-selector-option, with its size, on every dropdown row', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={ROW_OPTIONS}
        value={[]}
        onChange={() => {}}
        size="lg"
      />,
    );
    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option', h);
    expect(options).toHaveLength(3);
    for (const option of options) {
      expect(option).toHaveClass('astryx-multi-selector-option');
      expect(option).toHaveClass('lg');
      expect(option).toHaveAttribute('data-size', 'lg');
    }
  });

  it('carries the selected and disabled states a theme keys on', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
          {value: 'orange', label: 'Orange', disabled: true},
        ]}
        value={['apple']}
        onChange={() => {}}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    const [selected, plain, disabled] = screen.getAllByRole('option', h);

    expect(selected).toHaveClass('selected');
    expect(selected).toHaveAttribute('data-selected', 'selected');
    expect(plain).not.toHaveClass('selected');
    expect(plain).not.toHaveAttribute('data-selected');

    expect(disabled).toHaveClass('disabled');
    expect(disabled).toHaveAttribute('data-disabled', 'disabled');
    expect(plain).not.toHaveAttribute('data-disabled');
  });

  it('marks the Select All row with the select-all state, not a separate target', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={ROW_OPTIONS}
        value={[]}
        onChange={() => {}}
        hasSelectAll
      />,
    );
    await user.click(screen.getByRole('combobox'));

    const [selectAllRow, ...regularRows] = screen.getAllByRole('option', h);
    expect(selectAllRow).toHaveTextContent('Select all');
    expect(selectAllRow).toHaveClass('astryx-multi-selector-option');
    expect(selectAllRow).toHaveClass('select-all');
    expect(selectAllRow).toHaveAttribute('data-select-all', 'select-all');

    for (const row of regularRows) {
      expect(row).toHaveClass('astryx-multi-selector-option');
      expect(row).not.toHaveClass('select-all');
      expect(row).not.toHaveAttribute('data-select-all');
    }
  });

  it('keeps the row targetable when renderOption replaces the label', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={[{value: 'apple', label: 'Apple'}]}
        value={[]}
        onChange={() => {}}
        renderOption={option => (
          <span data-testid="custom-row">{option.label}</span>
        )}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    const option = screen.getAllByRole('option', h)[0];
    // The row owns the typography, so custom content inherits the same
    // treatment the fallback label gets — and one row override reaches both.
    expect(option).toHaveClass('astryx-multi-selector-option');
    expect(within(option).getByTestId('custom-row')).toHaveTextContent('Apple');
  });

  it('exposes the row target, its states and its size to defineTheme', () => {
    const theme = defineTheme({
      name: 'multi-selector-option-target-test',
      components: {
        'multi-selector-option': {
          base: {borderRadius: '8px', fontWeight: '600'},
          selected: {backgroundColor: 'var(--color-background-muted)'},
          'select-all': {fontWeight: '700'},
          'size:lg': {borderRadius: '12px'},
        },
      },
    });
    const css = generateThemeTestCSS(theme);
    expect(css).toContain('.astryx-multi-selector-option {');
    expect(css).toContain('.astryx-multi-selector-option.selected');
    expect(css).toContain('.astryx-multi-selector-option.select-all');
    expect(css).toContain('.astryx-multi-selector-option.lg');
  });
});

describe('MultiSelector popup theme target', () => {
  it('puts astryx-multi-selector-popup on the surface that paints, not the list inside it', async () => {
    const user = userEvent.setup();
    render(
      <MultiSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        value={[]}
        onChange={() => {}}
      />,
    );
    await user.click(screen.getByRole('combobox', {name: /Fruit/}));

    const popup = document.querySelector(
      '.astryx-multi-selector-popup',
    ) as HTMLElement;
    expect(popup).not.toBeNull();
    expect(popup).toHaveClass('astryx-popover-surface');
    // The scrolling list is a descendant, not the target itself.
    expect(popup.querySelector('[role="listbox"]')).not.toBeNull();
    expect(popup.getAttribute('role')).toBeNull();

    const layer = document.querySelector('[popover]') as HTMLElement;
    expect(popup).not.toBe(layer);
    expect(layer.contains(popup)).toBe(true);
  });
});

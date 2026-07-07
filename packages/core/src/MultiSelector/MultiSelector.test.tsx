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
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MultiSelector} from './MultiSelector';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';

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

    expect(screen.getByText('No results found')).toBeInTheDocument();
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
});

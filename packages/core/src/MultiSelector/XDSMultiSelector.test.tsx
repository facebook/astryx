/**
 * @file XDSMultiSelector.test.tsx
 * @input Uses vitest, @testing-library/react, @testing-library/user-event
 * @output Unit tests for XDSMultiSelector
 * @position Tests; validates XDSMultiSelector behavior
 *
 * SYNC: When XDSMultiSelector.tsx API changes, update these tests.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSMultiSelector} from './XDSMultiSelector';

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
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

// Helper: jsdom popover content is in the DOM but may not be
// "visible" in the accessibility tree. Use hidden: true to find it.
const h = {hidden: true} as const;

describe('XDSMultiSelector', () => {
  const defaultOptions = ['Apple', 'Banana', 'Orange'];

  it('renders with label', () => {
    render(
      <XDSMultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Fruit')).toBeInTheDocument();
  });

  it('renders placeholder when no value selected', () => {
    render(
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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

  it('supports keyboard navigation with ArrowDown/ArrowUp', async () => {
    const user = userEvent.setup();
    render(
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSelectAll
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByLabelText('Select all', h)).toBeInTheDocument();
  });

  it('select-all selects all enabled items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSMultiSelector
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
    const selectAll = screen.getByLabelText('Select all', h);
    await user.click(selectAll);

    expect(onChange).toHaveBeenCalledWith(['apple', 'orange']);
  });

  it('select-all deselects all when all are selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSMultiSelector
        label="Fruit"
        options={defaultOptions}
        value={['Apple', 'Banana', 'Orange']}
        onChange={onChange}
        hasSelectAll
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const selectAll = screen.getByLabelText('Select all', h);
    await user.click(selectAll);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renders search input when hasSearch', async () => {
    const user = userEvent.setup();
    render(
      <XDSMultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('searchbox', h)).toBeInTheDocument();
  });

  it('filters options when searching', async () => {
    const user = userEvent.setup();
    render(
      <XDSMultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const searchInput = screen.getByRole('searchbox', h);
    await user.type(searchInput, 'app');

    const options = screen.getAllByRole('option', h);
    expect(options).toHaveLength(1);
  });

  it('shows empty state when search has no results', async () => {
    const user = userEvent.setup();
    render(
      <XDSMultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSearch
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const searchInput = screen.getByRole('searchbox', h);
    await user.type(searchInput, 'xyz');

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
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
      <XDSMultiSelector
        label="Fruit"
        options={defaultOptions}
        value={[]}
        onChange={() => {}}
        hasSelectAll
        selectAllLabel="Check all"
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByLabelText('Check all', h)).toBeInTheDocument();
  });

  it('sorts selected items to top', async () => {
    const user = userEvent.setup();
    render(
      <XDSMultiSelector
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
      <XDSMultiSelector
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
    expect(XDSMultiSelector.displayName).toBe('XDSMultiSelector');
  });
});

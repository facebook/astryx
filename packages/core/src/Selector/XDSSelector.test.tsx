/**
 * @file XDSSelector.test.tsx
 * @input Uses vitest, @testing-library/react, XDSSelector component
 * @output Unit tests for XDSSelector component behavior
 * @position Testing; validates XDSSelector.tsx implementation
 *
 * SYNC: When XDSSelector.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSSelector} from './XDSSelector';

// Mock Popover API for jsdom (same pattern as XDSDropdownMenu tests)
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
  // Mock scrollIntoView for jsdom
  Element.prototype.scrollIntoView = vi.fn();
});

// Helper to open the selector
async function openSelector(user: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole('combobox');
  await user.click(trigger);
  return trigger;
}

describe('XDSSelector', () => {
  // =========================================================================
  // Rendering
  // =========================================================================

  it('renders with label', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Fruit')).toBeInTheDocument();
  });

  it('renders combobox trigger', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays placeholder when no value selected', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={() => {}}
        placeholder="Pick one..."
      />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick one...');
  });

  it('displays selected value label', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple'},
          {value: 'banana', label: 'Banana'},
        ]}
        value="apple"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple');
  });

  it('renders as disabled', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  // =========================================================================
  // Opening / Closing
  // =========================================================================

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={() => {}}
      />,
    );
    await openSelector(user);
    expect(
      screen.getByRole('listbox', {hidden: true}),
    ).toBeInTheDocument();
  });

  it('closes dropdown on second click', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={() => {}}
      />,
    );
    const trigger = await openSelector(user);
    await user.click(trigger);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={() => {}}
      />,
    );
    await openSelector(user);
    await user.keyboard('{Escape}');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        isDisabled
      />,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  // =========================================================================
  // Selection
  // =========================================================================

  it('calls onChange when option clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={onChange}
      />,
    );
    await openSelector(user);
    await user.click(
      screen.getByRole('option', {name: /banana/i, hidden: true}),
    );
    expect(onChange).toHaveBeenCalledWith('Banana');
  });

  it('calls onChange via Enter key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={onChange}
      />,
    );
    await openSelector(user);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('Banana');
  });

  it('does not select disabled options via click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple', disabled: true},
          {value: 'banana', label: 'Banana'},
        ]}
        onChange={onChange}
      />,
    );
    await openSelector(user);
    await user.click(
      screen.getByRole('option', {name: /apple/i, hidden: true}),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  // =========================================================================
  // Keyboard Navigation
  // =========================================================================

  it('ArrowDown opens and highlights first enabled option', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple', disabled: true},
          {value: 'banana', label: 'Banana'},
        ]}
        onChange={() => {}}
      />,
    );
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    // Should highlight banana (index 1), not the disabled apple (index 0)
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-1'),
    );
  });

  it('ArrowUp opens and highlights last enabled option', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        onChange={() => {}}
      />,
    );
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-2'),
    );
  });

  it('Home/End keys navigate to first/last enabled option', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        onChange={() => {}}
      />,
    );
    await openSelector(user);
    await user.keyboard('{End}');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-2'),
    );
    await user.keyboard('{Home}');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-0'),
    );
  });

  // =========================================================================
  // P0: Crash on ArrowDown with 0 options
  // =========================================================================

  it('does not crash on ArrowDown with 0 options', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector label="Empty" options={[]} onChange={() => {}} />,
    );
    screen.getByRole('combobox').focus();
    // Should not throw
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not crash on ArrowDown when all options disabled', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={[{value: 'apple', label: 'Apple', disabled: true}]}
        onChange={() => {}}
      />,
    );
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  // =========================================================================
  // P1: Opening dropdown skips disabled options
  // =========================================================================

  it('click-opening highlights first enabled option, not disabled', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple', disabled: true},
          {value: 'banana', label: 'Banana'},
          {value: 'orange', label: 'Orange'},
        ]}
        onChange={() => {}}
      />,
    );
    await openSelector(user);
    // Should skip apple (disabled at index 0) and highlight banana (index 1)
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-1'),
    );
  });

  // =========================================================================
  // P1: isBusy disables trigger
  // =========================================================================

  it('disables trigger during isLoading', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        isLoading
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  // =========================================================================
  // P2: Duplicate option values
  // =========================================================================

  it('renders duplicate option values without key warnings', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Apple', 'Banana']}
        onChange={onChange}
      />,
    );
    await openSelector(user);
    const options = screen.getAllByRole('option', {hidden: true});
    expect(options).toHaveLength(3);
  });

  // =========================================================================
  // P2: Section groups without title
  // =========================================================================

  it('does not render role=group for sections without title', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={[
          {
            type: 'section' as const,
            options: [
              {value: 'apple', label: 'Apple'},
              {value: 'banana', label: 'Banana'},
            ],
          },
        ]}
        onChange={() => {}}
      />,
    );
    await openSelector(user);
    expect(screen.queryByRole('group', {hidden: true})).not.toBeInTheDocument();
  });

  it('renders role=group with aria-label for sections with title', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={[
          {
            type: 'section' as const,
            title: 'Citrus',
            options: [
              {value: 'orange', label: 'Orange'},
              {value: 'lemon', label: 'Lemon'},
            ],
          },
        ]}
        onChange={() => {}}
      />,
    );
    await openSelector(user);
    const group = screen.getByRole('group', {hidden: true});
    expect(group).toHaveAttribute('aria-label', 'Citrus');
  });

  // =========================================================================
  // XDSBaseProps rest spread
  // =========================================================================

  it('passes through extra HTML attributes', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        data-testid="my-selector"
        data-custom="hello"
      />,
    );
    const trigger = screen.getByTestId('my-selector');
    expect(trigger).toHaveAttribute('data-custom', 'hello');
  });

  // =========================================================================
  // Sections & dividers
  // =========================================================================

  it('renders options from sections', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple'},
          {type: 'divider' as const},
          {
            type: 'section' as const,
            title: 'Citrus',
            options: [{value: 'orange', label: 'Orange'}],
          },
        ]}
        onChange={() => {}}
      />,
    );
    await openSelector(user);
    expect(
      screen.getByRole('option', {name: /apple/i, hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {name: /orange/i, hidden: true}),
    ).toBeInTheDocument();
  });

  // =========================================================================
  // ARIA attributes
  // =========================================================================

  it('sets aria-required when isRequired', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        isRequired
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('sets aria-invalid when status is error', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('renders status message', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        status={{type: 'error', message: 'Please select a fruit'}}
      />,
    );
    expect(screen.getByText('Please select a fruit')).toBeInTheDocument();
  });

  it('does not set aria-invalid when status is warning or success', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        status={{type: 'warning', message: 'Check this'}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  it('associates description with trigger via aria-describedby', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        description="Pick your favorite fruit"
      />,
    );
    const trigger = screen.getByRole('combobox');
    const description = screen.getByText('Pick your favorite fruit');
    expect(trigger).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(description.id),
    );
  });

  it('includes status message in aria-describedby', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        description="Pick your favorite"
        status={{type: 'error', message: 'Required field'}}
      />,
    );
    const trigger = screen.getByRole('combobox');
    const describedBy = trigger.getAttribute('aria-describedby') ?? '';
    // Should reference both description and status message IDs
    expect(describedBy.split(' ')).toHaveLength(2);
  });

  // =========================================================================
  // aria-busy
  // =========================================================================

  it('sets aria-busy when isLoading', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        isLoading
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy when not loading', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-busy');
  });

  // =========================================================================
  // isLabelHidden
  // =========================================================================

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple']}
        onChange={() => {}}
        isLabelHidden
      />,
    );
    // Label should still exist for accessibility
    expect(screen.getByText('Fruit')).toBeInTheDocument();
  });

  // =========================================================================
  // Space key selection
  // =========================================================================

  it('selects option via Space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={onChange}
      />,
    );
    await openSelector(user);
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith('Apple');
  });

  // =========================================================================
  // Typeahead
  // =========================================================================

  it('highlights matching option on typeahead', async () => {
    const user = userEvent.setup();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Orange']}
        onChange={() => {}}
      />,
    );
    screen.getByRole('combobox').focus();
    await user.keyboard('b');
    // Should open and highlight Banana (index 1)
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-1'),
    );
  });

  // =========================================================================
  // onChangeAction
  // =========================================================================

  it('calls onChangeAction after onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChangeAction = vi.fn();
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={onChange}
        onChangeAction={onChangeAction}
      />,
    );
    await openSelector(user);
    await user.click(
      screen.getByRole('option', {name: /banana/i, hidden: true}),
    );
    expect(onChange).toHaveBeenCalledWith('Banana');
    expect(onChangeAction).toHaveBeenCalledWith('Banana');
  });

  it('does not throw when onChangeAction rejects', async () => {
    const user = userEvent.setup();
    const onChangeAction = vi.fn().mockRejectedValue(new Error('fail'));
    render(
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana']}
        onChange={() => {}}
        onChangeAction={onChangeAction}
      />,
    );
    await openSelector(user);
    // Should not throw
    await user.click(
      screen.getByRole('option', {name: /banana/i, hidden: true}),
    );
    expect(onChangeAction).toHaveBeenCalledWith('Banana');
  });

  // =========================================================================
  // Keyboard: does not select disabled option via Enter
  // =========================================================================

  it('does not select disabled option via Enter key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSSelector
        label="Fruit"
        options={[
          {value: 'apple', label: 'Apple', disabled: true},
          {value: 'banana', label: 'Banana'},
        ]}
        onChange={onChange}
      />,
    );
    await openSelector(user);
    // Highlighted index starts at first enabled (banana at index 1)
    // Navigate up — should stay at banana since apple is disabled
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');
    // Should select banana, not apple
    expect(onChange).toHaveBeenCalledWith('banana');
  });
});

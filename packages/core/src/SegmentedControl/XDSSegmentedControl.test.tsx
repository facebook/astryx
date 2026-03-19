/**
 * @file XDSSegmentedControl.test.tsx
 * @input Uses vitest, @testing-library/react, SegmentedControl components
 * @output Unit tests for XDSSegmentedControl and XDSSegmentedControlItem
 * @position Testing; validates SegmentedControl component implementation
 *
 * SYNC: When SegmentedControl components change, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSSegmentedControl} from './XDSSegmentedControl';
import {XDSSegmentedControlItem} from './XDSSegmentedControlItem';

describe('XDSSegmentedControl', () => {
  it('renders a radiogroup with radio buttons', () => {
    render(
      <XDSSegmentedControl value="grid" onChange={() => {}} label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
      </XDSSegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-label',
      'View mode',
    );
    expect(screen.getByRole('radio', {name: 'Grid'})).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: 'List'})).toBeInTheDocument();
  });

  it('marks selected item with aria-checked', () => {
    render(
      <XDSSegmentedControl value="grid" onChange={() => {}} label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
      </XDSSegmentedControl>,
    );

    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', {name: 'List'})).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('calls onChange when an item is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
      </XDSSegmentedControl>,
    );

    await user.click(screen.getByRole('radio', {name: 'List'}));
    expect(handleChange).toHaveBeenCalledWith('list');
  });

  it('does not call onChange when clicking the already-selected item', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
      </XDSSegmentedControl>,
    );

    await user.click(screen.getByRole('radio', {name: 'Grid'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('updates aria-checked when value changes', () => {
    const {rerender} = render(
      <XDSSegmentedControl value="grid" onChange={() => {}} label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
      </XDSSegmentedControl>,
    );

    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveAttribute(
      'aria-checked',
      'true',
    );

    rerender(
      <XDSSegmentedControl value="list" onChange={() => {}} label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
      </XDSSegmentedControl>,
    );

    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('radio', {name: 'List'})).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('renders with different sizes', () => {
    const {rerender} = render(
      <XDSSegmentedControl
        value="grid"
        onChange={() => {}}
        label="View mode"
        size="sm">
        <XDSSegmentedControlItem value="grid" label="Grid" />
      </XDSSegmentedControl>,
    );
    expect(screen.getByRole('radio', {name: 'Grid'})).toBeInTheDocument();

    rerender(
      <XDSSegmentedControl
        value="grid"
        onChange={() => {}}
        label="View mode"
        size="lg">
        <XDSSegmentedControlItem value="grid" label="Grid" />
      </XDSSegmentedControl>,
    );
    expect(screen.getByRole('radio', {name: 'Grid'})).toBeInTheDocument();
  });

  it('renders item with icon', () => {
    render(
      <XDSSegmentedControl value="grid" onChange={() => {}} label="View mode">
        <XDSSegmentedControlItem
          value="grid"
          label="Grid"
          icon={<span data-testid="icon">G</span>}
        />
      </XDSSegmentedControl>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon-only item with aria-label from label prop', () => {
    render(
      <XDSSegmentedControl value="grid" onChange={() => {}} label="View mode">
        <XDSSegmentedControlItem
          value="grid"
          label="Grid view"
          isLabelHidden
          icon={<span data-testid="icon">G</span>}
        />
      </XDSSegmentedControl>,
    );

    const radio = screen.getByRole('radio', {name: 'Grid view'});
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveAttribute('aria-label', 'Grid view');
    // Label text should not be visible
    expect(screen.queryByText('Grid view')).not.toBeInTheDocument();
  });

  it('uses roving tabindex — selected item has tabIndex 0, others -1', () => {
    render(
      <XDSSegmentedControl value="list" onChange={() => {}} label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>,
    );

    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveAttribute(
      'tabIndex',
      '-1',
    );
    expect(screen.getByRole('radio', {name: 'List'})).toHaveAttribute(
      'tabIndex',
      '0',
    );
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveAttribute(
      'tabIndex',
      '-1',
    );
  });
});

describe('XDSSegmentedControl keyboard navigation', () => {
  it('navigates with ArrowRight and selects', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(handleChange).toHaveBeenCalledWith('list');
    expect(screen.getByRole('radio', {name: 'List'})).toHaveFocus();
  });

  it('navigates with ArrowLeft and selects', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="list"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>,
    );

    screen.getByRole('radio', {name: 'List'}).focus();
    await user.keyboard('{ArrowLeft}');

    expect(handleChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveFocus();
  });

  it('wraps around from last to first with ArrowRight', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="table"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Table'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(handleChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveFocus();
  });

  it('wraps around from first to last with ArrowLeft', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{ArrowLeft}');

    expect(handleChange).toHaveBeenCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();
  });

  it('Home key focuses first item', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="table"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Table'}).focus();
    await user.keyboard('{Home}');

    expect(handleChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveFocus();
  });

  it('End key focuses last item', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{End}');

    expect(handleChange).toHaveBeenCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();
  });
});

describe('XDSSegmentedControl disabled state', () => {
  it('marks entire group as disabled', () => {
    render(
      <XDSSegmentedControl
        value="grid"
        onChange={() => {}}
        label="View mode"
        isDisabled>
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
      </XDSSegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('does not call onChange when group is disabled', async () => {
    const user = userEvent.setup({pointerEventsCheck: 0});
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode"
        isDisabled>
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
      </XDSSegmentedControl>,
    );

    await user.click(screen.getByRole('radio', {name: 'List'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables individual items', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" isDisabled />
      </XDSSegmentedControl>,
    );

    expect(screen.getByRole('radio', {name: 'List'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await user.click(screen.getByRole('radio', {name: 'List'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('skips disabled items during keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSSegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode">
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" isDisabled />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{ArrowRight}');

    // Should skip disabled "List" and go to "Table"
    expect(handleChange).toHaveBeenCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();
  });
});

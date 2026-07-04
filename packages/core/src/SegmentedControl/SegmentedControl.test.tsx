// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SegmentedControl.test.tsx
 * @input Uses vitest, @testing-library/react, SegmentedControl components
 * @output Unit tests for SegmentedControl and SegmentedControlItem
 * @position Testing; validates SegmentedControl component implementation
 *
 * SYNC: When SegmentedControl components change, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SegmentedControl} from './SegmentedControl';
import {SegmentedControlItem} from './SegmentedControlItem';

// Mock showPopover/hidePopover (not implemented in jsdom) so the tooltip layer
// reflects its open state via a `popover-open` attribute the tests can assert.
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

describe('SegmentedControl', () => {
  it('renders a radiogroup with radio buttons', () => {
    render(
      <SegmentedControl value="grid" onChange={() => {}} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
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
      <SegmentedControl value="grid" onChange={() => {}} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
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
      <SegmentedControl value="grid" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', {name: 'List'}));
    expect(handleChange).toHaveBeenCalledWith('list');
  });

  it('does not call onChange when clicking the already-selected item', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <SegmentedControl value="grid" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', {name: 'Grid'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('updates aria-checked when value changes', () => {
    const {rerender} = render(
      <SegmentedControl value="grid" onChange={() => {}} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
    );

    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveAttribute(
      'aria-checked',
      'true',
    );

    rerender(
      <SegmentedControl value="list" onChange={() => {}} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
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
      <SegmentedControl
        value="grid"
        onChange={() => {}}
        label="View mode"
        size="sm">
        <SegmentedControlItem value="grid" label="Grid" />
      </SegmentedControl>,
    );
    expect(screen.getByRole('radio', {name: 'Grid'})).toBeInTheDocument();

    rerender(
      <SegmentedControl
        value="grid"
        onChange={() => {}}
        label="View mode"
        size="lg">
        <SegmentedControlItem value="grid" label="Grid" />
      </SegmentedControl>,
    );
    expect(screen.getByRole('radio', {name: 'Grid'})).toBeInTheDocument();
  });

  it('renders item with icon', () => {
    render(
      <SegmentedControl value="grid" onChange={() => {}} label="View mode">
        <SegmentedControlItem
          value="grid"
          label="Grid"
          icon={<span data-testid="icon">G</span>}
        />
      </SegmentedControl>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon-only item with aria-label from label prop', () => {
    render(
      <SegmentedControl value="grid" onChange={() => {}} label="View mode">
        <SegmentedControlItem
          value="grid"
          label="Grid view"
          isLabelHidden
          icon={<span data-testid="icon">G</span>}
        />
      </SegmentedControl>,
    );

    const radio = screen.getByRole('radio', {name: 'Grid view'});
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveAttribute('aria-label', 'Grid view');
    // Label text should not be visible
    expect(screen.queryByText('Grid view')).not.toBeInTheDocument();
  });

  it('uses roving tabindex — selected item has tabIndex 0, others -1', () => {
    render(
      <SegmentedControl value="list" onChange={() => {}} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
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

  it('keeps a tab stop when the value matches no item (tab-stop repair)', () => {
    render(
      <SegmentedControl
        value="nonexistent"
        onChange={() => {}}
        label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
    );

    // No item is selected, but the group must remain Tab-reachable: the first
    // enabled radio is promoted to tabIndex=0.
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveAttribute(
      'tabIndex',
      '0',
    );
  });

  it('promotes the first enabled item when the value matches no item and the first is disabled', () => {
    render(
      <SegmentedControl
        value="nonexistent"
        onChange={() => {}}
        label="View mode">
        <SegmentedControlItem value="grid" label="Grid" isDisabled />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
    );

    // The disabled first item is skipped; the first ENABLED radio is tabbable.
    expect(screen.getByRole('radio', {name: 'List'})).toHaveAttribute(
      'tabIndex',
      '0',
    );
  });
});

describe('SegmentedControl keyboard navigation', () => {
  it('navigates with ArrowRight and selects', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <SegmentedControl value="grid" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
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
      <SegmentedControl value="list" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
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
      <SegmentedControl value="table" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
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
      <SegmentedControl value="grid" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
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
      <SegmentedControl value="table" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
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
      <SegmentedControl value="grid" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{End}');

    expect(handleChange).toHaveBeenCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();
  });
});

describe('SegmentedControl disabled state', () => {
  it('marks entire group as disabled', () => {
    render(
      <SegmentedControl
        value="grid"
        onChange={() => {}}
        label="View mode"
        isDisabled>
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('removes the tab stop from the selected item when the group is disabled (navigation-13)', () => {
    render(
      <SegmentedControl
        value="grid"
        onChange={() => {}}
        label="View mode"
        isDisabled>
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
    );
    // Selected segment must not be a focusable-but-dead tab stop when disabled.
    const selected = screen.getByRole('radio', {name: 'Grid'});
    expect(selected).toHaveAttribute('tabIndex', '-1');
    expect(selected).toHaveAttribute('aria-disabled', 'true');
    // No enabled segment is tabbable either.
    expect(screen.getByRole('radio', {name: 'List'})).toHaveAttribute(
      'tabIndex',
      '-1',
    );
  });

  it('removes the tab stop from an individually disabled selected item', () => {
    render(
      <SegmentedControl value="grid" onChange={() => {}} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" isDisabled />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
    );
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveAttribute(
      'tabIndex',
      '-1',
    );
  });

  it('does not call onChange when group is disabled', async () => {
    const user = userEvent.setup({pointerEventsCheck: 0});
    const handleChange = vi.fn();

    render(
      <SegmentedControl
        value="grid"
        onChange={handleChange}
        label="View mode"
        isDisabled>
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', {name: 'List'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables individual items', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <SegmentedControl value="grid" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" isDisabled />
      </SegmentedControl>,
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
      <SegmentedControl value="grid" onChange={handleChange} label="View mode">
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" isDisabled />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{ArrowRight}');

    // Should skip disabled "List" and go to "Table"
    expect(handleChange).toHaveBeenCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();
  });

  describe('disabledMessage', () => {
    const h = {hidden: true} as const;

    function renderControl(props?: {onChange?: (v: string) => void}) {
      return render(
        <SegmentedControl
          value="grid"
          onChange={props?.onChange ?? (() => {})}
          label="View mode"
          isDisabled
          disabledMessage="Choose a project to switch views">
          <SegmentedControlItem value="grid" label="Grid" />
          <SegmentedControlItem value="list" label="List" />
        </SegmentedControl>,
      );
    }

    it('shows the reason tooltip on hover when the control is disabled with a reason', async () => {
      renderControl();
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent('Choose a project to switch views');
      const group = screen.getByRole('radiogroup');
      fireEvent.mouseEnter(group);
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
      fireEvent.mouseLeave(group);
      await waitFor(() => expect(tooltip).not.toHaveAttribute('popover-open'));
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      renderControl();
      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <SegmentedControl
          value="grid"
          onChange={() => {}}
          label="View mode"
          disabledMessage="Choose a project to switch views">
          <SegmentedControlItem value="grid" label="Grid" />
        </SegmentedControl>,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <SegmentedControl
          value="grid"
          onChange={() => {}}
          label="View mode"
          isDisabled>
          <SegmentedControlItem value="grid" label="Grid" />
        </SegmentedControl>,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the selected segment focusable when a reason is provided', () => {
      renderControl();
      const selected = screen.getByRole('radio', {name: 'Grid', hidden: true});
      expect(selected).toHaveAttribute('aria-disabled', 'true');
      expect(selected).toHaveAttribute('tabindex', '0');
    });

    it('links the reason tooltip from the group via aria-describedby', () => {
      renderControl();
      const group = screen.getByRole('radiogroup');
      const tooltip = screen.getByRole('tooltip', h);
      expect(group.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks selection while focusable-disabled', () => {
      const onChange = vi.fn();
      renderControl({onChange});
      const list = screen.getByRole('radio', {name: 'List', hidden: true});
      fireEvent.click(list);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('drops all segments from the tab order when disabled without a reason', () => {
      render(
        <SegmentedControl
          value="grid"
          onChange={() => {}}
          label="View mode"
          isDisabled>
          <SegmentedControlItem value="grid" label="Grid" />
          <SegmentedControlItem value="list" label="List" />
        </SegmentedControl>,
      );
      for (const radio of screen.getAllByRole('radio', h)) {
        expect(radio).toHaveAttribute('tabindex', '-1');
      }
    });
  });
});

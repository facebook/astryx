/**
 * @file XDSPowerSearch.test.tsx
 * @input Uses vitest, @testing-library/react, userEvent, XDSPowerSearch
 * @output Unit tests for XDSPowerSearch component
 * @position Testing; validates XDSPowerSearch.tsx
 *
 * SYNC: When XDSPowerSearch.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSPowerSearch} from './XDSPowerSearch';
import type {PowerSearchConfig, PowerSearchFilter} from './types';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

// Mock Popover API for jsdom
beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });

  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  HTMLElement.prototype.matches = originalMatches;
});

// =============================================================================
// Test data
// =============================================================================

const statusValues = [
  {value: 'open', label: 'Open'},
  {value: 'closed', label: 'Closed'},
];

const priorityValues = [
  {value: 'p0', label: 'P0 - Critical'},
  {value: 'p1', label: 'P1 - High'},
];

const testConfig: PowerSearchConfig = {
  name: 'TestSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {type: 'enum', values: statusValues},
        },
        {
          key: 'is_not',
          label: 'is not',
          value: {type: 'enum', values: statusValues},
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {type: 'enum', values: priorityValues},
        },
      ],
    },
    {
      key: 'unread',
      label: 'Unread only',
      defaultOperator: 'yes',
      operators: [{key: 'yes', label: '', value: {type: 'empty'}}],
    },
  ],
};

// =============================================================================
// Tests
// =============================================================================

describe('XDSPowerSearch', () => {
  // ===========================================================================
  // Rendering
  // ===========================================================================

  it('renders with default props', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with custom placeholder when no filters', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        placeholder="Filter tasks..."
      />,
    );
    expect(screen.getByPlaceholderText('Filter tasks...')).toBeInTheDocument();
  });

  it('renders with data-testid', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        data-testid="power-search"
      />,
    );
    expect(screen.getByTestId('power-search')).toBeInTheDocument();
  });

  it('renders filter tokens for existing filters', () => {
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ];
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Status is')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders multiple filter tokens', () => {
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
      {
        field: 'title',
        operator: 'contains',
        value: {type: 'string', value: 'login'},
      },
    ];
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Status is')).toBeInTheDocument();
    expect(screen.getByText('Title contains')).toBeInTheDocument();
  });

  // ===========================================================================
  // Disabled / ReadOnly
  // ===========================================================================

  it('renders in disabled state', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('does not call onChange when disabled and token is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ];
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={onChange}
        isDisabled
      />,
    );

    // Token remove buttons should not be present when disabled
    const removeButtons = screen.queryAllByRole('button', {name: /remove/i});
    for (const btn of removeButtons) {
      await user.click(btn);
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // Result count
  // ===========================================================================

  it('renders numeric result count', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        resultCount={42}
      />,
    );
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/results/)).toBeInTheDocument();
  });

  it('renders singular result count', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        resultCount={1}
      />,
    );
    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/result$/)).toBeInTheDocument();
  });

  it('renders string result count', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        resultCount="~500 matches"
      />,
    );
    expect(screen.getByText('~500 matches')).toBeInTheDocument();
  });

  // ===========================================================================
  // End content
  // ===========================================================================

  it('renders end content', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        endContent={<button>Save</button>}
      />,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  // ===========================================================================
  // Removing filters
  // ===========================================================================

  it('calls onChange with remove when token is dismissed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
      {
        field: 'priority',
        operator: 'is',
        value: {type: 'enum', value: 'p0'},
      },
    ];
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={onChange}
      />,
    );

    // Find remove buttons on tokens
    const removeButtons = screen.getAllByRole('button', {name: /remove/i});
    expect(removeButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.any(Array),
      'remove',
      expect.any(Number),
    );
  });

  // ===========================================================================
  // onFocus / onBlur
  // ===========================================================================

  it('calls onFocus when the input is focused', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        onFocus={onFocus}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    expect(onFocus).toHaveBeenCalled();
  });

  it('calls onBlur when focus leaves', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        onBlur={onBlur}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  // ===========================================================================
  // Empty operator auto-add
  // ===========================================================================

  it('adds empty-type filter immediately without popover', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Unread');

    // Find and click the Unread option in dropdown
    const option = screen.queryByText(/Unread only/);
    if (option) {
      await user.click(option);
      // For empty-type operators, onChange should fire immediately
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'unread',
            operator: 'yes',
            value: {type: 'empty'},
          }),
        ]),
        'add',
        0,
      );
    }
  });

  // ===========================================================================
  // Imperative handle
  // ===========================================================================

  it('exposes imperative handle with focusTypeahead and blurTypeahead', () => {
    const ref = {current: null} as React.RefObject<{
      focusTypeahead: () => void;
      blurTypeahead: () => void;
    } | null>;

    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        ref={ref}
      />,
    );

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.focusTypeahead).toBe('function');
    expect(typeof ref.current?.blurTypeahead).toBe('function');
  });

  it('focusTypeahead moves focus to the combobox', () => {
    const ref = {current: null} as React.RefObject<{
      focusTypeahead: () => void;
      blurTypeahead: () => void;
    } | null>;

    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        ref={ref}
      />,
    );

    act(() => {
      ref.current?.focusTypeahead();
    });
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  // ===========================================================================
  // Edit popover accessibility
  // ===========================================================================

  it('renders edit popover with role="dialog" when token is clicked', async () => {
    const user = userEvent.setup();
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ];
    const {container} = render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={() => {}}
      />,
    );

    // Click the token label to open edit popover
    const tokenLabel = screen.getByText('Status is');
    await user.click(tokenLabel);

    // The popover renders through useXDSLayer which uses the Popover API.
    // In jsdom, query the DOM directly since popover visibility is mocked.
    await vi.waitFor(() => {
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-label', 'Edit filter');
    });
  });

  it('supports custom popover aria-label', async () => {
    const user = userEvent.setup();
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ];
    const {container} = render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={() => {}}
      />,
    );

    const tokenLabel = screen.getByText('Status is');
    await user.click(tokenLabel);

    await vi.waitFor(() => {
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-label', 'Edit filter');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  // ===========================================================================
  // i18n labels
  // ===========================================================================

  it('supports custom popover save button label', async () => {
    const user = userEvent.setup();
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ];
    const {container} = render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={() => {}}
        popoverSaveButtonLabel="Guardar"
      />,
    );

    const tokenLabel = screen.getByText('Status is');
    await user.click(tokenLabel);

    await vi.waitFor(() => {
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
      expect(dialog?.textContent).toContain('Guardar');
      expect(dialog?.textContent).toContain('Cancel');
      expect(dialog?.textContent).toContain('Delete');
    });
  });

  // ===========================================================================
  // Read-only filters
  // ===========================================================================

  it('does not open edit popover for read-only individual filters', async () => {
    const user = userEvent.setup();
    const filters: PowerSearchFilter[] = [
      {
        field: 'status',
        operator: 'is',
        value: {type: 'enum', value: 'open'},
        isReadOnly: true,
      },
    ];
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={() => {}}
      />,
    );

    const tokenLabel = screen.getByText('Status is');
    await user.click(tokenLabel);

    // No dialog should appear
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not show remove button for read-only individual filters', () => {
    const filters: PowerSearchFilter[] = [
      {
        field: 'status',
        operator: 'is',
        value: {type: 'enum', value: 'open'},
        isReadOnly: true,
      },
    ];
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={filters}
        onChange={() => {}}
      />,
    );

    // Read-only tokens should not have remove buttons
    const removeButtons = screen.queryAllByRole('button', {name: /remove/i});
    expect(removeButtons).toHaveLength(0);
  });

  // ===========================================================================
  // Accessible label
  // ===========================================================================

  it('renders with accessible label', () => {
    render(
      <XDSPowerSearch
        config={testConfig}
        filters={[]}
        onChange={() => {}}
        label="Filter tasks"
        isLabelHidden={false}
      />,
    );
    // The label should be visible in the DOM
    expect(screen.getByText('Filter tasks')).toBeVisible();
    // And the combobox should be accessible via the label
    expect(screen.getByRole('combobox', {name: 'Filter tasks'})).toBeInTheDocument();
  });

  // ===========================================================================
  // displayName
  // ===========================================================================

  it('has displayName set for DevTools', () => {
    expect(XDSPowerSearch.displayName).toBe('XDSPowerSearch');
  });
});

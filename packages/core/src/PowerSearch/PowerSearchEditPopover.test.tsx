// Copyright (c) Meta Platforms, Inc. and affiliates.

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import React, {useState} from 'react';
import {PowerSearch} from './PowerSearch';
import {PowerSearchEditPopover} from './PowerSearchEditPopover';
import {useInternalConfig} from './useInternalConfig';
import type {PowerSearchConfig, PowerSearchFilter} from './types';

// =============================================================================
// Test infrastructure
// =============================================================================

const originalMatches = HTMLElement.prototype.matches;
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let rafCallbacks: FrameRequestCallback[] = [];
let rafId = 0;

beforeAll(() => {
  globalThis.ResizeObserver = MockResizeObserver;
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
  HTMLElement.prototype.matches = function (
    this: HTMLElement,
    selector: string,
  ) {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  } as typeof HTMLElement.prototype.matches;
});

beforeEach(() => {
  rafCallbacks = [];
  rafId = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafCallbacks.push(cb);
    return ++rafId;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  HTMLElement.prototype.matches = originalMatches;
});

function flushRAF() {
  const cbs = rafCallbacks.splice(0);
  cbs.forEach(cb => cb(performance.now()));
}

const testConfig: PowerSearchConfig = {
  name: 'test',
  fields: [
    {
      key: 'status',
      label: 'Status',
      operators: [{key: 'is', label: 'is', value: {type: 'string'}}],
    },
    {
      key: 'priority',
      label: 'Priority',
      operators: [{key: 'equals', label: 'equals', value: {type: 'string'}}],
    },
  ],
};

function getEditPopoverText(container: HTMLElement): string {
  // The edit popover is the one containing the Cancel/Apply buttons
  const buttons = container.querySelectorAll('button');
  for (const btn of buttons) {
    if (btn.textContent === 'Cancel') {
      const popover = btn.closest('[popover]');
      return popover?.textContent ?? '';
    }
  }
  return '';
}

// =============================================================================
// Tests
// =============================================================================

describe('PowerSearch', () => {
  it('edit popover resets state when switching between filter tokens', () => {
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'string', value: 'open'}},
      {
        field: 'priority',
        operator: 'equals',
        value: {type: 'string', value: 'high'},
      },
    ];

    function Harness() {
      const [currentFilters, setCurrentFilters] = useState(filters);
      return (
        <PowerSearch
          config={testConfig}
          filters={currentFilters}
          onChange={newFilters => setCurrentFilters([...newFilters])}
        />
      );
    }

    const {container} = render(<Harness />);

    // Both filter tokens should be rendered
    const statusToken = screen.getByText('Status: is');
    const priorityToken = screen.getByText('Priority: equals');

    // Click the status token to open its edit popover
    act(() => {
      fireEvent.click(statusToken);
      flushRAF();
    });

    // The edit popover should show "Status" as the selected field
    expect(getEditPopoverText(container)).toContain('Status');

    // Close the popover
    act(() => {
      fireEvent.click(screen.getByText('Cancel'));
      flushRAF();
    });

    // Click the priority token
    act(() => {
      fireEvent.click(priorityToken);
      flushRAF();
    });

    // The edit popover should now show "Priority", not stale "Status"
    const popoverText = getEditPopoverText(container);
    expect(popoverText).toContain('Priority');
    expect(popoverText).toContain('equals');
  });

  it('edit popover shows correct filter after removing a preceding filter', () => {
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'string', value: 'open'}},
      {
        field: 'priority',
        operator: 'equals',
        value: {type: 'string', value: 'high'},
      },
    ];

    function Harness() {
      const [currentFilters, setCurrentFilters] = useState(filters);
      return (
        <PowerSearch
          config={testConfig}
          filters={currentFilters}
          onChange={newFilters => setCurrentFilters([...newFilters])}
        />
      );
    }

    const {container} = render(<Harness />);

    // Click the status token (index 0) to edit it
    act(() => {
      fireEvent.click(screen.getByText('Status: is'));
      flushRAF();
    });

    // Delete the status filter via the Delete button in the popover
    act(() => {
      fireEvent.click(screen.getByText('Delete'));
      flushRAF();
    });

    // Now only the priority filter remains (shifted to index 0)
    expect(screen.queryByText('Status: is')).toBeNull();
    const priorityToken = screen.getByText('Priority: equals');

    // Click the priority token (now at index 0 — same index as the deleted filter)
    act(() => {
      fireEvent.click(priorityToken);
      flushRAF();
    });

    // The edit popover should show "Priority", not stale "Status"
    const popoverText = getEditPopoverText(container);
    expect(popoverText).toContain('Priority');
    expect(popoverText).toContain('equals');
  });

  it('does not save/close edit popover when Enter is consumed by child listbox option selection', () => {
    const multiConfig: PowerSearchConfig = {
      name: 'test-multi',
      fields: [
        {
          key: 'status',
          label: 'Status',
          operators: [
            {
              key: 'any_of',
              label: 'is any of',
              value: {
                type: 'enum_list',
                values: [
                  {value: 'open', label: 'Open'},
                  {value: 'closed', label: 'Closed'},
                ],
              },
            },
          ],
        },
      ],
    };

    const onSave = vi.fn();
    const onCancel = vi.fn();

    function MultiSelectHarness() {
      const internalConfig = useInternalConfig(multiConfig);
      return (
        <PowerSearchEditPopover
          config={internalConfig}
          filter={{
            field: 'status',
            operator: 'any_of',
            value: {type: 'enum_list', value: ['open']},
          }}
          mode="edit"
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    }

    const {container} = render(<MultiSelectHarness />);

    const input = container.querySelector('input');
    expect(input).not.toBeNull();

    // Fire an Enter event that has been defaultPrevented (e.g. child typeahead option selection)
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    enterEvent.preventDefault();

    act(() => {
      input?.dispatchEvent(enterEvent);
    });

    // onSave should NOT be called because the event was already consumed (defaultPrevented)
    expect(onSave).not.toHaveBeenCalled();
  });
});

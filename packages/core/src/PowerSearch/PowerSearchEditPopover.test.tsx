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
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
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

  it('saves the freshly committed numeric value on Enter', () => {
    const numericConfig: PowerSearchConfig = {
      name: 'test-number',
      fields: [
        {
          key: 'level',
          label: 'Level',
          operators: [
            {key: 'equals', label: 'equals', value: {type: 'integer'}},
          ],
        },
      ],
    };
    const onSave = vi.fn();

    function NumericValueHarness() {
      const internalConfig = useInternalConfig(numericConfig);
      return (
        <PowerSearchEditPopover
          config={internalConfig}
          filter={{
            field: 'level',
            operator: 'equals',
            value: {type: 'integer', value: 5},
          }}
          mode="edit"
          onSave={onSave}
          onCancel={() => {}}
        />
      );
    }

    render(<NumericValueHarness />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.input(input, {target: {value: '42'}});
    fireEvent.keyDown(input, {key: 'Enter'});

    expect(onSave).toHaveBeenCalledWith({
      field: 'level',
      operator: 'equals',
      value: {type: 'integer', value: 42},
    });
  });

  it('does not save an invalid numeric draft on Enter', () => {
    const numericConfig: PowerSearchConfig = {
      name: 'test-number',
      fields: [
        {
          key: 'level',
          label: 'Level',
          operators: [
            {key: 'equals', label: 'equals', value: {type: 'integer'}},
          ],
        },
      ],
    };
    const onSave = vi.fn();

    function NumericValueHarness() {
      const internalConfig = useInternalConfig(numericConfig);
      return (
        <PowerSearchEditPopover
          config={internalConfig}
          filter={{
            field: 'level',
            operator: 'equals',
            value: {type: 'integer', value: 5},
          }}
          mode="edit"
          onSave={onSave}
          onCancel={() => {}}
        />
      );
    }

    render(<NumericValueHarness />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.input(input, {target: {value: '1·234'}});
    fireEvent.keyDown(input, {key: 'Enter'});

    expect(onSave).not.toHaveBeenCalled();
    expect(input).toHaveValue('1·234');
  });

  it('does not save/close on a composing Enter while typing a filter value (#4828)', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    function StringValueHarness() {
      const internalConfig = useInternalConfig(testConfig);
      return (
        <PowerSearchEditPopover
          config={internalConfig}
          filter={{
            field: 'status',
            operator: 'is',
            value: {type: 'string', value: '한국어'},
          }}
          mode="edit"
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    }

    const {container} = render(<StringValueHarness />);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();

    // Same composing-Enter signal as BaseTypeahead's guard: isComposing
    // (modern) or legacy keyCode 229. An IME commits its composition on
    // Enter too, so this keydown must not also close/save the popover.
    // handleKeyDown is bound on an ancestor container div, so the keydown
    // reaches it the same way it would from any real input inside — same
    // dispatch mechanism the sibling defaultPrevented test above uses.
    fireEvent.keyDown(input!, {key: 'Enter', isComposing: true});
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.keyDown(input!, {key: 'Enter', keyCode: 229});
    expect(onSave).not.toHaveBeenCalled();

    // A real, non-composing Enter still saves normally.
    fireEvent.keyDown(input!, {key: 'Enter'});
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Narrow-width layout (#4761)
// =============================================================================

// jsdom performs no real layout (and never matches @container conditions), so
// these tests assert the declarations that produce the narrow-width behavior
// rather than measured geometry, via StyleX probe classes: one deterministic
// atomic class per property/value/condition, so an element carries a probe's
// classes exactly when it has the same declaration. The dev debug class
// (contains "__") is excluded.
const CHIP_ROW_COLLAPSE = '@container (max-width: 399px)';

const probe = stylex.create({
  responsiveLayerMinWidth: {
    minWidth: `min(400px, calc(100% - ${spacingVars['--spacing-4']}))`,
  },
  fixedLayerMinWidth: {minWidth: 400},
  queryContainer: {containerType: 'inline-size'},
  responsiveWrap: {
    flexWrap: {default: 'nowrap', [CHIP_ROW_COLLAPSE]: 'wrap'},
  },
  cellMaxWidth: {maxWidth: '100%'},
  nestedFieldCellWidth: {width: 200},
});

function atomicClasses(style: (typeof probe)[keyof typeof probe]): string[] {
  const {className = ''} = stylex.props(style);
  const classes = className
    .split(' ')
    .filter(c => c !== '' && !c.includes('__'));
  // A probe resolving to no atomic classes would make every assertion built
  // on it vacuous, including the not-toHaveClass loops; fail loudly instead.
  expect(classes.length).toBeGreaterThan(0);
  return classes;
}

function expectProbeClasses(
  el: HTMLElement,
  style: (typeof probe)[keyof typeof probe],
) {
  for (const cls of atomicClasses(style)) {
    expect(el).toHaveClass(cls);
  }
}

describe('narrow-width layout (#4761)', () => {
  function EditHarness() {
    const internalConfig = useInternalConfig(testConfig);
    return (
      <PowerSearchEditPopover
        config={internalConfig}
        filter={{
          field: 'status',
          operator: 'is',
          value: {type: 'string', value: 'open'},
        }}
        mode="edit"
        onSave={() => {}}
        onCancel={() => {}}
      />
    );
  }

  function getChipRow(container: HTMLElement): HTMLElement {
    // Locate the chip row by its collapse declaration, then sanity-check it
    // really is the row holding the field / operator / value cells.
    const [rowCls] = atomicClasses(probe.responsiveWrap);
    const row = container.querySelector(`.${rowCls}`) as HTMLElement;
    expect(row).not.toBeNull();
    expect(row).toHaveClass('astryx-stack');
    expect(row.children).toHaveLength(3);
    return row;
  }

  it('popover root establishes the container the collapse query measures', () => {
    const {container} = render(<EditHarness />);

    // Without inline-size containment on the root, no @container condition
    // in this file can match and the chip rows would never wrap.
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expectProbeClasses(root, probe.queryContainer);
  });

  it('filter chip row wraps below the collapse width instead of overflowing', () => {
    const {container} = render(<EditHarness />);

    const row = getChipRow(container);
    expectProbeClasses(row, probe.responsiveWrap);
  });

  it('operator cell is capped at the row width', () => {
    const {container} = render(<EditHarness />);

    // Capped so a long translated operator label truncates inside the
    // Selector trigger instead of pushing the row wider than the popover.
    const operatorCell = getChipRow(container).children[1] as HTMLElement;
    expectProbeClasses(operatorCell, probe.cellMaxWidth);
  });

  it('nested sub-filter rows wrap instead of overflowing on one line', () => {
    const nestedConfig: PowerSearchConfig = {
      name: 'test-nested',
      fields: [
        {
          key: 'group',
          label: 'Group',
          operators: [
            {key: 'all_of', label: 'all of', value: {type: 'nested'}},
          ],
        },
        {
          key: 'status',
          label: 'Status',
          operators: [{key: 'is', label: 'is', value: {type: 'string'}}],
        },
      ],
    };

    function NestedHarness() {
      const internalConfig = useInternalConfig(nestedConfig);
      return (
        <PowerSearchEditPopover
          config={internalConfig}
          filter={{
            field: 'group',
            operator: 'all_of',
            value: {
              type: 'nested',
              value: [
                {
                  field: 'status',
                  operator: 'is',
                  value: {type: 'string', value: 'open'},
                },
              ],
            },
          }}
          mode="edit"
          onSave={() => {}}
          onCancel={() => {}}
        />
      );
    }

    const {container} = render(<NestedHarness />);

    // Locate the sub-filter row through its fixed-width field cell.
    const [cellCls] = atomicClasses(probe.nestedFieldCellWidth);
    const fieldCell = container.querySelector(`.${cellCls}`) as HTMLElement;
    expect(fieldCell).not.toBeNull();
    const row = fieldCell.parentElement as HTMLElement;
    expect(row).toHaveClass('astryx-stack');
    expectProbeClasses(row, probe.responsiveWrap);

    // The fixed-width cells are capped so they cannot clip in containers
    // narrower than their design width (or under deep TreeList indentation).
    expectProbeClasses(fieldCell, probe.cellMaxWidth);
    const operatorCell = row.children[1] as HTMLElement;
    expectProbeClasses(operatorCell, probe.cellMaxWidth);
  });

  it('edit popover layer yields to viewports narrower than its 400px floor', () => {
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'string', value: 'open'}},
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

    render(<Harness />);

    act(() => {
      fireEvent.click(screen.getByText('Status: is'));
      flushRAF();
    });

    const layer = screen
      .getByText('Cancel')
      .closest('[popover]') as HTMLElement;
    expect(layer).not.toBeNull();

    // The fixed 400px floor is replaced by one clamped to the available
    // inline space, so the popover never opens wider than the screen.
    expectProbeClasses(layer, probe.responsiveLayerMinWidth);
    for (const cls of atomicClasses(probe.fixedLayerMinWidth)) {
      expect(layer).not.toHaveClass(cls);
    }
  });
});

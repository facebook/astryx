// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSPowerSearch.test.tsx
 * @input Uses vitest, @testing-library/react, XDSPowerSearch
 * @output Integration tests for XDSPowerSearch component
 * @position Testing; validates XDSPowerSearch.tsx
 *
 * SYNC: When XDSPowerSearch.tsx changes, update tests to match
 */

import {useState} from 'react';
import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSPowerSearch} from './XDSPowerSearch';
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

beforeAll(() => {
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
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
// Fixtures
// =============================================================================

const config: PowerSearchConfig = {
  name: 'TestSearch',
  fields: [
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
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

function PowerSearchWrapper(props: {config: PowerSearchConfig}) {
  const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
  return (
    <XDSPowerSearch
      config={props.config}
      filters={filters}
      onChange={newFilters => {
        setFilters([...newFilters]);
      }}
    />
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('XDSPowerSearch', () => {
  describe('paste behavior', () => {
    it('pasting a field name shows matching field suggestions', async () => {
      const user = userEvent.setup();
      render(<PowerSearchWrapper config={config} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.paste('Tit');
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('pasting produces same results as typing', async () => {
      const user = userEvent.setup();
      const {unmount} = render(<PowerSearchWrapper config={config} />);

      // Paste "Stat"
      const input1 = screen.getByRole('combobox');
      await user.click(input1);
      await user.paste('Stat');
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      const pasteResults = screen
        .getAllByRole('option', {hidden: true})
        .map(el => el.textContent);

      unmount();

      // Type "Stat"
      render(<PowerSearchWrapper config={config} />);
      const input2 = screen.getByRole('combobox');
      await user.click(input2);
      await user.type(input2, 'Stat');
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      const typeResults = screen
        .getAllByRole('option', {hidden: true})
        .map(el => el.textContent);

      expect(pasteResults).toEqual(typeResults);
    });
  });
});

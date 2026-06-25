// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PowerSearch.test.tsx
 * @input Uses vitest, @testing-library/react, PowerSearch
 * @output Integration tests for PowerSearch component
 * @position Testing; validates PowerSearch.tsx
 *
 * SYNC: When PowerSearch.tsx changes, update tests to match
 */

import {useState} from 'react';
import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {PowerSearch} from './PowerSearch';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = originalMatches;
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
    <PowerSearch
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

describe('PowerSearch', () => {
  it('forwards ref to the root element', () => {
    let root: HTMLDivElement | null = null;
    render(
      <PowerSearch
        ref={el => {
          root = el;
        }}
        config={config}
        filters={[]}
        onChange={() => {}}
      />,
    );
    expect(root).toBeInstanceOf(HTMLDivElement);
    expect(root).toHaveClass('astryx-power-search');
  });

  it('exposes typeahead focus through handleRef', () => {
    let handle: {focusTypeahead: () => void; blurTypeahead: () => void} | null =
      null;
    render(
      <PowerSearch
        handleRef={h => {
          handle = h;
        }}
        config={config}
        filters={[]}
        onChange={() => {}}
      />,
    );

    act(() => {
      handle?.focusTypeahead();
    });

    expect(screen.getByRole('combobox')).toHaveFocus();
  });

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

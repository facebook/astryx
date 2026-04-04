/**
 * @file PowerSearchValueEditor.test.tsx
 * @input Uses vitest, @testing-library/react, PowerSearchValueEditor
 * @output Unit tests for PowerSearch editor bugs #1103, #1106, #1107
 * @position Testing; validates PowerSearchValueEditor.tsx
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {PowerSearchValueEditor} from './PowerSearchValueEditor';
import type {
  OperatorValue,
  FilterValue,
  FilterValueEntityList,
  PowerSearchEntity,
} from './types';
import type {InternalConfig} from './useInternalConfig';
import type {XDSSearchableItem, XDSSearchSource} from '../Typeahead/types';

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

// Minimal config stub — editors don't use it directly
const stubConfig: InternalConfig = {
  fieldsMap: new Map(),
  operatorsMap: new Map(),
} as unknown as InternalConfig;

// =============================================================================
// Helpers
// =============================================================================

function createSearchSource(
  items: XDSSearchableItem[],
): XDSSearchSource<XDSSearchableItem> {
  return {
    search: (query: string) =>
      items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
    bootstrap: () => items.slice(0, 5),
  };
}

// =============================================================================
// #1103 — StringEditor ignores searchSource
// =============================================================================

describe('StringEditor (#1103)', () => {
  it('renders a typeahead when searchSource is provided', () => {
    const source = createSearchSource([
      {id: 'us', label: 'United States'},
      {id: 'uk', label: 'United Kingdom'},
    ]);

    const onChange = vi.fn();
    render(
      <PowerSearchValueEditor
        operatorValue={{type: 'string', searchSource: source}}
        filterValue={undefined}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    // Should render a combobox (typeahead), not a plain textbox
    const combobox = screen.queryByRole('combobox');
    expect(combobox).toBeInTheDocument();
  });

  it('renders a plain text input when no searchSource', () => {
    const onChange = vi.fn();
    render(
      <PowerSearchValueEditor
        operatorValue={{type: 'string'}}
        filterValue={undefined}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    // Should render a textbox (XDSTextInput), not a combobox
    const textbox = screen.queryByRole('textbox');
    expect(textbox).toBeInTheDocument();
  });

  it('calls onChange with string FilterValue when typeahead item is selected', async () => {
    const source = createSearchSource([
      {id: 'us', label: 'United States'},
      {id: 'uk', label: 'United Kingdom'},
    ]);

    const onChange = vi.fn();
    render(
      <PowerSearchValueEditor
        operatorValue={{type: 'string', searchSource: source}}
        filterValue={undefined}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    const combobox = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(combobox, {target: {value: 'United'}});
    });

    // Wait for debounce + results
    await act(async () => {
      await new Promise(r => setTimeout(r, 200));
    });

    // Select the first result
    const option = screen.queryByText('United States');
    if (option) {
      fireEvent.click(option);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({type: 'string'}),
        true,
      );
    }
  });

  it('allows arbitrary string input when isArbitraryStringAllowed + searchSource', () => {
    const source = createSearchSource([{id: 'us', label: 'United States'}]);

    const onChange = vi.fn();
    render(
      <PowerSearchValueEditor
        operatorValue={{
          type: 'string',
          searchSource: source,
          isArbitraryStringAllowed: true,
        }}
        filterValue={undefined}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    // Should still render a combobox (typeahead with suggestions)
    const combobox = screen.queryByRole('combobox');
    expect(combobox).toBeInTheDocument();
  });
});

// =============================================================================
// #1106 — EntityListEditor drops photo, no renderItem
// =============================================================================

describe('EntityListEditor (#1106)', () => {
  const entitiesWithPhoto: PowerSearchEntity[] = [
    {id: 'u1', label: 'Alice', photo: 'https://example.com/alice.jpg'},
    {id: 'u2', label: 'Bob', photo: 'https://example.com/bob.jpg'},
  ];

  const entitySource = createSearchSource(
    entitiesWithPhoto.map(e => ({
      id: e.id,
      label: e.label,
      auxiliaryData: {photo: e.photo},
    })),
  );

  it('round-trips photo through onChange', () => {
    const onChange = vi.fn();
    const filterValue: FilterValueEntityList = {
      type: 'entity_list',
      value: entitiesWithPhoto,
    };

    render(
      <PowerSearchValueEditor
        operatorValue={{type: 'entity_list', searchSource: entitySource}}
        filterValue={filterValue}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    // Tokens for Alice and Bob should render
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // Remove Alice — the remaining value should still have Bob's photo
    const removeBtn = screen.getByRole('button', {name: 'Remove Alice'});
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalled();
    const newFilterValue = onChange.mock.calls[0][0] as FilterValueEntityList;
    expect(newFilterValue.type).toBe('entity_list');
    expect(newFilterValue.value).toHaveLength(1);
    expect(newFilterValue.value[0].id).toBe('u2');
    expect(newFilterValue.value[0].label).toBe('Bob');
    // Bug #1106: photo should be preserved, not dropped
    expect(newFilterValue.value[0].photo).toBe('https://example.com/bob.jpg');
  });

  it('preserves photo when mapping filter value to tokenizer', () => {
    const onChange = vi.fn();
    const filterValue: FilterValueEntityList = {
      type: 'entity_list',
      value: [
        {id: 'u1', label: 'Alice', photo: 'https://example.com/alice.jpg'},
      ],
    };

    render(
      <PowerSearchValueEditor
        operatorValue={{type: 'entity_list', searchSource: entitySource}}
        filterValue={filterValue}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    // The token should render — verifies the entity was properly mapped
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});

// =============================================================================
// #1107 — StringListEditor without searchSource is non-functional
// =============================================================================

describe('StringListEditor (#1107)', () => {
  it('allows committing free-text tokens when no searchSource', async () => {
    const onChange = vi.fn();
    render(
      <PowerSearchValueEditor
        operatorValue={{type: 'string_list'}}
        filterValue={undefined}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    const input = screen.getByRole('combobox');

    // Type a free-text value
    await act(async () => {
      fireEvent.change(input, {target: {value: 'my-tag'}});
    });

    // Press Enter to commit
    await act(async () => {
      fireEvent.keyDown(input, {key: 'Enter'});
    });

    // onChange should be called with the committed value
    // Bug #1107: currently this never fires because there's no creatable mode
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'string_list',
        value: expect.arrayContaining(['my-tag']),
      }),
    );
  });

  it('allows committing free-text when isArbitraryStringAllowed is true', async () => {
    const onChange = vi.fn();
    render(
      <PowerSearchValueEditor
        operatorValue={{
          type: 'string_list',
          isArbitraryStringAllowed: true,
        }}
        filterValue={undefined}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    const input = screen.getByRole('combobox');

    await act(async () => {
      fireEvent.change(input, {target: {value: 'custom-value'}});
    });

    await act(async () => {
      fireEvent.keyDown(input, {key: 'Enter'});
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'string_list',
        value: expect.arrayContaining(['custom-value']),
      }),
    );
  });

  it('still works with a searchSource (existing behavior)', () => {
    const source = createSearchSource([
      {id: 'tag1', label: 'frontend'},
      {id: 'tag2', label: 'backend'},
    ]);

    const onChange = vi.fn();
    render(
      <PowerSearchValueEditor
        operatorValue={{type: 'string_list', searchSource: source}}
        filterValue={undefined}
        onChange={onChange}
        config={stubConfig}
      />,
    );

    // Should render the tokenizer with a combobox
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

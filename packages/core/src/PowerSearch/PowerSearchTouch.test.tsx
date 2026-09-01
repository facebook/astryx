// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PowerSearchTouch.test.tsx
 * @input Uses vitest, @testing-library/react, PowerSearchTouchSurface component
 * @output Unit tests for the private coarse-pointer PowerSearch surface
 * @position Core testing; validates PowerSearchTouch.tsx implementation
 *
 * SYNC: When PowerSearchTouch.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {createRef, useState} from 'react';
import {PowerSearchTouchSurface} from './PowerSearchTouch';
import type {
  PowerSearchConfig,
  PowerSearchEditorProps,
  PowerSearchFilter,
  PowerSearchHandle,
  PowerSearchTokenProps,
} from './types';

// jsdom implements neither <dialog> open/close nor pointer capture; the sheet
// needs both. Same stubs BottomSheet's own tests install.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  }
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  window.scrollTo = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// =============================================================================
// Fixtures
// =============================================================================

const STATUS_VALUES = [
  {value: 'open', label: 'Open'},
  {value: 'closed', label: 'Closed'},
];

const config: PowerSearchConfig = {
  name: 'Issues',
  fields: [
    {
      key: 'status',
      label: 'Status',
      description: 'Workflow state',
      operators: [
        {key: 'is', label: 'is', value: {type: 'enum', values: STATUS_VALUES}},
        {
          key: 'isNot',
          label: 'is not',
          value: {type: 'enum', values: STATUS_VALUES},
        },
        {key: 'isEmpty', label: 'is empty', value: {type: 'empty'}},
      ],
    },
    {
      key: 'author',
      label: 'Author',
      operators: [{key: 'is', label: 'is', value: {type: 'string'}}],
    },
    {
      key: 'labels',
      label: 'Labels',
      group: 'Metadata',
      operators: [
        {
          key: 'isAnyOf',
          label: 'is any of',
          value: {
            type: 'enum_list',
            values: [
              {value: 'bug', label: 'Bug'},
              {value: 'urgent', label: 'Urgent'},
            ],
          },
        },
      ],
    },
    {
      key: 'unassigned',
      label: 'Unassigned',
      operators: [{key: 'isTrue', label: 'is true', value: {type: 'empty'}}],
    },
  ],
};

const contentSearchConfig: PowerSearchConfig = {
  ...config,
  name: 'ContentSearch',
  contentSearchFieldKey: 'author',
};

const openFilter: PowerSearchFilter = {
  field: 'status',
  operator: 'is',
  value: {type: 'enum', value: 'open'},
};

function setup(
  props: Partial<React.ComponentProps<typeof PowerSearchTouchSurface>> = {},
) {
  const onChange = vi.fn();
  const result = render(
    <PowerSearchTouchSurface
      config={config}
      filters={[]}
      onChange={onChange}
      {...props}
    />,
  );
  return {onChange, ...result};
}

function openSheet(): void {
  fireEvent.click(
    document.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!,
  );
}

/** The sheet the switcher is currently showing. */
/**
 * Whether the flow is open. The dialog element outlives a close by an exit
 * transition that jsdom never fires, so the sheet's own state is read from the
 * tap target's aria-expanded instead of the element's presence.
 */
function isSheetOpen(): boolean {
  return (
    document
      .querySelector('[aria-haspopup="dialog"]')
      ?.getAttribute('aria-expanded') === 'true'
  );
}

function sheet(): HTMLElement {
  const dialog = document.querySelector<HTMLElement>('dialog[open]');
  if (!dialog) {
    throw new Error('no open sheet');
  }
  return dialog;
}

function tapRow(name: RegExp | string): void {
  const matches = within(sheet()).getAllByRole('button', {name});
  // The switcher keeps the outgoing sheet mounted while the incoming one
  // enters; the last match is always on the sheet that just arrived.
  fireEvent.click(matches[matches.length - 1]);
}

// =============================================================================
// Tests
// =============================================================================

describe('PowerSearchTouchSurface', () => {
  it('names the group with the label and the tap target with its own text', () => {
    setup({label: 'Filter issues'});
    expect(screen.getByRole('group', {name: 'Filter issues'})).toBeTruthy();
    // The visible text is the accessible name — a <label> pointed at the
    // button would silently replace it (WCAG 2.5.3).
    expect(screen.getByRole('button', {name: 'Add filters…'})).toBeTruthy();
  });

  it('renders content search alongside Add filters', () => {
    setup({config: contentSearchConfig, placeholder: 'Search content…'});
    expect(screen.getByRole('searchbox', {name: 'Search'})).toHaveAttribute(
      'placeholder',
      'Search content…',
    );
    expect(screen.getByRole('button', {name: 'Add filters…'})).toBeTruthy();
  });

  it('adds trimmed content search after existing filters and clears the query', () => {
    const {onChange} = setup({
      config: contentSearchConfig,
      filters: [openFilter],
    });
    const input = screen.getByRole('searchbox', {name: 'Search'});
    fireEvent.change(input, {target: {value: '  release notes  '}});
    expect(fireEvent.keyDown(input, {key: 'Enter'})).toBe(false);

    expect(onChange).toHaveBeenCalledWith(
      [
        openFilter,
        {
          field: 'author',
          operator: 'is',
          value: {type: 'string', value: 'release notes'},
        },
      ],
      'add',
      1,
    );
    expect(input).toHaveValue('');
    expect(isSheetOpen()).toBe(false);
  });

  it('does not submit blank or composing content search', () => {
    const {onChange} = setup({config: contentSearchConfig});
    const input = screen.getByRole('searchbox', {name: 'Search'});
    fireEvent.change(input, {target: {value: '   '}});
    expect(fireEvent.keyDown(input, {key: 'Enter'})).toBe(true);
    fireEvent.change(input, {target: {value: '검색'}});
    expect(fireEvent.keyDown(input, {key: 'Enter', isComposing: true})).toBe(
      true,
    );
    expect(fireEvent.keyDown(input, {key: 'Enter', keyCode: 229})).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('검색');
  });

  it('focuses content search through the existing imperative handle', () => {
    const handle = createRef<PowerSearchHandle>();
    setup({config: contentSearchConfig, handleRef: handle});
    handle.current?.focusTypeahead();
    expect(screen.getByRole('searchbox', {name: 'Search'})).toHaveFocus();
  });

  it('keeps “Add filters…” after the existing capsules', () => {
    setup({filters: [openFilter]});
    const value = screen.getByText('Open');
    const add = screen.getByRole('button', {name: 'Add filters…'});
    expect(
      value.compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('lists the fields, grouped, when the tap target is pressed', () => {
    setup();
    openSheet();
    expect(
      within(sheet()).getByRole('heading', {name: 'Add filter'}),
    ).toBeTruthy();
    const rows = within(sheet()).getAllByRole('button');
    const labels = rows.map(r => r.textContent);
    expect(labels.some(l => l?.includes('Status'))).toBe(true);
    expect(labels.some(l => l?.includes('Author'))).toBe(true);
    expect(within(sheet()).getByRole('list', {name: 'Metadata'})).toBeTruthy();
  });

  it('shows only field names in the field picker', () => {
    setup();
    openSheet();
    const statusRow = within(sheet()).getByRole('button', {name: 'Status'});
    expect(statusRow).toBeTruthy();
    expect(statusRow.textContent).toBe('Status');
  });

  it('stages an enum selection until Save is pressed', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Status/);
    tapRow('Closed');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).toHaveBeenCalledWith(
      [
        {
          field: 'status',
          operator: 'is',
          value: {type: 'enum', value: 'closed'},
        },
      ],
      'add',
      0,
    );
  });

  it('closes the sheet once a filter is committed', () => {
    setup();
    openSheet();
    tapRow(/^Status/);
    tapRow('Closed');
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(isSheetOpen()).toBe(false);
  });

  it('confirms an empty-value operator through Save', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Unassigned/);
    expect(onChange).not.toHaveBeenCalled();
    expect(
      within(sheet()).getByRole('heading', {name: 'Unassigned is true'}),
    ).toBeTruthy();
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).toHaveBeenCalledWith(
      [{field: 'unassigned', operator: 'isTrue', value: {type: 'empty'}}],
      'add',
      0,
    );
    expect(isSheetOpen()).toBe(false);
  });

  it('shows complex operators as radios in the value sheet', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Status/);
    expect(within(sheet()).getByRole('heading', {name: 'Status'})).toBeTruthy();
    expect(
      within(sheet()).getByRole('radiogroup', {name: 'Operator'}),
    ).toBeTruthy();
    expect(
      within(sheet()).getByRole('radio', {name: 'Status is'}),
    ).toBeTruthy();
    fireEvent.click(
      within(sheet()).getByRole('radio', {name: 'Status is not'}),
    );
    tapRow('Open');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).toHaveBeenCalledWith(
      [
        {
          field: 'status',
          operator: 'isNot',
          value: {type: 'enum', value: 'open'},
        },
      ],
      'add',
      0,
    );
  });

  it('stages a non-default empty operator until Save', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Status/);
    fireEvent.click(
      within(sheet()).getByRole('radio', {name: 'Status is empty'}),
    );
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).toHaveBeenCalledWith(
      [{field: 'status', operator: 'isEmpty', value: {type: 'empty'}}],
      'add',
      0,
    );
    expect(isSheetOpen()).toBe(false);
  });

  it('puts a simple field and its operator on one title line', () => {
    setup();
    openSheet();
    tapRow(/^Author/);
    const heading = within(sheet()).getByRole('heading', {name: 'Author is'});
    expect(heading).toBeTruthy();
    expect(getComputedStyle(heading).whiteSpace).toBe('nowrap');
    expect(within(sheet()).queryByRole('radiogroup')).toBeNull();
  });

  it('stages a multi-select and commits it from the footer', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Labels/);
    fireEvent.click(within(sheet()).getByRole('checkbox', {name: 'Bug'}));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(within(sheet()).getByRole('checkbox', {name: 'Urgent'}));
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).toHaveBeenCalledWith(
      [
        {
          field: 'labels',
          operator: 'isAnyOf',
          value: {type: 'enum_list', value: ['bug', 'urgent']},
        },
      ],
      'add',
      0,
    );
  });

  it('keeps Save disabled until a value is chosen', () => {
    setup();
    openSheet();
    tapRow(/^Author/);
    const apply = within(sheet()).getByRole('button', {name: 'Save'});
    expect(
      apply.getAttribute('aria-disabled') ?? apply.hasAttribute('disabled'),
    ).toBeTruthy();
  });

  it('edits a filter only after Save', () => {
    const {onChange} = setup({filters: [openFilter]});
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    expect(within(sheet()).getByRole('heading', {name: 'Status'})).toBeTruthy();
    tapRow('Closed');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).toHaveBeenCalledWith(
      [
        {
          field: 'status',
          operator: 'is',
          value: {type: 'enum', value: 'closed'},
        },
      ],
      'edit',
      0,
    );
  });

  it('shows a simple edit title as field and operator on one line', () => {
    const authorFilter: PowerSearchFilter = {
      field: 'author',
      operator: 'is',
      value: {type: 'string', value: 'Ada'},
    };
    setup({filters: [authorFilter]});
    fireEvent.click(screen.getByRole('button', {name: 'Author: is'}));
    const heading = within(sheet()).getByRole('heading', {name: 'Author is'});
    expect(heading).toBeTruthy();
    expect(getComputedStyle(heading).whiteSpace).toBe('nowrap');
  });

  it('offers a visible cancel action while editing', () => {
    const {onChange} = setup({filters: [openFilter]});
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Cancel'}));
    expect(isSheetOpen()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('follows the original filter when controlled props reorder it', () => {
    const authorFilter: PowerSearchFilter = {
      field: 'author',
      operator: 'is',
      value: {type: 'string', value: 'Ada'},
    };
    const onChange = vi.fn();
    const {rerender} = render(
      <PowerSearchTouchSurface
        config={config}
        filters={[openFilter, authorFilter]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    rerender(
      <PowerSearchTouchSurface
        config={config}
        filters={[{...authorFilter}, {...openFilter}]}
        onChange={onChange}
      />,
    );
    tapRow('Closed');
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).toHaveBeenCalledWith(
      [
        authorFilter,
        {
          field: 'status',
          operator: 'is',
          value: {type: 'enum', value: 'closed'},
        },
      ],
      'edit',
      1,
    );
  });

  it('restores focus when a controlled parent reorders in response to an edit', () => {
    const authorFilter: PowerSearchFilter = {
      field: 'author',
      operator: 'is',
      value: {type: 'string', value: 'Ada'},
    };
    function Harness() {
      const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([
        openFilter,
        authorFilter,
      ]);
      return (
        <PowerSearchTouchSurface
          config={config}
          filters={filters}
          onChange={next => setFilters([...next].reverse())}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    tapRow('Closed');
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    expect(screen.getByRole('button', {name: 'Add filters…'})).toHaveFocus();
  });

  it('does not edit a different filter when the controlled target disappears', () => {
    const authorFilter: PowerSearchFilter = {
      field: 'author',
      operator: 'is',
      value: {type: 'string', value: 'Ada'},
    };
    const onChange = vi.fn();
    const {rerender} = render(
      <PowerSearchTouchSurface
        config={config}
        filters={[openFilter]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    rerender(
      <PowerSearchTouchSurface
        config={config}
        filters={[authorFilter]}
        onChange={onChange}
      />,
    );
    tapRow('Closed');
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).not.toHaveBeenCalled();
    expect(isSheetOpen()).toBe(false);
  });

  it('commits the complete filter returned by a custom editor', () => {
    const savedFilter: PowerSearchFilter = {
      field: 'author',
      operator: 'is',
      value: {type: 'string', value: 'Grace'},
      isReadOnly: true,
    };
    function CustomEditor({onSave}: PowerSearchEditorProps) {
      return (
        <button type="button" onClick={() => onSave(savedFilter)}>
          Custom save
        </button>
      );
    }
    const {onChange} = setup({
      components: {enum: {Editor: CustomEditor}},
    });
    openSheet();
    tapRow(/^Status/);
    fireEvent.click(screen.getByRole('button', {name: 'Custom save'}));
    expect(onChange).toHaveBeenCalledWith([savedFilter], 'add', 0);
  });

  it('restores focus after a custom edit remounts its invoking token', () => {
    const savedFilter: PowerSearchFilter = {
      field: 'author',
      operator: 'is',
      value: {type: 'string', value: 'Grace'},
    };
    function CustomEditor({onSave}: PowerSearchEditorProps) {
      return (
        <button type="button" onClick={() => onSave(savedFilter)}>
          Custom save
        </button>
      );
    }
    function Harness() {
      const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([
        openFilter,
      ]);
      return (
        <PowerSearchTouchSurface
          config={config}
          filters={filters}
          onChange={next => setFilters(next)}
          components={{enum: {Editor: CustomEditor}}}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    fireEvent.click(screen.getByRole('button', {name: 'Custom save'}));
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    expect(screen.getByRole('button', {name: 'Add filters…'})).toHaveFocus();
  });

  it('closes without changing filters when a creating custom editor saves null', () => {
    function CustomEditor({onSave}: PowerSearchEditorProps) {
      return (
        <button type="button" onClick={() => onSave(null)}>
          Cancel custom
        </button>
      );
    }
    const {onChange} = setup({
      components: {enum: {Editor: CustomEditor}},
    });
    openSheet();
    tapRow(/^Status/);
    fireEvent.click(screen.getByRole('button', {name: 'Cancel custom'}));
    expect(onChange).not.toHaveBeenCalled();
    expect(isSheetOpen()).toBe(false);
  });

  it('deletes the edited filter from the sheet footer', () => {
    const {onChange} = setup({filters: [openFilter]});
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    fireEvent.click(
      within(sheet()).getByRole('button', {name: 'Remove this filter'}),
    );
    expect(onChange).toHaveBeenCalledWith([], 'remove', 0);
  });

  it("removes a filter from its token's remove button without opening the sheet", () => {
    const {onChange} = setup({filters: [openFilter]});
    fireEvent.click(screen.getByRole('button', {name: /^Remove/}));
    expect(onChange).toHaveBeenCalledWith([], 'remove', 0);
    expect(isSheetOpen()).toBe(false);
  });

  it('forwards the PowerSearch size to token overrides', () => {
    const seenSize = vi.fn();
    function CustomToken(props: PowerSearchTokenProps) {
      seenSize(props.size);
      return <span>Custom token</span>;
    }
    setup({
      filters: [openFilter],
      size: 'sm',
      components: {enum: {Token: CustomToken}},
    });
    expect(seenSize).toHaveBeenCalledWith('sm');
  });

  it('moves focus to Add filters after direct token removal', () => {
    function Harness() {
      const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([
        openFilter,
      ]);
      return (
        <PowerSearchTouchSurface
          config={config}
          filters={filters}
          onChange={next => setFilters(next)}
        />
      );
    }
    render(<Harness />);
    const remove = screen.getByRole('button', {name: /^Remove/});
    remove.focus();
    fireEvent.click(remove);
    expect(screen.getByRole('button', {name: 'Add filters…'})).toHaveFocus();
  });

  it('moves focus to Add filters after clearing every removable filter', () => {
    function Harness() {
      const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([
        openFilter,
      ]);
      return (
        <PowerSearchTouchSurface
          config={config}
          filters={filters}
          onChange={next => setFilters(next)}
        />
      );
    }
    render(<Harness />);
    const clear = screen.getByRole('button', {name: 'Clear all'});
    clear.focus();
    fireEvent.click(clear);
    expect(screen.getByRole('button', {name: 'Add filters…'})).toHaveFocus();
  });

  it('moves focus to Add filters after deleting from the edit sheet', () => {
    function Harness() {
      const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([
        openFilter,
      ]);
      return (
        <PowerSearchTouchSurface
          config={config}
          filters={filters}
          onChange={next => setFilters(next)}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    fireEvent.click(
      within(sheet()).getByRole('button', {name: 'Remove this filter'}),
    );
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    expect(screen.getByRole('button', {name: 'Add filters…'})).toHaveFocus();
  });

  it('clears every removable filter but keeps the read-only ones', () => {
    const pinned: PowerSearchFilter = {...openFilter, isReadOnly: true};
    const {onChange} = setup({
      filters: [
        pinned,
        {
          field: 'author',
          operator: 'is',
          value: {type: 'string', value: 'ada'},
        },
      ],
    });
    fireEvent.click(screen.getByRole('button', {name: 'Clear all'}));
    expect(onChange).toHaveBeenCalledWith([pinned], 'remove', 1);
  });

  it('does not open, remove, or clear when read-only', () => {
    const {onChange} = setup({filters: [openFilter], isReadOnly: true});
    expect(screen.queryByRole('button', {name: /^Remove/})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Clear all'})).toBeNull();
    openSheet();
    expect(isSheetOpen()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not open when disabled', () => {
    setup({isDisabled: true});
    openSheet();
    expect(isSheetOpen()).toBe(false);
  });

  it('auto-focuses the Add filters button when requested', () => {
    setup({hasAutoFocus: true});
    expect(screen.getByRole('button', {name: 'Add filters…'})).toHaveFocus();
  });

  it('fires focus callbacks only when focus crosses the whole field boundary', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    setup({filters: [openFilter], onFocus, onBlur});
    const token = screen.getByRole('button', {name: 'Status: is'});
    const add = screen.getByRole('button', {name: 'Add filters…'});

    fireEvent.focus(token, {relatedTarget: null});
    fireEvent.blur(token, {relatedTarget: add});
    fireEvent.focus(add, {relatedTarget: token});
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();

    fireEvent.blur(add, {relatedTarget: document.body});
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('keeps the tap target focusable when a disabled reason is given', () => {
    setup({isDisabled: true, disabledMessage: 'Pick a project first'});
    const button = document.querySelector<HTMLElement>(
      '[aria-haspopup="dialog"]',
    )!;
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('searches the field list once there are enough fields to need it', () => {
    const many: PowerSearchConfig = {
      name: 'Many',
      fields: Array.from({length: 10}, (_, i) => ({
        key: `f${i}`,
        label: `Field ${i}`,
        operators: [{key: 'is', label: 'is', value: {type: 'string'} as const}],
      })),
    };
    setup({config: many, maxSearchResults: 2});
    openSheet();
    const search = within(sheet()).getByRole('textbox', {
      name: 'Search filters',
    });
    fireEvent.change(search, {target: {value: 'Field'}});
    expect(
      within(sheet()).getAllByRole('button', {name: /^Field/}),
    ).toHaveLength(2);
    fireEvent.change(search, {target: {value: 'Field 7'}});
    expect(within(sheet()).getByRole('button', {name: /Field 7/})).toBeTruthy();
    expect(within(sheet()).queryByRole('button', {name: /Field 3/})).toBeNull();
    fireEvent.change(search, {target: {value: 'nope'}});
    expect(
      within(sheet()).getByText('No filters match your search'),
    ).toBeTruthy();
  });

  it('offers no field search for a short list', () => {
    setup();
    openSheet();
    expect(within(sheet()).queryByRole('textbox')).toBeNull();
  });

  it('leaves out fields it cannot edit and warns the developer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const withNested: PowerSearchConfig = {
      name: 'Nested',
      fields: [
        ...config.fields,
        {
          key: 'group',
          label: 'Group',
          operators: [{key: 'all', label: 'all of', value: {type: 'nested'}}],
        },
      ],
    };
    setup({config: withNested});
    openSheet();
    expect(within(sheet()).queryByRole('button', {name: /^Group/})).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('PowerSearch: 1 field(s) were left out'),
    );
    warn.mockRestore();
  });

  it('moves focus to the tap target through the imperative handle', () => {
    const handle = createRef<PowerSearchHandle>();
    setup({handleRef: handle});
    handle.current?.focusTypeahead();
    expect(document.activeElement).toBe(
      document.querySelector('[aria-haspopup="dialog"]'),
    );
  });

  it('renders the result count and announces a change to it', () => {
    const {rerender} = setup({resultCount: 12});
    expect(screen.getByText('12 results')).toBeTruthy();
    rerender(
      <PowerSearchTouchSurface
        config={config}
        filters={[]}
        onChange={vi.fn()}
        resultCount={3}
      />,
    );
    expect(screen.getByText('3 results')).toBeTruthy();
  });
});

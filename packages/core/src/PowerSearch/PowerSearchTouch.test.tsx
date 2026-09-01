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

function openAddFlow(): void {
  openSheet();
  tapRow('Add filter');
}

function openEditFlow(name: RegExp | string): void {
  openSheet();
  tapRow(name);
}

// =============================================================================
// Tests
// =============================================================================

describe('PowerSearchTouchSurface', () => {
  it('uses the field label for its single sheet trigger', () => {
    setup({label: 'Filter issues'});
    expect(screen.getByRole('button', {name: 'Filter issues'})).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    expect(
      screen.getByRole('button', {name: 'Filter issues'}),
    ).toHaveTextContent('Filters…');
    expect(screen.queryByRole('button', {name: 'Add filters…'})).toBeNull();
  });

  it('opens the management sheet when a capsule area is touched', () => {
    setup({filters: [openFilter]});
    const root = document.querySelector<HTMLElement>('.astryx-power-search')!;
    fireEvent.click(within(root).getByText('Open'));
    expect(
      within(sheet()).getByRole('heading', {name: 'Filters'}),
    ).toBeTruthy();
  });

  it('restores focus to the field after Done closes management', () => {
    setup();
    const trigger = screen.getByRole('button', {name: 'Manage filters'});
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Done'}));
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    expect(trigger).toHaveFocus();
  });

  it('moves content search into the management sheet', () => {
    setup({config: contentSearchConfig, placeholder: 'Search content…'});
    expect(screen.queryByRole('searchbox')).toBeNull();
    openSheet();
    expect(
      within(sheet()).getByRole('textbox', {name: 'Search'}),
    ).toHaveAttribute('placeholder', 'Search content…');
    expect(
      within(sheet()).getByRole('button', {name: 'Add filter'}),
    ).toBeTruthy();
  });

  it('adds trimmed content search from the management sheet and keeps it open', () => {
    const {onChange} = setup({
      config: contentSearchConfig,
      filters: [openFilter],
    });
    openSheet();
    const input = within(sheet()).getByRole('textbox', {name: 'Search'});
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
    expect(isSheetOpen()).toBe(true);
  });

  it('does not submit blank or composing content search', () => {
    const {onChange} = setup({config: contentSearchConfig});
    openSheet();
    const input = within(sheet()).getByRole('textbox', {name: 'Search'});
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

  it('focuses the sheet trigger through the existing imperative handle', () => {
    const handle = createRef<PowerSearchHandle>();
    setup({config: contentSearchConfig, handleRef: handle});
    handle.current?.focusTypeahead();
    expect(screen.getByRole('button', {name: 'Manage filters'})).toHaveFocus();
  });

  it('shows selected filters as editable rows with separate remove actions', () => {
    setup({filters: [openFilter]});
    openSheet();
    expect(
      within(sheet()).getByRole('list', {name: 'Selected filters'}),
    ).toBeTruthy();
    expect(
      within(sheet()).getByRole('button', {name: 'Status is Open'}),
    ).toBeTruthy();
    expect(
      within(sheet()).getByRole('button', {name: 'Remove Status is Open'}),
    ).toBeTruthy();
  });

  it('lists the fields, grouped, after Add filter is pressed', () => {
    setup();
    openAddFlow();
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
    openAddFlow();
    const statusRow = within(sheet()).getByRole('button', {name: 'Status'});
    expect(statusRow).toBeTruthy();
    expect(statusRow.textContent).toBe('Status');
  });

  it('stages an enum selection until Save is pressed', () => {
    const {onChange} = setup();
    openAddFlow();
    tapRow(/^Status/);
    tapRow('Closed');
    expect(
      within(sheet()).getByRole('button', {name: 'Closed, selected'}),
    ).toBeTruthy();
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

  it('returns to filter management once a filter is committed', () => {
    setup();
    openAddFlow();
    tapRow(/^Status/);
    tapRow('Closed');
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    expect(isSheetOpen()).toBe(true);
    expect(
      within(sheet()).getByRole('button', {name: 'Add filter'}),
    ).toHaveFocus();
  });

  it('confirms an empty-value operator through Save', () => {
    const {onChange} = setup();
    openAddFlow();
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
    expect(isSheetOpen()).toBe(true);
    expect(
      within(sheet()).getByRole('heading', {name: 'Filters'}),
    ).toBeTruthy();
  });

  it('shows complex operators as radios in the value sheet', () => {
    const {onChange} = setup();
    openAddFlow();
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
    openAddFlow();
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
    expect(isSheetOpen()).toBe(true);
    expect(
      within(sheet()).getByRole('heading', {name: 'Filters'}),
    ).toBeTruthy();
  });

  it('puts a simple field and its operator on one title line', () => {
    setup();
    openAddFlow();
    tapRow(/^Author/);
    const heading = within(sheet()).getByRole('heading', {name: 'Author is'});
    expect(heading).toBeTruthy();
    expect(getComputedStyle(heading).whiteSpace).toBe('nowrap');
    expect(within(sheet()).queryByRole('radiogroup')).toBeNull();
  });

  it('restores focus to the chosen field when backing out of creation', () => {
    setup();
    openAddFlow();
    tapRow(/^Author/);
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Back'}));
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    expect(within(sheet()).getByRole('button', {name: 'Author'})).toHaveFocus();
  });

  it('stages a multi-select and commits it from the footer', () => {
    const {onChange} = setup();
    openAddFlow();
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
    openAddFlow();
    tapRow(/^Author/);
    const apply = within(sheet()).getByRole('button', {name: 'Save'});
    expect(
      apply.getAttribute('aria-disabled') ?? apply.hasAttribute('disabled'),
    ).toBeTruthy();
  });

  it('disables an open editor when the component becomes disabled', () => {
    const {rerender} = setup();
    openAddFlow();
    tapRow(/^Status/);
    rerender(
      <PowerSearchTouchSurface
        config={config}
        filters={[]}
        onChange={vi.fn()}
        isDisabled
      />,
    );
    expect(
      within(sheet()).getByRole('radio', {name: 'Status is'}),
    ).toBeDisabled();
    expect(within(sheet()).getByRole('button', {name: 'Save'})).toBeDisabled();
  });

  it('edits a filter only after Save', () => {
    const {onChange} = setup({filters: [openFilter]});
    openEditFlow('Status is Open');
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
    openEditFlow('Author is Ada');
    const heading = within(sheet()).getByRole('heading', {name: 'Author is'});
    expect(heading).toBeTruthy();
    expect(getComputedStyle(heading).whiteSpace).toBe('nowrap');
  });

  it('returns from editing to management without changing filters', () => {
    const {onChange} = setup({filters: [openFilter]});
    openEditFlow('Status is Open');
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Back'}));
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    expect(isSheetOpen()).toBe(true);
    expect(
      within(sheet()).getByRole('button', {name: 'Status is Open'}),
    ).toHaveFocus();
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
    openEditFlow('Status is Open');
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

  it('edits the original filter when an identical clone takes its old slot', () => {
    const duplicate: PowerSearchFilter = {...openFilter};
    const onChange = vi.fn();
    const {rerender} = render(
      <PowerSearchTouchSurface
        config={config}
        filters={[openFilter, duplicate]}
        onChange={onChange}
      />,
    );
    openSheet();
    const rows = within(sheet()).getAllByRole('button', {
      name: 'Status is Open',
    });
    fireEvent.click(rows[0]);
    rerender(
      <PowerSearchTouchSurface
        config={config}
        filters={[{...duplicate}, openFilter]}
        onChange={onChange}
      />,
    );
    tapRow('Closed');
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    expect(onChange).toHaveBeenCalledWith(
      [
        duplicate,
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

  it('returns to management when a controlled parent reorders after an edit', () => {
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
    openEditFlow('Status is Open');
    tapRow('Closed');
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Save'}));
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    expect(
      within(sheet()).getByRole('button', {name: 'Status is Closed'}),
    ).toHaveFocus();
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
    openEditFlow('Status is Open');
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
    expect(isSheetOpen()).toBe(true);
    expect(
      within(sheet()).getByRole('heading', {name: 'Filters'}),
    ).toBeTruthy();
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
    openAddFlow();
    tapRow(/^Status/);
    fireEvent.click(screen.getByRole('button', {name: 'Custom save'}));
    expect(onChange).toHaveBeenCalledWith([savedFilter], 'add', 0);
  });

  it('returns to management after a custom edit remounts its filter row', () => {
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
    openEditFlow('Status is Open');
    fireEvent.click(screen.getByRole('button', {name: 'Custom save'}));
    expect(
      within(sheet()).getByRole('button', {name: 'Author is Grace'}),
    ).toBeTruthy();
  });

  it('returns to management without changing filters when a creating custom editor saves null', () => {
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
    openAddFlow();
    tapRow(/^Status/);
    fireEvent.click(screen.getByRole('button', {name: 'Cancel custom'}));
    expect(onChange).not.toHaveBeenCalled();
    expect(isSheetOpen()).toBe(true);
    expect(
      within(sheet()).getByRole('heading', {name: 'Filters'}),
    ).toBeTruthy();
  });

  it('removes a filter from its management row without opening the editor', () => {
    const {onChange} = setup({filters: [openFilter]});
    openSheet();
    fireEvent.click(
      within(sheet()).getByRole('button', {name: 'Remove Status is Open'}),
    );
    expect(onChange).toHaveBeenCalledWith([], 'remove', 0);
    expect(
      within(sheet()).getByRole('heading', {name: 'Filters'}),
    ).toBeTruthy();
  });

  it('keeps touch capsules free of edit and remove controls', () => {
    setup({filters: [openFilter]});
    const root = document.querySelector<HTMLElement>('.astryx-power-search')!;
    expect(within(root).getByText('Open')).toBeTruthy();
    expect(within(root).queryByRole('button', {name: 'Status: is'})).toBeNull();
    expect(within(root).queryByRole('button', {name: /^Remove/})).toBeNull();
    expect(within(root).queryByRole('button', {name: 'Clear all'})).toBeNull();
  });

  it('opens the update sheet from a selected-filter row only', () => {
    setup({filters: [openFilter]});
    openEditFlow('Status is Open');
    expect(within(sheet()).getByRole('heading', {name: 'Status'})).toBeTruthy();
    expect(
      within(sheet()).queryByRole('button', {name: 'Remove this filter'}),
    ).toBeNull();
  });

  it('forwards size but no direct actions to touch token overrides', () => {
    const seenProps = vi.fn();
    function CustomToken(props: PowerSearchTokenProps) {
      seenProps(props);
      return <span>Custom token</span>;
    }
    setup({
      filters: [openFilter],
      size: 'sm',
      components: {enum: {Token: CustomToken}},
    });
    expect(seenProps).toHaveBeenCalledWith(
      expect.objectContaining({
        size: 'sm',
        onClick: undefined,
        onRemove: undefined,
      }),
    );
  });

  it('moves focus to the next row after removing a selected filter', () => {
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
          onChange={next => setFilters(next)}
        />
      );
    }
    render(<Harness />);
    openSheet();
    const remove = within(sheet()).getByRole('button', {
      name: 'Remove Status is Open',
    });
    remove.focus();
    fireEvent.click(remove);
    expect(
      within(sheet()).getByRole('button', {name: 'Author is Ada'}),
    ).toHaveFocus();
  });

  it('moves focus to Add filter after clearing removable filters', () => {
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
    openSheet();
    const clear = within(sheet()).getByRole('button', {name: 'Clear all'});
    clear.focus();
    fireEvent.click(clear);
    expect(
      within(sheet()).getByRole('button', {name: 'Add filter'}),
    ).toHaveFocus();
  });

  it('clears every removable filter but keeps the read-only ones', () => {
    const pinned: PowerSearchFilter = {...openFilter, isReadOnly: true};
    const {onChange} = setup({
      filters: [
        {
          field: 'author',
          operator: 'is',
          value: {type: 'string', value: 'ada'},
        },
        pinned,
      ],
    });
    openSheet();
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Clear all'}));
    expect(onChange).toHaveBeenCalledWith([pinned], 'remove', 0);
  });

  it('keeps Clear all inside management and respects hasClear', () => {
    const {rerender} = setup({filters: [openFilter], hasClear: false});
    openSheet();
    expect(
      within(sheet()).queryByRole('button', {name: 'Clear all'}),
    ).toBeNull();
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Done'}));
    rerender(
      <PowerSearchTouchSurface
        config={config}
        filters={[openFilter]}
        onChange={vi.fn()}
        hasClear
      />,
    );
    fireEvent.transitionEnd(document.querySelector('dialog')!);
    openSheet();
    expect(
      within(sheet()).getByRole('button', {name: 'Clear all'}),
    ).toBeTruthy();
  });

  it('opens a read-only management sheet without mutation actions', () => {
    const {onChange} = setup({filters: [openFilter], isReadOnly: true});
    expect(screen.queryByRole('button', {name: /^Remove/})).toBeNull();
    openSheet();
    expect(isSheetOpen()).toBe(true);
    expect(
      within(sheet()).getByRole('list', {name: 'Selected filters'}),
    ).toBeTruthy();
    expect(within(sheet()).queryByRole('button', {name: /^Remove/})).toBeNull();
    expect(
      within(sheet()).queryByRole('button', {name: 'Clear all'}),
    ).toBeNull();
    expect(
      within(sheet()).queryByRole('button', {name: 'Add filter'}),
    ).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not open when disabled', () => {
    setup({isDisabled: true});
    openSheet();
    expect(isSheetOpen()).toBe(false);
  });

  it('auto-focuses the sheet trigger when requested', () => {
    setup({hasAutoFocus: true});
    expect(screen.getByRole('button', {name: 'Manage filters'})).toHaveFocus();
  });

  it('fires focus callbacks when focus crosses the field boundary', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    setup({filters: [openFilter], onFocus, onBlur});
    const trigger = screen.getByRole('button', {name: 'Manage filters'});

    fireEvent.focus(trigger, {relatedTarget: null});
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();

    fireEvent.blur(trigger, {relatedTarget: document.body});
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
    openAddFlow();
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
    openAddFlow();
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
    openAddFlow();
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

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PowerSearchMobile.test.tsx
 * @input Uses vitest, @testing-library/react, PowerSearchMobile component
 * @output Unit tests for the touch filter-builder flow
 * @position Core testing; validates PowerSearchMobile.tsx implementation
 *
 * SYNC: When PowerSearchMobile.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {createRef} from 'react';
import {PowerSearchMobile} from './PowerSearchMobile';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
  PowerSearchHandle,
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

const openFilter: PowerSearchFilter = {
  field: 'status',
  operator: 'is',
  value: {type: 'enum', value: 'open'},
};

function setup(
  props: Partial<React.ComponentProps<typeof PowerSearchMobile>> = {},
) {
  const onChange = vi.fn();
  const result = render(
    <PowerSearchMobile
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

describe('PowerSearchMobile', () => {
  it('names the group with the label and the tap target with its own text', () => {
    setup({label: 'Filter issues'});
    expect(screen.getByRole('group', {name: 'Filter issues'})).toBeTruthy();
    // The visible text is the accessible name — a <label> pointed at the
    // button would silently replace it (WCAG 2.5.3).
    expect(screen.getByRole('button', {name: 'Search…'})).toBeTruthy();
  });

  it('reads "Add filter" once a filter exists', () => {
    setup({filters: [openFilter]});
    expect(screen.getByRole('button', {name: 'Add filter'})).toBeTruthy();
  });

  it('lists the fields, grouped, when the tap target is pressed', () => {
    setup();
    openSheet();
    const rows = within(sheet()).getAllByRole('button');
    const labels = rows.map(r => r.textContent);
    expect(labels.some(l => l?.includes('Status'))).toBe(true);
    expect(labels.some(l => l?.includes('Author'))).toBe(true);
    expect(within(sheet()).getByRole('list', {name: 'Metadata'})).toBeTruthy();
  });

  it('shows the default operator under each field name', () => {
    setup();
    openSheet();
    expect(
      within(sheet()).getByRole('button', {name: /Author\s*is/}),
    ).toBeTruthy();
  });

  it('adds an enum filter on a single tap of the value', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Status/);
    tapRow('Closed');
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
    expect(isSheetOpen()).toBe(false);
  });

  it('commits an empty-value operator without a value step', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Unassigned/);
    expect(onChange).toHaveBeenCalledWith(
      [{field: 'unassigned', operator: 'isTrue', value: {type: 'empty'}}],
      'add',
      0,
    );
    expect(isSheetOpen()).toBe(false);
  });

  it('drills into a second operator and uses it for the filter', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Status/);
    tapRow(/^Operator/);
    tapRow('is not');
    tapRow('Open');
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

  it('offers no operator row when the field defines one operator', () => {
    setup();
    openSheet();
    tapRow(/^Author/);
    expect(
      within(sheet()).queryByRole('button', {name: /^Operator/}),
    ).toBeNull();
  });

  it('stages a multi-select and commits it from the footer', () => {
    const {onChange} = setup();
    openSheet();
    tapRow(/^Labels/);
    fireEvent.click(within(sheet()).getByRole('checkbox', {name: 'Bug'}));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(within(sheet()).getByRole('checkbox', {name: 'Urgent'}));
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Apply'}));
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

  it('keeps Apply disabled until a value is chosen', () => {
    setup();
    openSheet();
    tapRow(/^Author/);
    const apply = within(sheet()).getByRole('button', {name: 'Apply'});
    expect(
      apply.getAttribute('aria-disabled') ?? apply.hasAttribute('disabled'),
    ).toBeTruthy();
  });

  it('opens a token in edit mode and replaces the filter in place', () => {
    const {onChange} = setup({filters: [openFilter]});
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    expect(within(sheet()).getByText('Edit filter')).toBeTruthy();
    tapRow('Closed');
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

  it('deletes the edited filter from the sheet footer', () => {
    const {onChange} = setup({filters: [openFilter]});
    fireEvent.click(screen.getByRole('button', {name: 'Status: is'}));
    fireEvent.click(within(sheet()).getByRole('button', {name: 'Delete'}));
    expect(onChange).toHaveBeenCalledWith([], 'remove', 0);
  });

  it("removes a filter from its token's remove button", () => {
    const {onChange} = setup({filters: [openFilter]});
    fireEvent.click(screen.getByRole('button', {name: /^Remove/}));
    expect(onChange).toHaveBeenCalledWith([], 'remove', 0);
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
    setup({config: many});
    openSheet();
    const search = within(sheet()).getByRole('textbox', {
      name: 'Search filters',
    });
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
      expect.stringContaining('PowerSearchMobile: 1 field(s) were left out'),
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
      <PowerSearchMobile
        config={config}
        filters={[]}
        onChange={vi.fn()}
        resultCount={3}
      />,
    );
    expect(screen.getByText('3 results')).toBeTruthy();
  });
});

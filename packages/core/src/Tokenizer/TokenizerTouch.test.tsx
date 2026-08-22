// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TokenizerTouch.test.tsx
 * @input Uses vitest, @testing-library/react, Tokenizer
 * @output Behavior coverage for the touch surface and the surface switch
 * @position Test file for /packages/core/src/Tokenizer/
 *
 * Tokenizer.test.tsx covers the pointer surface; the shared test setup answers
 * `(pointer: coarse)` with false, so every test in that file keeps hitting it.
 * This file stubs `matchMedia` per test to reach the other one.
 *
 * The token row's one-line scrolling is CSS the browser resolves and jsdom
 * does not lay out, so it is asserted on the style DEFINITION rather than a
 * measurement — enough to fail loudly if someone deletes the property.
 *
 * SYNC: When TouchTokenizerField.tsx changes, update tests to match
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from 'vitest';
import {render, screen, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {Tokenizer} from './Tokenizer';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';
import type {SearchSource, SearchableItem} from '../Typeahead/types';

// ---------------------------------------------------------------------------
// jsdom scaffolding
// ---------------------------------------------------------------------------

/** Matches the repo-wide setup polyfill, so hover-gated behavior still works. */
const HOVER_CAPABLE = /\(\s*hover\s*:\s*hover\s*\)/;

/**
 * Answer media queries the way a given device would.
 *
 * Width queries are answered HONESTLY, so a width bound creeping into the
 * surface switch fails a test rather than passing silently on a stub that
 * ignores it.
 */
function stubMedia({
  pointer,
  width,
}: {
  pointer: 'coarse' | 'fine';
  width: number;
}): void {
  vi.stubGlobal('matchMedia', (query: string) => {
    const maxWidth = /\(\s*max-width:\s*(\d+)px\s*\)/.exec(query);
    const minWidth = /\(\s*min-width:\s*(\d+)px\s*\)/.exec(query);
    let matches: boolean;
    if (/any-pointer:\s*coarse/.test(query)) {
      matches = pointer === 'coarse';
    } else if (/pointer:\s*coarse/.test(query)) {
      matches = pointer === 'coarse';
    } else if (/pointer:\s*fine/.test(query)) {
      matches = pointer === 'fine';
    } else if (maxWidth) {
      matches = width <= Number(maxWidth[1]);
    } else if (minWidth) {
      matches = width >= Number(minWidth[1]);
    } else {
      matches = HOVER_CAPABLE.test(query);
    }
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  });
}

function setDevice(kind: 'phone' | 'desktop'): void {
  stubMedia(
    kind === 'phone'
      ? {pointer: 'coarse', width: 393}
      : {pointer: 'fine', width: 1280},
  );
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  globalThis.ResizeObserver = MockResizeObserver;
});

beforeEach(() => {
  // jsdom implements neither <dialog> open/close nor pointer capture.
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
  setDevice('phone');
});

afterEach(() => {
  vi.unstubAllGlobals();
  __resetLiveRegionsForTest();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface Skill extends SearchableItem {
  id: string;
  label: string;
}

const SKILLS: Skill[] = [
  {id: 'react', label: 'React'},
  {id: 'typescript', label: 'TypeScript'},
  {id: 'stylex', label: 'StyleX'},
  {id: 'node', label: 'Node'},
  {id: 'graphql', label: 'GraphQL'},
];

function makeSource(items: Skill[] = SKILLS): SearchSource<Skill> {
  return {
    search: async (query: string) =>
      items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
    bootstrap: async () => items,
  };
}

/** The field's Add button — the only control on the closed touch field. */
function addButton(): HTMLElement {
  return screen.getByRole('button', {name: /^Add /});
}

async function openSheet(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  return user.click(addButton());
}

function searchBox(): HTMLElement {
  return screen.getByRole('textbox', {name: 'Search'});
}

const NO_TOKENS: Skill[] = [];

interface HarnessProps {
  initial?: Skill[];
  source?: SearchSource<Skill>;
  onChange?: (items: Skill[]) => void;
  [key: string]: unknown;
}

function Harness({
  initial = NO_TOKENS,
  source,
  onChange,
  ...rest
}: HarnessProps) {
  const [value, setValue] = useState<Skill[]>(initial);
  return (
    <Tokenizer<Skill>
      label="Skills"
      searchSource={source ?? makeSource()}
      value={value}
      onChange={items => {
        setValue(items);
        onChange?.(items);
      }}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------------------
// Which surface
// ---------------------------------------------------------------------------

describe('surface switch', () => {
  it('gives a mouse the typable field it has always had', () => {
    setDevice('desktop');
    render(<Harness />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /^Add /})).toBeNull();
  });

  it('gives a finger the token row and an Add button', () => {
    render(<Harness />);

    expect(addButton()).toBeInTheDocument();
    // No inline input to type between the tokens: on this surface the search
    // lives in the sheet.
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('does not switch on width alone', () => {
    stubMedia({pointer: 'fine', width: 380});
    render(<Harness />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('switches on a tablet, which is wide and still a finger', () => {
    stubMedia({pointer: 'coarse', width: 1194});
    render(<Harness />);

    expect(addButton()).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// The closed field
// ---------------------------------------------------------------------------

describe('the closed field', () => {
  it('names the group with the field label', () => {
    render(<Harness initial={[SKILLS[0]]} />);

    expect(screen.getByRole('group', {name: 'Skills'})).toBeInTheDocument();
  });

  it('shows a token per selection, each removable', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial={[SKILLS[0], SKILLS[1]]} onChange={onChange} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /Remove React/i}));
    expect(onChange).toHaveBeenCalledWith([SKILLS[1]]);
  });

  it('keeps the tokens on one scrolling line, never wrapping', () => {
    render(<Harness initial={SKILLS} />);

    const row = document.querySelector('[data-astryx-token-row]');
    expect(row).not.toBeNull();
    const declared = getComputedStyle(row as Element);
    expect(declared.flexWrap).toBe('nowrap');
    expect(declared.overflowX).toBe('auto');
  });

  it('shows the placeholder while nothing is selected', () => {
    render(<Harness placeholder="Search skills" />);

    expect(screen.getByText('Search skills')).toBeInTheDocument();
  });

  it('carries the hidden inputs a form submission needs', () => {
    render(<Harness initial={[SKILLS[0], SKILLS[1]]} htmlName="skills" />);

    const hidden = document.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="skills"]',
    );
    expect([...hidden].map(i => i.value)).toEqual(['react', 'typescript']);
  });

  it('clears every token at once when asked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness initial={[SKILLS[0], SKILLS[1]]} hasClear onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', {name: /clear all/i}));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('focuses the Add button through handleRef', () => {
    const handleRef = {current: null} as React.RefObject<{
      focus(): void;
      blur(): void;
    } | null>;
    render(<Harness handleRef={handleRef} />);

    act(() => handleRef.current?.focus());
    expect(document.activeElement).toBe(addButton());
  });
});

// ---------------------------------------------------------------------------
// The sheet
// ---------------------------------------------------------------------------

describe('the suggestion sheet', () => {
  it('opens on Add and offers the whole source before anything is typed', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await openSheet(user);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(searchBox()).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'GraphQL'})).toBeInTheDocument(),
    );
  });

  it('is pinned tall, so the keyboard cannot cover the search field', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await openSheet(user);

    // 92dvh is BottomSheet's Tall budget, and Tall is its only
    // keyboard-aware height.
    const panel = document
      .querySelector('dialog')
      ?.querySelector('[style*="--_sheet-budget"]');
    expect(panel?.getAttribute('style')).toContain('92dvh');
  });

  it('does not offer what is already selected', async () => {
    const user = userEvent.setup();
    render(<Harness initial={[SKILLS[0]]} />);

    await openSheet(user);

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Node'})).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', {name: 'React'})).toBeNull();
  });

  it('adds the tapped suggestion and leaves the sheet up for the next one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await openSheet(user);

    await user.click(await screen.findByRole('button', {name: 'React'}));

    expect(onChange).toHaveBeenCalledWith([SKILLS[0]]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Gone from the list the moment it is picked, with no second search.
    await waitFor(() =>
      expect(screen.queryByRole('button', {name: 'React'})).toBeNull(),
    );
  });

  it('searches the source as the user types', async () => {
    const user = userEvent.setup();
    const source = makeSource();
    const search = vi.spyOn(source, 'search');
    render(<Harness source={source} debounceMs={0} />);
    await openSheet(user);

    await user.type(searchBox(), 'graph');

    await waitFor(() => expect(search).toHaveBeenCalledWith('graph'));
    await waitFor(() =>
      expect(screen.queryByRole('button', {name: 'React'})).toBeNull(),
    );
    expect(screen.getByRole('button', {name: 'GraphQL'})).toBeInTheDocument();
  });

  it('says so when a search finds nothing', async () => {
    const user = userEvent.setup();
    render(<Harness debounceMs={0} emptySearchResultsText="Nothing here" />);
    await openSheet(user);

    await user.type(searchBox(), 'zzz');

    expect(await screen.findByText('Nothing here')).toBeInTheDocument();
  });

  it('commits free text as a new token when hasCreate is on', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness hasCreate debounceMs={0} onChange={onChange} />);
    await openSheet(user);

    await user.type(searchBox(), 'Zig');
    await user.click(await screen.findByRole('button', {name: /Create "Zig"/}));

    expect(onChange).toHaveBeenCalledWith([{id: 'Zig', label: 'Zig'}]);
  });

  it('takes Enter as the commit for free text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness hasCreate debounceMs={0} onChange={onChange} />);
    await openSheet(user);

    await user.type(searchBox(), 'Zig');
    await screen.findByRole('button', {name: /Create "Zig"/});
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith([{id: 'Zig', label: 'Zig'}]);
  });

  it('announces what a search turned up', async () => {
    const user = userEvent.setup();
    render(<Harness debounceMs={0} />);
    await openSheet(user);

    await user.type(searchBox(), 'graph');

    await waitFor(() => {
      const polite = document.querySelector(
        '[data-astryx-live-region="polite"]',
      );
      expect(polite?.textContent).toMatch(/1 result/);
    });
  });

  // The sheet's header must cover the list scrolling under it AND stay under
  // BottomSheet's grab handle. Both are z-order in one stacking context, so
  // the header's layer is scoped by an isolated wrapper — which a browser
  // showed the hard way: with a bare z-index the header hid the handle pill,
  // and with none at all List's position: relative rows painted straight
  // through the header's background.
  it('layers the sticky header between the list and the grab handle', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await openSheet(user);

    const header = (await screen.findByRole('heading', {name: 'Add Skills'}))
      .parentElement as HTMLElement;
    expect(getComputedStyle(header).position).toBe('sticky');
    expect(getComputedStyle(header).zIndex).toBe('1');
    expect(getComputedStyle(header.parentElement as Element).isolation).toBe(
      'isolate',
    );
  });
});

// ---------------------------------------------------------------------------
// Limits and disabled state
// ---------------------------------------------------------------------------

describe('limits', () => {
  it('stops offering Add once maxEntries is reached', () => {
    render(<Harness initial={[SKILLS[0], SKILLS[1]]} maxEntries={2} />);

    expect(addButton()).toBeDisabled();
  });

  it('closes the sheet on the token that reaches the limit', async () => {
    const user = userEvent.setup();
    render(<Harness initial={[SKILLS[0]]} maxEntries={2} />);
    await openSheet(user);

    await user.click(await screen.findByRole('button', {name: 'Node'}));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(addButton()).toBeDisabled();
  });

  it('opens nothing while disabled', async () => {
    const user = userEvent.setup();
    render(<Harness isDisabled />);

    expect(addButton()).toBeDisabled();
    await user.click(addButton());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the button focusable when there is a reason to show', async () => {
    render(<Harness isDisabled disabledMessage="Ask an admin first" />);

    const button = addButton();
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');

    button.focus();
    expect(await screen.findByText('Ask an admin first')).toBeInTheDocument();
  });

  it('blocks the sheet even though the button still takes focus', async () => {
    const user = userEvent.setup();
    render(<Harness isDisabled disabledMessage="Ask an admin first" />);

    await user.click(addButton());
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

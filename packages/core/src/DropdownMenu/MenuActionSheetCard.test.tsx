// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuActionSheetCard.test.tsx
 * @input vitest, Testing Library, DropdownMenu with presentation="bottom-sheet"
 *   on a stubbed compact touch screen, isActionSheetCardEligible
 * @output The action sheet's iOS 26 presentation on a phone: a centered
 *   alert-style card (a dialog named by the menu) with the actions and Cancel
 *   in one stack; an action runs and closes; Cancel and Escape close; a menu
 *   with sub-menus, links or regions keeps the bottom sheet; a mouse screen
 *   keeps the bottom sheet
 * @position jsdom tests of MenuActionSheetCard.tsx and its DropdownMenu
 *   wiring; the motion and the finger tracking run in
 *   __tests__/DropdownMenuActionSheet.interaction.browser.spec.ts
 */

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import {useState} from 'react';
import userEvent from '@testing-library/user-event';
import {COMPACT_QUERY} from '../utils/touchPresentation';
import {DropdownMenu, type DropdownMenuOption} from './DropdownMenu';
import {isActionSheetCardEligible} from './MenuActionSheetCard';
import {warmMenuBottomSheet} from './__tests__/warmMenuBottomSheet';

// The bottom sheet loads lazily: resolve it once, before any screen stub.
// Warmed on a compact touch screen, a plain menu would present the card and
// leave the sheet cold for the cases that keep it.
beforeAll(async () => {
  await warmMenuBottomSheet();
}, 20000);

/**
 * The screen: compact and under a finger, or not. The engine (WebKit on iOS,
 * Chrome on Android) does not matter: one touch model.
 */
function stubScreen({compactTouch}: {compactTouch: boolean}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches:
        compactTouch &&
        (query === '(pointer: coarse)' || query === COMPACT_QUERY),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
  // jsdom runs no animations: the alert motion's exit must still end.
  HTMLElement.prototype.animate = vi.fn(function () {
    return {
      cancel: vi.fn(),
      finished: Promise.resolve(),
      startTime: null,
      currentTime: null,
      playState: 'finished',
    } as unknown as Animation;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
});

const ACTIONS: DropdownMenuOption[] = [
  {label: 'Rename'},
  {label: 'Duplicate'},
  {type: 'divider'},
  {label: 'Delete', variant: 'destructive'},
];

function renderActionSheet(items: DropdownMenuOption[] = ACTIONS) {
  render(
    <DropdownMenu
      button={{label: 'Project actions'}}
      presentation="bottom-sheet"
      items={items}
    />,
  );
  return screen.getByRole('button', {name: /Project actions/});
}

describe('isActionSheetCardEligible', () => {
  it('takes plain actions, sections and dividers', () => {
    expect(
      isActionSheetCardEligible(
        [
          {label: 'A'},
          {type: 'divider'},
          {type: 'section', title: 'More', items: [{label: 'B'}]},
        ],
        {hasRegions: false},
      ),
    ).toBe(true);
  });

  it('keeps the bottom sheet for sub-menus, links, rich labels, regions and an empty menu', () => {
    expect(
      isActionSheetCardEligible([{label: 'A', items: [{label: 'B'}]}], {
        hasRegions: false,
      }),
    ).toBe(false);
    expect(
      isActionSheetCardEligible([{label: 'Docs', href: '/docs'}], {
        hasRegions: false,
      }),
    ).toBe(false);
    expect(
      isActionSheetCardEligible([{label: <b>Bold</b>}], {hasRegions: false}),
    ).toBe(false);
    expect(isActionSheetCardEligible([{label: 'A'}], {hasRegions: true})).toBe(
      false,
    );
    expect(isActionSheetCardEligible([], {hasRegions: false})).toBe(false);
  });

  it('keeps the bottom sheet for a row with a description, end content, or that stays open when chosen', () => {
    // The card's buttons show a label and an icon only.
    expect(
      isActionSheetCardEligible([{label: 'A', description: 'More'}], {
        hasRegions: false,
      }),
    ).toBe(false);
    expect(
      isActionSheetCardEligible([{label: 'A', endContent: <span>⌘A</span>}], {
        hasRegions: false,
      }),
    ).toBe(false);
    expect(
      isActionSheetCardEligible([{label: 'A', hasCloseOnSelect: false}], {
        hasRegions: false,
      }),
    ).toBe(false);
  });
});

describe('DropdownMenu action sheet on a phone, under a finger (iOS 26: an alert-style card)', () => {
  beforeEach(() => {
    stubScreen({compactTouch: true});
  });

  it('presents a card named by the menu, with the actions and Cancel in one stack', async () => {
    const user = userEvent.setup();
    const trigger = renderActionSheet();
    await user.click(trigger);
    const card = await screen.findByRole('dialog', {name: 'Project actions'});
    const buttons = Array.from(card.querySelectorAll('button')).map(
      button => button.textContent,
    );
    expect(buttons).toEqual(['Rename', 'Duplicate', 'Delete', 'Cancel']);
    // Every action, Cancel included, is tracked as one group.
    expect(
      card.querySelectorAll('[data-astryx-action-sheet-action]'),
    ).toHaveLength(4);
    // Not the bottom sheet.
    expect(document.querySelector('.astryx-bottom-sheet')).toBeNull();
  });

  it("each action carries the action-group item marker while the card tracks, so the document's press feedback leaves its press to the group's tracker (family:action-groups)", async () => {
    const user = userEvent.setup();
    const trigger = renderActionSheet();
    await user.click(trigger);
    const card = await screen.findByRole('dialog', {name: 'Project actions'});
    const actions = Array.from(
      card.querySelectorAll('[data-astryx-action-sheet-action]'),
    );
    expect(actions).toHaveLength(4);
    for (const action of actions) {
      expect(action).toHaveAttribute('data-astryx-press-group-item', '');
    }
  });

  it('runs the chosen action and closes', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    const trigger = renderActionSheet([
      {label: 'Rename'},
      {label: 'Delete', variant: 'destructive', onClick: onDelete},
    ]);
    await user.click(trigger);
    const card = await screen.findByRole('dialog', {name: 'Project actions'});
    fireEvent.click(
      Array.from(card.querySelectorAll('button')).find(
        button => button.textContent === 'Delete',
      )!,
    );
    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('a disabled action does not run', async () => {
    const onArchive = vi.fn();
    const user = userEvent.setup();
    const trigger = renderActionSheet([
      {label: 'Archive', isDisabled: true, onClick: onArchive},
      {label: 'Rename'},
    ]);
    await user.click(trigger);
    const card = await screen.findByRole('dialog', {name: 'Project actions'});
    const archive = Array.from(card.querySelectorAll('button')).find(
      button => button.textContent === 'Archive',
    )!;
    expect(archive).toBeDisabled();
    fireEvent.click(archive);
    expect(onArchive).not.toHaveBeenCalled();
  });

  it('Cancel closes it without running anything, and focus lands on Cancel when it opens', async () => {
    const onRename = vi.fn();
    const user = userEvent.setup();
    const trigger = renderActionSheet([{label: 'Rename', onClick: onRename}]);
    await user.click(trigger);
    const card = await screen.findByRole('dialog', {name: 'Project actions'});
    const cancel = Array.from(card.querySelectorAll('button')).find(
      button => button.textContent === 'Cancel',
    )!;
    expect(cancel).toHaveAttribute('data-autofocus');
    fireEvent.click(cancel);
    expect(onRename).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('closing it returns focus to the trigger, after a controlled open too', async () => {
    function Controlled() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open from elsewhere
          </button>
          <DropdownMenu
            button={{label: 'Project actions'}}
            presentation="bottom-sheet"
            items={ACTIONS}
            isMenuOpen={isOpen}
            onOpenChange={setIsOpen}
          />
        </>
      );
    }
    render(<Controlled />);
    const opener = screen.getByRole('button', {name: 'Open from elsewhere'});
    fireEvent.click(opener);
    // Nothing focused the trigger: the open came from elsewhere.
    opener.blur();
    const card = await screen.findByRole('dialog', {name: 'Project actions'});
    const cancel = Array.from(card.querySelectorAll('button')).find(
      button => button.textContent === 'Cancel',
    )!;
    fireEvent.click(cancel);
    const trigger = screen.getByRole('button', {name: /^Project actions/});
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('rows that stop being plain actions while it shows keep the card on its last rows', async () => {
    const onRename = vi.fn();
    const user = userEvent.setup();
    const {rerender} = render(
      <DropdownMenu
        button={{label: 'Project actions'}}
        presentation="bottom-sheet"
        items={[{label: 'Rename', onClick: onRename}]}
      />,
    );
    await user.click(screen.getByRole('button', {name: /Project actions/}));
    const card = await screen.findByRole('dialog', {name: 'Project actions'});
    // An asynchronous load turns the row into a sub-menu while the card shows.
    rerender(
      <DropdownMenu
        button={{label: 'Project actions'}}
        presentation="bottom-sheet"
        items={[{label: 'Rename', items: [{label: 'As copy'}]}]}
      />,
    );
    const rename = Array.from(card.querySelectorAll('button')).find(
      button => button.textContent === 'Rename',
    )!;
    fireEvent.click(rename);
    // The row the card opened with runs; nothing is silently dropped.
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  it('a section shows its title above its actions', async () => {
    const user = userEvent.setup();
    const trigger = renderActionSheet([
      {label: 'Rename'},
      {type: 'section', title: 'Share', items: [{label: 'Copy link'}]},
    ]);
    await user.click(trigger);
    const card = await screen.findByRole('dialog', {name: 'Project actions'});
    expect(card).toHaveTextContent('Share');
    expect(
      Array.from(card.querySelectorAll('button')).map(b => b.textContent),
    ).toEqual(['Rename', 'Copy link', 'Cancel']);
  });

  it('a menu with a sub-menu keeps the bottom sheet', async () => {
    const user = userEvent.setup();
    const trigger = renderActionSheet([
      {label: 'Rename'},
      {label: 'Move to', items: [{label: 'Archive'}]},
    ]);
    await user.click(trigger);
    await screen.findByRole('dialog', {name: 'Project actions'});
    expect(
      document.querySelector('[data-astryx-action-sheet-action]'),
    ).toBeNull();
  });
});

describe('DropdownMenu action sheet elsewhere', () => {
  it('without a compact touch screen keeps the bottom sheet', async () => {
    stubScreen({compactTouch: false});
    const user = userEvent.setup();
    const trigger = renderActionSheet();
    await user.click(trigger);
    await screen.findByRole('dialog', {name: 'Project actions'});
    expect(
      document.querySelector('[data-astryx-action-sheet-action]'),
    ).toBeNull();
  });
});

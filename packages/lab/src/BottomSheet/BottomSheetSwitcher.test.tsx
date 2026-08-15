// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetSwitcher.test.tsx
 * @input Uses vitest, Testing Library, BottomSheet, BottomSheetSwitcher
 * @output Tests mutually exclusive sheet selection, dismissal, and focus handoff
 * @position Lab tests for BottomSheetSwitcher
 *
 * SYNC: When BottomSheetSwitcher.tsx or its BottomSheet integration changes,
 * update these tests to match the public behavior.
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {BottomSheet} from './BottomSheet';
import {BottomSheetSwitcher} from './BottomSheetSwitcher';

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
  window.scrollTo = vi.fn();
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function Flow() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  return (
    <>
      <button type="button" onClick={() => setActiveSheet('details')}>
        Start flow
      </button>
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        <BottomSheet
          sheetId="details"
          label="Details"
          data-testid="details-sheet">
          <button type="button" onClick={() => setActiveSheet('confirm')}>
            Continue
          </button>
        </BottomSheet>
        <BottomSheet
          sheetId="confirm"
          label="Confirm"
          data-testid="confirm-sheet">
          <button type="button" onClick={() => setActiveSheet('details')}>
            Back
          </button>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}

function ConditionalFlow() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  return (
    <>
      <button type="button" onClick={() => setActiveSheet('details')}>
        Start conditional flow
      </button>
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        {activeSheet != null && (
          <BottomSheet sheetId={activeSheet} label="Conditional details">
            Content
          </BottomSheet>
        )}
      </BottomSheetSwitcher>
    </>
  );
}

function getSharedScrim(): HTMLElement {
  const scrim = document.querySelector<HTMLElement>(
    '.astryx-bottom-sheet-switcher-scrim',
  );
  if (!scrim) {
    throw new Error('shared switcher scrim not found');
  }
  return scrim;
}

function finishSheetTransition(
  dialog: HTMLElement,
  propertyName: 'transform' | 'opacity',
) {
  const sheet = dialog.querySelector<HTMLElement>('.astryx-bottom-sheet');
  if (!sheet) {
    throw new Error('sheet panel not found');
  }
  fireEvent.transitionEnd(sheet, {propertyName});
}

function getSheetPanel(dialog: HTMLElement): HTMLElement {
  const sheet = dialog.querySelector<HTMLElement>('.astryx-bottom-sheet');
  if (!sheet) {
    throw new Error('sheet panel not found');
  }
  return sheet;
}

function mockSheetTop(sheet: HTMLElement, top: number) {
  const rect = {
    x: 0,
    y: top,
    top,
    right: 640,
    bottom: 800,
    left: 0,
    width: 640,
    height: 800 - top,
    toJSON: () => {},
  };
  vi.spyOn(sheet, 'getBoundingClientRect').mockReturnValue(rect);
  if (sheet.parentElement) {
    vi.spyOn(sheet.parentElement, 'getBoundingClientRect').mockReturnValue(
      rect,
    );
  }
}

describe('BottomSheetSwitcher', () => {
  it('opens only the sheet selected by activeSheet', () => {
    render(<Flow />);

    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));

    expect(screen.getByTestId('details-sheet')).toHaveAttribute('open');
    expect(screen.getByTestId('confirm-sheet')).not.toHaveAttribute('open');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(
      document.querySelectorAll('.astryx-bottom-sheet-switcher-scrim'),
    ).toHaveLength(1);
    expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    expect(screen.getByTestId('details-sheet')).toHaveAttribute(
      'aria-modal',
      'true',
    );
  });

  it('keeps the previous sheet stationary until the new entrance finishes, then fades it', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const sharedScrim = getSharedScrim();
    const detailsSheet = screen.getByTestId('details-sheet');
    const confirmSheet = screen.getByTestId('confirm-sheet');

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(detailsSheet).toHaveAttribute('open');
    expect(detailsSheet).toHaveAttribute('inert');
    expect(detailsSheet).toHaveAttribute('aria-hidden', 'true');
    expect(detailsSheet).not.toHaveAttribute('aria-modal');
    expect(confirmSheet).toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('aria-modal', 'true');
    expect(confirmSheet).not.toHaveAttribute('inert');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(2);
    expect(getSharedScrim()).toBe(sharedScrim);

    // The previous sheet is covered, not exiting: neither transform nor
    // opacity completion may release it before the new entrance completes.
    finishSheetTransition(detailsSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');
    expect(detailsSheet).toHaveAttribute('open');

    finishSheetTransition(confirmSheet, 'transform');
    expect(detailsSheet).toHaveAttribute('open');

    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).not.toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('open');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedScrim()).toBe(sharedScrim);

    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    expect(detailsSheet).toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('inert');
    finishSheetTransition(detailsSheet, 'transform');
    expect(confirmSheet).toHaveAttribute('open');
    finishSheetTransition(confirmSheet, 'opacity');

    expect(detailsSheet).toHaveAttribute('open');
    expect(confirmSheet).not.toHaveAttribute('open');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedScrim()).toBe(sharedScrim);
  });

  it('moves a taller previous sheet down while the shorter new sheet enters, then waits for both', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const detailsSheet = screen.getByTestId('details-sheet');
    const confirmSheet = screen.getByTestId('confirm-sheet');
    const detailsPanel = getSheetPanel(detailsSheet);
    const confirmPanel = getSheetPanel(confirmSheet);
    mockSheetTop(detailsPanel, 100);
    mockSheetTop(confirmPanel, 300);

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(detailsSheet).toHaveAttribute('open');
    expect(detailsPanel).toHaveStyle({transform: 'translateY(200px)'});

    // The incoming entrance may finish first, but opacity cannot hide the
    // retained sheet until its concurrent alignment also completes.
    finishSheetTransition(confirmSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');
    expect(detailsSheet).toHaveAttribute('open');
    finishSheetTransition(detailsSheet, 'transform');
    expect(detailsSheet).toHaveAttribute('open');
    expect(detailsPanel).toHaveStyle({transform: 'translateY(200px)'});
    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).not.toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('open');
  });

  it('waits for the incoming entrance when top-edge alignment finishes first', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const detailsSheet = screen.getByTestId('details-sheet');
    const confirmSheet = screen.getByTestId('confirm-sheet');
    const detailsPanel = getSheetPanel(detailsSheet);
    mockSheetTop(detailsPanel, 100);
    mockSheetTop(getSheetPanel(confirmSheet), 300);

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(detailsPanel).toHaveStyle({transform: 'translateY(200px)'});

    finishSheetTransition(detailsSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');
    expect(detailsSheet).toHaveAttribute('open');
    finishSheetTransition(confirmSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).not.toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('open');
  });

  it('replaces an unfinished outgoing sheet during rapid navigation', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const detailsSheet = screen.getByTestId('details-sheet');
    const confirmSheet = screen.getByTestId('confirm-sheet');

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    expect(detailsSheet).toHaveAttribute('open');
    expect(detailsSheet).not.toHaveAttribute('inert');
    expect(confirmSheet).toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('inert');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(2);

    finishSheetTransition(confirmSheet, 'opacity');
    expect(detailsSheet).toHaveAttribute('open');
    expect(confirmSheet).not.toHaveAttribute('open');
  });

  it('dismisses the flow from the one shared scrim', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));

    fireEvent.click(getSharedScrim());

    const outgoingSheet = screen.getByTestId('details-sheet');
    expect(outgoingSheet).toHaveAttribute('open');
    expect(outgoingSheet).toHaveAttribute('inert');
    expect(getSharedScrim()).toHaveStyle({'--_sheet-scrim-opacity': '0'});
    expect(document.body.style.position).toBe('fixed');

    finishSheetTransition(outgoingSheet, 'transform');

    expect(
      document.querySelector('.astryx-bottom-sheet-switcher-scrim'),
    ).not.toBeInTheDocument();
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('releases the shared modal layer when the closing sheet unmounts immediately', () => {
    render(<ConditionalFlow />);
    fireEvent.click(
      screen.getByRole('button', {name: 'Start conditional flow'}),
    );

    fireEvent.keyDown(
      screen.getByRole('dialog', {name: 'Conditional details'}),
      {key: 'Escape'},
    );

    expect(
      document.querySelector('.astryx-bottom-sheet-switcher-scrim'),
    ).not.toBeInTheDocument();
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('portals the visual layer outside transformed or clipped ancestors', () => {
    render(
      <div
        data-testid="clipping-ancestor"
        style={{overflow: 'hidden', transform: 'translateY(100px)'}}>
        <BottomSheetSwitcher
          activeSheet="details"
          onActiveSheetChange={() => {}}>
          <BottomSheet sheetId="details" label="Portaled details">
            Content
          </BottomSheet>
        </BottomSheetSwitcher>
      </div>,
    );

    const clippingAncestor = screen.getByTestId('clipping-ancestor');
    const dialog = screen.getByRole('dialog', {name: 'Portaled details'});
    expect(clippingAncestor).not.toContainElement(dialog);
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(getSharedScrim().parentElement).toBe(dialog.parentElement);
  });

  it('keeps focus in a modal sheet that has no tabbable controls', () => {
    render(
      <>
        <button type="button">Background action</button>
        <BottomSheetSwitcher
          activeSheet="details"
          onActiveSheetChange={() => {}}>
          <BottomSheet sheetId="details" label="Read-only details">
            Read-only content
          </BottomSheet>
        </BottomSheetSwitcher>
      </>,
    );

    const dialog = screen.getByRole('dialog', {name: 'Read-only details'});
    const panel = getSheetPanel(dialog);
    expect(panel).toHaveFocus();
    expect(fireEvent.keyDown(panel, {key: 'Tab'})).toBe(false);
    expect(panel).toHaveFocus();
    expect(
      screen.getByRole('button', {name: 'Background action'}),
    ).not.toHaveFocus();
  });

  it('can coordinate a non-modal flow without rendering a scrim', () => {
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={() => {}}
        hasScrim={false}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    expect(
      document.querySelector('.astryx-bottom-sheet-switcher-scrim'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', {name: 'Details'})).not.toHaveAttribute(
      'aria-modal',
    );
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('requests activeSheet=null when the active sheet dismisses', () => {
    const onActiveSheetChange = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
        <BottomSheet sheetId="confirm" label="Confirm">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    fireEvent.keyDown(screen.getByRole('dialog', {name: 'Details'}), {
      key: 'Escape',
    });

    expect(onActiveSheetChange).toHaveBeenCalledWith(null);
  });

  it('returns focus to the original opener after a multi-sheet flow ends', async () => {
    vi.useFakeTimers();
    try {
      render(<Flow />);
      const opener = screen.getByRole('button', {name: 'Start flow'});
      opener.focus();
      fireEvent.click(opener);
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

      fireEvent.keyDown(screen.getByRole('dialog', {name: 'Confirm'}), {
        key: 'Escape',
      });
      expect(document.activeElement).not.toBe(opener);
      await act(async () => {
        vi.runAllTimers();
      });

      expect(document.activeElement).toBe(opener);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not refocus the panel when an incoming transition completes', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    const confirmSheet = screen.getByTestId('confirm-sheet');
    const backButton = screen.getByRole('button', {name: 'Back'});
    backButton.focus();
    finishSheetTransition(confirmSheet, 'transform');

    expect(backButton).toHaveFocus();
  });
});

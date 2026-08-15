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
import {createRef, useState} from 'react';
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

function getSharedDialog(): HTMLDialogElement {
  const dialog = document.querySelector<HTMLDialogElement>(
    '.astryx-bottom-sheet-switcher-scrim',
  );
  if (!dialog) {
    throw new Error('shared switcher dialog not found');
  }
  return dialog;
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

    expect(screen.getByTestId('details-sheet')).not.toHaveAttribute('hidden');
    expect(screen.getByTestId('confirm-sheet')).toHaveAttribute('hidden');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(
      document.querySelectorAll('.astryx-bottom-sheet-switcher-scrim'),
    ).toHaveLength(1);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
    expect(getSharedDialog()).toHaveAttribute('aria-modal', 'true');
    expect(getSharedDialog()).toHaveAccessibleName('Details');
  });

  it('forwards sheet DOM props and refs to its layer in the shared dialog', () => {
    const layerRef = createRef<HTMLDivElement>();

    render(
      <BottomSheetSwitcher activeSheet="details" onActiveSheetChange={() => {}}>
        <BottomSheet
          ref={layerRef}
          sheetId="details"
          label="Details"
          data-testid="details-layer"
          data-sheet-owner="settings">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    const layer = screen.getByTestId('details-layer');
    expect(layerRef.current).toBe(layer);
    expect(layer).toHaveAttribute('data-sheet-owner', 'settings');
    expect(getSharedDialog()).toContainElement(layer);
  });

  it('keeps the previous sheet stationary until the new entrance finishes, then fades it', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const sharedDialog = getSharedDialog();
    const detailsSheet = screen.getByTestId('details-sheet');
    const confirmSheet = screen.getByTestId('confirm-sheet');

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsSheet).toHaveAttribute('inert');
    expect(detailsSheet).toHaveAttribute('aria-hidden', 'true');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('inert');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedDialog()).toBe(sharedDialog);
    expect(sharedDialog).toHaveAccessibleName('Confirm');

    // The previous sheet is covered, not exiting: neither transform nor
    // opacity completion may release it before the new entrance completes.
    finishSheetTransition(detailsSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');
    expect(detailsSheet).not.toHaveAttribute('hidden');

    finishSheetTransition(confirmSheet, 'transform');
    expect(detailsSheet).not.toHaveAttribute('hidden');

    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedDialog()).toBe(sharedDialog);

    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('inert');
    finishSheetTransition(detailsSheet, 'transform');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    finishSheetTransition(confirmSheet, 'opacity');

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('hidden');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedDialog()).toBe(sharedDialog);
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

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsPanel).toHaveStyle({transform: 'translateY(200px)'});

    // The incoming entrance may finish first, but opacity cannot hide the
    // retained sheet until its concurrent alignment also completes.
    finishSheetTransition(confirmSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');
    expect(detailsSheet).not.toHaveAttribute('hidden');
    finishSheetTransition(detailsSheet, 'transform');
    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsPanel).toHaveStyle({transform: 'translateY(200px)'});
    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
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
    expect(detailsSheet).not.toHaveAttribute('hidden');
    finishSheetTransition(confirmSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
  });

  it('replaces an unfinished outgoing sheet during rapid navigation', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const detailsSheet = screen.getByTestId('details-sheet');
    const confirmSheet = screen.getByTestId('confirm-sheet');

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsSheet).not.toHaveAttribute('inert');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('inert');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);

    finishSheetTransition(confirmSheet, 'opacity');
    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('hidden');
  });

  it('dismisses the flow from the one shared scrim', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));

    fireEvent.click(getSharedDialog());

    const outgoingSheet = screen.getByTestId('details-sheet');
    expect(outgoingSheet).not.toHaveAttribute('hidden');
    expect(outgoingSheet).toHaveAttribute('inert');
    expect(getSharedDialog()).toHaveStyle({'--_sheet-scrim-opacity': '0'});
    expect(document.body.style.position).toBe('fixed');

    finishSheetTransition(outgoingSheet, 'transform');

    expect(getSharedDialog()).not.toHaveAttribute('open');
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

    expect(getSharedDialog()).not.toHaveAttribute('open');
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('keeps the shared dialog inline and opens it modally', () => {
    render(
      <div
        data-testid="clipping-ancestor"
        style={{overflow: 'hidden', transform: 'translateY(100px)'}}>
        <BottomSheetSwitcher
          activeSheet="details"
          onActiveSheetChange={() => {}}>
          <BottomSheet sheetId="details" label="Inline modal details">
            Content
          </BottomSheet>
        </BottomSheetSwitcher>
      </div>,
    );

    const clippingAncestor = screen.getByTestId('clipping-ancestor');
    const dialog = screen.getByRole('dialog', {name: 'Inline modal details'});
    expect(clippingAncestor).toContainElement(dialog);
    expect(dialog).toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
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
    const dialog = screen.getByRole('dialog', {name: 'Details'});
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(dialog).toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
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

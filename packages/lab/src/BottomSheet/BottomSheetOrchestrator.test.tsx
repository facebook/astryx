// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetOrchestrator.test.tsx
 * @input Uses vitest, Testing Library, BottomSheet, BottomSheetOrchestrator
 * @output Tests mutually exclusive sheet selection, dismissal, and focus handoff
 * @position Lab tests for BottomSheetOrchestrator
 *
 * SYNC: When BottomSheetOrchestrator.tsx or its BottomSheet integration changes,
 * update these tests to match the public behavior.
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {BottomSheet} from './BottomSheet';
import {BottomSheetOrchestrator} from './BottomSheetOrchestrator';

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
      <BottomSheetOrchestrator
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
      </BottomSheetOrchestrator>
    </>
  );
}

function getSharedScrim(): HTMLElement {
  const scrim = document.querySelector<HTMLElement>(
    '.astryx-bottom-sheet-orchestrator-scrim',
  );
  if (!scrim) {
    throw new Error('shared orchestrator scrim not found');
  }
  return scrim;
}

function finishSheetExit(dialog: HTMLElement) {
  const sheet = dialog.querySelector<HTMLElement>('.astryx-bottom-sheet');
  if (!sheet) {
    throw new Error('sheet panel not found');
  }
  fireEvent.transitionEnd(sheet, {propertyName: 'transform'});
}

describe('BottomSheetOrchestrator', () => {
  it('opens only the sheet selected by activeSheet', () => {
    render(<Flow />);

    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));

    expect(screen.getByTestId('details-sheet')).toHaveAttribute('open');
    expect(screen.getByTestId('confirm-sheet')).not.toHaveAttribute('open');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(
      document.querySelectorAll('.astryx-bottom-sheet-orchestrator-scrim'),
    ).toHaveLength(1);
    expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    expect(screen.getByTestId('details-sheet')).toHaveAttribute(
      'aria-modal',
      'true',
    );
  });

  it('animates the outgoing sheet while the next sheet is active', () => {
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

    finishSheetExit(detailsSheet);

    expect(detailsSheet).not.toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('open');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedScrim()).toBe(sharedScrim);

    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    expect(detailsSheet).toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('open');
    expect(confirmSheet).toHaveAttribute('inert');
    finishSheetExit(confirmSheet);

    expect(detailsSheet).toHaveAttribute('open');
    expect(confirmSheet).not.toHaveAttribute('open');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedScrim()).toBe(sharedScrim);
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

    finishSheetExit(confirmSheet);
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

    finishSheetExit(outgoingSheet);

    expect(
      document.querySelector('.astryx-bottom-sheet-orchestrator-scrim'),
    ).not.toBeInTheDocument();
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('can coordinate a non-modal flow without rendering a scrim', () => {
    render(
      <BottomSheetOrchestrator
        activeSheet="details"
        onActiveSheetChange={() => {}}
        hasScrim={false}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetOrchestrator>,
    );

    expect(
      document.querySelector('.astryx-bottom-sheet-orchestrator-scrim'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', {name: 'Details'})).not.toHaveAttribute(
      'aria-modal',
    );
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('requests activeSheet=null when the active sheet dismisses', () => {
    const onActiveSheetChange = vi.fn();
    render(
      <BottomSheetOrchestrator
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
        <BottomSheet sheetId="confirm" label="Confirm">
          Content
        </BottomSheet>
      </BottomSheetOrchestrator>,
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
});

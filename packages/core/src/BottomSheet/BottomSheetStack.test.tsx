// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetStack.test.tsx
 * @input Uses vitest, Testing Library, BottomSheet, BottomSheetStack
 * @output Tests ordered stacking, top-only dismissal, focus return, and shared dialog ownership
 * @position Core tests for BottomSheetStack
 */

import {fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {BottomSheet} from './BottomSheet';
import {BottomSheetStack} from './BottomSheetStack';

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

function getSharedDialog(): HTMLDialogElement {
  const dialog = document.querySelector<HTMLDialogElement>('dialog');
  if (dialog == null) {
    throw new Error('shared dialog not found');
  }
  return dialog;
}

function getSheetLayer(testId: string): HTMLElement {
  const panel = screen.getByTestId(testId);
  const layer = panel.parentElement;
  if (layer == null) {
    throw new Error('sheet layer not found');
  }
  return layer;
}

function finishSheetTransition(element: HTMLElement) {
  fireEvent.transitionEnd(element, {propertyName: 'transform'});
}

function StackFlow() {
  const [openSheetIds, setOpenSheetIds] = useState<ReadonlyArray<string>>([]);
  return (
    <>
      <button type="button" onClick={() => setOpenSheetIds(['filters'])}>
        Open filters
      </button>
      <BottomSheetStack
        openSheetIds={openSheetIds}
        onOpenSheetIdsChange={setOpenSheetIds}>
        <BottomSheet
          sheetId="filters"
          label="Filters"
          data-testid="filters-sheet">
          <button
            type="button"
            onClick={() => setOpenSheetIds(current => [...current, 'details'])}>
            Show details
          </button>
        </BottomSheet>
        <BottomSheet
          sheetId="details"
          label="Details"
          data-testid="details-sheet">
          <button
            type="button"
            onClick={() => setOpenSheetIds(current => current.slice(0, -1))}>
            Back
          </button>
        </BottomSheet>
      </BottomSheetStack>
    </>
  );
}

describe('BottomSheetStack', () => {
  it('keeps covered sheets mounted and makes only the top sheet interactive', () => {
    render(<StackFlow />);

    fireEvent.click(screen.getByRole('button', {name: 'Open filters'}));
    const filtersLayer = getSheetLayer('filters-sheet');
    const detailsLayer = getSheetLayer('details-sheet');
    const showDetails = screen.getByRole('button', {name: 'Show details'});
    showDetails.focus();
    fireEvent.click(showDetails);

    expect(filtersLayer).not.toHaveAttribute('hidden');
    expect(filtersLayer).toHaveAttribute('aria-hidden', 'true');
    expect(filtersLayer).toHaveAttribute('inert');
    expect(filtersLayer.style.getPropertyValue('--x-transform')).toContain(
      'scale(0.96)',
    );
    expect(detailsLayer).not.toHaveAttribute('hidden');
    expect(detailsLayer).not.toHaveAttribute('aria-hidden');
    expect(detailsLayer).not.toHaveAttribute('inert');
    expect(detailsLayer.style.getPropertyValue('--x-transform')).toContain(
      'scale(1)',
    );
    expect(getSharedDialog()).toHaveAccessibleName('Details');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it('dismisses only the top sheet from the shared scrim and restores covered focus', () => {
    render(<StackFlow />);

    fireEvent.click(screen.getByRole('button', {name: 'Open filters'}));
    const showDetails = screen.getByRole('button', {name: 'Show details'});
    showDetails.focus();
    fireEvent.click(showDetails);

    const details = screen.getByTestId('details-sheet');
    fireEvent.click(getSharedDialog());

    expect(getSheetLayer('filters-sheet')).not.toHaveAttribute('inert');
    expect(getSheetLayer('details-sheet')).toHaveAttribute('inert');
    expect(getSharedDialog()).toHaveAccessibleName('Filters');
    expect(showDetails).toHaveFocus();

    finishSheetTransition(details);
    expect(getSheetLayer('details-sheet')).toHaveAttribute('hidden');
    expect(getSharedDialog()).toHaveAttribute('open');
  });

  it('keeps the shared dialog until the root exit finishes, then restores the opener', () => {
    render(<StackFlow />);

    const opener = screen.getByRole('button', {name: 'Open filters'});
    opener.focus();
    fireEvent.click(opener);
    const filters = screen.getByTestId('filters-sheet');

    fireEvent.click(getSharedDialog());
    expect(getSharedDialog()).toHaveAttribute('open');
    expect(getSheetLayer('filters-sheet')).toHaveAttribute('inert');

    finishSheetTransition(filters);
    expect(document.querySelector('dialog[open]')).toBeNull();
    expect(opener).toHaveFocus();
  });

  it('requests a suffix pop for Escape', () => {
    const onOpenSheetIdsChange = vi.fn();
    render(
      <BottomSheetStack
        openSheetIds={['filters', 'details']}
        onOpenSheetIdsChange={onOpenSheetIdsChange}>
        <BottomSheet sheetId="filters" label="Filters">
          Filters
        </BottomSheet>
        <BottomSheet sheetId="details" label="Details">
          Details
        </BottomSheet>
      </BottomSheetStack>,
    );

    fireEvent.keyDown(document, {key: 'Escape'});

    expect(onOpenSheetIdsChange).toHaveBeenCalledTimes(1);
    expect(onOpenSheetIdsChange).toHaveBeenCalledWith(['filters']);
  });

  it('uses the top sheet purpose for implicit dismissal', () => {
    const onOpenSheetIdsChange = vi.fn();
    render(
      <BottomSheetStack
        openSheetIds={['filters', 'required']}
        onOpenSheetIdsChange={onOpenSheetIdsChange}>
        <BottomSheet sheetId="filters" label="Filters">
          Filters
        </BottomSheet>
        <BottomSheet sheetId="required" label="Required" purpose="required">
          Required
        </BottomSheet>
      </BottomSheetStack>,
    );

    expect(getSharedDialog()).toHaveAttribute('role', 'alertdialog');
    fireEvent.keyDown(document, {key: 'Escape'});
    fireEvent.click(getSharedDialog());
    expect(onOpenSheetIdsChange).not.toHaveBeenCalled();
  });

  it('uses one non-modal shell and still routes Escape to the top sheet', () => {
    const onOpenSheetIdsChange = vi.fn();
    render(
      <BottomSheetStack
        openSheetIds={['filters', 'details']}
        onOpenSheetIdsChange={onOpenSheetIdsChange}
        hasScrim={false}>
        <BottomSheet sheetId="filters" label="Filters">
          Filters
        </BottomSheet>
        <BottomSheet sheetId="details" label="Details">
          Details
        </BottomSheet>
      </BottomSheetStack>,
    );

    expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    expect(getSharedDialog()).not.toHaveAttribute('aria-modal');

    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onOpenSheetIdsChange).toHaveBeenCalledWith(['filters']);
  });
});

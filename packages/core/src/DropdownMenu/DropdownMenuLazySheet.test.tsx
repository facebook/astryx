// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuLazySheet.test.tsx
 * @input Uses DropdownMenu, Testing Library, and a held module load
 * @output Tests DropdownMenu while its on-demand touch sheet is still loading
 * @position Test file for DropdownMenu
 *
 * This file never warms the sheet: each test holds the sheet modules until it
 * releases them, so it exercises the path a real page takes while the sheet's
 * code is still downloading.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const sheetLoad = vi.hoisted(() => {
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => {
    release = resolve;
  });
  return {gate, release: () => release()};
});

vi.mock('./MenuBottomSheet', async importOriginal => {
  await sheetLoad.gate;
  return importOriginal();
});

vi.mock('./MenuBottomSheetActionList', async importOriginal => {
  await sheetLoad.gate;
  return importOriginal();
});

const {DropdownMenu} = await import('./DropdownMenu');

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

describe('DropdownMenu touch sheet loaded on demand', () => {
  it('focuses the first action when a keyboard open beats the sheet load', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        presentation="bottom-sheet"
        items={[{label: 'Edit project'}, {label: 'Delete'}]}
      />,
    );

    const trigger = screen.getByRole('button', {name: /Actions/});
    trigger.focus();
    await user.keyboard('{Enter}');
    // The open has committed, but the sheet's code has not arrived yet.
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    expect(screen.queryByRole('button', {name: 'Edit project'})).toBeNull();

    await act(async () => {
      sheetLoad.release();
    });

    await waitFor(
      () =>
        expect(
          screen.getByRole('button', {name: 'Edit project'}),
        ).toHaveFocus(),
      {timeout: 15000},
    );
  }, 20000);
});

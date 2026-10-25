// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file warmTableContextMenu.tsx
 * @input Uses TableCellContextMenu and Testing Library
 * @output Exports warmTableContextMenu, a test helper that resolves the lazily
 *   loaded table context menu once
 * @position Test-only helper for suites that right-click table cells
 *
 * TableCell and TableHeaderCell load their context menu with React.lazy, so a
 * cell's menu is ready a tick after the cell first renders. Rendering one up
 * front caches the resolved module on the lazy component, and every later
 * cell renders its menu synchronously. Call it from `beforeAll`.
 */

import {act, cleanup, render, screen, waitFor} from '@testing-library/react';
import {TableCellContextMenu} from '../TableCellContextMenu';

export async function warmTableContextMenu(): Promise<void> {
  try {
    await act(async () => {
      render(
        <TableCellContextMenu
          actions={[{id: 'warm', label: 'Warm action', onSelect: () => {}}]}>
          Warm cell
        </TableCellContextMenu>,
      );
    });
    // The resolved menu adds its cursor anchor inside the trigger; the
    // loading fallback is a bare wrapper. A cold import transforms the menu's
    // module graph, so allow for it.
    await waitFor(
      () => {
        if (
          screen.getByText('Warm cell').querySelector('[aria-hidden="true"]') ==
          null
        ) {
          throw new Error('table context menu not loaded yet');
        }
      },
      {timeout: 15000},
    );
  } finally {
    cleanup();
  }
}

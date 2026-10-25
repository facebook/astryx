// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TableCellContextMenu.test.tsx
 * @output Tests that table cells load the context menu only when they have actions
 * @position Validates the lazy boundary in TableCellContextMenu
 */

import {describe, it, expect, vi} from 'vitest';
import {act, render, screen, waitFor} from '@testing-library/react';
import {Table} from './Table';
import {TableBody} from './TableBody';
import {TableRow} from './TableRow';
import {TableCell} from './TableCell';
import type {TableContextAction} from './types';

const loads = vi.hoisted(() => ({count: 0}));
vi.mock('./tableContextMenu', async importOriginal => {
  loads.count += 1;
  return importOriginal();
});

function renderCell(contextMenuActions?: TableContextAction[]) {
  return render(
    <Table>
      <TableBody>
        <TableRow>
          <TableCell contextMenuActions={contextMenuActions}>Cell</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

// Order matters: the module registry is per file, so the first test sees
// whether anything has imported the menu yet.
describe('TableCellContextMenu', () => {
  it('does not load the context menu for cells without actions', async () => {
    renderCell();
    renderCell([]);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    expect(screen.getAllByText('Cell')).toHaveLength(2);
    expect(loads.count).toBe(0);
  });

  it('loads it for a cell with actions and keeps the content in place meanwhile', async () => {
    renderCell([{id: 'copy', label: 'Copy', onSelect: () => {}}]);
    expect(screen.getByText('Cell')).toBeTruthy();
    await waitFor(() => expect(loads.count).toBe(1), {timeout: 15000});
    await waitFor(
      () =>
        expect(
          screen.getByText('Cell').querySelector('[aria-hidden="true"]'),
        ).not.toBeNull(),
      {timeout: 15000},
    );
  });
});

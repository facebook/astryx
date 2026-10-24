// Copyright (c) Meta Platforms, Inc. and affiliates.
import {useMemo} from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import {afterEach, describe, it, expect, vi} from 'vitest';
import {warmMenuBottomSheet} from '../DropdownMenu/__tests__/warmMenuBottomSheet';
import {beforeAll} from 'vitest';
beforeAll(warmMenuBottomSheet, 20000);
import {Table} from './Table';
import {useTableActivation} from './plugins/activation/useTableActivation';
import {useTableVirtualization} from './plugins/virtualization/useTableVirtualization';
const data = Array.from({length: 100}, (_, i) => ({
  id: String(i),
  name: `Row ${i}`,
}));
const columns = [{key: 'name', header: 'Name'}];
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function Fixture() {
  const virtualization = useTableVirtualization({
    rowHeight: 56,
    viewportHeight: 240,
  });
  const activation = useTableActivation({
    activeKey: null,
    onActivate: () => {},
  });
  const menu = useMemo(
    () => ({
      rowModel: 'flat' as const,
      transformBodyCell(props: any) {
        return {
          ...props,
          contextMenuActions: [
            {id: 'inspect', label: 'Inspect row', onSelect: () => {}},
          ],
        };
      },
    }),
    [],
  );
  return (
    <Table
      data={data}
      columns={columns}
      idKey="id"
      virtualization={virtualization}
      plugins={{activation, menu}}
    />
  );
}
describe('Table recognized menu focus under windowing', () => {
  it('retains the same logical row while its menu owns focus and returns to its trigger', async () => {
    const {container} = render(<Fixture />);
    const viewport = container.querySelector(
      '.astryx-table-scroll-wrapper',
    ) as HTMLDivElement;
    const body = container.querySelector('tbody')!;
    Object.defineProperties(viewport, {
      clientHeight: {configurable: true, value: 240},
      clientWidth: {configurable: true, value: 400},
      scrollHeight: {configurable: true, value: 5636},
      scrollWidth: {configurable: true, value: 400},
    });
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 400,
      bottom: 240,
      width: 400,
      height: 240,
      toJSON: () => ({}),
    });
    vi.spyOn(body, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0,
      y: 36 - viewport.scrollTop,
      top: 36 - viewport.scrollTop,
      left: 0,
      right: 400,
      bottom: 5636 - viewport.scrollTop,
      width: 400,
      height: 5600,
      toJSON: () => ({}),
    }));
    fireEvent.scroll(viewport);
    const row = container.querySelector(
      'tbody tr[data-table-logical-index="0"]',
    ) as HTMLTableRowElement;
    row.focus();
    fireEvent.contextMenu(row.cells[0].firstElementChild!, {
      clientX: 50,
      clientY: 50,
    });
    const item = (
      await screen.findAllByRole('menuitem', {
        name: 'Inspect row',
        hidden: true,
      })
    )[0];
    item.focus();
    viewport.scrollTop = 4000;
    fireEvent.scroll(viewport);
    await waitFor(() =>
      expect(
        container.querySelector('tbody tr[data-table-logical-index="70"]'),
      ).not.toBeNull(),
    );
    expect(row.isConnected).toBe(true);
    expect(document.activeElement).toBe(item);
    fireEvent.keyDown(item, {key: 'Escape'});
    await waitFor(() => expect(document.activeElement).toBe(row));
    expect(row.isConnected).toBe(true);
  });
});

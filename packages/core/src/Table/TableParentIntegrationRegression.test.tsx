// Copyright (c) Meta Platforms, Inc. and affiliates.
import {render, screen, cleanup} from '@testing-library/react';
import {afterEach, describe, it, expect} from 'vitest';
import {Table} from './Table';
import {useTableVirtualization} from './plugins/virtualization/useTableVirtualization';
const columns = [{key: 'name', header: 'Name'}];
afterEach(cleanup);
describe('Table parent compatibility regressions', () => {
  it('retains legacy key resolution when a caller appends in place', () => {
    const data = [{id: 'a', name: 'A'}];
    const {rerender} = render(
      <Table data={data} columns={columns} idKey="id" />,
    );
    data.push({id: 'b', name: 'B'});
    rerender(<Table data={data} columns={columns} idKey="id" />);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
  it('refreshes identity and stays rendered when windowed data is appended in place', () => {
    const data = Array.from({length: 20}, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
    }));
    function Fixture() {
      const virtualization = useTableVirtualization({
        rowHeight: 56,
        viewportHeight: 240,
      });
      return (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          virtualization={virtualization}
        />
      );
    }
    const view = render(<Fixture />);
    data.push({id: '20', name: 'Appended item'});
    view.rerender(<Fixture />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '22');
    expect(
      view.container.querySelectorAll('tbody > tr:not([aria-hidden])').length,
    ).toBeLessThan(21);
  });
  it('uses actual fallback overflow rather than requested virtualization intent', () => {
    function Fixture() {
      const virtualization = useTableVirtualization({
        rowHeight: 56,
        viewportHeight: 240,
      });
      return (
        <Table
          data={[{id: 'a', name: 'A'}]}
          columns={[{key: 'name', renderCell: item => item.name}]}
          idKey="id"
          virtualization={virtualization}
        />
      );
    }
    const {container} = render(<Fixture />);
    expect(container.querySelector('td')?.className).toContain('wrapStyles');
    expect(container.querySelector('td')?.className).not.toContain(
      'overflowStyles',
    );
  });
});

/**
 * @file XDSTable.test.tsx
 * @input Uses vitest, @testing-library/react, Table components
 * @output Unit tests for XDSBaseTable and XDSTable
 * @position Testing; validates Table implementation
 *
 * SYNC: When XDSBaseTable.tsx or XDSTable.tsx change, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import {XDSBaseTable} from './XDSBaseTable';
import {XDSTable} from './XDSTable';
import {XDSTableRow} from './XDSTableRow';
import {XDSTableCell} from './XDSTableCell';
import {
  proportional,
  pixel,
  generateColumns,
  columnWidthToCSS,
  capitalize,
} from './columnUtils';
import type {TablePlugin, XDSTableColumn} from './types';

// =============================================================================
// Test Data
// =============================================================================

interface User extends Record<string, unknown> {
  name: string;
  age: number;
  email: string;
}

const users: User[] = [
  {name: 'Alice', age: 30, email: 'alice@example.com'},
  {name: 'Bob', age: 25, email: 'bob@example.com'},
  {name: 'Charlie', age: 35, email: 'charlie@example.com'},
];

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'age', header: 'Age', width: pixel(80)},
  {key: 'email', header: 'Email', width: proportional(2)},
];

// =============================================================================
// columnUtils Tests
// =============================================================================

describe('columnUtils', () => {
  describe('proportional', () => {
    it('creates a proportional width with default value 1', () => {
      const w = proportional();
      expect(w).toEqual({type: 'proportional', value: 1});
    });

    it('creates a proportional width with custom value', () => {
      const w = proportional(3);
      expect(w).toEqual({type: 'proportional', value: 3});
    });
  });

  describe('pixel', () => {
    it('creates a pixel width', () => {
      const w = pixel(200);
      expect(w).toEqual({type: 'pixel', value: 200});
    });
  });

  describe('columnWidthToCSS', () => {
    it('converts pixel width to px string', () => {
      expect(columnWidthToCSS(pixel(100), 3)).toBe('100px');
    });

    it('converts proportional width to percentage', () => {
      expect(columnWidthToCSS(proportional(1), 4)).toBe('25%');
    });

    it('handles proportional(2) out of 4', () => {
      expect(columnWidthToCSS(proportional(2), 4)).toBe('50%');
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('name')).toBe('Name');
    });

    it('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('handles single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('generateColumns', () => {
    it('generates columns from data keys', () => {
      const cols = generateColumns(users);
      expect(cols).toHaveLength(3);
      expect(cols[0].key).toBe('name');
      expect(cols[0].header).toBe('Name');
      expect(cols[1].key).toBe('age');
      expect(cols[1].header).toBe('Age');
      expect(cols[2].key).toBe('email');
      expect(cols[2].header).toBe('Email');
    });

    it('returns empty array for empty data', () => {
      expect(generateColumns([])).toEqual([]);
    });

    it('assigns proportional(1) width to each column', () => {
      const cols = generateColumns(users);
      for (const col of cols) {
        expect(col.width).toEqual({type: 'proportional', value: 1});
      }
    });
  });
});

// =============================================================================
// XDSBaseTable Tests
// =============================================================================

describe('XDSBaseTable', () => {
  it('renders a table element', () => {
    render(<XDSBaseTable data={users} columns={columns} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders column headers as th elements', () => {
    render(<XDSBaseTable data={users} columns={columns} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Age');
    expect(headers[2]).toHaveTextContent('Email');
  });

  it('renders data cells', () => {
    render(<XDSBaseTable data={users} columns={columns} />);
    const cells = screen.getAllByRole('cell');
    // 3 rows * 3 columns = 9 cells
    expect(cells).toHaveLength(9);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    render(<XDSBaseTable data={users} columns={columns} />);
    // 1 header row + 3 data rows
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('auto-generates columns from data keys when columns omitted', () => {
    render(<XDSBaseTable data={users} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Age');
    expect(headers[2]).toHaveTextContent('Email');
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('uses raw key as header when header prop is not provided', () => {
    const cols: XDSTableColumn<User>[] = [{key: 'name'}];
    render(<XDSBaseTable data={users} columns={cols} />);
    expect(screen.getByRole('columnheader')).toHaveTextContent('name');
  });

  it('renders custom header as ReactNode', () => {
    const cols: XDSTableColumn<User>[] = [
      {key: 'name', header: <span data-testid="custom-header">Full Name</span>},
    ];
    render(<XDSBaseTable data={users} columns={cols} />);
    expect(screen.getByTestId('custom-header')).toHaveTextContent('Full Name');
  });

  it('uses idKey string to key rows', () => {
    render(<XDSBaseTable data={users} columns={columns} idKey="email" />);
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('uses idKey function to key rows', () => {
    render(
      <XDSBaseTable
        data={users}
        columns={columns}
        idKey={item => item.email}
      />,
    );
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('renders custom cell renderer', () => {
    const customColumns: XDSTableColumn<User>[] = [
      {
        key: 'name',
        header: 'Name',
        renderCell: (item: User) => (
          <strong data-testid="bold-name">{item.name}</strong>
        ),
      },
    ];
    render(<XDSBaseTable data={users} columns={customColumns} />);
    const boldNames = screen.getAllByTestId('bold-name');
    expect(boldNames).toHaveLength(3);
    expect(boldNames[0]).toHaveTextContent('Alice');
  });

  it('renders null/undefined values as empty string', () => {
    const data = [{name: null as unknown as string, age: 0, email: ''}];
    render(<XDSBaseTable data={data} columns={columns} />);
    const cells = screen.getAllByRole('cell');
    // null renders as empty, 0 renders as '0', empty string renders as empty
    expect(cells[0]).toHaveTextContent('');
    expect(cells[1]).toHaveTextContent('0');
    expect(cells[2]).toHaveTextContent('');
  });

  it('renders children mode instead of data', () => {
    render(
      <XDSBaseTable>
        <tr>
          <td>Manual cell</td>
        </tr>
      </XDSBaseTable>,
    );
    expect(screen.getByText('Manual cell')).toBeInTheDocument();
  });

  it('does not render thead or colgroup in children mode without columns', () => {
    const {container} = render(
      <XDSBaseTable>
        <tr>
          <td>Content</td>
        </tr>
      </XDSBaseTable>,
    );
    expect(container.querySelector('thead')).toBeNull();
    expect(container.querySelector('colgroup')).toBeNull();
  });

  it('renders empty table when data is empty array', () => {
    render(<XDSBaseTable data={[]} columns={columns} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    // Header row only, no data rows
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });

  it('renders colgroup with correct column widths', () => {
    const {container} = render(<XDSBaseTable data={users} columns={columns} />);
    const cols = container.querySelectorAll('colgroup col');
    expect(cols).toHaveLength(3);
    // Column 0: proportional(1) — default, total proportional = 1+2 = 3, so 33.33%
    // Column 1: pixel(80) — 80px
    // Column 2: proportional(2) — 2/3 = 66.67%
    expect(cols[1]).toHaveStyle({width: '80px'});
  });

  it('forwards ref to the table element', () => {
    const ref = vi.fn();
    render(<XDSBaseTable data={users} columns={columns} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableElement));
  });

  it('passes tableProps to the table element', () => {
    render(
      <XDSBaseTable
        data={users}
        columns={columns}
        tableProps={{'aria-label': 'Users table'}}
      />,
    );
    expect(screen.getByRole('table')).toHaveAttribute(
      'aria-label',
      'Users table',
    );
  });

  describe('plugin pipeline', () => {
    it('applies transformTable plugin', () => {
      const plugin: TablePlugin<User> = {
        transformTable: props => ({
          ...props,
          htmlProps: {...props.htmlProps, 'data-testid': 'plugin-table'},
        }),
      };
      render(
        <XDSBaseTable data={users} columns={columns} plugins={[plugin]} />,
      );
      expect(screen.getByTestId('plugin-table')).toBeInTheDocument();
    });

    it('applies transformHeaderRow plugin', () => {
      const plugin: TablePlugin<User> = {
        transformHeaderRow: props => ({
          ...props,
          htmlProps: {...props.htmlProps, 'data-testid': 'plugin-header-row'},
        }),
      };
      render(
        <XDSBaseTable data={users} columns={columns} plugins={[plugin]} />,
      );
      expect(screen.getByTestId('plugin-header-row')).toBeInTheDocument();
    });

    it('applies transformHeaderCell plugin with column context', () => {
      const receivedKeys: string[] = [];
      const plugin: TablePlugin<User> = {
        transformHeaderCell: (props, column) => {
          receivedKeys.push(column.key);
          return {
            ...props,
            htmlProps: {...props.htmlProps, 'data-column': column.key},
          };
        },
      };
      render(
        <XDSBaseTable data={users} columns={columns} plugins={[plugin]} />,
      );
      expect(receivedKeys).toEqual(['name', 'age', 'email']);
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveAttribute('data-column', 'name');
    });

    it('applies transformBodyRow plugin with item and index', () => {
      const receivedItems: string[] = [];
      const plugin: TablePlugin<User> = {
        transformBodyRow: (props, item, index) => {
          receivedItems.push(item.name);
          return {
            ...props,
            htmlProps: {...props.htmlProps, 'data-row-index': String(index)},
          };
        },
      };
      render(
        <XDSBaseTable data={users} columns={columns} plugins={[plugin]} />,
      );
      expect(receivedItems).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('applies transformBodyCell plugin with column and item context', () => {
      const calls: Array<{col: string; name: string}> = [];
      const plugin: TablePlugin<User> = {
        transformBodyCell: (props, column, item) => {
          calls.push({col: column.key, name: item.name});
          return props;
        },
      };
      render(
        <XDSBaseTable data={users} columns={columns} plugins={[plugin]} />,
      );
      // 3 rows * 3 columns = 9 calls
      expect(calls).toHaveLength(9);
      expect(calls[0]).toEqual({col: 'name', name: 'Alice'});
    });

    it('composes multiple plugins sequentially', () => {
      const plugin1: TablePlugin<User> = {
        transformTable: props => ({
          ...props,
          htmlProps: {...props.htmlProps, 'data-first': 'yes'},
        }),
      };
      const plugin2: TablePlugin<User> = {
        transformTable: props => ({
          ...props,
          htmlProps: {...props.htmlProps, 'data-second': 'yes'},
        }),
      };
      render(
        <XDSBaseTable
          data={users}
          columns={columns}
          plugins={[plugin1, plugin2]}
        />,
      );
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('data-first', 'yes');
      expect(table).toHaveAttribute('data-second', 'yes');
    });

    it('later plugin can read props set by earlier plugin', () => {
      const plugin1: TablePlugin<User> = {
        transformTable: props => ({
          ...props,
          htmlProps: {...props.htmlProps, 'data-step': '1'},
        }),
      };
      const plugin2: TablePlugin<User> = {
        transformTable: props => {
          const step = (props.htmlProps as Record<string, string>)['data-step'];
          return {
            ...props,
            htmlProps: {...props.htmlProps, 'data-step': step + ',2'},
          };
        },
      };
      render(
        <XDSBaseTable
          data={users}
          columns={columns}
          plugins={[plugin1, plugin2]}
        />,
      );
      expect(screen.getByRole('table')).toHaveAttribute('data-step', '1,2');
    });
  });
});

// =============================================================================
// XDSTable Tests
// =============================================================================

describe('XDSTable', () => {
  it('renders a table with correct structure', () => {
    render(<XDSTable data={users} columns={columns} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getAllByRole('cell')).toHaveLength(9);
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('renders all data values', () => {
    render(<XDSTable data={users} columns={columns} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('auto-generates columns from data', () => {
    render(<XDSTable data={users} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveTextContent('Name');
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('forwards ref to the table element', () => {
    const ref = vi.fn();
    render(<XDSTable data={users} columns={columns} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableElement));
  });

  describe('density', () => {
    it('renders with compact density', () => {
      render(<XDSTable data={users} columns={columns} density="compact" />);
      expect(screen.getAllByRole('row')).toHaveLength(4);
    });

    it('renders with balanced density (default)', () => {
      render(<XDSTable data={users} columns={columns} />);
      expect(screen.getAllByRole('row')).toHaveLength(4);
    });

    it('renders with spacious density', () => {
      render(<XDSTable data={users} columns={columns} density="spacious" />);
      expect(screen.getAllByRole('row')).toHaveLength(4);
    });
  });

  describe('dividers', () => {
    it('renders with row dividers (default)', () => {
      render(<XDSTable data={users} columns={columns} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders with column dividers', () => {
      render(<XDSTable data={users} columns={columns} dividers="columns" />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders with grid dividers', () => {
      render(<XDSTable data={users} columns={columns} dividers="grid" />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders with no dividers', () => {
      render(<XDSTable data={users} columns={columns} dividers="none" />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('striped', () => {
    it('renders with striped rows', () => {
      render(<XDSTable data={users} columns={columns} striped />);
      expect(screen.getAllByRole('row')).toHaveLength(4);
    });
  });

  describe('hover', () => {
    it('renders with hover enabled', () => {
      render(<XDSTable data={users} columns={columns} hover />);
      expect(screen.getAllByRole('row')).toHaveLength(4);
    });
  });

  it('renders with all appearance props combined', () => {
    render(
      <XDSTable
        data={users}
        columns={columns}
        density="compact"
        dividers="grid"
        striped
        hover
      />,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getAllByRole('cell')).toHaveLength(9);
  });

  it('accepts user plugins alongside XDS styling', () => {
    const userPlugin: TablePlugin<User> = {
      transformTable: props => ({
        ...props,
        htmlProps: {...props.htmlProps, 'data-testid': 'custom-plugin'},
      }),
    };
    render(<XDSTable data={users} columns={columns} plugins={[userPlugin]} />);
    expect(screen.getByTestId('custom-plugin')).toBeInTheDocument();
  });

  it('runs user plugins after XDS styling plugin', () => {
    const userPlugin: TablePlugin<User> = {
      transformTable: props => {
        // XDS plugin should have already added styles
        expect(props.styles.length).toBeGreaterThan(1);
        return {
          ...props,
          htmlProps: {...props.htmlProps, 'data-testid': 'after-xds'},
        };
      },
    };
    render(<XDSTable data={users} columns={columns} plugins={[userPlugin]} />);
    expect(screen.getByTestId('after-xds')).toBeInTheDocument();
  });

  it('renders children mode with XDSTableRow and XDSTableCell', () => {
    render(
      <XDSTable>
        <XDSTableRow>
          <XDSTableCell>Streamed A</XDSTableCell>
          <XDSTableCell>Streamed B</XDSTableCell>
        </XDSTableRow>
        <XDSTableRow>
          <XDSTableCell>Streamed C</XDSTableCell>
          <XDSTableCell>Streamed D</XDSTableCell>
        </XDSTableRow>
      </XDSTable>,
    );
    expect(screen.getByText('Streamed A')).toBeInTheDocument();
    expect(screen.getByText('Streamed D')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getAllByRole('cell')).toHaveLength(4);
  });

  it('passes through idKey string to base table', () => {
    render(<XDSTable data={users} columns={columns} idKey="email" />);
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('passes through idKey function to base table', () => {
    const idKey = vi.fn((item: User) => item.email);
    render(<XDSTable data={users} columns={columns} idKey={idKey} />);
    expect(idKey).toHaveBeenCalledTimes(3);
    expect(idKey).toHaveBeenCalledWith(users[0]);
    expect(idKey).toHaveBeenCalledWith(users[1]);
    expect(idKey).toHaveBeenCalledWith(users[2]);
  });
});

// =============================================================================
// XDSTableRow Tests
// =============================================================================

describe('XDSTableRow', () => {
  it('renders a tr element', () => {
    render(
      <table>
        <tbody>
          <XDSTableRow data-testid="test-row">
            <td>Cell</td>
          </XDSTableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('test-row').tagName).toBe('TR');
  });

  it('renders children inside the tr', () => {
    render(
      <table>
        <tbody>
          <XDSTableRow>
            <td>First</td>
            <td>Second</td>
          </XDSTableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('forwards ref to the tr element', () => {
    const ref = vi.fn();
    render(
      <table>
        <tbody>
          <XDSTableRow ref={ref}>
            <td>Cell</td>
          </XDSTableRow>
        </tbody>
      </table>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableRowElement));
  });

  it('passes through HTML attributes', () => {
    render(
      <table>
        <tbody>
          <XDSTableRow className="custom" data-testid="row">
            <td>Cell</td>
          </XDSTableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('row')).toHaveClass('custom');
  });
});

// =============================================================================
// XDSTableCell Tests
// =============================================================================

describe('XDSTableCell', () => {
  it('renders a td element', () => {
    render(
      <table>
        <tbody>
          <tr>
            <XDSTableCell data-testid="test-cell">Content</XDSTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('test-cell').tagName).toBe('TD');
  });

  it('renders children inside the td', () => {
    render(
      <table>
        <tbody>
          <tr>
            <XDSTableCell>
              <span>Nested content</span>
            </XDSTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });

  it('renders empty when no children provided', () => {
    render(
      <table>
        <tbody>
          <tr>
            <XDSTableCell data-testid="empty-cell" />
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('empty-cell')).toHaveTextContent('');
  });

  it('forwards ref to the td element', () => {
    const ref = vi.fn();
    render(
      <table>
        <tbody>
          <tr>
            <XDSTableCell ref={ref}>Cell</XDSTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableCellElement));
  });

  it('forwards colSpan attribute', () => {
    render(
      <table>
        <tbody>
          <tr>
            <XDSTableCell colSpan={3} data-testid="span-cell">
              Spanning
            </XDSTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('span-cell')).toHaveAttribute('colspan', '3');
  });

  it('forwards rowSpan attribute', () => {
    render(
      <table>
        <tbody>
          <tr>
            <XDSTableCell rowSpan={2} data-testid="rowspan-cell">
              Spanning
            </XDSTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('rowspan-cell')).toHaveAttribute('rowspan', '2');
  });
});

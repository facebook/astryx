'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core';
import {XDSText} from '@xds/core';
import {XDSButton} from '@xds/core';
import {XDSHStack, XDSVStack} from '@xds/core';

const styles = stylex.create({
  header: {
    padding: 'var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
  },
  content: {
    padding: 'var(--spacing-6)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'start',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-weight-medium)',
  },
  td: {
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
  },
  row: {
    ':hover': {
      backgroundColor: 'var(--color-wash)',
    },
  },
});

type Item = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  updatedAt: string;
};

const SAMPLE_DATA: Item[] = [
  {id: '1', name: 'Item One', status: 'active', updatedAt: '2025-01-15'},
  {id: '2', name: 'Item Two', status: 'inactive', updatedAt: '2025-01-14'},
  {id: '3', name: 'Item Three', status: 'active', updatedAt: '2025-01-13'},
];

export default function TablePage() {
  const [data] = useState<Item[]>(SAMPLE_DATA);

  return (
    <XDSLayout>
      <XDSLayoutHeader xstyle={styles.header}>
        <XDSHStack align="center" justify="between">
          <XDSText type="large" weight="semibold">
            Items
          </XDSText>
          <XDSButton variant="primary">Add Item</XDSButton>
        </XDSHStack>
      </XDSLayoutHeader>

      <XDSLayoutContent xstyle={styles.content}>
        <table {...stylex.props(styles.table)}>
          <thead>
            <tr>
              <th {...stylex.props(styles.th)}>Name</th>
              <th {...stylex.props(styles.th)}>Status</th>
              <th {...stylex.props(styles.th)}>Updated</th>
              <th {...stylex.props(styles.th)}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} {...stylex.props(styles.row)}>
                <td {...stylex.props(styles.td)}>
                  <XDSText>{item.name}</XDSText>
                </td>
                <td {...stylex.props(styles.td)}>
                  <XDSText
                    color={item.status === 'active' ? 'primary' : 'secondary'}>
                    {item.status}
                  </XDSText>
                </td>
                <td {...stylex.props(styles.td)}>
                  <XDSText color="secondary">{item.updatedAt}</XDSText>
                </td>
                <td {...stylex.props(styles.td)}>
                  <XDSButton variant="secondary" size="sm">
                    Edit
                  </XDSButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </XDSLayoutContent>
    </XDSLayout>
  );
}

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core';
import {XDSText} from '@xds/core';
import {XDSButton} from '@xds/core';
import {XDSHStack} from '@xds/core';

const styles = stylex.create({
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
    <XDSLayout
      header={
        <XDSLayoutHeader hasDivider>
          <XDSHStack vAlign="center" hAlign="between">
            <XDSText type="large" weight="semibold">
              Items
            </XDSText>
            <XDSButton label="Add Item" variant="primary" />
          </XDSHStack>
        </XDSLayoutHeader>
      }
      content={
        <XDSLayoutContent>
          <table sx={styles.table}>
            <thead>
              <tr>
                <th sx={styles.th}>Name</th>
                <th sx={styles.th}>Status</th>
                <th sx={styles.th}>Updated</th>
                <th sx={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} sx={styles.row}>
                  <td sx={styles.td}>
                    <XDSText type="body">{item.name}</XDSText>
                  </td>
                  <td sx={styles.td}>
                    <XDSText
                      type="body"
                      color={
                        item.status === 'active' ? 'primary' : 'secondary'
                      }>
                      {item.status}
                    </XDSText>
                  </td>
                  <td sx={styles.td}>
                    <XDSText type="body" color="secondary">
                      {item.updatedAt}
                    </XDSText>
                  </td>
                  <td sx={styles.td}>
                    <XDSButton label="Edit" variant="secondary" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </XDSLayoutContent>
      }
    />
  );
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Badge} from '@xds/core/Badge';
import {Table} from '@xds/core/Table';
import {List, ListItem} from '@xds/core/List';
import {renderInlineCode} from './renderInlineCode';

export function ListBlock({
  items,
  listStyle,
}: {
  items: string[];
  listStyle?: string;
}) {
  if (listStyle === 'do-dont-merged') {
    const data = items.map((item, i) => {
      const isDo = item.startsWith('do:');
      return {
        _idx: i,
        guidance: isDo ? 'Do' : "Don't",
        isDo,
        text: item.replace(/^(do|dont):/, ''),
      };
    });

    return (
      <Table
        data={data as Record<string, unknown>[]}
        columns={[
          {
            key: 'guidance',
            header: 'Guidance',
            renderCell: (item: Record<string, unknown>) => (
              <Badge
                label={item.guidance as string}
                variant={(item.isDo as boolean) ? 'success' : 'error'}
              />
            ),
          },
          {
            key: 'text',
            header: 'Practice',
            renderCell: (item: Record<string, unknown>) =>
              renderInlineCode(item.text as string),
          },
        ]}
        density="spacious"
        dividers="rows"
      />
    );
  }

  const xdsListStyle =
    listStyle === 'ordered'
      ? 'decimal'
      : listStyle === 'unordered'
        ? 'disc'
        : 'none';

  return (
    <List density="compact" listStyle={xdsListStyle}>
      {items.map((item, i) => (
        <ListItem key={i} label={renderInlineCode(item)} />
      ))}
    </List>
  );
}

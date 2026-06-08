// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSTable} from '@xds/core/Table';
import {XDSList, XDSListItem} from '@xds/core/List';
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
      <XDSTable
        data={data as Record<string, unknown>[]}
        columns={[
          {
            key: 'guidance',
            header: 'Guidance',
            renderCell: (item: Record<string, unknown>) => (
              <XDSBadge
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
    <XDSList density="compact" listStyle={xdsListStyle}>
      {items.map((item, i) => (
        <XDSListItem key={i} label={renderInlineCode(item)} />
      ))}
    </XDSList>
  );
}

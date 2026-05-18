// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTable} from '@xds/core/Table';

/**
 * Renders list content blocks: ordered, unordered, do, dont,
 * and merged do-dont tables with badges.
 */
export function ListBlock({
  items,
  listStyle,
}: {
  items: string[];
  listStyle: 'ordered' | 'unordered' | 'do' | 'dont' | 'do-dont-merged';
}) {
  if (listStyle === ('do-dont-merged' as string)) {
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
          {key: 'text', header: 'Practice'},
        ]}
        density="spacious"
        dividers="rows"
      />
    );
  }

  return (
    <XDSVStack gap={1}>
      {items.map((item, i) => (
        <XDSHStack key={i} gap={2} vAlign="center">
          {listStyle === 'ordered' && (
            <XDSText type="body" color="secondary">
              {i + 1}.
            </XDSText>
          )}
          {listStyle === 'unordered' && (
            <XDSText type="body" color="secondary">
              •
            </XDSText>
          )}
          <XDSText>{item}</XDSText>
        </XDSHStack>
      ))}
    </XDSVStack>
  );
}

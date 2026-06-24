// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Table} from '@astryxdesign/core/Table';

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
          {key: 'text', header: 'Practice'},
        ]}
        density="spacious"
        dividers="rows"
      />
    );
  }

  return (
    <VStack gap={1}>
      {items.map((item, i) => (
        <HStack key={i} gap={2} vAlign="center">
          {listStyle === 'ordered' && (
            <Text type="body" color="secondary">
              {i + 1}.
            </Text>
          )}
          {listStyle === 'unordered' && (
            <Text type="body" color="secondary">
              •
            </Text>
          )}
          <Text>{item}</Text>
        </HStack>
      ))}
    </VStack>
  );
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {TreeList} from '@astryxdesign/core/TreeList';
import {Stack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const noop = () => {};

const items: TreeListItemData[] = [
  {
    id: 'src',
    label: 'src',
    isExpanded: true,
    children: [
      {
        id: 'components',
        label: 'components',
        isExpanded: true,
        children: [
          {id: 'button', label: 'Button.tsx', onClick: noop},
          {id: 'card', label: 'Card.tsx', onClick: noop},
        ],
      },
      {id: 'app', label: 'App.tsx', onClick: noop},
    ],
  },
  {id: 'readme', label: 'README.md', onClick: noop},
];

export default function TreeListVariants() {
  return (
    <Stack
      direction="horizontal"
      gap={6}
      hAlign="start"
      vAlign="start"
      wrap="wrap">
      <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary" weight="bold">
          lineGuides (default)
        </Text>
        <TreeList items={items} variant="lineGuides" />
      </Stack>
      <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary" weight="bold">
          noGuides
        </Text>
        <TreeList items={items} variant="noGuides" />
      </Stack>
    </Stack>
  );
}

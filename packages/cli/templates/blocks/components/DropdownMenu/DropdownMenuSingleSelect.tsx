// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const SORT_OPTIONS = [
  {value: 'newest', label: 'Newest first'},
  {value: 'oldest', label: 'Oldest first'},
  {value: 'active', label: 'Most active'},
] as const;

export default function DropdownMenuSingleSelect() {
  const [sort, setSort] = useState<string>('newest');

  return (
    <VStack gap={3}>
      <DropdownMenu
        button={{label: 'Sort'}}
        items={[
          {
            type: 'section',
            title: 'Sort by',
            items: SORT_OPTIONS.map(option => ({
              label: option.label,
              isSelected: sort === option.value,
              onClick: () => setSort(option.value),
            })),
          },
        ]}
      />
      <Text type="supporting" color="secondary">
        Items with isSelected render as menuitemradio with a check indicator
      </Text>
    </VStack>
  );
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Item} from '@astryxdesign/core/Item';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ItemBasicItem() {
  return (
    <Stack gap={0}>
      <Item
        label="Quarterly planning"
        description="Agenda, notes, and action items"
        endContent={<Text color="secondary">Today</Text>}
      />
      <Item
        label="Customer research"
        description="Interview notes from the latest study"
        endContent={<Text color="secondary">Yesterday</Text>}
      />
      <Item
        label="Launch checklist"
        description="Remaining tasks before release"
        endContent={<Text color="secondary">Fri</Text>}
      />
    </Stack>
  );
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Outline} from '@xds/core/Outline';
import type {OutlineItem} from '@xds/core/Outline';
import {VStack, HStack} from '@xds/core/Layout';
import {Button} from '@xds/core/Button';
import {Text} from '@xds/core/Text';

const items: OutlineItem[] = [
  {id: 'ctrl-summary', label: 'Summary', level: 2},
  {id: 'ctrl-details', label: 'Details', level: 2},
  {id: 'ctrl-results', label: 'Results', level: 2},
  {id: 'ctrl-next-steps', label: 'Next steps', level: 2},
];

export default function OutlineControlled() {
  const [activeId, setActiveId] = useState('ctrl-details');

  const index = items.findIndex(item => item.id === activeId);
  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    setActiveId(items[clamped].id);
  };

  return (
    <VStack gap={4} style={{width: 240}}>
      <Outline
        items={items}
        activeId={activeId}
        onActiveIdChange={setActiveId}
      />
      <HStack gap={2}>
        <Button
          variant="secondary"
          size="sm"
          label="Previous"
          onClick={() => goTo(index - 1)}
        />
        <Button
          variant="secondary"
          size="sm"
          label="Next"
          onClick={() => goTo(index + 1)}
        />
      </HStack>
      <Text type="supporting" color="secondary">
        Active section: {items[index]?.label}
      </Text>
    </VStack>
  );
}

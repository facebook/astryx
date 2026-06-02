// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSOutline} from '@xds/core/Outline';
import type {OutlineItem} from '@xds/core/Outline';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

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
    <XDSVStack gap={4} style={{width: 240}}>
      <XDSOutline
        items={items}
        activeId={activeId}
        onActiveIdChange={setActiveId}
      />
      <XDSHStack gap={2}>
        <XDSButton
          variant="secondary"
          size="sm"
          label="Previous"
          onClick={() => goTo(index - 1)}
        />
        <XDSButton
          variant="secondary"
          size="sm"
          label="Next"
          onClick={() => goTo(index + 1)}
        />
      </XDSHStack>
      <XDSText type="supporting" color="secondary">
        Active section: {items[index]?.label}
      </XDSText>
    </XDSVStack>
  );
}

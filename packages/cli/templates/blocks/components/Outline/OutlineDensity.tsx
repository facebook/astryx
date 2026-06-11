// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSOutline} from '@xds/core/Outline';
import type {OutlineItem} from '@xds/core/Outline';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const items: OutlineItem[] = [
  {id: 'density-getting-started', label: 'Getting started', level: 2},
  {id: 'density-configuration', label: 'Configuration', level: 2},
  {id: 'density-api', label: 'API reference', level: 3},
  {id: 'density-examples', label: 'Examples', level: 3},
  {id: 'density-faq', label: 'FAQ', level: 2},
];

export default function OutlineDensity() {
  return (
    <XDSHStack gap={10} vAlign="start">
      <XDSVStack gap={3} style={{width: 200}}>
        <XDSText type="supporting" color="secondary" weight="medium">
          Default
        </XDSText>
        <XDSOutline
          items={items}
          density="default"
          activeId="density-configuration"
        />
      </XDSVStack>
      <XDSVStack gap={3} style={{width: 200}}>
        <XDSText type="supporting" color="secondary" weight="medium">
          Compact
        </XDSText>
        <XDSOutline
          items={items}
          density="compact"
          activeId="density-configuration"
        />
      </XDSVStack>
    </XDSHStack>
  );
}

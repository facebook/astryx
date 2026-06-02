// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSOutline} from '@xds/core/Outline';
import type {OutlineItem} from '@xds/core/Outline';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const items: OutlineItem[] = [
  {id: 'sizes-getting-started', label: 'Getting started', level: 2},
  {id: 'sizes-configuration', label: 'Configuration', level: 2},
  {id: 'sizes-api', label: 'API reference', level: 3},
  {id: 'sizes-examples', label: 'Examples', level: 3},
  {id: 'sizes-faq', label: 'FAQ', level: 2},
];

export default function OutlineSizes() {
  return (
    <XDSHStack gap={10} vAlign="start">
      <XDSVStack gap={3} style={{width: 200}}>
        <XDSText type="supporting" color="secondary" weight="medium">
          Small
        </XDSText>
        <XDSOutline items={items} size="sm" activeId="sizes-configuration" />
      </XDSVStack>
      <XDSVStack gap={3} style={{width: 200}}>
        <XDSText type="supporting" color="secondary" weight="medium">
          Medium (default)
        </XDSText>
        <XDSOutline items={items} size="md" activeId="sizes-configuration" />
      </XDSVStack>
    </XDSHStack>
  );
}

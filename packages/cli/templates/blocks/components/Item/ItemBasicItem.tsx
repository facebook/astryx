// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSItem} from '@xds/core/Item';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ItemBasicItem() {
  return (
    <XDSStack gap={0}>
      <XDSItem
        label="Quarterly planning"
        description="Agenda, notes, and action items"
        endContent={<XDSText color="secondary">Today</XDSText>}
      />
      <XDSItem
        label="Customer research"
        description="Interview notes from the latest study"
        endContent={<XDSText color="secondary">Yesterday</XDSText>}
      />
      <XDSItem
        label="Launch checklist"
        description="Remaining tasks before release"
        endContent={<XDSText color="secondary">Fri</XDSText>}
      />
    </XDSStack>
  );
}

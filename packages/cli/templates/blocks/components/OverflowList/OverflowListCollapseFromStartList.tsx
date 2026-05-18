// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';

export default function OverflowListCollapseFromStartList() {
  return (
    <XDSCenter width={300}>
      <XDSCard padding={2}>
        <XDSOverflowList
          gap={2}
          collapseFrom="start"
          overflowRenderer={overflowItems => (
            <XDSButton
              label={`+${overflowItems.length} more`}
              variant="ghost"
              size="sm"
            />
          )}>
          <XDSButton label="Step 1" size="sm" />
          <XDSButton label="Step 2" size="sm" />
          <XDSButton label="Step 3" size="sm" />
          <XDSButton label="Step 4" size="sm" />
          <XDSButton label="Step 5" size="sm" />
        </XDSOverflowList>
      </XDSCard>
    </XDSCenter>
  );
}

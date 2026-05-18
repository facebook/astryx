// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSCard} from '@xds/core/Card';

const actions = ['Save', 'Edit', 'Duplicate', 'Share', 'Archive', 'Delete'];

const styles = stylex.create({
  resizable: {
    resize: 'horizontal',
    overflow: 'hidden',
    minWidth: 100,
    width: 350,
    maxWidth: '100%',
  },
});

export default function OverflowListOverflowDropdownActions() {
  return (
    <XDSCard padding={2} xstyle={styles.resizable}>
      <XDSOverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <XDSDropdownMenu
            button={{
              label: `+${overflowItems.length}`,
              variant: 'ghost',
              size: 'sm',
            }}
            items={overflowItems.map(({index}) => ({
              label: actions[index],
              onClick: () => {},
            }))}
          />
        )}>
        <XDSButton label="Save" size="sm" variant="primary" />
        <XDSButton label="Edit" size="sm" />
        <XDSButton label="Duplicate" size="sm" />
        <XDSButton label="Share" size="sm" />
        <XDSButton label="Archive" size="sm" />
        <XDSButton label="Delete" size="sm" variant="destructive" />
      </XDSOverflowList>
    </XDSCard>
  );
}

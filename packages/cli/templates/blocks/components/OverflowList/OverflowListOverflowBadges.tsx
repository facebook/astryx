'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';

const styles = stylex.create({
  resizable: {
    resize: 'horizontal',
    overflow: 'hidden',
    minWidth: 80,
    width: 300,
  },
});

export default function OverflowListOverflowBadges() {
  return (
    <XDSCard padding={2} xstyle={styles.resizable}>
      <XDSOverflowList
        gap={1}
        overflowRenderer={overflowItems => (
          <XDSBadge variant="neutral" label={`+${overflowItems.length}`} />
        )}>
        <XDSBadge variant="info" label="React" />
        <XDSBadge variant="success" label="TypeScript" />
        <XDSBadge variant="warning" label="StyleX" />
        <XDSBadge variant="neutral" label="Storybook" />
        <XDSBadge variant="error" label="Vitest" />
      </XDSOverflowList>
    </XDSCard>
  );
}

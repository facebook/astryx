'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSText} from '@xds/core/Text';
import {XDSToolbar} from '@xds/core/Toolbar';

function FunnelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function ToolbarCardHeaderPattern() {
  return (
    <XDSCard>
      <XDSToolbar
        label="Card actions"
        startContent={<XDSText type="body" weight="bold">Users</XDSText>}
        endContent={
          <>
            <XDSButton label="Filter" variant="ghost" icon={<FunnelIcon />} />
            <XDSButton label="Add" variant="primary" />
          </>
        }
      />
      <XDSSection>{/* card body */}</XDSSection>
    </XDSCard>
  );
}

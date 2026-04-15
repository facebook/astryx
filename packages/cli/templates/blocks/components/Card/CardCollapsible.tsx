'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSCollapsible} from '@xds/core/Collapsible';

export default function CardCollapsible() {
  return (
    <XDSCard>
      <XDSCollapsible trigger="Details">
        <p>This content can be collapsed</p>
      </XDSCollapsible>
    </XDSCard>
  );
}

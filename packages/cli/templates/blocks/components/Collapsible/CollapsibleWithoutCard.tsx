'use client';

import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleWithoutCard() {
  return (
    <XDSVStack gap={2}>
      <XDSCollapsible trigger="Show more details">
        <p style={{margin: 0}}>
          XDSCollapsible works anywhere — it doesn't require a card wrapper.
        </p>
      </XDSCollapsible>
      <XDSCollapsible trigger="Another section" defaultIsOpen={false}>
        <p style={{margin: 0}}>This section starts collapsed.</p>
      </XDSCollapsible>
    </XDSVStack>
  );
}

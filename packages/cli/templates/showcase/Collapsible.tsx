'use client';

import {XDSCollapsible} from '@xds/core/Collapsible';

export default function CollapsibleShowcase() {
  return (
    <XDSCollapsible trigger="Show more details">
      <p style={{margin: 0}}>
        This collapsible manages its own state. Click the trigger to toggle.
      </p>
    </XDSCollapsible>
  );
}

'use client';

import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSText} from '@xds/core/Text';

export default function CollapsibleShowcase() {
  return (
    <XDSCollapsible trigger="Show more details">
      <XDSText type="body">
        This collapsible manages its own state. Click the trigger to toggle.
      </XDSText>
    </XDSCollapsible>
  );
}

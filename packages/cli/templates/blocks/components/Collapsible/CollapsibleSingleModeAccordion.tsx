'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';

export default function CollapsibleSingleModeAccordion() {
  return (
    <XDSCollapsibleGroup type="single" defaultValue="general">
      <XDSVStack gap={2}>
        <XDSCard>
          <XDSCollapsible trigger="General Settings" value="general">
            <p>General settings content goes here.</p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Advanced Settings" value="advanced">
            <p>Advanced settings content goes here.</p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}

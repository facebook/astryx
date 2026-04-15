'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSVStack} from '@xds/core/Stack';

export default function CardAccordion() {
  return (
    <XDSCollapsibleGroup type="single" defaultValue="general">
      <XDSVStack gap={2}>
        <XDSCard>
          <XDSCollapsible trigger="General" value="general">
            <p>General settings content</p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Advanced" value="advanced">
            <p>Advanced settings content</p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}

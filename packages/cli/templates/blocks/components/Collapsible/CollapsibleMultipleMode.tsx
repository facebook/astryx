'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';

export default function CollapsibleMultipleMode() {
  return (
    <XDSCollapsibleGroup type="multiple" defaultValue={['s1', 's2']}>
      <XDSVStack gap={2}>
        <XDSCard>
          <XDSCollapsible trigger="Section 1" value="s1">
            <p>First section content.</p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Section 2" value="s2">
            <p>Second section content.</p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}

'use client';

import {useState} from 'react';
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleControlledAccordion() {
  const [open, setOpen] = useState<string | string[]>('section1');
  return (
    <div>
      <p style={{fontSize: 14, color: '#65676B', margin: '0 0 12px'}}>
        Currently open: <strong>{String(open) || '(none)'}</strong>
      </p>
      <XDSCollapsibleGroup type="single" value={open} onChange={setOpen}>
        <XDSVStack gap={2}>
          <XDSCard>
            <XDSCollapsible trigger="Section 1" value="section1">
              <p style={{margin: 0}}>Content for section 1.</p>
            </XDSCollapsible>
          </XDSCard>
          <XDSCard>
            <XDSCollapsible trigger="Section 2" value="section2">
              <p style={{margin: 0}}>Content for section 2.</p>
            </XDSCollapsible>
          </XDSCard>
          <XDSCard>
            <XDSCollapsible trigger="Section 3" value="section3">
              <p style={{margin: 0}}>Content for section 3.</p>
            </XDSCollapsible>
          </XDSCard>
        </XDSVStack>
      </XDSCollapsibleGroup>
    </div>
  );
}

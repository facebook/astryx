'use client';

import {useState} from 'react';
import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';

export default function CollapsibleStandalone() {
  const [open, setOpen] = useState(true);

  return (
    <XDSCard>
      <XDSCollapsible trigger="Settings" isOpen={open} onOpenChange={setOpen}>
        <p>Controlled externally</p>
      </XDSCollapsible>
    </XDSCard>
  );
}

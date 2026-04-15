'use client';

import {XDSDialog} from '@xds/core/Dialog';

export default function DialogShowcase() {
  return (
    <XDSDialog isOpen={true} onOpenChange={() => {}}>
      Dialog content
    </XDSDialog>
  );
}

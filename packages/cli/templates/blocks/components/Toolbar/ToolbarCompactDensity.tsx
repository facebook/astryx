'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSToolbar} from '@xds/core/Toolbar';

export default function ToolbarCompactDensity() {
  return (
    <XDSToolbar
      label="Compact actions"
      density="compact"
      startContent={
        <>
          <XDSButton label="Cut" variant="ghost" size="sm" />
          <XDSButton label="Copy" variant="ghost" size="sm" />
          <XDSButton label="Paste" variant="ghost" size="sm" />
        </>
      }
    />
  );
}

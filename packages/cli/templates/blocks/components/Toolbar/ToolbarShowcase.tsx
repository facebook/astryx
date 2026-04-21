'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';

export default function ToolbarShowcase() {
  return (
    <XDSToolbar
      label="Actions"
      startContent={
        <>
          <XDSButton label="Cut" variant="ghost" />
          <XDSButton label="Copy" variant="ghost" />
          <XDSButton label="Paste" variant="ghost" />
        </>
      }
      endContent={
        <XDSButton
          label="Settings"
          variant="ghost"
          icon={
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}>
              <circle cx="8" cy="8" r="2" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
            </svg>
          }
          isIconOnly
        />
      }
    />
  );
}

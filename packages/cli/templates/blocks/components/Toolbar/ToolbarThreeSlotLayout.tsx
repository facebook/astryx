'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading} from '@xds/core/Text';

export default function ToolbarThreeSlotLayout() {
  return (
    <XDSToolbar
      label="Document toolbar"
      startContent={
        <XDSButton
          label="Back"
          variant="ghost"
          icon={
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          }
          isIconOnly
        />
      }
      centerContent={<XDSHeading level={4}>Q1 Planning Document</XDSHeading>}
      endContent={
        <>
          <XDSButton label="Discard" variant="secondary" />
          <XDSButton label="Save" />
        </>
      }
    />
  );
}

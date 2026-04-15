'use client';

import {XDSIconButton} from '@xds/core/IconButton';

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function IconButtonPrimaryWithTooltip() {
  return (
    <XDSIconButton
      label="Add item"
      icon={<PlusIcon />}
      variant="primary"
      tooltip="Add a new item"
    />
  );
}

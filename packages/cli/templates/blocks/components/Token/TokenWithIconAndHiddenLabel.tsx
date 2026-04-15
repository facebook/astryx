'use client';

import {XDSToken} from '@xds/core/Token';

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function TokenWithIconAndHiddenLabel() {
  return (
    <XDSToken label="User" icon={<UserIcon />} isLabelHidden />
  );
}

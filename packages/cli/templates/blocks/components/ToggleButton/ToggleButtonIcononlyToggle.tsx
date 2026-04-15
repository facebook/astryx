'use client';

import {useState} from 'react';
import {XDSToggleButton} from '@xds/core/ToggleButton';

function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function ToggleButtonIcononlyToggle() {
  const [isBold, setIsBold] = useState(false);

  return (
    <XDSToggleButton
      label="Bold"
      icon={<BoldIcon />}
      isPressed={isBold}
      onPressedChange={setIsBold}
    />
  );
}

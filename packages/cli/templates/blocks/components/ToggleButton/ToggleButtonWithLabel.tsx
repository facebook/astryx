'use client';

import {useState} from 'react';
import {XDSToggleButton} from '@xds/core/ToggleButton';

export default function ToggleButtonWithLabel() {
  const [isActive, setIsActive] = useState(false);
  return (
    <XDSToggleButton
      label="Active"
      isPressed={isActive}
      onPressedChange={setIsActive}>
      Active
    </XDSToggleButton>
  );
}

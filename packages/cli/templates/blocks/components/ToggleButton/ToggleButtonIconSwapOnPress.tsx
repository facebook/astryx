'use client';

import {useState} from 'react';
import {XDSToggleButton} from '@xds/core/ToggleButton';

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function StarIconSolid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function ToggleButtonIconSwapOnPress() {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <XDSToggleButton
      label="Favorite"
      icon={<StarIcon />}
      pressedIcon={<StarIconSolid />}
      isPressed={isFavorited}
      onPressedChange={setIsFavorited}
    />
  );
}

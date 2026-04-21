'use client';

import {useState} from 'react';
import {XDSToggleButton} from '@xds/core/ToggleButton';

const iconSize = {width: 16, height: 16} as const;
const svgProps = {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...iconSize};

const BellIcon = (
  <svg {...svgProps}>
    <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

const BellSlashIcon = (
  <svg {...svgProps}>
    <path d="M9.143 17.082a24.248 24.248 0 0 0 5.714 0m-5.714 0a3 3 0 1 0 5.714 0M9.143 17.082a23.848 23.848 0 0 1-5.454-1.31A8.967 8.967 0 0 0 6 9.75V9a6 6 0 0 1 .597-2.601M3 3l18 18M17.94 12.85A8.956 8.956 0 0 0 18 9.75V9a6 6 0 0 0-9.22-5.06" />
  </svg>
);

export default function ToggleButtonNotificationToggle() {
  const [isMuted, setIsMuted] = useState(false);
  return (
    <XDSToggleButton
      label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
      icon={BellIcon}
      pressedIcon={BellSlashIcon}
      isPressed={isMuted}
      onPressedChange={setIsMuted}
      isIconOnly
    />
  );
}

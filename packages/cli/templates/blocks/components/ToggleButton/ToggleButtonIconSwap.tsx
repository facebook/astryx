'use client';

import {useState} from 'react';
import {XDSToggleButton} from '@xds/core/ToggleButton';

const iconSize = {width: 16, height: 16} as const;
const svgProps = {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...iconSize};

const StarOutline = (
  <svg {...svgProps}>
    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z" />
  </svg>
);

const StarSolid = (
  <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

const BookmarkOutline = (
  <svg {...svgProps}>
    <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
  </svg>
);

const BookmarkSolid = (
  <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
  </svg>
);

export default function ToggleButtonIconSwap() {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(true);

  return (
    <div style={{display: 'flex', gap: 8}}>
      <XDSToggleButton
        label="Favorite"
        icon={StarOutline}
        pressedIcon={StarSolid}
        isPressed={isFavorited}
        onPressedChange={setIsFavorited}
        isIconOnly
      />
      <XDSToggleButton
        label="Bookmark"
        icon={BookmarkOutline}
        pressedIcon={BookmarkSolid}
        isPressed={isBookmarked}
        onPressedChange={setIsBookmarked}
        isIconOnly
      />
    </div>
  );
}

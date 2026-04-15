'use client';

import {XDSCenter} from '@xds/core/Center';

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function CenterInline() {
  return (
    <XDSCenter isInline>
      <StarIcon />
    </XDSCenter>
  );
}

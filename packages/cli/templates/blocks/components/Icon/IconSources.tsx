'use client';

import {XDSIcon} from '@xds/core/Icon';

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function IconSources() {
  return (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSIcon icon={HomeIcon} />
      <XDSIcon icon={HomeIcon} color="accent" />
      <XDSIcon icon={HomeIcon} size="lg" />
    </div>
  );
}

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

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function IconDirectComponents() {
  return (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSIcon icon={HomeIcon} />
      <XDSIcon icon={HomeIcon} color="accent" size="lg" />
      <XDSIcon icon={HeartIcon} color="negative" />
      <XDSIcon
        icon={HomeIcon}
        aria-hidden={false}
        aria-label="Home"
        role="img"
      />
    </div>
  );
}

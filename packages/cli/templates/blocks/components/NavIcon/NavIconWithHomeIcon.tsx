'use client';

import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSTopNavHeading} from '@xds/core/TopNav';

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
    </svg>
  );
}

export default function NavIconWithHomeIcon() {
  return (
    <XDSTopNavHeading
      heading="Dashboard"
      logo={<XDSNavIcon icon={<HomeIcon />} />}
    />
  );
}

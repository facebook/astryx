'use client';

import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSTopNavHeading} from '@xds/core/TopNav';

function CubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export default function NavIconInTopNavigation() {
  return (
    <XDSTopNavHeading
      heading="My App"
      logo={<XDSNavIcon icon={<CubeIcon />} />}
    />
  );
}

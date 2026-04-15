'use client';

import {XDSNavIcon} from '@xds/core/NavIcon';
// @ts-expect-error migrated example
import {XDSPageNavHeader} from '@xds/core/SideNav';

function CubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export default function NavIconInSideNavigation() {
  return (
    <XDSPageNavHeader
      icon={<XDSNavIcon icon={<CubeIcon />} />}
      heading="My App"
    />
  );
}

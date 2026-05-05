'use client';

import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {
  ChartBarIcon,
  CubeIcon,
  HomeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export default function TopNavEnterpriseDashboard() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={
        <XDSTopNavHeading
          heading="My App"
          logo={<XDSNavIcon icon={<XDSIcon icon={CubeIcon} size="sm" />} />}
          href="#"
        />
      }
      startContent={
        <>
          <XDSTopNavItem
            label="Dashboard"
            href="#"
            isSelected
            icon={<XDSIcon icon={HomeIcon} size="sm" />}
          />
          <XDSTopNavItem
            label="Reports"
            href="#"
            icon={<XDSIcon icon={DocumentTextIcon} size="sm" />}
          />
        </>
      }
      endContent={
        <>
          <XDSButton
            label="Search"
            variant="ghost"
            icon={<XDSIcon icon="search" color="inherit" />}
            isIconOnly
          />
          <XDSButton
            label="Notifications"
            variant="ghost"
            icon={<XDSIcon icon={BellIcon} />}
            isIconOnly
          />
          <XDSButton label="Upgrade" variant="primary" />
        </>
      }
    />
  );
}

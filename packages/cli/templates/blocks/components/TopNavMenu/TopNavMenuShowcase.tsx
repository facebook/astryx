'use client';

import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMenu,
} from '@xds/core/TopNav';
import {XDSButton} from '@xds/core/Button';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function TopNavMenuShowcase() {
  return (
    <XDSTopNav
      style={{width: 600}}
      label="Menu demo"
      heading={<XDSTopNavHeading heading="Platform" />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="#" isSelected />
          <XDSTopNavMenu
            label="Tools"
            items={[
              {
                title: 'Analytics',
                description: 'View traffic and engagement metrics',
                icon: <ChartBarIcon />,
                href: '#analytics',
              },
              {
                title: 'Team Members',
                description: 'Manage your team and permissions',
                icon: <UsersIcon />,
                href: '#team',
              },
              {
                title: 'Settings',
                description: 'Configure your workspace',
                icon: <Cog6ToothIcon />,
                href: '#settings',
              },
            ]}
          />
        </>
      }
      endContent={
        <XDSButton
          label="Search"
          variant="ghost"
          icon={<MagnifyingGlassIcon />}
          isIconOnly
        />
      }
    />
  );
}

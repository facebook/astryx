'use client';

import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {CubeIcon, UserCircleIcon} from '@heroicons/react/24/outline';

export default function TopNavWithLogo() {
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
          <XDSTopNavItem label="Overview" href="#" isSelected />
          <XDSTopNavItem label="Analytics" href="#" />
          <XDSTopNavItem label="Reports" href="#" />
        </>
      }
      endContent={
        <XDSButton
          label="Profile"
          variant="ghost"
          icon={<UserCircleIcon />}
          isIconOnly
        />
      }
    />
  );
}

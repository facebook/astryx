'use client';

import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';

function CubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.5V7.914a1.5 1.5 0 0 0-.75-1.299l-7.5-4.329a1.5 1.5 0 0 0-1.5 0l-7.5 4.33A1.5 1.5 0 0 0 3 7.913V16.5a1.5 1.5 0 0 0 .75 1.3l7.5 4.328a1.5 1.5 0 0 0 1.5 0l7.5-4.329A1.5 1.5 0 0 0 21 16.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 7.5 8.25 4.764 8.25-4.764M12 22.089V12.264" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

export default function TopNavCenteredNavigation() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={
        <XDSTopNavHeading
          heading="My App"
          logo={<XDSNavIcon icon={<CubeIcon />} />}
          href="#"
        />
      }
      centerContent={
        <>
          <XDSTopNavItem label="Home" href="#" isSelected />
          <XDSTopNavItem label="Products" href="#" />
          <XDSTopNavItem label="About" href="#" />
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
            label="Profile"
            variant="ghost"
            icon={<UserIcon />}
            isIconOnly
          />
        </>
      }
    />
  );
}

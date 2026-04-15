'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function TopNavBasicNavWithHeadingAndItems() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={
        <XDSTopNavHeading
          heading="My App"
          logo={<XDSNavIcon icon={<HomeIcon />} />}
          href="/"
        />
      }
      startContent={
        <>
          <XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />
          <XDSTopNavItem label="Products" href="/products" />
          <XDSTopNavItem label="Reports" href="/reports" />
        </>
      }
      endContent={
        <>
          <XDSButton
            label="Notifications"
            variant="ghost"
            icon={<BellIcon />}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            icon={<UserCircleIcon />}
          />
        </>
      }
    />
  );
}

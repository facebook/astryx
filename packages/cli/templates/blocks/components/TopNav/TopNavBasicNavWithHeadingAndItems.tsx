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
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTopNav
      label="Main navigation"
      heading={
        <XDSTopNavHeading
          heading="My App"
          // @ts-expect-error migrated example
          logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
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
            // @ts-expect-error migrated example
            icon={<BellIcon style={{width: 16, height: 16}} />}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            // @ts-expect-error migrated example
            icon={<UserCircleIcon style={{width: 16, height: 16}} />}
          />
        </>
      }
    />
  );
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: TopNavBasicNavWithHeadingAndItems,
};

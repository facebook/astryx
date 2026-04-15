'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';

function AppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <rect x="18" y="3" width="4" height="18" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="2" y="13" width="4" height="8" rx="1" />
    </svg>
  );
}

export default function AppShellSideNavOnly() {
  return (
    <XDSAppShell
      sideNav={
        <XDSSideNav
          header={
            <XDSSideNavHeading
              icon={<AppIcon />}
              heading="My App"
              headingHref="/"
            />
          }>
          <XDSSideNavSection title="Main" isHeaderHidden>
            <XDSSideNavItem
              label="Dashboard"
              icon={HomeIcon}
              isSelected
              href="/dashboard"
            />
            <XDSSideNavItem
              label="Analytics"
              icon={ChartBarIcon}
              href="/analytics"
            />
          </XDSSideNavSection>
        </XDSSideNav>
      }>
      <div style={{padding: 24}}>
        <h1>Dashboard</h1>
        <p>Main content area</p>
      </div>
    </XDSAppShell>
  );
}

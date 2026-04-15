'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSSideNav, XDSSideNavHeading, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';

function AppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function HomeIconSolid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function Content() {
  return <div style={{padding: 8}}>Content</div>;
}

function AppIconLarge() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect width="24" height="24" rx="4" />
    </svg>
  );
}

export default function SideNavStandaloneNoTopNav() {
  return (
    <XDSAppShell
      sideNav={
        <XDSSideNav
          header={
            <XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
          }
          topContent={<XDSButton label="Create new" variant="primary" />}
          // @ts-expect-error migrated example
          footerIcons={<XDSButton icon={HelpIcon} variant="ghost" label="Help" />}>
          <XDSSideNavSection title="Main">
            <XDSSideNavItem
              label="Dashboard"
              icon={HomeIcon}
              selectedIcon={HomeIconSolid}
              isSelected
              href="/dashboard"
            />
            <XDSSideNavItem
              label="Projects"
              icon={FolderIcon}
              href="/projects"
              endContent={<XDSBadge label={3} />}
            />
          </XDSSideNavSection>
    
          <XDSSideNavSection title="Settings">
            <XDSSideNavItem label="General" href="/settings/general" />
            <XDSSideNavItem label="Security" href="/settings/security" />
          </XDSSideNavSection>
        </XDSSideNav>
      }>
      <Content />
    </XDSAppShell>
  );
}

export const showcase = {
  aspectRatio: 3 / 4,
  render: SideNavStandaloneNoTopNav,
};

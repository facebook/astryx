'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';

function HomeIcon() {
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

export default function SideNavWithXDSAppShellTopNavNoHeader() {
  return (
    <XDSAppShell
      topNav={<XDSTopNav heading={<XDSTopNavHeading heading="My App" />} />}
      sideNav={
        <XDSSideNav>
          <XDSSideNavSection title="Main" isHeaderHidden>
            <XDSSideNavItem
              label="Dashboard"
              icon={HomeIcon}
              isSelected
              href="/dashboard"
            />
            <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
          </XDSSideNavSection>
        </XDSSideNav>
      }>
      <Content />
    </XDSAppShell>
  );
}

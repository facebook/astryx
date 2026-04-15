'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSBadge} from '@xds/core/Badge';
import {XDSSideNav, XDSSideNavHeading, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';

export default function SideNavStandaloneNoTopNav() {
  return (
    <XDSAppShell
      sideNav={
        <XDSSideNav
          header={
            <XDSSideNavHeading heading="My App" headingHref="/" />
          }
        >
          <XDSSideNavSection title="Main">
            <XDSSideNavItem
              label="Dashboard"
              isSelected
              href="/dashboard"
            />
            <XDSSideNavItem
              label="Projects"
              href="/projects"
              endContent={<XDSBadge label={3} />}
            />
          </XDSSideNavSection>

          <XDSSideNavSection title="Settings">
            <XDSSideNavItem label="General" href="/settings/general" />
            <XDSSideNavItem label="Security" href="/settings/security" />
          </XDSSideNavSection>
        </XDSSideNav>
      }
    >
      <div style={{padding: 24}}>
        <h2>Page Content</h2>
        <p>Standalone side navigation without a top navigation bar.</p>
      </div>
    </XDSAppShell>
  );
}

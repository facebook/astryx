'use client';

import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';

export default function MobileNavShowcase() {
  return (
    <XDSMobileNav
      isOpen={true}
      onOpenChange={() => {}}
      title="Navigation">
      <XDSSideNavSection title="Main">
        <XDSSideNavItem label="Dashboard" isSelected href="/dashboard" />
        <XDSSideNavItem label="Projects" href="/projects" />
        <XDSSideNavItem label="Analytics" href="/analytics" />
      </XDSSideNavSection>
      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" href="/settings" />
        <XDSSideNavItem label="Team" href="/team" />
      </XDSSideNavSection>
    </XDSMobileNav>
  );
}

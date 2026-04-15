'use client';

import {useState} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNav, XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';

function MenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

export default function MobileNavResponsiveSidebarDrawerPattern() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 768px)').matches;

  const navSections = (
    <>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem label="Dashboard" href="/" isSelected />
        <XDSSideNavItem label="Projects" href="/projects" />
      </XDSSideNavSection>
      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" href="/settings" />
        <XDSSideNavItem label="Security" href="/security" />
      </XDSSideNavSection>
    </>
  );

  if (isMobile) {
    return (
      <>
        <XDSButton
          label="Menu"
          icon={<MenuIcon />}
          variant="ghost"
          onClick={() => setDrawerOpen(true)}
        />
        <XDSMobileNav
          isOpen={drawerOpen}
          onOpenChange={setDrawerOpen}
          header="My App">
          {navSections}
        </XDSMobileNav>
      </>
    );
  }

  return <XDSSideNav>{navSections}</XDSSideNav>;
}

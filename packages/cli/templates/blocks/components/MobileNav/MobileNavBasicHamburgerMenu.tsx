'use client';

import {useState} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';

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

export default function MobileNavBasicHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton
        label="Menu"
        icon={<MenuIcon />}
        variant="ghost"
        onClick={() => setIsOpen(true)}
      />
      <XDSMobileNav
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        header="Navigation">
        <XDSSideNavSection title="Main">
          <XDSSideNavItem label="Dashboard" href="/dashboard" isSelected />
          <XDSSideNavItem label="Analytics" href="/analytics" />
          <XDSSideNavItem label="Settings" href="/settings" />
        </XDSSideNavSection>
      </XDSMobileNav>
    </>
  );
}

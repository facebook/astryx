'use client';

import {useState} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';

export default function MobileNavToggleShowcase() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24}}>
      <XDSButton
        label="Open navigation"
        variant="ghost"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        }
        isIconOnly
        onClick={() => setIsOpen(true)}
      />
      <XDSMobileNav isOpen={isOpen} onOpenChange={setIsOpen} title="Navigation">
        <XDSSideNavSection title="Pages">
          <XDSSideNavItem label="Home" isSelected href="#" />
          <XDSSideNavItem label="Settings" href="#" />
        </XDSSideNavSection>
      </XDSMobileNav>
    </div>
  );
}

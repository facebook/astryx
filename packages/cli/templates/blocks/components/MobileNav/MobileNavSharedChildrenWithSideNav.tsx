'use client';

import {useState} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNav, XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';

export default function MobileNavSharedChildrenWithSideNav() {
  const [open, setOpen] = useState(false);

  const sections = (
    <XDSSideNavSection title="Main">
      <XDSSideNavItem label="Home" href="/" />
      <XDSSideNavItem label="Settings" href="/settings" />
    </XDSSideNavSection>
  );

  return (
    <>
      <XDSSideNav>{sections}</XDSSideNav>
      <XDSMobileNav
        isOpen={open}
        onOpenChange={() => setOpen(false)}>
        {sections}
      </XDSMobileNav>
    </>
  );
}

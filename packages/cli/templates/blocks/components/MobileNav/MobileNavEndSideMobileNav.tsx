// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {Cog6ToothIcon, UsersIcon} from '@heroicons/react/24/outline';

export default function MobileNavEndSideMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <XDSButton label="Open from Right" onClick={() => setIsOpen(true)} />
      <XDSMobileNav
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        header="Settings"
        side="end">
        <XDSSideNavSection title="Settings">
          <XDSSideNavItem
            label="General"
            icon={Cog6ToothIcon}
            href="/settings"
          />
          <XDSSideNavItem label="Team" icon={UsersIcon} href="/team" />
        </XDSSideNavSection>
      </XDSMobileNav>
    </>
  );
}

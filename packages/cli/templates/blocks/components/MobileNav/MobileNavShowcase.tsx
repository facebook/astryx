// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';

export default function MobileNavShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <XDSButton
        label="Open Navigation"
        icon={<XDSIcon icon="menu" color="inherit" />}
        variant="ghost"
        onClick={() => setIsOpen(true)}
        isIconOnly
      />
      <XDSMobileNav
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        header="Navigation">
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
    </>
  );
}

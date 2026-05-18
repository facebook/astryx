// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {
  HomeIcon,
  FolderIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function MobileNavBasicMobileNav() {
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
        onOpenChange={open => setIsOpen(open)}
        header="Navigation">
        <XDSSideNavSection title="Main">
          <XDSSideNavItem
            label="Dashboard"
            icon={HomeIcon}
            isSelected
            href="/dashboard"
          />
          <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
          <XDSSideNavItem
            label="Analytics"
            icon={ChartBarIcon}
            href="/analytics"
          />
        </XDSSideNavSection>
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

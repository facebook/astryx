// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {MobileNav} from '@xds/core/MobileNav';
import {SideNavSection, SideNavItem} from '@xds/core/SideNav';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
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
      <Button
        label="Open Navigation"
        icon={<Icon icon="menu" color="inherit" />}
        variant="ghost"
        onClick={() => setIsOpen(true)}
        isIconOnly
      />
      <MobileNav
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        header="Navigation">
        <SideNavSection title="Main">
          <SideNavItem
            label="Dashboard"
            icon={HomeIcon}
            isSelected
            href="/dashboard"
          />
          <SideNavItem label="Projects" icon={FolderIcon} href="/projects" />
          <SideNavItem
            label="Analytics"
            icon={ChartBarIcon}
            href="/analytics"
          />
        </SideNavSection>
        <SideNavSection title="Settings">
          <SideNavItem
            label="General"
            icon={Cog6ToothIcon}
            href="/settings"
          />
          <SideNavItem label="Team" icon={UsersIcon} href="/team" />
        </SideNavSection>
      </MobileNav>
    </>
  );
}

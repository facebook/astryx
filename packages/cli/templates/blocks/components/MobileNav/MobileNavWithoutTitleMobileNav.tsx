// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {HomeIcon, FolderIcon} from '@heroicons/react/24/outline';

export default function MobileNavWithoutTitleMobileNav() {
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
      <XDSMobileNav isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <XDSSideNavSection title="Main">
          <XDSSideNavItem
            label="Dashboard"
            icon={HomeIcon}
            isSelected
            href="/dashboard"
          />
          <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
        </XDSSideNavSection>
      </XDSMobileNav>
    </>
  );
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {MobileNav} from '@astryxdesign/core/MobileNav';
import {SideNavSection, SideNavItem} from '@astryxdesign/core/SideNav';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

export default function MobileNavShowcase() {
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
        onOpenChange={setIsOpen}
        header="Navigation">
        <SideNavSection title="Main">
          <SideNavItem label="Dashboard" isSelected href="/dashboard" />
          <SideNavItem label="Projects" href="/projects" />
          <SideNavItem label="Analytics" href="/analytics" />
        </SideNavSection>
        <SideNavSection title="Settings">
          <SideNavItem label="General" href="/settings" />
          <SideNavItem label="Team" href="/team" />
        </SideNavSection>
      </MobileNav>
    </>
  );
}

'use client';

import {useState} from 'react';
import type {SVGProps} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavSection, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';

const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const FolderIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

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
          <XDSSideNavItem
            label="Projects"
            icon={FolderIcon}
            href="/projects"
          />
        </XDSSideNavSection>
      </XDSMobileNav>
    </>
  );
}

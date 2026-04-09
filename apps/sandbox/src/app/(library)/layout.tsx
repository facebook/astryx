'use client';

import {usePathname} from 'next/navigation';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavSection,
  XDSSideNavItem,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  HomeIcon,
  BookOpenIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
} from '@heroicons/react/24/solid';

function LibraryNav() {
  const pathname = usePathname();

  return (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon
              icon={<Squares2X2Icon style={{width: 16, height: 16}} />}
            />
          }
          heading="XDS Library"
          headingHref="/"
        />
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Home"
          href="/"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected={pathname === '/'}
        />
        <XDSSideNavItem
          label="Library"
          href="/pages/library/"
          icon={BookOpenIcon}
          selectedIcon={BookOpenIconSolid}
          isSelected={pathname.startsWith('/pages/library')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Tools">
        <XDSSideNavItem
          label="Components"
          href="/components-patterns/"
          icon={Squares2X2Icon}
          selectedIcon={Squares2X2IconSolid}
          isSelected={pathname.startsWith('/components-patterns')}
        />
        <XDSSideNavItem
          label="Templates"
          href="/templates/"
          icon={WrenchScrewdriverIcon}
          isSelected={pathname.startsWith('/templates')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

export default function LibraryLayout({children}: {children: React.ReactNode}) {
  return (
    <XDSAppShell sideNav={<LibraryNav />} contentPadding={0}>
      {children}
    </XDSAppShell>
  );
}

'use client';

import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSSelector} from '@xds/core/Selector';
import {useThemeControls} from './providers';
import type {ThemeMode} from '@xds/core/theme';

const pages = [
  {name: 'Home', href: '/'},
  {name: 'Theme Editor', href: '/pages/theme-editor/'},
  {name: 'Shell Lab', href: '/pages/shell-lab/'},
  {name: 'Example', href: '/pages/example/'},
  {name: 'Navigation', href: '/pages/navigation/'},
  {name: 'TopNav Menu', href: '/pages/topnav-menu/'},
  {name: 'Mega Menu', href: '/pages/mega-menu/'},
  {name: 'Polymorphic Link', href: '/pages/polymorphic-link/'},
  {name: 'Table Overview', href: '/pages/table-overview/'},
];

export function SandboxNav() {
  const pathname = usePathname();
  const {themeName, setThemeName, mode, setMode} = useThemeControls();

  return (
    <XDSSideNav header={<XDSSideNavHeading heading="Sandbox" />}>
      <XDSSideNavSection title="Pages" isHeaderHidden>
        {pages.map(page => {
          const isActive =
            pathname === page.href ||
            (page.href !== '/' && pathname.startsWith(page.href));
          return (
            <XDSSideNavItem
              key={page.href}
              label={page.name}
              href={page.href}
              isSelected={isActive}
              as={Link}
            />
          );
        })}
      </XDSSideNavSection>
      <XDSSideNavSection title="Theme">
        <div style={{padding: '0 12px'}}>
          <XDSSelector
            label="Theme"
            isLabelHidden
            size="sm"
            value={themeName}
            onChange={setThemeName}
            options={[
              {value: 'default', label: 'Default'},
              {value: 'neutral', label: 'Neutral'},
              {value: 'brutalist', label: 'Brutalist'},
              {value: 'meta', label: 'Meta'},
              {value: 'whatsapp', label: 'WhatsApp'},
            ]}
          />
        </div>
      </XDSSideNavSection>
      <XDSSideNavSection title="Mode">
        <div style={{padding: '0 12px'}}>
          <XDSSelector
            label="Mode"
            isLabelHidden
            size="sm"
            value={mode}
            onChange={v => setMode(v as ThemeMode)}
            options={[
              {value: 'light', label: 'Light'},
              {value: 'dark', label: 'Dark'},
            ]}
          />
        </div>
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

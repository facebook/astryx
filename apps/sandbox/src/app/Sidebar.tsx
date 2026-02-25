'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {XDSSideNav, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSSelector} from '@xds/core/Selector';
import {XDSVStack} from '@xds/core/Layout';
import {useThemeSwitcher, themes} from './providers';

const pages = [
  {name: 'Home', href: '/'},
  {name: 'Example', href: '/pages/example/'},
  {name: 'Navigation', href: '/pages/navigation/'},
  {name: 'TopNav Menu', href: '/pages/topnav-menu/'},
  {name: 'Polymorphic Link', href: '/pages/polymorphic-link/'},
];

const themeItems = Object.keys(themes).map(name => ({
  value: name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
}));

const modeItems = [
  {value: 'system', label: 'System'},
  {value: 'light', label: 'Light'},
  {value: 'dark', label: 'Dark'},
];

// XDSSideNavItem uses raw <a> which doesn't handle Next.js basePath.
// Use Next.js <Link> styled to match until the component supports a
// custom link renderer.
const navItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-2)',
  paddingBlock: 'var(--spacing-2)',
  paddingInline: 'var(--spacing-3)',
  borderRadius: 'var(--radius-element)',
  textDecoration: 'none',
  fontSize: '0.875rem',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
};

const navItemSelectedStyle: React.CSSProperties = {
  ...navItemStyle,
  backgroundColor: 'var(--color-hover-overlay)',
  fontWeight: 600,
};

export function Sidebar() {
  const pathname = usePathname();
  const {themeName, mode, setThemeName, setMode} = useThemeSwitcher();

  return (
    <XDSSideNav
      header={
        <XDSSideNavSection title="Pages">
          {pages.map(page => {
            const isActive =
              pathname === page.href ||
              (page.href !== '/' && pathname.startsWith(page.href));
            return (
              <Link
                key={page.href}
                href={page.href}
                style={isActive ? navItemSelectedStyle : navItemStyle}>
                {page.name}
              </Link>
            );
          })}
        </XDSSideNavSection>
      }
      footer={
        <XDSVStack gap="space3">
          <XDSSelector
            label="Theme"
            items={themeItems}
            value={themeName}
            onChange={setThemeName}
          />
          <XDSSelector
            label="Mode"
            items={modeItems}
            value={mode}
            onChange={value => setMode(value as 'system' | 'light' | 'dark')}
          />
        </XDSVStack>
      }>
      {null}
    </XDSSideNav>
  );
}

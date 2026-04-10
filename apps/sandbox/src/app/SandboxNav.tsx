'use client';

import * as stylex from '@stylexjs/stylex';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSText} from '@xds/core/Text';
import {useThemeControls} from './providers';
import type {ThemeMode} from '@xds/core/theme';
import {categories} from './sandboxPages';
import {
  HomeIcon,
  WrenchIcon,
  PaletteIcon,
  SunIcon,
  MoonIcon,
  BoxIcon,
  AppWindowIcon,
} from './icons';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';

const categoryIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  'components-patterns': BoxIcon,
  templates: AppWindowIcon,
  tools: WrenchIcon,
};

const styles = stylex.create({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  controls: {
    display: 'flex',
    gap: 2,
  },
});

function SandboxHeader() {
  const {setThemeName, mode, setMode} = useThemeControls();

  const themeItems = [
    {label: 'Default', onClick: () => setThemeName('default')},
    {label: 'Neutral', onClick: () => setThemeName('neutral')},
    {label: 'Brutalist', onClick: () => setThemeName('brutalist')},
    {label: 'Meta', onClick: () => setThemeName('meta')},
    {label: 'WhatsApp', onClick: () => setThemeName('whatsapp')},
    {label: 'Daily', onClick: () => setThemeName('daily')},
  ];

  const modeItems = [
    {label: 'Light', onClick: () => setMode('light' as ThemeMode)},
    {label: 'Dark', onClick: () => setMode('dark' as ThemeMode)},
  ];

  return (
    <div {...stylex.props(styles.header)}>
      <XDSText type="body" weight="bold">
        Sandbox
      </XDSText>
      <div {...stylex.props(styles.controls)}>
        <XDSDropdownMenu
          button={{
            label: 'Theme',

            icon: (
              <PaletteIcon
                width={16}
                height={16}
                style={{color: 'var(--color-icon-secondary)'}}
              />
            ),

            variant: 'ghost',
            size: 'sm',
            isIconOnly: true,
          }}
          menuWidth={160}
          items={themeItems}
        />
        <XDSDropdownMenu
          button={{
            label: mode === 'dark' ? 'Dark mode' : 'Light mode',

            icon:
              mode === 'dark' ? (
                <MoonIcon
                  width={16}
                  height={16}
                  style={{color: 'var(--color-icon-secondary)'}}
                />
              ) : (
                <SunIcon
                  width={16}
                  height={16}
                  style={{color: 'var(--color-icon-secondary)'}}
                />
              ),

            variant: 'ghost',
            size: 'sm',
            isIconOnly: true,
          }}
          menuWidth={160}
          items={modeItems}
        />
      </div>
    </div>
  );
}

export function SandboxNav() {
  const pathname = usePathname();

  return (
    <XDSSideNav header={<SandboxHeader />}>
      <XDSSideNavSection title="Home" isHeaderHidden>
        <XDSSideNavItem
          label="Home"
          href="/"
          isSelected={pathname === '/'}
          as={Link}
          icon={HomeIcon}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Projects">
        {categories.map(category => {
          const isActive = pathname === `/${category.slug}/`;
          const IconComponent = categoryIcons[category.slug];
          return (
            <XDSSideNavItem
              key={category.slug}
              label={category.label}
              href={`/${category.slug}/`}
              isSelected={isActive}
              as={Link}
              icon={IconComponent}
            />
          );
        })}
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

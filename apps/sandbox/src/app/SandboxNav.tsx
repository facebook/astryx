// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Text} from '@astryxdesign/core/Text';
import {useThemeControls, SANDBOX_THEMES} from './providers';
import type {ThemeMode} from '@astryxdesign/core/theme';
import {categories} from './sandboxPages';
import {
  HomeIcon,
  WrenchIcon,
  PaletteIcon,
  SunIcon,
  MoonIcon,
  BoxIcon,
  AppWindowIcon,
  BlocksIcon,
} from './icons';
import {spacingVars, colorVars} from '@astryxdesign/core/theme/tokens.stylex';

const categoryIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  'components-patterns': BoxIcon,
  templates: AppWindowIcon,
  blocks: BlocksIcon,
  themes: PaletteIcon,
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

  const themeItems = SANDBOX_THEMES.map(({id, label}) => ({
    label,
    onClick: () => setThemeName(id),
  }));

  const modeItems = [
    {label: 'Light', onClick: () => setMode('light' as ThemeMode)},
    {label: 'Dark', onClick: () => setMode('dark' as ThemeMode)},
  ];

  return (
    <div {...stylex.props(styles.header)}>
      <Text type="body" weight="bold">
        Sandbox
      </Text>
      <div {...stylex.props(styles.controls)}>
        <DropdownMenu
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
        <DropdownMenu
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
    <SideNav header={<SandboxHeader />}>
      <SideNavSection title="Home" isHeaderHidden>
        <SideNavItem
          label="Home"
          href="/"
          isSelected={pathname === '/'}
          as={Link}
          icon={HomeIcon}
        />
        <SideNavItem
          label="Official Templates"
          href="/templates/"
          isSelected={pathname === '/templates/'}
          as={Link}
          icon={AppWindowIcon}
        />
      </SideNavSection>
      <SideNavSection title="Projects">
        {categories
          .filter(c => c.slug !== 'templates')
          .map(category => {
            const isActive = pathname === `/${category.slug}/`;
            const IconComponent = categoryIcons[category.slug];
            return (
              <SideNavItem
                key={category.slug}
                label={category.label}
                href={`/${category.slug}/`}
                isSelected={isActive}
                as={Link}
                icon={IconComponent}
              />
            );
          })}
      </SideNavSection>
    </SideNav>
  );
}

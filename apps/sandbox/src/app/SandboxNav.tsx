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
import type {IconName, IconType} from '@astryxdesign/core/Icon';
import {categories, topLevelPages} from './sandboxPages';
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

/**
 * Icons for `topLevelPages`, kept here so that module stays JSX-free — the
 * same split the categories already use.
 *
 * These are icon *types* and semantic *names*, never rendered elements.
 * `SideNavItem` passes its icon through `renderIconSlot`, which applies the
 * nav's `size: 'sm'` and its selected/disabled colour to a component type or a
 * registry name — but hands a ReactNode straight to the DOM untouched. An
 * `<Icon />` element here therefore renders unsized and uncoloured: a ~400px
 * black glyph over the whole sidebar. `scores` is a registry name (T17), not a
 * hand-written SVG.
 */
const topLevelIcons: Record<string, IconType | IconName> = {
  home: HomeIcon,
  templates: AppWindowIcon,
  scores: 'checkDouble',
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
        {topLevelPages.map(page => (
          <SideNavItem
            key={page.href}
            label={page.label}
            href={page.href}
            isSelected={
              page.matchesChildren
                ? pathname.startsWith(page.href)
                : pathname === page.href
            }
            as={Link}
            icon={topLevelIcons[page.icon]}
          />
        ))}
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

'use client';

import * as stylex from '@stylexjs/stylex';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSSelector} from '@xds/core/Selector';
import {XDSText} from '@xds/core/Text';
import {useThemeControls} from './providers';
import type {ThemeMode} from '@xds/core/theme';
import {categories} from './sandboxPages';
import {
  HomeIcon,
  WrenchIcon,
  BoxIcon,
  AppWindowIcon,
  BlocksIcon,
} from './icons';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';

const categoryIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  'components-patterns': BoxIcon,
  templates: AppWindowIcon,
  blocks: BlocksIcon,
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
  const {themeName, setThemeName, mode, setMode} = useThemeControls();

  const themeOptions = [
    {value: 'default', label: 'Default'},
    {value: 'neutral', label: 'Neutral'},
    {value: 'brutalist', label: 'Brutalist'},
    {value: 'matcha', label: 'Matcha'},
    {value: 'daily', label: 'Daily'},
  ];

  const modeOptions = [
    {value: 'light', label: 'Light'},
    {value: 'dark', label: 'Dark'},
  ];

  return (
    <div {...stylex.props(styles.header)}>
      <XDSText type="body" weight="bold">
        Sandbox
      </XDSText>
      <div {...stylex.props(styles.controls)}>
        <XDSSelector
          label="Theme"
          isLabelHidden
          options={themeOptions}
          value={themeName}
          onChange={setThemeName}
          size="sm"
        />
        <XDSSelector
          label="Mode"
          isLabelHidden
          options={modeOptions}
          value={mode === 'system' ? 'light' : mode}
          onChange={v => setMode(v as ThemeMode)}
          size="sm"
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
        <XDSSideNavItem
          label="Official Templates"
          href="/templates/"
          isSelected={pathname === '/templates/'}
          as={Link}
          icon={AppWindowIcon}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Projects">
        {categories
          .filter(c => c.slug !== 'templates')
          .map(category => {
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

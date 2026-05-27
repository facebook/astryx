// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {usePathname} from 'next/navigation';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack} from '@xds/core/Layout';
import {
  MagnifyingGlassIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import {GITHUB_REPO} from '../constants';
import {XDS_BRAND_ICON} from './XDSWordmark';
import {SearchPalette} from './SearchPalette';
import {components} from '../generated/componentRegistry';
import {packages} from '../generated/packageRegistry';
import {docTopics} from '../generated/docsRegistry';
import {templates} from '../generated/templateRegistry';
import {useThemeMode} from '../app/providers';

const GitHubIcon = ({
  width = 20,
  height = 20,
}: {
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
  </svg>
);

export function SharedTopNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const {mode, toggleMode} = useThemeMode();

  // Determine active nav item
  const getActiveItem = () => {
    if (
      pathname === '/docs' ||
      pathname.startsWith('/docs/') ||
      pathname.startsWith('/packages/') ||
      pathname.startsWith('/changelog')
    ) {
      return 'docs';
    }
    if (pathname.startsWith('/templates')) {
      return 'templates';
    }
    if (pathname.startsWith('/themes')) {
      return 'themes';
    }
    if (pathname.startsWith('/components')) {
      return 'components';
    }
    if (pathname.startsWith('/playground')) {
      return 'playground';
    }
    return undefined;
  };

  return (
    <>
      <XDSTopNav
        label="XDS navigation"
        heading={<XDSTopNavHeading logo={XDS_BRAND_ICON} headingHref="/" />}
        centerContent={
          <>
            <XDSTopNavItem
              label="Docs"
              href="/docs"
              isSelected={getActiveItem() === 'docs'}
            />
            <XDSTopNavItem
              label="Components"
              href="/components"
              isSelected={getActiveItem() === 'components'}
            />
            <XDSTopNavItem
              label="Templates"
              href="/templates"
              isSelected={getActiveItem() === 'templates'}
            />
            <XDSTopNavItem
              label="Themes"
              href="/themes"
              isSelected={getActiveItem() === 'themes'}
            />
            <XDSTopNavItem
              label="Playground"
              href="/playground"
              isSelected={getActiveItem() === 'playground'}
            />
          </>
        }
        endContent={
          <XDSHStack gap={2}>
            <XDSHStack gap={0.5}>
              <XDSButton
                label="Search"
                variant="ghost"
                isIconOnly
                icon={<MagnifyingGlassIcon width={20} height={20} />}
                onClick={() => setIsSearchOpen(true)}
              />
              <XDSButton
                label={
                  mode === 'light'
                    ? 'Switch to dark mode'
                    : 'Switch to light mode'
                }
                variant="ghost"
                isIconOnly
                icon={
                  mode === 'light' ? (
                    <MoonIcon width={20} height={20} />
                  ) : (
                    <SunIcon width={20} height={20} />
                  )
                }
                onClick={toggleMode}
              />
              <XDSButton
                label="Community"
                variant="ghost"
                isIconOnly
                icon={<HeartIcon width={20} height={20} />}
                href="/community"
              />
              <XDSButton
                label="GitHub"
                variant="ghost"
                isIconOnly
                icon={<GitHubIcon />}
                href={GITHUB_REPO}
              />
            </XDSHStack>
            <XDSButton
              label="Get started"
              variant="primary"
              href="/docs/getting-started"
            />
          </XDSHStack>
        }
      />
      <SearchPalette
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        components={components}
        packages={packages}
        docTopics={docTopics}
        templates={templates}
      />
    </>
  );
}

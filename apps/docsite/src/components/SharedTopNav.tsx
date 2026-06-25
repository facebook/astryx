// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {Button} from '@astryxdesign/core/Button';
import {HStack} from '@astryxdesign/core/Layout';
import {Search, HeartHandshake, Sun, Moon} from 'lucide-react';
import {GITHUB_REPO} from '../constants';
import {AstryxIcon} from './logos';
import {SearchPalette} from './SearchPalette';
import {components} from '../generated/componentRegistry';
import {packages} from '../generated/packageRegistry';
import {docTopics} from '../generated/docsRegistry';
import {templates} from '../generated/templateRegistry';
import {useThemeMode} from '../app/providers';
import {trackSearch, trackClickCta} from '../lib/analytics';

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        trackSearch({target: 'open'});
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Determine active nav item
  const getActiveItem = () => {
    if (
      pathname === '/docs' ||
      pathname.startsWith('/docs/') ||
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
      <TopNav
        label="Astryx navigation"
        heading={
          <TopNavHeading
            logo={
              <AstryxIcon
                width={24}
                height={24}
                role="img"
                aria-label="Astryx"
                style={{display: 'block', color: 'var(--color-brand)'}}
              />
            }
            headingHref="/"
          />
        }
        centerContent={
          <>
            <TopNavItem
              label="Docs"
              href="/docs/getting-started"
              isSelected={getActiveItem() === 'docs'}
            />
            <TopNavItem
              label="Components"
              href="/components"
              isSelected={getActiveItem() === 'components'}
            />
            <TopNavItem
              label="Templates"
              href="/templates"
              isSelected={getActiveItem() === 'templates'}
            />
            <TopNavItem
              label="Themes"
              href="/themes"
              isSelected={getActiveItem() === 'themes'}
            />
            <TopNavItem
              label="Playground"
              href="/playground"
              isSelected={getActiveItem() === 'playground'}
            />
          </>
        }
        endContent={
          <HStack gap={2}>
            <HStack gap={0.5}>
              <Button
                label="Search"
                tooltip="Search"
                variant="ghost"
                isIconOnly
                icon={<Search size={20} />}
                onClick={() => {
                  trackSearch({target: 'open'});
                  setIsSearchOpen(true);
                }}
              />
              <Button
                label={
                  mode === 'light'
                    ? 'Switch to dark mode'
                    : 'Switch to light mode'
                }
                tooltip={
                  mode === 'light'
                    ? 'Switch to dark mode'
                    : 'Switch to light mode'
                }
                variant="ghost"
                isIconOnly
                icon={mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                onClick={toggleMode}
              />
              <Button
                label="Community"
                tooltip="Community"
                variant="ghost"
                isIconOnly
                icon={<HeartHandshake size={20} />}
                href="/community"
              />
              <Button
                label="GitHub"
                tooltip="GitHub"
                variant="ghost"
                isIconOnly
                icon={<GitHubIcon />}
                href={GITHUB_REPO}
                onClick={() => trackClickCta({target: 'github'})}
              />
            </HStack>
            <Button
              label="Get started"
              variant="primary"
              href="/docs/getting-started"
              onClick={() =>
                trackClickCta({page: 'landing', target: 'get_started'})
              }
            />
          </HStack>
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

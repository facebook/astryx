// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSNavHeadingMenu, XDSNavHeadingMenuItem} from '@xds/core/NavMenu';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack} from '@xds/core/Layout';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {GITHUB_REPO} from '../constants';
import {XDS_WORDMARK} from './XDSWordmark';
import {SearchPalette} from './SearchPalette';
import {components} from '../generated/componentRegistry';
import {packages} from '../generated/packageRegistry';
import {docTopics} from '../generated/docsRegistry';
import {templates} from '../generated/templateRegistry';

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

  return (
    <>
      <XDSTopNav
        label="XDS navigation"
        heading={
          <XDSTopNavHeading
            logo={XDS_WORDMARK}
            headingHref="/"
            menu={
              <XDSNavHeadingMenu size="lg">
                <XDSNavHeadingMenuItem label="Craft" href="/craft" />
                <XDSNavHeadingMenuItem label="Docs" href="/" />
                <XDSNavHeadingMenuItem label="Playground" href="/playground" />
              </XDSNavHeadingMenu>
            }
          />
        }
        endContent={
          <XDSHStack gap={0.5}>
            <XDSButton
              label="Search"
              variant="ghost"
              isIconOnly
              icon={<MagnifyingGlassIcon width={20} height={20} />}
              onClick={() => setIsSearchOpen(true)}
            />
            <XDSButton
              label="GitHub"
              variant="ghost"
              isIconOnly
              icon={<GitHubIcon />}
              href={GITHUB_REPO}
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

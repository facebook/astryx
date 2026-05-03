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
              </XDSNavHeadingMenu>
            }
          />
        }
        endContent={
          <XDSHStack gap={2}>
            <XDSButton
              label="Search"
              variant="ghost"
              isIconOnly
              icon={<MagnifyingGlassIcon width={20} height={20} />}
              onClick={() => setIsSearchOpen(true)}
            />
            <XDSButton label="GitHub" variant="ghost" href={GITHUB_REPO} />
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

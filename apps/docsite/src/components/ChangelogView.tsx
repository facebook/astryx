// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import * as stylex from '@stylexjs/stylex';
import {Markdown} from '@astryxdesign/core/Markdown';
import {Text, Heading} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Carousel} from '@astryxdesign/core/Carousel';
import {typeScaleVars} from '@astryxdesign/core/theme/tokens.stylex';
import {layout} from '../layout.stylex';
import {
  linkifyPRs,
  linkifyContributors,
  linkifyComponents,
  addEmptyReleasePlaceholders,
  stripTitle,
} from './changelogLinkify';

interface ChangelogEntry {
  pkg: string;
  content: string;
}

interface ChangelogViewProps {
  changelogs: ChangelogEntry[];
  componentNames: string[];
  initialPackage?: string;
}

const DEFAULT_PACKAGE = '@astryxdesign/core';
const THEME_PACKAGE_PREFIX = '@astryxdesign/theme-';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
    // Match the docs article body treatment (16px / 1.75) from DocPageLayout.
    // The release-notes body renders via Markdown, whose root reads these
    // tokens; re-assigning them here scopes the larger/airier body to the
    // changelog article only. The title (display-1), subtitle (large), and
    // tab labels use different tokens, so they're unaffected.
    [typeScaleVars['--text-body-size']]: '1rem', // 16px
    [typeScaleVars['--text-body-leading']]: '1.75', // 28px line box
  },
});

export function UrlChangelogView(props: ChangelogViewProps) {
  const requestedPackage = useSearchParams().get('package') ?? undefined;
  return <ChangelogView {...props} initialPackage={requestedPackage} />;
}

export function ChangelogView({
  changelogs,
  componentNames,
  initialPackage,
}: ChangelogViewProps) {
  const displayedChangelogs = changelogs.filter(
    changelog => !changelog.pkg.startsWith(THEME_PACKAGE_PREFIX),
  );
  const [activeTab, setActiveTab] = useState(
    displayedChangelogs.find(changelog => changelog.pkg === initialPackage)
      ?.pkg ??
      displayedChangelogs.find(changelog => changelog.pkg === DEFAULT_PACKAGE)
        ?.pkg ??
      displayedChangelogs[0]?.pkg ??
      '',
  );
  const active = displayedChangelogs.find(c => c.pkg === activeTab);

  const handleTabChange = (pkg: string) => {
    setActiveTab(pkg);
    const url = new URL(window.location.href);
    url.searchParams.set('package', pkg);
    window.history.replaceState(window.history.state, '', url);
  };

  return (
    <Section
      maxWidth={layout.proseMaxWidth}
      padding={6}
      xstyle={styles.section}>
      <VStack gap={8}>
        <VStack gap={4}>
          <Heading level={1} type="display-1">
            What&apos;s New
          </Heading>
          <Text type="large" weight="normal" color="secondary">
            Release notes and changelog for all packages.
          </Text>
        </VStack>

        {displayedChangelogs.length > 0 ? (
          <>
            <TabList value={activeTab} onChange={handleTabChange} hasDivider>
              <Carousel gap={0.5} hasSnap={false}>
                {displayedChangelogs.map(c => (
                  <Tab key={c.pkg} value={c.pkg} label={c.pkg} />
                ))}
              </Carousel>
            </TabList>

            {active != null && (
              <Markdown headingLevelStart={2}>
                {linkifyComponents(
                  linkifyContributors(
                    linkifyPRs(
                      addEmptyReleasePlaceholders(stripTitle(active.content)),
                    ),
                  ),
                  componentNames,
                )}
              </Markdown>
            )}
          </>
        ) : (
          <Text type="body" color="secondary">
            Changelogs could not be loaded.
          </Text>
        )}
      </VStack>
    </Section>
  );
}

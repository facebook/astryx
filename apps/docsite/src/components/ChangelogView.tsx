// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Markdown} from '@xds/core/Markdown';
import {Text, Heading} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
import {TabList, Tab} from '@xds/core/TabList';
import {Carousel} from '@xds/core/Carousel';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {GITHUB_REPO} from '../constants';

function linkifyPRs(markdown: string): string {
  return markdown.replace(/(?<!\[)#(\d+)/g, `[#$1](${GITHUB_REPO}/pull/$1)`);
}

function stripTitle(markdown: string): string {
  return markdown.replace(/^#\s+.+\n+/, '');
}

function linkifyComponents(markdown: string, names: string[]): string {
  if (names.length === 0) {
    return markdown;
  }

  const nameToHref = new Map<string, string>();
  for (const name of names) {
    nameToHref.set(name, `/components/${name}`);
    nameToHref.set('XDS' + name, `/components/${name}`);
  }

  const sorted = [...nameToHref.keys()].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(
    '(?<!`|\\[)\\b(' + escaped.join('|') + ')\\b(?!`|\\])',
    'g',
  );

  return markdown.replace(pattern, match => {
    const href = nameToHref.get(match);
    if (!href) {
      return match;
    }
    return '[' + match + '](' + href + ')';
  });
}

interface ChangelogEntry {
  pkg: string;
  content: string;
}

interface ChangelogViewProps {
  changelogs: ChangelogEntry[];
  componentNames: string[];
}

const styles = stylex.create({
  section: {
    marginInline: 'auto',
    paddingBottom: `calc(${spacingVars['--spacing-12']} * 2)`,
  },
});

export function ChangelogView({
  changelogs,
  componentNames,
}: ChangelogViewProps) {
  const [activeTab, setActiveTab] = useState(changelogs[0]?.pkg ?? '');
  const active = changelogs.find(c => c.pkg === activeTab);

  return (
    <Section maxWidth={800} padding={6} xstyle={styles.section}>
      <VStack gap={8}>
        <VStack gap={4}>
          <Heading level={1} type="display-1">
            What&apos;s New
          </Heading>
          <Text type="large" weight="normal" color="secondary">
            Release notes and changelog for all packages.
          </Text>
        </VStack>

        {changelogs.length > 0 ? (
          <>
            <TabList value={activeTab} onChange={setActiveTab} hasDivider>
              <Carousel gap={0.5} hasSnap={false}>
                {changelogs.map(c => (
                  <Tab key={c.pkg} value={c.pkg} label={c.pkg} />
                ))}
              </Carousel>
            </TabList>

            {active != null && (
              <Markdown headingLevelStart={2}>
                {linkifyComponents(
                  linkifyPRs(stripTitle(active.content)),
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

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Layout, LayoutHeader, LayoutContent} from '@astryxdesign/core/Layout';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton, ToggleButtonGroup} from '@astryxdesign/core/ToggleButton';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/Stack';
import {Divider} from '@astryxdesign/core/Divider';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {categories} from '../sandboxPages';
import {ProjectCard} from '../ProjectCard';
import {SearchIcon} from '../icons';

const CATEGORY_FILTERS = ['All', ...categories.map(c => c.label)];

const allPages = categories.flatMap(c =>
  c.pages.map(p => ({...p, category: c.label})),
);

const styles = stylex.create({
  emptyState: {
    padding: spacingVars['--spacing-12'],
    textAlign: 'center',
  },
  hideOnSmall: {
    display: {
      default: 'none',
      '@media (min-width: 840px)': 'block',
    },
  },
  hideOnLarge: {
    display: {
      default: 'block',
      '@media (min-width: 840px)': 'none',
    },
  },
});

export default function Home() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let items =
      activeTab === 'All'
        ? allPages
        : allPages.filter(p => p.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [activeTab, search]);

  const groupedSections = useMemo(() => {
    if (activeTab !== 'All') {
      return null;
    }
    const map = new Map<string, typeof allPages>();
    for (const page of filtered) {
      let items = map.get(page.category);
      if (items == null) {
        items = [];
        map.set(page.category, items);
      }
      items.push(page);
    }
    return categories
      .filter(c => map.has(c.label))
      .map(c => ({category: c.label, pages: map.get(c.label) ?? []}));
  }, [activeTab, filtered]);

  return (
    <Layout
      header={
        <LayoutHeader hasDivider padding={6}>
          <Heading level={1}>Astryx Sandbox</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <VStack gap={4}>
              <TextInput
                label="Search"
                isLabelHidden
                placeholder="Search..."
                value={search}
                onChange={setSearch}
                startIcon={SearchIcon}
                size="lg"
              />
              <ToggleButtonGroup
                label="Filter by category"
                value={activeTab}
                onChange={v => setActiveTab(v ?? 'All')}>
                {CATEGORY_FILTERS.map(cat => (
                  <ToggleButton
                    key={cat}
                    label={cat}
                    value={cat}
                    size="lg"
                  />
                ))}
              </ToggleButtonGroup>
            </VStack>

            {filtered.length === 0 ? (
              <div {...stylex.props(styles.emptyState)}>
                <Text type="supporting" color="secondary">
                  No results found.
                </Text>
              </div>
            ) : groupedSections != null ? (
              <VStack gap={6}>
                {groupedSections.flatMap(section => [
                  <Divider key={`d-${section.category}`} />,
                  <VStack gap={6} key={section.category}>
                    <Heading level={2}>{section.category}</Heading>
                    <Grid columns={{minWidth: 320}} gap={4}>
                      {section.pages.map(page => (
                        <ProjectCard key={page.href} page={page} />
                      ))}
                    </Grid>
                  </VStack>,
                ])}
              </VStack>
            ) : (
              <Grid columns={{minWidth: 320}} gap={4}>
                {filtered.map(page => (
                  <ProjectCard key={page.href} page={page} />
                ))}
              </Grid>
            )}
          </VStack>
        </LayoutContent>
      }
    />
  );
}

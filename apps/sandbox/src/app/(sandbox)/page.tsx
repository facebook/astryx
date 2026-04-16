'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core/Layout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSGrid} from '@xds/core/Grid';
import {XDSHStack, XDSVStack} from '@xds/core/Stack';
import {XDSDivider} from '@xds/core/Divider';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
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
    if (activeTab !== 'All') return null;
    const map = new Map<string, typeof allPages>();
    for (const page of filtered) {
      if (!map.has(page.category)) map.set(page.category, []);
      map.get(page.category)!.push(page);
    }
    return categories
      .filter(c => map.has(c.label))
      .map(c => ({category: c.label, pages: map.get(c.label)!}));
  }, [activeTab, filtered]);

  return (
    <XDSLayout
      header={
        <XDSLayoutHeader hasDivider padding={6}>
          <XDSHeading level={1}>XDS Sandbox</XDSHeading>
        </XDSLayoutHeader>
      }
      content={
        <XDSLayoutContent padding={6}>
          <XDSVStack gap={6}>
            <XDSVStack gap={4}>
              <XDSTextInput
                label="Search"
                isLabelHidden
                placeholder="Search..."
                value={search}
                onChange={setSearch}
                startIcon={SearchIcon}
                size="lg"
              />
              <XDSToggleButtonGroup
                label="Filter by category"
                value={activeTab}
                onChange={v => setActiveTab(v ?? 'All')}>
                {CATEGORY_FILTERS.map(cat => (
                  <XDSToggleButton
                    key={cat}
                    label={cat}
                    value={cat}
                    size="lg"
                  />
                ))}
              </XDSToggleButtonGroup>
            </XDSVStack>

            {filtered.length === 0 ? (
              <div {...stylex.props(styles.emptyState)}>
                <XDSText type="supporting" color="secondary">
                  No results found.
                </XDSText>
              </div>
            ) : groupedSections != null ? (
              <XDSVStack gap={6}>
                {groupedSections.flatMap(section => [
                  <XDSDivider key={`d-${section.category}`} />,
                  <XDSVStack gap={6} key={section.category}>
                    <XDSHeading level={2}>{section.category}</XDSHeading>
                    <XDSGrid minChildWidth={280} gap={4}>
                      {section.pages.map(page => (
                        <ProjectCard key={page.href} page={page} />
                      ))}
                    </XDSGrid>
                  </XDSVStack>,
                ])}
              </XDSVStack>
            ) : (
              <XDSGrid minChildWidth={280} gap={4}>
                {filtered.map(page => (
                  <ProjectCard key={page.href} page={page} />
                ))}
              </XDSGrid>
            )}
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}

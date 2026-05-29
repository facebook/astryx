// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Components gallery index — browse all showcases.
 */

'use client';

import {useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDivider} from '@xds/core/Divider';
import {components as componentRegistry} from '../../../generated/componentRegistry';
import {blocks} from '../../../generated/blockRegistry';
import {ShowcaseThumbnail} from '../../../components/ShowcaseThumbnail';

/**
 * Category display order for the overview page.
 * Sourced from component .doc.mjs `category` fields.
 */
const CATEGORIES = [
  'Actions',
  'Communications',
  'Containers',
  'Layout',
  'Inputs',
  'Lists',
  'Navigation',
  'Performance',
] as const;

/** Map of showcase blocks by component name for thumbnails */
const showcaseMap = new Map(
  blocks
    .filter(b => b.isShowcase)
    .map(b => [b.componentsUsed[0] || b.exampleFor, b]),
);

const styles = stylex.create({
  heroTitle: {
    textAlign: 'center' as const,
  },
  categorySection: {
    paddingBlock: 'var(--spacing-4)',
  },
  cardImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '16/10',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
  },
});

interface CategoryItem {
  name: string;
  displayName: string;
  description: string;
  href: string;
  category: string;
  /** Showcase block for thumbnail, if available */
  showcase: (typeof blocks)[number] | undefined;
}

export default function ComponentsGalleryPage() {
  const [query, setQuery] = useState('');

  /** All categorized components (excluding hidden, hooks, and utilities) */
  const categorizedItems = useMemo(() => {
    const coreComponents = componentRegistry['@xds/core'] ?? [];
    const items: CategoryItem[] = [];

    for (const comp of coreComponents) {
      // Skip components explicitly hidden from overview
      if (comp.isHiddenFromOverview) continue;
      // Skip hidden components
      if (comp.hidden) continue;
      // Skip hooks (they appear in the Utilities section)
      if (comp.name.startsWith('use')) continue;
      // Skip components without a category
      if (!comp.category) continue;
      // Skip utilities group
      if (comp.group === 'Utilities') continue;

      items.push({
        name: comp.name,
        displayName: comp.displayName,
        description: comp.description,
        href: `/components/${comp.name}`,
        category: comp.category,
        showcase: showcaseMap.get(comp.name),
      });
    }

    return items;
  }, []);

  /** Filtered items based on search query */
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categorizedItems;
    return categorizedItems.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.displayName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [categorizedItems, query]);

  /** Group filtered items by category */
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, CategoryItem[]>();
    for (const cat of CATEGORIES) {
      map.set(cat, []);
    }
    for (const item of filteredItems) {
      const list = map.get(item.category);
      if (list) list.push(item);
    }
    return map;
  }, [filteredItems]);

  return (
    <XDSSection maxWidth="xl" padding={6}>
      <XDSVStack gap={8}>
        <XDSVStack gap={2} style={{alignItems: 'center'}}>
          <XDSText type="display-2" xstyle={styles.heroTitle}>
            Browse the library
          </XDSText>
          <XDSText type="body" color="secondary" xstyle={styles.heroTitle}>
            Every component, with copy-ready examples for every variant, state,
            and pattern.
          </XDSText>
        </XDSVStack>

        <XDSTextInput
          label="Search components"
          isLabelHidden
          value={query}
          onChange={setQuery}
          placeholder="Search components…"
          startIcon={MagnifyingGlassIcon}
          hasClear
        />

        {CATEGORIES.map(cat => {
          const items = groupedByCategory.get(cat) ?? [];
          if (items.length === 0) return null;

          return (
            <XDSVStack key={cat} gap={4} xstyle={styles.categorySection}>
              <XDSHeading level={2}>{cat}</XDSHeading>

              <XDSGrid
                columns={{minWidth: 280, repeat: 'fill'}}
                gap={4}
                rowGap={6}>
                {items.map(item => (
                  <XDSVStack key={item.name} gap={2}>
                    <XDSClickableCard
                      label={item.displayName}
                      href={item.href}
                      padding={0}
                      variant="transparent">
                      {item.showcase ? (
                        <ShowcaseThumbnail
                          dirName={item.showcase.dirName}
                          category={item.showcase.category}
                        />
                      ) : (
                        <div {...stylex.props(styles.cardImage)} />
                      )}
                    </XDSClickableCard>
                    <XDSText type="supporting">{item.displayName}</XDSText>
                  </XDSVStack>
                ))}
              </XDSGrid>

              <XDSDivider />
            </XDSVStack>
          );
        })}
      </XDSVStack>
    </XDSSection>
  );
}

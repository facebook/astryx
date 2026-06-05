// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Components gallery index — browse all showcases.
 */

'use client';

import {Fragment, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSDivider} from '@xds/core/Divider';
import {XDSButton} from '@xds/core/Button';
import {XDSPopover} from '@xds/core/Popover';
import {XDSCard} from '@xds/core/Card';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {components as componentRegistry} from '../../../generated/componentRegistry';
import {blocks} from '../../../generated/blockRegistry';
import {ShowcaseThumbnail} from '../../../components/ShowcaseThumbnail';

/**
 * Category display order for the overview page.
 * Sourced from component .doc.mjs `category` fields.
 */
const CATEGORIES = [
  'Action',
  'Chat',
  'Container',
  'Content',
  'Data Input',
  'Data Visualization',
  'Feedback & Status',
  'Layout',
  'Navigation',
  'Overlay',
  'Table & List',
  'Utility',
] as const;

/** Map of showcase blocks by component name for thumbnails */
const showcaseMap = new Map(
  blocks.filter(b => b.isShowcase).map(b => [b.exampleFor, b]),
);

const styles = stylex.create({
  heroTitle: {
    textAlign: 'center' as const,
  },
  section: {
    marginInline: 'auto',
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
  /** All categorized components (excluding hidden, hooks, and utilities) */
  const categorizedItems = useMemo(() => {
    const coreComponents = componentRegistry['@xds/core'] ?? [];
    const items: CategoryItem[] = [];

    for (const comp of coreComponents) {
      // Skip components explicitly hidden from overview
      if (comp.isHiddenFromOverview) {
        continue;
      }
      // Skip hidden components
      if (comp.hidden) {
        continue;
      }
      // Skip hooks (they appear in the Utilities section)
      if (comp.name.startsWith('use')) {
        continue;
      }
      // Skip components without a category
      if (!comp.category) {
        continue;
      }
      // Skip utilities group
      if (comp.group === 'Utilities') {
        continue;
      }

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

  /** Group items by category */
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, CategoryItem[]>();
    for (const cat of CATEGORIES) {
      map.set(cat, []);
    }
    for (const item of categorizedItems) {
      const list = map.get(item.category);
      if (list) {
        list.push(item);
      }
    }
    return map;
  }, [categorizedItems]);

  return (
    <XDSSection maxWidth={1200} padding={6} xstyle={styles.section}>
      <XDSVStack gap={10}>
        <XDSVStack gap={4} hAlign="center">
          <XDSVStack gap={2} style={{alignItems: 'center'}}>
            <XDSText type="display-2" xstyle={styles.heroTitle}>
              Browse the library
            </XDSText>
            <XDSText type="body" color="secondary" xstyle={styles.heroTitle}>
              Every component, with copy-ready examples for every variant,
              state, and pattern.
            </XDSText>
          </XDSVStack>
          <XDSPopover
            width={360}
            content={
              <XDSVStack gap={3}>
                <XDSVStack gap={1}>
                  <XDSText type="body" weight="bold">
                    1. Install the package
                  </XDSText>
                  <XDSCard padding={0}>
                    <XDSCodeBlock
                      code="npm install @xds/core"
                      language="bash"
                      hasCopyButton
                    />
                  </XDSCard>
                </XDSVStack>
                <XDSVStack gap={1}>
                  <XDSText type="body" weight="bold">
                    2. Import a component
                  </XDSText>
                  <XDSCard padding={0}>
                    <XDSCodeBlock
                      code="import {...} from '@xds/core/ComponentName';"
                      language="typescript"
                      hasCopyButton
                    />
                  </XDSCard>
                </XDSVStack>
              </XDSVStack>
            }>
            <XDSButton
              variant="primary"
              size="lg"
              label="Install core library"
            />
          </XDSPopover>
        </XDSVStack>

        {CATEGORIES.map(cat => {
          const items = groupedByCategory.get(cat) ?? [];
          if (items.length === 0) {
            return null;
          }

          return (
            <Fragment key={cat}>
              <XDSDivider />
              <XDSVStack gap={4}>
                <XDSHeading level={2}>{cat}</XDSHeading>
                <XDSGrid
                  columns={{minWidth: 240, repeat: 'fill'}}
                  gap={3}
                  rowGap={4}>
                  {items.map(item => (
                    <XDSVStack key={item.name} gap={1}>
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
              </XDSVStack>
            </Fragment>
          );
        })}
      </XDSVStack>
    </XDSSection>
  );
}

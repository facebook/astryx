// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Templates gallery — extracted from craft.
 */

'use client';

import {useCallback, useMemo, useState} from 'react';
import type {CSSProperties} from 'react';
import {useSearchParams, useRouter, usePathname} from 'next/navigation';
import * as stylex from '@stylexjs/stylex';
import {useAppShellMobile} from '@xds/core/AppShell';
import {Text, Heading} from '@xds/core/Text';
import {VStack, HStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
import {ClickableCard} from '@xds/core/ClickableCard';
import {Grid} from '@xds/core/Grid';
import {Button} from '@xds/core/Button';
import {Overlay} from '@xds/core/Overlay';
import {ToggleButton, ToggleButtonGroup} from '@xds/core/ToggleButton';
import {templates} from '../../../generated/templateRegistry';
import {TemplateThumbnail} from '../../../components/TemplateThumbnail';
import {buildPlaygroundHref} from '../../../components/playgroundLink';
import {TemplatePreviewDialog} from '../../../components/TemplatePreviewDialog';
import type {TemplatePreviewItem} from '../../../components/TemplatePreviewDialog';
import {trackOpenPlayground, trackView} from '../../../lib/analytics';

const CARD_STYLE: CSSProperties & {'--color-overlay': string} = {
  '--color-overlay':
    'color-mix(in srgb, var(--color-on-light) 78%, transparent)',
};

const OVERLAY_CLICK_LAYER_STYLE: CSSProperties = {
  height: '100%',
  width: '100%',
  cursor: 'pointer',
};

const styles = stylex.create({
  categoryFilter: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  galleryGrid: {
    width: '100%',
  },
});

/** Display order for the top-level category groups. Groups not listed here
 *  are appended alphabetically; untagged templates fall under 'Other'. */
const GROUP_ORDER = [
  'Dashboard',
  'Table',
  'Form',
  'Settings',
  'Login',
  'Tools',
  'Content',
  'AI Chat',
  'Gallery',
  'Shell',
];

const OTHER_GROUP = 'Other';

/** Derive the group heading from a category string. The group is the text
 *  before the first ' - ' separator (e.g. 'Dashboard - Analytics' → 'Dashboard').
 *  Standalone categories without a separator (e.g. 'Settings') are their own
 *  group. Untagged templates fall under 'Other'. */
function groupOf(category: string): string {
  if (!category) {
    return OTHER_GROUP;
  }
  const idx = category.indexOf(' - ');
  return idx === -1 ? category : category.slice(0, idx);
}

/** Sort rank for a category group: GROUP_ORDER first, then 'Other' last. */
function groupRank(group: string): number {
  const i = GROUP_ORDER.indexOf(group);
  if (i !== -1) {
    return i;
  }
  return group === OTHER_GROUP ? Number.MAX_SAFE_INTEGER : GROUP_ORDER.length;
}

interface TemplateItem {
  name: string;
  description: string;
  slug: string;
  href: string;
  category: string;
  source: string;
}

export default function TemplatesPage() {
  const {isMobile} = useAppShellMobile();

  // Flat, display-ordered list of available templates. Ordered by category
  // group (per GROUP_ORDER) then name, so the single grid stays stable.
  const items = useMemo<TemplateItem[]>(() => {
    const visible = templates.filter(t => t.isReady && !t.isHiddenFromOverview);

    return visible
      .map(t => ({
        name: t.name,
        description: t.description,
        slug: t.slug,
        href: `/templates/${t.slug}`,
        category: t.category,
        source: t.source,
      }))
      .sort((a, b) => {
        const ga = groupOf(a.category);
        const gb = groupOf(b.category);
        return (
          groupRank(ga) - groupRank(gb) ||
          ga.localeCompare(gb) ||
          a.name.localeCompare(b.name)
        );
      });
  }, []);

  const [activeCategory, setActiveCategory] = useState('All');

  // Filter options: 'All' plus each category group present, in display order.
  const categories = useMemo(() => {
    const present = [...new Set(items.map(i => groupOf(i.category)))].sort(
      (a, b) => groupRank(a) - groupRank(b) || a.localeCompare(b),
    );
    return ['All', ...present];
  }, [items]);

  const filteredItems = useMemo(
    () =>
      activeCategory === 'All'
        ? items
        : items.filter(i => groupOf(i.category) === activeCategory),
    [items, activeCategory],
  );

  // Flattened display-order list backing the preview dialog's prev/next
  // navigation, plus a slug -> index lookup for opening at a given card.
  const flatItems = useMemo<TemplatePreviewItem[]>(
    () =>
      filteredItems.map(i => ({
        slug: i.slug,
        name: i.name,
        description: i.description,
        source: i.source,
        category: groupOf(i.category),
      })),
    [filteredItems],
  );
  const indexBySlug = useMemo(() => {
    const m = new Map<string, number>();
    flatItems.forEach((it, i) => m.set(it.slug, i));
    return m;
  }, [flatItems]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const previewSlug = searchParams.get('preview');
  const openIndex =
    previewSlug != null ? (indexBySlug.get(previewSlug) ?? null) : null;

  const setOpenIndex = useCallback(
    (index: number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (index !== null && flatItems[index]) {
        params.set('preview', flatItems[index].slug);
      } else {
        params.delete('preview');
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, {scroll: false});
    },
    [searchParams, flatItems, router, pathname],
  );

  const openPreview = useCallback(
    (slug: string) => {
      const i = indexBySlug.get(slug);
      if (i !== undefined) {
        const item = flatItems[i];
        trackView({
          page: 'templates',
          item: item.slug,
          category: item.category,
        });
        setOpenIndex(i);
      }
    },
    [indexBySlug, setOpenIndex, flatItems],
  );

  return (
    <Section maxWidth={1200} padding={6} style={{marginInline: 'auto'}}>
      <VStack gap={10}>
        {/* Header */}
        <VStack gap={6} align="stretch">
          <VStack gap={2}>
            <Heading level={1} type="display-1" justify="center">
              Templates
            </Heading>
            <Text type="body" color="secondary" justify="center">
              Ready-to-use page templates to kickstart your project.
            </Text>
          </VStack>
          <ToggleButtonGroup
            label="Filter templates by category"
            value={activeCategory}
            onChange={value => setActiveCategory(value ?? 'All')}
            xstyle={styles.categoryFilter}>
            {categories.map(category => (
              <ToggleButton key={category} label={category} value={category} />
            ))}
          </ToggleButtonGroup>
        </VStack>

        {/* Body */}
        <Grid columns={{minWidth: isMobile ? 280 : 420}} gap={4} width="100%">
          {filteredItems.map(item => {
            const templateContent = <TemplateThumbnail slug={item.slug} />;

            return (
              <ClickableCard
                key={item.slug}
                padding={0}
                maxWidth="100%"
                label={`Preview ${item.name}`}
                onClick={() => openPreview(item.slug)}
                style={CARD_STYLE}>
                {isMobile ? (
                  templateContent
                ) : (
                  <Overlay
                    showOn="hover"
                    scrim="dark"
                    content={
                      <VStack
                        role="presentation"
                        onClick={() => openPreview(item.slug)}
                        justify="end"
                        align="start"
                        height="100%"
                        width="100%"
                        gap={4}
                        style={{...OVERLAY_CLICK_LAYER_STYLE, padding: 8}}>
                        <VStack gap={0.5}>
                          <Heading level={3}>{item.name}</Heading>
                          <Text maxLines={2}>{item.description}</Text>
                        </VStack>
                        <HStack gap={2}>
                          <Button
                            label="Preview"
                            variant="secondary"
                            onClick={() => openPreview(item.slug)}
                          />
                          {item.source && (
                            <Button
                              label="Open in Playground"
                              variant="secondary"
                              href={buildPlaygroundHref(item.source)}
                              onClick={e => {
                                e.stopPropagation();
                                trackOpenPlayground({
                                  page: 'templates',
                                  item: item.slug,
                                  category: groupOf(item.category),
                                });
                              }}
                            />
                          )}
                        </HStack>
                      </VStack>
                    }>
                    {templateContent}
                  </Overlay>
                )}
              </ClickableCard>
            );
          })}
        </Grid>
      </VStack>

      <TemplatePreviewDialog
        items={flatItems}
        index={openIndex ?? 0}
        isOpen={openIndex !== null}
        onOpenChange={open => {
          if (!open) {
            setOpenIndex(null);
          }
        }}
        onIndexChange={setOpenIndex}
        variant={isMobile ? 'fullscreen' : undefined}
      />
    </Section>
  );
}

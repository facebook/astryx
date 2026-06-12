// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Templates gallery — extracted from craft.
 */

'use client';

import {useCallback, useMemo} from 'react';
import type {CSSProperties} from 'react';
import {useSearchParams, useRouter, usePathname} from 'next/navigation';
import * as stylex from '@stylexjs/stylex';
import {useXDSAppShellMobile} from '@xds/core/AppShell';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {XDSOverlay} from '@xds/core/Overlay';
import {XDSBadge} from '@xds/core/Badge';
import {templates} from '../../../generated/templateRegistry';
import {TemplateThumbnail} from '../../../components/TemplateThumbnail';
import {buildPlaygroundHref} from '../../../components/playgroundLink';
import {TemplatePreviewDialog} from '../../../components/TemplatePreviewDialog';
import type {TemplatePreviewItem} from '../../../components/TemplatePreviewDialog';
import {trackOpenPlayground, trackView} from '../../../lib/analytics';

const GALLERY_MAX_WIDTH = 1600;
const CARD_MIN_WIDTH = 420;
const CARD_STYLE: CSSProperties & {'--color-overlay': string} = {
  '--color-overlay':
    'color-mix(in srgb, var(--color-on-light) 78%, transparent)',
};

const styles = stylex.create({
  section: {
    marginInline: 'auto',
  },
  heroTitle: {
    textAlign: 'center' as const,
  },
  galleryWrap: {
    maxWidth: GALLERY_MAX_WIDTH,
    marginInline: 'auto',
    width: '100%',
  },
  cardImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '16/10',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
  },
  comingSoon: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    height: '100%',
    width: '100%',
    padding: 8,
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

/** Plural display labels for the group headings. The underlying category data
 *  stays singular (e.g. 'Dashboard - Analytics'); only the heading is pluralized.
 *  Handles irregulars (Gallery → Galleries) and uncountable nouns (Content). */
const GROUP_LABELS: Record<string, string> = {
  Dashboard: 'Dashboards',
  Table: 'Tables',
  Form: 'Forms',
  Settings: 'Settings',
  Login: 'Logins',
  Tools: 'Tools',
  Content: 'Content',
  'AI Chat': 'AI Chats',
  Gallery: 'Galleries',
  Shell: 'Shells',
};

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

interface TemplateItem {
  name: string;
  description: string;
  slug: string;
  href: string;
  isReady: boolean;
  category: string;
  source: string;
}

export default function TemplatesPage() {
  const {isMobile} = useXDSAppShellMobile();

  const groups = useMemo(() => {
    const visible = templates.filter(t => !t.isHiddenFromOverview);

    const byGroup = new Map<string, TemplateItem[]>();
    for (const t of visible) {
      const group = groupOf(t.category);
      const item: TemplateItem = {
        name: t.name,
        description: t.description,
        slug: t.slug,
        href: `/templates/${t.slug}`,
        isReady: t.isReady,
        category: t.category,
        source: t.source,
      };
      const list = byGroup.get(group);
      if (list) {
        list.push(item);
      } else {
        byGroup.set(group, [item]);
      }
    }

    const rank = (g: string) => {
      const i = GROUP_ORDER.indexOf(g);
      if (i !== -1) {
        return i;
      }
      return g === OTHER_GROUP ? Number.MAX_SAFE_INTEGER : GROUP_ORDER.length;
    };

    return [...byGroup.entries()]
      .map(([group, list]) => ({
        group,
        items: list.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort(
        (a, b) =>
          rank(a.group) - rank(b.group) || a.group.localeCompare(b.group),
      );
  }, []);

  // Flattened display-order list backing the preview dialog's prev/next
  // navigation, plus a slug -> index lookup for opening at a given card.
  const flatItems = useMemo<TemplatePreviewItem[]>(
    () =>
      groups.flatMap(g =>
        g.items.map(i => ({
          slug: i.slug,
          name: i.name,
          description: i.description,
          source: i.source,
          category: groupOf(i.category),
        })),
      ),
    [groups],
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
    <XDSSection
      maxWidth={GALLERY_MAX_WIDTH}
      padding={6}
      xstyle={styles.section}>
      <XDSVStack gap={8}>
        <XDSVStack gap={2} style={{alignItems: 'center'}}>
          <XDSHeading level={1} type="display-2" xstyle={styles.heroTitle}>
            Templates
          </XDSHeading>
          <XDSText type="body" color="secondary" xstyle={styles.heroTitle}>
            Ready-to-use page templates to kickstart your project.
          </XDSText>
        </XDSVStack>

        {groups.map(({group, items}) => (
          <XDSVStack key={group} gap={4}>
            <XDSHeading level={2}>{GROUP_LABELS[group] ?? group}</XDSHeading>
            <div {...stylex.props(styles.galleryWrap)}>
              <XDSGrid
                columns={
                  isMobile
                    ? 1
                    : {minWidth: CARD_MIN_WIDTH, max: 2, repeat: 'fit'}
                }
                gap={4}
                style={{maxWidth: '100%'}}>
                {items.map(item => {
                  const templateContent = item.isReady ? (
                    <TemplateThumbnail slug={item.slug} />
                  ) : (
                    <div {...stylex.props(styles.cardImage)}>
                      <div {...stylex.props(styles.comingSoon)}>
                        <XDSBadge label="Coming Soon" variant="info" />
                      </div>
                    </div>
                  );

                  return (
                    <XDSClickableCard
                      key={item.slug}
                      padding={0}
                      maxWidth="100%"
                      label={`Preview ${item.name}`}
                      onClick={() => openPreview(item.slug)}
                      style={CARD_STYLE}>
                      {isMobile ? (
                        templateContent
                      ) : (
                        <XDSOverlay
                          showOn="hover"
                          scrim="dark"
                          content={
                            <div {...stylex.props(styles.overlayInner)}>
                              <XDSVStack gap={2}>
                                <XDSVStack gap={0.5}>
                                  <XDSHeading level={3} style={{color: '#fff'}}>
                                    {item.name}
                                  </XDSHeading>
                                  <XDSText
                                    type="body"
                                    style={{color: 'rgba(255,255,255,0.7)'}}>
                                    {item.description.slice(0, 80)}
                                    {item.description.length > 80
                                      ? '\u2026'
                                      : ''}
                                  </XDSText>
                                </XDSVStack>
                                <XDSHStack gap={2}>
                                  <XDSButton
                                    label="Preview"
                                    variant="secondary"
                                    onClick={() => openPreview(item.slug)}
                                  />
                                  {item.source && (
                                    <XDSButton
                                      label="Open in Playground"
                                      variant="secondary"
                                      href={buildPlaygroundHref(item.source)}
                                      onClick={() => {
                                        trackOpenPlayground({
                                          page: 'templates',
                                          item: item.slug,
                                          category: groupOf(item.category),
                                        });
                                      }}
                                    />
                                  )}
                                </XDSHStack>
                              </XDSVStack>
                            </div>
                          }>
                          {templateContent}
                        </XDSOverlay>
                      )}
                    </XDSClickableCard>
                  );
                })}
              </XDSGrid>
            </div>
          </XDSVStack>
        ))}
      </XDSVStack>

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
    </XDSSection>
  );
}

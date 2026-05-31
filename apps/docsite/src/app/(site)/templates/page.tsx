// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Templates gallery — extracted from craft.
 */

'use client';

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSOverlay} from '@xds/core/Overlay';
import {XDSBadge} from '@xds/core/Badge';
import {templates} from '../../../generated/templateRegistry';
import {TemplateThumbnail} from '../../../components/TemplateThumbnail';
import {buildPlaygroundHref} from '../../../components/playgroundLink';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
  },
  heroTitle: {
    textAlign: 'center' as const,
  },
  // Establishes a query container so the grid responds to its own available
  // width (the content area), not the viewport.
  gridContainer: {
    containerType: 'inline-size',
  },
  // Mobile-first: 1 column by default, 2 columns at >=800px, 3 at >=1200px of
  // container width. min-width queries are used because StyleX reorders
  // overlapping max-width queries (the wider one wins), which would prevent
  // the 1-column case from ever triggering. Uses 1fr tracks so cards always
  // fill the row width at every column count.
  grid: {
    display: 'grid',
    columnGap: 'var(--spacing-4)',
    rowGap: 'var(--spacing-6)',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      '@container (min-width: 800px)': 'repeat(2, minmax(0, 1fr))',
      '@container (min-width: 1200px)': 'repeat(3, minmax(0, 1fr))',
    },
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
  if (!category) {return OTHER_GROUP;}
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
      if (list) {list.push(item);}
      else {byGroup.set(group, [item]);}
    }

    const rank = (g: string) => {
      const i = GROUP_ORDER.indexOf(g);
      if (i !== -1) {return i;}
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

  return (
    <XDSSection maxWidth={2000} padding={6} xstyle={styles.section}>
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
            <div {...stylex.props(styles.gridContainer)}>
              <div {...stylex.props(styles.grid)}>
                {items.map(item => (
                  <XDSCard key={item.slug} padding={0}>
                    {/* Inline style overrides --color-overlay for a stronger scrim.
                      CSS variable overrides in stylex.create hit a type mismatch
                      with StyleXStyles in TS 6+ / StyleX 0.18+ strict mode. */}
                    <div
                      style={
                        {
                          '--color-overlay':
                            'color-mix(in srgb, var(--color-on-light) 78%, transparent)',
                        } as React.CSSProperties
                      }>
                      <XDSOverlay
                        showOn="hover"
                        scrim="dark"
                        content={
                          <div {...stylex.props(styles.overlayInner)}>
                            <XDSVStack gap={2}>
                              <XDSVStack gap={0.5}>
                                <XDSText
                                  type="body"
                                  weight="bold"
                                  style={{color: '#fff'}}>
                                  {item.name}
                                </XDSText>
                                <XDSText
                                  type="supporting"
                                  style={{color: 'rgba(255,255,255,0.7)'}}>
                                  {item.description.slice(0, 80)}
                                  {item.description.length > 80 ? '\u2026' : ''}
                                </XDSText>
                              </XDSVStack>
                              <XDSHStack gap={2}>
                                <XDSButton
                                  label="Preview"
                                  variant="secondary"
                                  size="sm"
                                  href={item.href}
                                />
                                {item.source && (
                                  <XDSButton
                                    label="Open in Playground"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      window.location.href =
                                        buildPlaygroundHref(item.source);
                                    }}
                                  />
                                )}
                              </XDSHStack>
                            </XDSVStack>
                          </div>
                        }>
                        {item.isReady ? (
                          <TemplateThumbnail slug={item.slug} />
                        ) : (
                          <div {...stylex.props(styles.cardImage)}>
                            <div {...stylex.props(styles.comingSoon)}>
                              <XDSBadge label="Coming Soon" variant="info" />
                            </div>
                          </div>
                        )}
                      </XDSOverlay>
                    </div>
                  </XDSCard>
                ))}
              </div>
            </div>
          </XDSVStack>
        ))}
      </XDSVStack>
    </XDSSection>
  );
}

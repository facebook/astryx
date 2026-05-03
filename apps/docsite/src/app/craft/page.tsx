/**
 * Page type: craft landing
 * Template gallery with hover overlay cards.
 * All data from pipeline registries.
 */

'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSOverlay} from '@xds/core/Overlay';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSCarousel} from '@xds/core/Carousel';
import {XDSBadge} from '@xds/core/Badge';
import {templates} from '../../generated/templateRegistry';
import {ThemeShowcaseTile} from '../../components/ThemeShowcaseTile';
import {XDSTheme} from '@xds/core/theme';
import {themeObjects} from '../../generated/themeRegistry';
import {TemplateThumbnail} from '../../components/TemplateThumbnail';
import {blocks} from '../../generated/blockRegistry';
import {packages} from '../../generated/packageRegistry';

const showcases = blocks.filter(b => b.isShowcase);
const themePackages = packages.filter(p => p.name.includes('theme-'));

const styles = stylex.create({
  heroTitle: {
    textAlign: 'center' as const,
  },
  carouselTabs: {
    marginBottom: 4,
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

type Tab = 'all' | 'templates' | 'theme' | 'showcases';

interface CraftItem {
  type: 'template' | 'showcase';
  name: string;
  description: string;
  slug: string;
  href: string;
  isReady: boolean;
}

function buildItems(): {templates: CraftItem[]; showcases: CraftItem[]} {
  return {
    templates: templates.map(t => ({
      type: 'template' as const,
      name: t.name,
      description: t.description,
      slug: t.slug,
      href: `/craft/templates/${t.slug}`,
      isReady: t.isReady,
    })),
    showcases: showcases.map(b => ({
      type: 'showcase' as const,
      name: b.name,
      description: b.description,
      slug: b.dirName,
      href: `/components/${b.componentsUsed[0] || b.category.split('/').pop()}`,
      isReady: true,
    })),
  };
}

export default function CraftPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const allItems = useMemo(buildItems, []);

  const handleTabChange = (v: string) => {
    setActiveTab(v as Tab);
  };

  const items =
    activeTab === 'templates'
      ? allItems.templates
      : activeTab === 'showcases'
        ? allItems.showcases
        : [...allItems.templates, ...allItems.showcases];

  return (
    <XDSSection maxWidth="xl" padding={6}>
      <XDSVStack gap={6}>
        <XDSText type="display-1" xstyle={styles.heroTitle}>
          Craft what you imagine.
        </XDSText>

        <XDSCarousel gap={0}>
          <XDSTabList
            value={activeTab}
            onChange={handleTabChange}
            size="md"
            xstyle={styles.carouselTabs}>
            <XDSTab
              value="all"
              label={`All (${allItems.templates.length + allItems.showcases.length})`}
            />
            <XDSTab
              value="templates"
              label={`Templates (${allItems.templates.length})`}
            />
            <XDSTab value="theme" label="Theme" />
            <XDSTab
              value="showcases"
              label={`Components (${allItems.showcases.length})`}
            />
          </XDSTabList>
        </XDSCarousel>

        {activeTab === 'theme' ? (
          <ThemeGrid />
        ) : (
          <XDSGrid columns={{minWidth: 300, repeat: 'fill'}} gap={4} rowGap={6}>
            {items.map(item => (
              <TemplateCard key={`${item.type}-${item.slug}`} item={item} />
            ))}
          </XDSGrid>
        )}
      </XDSVStack>
    </XDSSection>
  );
}

function ThemeGrid() {
  return (
    <XDSGrid columns={{minWidth: 300, repeat: 'fill'}} gap={4} rowGap={6}>
      {themePackages.map(pkg => {
        const theme = themeObjects[pkg.name];
        const label = pkg.displayName.replace('Theme: ', '');
        return (
          <XDSCard key={pkg.name} padding={0}>
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
                        {pkg.displayName}
                      </XDSText>
                      <XDSText
                        type="supporting"
                        style={{color: 'rgba(255,255,255,0.7)'}}>
                        {pkg.description.slice(0, 80)}
                        {pkg.description.length > 80 ? '\u2026' : ''}
                      </XDSText>
                    </XDSVStack>
                    <XDSHStack gap={2}>
                      <XDSButton
                        label="View theme"
                        variant="secondary"
                        size="sm"
                        href={`/packages/${pkg.name.replace('@xds/', '')}`}
                      />
                      <XDSButton
                        label="Customize"
                        variant="secondary"
                        size="sm"
                        href="/craft/theme"
                      />
                    </XDSHStack>
                  </XDSVStack>
                </div>
              }>
              <div style={{aspectRatio: '16/10'}} inert>
                {theme ? (
                  <XDSTheme theme={theme}>
                    <ThemeShowcaseTile label={label} />
                  </XDSTheme>
                ) : (
                  <div {...stylex.props(styles.cardImage)} />
                )}
              </div>
            </XDSOverlay>
          </XDSCard>
        );
      })}
    </XDSGrid>
  );
}

function TemplateCard({item}: {item: CraftItem}) {
  return (
    <XDSCard padding={0}>
      <XDSOverlay
        showOn="hover"
        scrim="dark"
        content={
          <div {...stylex.props(styles.overlayInner)}>
            <XDSVStack gap={2}>
              <XDSVStack gap={0.5}>
                <XDSText type="body" weight="bold" style={{color: '#fff'}}>
                  {item.name}
                </XDSText>
                <XDSText
                  type="supporting"
                  style={{color: 'rgba(255,255,255,0.7)'}}>
                  {item.description.slice(0, 80)}
                  {item.description.length > 80 ? '…' : ''}
                </XDSText>
              </XDSVStack>
              <XDSHStack gap={2}>
                <XDSButton
                  label="Preview"
                  variant="secondary"
                  size="sm"
                  href={item.href}
                />
                {item.type === 'template' && (
                  <XDSButton
                    label="Use"
                    variant="secondary"
                    size="sm"
                    href={item.href}
                  />
                )}
              </XDSHStack>
            </XDSVStack>
          </div>
        }>
        {item.type === 'template' && item.isReady ? (
          <TemplateThumbnail slug={item.slug} />
        ) : (
          <div {...stylex.props(styles.cardImage)}>
            {!item.isReady && (
              <div {...stylex.props(styles.comingSoon)}>
                <XDSBadge label="Coming Soon" variant="info" />
              </div>
            )}
          </div>
        )}
      </XDSOverlay>
    </XDSCard>
  );
}

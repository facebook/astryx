// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Components gallery index — browse all showcases.
 */

'use client';

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSOverlay} from '@xds/core/Overlay';
import {blocks} from '../../../generated/blockRegistry';
import {ShowcaseThumbnail} from '../../../components/ShowcaseThumbnail';

const showcases = blocks.filter(b => b.isShowcase);

const styles = stylex.create({
  heroTitle: {
    textAlign: 'center' as const,
  },
  cardImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '16/10',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
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

export default function ComponentsGalleryPage() {
  const items = useMemo(
    () =>
      showcases.map(b => ({
        name: b.name,
        description: b.description,
        slug: b.dirName,
        category: b.category,
        href: `/components/${b.componentsUsed[0] || b.category.split('/').pop()}`,
      })),
    [],
  );

  return (
    <XDSSection maxWidth="xl" padding={6}>
      <XDSVStack gap={6}>
        <XDSVStack gap={2} style={{alignItems: 'center'}}>
          <XDSText type="display-2" xstyle={styles.heroTitle}>
            Browse the library
          </XDSText>
          <XDSText type="body" color="secondary" xstyle={styles.heroTitle}>
            Every Astryx component, with copy-ready examples for every variant,
            state, and pattern.
          </XDSText>
        </XDSVStack>

        <XDSGrid columns={{minWidth: 300, repeat: 'fill'}} gap={4} rowGap={6}>
          {items.map(item => (
            <XDSCard key={item.slug} padding={0}>
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
                          label="View"
                          variant="secondary"
                          size="sm"
                          href={item.href}
                        />
                      </XDSHStack>
                    </XDSVStack>
                  </div>
                }>
                {item.category ? (
                  <ShowcaseThumbnail
                    dirName={item.slug}
                    category={item.category}
                  />
                ) : (
                  <div {...stylex.props(styles.cardImage)} />
                )}
              </XDSOverlay>
            </XDSCard>
          ))}
        </XDSGrid>
      </XDSVStack>
    </XDSSection>
  );
}

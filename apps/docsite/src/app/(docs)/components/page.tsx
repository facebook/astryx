// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Components gallery index — browse all showcases.
 */

'use client';

import {useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSTextInput} from '@xds/core/TextInput';
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
});

export default function ComponentsGalleryPage() {
  const [query, setQuery] = useState('');

  const items = useMemo(
    () =>
      showcases.map(b => ({
        name: b.displayName,
        description: b.description,
        slug: b.dirName,
        category: b.category,
        href: `/components/${b.componentsUsed[0] || b.category.split('/').pop()}`,
      })),
    [],
  );

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter(item => item.name.toLowerCase().includes(q));
  }, [items, query]);

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

        <XDSGrid columns={{minWidth: 300, repeat: 'fill'}} gap={4} rowGap={6}>
          {filteredItems.map(item => (
            <XDSVStack key={item.slug} gap={2}>
              <XDSClickableCard
                label={item.name}
                href={item.href}
                padding={0}
                variant="transparent">
                {item.category ? (
                  <ShowcaseThumbnail
                    dirName={item.slug}
                    category={item.category}
                  />
                ) : (
                  <div {...stylex.props(styles.cardImage)} />
                )}
              </XDSClickableCard>
              <XDSText>{item.name}</XDSText>
            </XDSVStack>
          ))}
        </XDSGrid>
      </XDSVStack>
    </XDSSection>
  );
}

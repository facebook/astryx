// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@xds/core/Text';
import {Layout, LayoutHeader, LayoutContent} from '@xds/core/Layout';
import {TextInput} from '@xds/core/TextInput';
import {Grid} from '@xds/core/Grid';
import {VStack} from '@xds/core/Stack';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {categories} from '../../sandboxPages';
import {ProjectCard} from '../../ProjectCard';
import {SearchIcon} from '../../icons';

const styles = stylex.create({
  emptyState: {
    padding: spacingVars['--spacing-12'],
    textAlign: 'center',
  },
});

export function CategoryContent({slug}: {slug: string}) {
  const category = categories.find(c => c.slug === slug);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!category) {
      return [];
    }
    if (!search.trim()) {
      return category.pages;
    }
    const q = search.toLowerCase();
    return category.pages.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [category, search]);

  if (!category) {
    return (
      <Layout
        header={
          <LayoutHeader hasDivider padding={6}>
            <Heading level={1}>Not Found</Heading>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={6}>
            <Text type="body" color="secondary">
              Category &quot;{slug}&quot; doesn&apos;t exist.
            </Text>
          </LayoutContent>
        }
      />
    );
  }

  return (
    <Layout
      header={
        <LayoutHeader hasDivider padding={6}>
          <Heading level={1}>{category.label}</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <TextInput
              label="Search"
              isLabelHidden
              placeholder="Search..."
              value={search}
              onChange={setSearch}
              startIcon={SearchIcon}
              size="lg"
            />

            {filtered.length === 0 ? (
              <div {...stylex.props(styles.emptyState)}>
                <Text type="supporting" color="secondary">
                  No results found.
                </Text>
              </div>
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

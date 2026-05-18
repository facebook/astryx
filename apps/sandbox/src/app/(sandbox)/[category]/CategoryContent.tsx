// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core/Layout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSGrid} from '@xds/core/Grid';
import {XDSVStack} from '@xds/core/Stack';
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
    if (!category) return [];
    if (!search.trim()) return category.pages;
    const q = search.toLowerCase();
    return category.pages.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [category, search]);

  if (!category) {
    return (
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider padding={6}>
            <XDSHeading level={1}>Not Found</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent padding={6}>
            <XDSText type="body" color="secondary">
              Category &quot;{slug}&quot; doesn&apos;t exist.
            </XDSText>
          </XDSLayoutContent>
        }
      />
    );
  }

  return (
    <XDSLayout
      header={
        <XDSLayoutHeader hasDivider padding={6}>
          <XDSHeading level={1}>{category.label}</XDSHeading>
        </XDSLayoutHeader>
      }
      content={
        <XDSLayoutContent padding={6}>
          <XDSVStack gap={6}>
            <XDSTextInput
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
                <XDSText type="supporting" color="secondary">
                  No results found.
                </XDSText>
              </div>
            ) : (
              <XDSGrid columns={{minWidth: 320}} gap={4}>
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

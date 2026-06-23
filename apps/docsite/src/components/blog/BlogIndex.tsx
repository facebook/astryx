// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BlogIndex.tsx
 *
 * Client component for the /blog index. Renders a grid of
 * post cards with horizontal post-type filters and no sidebar. The latest post
 * gets a larger "feature" treatment, derived purely from sort order.
 *
 * Filters only show types that actually have published content (issue #2896:
 * "Only show filters/tags publicly when content exists for them").
 *
 * @input  posts (BlogPost[], already sorted latest-first), available types
 * @output The interactive blog index UI
 * @position Rendered by app/blog/page.tsx
 */

'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text, Heading} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
import {Grid} from '@xds/core/Grid';
import {ToggleButton, ToggleButtonGroup} from '@xds/core/ToggleButton';
import {EmptyState} from '@xds/core/EmptyState';
import type {BlogPost, BlogPostType} from '../../lib/blog/schema';
import {POST_TYPE_LABELS} from '../../lib/blog/schema';
import {BlogCard} from './BlogCard';

const styles = stylex.create({
  typeFilter: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

export interface BlogIndexProps {
  posts: BlogPost[];
  /** Post types that have at least one published post, in canonical order. */
  availableTypes: BlogPostType[];
}

export function BlogIndex({posts, availableTypes}: BlogIndexProps) {
  const [activeType, setActiveType] = useState<'all' | BlogPostType>('all');

  const filtered = useMemo(() => {
    if (activeType === 'all') {
      return posts;
    }
    return posts.filter(p => p.type === activeType);
  }, [posts, activeType]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {all: posts.length};
    for (const t of availableTypes) {
      map[t] = posts.filter(p => p.type === t).length;
    }
    return map;
  }, [posts, availableTypes]);

  // Feature the latest post only in the unfiltered "all" view.
  const showFeature = activeType === 'all' && filtered.length > 0;
  const featurePost = showFeature ? filtered[0] : null;
  const restPosts = showFeature ? filtered.slice(1) : filtered;

  return (
    <Section maxWidth={800} padding={6} style={{marginInline: 'auto'}}>
      <VStack gap={10}>
        {/* Header */}
        <VStack gap={2}>
          <Heading level={1} type="display-1" justify="center">
            Blog
          </Heading>
          <Text weight="normal" color="secondary" justify="center">
            Releases, guides, and stories on building Astryx for humans and
            agents.
          </Text>
        </VStack>

        {availableTypes.length > 1 ? (
          <ToggleButtonGroup
            label="Filter posts by type"
            value={activeType}
            onChange={value =>
              setActiveType((value as 'all' | BlogPostType) ?? 'all')
            }
            xstyle={styles.typeFilter}>
            <ToggleButton value="all" label={`All (${counts.all})`} />
            {availableTypes.map(t => (
              <ToggleButton
                key={t}
                value={t}
                label={`${POST_TYPE_LABELS[t]} (${counts[t]})`}
              />
            ))}
          </ToggleButtonGroup>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Check back soon for releases, guides, and stories."
          />
        ) : (
          <VStack gap={10}>
            {featurePost ? <BlogCard post={featurePost} feature /> : null}
            {restPosts.length > 0 ? (
              <Grid
                columns={{minWidth: 320, repeat: 'fill'}}
                gap={5}
                rowGap={10}>
                {restPosts.map(post => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </Grid>
            ) : null}
          </VStack>
        )}
      </VStack>
    </Section>
  );
}

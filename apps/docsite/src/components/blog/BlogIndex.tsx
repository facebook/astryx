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
import {Carousel} from '@xds/core/Carousel';
import {TabList, Tab} from '@xds/core/TabList';
import type {BlogPost, BlogPostType} from '../../lib/blog/schema';
import {POST_TYPE_LABELS} from '../../lib/blog/schema';
import {BlogCard} from './BlogCard';

const styles = stylex.create({
  header: {
    maxWidth: 720,
  },
  filterRow: {
    marginBottom: 4,
  },
  empty: {
    paddingBlock: 48,
    textAlign: 'center',
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
    <Section maxWidth={1100} padding={6}>
      <VStack gap={6}>
        <VStack gap={4} xstyle={styles.header}>
          <Heading level={1} type="display-1">
            Blog
          </Heading>
          <Text type="large" weight="normal" color="secondary">
            Notes on building Astryx — releases, guides, stories, and
            perspectives on designing a system for humans and agents.
          </Text>
        </VStack>

        {availableTypes.length > 1 ? (
          <Carousel gap={0}>
            <TabList
              value={activeType}
              onChange={v => setActiveType(v as 'all' | BlogPostType)}
              size="md"
              xstyle={styles.filterRow}>
              <Tab value="all" label={`All (${counts.all})`} />
              {availableTypes.map(t => (
                <Tab
                  key={t}
                  value={t}
                  label={`${POST_TYPE_LABELS[t]} (${counts[t]})`}
                />
              ))}
            </TabList>
          </Carousel>
        ) : null}

        {filtered.length === 0 ? (
          <div {...stylex.props(styles.empty)}>
            <Text type="body" color="secondary">
              No posts yet. Check back soon.
            </Text>
          </div>
        ) : (
          <VStack gap={6}>
            {featurePost ? (
              <Grid columns={1} gap={4}>
                <BlogCard post={featurePost} feature />
              </Grid>
            ) : null}
            {restPosts.length > 0 ? (
              <Grid
                columns={{minWidth: 320, repeat: 'fill'}}
                gap={4}
                rowGap={6}>
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

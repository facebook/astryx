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
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCarousel} from '@xds/core/Carousel';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
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
    <XDSSection maxWidth={1100} padding={6}>
      <XDSVStack gap={6}>
        <XDSVStack gap={4} xstyle={styles.header}>
          <XDSHeading level={1} type="display-1">
            Blog
          </XDSHeading>
          <XDSText type="large" weight="normal" color="secondary">
            Notes on building Astryx — releases, guides, stories, and
            perspectives on designing a system for humans and agents.
          </XDSText>
        </XDSVStack>

        {availableTypes.length > 1 ? (
          <XDSCarousel gap={0}>
            <XDSTabList
              value={activeType}
              onChange={v => setActiveType(v as 'all' | BlogPostType)}
              size="md"
              xstyle={styles.filterRow}>
              <XDSTab value="all" label={`All (${counts.all})`} />
              {availableTypes.map(t => (
                <XDSTab
                  key={t}
                  value={t}
                  label={`${POST_TYPE_LABELS[t]} (${counts[t]})`}
                />
              ))}
            </XDSTabList>
          </XDSCarousel>
        ) : null}

        {filtered.length === 0 ? (
          <div {...stylex.props(styles.empty)}>
            <XDSText type="body" color="secondary">
              No posts yet. Check back soon.
            </XDSText>
          </div>
        ) : (
          <XDSVStack gap={6}>
            {featurePost ? (
              <XDSGrid columns={1} gap={4}>
                <BlogCard post={featurePost} feature />
              </XDSGrid>
            ) : null}
            {restPosts.length > 0 ? (
              <XDSGrid
                columns={{minWidth: 320, repeat: 'fill'}}
                gap={4}
                rowGap={6}>
                {restPosts.map(post => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </XDSGrid>
            ) : null}
          </XDSVStack>
        )}
      </XDSVStack>
    </XDSSection>
  );
}

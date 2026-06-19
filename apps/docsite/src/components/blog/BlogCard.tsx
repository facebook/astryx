// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BlogCard.tsx
 *
 * A blog index card built on XDSClickableCard: a neutral
 * cover placeholder on top, then type badge, title, description excerpt,
 * byline, and tag chips. The whole card navigates to the post; nested elements
 * (tags, author links) remain independently interactive.
 *
 * The `feature` variant gives the latest post a larger treatment. This is
 * derived from sort order by the index page — never from per-post metadata.
 *
 * @input  post (BlogPost), feature flag
 * @output A clickable card for the blog grid
 * @position Used by the /blog index grid
 */

import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSBadge} from '@xds/core/Badge';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import type {BlogPost} from '../../lib/blog/schema';
import {POST_TYPE_LABELS} from '../../lib/blog/schema';
import {AuthorByline} from './AuthorByline';

const styles = stylex.create({
  card: {
    height: '100%',
  },
  inner: {
    height: '100%',
  },
  // Neutral cover placeholder (cover generator deferred). Calm, theme-driven.
  cover: (feature: boolean) => ({
    width: '100%',
    aspectRatio: feature ? '16 / 7' : '16 / 9',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  }),
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    borderRadius: 'var(--radius-container)',
  },
  excerpt: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  tagRow: {
    flexWrap: 'wrap',
  },
});

export interface BlogCardProps {
  post: BlogPost;
  feature?: boolean;
}

export function BlogCard({post, feature = false}: BlogCardProps) {
  return (
    <XDSClickableCard
      href={`/blog/${post.slug}`}
      label={post.title}
      padding={4}
      xstyle={styles.card}>
      <XDSVStack gap={3} xstyle={styles.inner}>
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.coverAlt ?? ''}
            {...stylex.props(styles.cover(feature), styles.coverImg)}
          />
        ) : (
          <div {...stylex.props(styles.cover(feature))} aria-hidden="true" />
        )}
        <XDSVStack gap={2}>
          <XDSHStack gap={1} align="center" xstyle={styles.tagRow}>
            <XDSBadge label={POST_TYPE_LABELS[post.type]} variant="neutral" />
          </XDSHStack>
          <XDSVStack gap={1}>
            <XDSHeading level={feature ? 2 : 3}>{post.title}</XDSHeading>
            <XDSText type="body" color="secondary" xstyle={styles.excerpt}>
              {post.description}
            </XDSText>
          </XDSVStack>
          <AuthorByline
            authors={post.authors}
            date={post.date}
            readingTimeMinutes={post.readingTimeMinutes}
            variant="compact"
          />
          {post.tags.length > 0 ? (
            <XDSHStack gap={1} xstyle={styles.tagRow}>
              {post.tags.map(tag => (
                <XDSBadge key={tag} label={tag} variant="neutral" />
              ))}
            </XDSHStack>
          ) : null}
        </XDSVStack>
      </XDSVStack>
    </XDSClickableCard>
  );
}

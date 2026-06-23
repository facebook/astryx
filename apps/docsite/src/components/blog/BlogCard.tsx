// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BlogCard.tsx
 *
 * A blog index card built on Link: a neutral
 * cover placeholder on top, then title, description excerpt, byline, and a
 * chip row whose first badge is the post type followed by tag chips. The whole
 * card navigates to the post; nested elements (tags, author links) remain
 * independently interactive.
 *
 * The `feature` variant gives the latest post a larger treatment. This is
 * derived from sort order by the index page — never from per-post metadata.
 *
 * @input  post (BlogPost), feature flag
 * @output A clickable card for the blog grid
 * @position Used by the /blog index grid
 */

import * as stylex from '@stylexjs/stylex';
import {Text, Heading} from '@xds/core/Text';
import {VStack, HStack} from '@xds/core/Layout';
import {Badge} from '@xds/core/Badge';
import {Link} from '@xds/core/Link';
import {AspectRatio} from '@xds/core/AspectRatio';
import type {BlogPost} from '../../lib/blog/schema';
import {POST_TYPE_LABELS} from '../../lib/blog/schema';
import {AuthorByline} from './AuthorByline';
import css from './BlogCard.module.css';

const styles = stylex.create({
  card: {
    display: 'block',
    width: '100%',
    height: '100%',
    color: 'inherit',
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
  },
  inner: {
    height: '100%',
  },
  // Neutral cover placeholder (cover generator deferred). Calm, theme-driven.
  // Hover tint lives in BlogCard.module.css (.cover::after).
  cover: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  excerpt: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  postTags: {
    flexWrap: 'wrap',
  },
});

export interface BlogCardProps {
  post: BlogPost;
  feature?: boolean;
}

export function BlogCard({post, feature = false}: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      label={post.title}
      color="inherit"
      display="block"
      xstyle={styles.card}
      className={css.card}>
      <VStack gap={3} xstyle={styles.inner}>
        <AspectRatio ratio={16 / 9} xstyle={styles.cover} className={css.cover}>
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.coverAlt ?? ''}
              {...stylex.props(styles.coverImg)}
            />
          ) : (
            <div aria-hidden="true" />
          )}
        </AspectRatio>
        <VStack gap={3}>
          <VStack gap={1}>
            <Heading level={feature ? 1 : 3}>{post.title}</Heading>
            <Text
              type="body"
              color="secondary"
              xstyle={styles.excerpt}
              className={css.description}>
              {post.description}
            </Text>
          </VStack>
          <AuthorByline
            authors={post.authors}
            date={post.date}
            readingTimeMinutes={post.readingTimeMinutes}
            variant="compact"
            className={css.byline}
          />
          <HStack gap={1} xstyle={styles.postTags}>
            <Badge label={POST_TYPE_LABELS[post.type]} variant="cyan" />
            {post.tags.map(tag => (
              <Badge key={tag} label={tag} variant="neutral" />
            ))}
          </HStack>
        </VStack>
      </VStack>
    </Link>
  );
}

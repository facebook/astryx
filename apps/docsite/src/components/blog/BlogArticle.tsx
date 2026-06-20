// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BlogArticle.tsx
 *
 * Article layout matching the docs page typography: a centered, readable column
 * (maxWidth 800) with a display-1 title, large regular-weight dek, byline, a
 * neutral cover placeholder, the prose body (rendered via Markdown), optional
 * curated related-doc links, and a link back to the blog index. No sidebar.
 *
 * @input  post (BlogPost)
 * @output The full article view
 * @position Rendered by app/blog/[slug]/page.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {Markdown} from '@xds/core/Markdown';
import {Text, Heading} from '@xds/core/Text';
import {VStack, HStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
import {Badge} from '@xds/core/Badge';
import {Divider} from '@xds/core/Divider';
import {Link} from '@xds/core/Link';
import {ClickableCard} from '@xds/core/ClickableCard';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import type {BlogPost} from '../../lib/blog/schema';
import {POST_TYPE_LABELS} from '../../lib/blog/schema';
import {AuthorByline} from './AuthorByline';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
    paddingBottom: `calc(${spacingVars['--spacing-12']} * 2)`,
  },
  // Neutral cover placeholder (cover generator deferred). Calm, theme-driven.
  cover: {
    width: '100%',
    aspectRatio: '16 / 7',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    borderRadius: 'var(--radius-container)',
  },
  tagRow: {
    flexWrap: 'wrap',
  },
});

export interface BlogArticleProps {
  post: BlogPost;
}

export function BlogArticle({post}: BlogArticleProps) {
  return (
    <Section maxWidth={800} padding={6} xstyle={styles.section}>
      <VStack gap={10}>
        {/* Header — matches the docs page treatment */}
        <VStack gap={4}>
          <Link href="/blog" label="Back to blog">
            ← Blog
          </Link>
          <HStack gap={1} align="center" xstyle={styles.tagRow}>
            <Badge label={POST_TYPE_LABELS[post.type]} variant="neutral" />
          </HStack>
          <Heading level={1} type="display-1">
            {post.title}
          </Heading>
          <Text type="large" weight="normal" color="secondary">
            {post.description}
          </Text>
          <AuthorByline
            authors={post.authors}
            date={post.date}
            updatedAt={post.updatedAt}
            readingTimeMinutes={post.readingTimeMinutes}
            variant="full"
          />
          <Divider />
        </VStack>

        {/* Cover — custom image when provided, else a neutral placeholder */}
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.coverAlt ?? ''}
            {...stylex.props(styles.cover, styles.coverImg)}
          />
        ) : (
          <div {...stylex.props(styles.cover)} aria-hidden="true" />
        )}

        {/* Body */}
        <Markdown headingLevelStart={2}>{post.body}</Markdown>

        {post.tags.length > 0 ? (
          <HStack gap={1} xstyle={styles.tagRow}>
            {post.tags.map(tag => (
              <Badge key={tag} label={tag} variant="neutral" />
            ))}
          </HStack>
        ) : null}

        {/* Related docs — clickable cards, not styled links */}
        {post.relatedDocs && post.relatedDocs.length > 0 ? (
          <VStack gap={4}>
            <Divider />
            <Heading level={2} type="display-3">
              Related
            </Heading>
            <VStack gap={2}>
              {post.relatedDocs.map(doc => (
                <ClickableCard
                  key={doc.href}
                  href={doc.href}
                  label={doc.title}
                  variant="muted">
                  <Text type="body" weight="medium">
                    {doc.title}
                  </Text>
                </ClickableCard>
              ))}
            </VStack>
          </VStack>
        ) : null}

        <Divider />
        <Link href="/blog" label="Back to all posts">
          ← Back to all posts
        </Link>
      </VStack>
    </Section>
  );
}

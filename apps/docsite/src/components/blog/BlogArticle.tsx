// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BlogArticle.tsx
 *
 * Article layout matching the docs page typography: a centered, readable column
 * (maxWidth 800) with a display-1 title, large regular-weight dek, byline, a
 * neutral cover placeholder, the prose body (rendered via XDSMarkdown), optional
 * curated related-doc links, and a link back to the blog index. No sidebar.
 *
 * @input  post (BlogPost)
 * @output The full article view
 * @position Rendered by app/blog/[slug]/page.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';
import {XDSClickableCard} from '@xds/core/ClickableCard';
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
    <XDSSection maxWidth={800} padding={6} xstyle={styles.section}>
      <XDSVStack gap={10}>
        {/* Header — matches the docs page treatment */}
        <XDSVStack gap={4}>
          <XDSLink href="/blog" label="Back to blog">
            ← Blog
          </XDSLink>
          <XDSHStack gap={1} align="center" xstyle={styles.tagRow}>
            <XDSBadge label={POST_TYPE_LABELS[post.type]} variant="neutral" />
          </XDSHStack>
          <XDSHeading level={1} type="display-1">
            {post.title}
          </XDSHeading>
          <XDSText type="large" weight="normal" color="secondary">
            {post.description}
          </XDSText>
          <AuthorByline
            authors={post.authors}
            date={post.date}
            updatedAt={post.updatedAt}
            readingTimeMinutes={post.readingTimeMinutes}
            variant="full"
          />
          <XDSDivider />
        </XDSVStack>

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
        <XDSMarkdown headingLevelStart={2}>{post.body}</XDSMarkdown>

        {post.tags.length > 0 ? (
          <XDSHStack gap={1} xstyle={styles.tagRow}>
            {post.tags.map(tag => (
              <XDSBadge key={tag} label={tag} variant="neutral" />
            ))}
          </XDSHStack>
        ) : null}

        {/* Related docs — clickable cards, not styled links */}
        {post.relatedDocs && post.relatedDocs.length > 0 ? (
          <XDSVStack gap={4}>
            <XDSDivider />
            <XDSHeading level={2} type="display-3">
              Related
            </XDSHeading>
            <XDSVStack gap={2}>
              {post.relatedDocs.map(doc => (
                <XDSClickableCard
                  key={doc.href}
                  href={doc.href}
                  label={doc.title}
                  variant="muted">
                  <XDSText type="body" weight="medium">
                    {doc.title}
                  </XDSText>
                </XDSClickableCard>
              ))}
            </XDSVStack>
          </XDSVStack>
        ) : null}

        <XDSDivider />
        <XDSLink href="/blog" label="Back to all posts">
          ← Back to all posts
        </XDSLink>
      </XDSVStack>
    </XDSSection>
  );
}

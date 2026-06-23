// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BlogArticle.tsx
 *
 * Article layout matching the docs page typography: a centered, readable column
 * (maxWidth 800) with a breadcrumb trail (Blog / post type), a display-1 title,
 * large regular-weight dek, byline, a neutral cover placeholder, the prose body
 * (rendered via Markdown), optional curated related-doc links, and a link back to
 * the blog index. No sidebar.
 *
 * @input  post (BlogPost)
 * @output The full article view
 * @position Rendered by app/blog/[slug]/page.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {Markdown} from '@xds/core/Markdown';
import {Text, Heading} from '@xds/core/Text';
import {VStack, HStack} from '@xds/core/Layout';
import {Grid} from '@xds/core/Grid';
import {AspectRatio} from '@xds/core/AspectRatio';
import {Icon} from '@xds/core/Icon';
import {Section} from '@xds/core/Section';
import {Badge} from '@xds/core/Badge';
import {Breadcrumbs, BreadcrumbItem} from '@xds/core/Breadcrumbs';
import {Divider} from '@xds/core/Divider';
import {ClickableCard} from '@xds/core/ClickableCard';
import type {BlogPost} from '../../lib/blog/schema';
import {POST_TYPE_LABELS} from '../../lib/blog/schema';
import {AuthorByline} from './AuthorByline';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
  },
  // Shared cover frame (calm, theme-driven). AspectRatio governs the ratio.
  cover: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  // Neutral placeholder shown when no cover image is provided.
  coverPlaceholder: {
    width: '100%',
    aspectRatio: '16 / 9',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
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
          <Breadcrumbs>
            <BreadcrumbItem href="/blog">Blog</BreadcrumbItem>
            <BreadcrumbItem isCurrent>
              {POST_TYPE_LABELS[post.type]}
            </BreadcrumbItem>
          </Breadcrumbs>
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
          <AspectRatio ratio={16 / 9} xstyle={styles.cover}>
            <img
              src={post.coverImage}
              alt={post.coverAlt ?? ''}
              {...stylex.props(styles.coverImg)}
            />
          </AspectRatio>
        ) : (
          <div
            {...stylex.props(styles.cover, styles.coverPlaceholder)}
            aria-hidden="true"
          />
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

        {/* Related content */}
        {post.relatedDocs && post.relatedDocs.length > 0 ? (
          <VStack gap={6}>
            <Divider />
            <Heading level={2} type="display-3">
              Related
            </Heading>
            {/* minWidth caps this at 2 columns within the ~752px article
                column; 'fit' lets a lone card stretch to fill when it wraps to
                one column (an explicit `max` would cap track width at 50% and
                prevent the fill). */}
            <Grid columns={{minWidth: 280, repeat: 'fill'}} gap={2}>
              {post.relatedDocs.map(doc => (
                <ClickableCard
                  key={doc.href}
                  href={doc.href}
                  label={doc.title}
                  padding={3}
                  variant="muted">
                  <HStack justify="between" align="center" gap={2}>
                    <Text type="body" weight="medium">
                      {doc.title}
                    </Text>
                    <Icon icon="chevronRight" size="sm" color="secondary" />
                  </HStack>
                </ClickableCard>
              ))}
            </Grid>
          </VStack>
        ) : null}
      </VStack>
    </Section>
  );
}

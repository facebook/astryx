// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StoriesShowcase.tsx
 *
 * Home-page "Blog" section. Auto-surfaces the three most recent posts from the
 * build-time blog registry (already sorted latest-first) in a featured split
 * layout: the latest post is a large feature card on the left (with its type tag
 * above the title), and the next two posts render as smaller cards stacked on
 * the right. Any slot beyond the available posts renders as a blank placeholder
 * so the layout stays balanced while the blog is still small.
 *
 * Both columns are tuned to roughly equal height: the grid stretches the right
 * column to the feature's height and distributes its two cards to fill it, and
 * the column ratio is picked so the feature is the taller side.
 *
 * @input  blogPosts (from the generated registry)
 * @output A marketing section linking to the latest blog posts
 * @position Rendered inside the home page showcase overlay (app/(site)/page.tsx)
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@xds/core/Text';
import {VStack, HStack} from '@xds/core/Layout';
import {Link} from '@xds/core/Link';
import {Divider} from '@xds/core/Divider';
import {AspectRatio} from '@xds/core/AspectRatio';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {blogPosts} from '../../../generated/blogRegistry';
import {POST_TYPE_LABELS} from '../../../lib/blog/schema';
import type {BlogPost} from '../../../lib/blog/schema';
import {formatDate} from '../../../components/blog/AuthorByline';

// The grid always renders this many slots: 1 feature (left) + 2 compact (right).
// The most recent posts (blogPosts is emitted latest-first by the generator)
// fill the leading slots; any remaining slots render as blank placeholders.
const SLOT_COUNT = 3;

const styles = stylex.create({
  // Cap at the shared 1200px marketing measure so this section lines up
  // vertically with Features / About / Discover inside the showcase overlay.
  section: {
    width: '100%',
    maxWidth: 1200,
  },
  // Section header: title on the left, "View all" link on the right. Wraps and
  // recenters on narrow screens so the link never collides with the title.
  header: {
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    rowGap: spacingVars['--spacing-2'],
  },
  // Featured split: a wide feature column on the left + a narrower stack of two
  // compact cards on the right. The 2.4 : 1 ratio is tuned so the feature and
  // the two stacked compact cards land at roughly the same height naturally.
  // alignItems:start keeps each column at its content height (no stretching).
  // Collapses to a single column below 1024px.
  splitGrid: {
    width: '100%',
    display: 'grid',
    gap: spacingVars['--spacing-8'],
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 1024px)': '2.4fr 1fr',
    },
    alignItems: 'start',
  },
  // Right column holds the two compact cards stacked vertically at their natural
  // height with a fixed gap between them (set on the VStack in markup).
  rightColumn: {
    width: '100%',
  },
  // Shared card link reset.
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
  // Cover image / placeholder. Rounded, theme-driven neutral placeholder when a
  // post has no custom cover image.
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
  // Clamp titles so cards keep an even baseline.
  title: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  titleCompact: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  // Uppercase type eyebrow shown above the feature title (e.g. "UPDATE").
  typeLabel: {
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  // Short vertical divider between date and reading time in the meta row.
  metaDivider: {
    height: '0.75em',
  },
  // Blank placeholder bars (stand-in title/meta) so an empty slot keeps the
  // same footprint as a real card while the blog grows.
  blankBar: {
    height: 14,
    borderRadius: 'var(--radius-small)',
    backgroundColor: 'var(--color-background-muted)',
  },
  blankBarEyebrow: {
    width: '25%',
    height: 10,
  },
  blankBarTitle: {
    width: '70%',
  },
  blankBarMeta: {
    width: '40%',
    height: 10,
  },
});

// Subtext shared by every card: publish date · reading time.
function MetaRow({post}: {post: BlogPost}) {
  return (
    <HStack gap={2} align="center">
      <Text type="supporting" color="secondary">
        {formatDate(post.date)}
      </Text>
      {post.readingTimeMinutes ? (
        <>
          <Divider orientation="vertical" xstyle={styles.metaDivider} />
          <Text type="supporting" color="secondary">
            {post.readingTimeMinutes} min read
          </Text>
        </>
      ) : null}
    </HStack>
  );
}

function Cover({post, ratio}: {post: BlogPost; ratio: number}) {
  return (
    <AspectRatio ratio={ratio} xstyle={styles.cover}>
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
  );
}

// Large left-hand feature card for the latest post: type tag above the title,
// then a date · reading-time subtext.
function FeatureCard({post}: {post: BlogPost}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      label={post.title}
      color="inherit"
      display="block"
      xstyle={styles.card}>
      <VStack gap={4}>
        <Cover post={post} ratio={16 / 9} />
        <VStack gap={2}>
          <VStack gap={1}>
            <Text
              type="supporting"
              color="secondary"
              weight="medium"
              xstyle={styles.typeLabel}>
              {POST_TYPE_LABELS[post.type]}
            </Text>
            <Heading level={2} color="primary" xstyle={styles.title}>
              {post.title}
            </Heading>
          </VStack>
          <MetaRow post={post} />
        </VStack>
      </VStack>
    </Link>
  );
}

// Smaller stacked card for the right column: type tag above the title, then a
// date · reading-time subtext (mirrors the feature card so the two compact cards
// stand taller and fill the column height alongside the feature).
function CompactCard({post}: {post: BlogPost}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      label={post.title}
      color="inherit"
      display="block"
      xstyle={styles.card}>
      <VStack gap={3}>
        <Cover post={post} ratio={16 / 9} />
        <VStack gap={2}>
          <VStack gap={1}>
            <Text
              type="supporting"
              color="secondary"
              weight="medium"
              xstyle={styles.typeLabel}>
              {POST_TYPE_LABELS[post.type]}
            </Text>
            <Heading level={4} color="primary" xstyle={styles.titleCompact}>
              {post.title}
            </Heading>
          </VStack>
          <MetaRow post={post} />
        </VStack>
      </VStack>
    </Link>
  );
}

// Empty slot rendered when there aren't enough posts to fill the grid yet.
// Decorative only — kept out of the accessibility tree and non-interactive.
function BlankCard({feature = false}: {feature?: boolean}) {
  return (
    <VStack gap={feature ? 4 : 3} aria-hidden="true">
      <AspectRatio ratio={16 / 9} xstyle={styles.cover}>
        <div />
      </AspectRatio>
      <VStack gap={2}>
        <div {...stylex.props(styles.blankBar, styles.blankBarEyebrow)} />
        <div {...stylex.props(styles.blankBar, styles.blankBarTitle)} />
        <div {...stylex.props(styles.blankBar, styles.blankBarMeta)} />
      </VStack>
    </VStack>
  );
}

export function StoriesShowcase() {
  const latest = blogPosts.slice(0, SLOT_COUNT);

  // Slot 0 → feature (left); slots 1–2 → compact (right). Missing posts render
  // as blank placeholders so the split layout stays balanced.
  const [featurePost, ...compactPosts] = Array.from(
    {length: SLOT_COUNT},
    (_, i) => latest[i] ?? null,
  );

  return (
    <VStack as="section" align="center" gap={8} width="100%">
      <VStack gap={8} xstyle={styles.section}>
        <HStack xstyle={styles.header}>
          <Heading level={2} type="display-2" color="primary">
            Blog
          </Heading>
          <Link type="body" color="primary" href="/blog" hasUnderline={false}>
            View all →
          </Link>
        </HStack>
        <div {...stylex.props(styles.splitGrid)}>
          {featurePost ? (
            <FeatureCard post={featurePost} />
          ) : (
            <BlankCard feature />
          )}
          <VStack gap={6} xstyle={styles.rightColumn}>
            {compactPosts.map((post, i) =>
              post ? (
                <CompactCard key={post.slug} post={post} />
              ) : (
                <BlankCard key={`blank-${i}`} />
              ),
            )}
          </VStack>
        </div>
      </VStack>
    </VStack>
  );
}

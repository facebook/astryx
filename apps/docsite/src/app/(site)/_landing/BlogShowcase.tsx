// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BlogShowcase.tsx
 *
 * Home-page "Blog" section. Auto-surfaces the most recent posts from the
 * build-time blog registry (already sorted latest-first). The layout adapts to
 * how many posts are published so the section always looks intentional:
 *
 *   - Exactly 2 posts → a balanced 50/50 grid of two equal feature cards.
 *   - 3+ posts → a featured split: the latest post is a large feature card on the
 *     left and the next two posts render as smaller cards stacked on the right.
 *
 * Cards are the shared `BlogCard` (also used on the blog index) with the excerpt
 * hidden to keep this marketing section tighter. The left/large card uses
 * BlogCard's `feature` variant; the right/stacked cards use the default variant.
 *
 * @input  blogPosts (from the generated registry)
 * @output A marketing section linking to the latest blog posts
 * @position Rendered inside the home page showcase overlay (app/(site)/page.tsx)
 */

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {ArrowRight} from 'lucide-react';
import {Heading} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Button} from '@astryxdesign/core/Button';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {blogPosts} from '../../../generated/blogRegistry';
import {BlogCard} from '../../../components/blog/BlogCard';

// The featured-split layout (3+ posts) renders 1 feature (left) + 2 compact
// (right), filled by the 3 most recent posts (blogPosts is emitted latest-first
// by the generator).
const SLOT_COUNT = 3;

const styles = stylex.create({
  section: {
    width: '100%',
    maxWidth: 1200,
  },
  header: {
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    rowGap: spacingVars['--spacing-2'],
  },
  featureCell: {
    gridColumn: {
      default: '1 / -1',
      '@media (min-width: 900px)': 'span 2',
    },
  },
  rightCell: {
    gridColumn: {
      default: '1 / -1',
      '@media (min-width: 900px)': 'span 1',
    },
  },
});

// Section shell shared by both layouts:
// with the layout-specific grid passed in as children.
function BlogSection({children}: {children: ReactNode}) {
  return (
    <VStack as="section" align="center" gap={8} width="100%">
      <VStack gap={8} xstyle={styles.section}>
        <HStack xstyle={styles.header}>
          <Heading level={2} type="display-2" color="primary">
            Stay in the know
          </Heading>
          <Button
            variant="ghost"
            label="View all posts"
            href="/blog"
            endContent={<Icon icon={ArrowRight} size="sm" />}
          />
        </HStack>
        {children}
      </VStack>
    </VStack>
  );
}

export function BlogShowcase() {
  // Exactly two posts → balanced 50/50 grid of two equal feature cards. This
  // reads as intentional, whereas the featured split would leave a lonely blank
  // placeholder in the right column.
  if (blogPosts.length === 2) {
    const [first, second] = blogPosts;
    return (
      <BlogSection>
        <Grid
          columns={{minWidth: 480, repeat: 'fit'}}
          gap={8}
          width="100%"
          align="start">
          <BlogCard post={first} feature />
          <BlogCard post={second} feature />
        </Grid>
      </BlogSection>
    );
  }

  // Three+ posts → featured split. Slot 0 → feature (left); slots 1–2 → compact
  // (right), filled by the 3 most recent posts.
  const [featurePost, ...compactPosts] = blogPosts.slice(0, SLOT_COUNT);

  return (
    <BlogSection>
      <Grid columns={3} gap={8} width="100%" align="start">
        <GridSpan xstyle={styles.featureCell}>
          <BlogCard post={featurePost} feature />
        </GridSpan>
        <GridSpan xstyle={styles.rightCell}>
          <VStack gap={6}>
            {compactPosts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </VStack>
        </GridSpan>
      </Grid>
    </BlogSection>
  );
}

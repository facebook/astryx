// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: blog index
 * Grid of posts with horizontal type filters and no sidebar.
 * Data comes from the build-time generated blog registry.
 */

import type {Metadata} from 'next';
import {blogPosts, blogTypes} from '../../generated/blogRegistry';
import {BlogIndex} from '../../components/blog/BlogIndex';

const BLOG_TITLE = 'Blog';
const BLOG_DESCRIPTION =
  'Notes on building Astryx — releases, guides, stories, and perspectives on designing a system for humans and agents.';

// Next.js shallow-merges metadata: a child route that declares `openGraph`/
// `twitter` REPLACES the root object wholesale (images are not inherited), so
// we re-state the default social image here.
export const metadata: Metadata = {
  // Renders as "Blog · Astryx" via the root layout title template.
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  openGraph: {
    type: 'website',
    title: `${BLOG_TITLE} · Astryx`,
    description: BLOG_DESCRIPTION,
    url: '/blog',
    images: ['/blog-post-01.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BLOG_TITLE} · Astryx`,
    description: BLOG_DESCRIPTION,
    images: ['/blog-post-01.png'],
  },
};

export default function BlogPage() {
  return <BlogIndex posts={blogPosts} availableTypes={blogTypes} />;
}

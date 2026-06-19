// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: blog index
 * Grid of posts with horizontal type filters and no sidebar.
 * Data comes from the build-time generated blog registry.
 */

import type {Metadata} from 'next';
import {blogPosts, blogTypes} from '../../generated/blogRegistry';
import {BlogIndex} from '../../components/blog/BlogIndex';

export const metadata: Metadata = {
  title: 'Blog — Astryx',
  description:
    'Notes on building Astryx — releases, guides, stories, and perspectives on designing a system for humans and agents.',
};

export default function BlogPage() {
  return <BlogIndex posts={blogPosts} availableTypes={blogTypes} />;
}

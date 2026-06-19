// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: blog post detail
 * Renders an individual post with article typography. Static params and per-post
 * metadata are derived from the generated blog registry.
 */

import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {blogPosts} from '../../../generated/blogRegistry';
import {BlogArticle} from '../../../components/blog/BlogArticle';

export function generateStaticParams() {
  return blogPosts.map(p => ({slug: p.slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) {
    return {title: 'Blog — Astryx'};
  }

  const images = post.coverImage ? [{url: post.coverImage}] : undefined;
  return {
    title: `${post.title} — Astryx Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      ...(images ? {images} : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) {
    notFound();
  }

  return <BlogArticle post={post} />;
}

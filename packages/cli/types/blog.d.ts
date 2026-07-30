// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Types for the `blog` API (@astryxdesign/cli/api → blog). The blog is
 * read over the canonical RSS feed; there are no options (list vs. read a post
 * is decided by the optional slug argument).
 */

export interface BlogPost {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  type?: string;
  authors?: string[];
  link?: string;
  textUrl?: string | null;
}

export interface BlogListData {
  feedUrl: string;
  posts: BlogPost[];
}

export type BlogDetailData = BlogPost & {feedUrl: string; text: string};

export interface BlogListResponse {
  type: 'blog.list';
  data: BlogListData;
}

export interface BlogDetailResponse {
  type: 'blog.detail';
  data: BlogDetailData;
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file robots.ts
 *
 * Next.js serves this at /robots.txt. It allows full crawling and advertises
 * the dynamic sitemap so search engines can discover every page the docsite
 * generates. Uses the same SITE_URL origin as the sitemap and metadata.
 *
 * @output MetadataRoute.Robots consumed by Next.js to emit /robots.txt
 */

import type {MetadataRoute} from 'next';
import {SITE_URL} from '../lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The playground preview frame is a render target, not indexable content.
      disallow: '/playground/preview',
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}

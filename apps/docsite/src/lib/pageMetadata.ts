// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pageMetadata.ts
 *
 * Builds per-page Next.js Metadata with a consistent title, description,
 * self-referencing canonical URL, and social cards. Centralizes the boilerplate
 * every route would otherwise repeat.
 *
 * Two Next.js behaviors this encapsulates:
 *  - Metadata is shallow-merged: a route that declares `openGraph`/`twitter`
 *    REPLACES the root objects wholesale (the default social image is NOT
 *    inherited), so we always re-state the branded banner.
 *  - The root layout's title template renders the plain `title` as
 *    "<title> · Astryx". That template does NOT apply to OpenGraph/Twitter
 *    titles, so we brand those explicitly to match the browser tab.
 */

import type {Metadata} from 'next';
import {SITE_NAME} from './siteConfig';

/** Branded launch banner that matches the root layout + blog fallback card. */
const DEFAULT_OG_IMAGE =
  'https://lookaside.facebook.com/assets/astryx/Astryx-Banner.png';

export interface PageMetadataInput {
  /** Plain page title; rendered as "<title> · Astryx" via the root template. */
  title: string;
  /** Meta description, reused for the social card description. */
  description: string;
  /** Absolute path from the site root, e.g. "/components/Button". */
  path: string;
  /**
   * OpenGraph type: 'article' for content/reference pages (components, docs,
   * blog posts), 'website' for galleries and landing surfaces.
   */
  type?: 'website' | 'article';
  /** Social card image path; defaults to the branded banner. */
  image?: string;
}

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  image = DEFAULT_OG_IMAGE,
}: PageMetadataInput): Metadata {
  const socialTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
      type,
      title: socialTitle,
      description,
      url: path,
      images: [{url: image}],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [image],
    },
  };
}

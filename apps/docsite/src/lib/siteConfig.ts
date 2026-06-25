// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file siteConfig.ts
 *
 * Single source of truth for the docsite's public origin and identity.
 * Consumed by the root layout (metadataBase, OG/Twitter) and the sitemap so
 * absolute URLs stay consistent across metadata and crawler surfaces.
 *
 * Override SITE_URL per environment (e.g. preview deploys) via
 * NEXT_PUBLIC_SITE_URL; it defaults to the production domain so social
 * scrapers resolve relative OG image paths to absolute URLs.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://astryx.atmeta.com';

export const SITE_NAME = 'Astryx';
export const SITE_TITLE = 'Astryx Design System';
export const SITE_DESCRIPTION =
  'An open source design system that is fully customizable and agent ready.';

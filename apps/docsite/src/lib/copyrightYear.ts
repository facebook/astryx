// Copyright (c) Meta Platforms, Inc. and affiliates.

import {cacheLife} from 'next/cache';

/**
 * Copyright year for the site footer.
 *
 * The `latest` (server) build uses Next 16 Cache Components (`'use cache'` +
 * cacheLife), enabled by `cacheComponents: true` in next.config. The `canary`
 * build is a static export (`output: 'export'`), which cannot enable
 * cacheComponents, so `'use cache'` is invalid there — use a plain
 * implementation for that target. Both return the same value; the difference is
 * only the caching directive. See next.config.mjs / scripts/build-versioned.mjs.
 */
async function getCopyrightYearCached(): Promise<number> {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

async function getCopyrightYearStatic(): Promise<number> {
  return new Date().getFullYear();
}

export const getCopyrightYear =
  process.env.DOCSITE_TARGET === 'canary'
    ? getCopyrightYearStatic
    : getCopyrightYearCached;

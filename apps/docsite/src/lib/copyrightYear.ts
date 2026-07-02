// Copyright (c) Meta Platforms, Inc. and affiliates.

import {cacheLife} from 'next/cache';

/**
 * Copyright year for the site footer, read in a cached server function so
 * the year can be part of the prerendered HTML instead of blocking it on
 * request time. See:
 * https://nextjs.org/docs/messages/next-prerender-current-time-client
 */
export async function getCopyrightYear(): Promise<number> {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

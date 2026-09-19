// Copyright (c) Meta Platforms, Inc. and affiliates.

import {cacheLife} from 'next/cache';

/** Copyright year for the site footer. */
export async function getCopyrightYear(): Promise<number> {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

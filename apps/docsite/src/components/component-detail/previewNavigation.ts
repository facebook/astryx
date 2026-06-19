// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {MouseEvent} from 'react';

/**
 * Prevents example preview links from navigating the docsite while preserving
 * the realistic hrefs shown in the source example.
 */
export function preventPreviewNavigation(event: MouseEvent<HTMLElement>) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const anchor = target.closest('a[href]');
  if (anchor == null) {
    return;
  }

  event.preventDefault();
}

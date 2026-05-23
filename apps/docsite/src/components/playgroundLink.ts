// Copyright (c) Meta Platforms, Inc. and affiliates.

import {compressToEncodedURIComponent} from 'lz-string';

/**
 * Build a playground URL with prepopulated source code.
 */
export function buildPlaygroundHref(source: string): string {
  const compressed = compressToEncodedURIComponent(source);
  return `/playground#code=${compressed}`;
}

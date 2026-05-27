// Copyright (c) Meta Platforms, Inc. and affiliates.

import {compressToEncodedURIComponent} from 'lz-string';

/**
 * Build a playground URL with prepopulated source code.
 *
 * @param source - The source code to embed in the playground URL
 * @param opts - Optional type and name parameters for content-aware editing
 * @param opts.type - Content type: 'component' | 'template' | 'theme'
 * @param opts.name - Content name (e.g. component name, template name)
 */
export function buildPlaygroundHref(
  source: string,
  opts?: {type?: string; name?: string},
): string {
  const compressed = compressToEncodedURIComponent(source);
  const searchParams = new URLSearchParams();

  if (opts?.type) {
    searchParams.set('type', opts.type);
  }
  if (opts?.name) {
    searchParams.set('name', opts.name);
  }

  const search = searchParams.toString();
  const prefix = search ? `/playground?${search}` : '/playground';
  return `${prefix}#code=${compressed}`;
}

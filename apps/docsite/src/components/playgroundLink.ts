// Copyright (c) Meta Platforms, Inc. and affiliates.

import {compressToEncodedURIComponent} from 'lz-string';
import {stripCodeExampleCopyrightHeader} from '../lib/codeExamples';

/**
 * Build a playground URL with prepopulated source code, and optionally a
 * seeded theme. When `theme` is given (a short theme slug like "neutral"),
 * it's added as a `?theme=` query param so the playground opens with that
 * theme applied + its Theme editor populated; the code rides in the hash.
 * Repo-only copyright headers are stripped so examples open copy-ready.
 */
export function buildPlaygroundHref(source: string, theme?: string): string {
  const cleanedSource = stripCodeExampleCopyrightHeader(source);
  const compressed = compressToEncodedURIComponent(cleanedSource);
  const query = theme ? `?theme=${encodeURIComponent(theme)}` : '';
  return `/playground${query}#code=${compressed}`;
}

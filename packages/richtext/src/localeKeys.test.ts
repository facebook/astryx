// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file localeKeys.test.ts
 * @input Uses vitest, node:fs, the richtext sources and packages/core/locales/en.json
 * @output Guards that the `@astryx.richTextEditor.*` keys the sources ask for
 *   and the keys the catalog declares are exactly the same set
 * @position Testing; validates the i18n contract between packages/richtext and
 *   the core locale catalog
 *
 * A missing key never throws — the translator renders the raw key string — so
 * a typo or a rename ships a literal "@astryx.richTextEditor.bolt" into the
 * UI and every behavioral test stays green. This test is the only thing that
 * catches it.
 */

import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const SOURCES = [
  'RichTextEditor.tsx',
  'RichTextEditorToolbar.tsx',
  'RichTextView.tsx',
  'RichTextEditorAutoLinkPlugin.tsx',
];

const KEY_PATTERN = /@astryx\.richTextEditor\.[A-Za-z0-9_]+/g;
const PREFIX = '@astryx.richTextEditor.';

function read(relative: string): string {
  return readFileSync(
    fileURLToPath(new URL(relative, import.meta.url)),
    'utf8',
  );
}

const used = new Set(
  SOURCES.flatMap(file => [...read(file).matchAll(KEY_PATTERN)].map(m => m[0])),
);

const catalog = JSON.parse(read('../../core/locales/en.json')) as Record<
  string,
  unknown
>;
const declared = new Set(
  Object.keys(catalog).filter(k => k.startsWith(PREFIX)),
);

describe('richtext locale keys', () => {
  it('asks for keys the catalog actually declares', () => {
    expect([...used].filter(k => !declared.has(k)).sort()).toEqual([]);
  });

  it('declares no richtext keys the sources no longer use', () => {
    expect([...declared].filter(k => !used.has(k)).sort()).toEqual([]);
  });

  it('found keys at all (the scan is not silently empty)', () => {
    expect(used.size).toBeGreaterThan(20);
  });
});

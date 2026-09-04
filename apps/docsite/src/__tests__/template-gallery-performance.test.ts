// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the templates gallery's lightweight playground handoff.
 * @input Reads gallery, dialog, and playground source plus the URL helper.
 * @output Invariants that keep raw template source out of gallery HTML.
 * @position Docsite performance regression test for `/templates`.
 */

import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {buildTemplatePlaygroundHref} from '../components/playgroundLink';

const SRC_DIR = join(__dirname, '..');

function source(path: string): string {
  return readFileSync(join(SRC_DIR, path), 'utf8');
}

describe('template gallery playground links', () => {
  it('links by slug instead of serializing every template source', () => {
    const gallery = source('app/(site)/templates/page.tsx');
    const dialog = source('components/TemplatePreviewDialog.tsx');

    expect(gallery).toContain('buildTemplatePlaygroundHref(item.slug)');
    expect(dialog).toContain('buildTemplatePlaygroundHref(item.slug)');
    expect(gallery).not.toMatch(/source:\s*[ti]\.source/);
    expect(gallery).not.toContain('buildPlaygroundHref(item.source)');
  });

  it('lets the playground resolve the encoded template slug', () => {
    const playground = source('app/playground/PlaygroundClient.tsx');

    expect(buildTemplatePlaygroundHref('table inbox')).toBe(
      '/playground?template=table%20inbox',
    );
    expect(playground).toMatch(
      /new URLSearchParams\(window\.location\.search\)\.get\(\s*'template',?\s*\)/,
    );
    expect(playground).toContain('template => template.slug === templateSlug');
    expect(playground).toContain(
      "canonicalURL.searchParams.delete('template')",
    );
    expect(playground).toContain(
      '`${canonicalURL.pathname}${canonicalURL.search}${canonicalURL.hash}`',
    );
    expect(playground).toContain(
      'stripCodeExampleCopyrightHeader(templateSource)',
    );
  });
});

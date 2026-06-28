// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';
import {stripTemplateAssetRefs, template} from './template.mjs';

describe('stripTemplateAssetRefs', () => {
  it('replaces a lookaside astryx image URL with an inline data URI', () => {
    const src =
      "const hero = 'https://lookaside.facebook.com/assets/astryx/colorful-home-horizontal-1.png';";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces a lookaside block-avatar image URL', () => {
    const src =
      'src="https://lookaside.facebook.com/assets/astryx/avatar-profile-05.jpg"';
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces every lookaside reference, not just the first', () => {
    const src = [
      "'https://lookaside.facebook.com/assets/astryx/colorful-home-horizontal-1.png'",
      "'https://lookaside.facebook.com/assets/astryx/illustrative-horizontal-3.png'",
      "'https://lookaside.facebook.com/assets/astryx/moody-scene-horizontal-1.png'",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out.match(/data:image\/svg\+xml,/g)).toHaveLength(3);
  });

  it('preserves surrounding source structure', () => {
    const src =
      "const data = [{src: 'https://lookaside.facebook.com/assets/astryx/x.png', alt: 'X'}];";
    const out = stripTemplateAssetRefs(src);
    expect(out).toContain("alt: 'X'");
    expect(out).toContain('const data = [{src:');
  });

  it('leaves non-Meta third-party image URLs untouched', () => {
    const src = [
      'src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png"',
      'src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/visa.svg"',
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe(src);
  });

  it('leaves unrelated local paths untouched', () => {
    const src = "import x from './local.png'; const y = '/public/logo.svg';";
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe(src);
  });
});

describe('template --skeleton component extraction (prefix-agnostic)', () => {
  // Regression guard: templates author bare component names post un-prefix
  // migration (P2380608025). The extractors previously matched only the
  // `XDS`-prefixed form, so `--skeleton` returned an empty components list and
  // an empty skeleton body for bare templates.
  it('extracts components and a skeleton from a bare-named template', async () => {
    const result = await template('contact-form', {skeleton: true});

    expect(result.type).toBe('template.skeleton');
    expect(Array.isArray(result.data.components)).toBe(true);
    expect(result.data.components.length).toBeGreaterThan(0);
    // The contact-form template composes a Card + form inputs.
    expect(result.data.components).toContain('Card');
    expect(result.data.components).toContain('TextInput');

    // Skeleton body is non-empty and uses bare component tags (no XDS prefix).
    expect(result.data.skeleton.trim().length).toBeGreaterThan(0);
    expect(result.data.skeleton).toMatch(/<[A-Z]\w+/);
    expect(result.data.skeleton).not.toContain('<XDS');

    expect(result.data.skeleton).toContain('columns={{minWidth: 200}}');
  });
});

describe('Thumbnail block examples use CORS-safe demo media (BB-001 / cluster C6)', () => {
  // Thumbnail's remove-button overlay relies on useImageMode, which FETCHES the
  // image (`fetch(src, {mode: 'cors'})` → createImageBitmap → OffscreenCanvas
  // getImageData) to sample pixels for APCA contrast. A cross-origin CDN URL
  // without `Access-Control-Allow-Origin` cannot be fetched/sampled, so contrast
  // detection fails silently and logs CORS errors in hosted previews. These
  // image-backed examples must therefore use a self-contained, same-origin,
  // samplable source (a data: URI) rather than a cross-origin lookaside URL.
  const THUMBNAIL_BLOCK_DIR = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'templates',
    'blocks',
    'components',
    'Thumbnail',
  );
  const IMAGE_BACKED_EXAMPLES = [
    'ThumbnailShowcase.tsx',
    'ThumbnailDisabled.tsx',
    'ThumbnailRemovable.tsx',
    'ThumbnailStates.tsx',
    'ThumbnailGallery.tsx',
  ];

  for (const file of IMAGE_BACKED_EXAMPLES) {
    it(`${file} avoids cross-origin lookaside media and uses a samplable data URI`, () => {
      const source = fs.readFileSync(
        path.join(THUMBNAIL_BLOCK_DIR, file),
        'utf-8',
      );
      // No cross-origin CDN URL that useImageMode cannot CORS-sample.
      expect(source).not.toContain('lookaside.facebook.com');
      // Uses a self-contained, same-origin image the canvas can sample.
      expect(source).toContain('data:image/');
    });
  }
});

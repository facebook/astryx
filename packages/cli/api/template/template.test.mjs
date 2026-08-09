// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {stripTemplateAssetRefs, template} from './template.mjs';

describe('stripTemplateAssetRefs', () => {
  it('replaces a /template-assets image path with an inline data URI', () => {
    const src =
      "const hero = '/template-assets/colorful-home-horizontal-1.png';";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces a /template-assets block-avatar image path', () => {
    const src = 'src="/template-assets/avatar-profile-05.jpg"';
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces every /template-assets reference, not just the first', () => {
    const src = [
      "'/template-assets/colorful-home-horizontal-1.png'",
      "'/template-assets/illustrative-horizontal-3.png'",
      "'/template-assets/moody-scene-horizontal-1.png'",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out.match(/data:image\/svg\+xml,/g)).toHaveLength(3);
  });

  it('preserves surrounding source structure', () => {
    const src =
      "const data = [{src: '/template-assets/x.png', alt: 'X'}];";
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

  // A video source swapped for the image placeholder produces a `<video>`
  // pointed at SVG data — the scaffolded LightboxVideo block could not play.
  it('replaces a /template-assets video path with a video data URI', () => {
    const src = "src: '/template-assets/Nature-1.mp4',";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out).toContain('data:video/mp4;base64,');
    expect(out).not.toContain('data:image/svg+xml,');
  });

  it('picks the placeholder per reference when a file mixes image and video', () => {
    const src = [
      "{src: '/template-assets/light-product-1.png', type: 'image'}",
      "{src: '/template-assets/Nature-1.mp4', type: 'video'}",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out.match(/data:image\/svg\+xml,/g)).toHaveLength(1);
    expect(out.match(/data:video\/mp4;base64,/g)).toHaveLength(1);
    // Each placeholder lands on its own reference, not swapped.
    expect(out).toMatch(/data:image\/svg\+xml,[^\n]*type: 'image'/);
    expect(out).toMatch(/data:video\/mp4;base64,[^\n]*type: 'video'/);
  });

  it.each(['mp4', 'webm', 'mov', 'm4v', 'ogv'])('treats .%s as video', ext => {
    const out = stripTemplateAssetRefs(`'/template-assets/clip.${ext}'`);
    expect(out).toContain('data:video/mp4;base64,');
  });

  it('matches video extensions case-insensitively', () => {
    const out = stripTemplateAssetRefs("'/template-assets/Nature-1.MP4'");
    expect(out).toContain('data:video/mp4;base64,');
  });

  it('inlines a decodable MP4 for video references', () => {
    const out = stripTemplateAssetRefs("'/template-assets/clip.mp4'");
    const encoded = out.match(/data:video\/mp4;base64,([A-Za-z0-9+/=]+)/);
    expect(encoded).not.toBeNull();
    const bytes = Buffer.from(encoded[1], 'base64');
    // ISO base media signature + an H.264 sample entry + actual sample data.
    expect(bytes.subarray(4, 8).toString('ascii')).toBe('ftyp');
    expect(bytes.includes(Buffer.from('avc1'))).toBe(true);
    expect(bytes.includes(Buffer.from('mdat'))).toBe(true);

    // The blob is opaque to review, so assert it is internally consistent:
    // the top-level box sizes must tile the buffer exactly. A single dropped
    // or added byte anywhere inside it breaks this walk.
    const types = [];
    let offset = 0;
    while (offset < bytes.length) {
      expect(bytes.length - offset).toBeGreaterThanOrEqual(8);
      const size = bytes.readUInt32BE(offset);
      expect(size).toBeGreaterThanOrEqual(8);
      types.push(bytes.subarray(offset + 4, offset + 8).toString('ascii'));
      offset += size;
    }
    expect(offset).toBe(bytes.length);
    expect(types).toContain('moov');
    expect(types).toContain('mdat');
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

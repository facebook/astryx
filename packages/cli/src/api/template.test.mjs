// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {stripTemplateAssetRefs} from './template.mjs';

describe('stripTemplateAssetRefs', () => {
  it('replaces a /template-assets reference with an inline data URI', () => {
    const src = "const hero = '/template-assets/light-home-horizontal-1.png';";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces every reference, not just the first', () => {
    const src = [
      "'/template-assets/colorful-home-horizontal-1.png'",
      "'/template-assets/illustrative-horizontal-3.jpg'",
      "'/template-assets/moody-scene-horizontal-1.png'",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toMatch(/\/template-assets\//);
    expect(out.match(/data:image\/svg\+xml,/g)).toHaveLength(3);
  });

  it('handles both .png and .jpg extensions', () => {
    const src = "'/template-assets/a.png' '/template-assets/b.jpg'";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('.png');
    expect(out).not.toContain('.jpg');
  });

  it('leaves unrelated paths untouched', () => {
    const src = "import x from './local.png'; const y = '/public/logo.svg';";
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe(src);
  });

  it('preserves surrounding source structure', () => {
    const src = "const data = [{src: '/template-assets/x.png', alt: 'X'}];";
    const out = stripTemplateAssetRefs(src);
    expect(out).toContain("alt: 'X'");
    expect(out).toContain('const data = [{src:');
  });

  it('replaces a lookaside xds_oss image URL', () => {
    const src =
      "const hero = 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-horizontal-1.png';";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces a lookaside block-avatar image URL', () => {
    const src =
      'src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-05.jpg"';
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces both lookaside URLs and /template-assets refs in one source', () => {
    const src = [
      "'https://lookaside.facebook.com/assets/xds_oss/a.png'",
      "'/template-assets/b.jpg'",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out).not.toMatch(/\/template-assets\//);
    expect(out.match(/data:image\/svg\+xml,/g)).toHaveLength(2);
  });

  it('leaves non-lookaside external image URLs untouched', () => {
    const src = [
      "src=\"https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png\"",
      "src=\"https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/visa.svg\"",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe(src);
  });
});

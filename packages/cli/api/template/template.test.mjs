// Copyright (c) Meta Platforms, Inc. and affiliates.

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

// =============================================================================
// Public API surface for block discovery (#1901)
// =============================================================================

describe('findRelatedBlocks through the public API', () => {
  it('is re-exported from @astryxdesign/cli/api', async () => {
    // The docsite needed the blocks that use a component and had to read
    // node_modules/@astryxdesign/cli/templates/... by hand, because
    // findRelatedBlocks lived in template.mjs and the package `exports` field
    // only opens ./api and ./json.
    const api = await import('../index.mjs');
    expect(typeof api.findRelatedBlocks).toBe('function');
  });

  it('returns the blocks that compose the named component', async () => {
    const api = await import('../index.mjs');
    const blocks = await api.findRelatedBlocks('AlertDialog');

    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(block.componentsUsed).toContain('AlertDialog');
    }
  });

  it('matches the component name case-insensitively', async () => {
    const api = await import('../index.mjs');
    const lower = await api.findRelatedBlocks('alertdialog');
    const exact = await api.findRelatedBlocks('AlertDialog');
    expect(lower.map(b => b.dirName).sort()).toEqual(
      exact.map(b => b.dirName).sort(),
    );
  });

  it('returns an empty list for a component no block composes', async () => {
    const api = await import('../index.mjs');
    expect(await api.findRelatedBlocks('NotAComponentName')).toEqual([]);
  });
});

describe('template list block metadata (#1901)', () => {
  it('reports isShowcase on block entries so consumers can filter the hero', async () => {
    const result = await template(undefined, {list: true});
    const blocks = result.data.filter(t => t.type === 'block');

    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(typeof block.isShowcase).toBe('boolean');
    }
    // At least one real showcase exists, otherwise the flag is useless.
    expect(blocks.some(b => b.isShowcase === true)).toBe(true);
  });

  it('keeps category and componentsUsed on block entries', async () => {
    const result = await template(undefined, {list: true});
    const block = result.data.find(
      t => t.id === 'AlertDialogDeleteConfirmation',
    );

    expect(block.category).toBe('components/AlertDialog');
    expect(block.componentsUsed).toContain('AlertDialog');
  });

  it('omits isShowcase on page templates, where it has no meaning', async () => {
    const result = await template(undefined, {list: true});
    const page = result.data.find(t => t.type === 'page');

    expect(page).toBeDefined();
    expect(page.isShowcase).toBeUndefined();
  });
});

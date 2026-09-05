// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
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

  it('strips a /template-assets .mp4 source to an empty string, not the image data URI (#4780)', () => {
    const src = "src: '/template-assets/Nature-1.mp4',";
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe("src: '',");
    expect(out).not.toContain('data:image/svg+xml,');
    expect(out).not.toContain('/template-assets/');
  });

  it('strips other video extensions (.webm, .mov, .ogv) the same way', () => {
    for (const ext of ['webm', 'mov', 'ogv']) {
      const src = `src: '/template-assets/clip.${ext}',`;
      const out = stripTemplateAssetRefs(src);
      expect(out).toBe("src: '',");
    }
  });

  it('still replaces an adjacent image reference with the placeholder when a video reference is also present', () => {
    const src = [
      "poster: '/template-assets/Nature-1-poster.jpg',",
      "src: '/template-assets/Nature-1.mp4',",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).toContain('data:image/svg+xml,');
    expect(out).toContain("src: '',");
  });
});

describe('template --skeleton component extraction (prefix-agnostic)', () => {
  // Regression guard: templates author bare component names post un-prefix
  // migration (P2380608025). The extractors previously matched only the
  // `XDS`-prefixed form, so `--skeleton` returned an empty components list and
  // an empty skeleton body for bare templates.
  it('extracts components and a skeleton from a bare-named template', async () => {
    // Builds the resolvable-component index over the real core once; that
    // pass can take several seconds under parallel test workers.
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
    // Allow generous time for the one-time index build (see above).
  }, 60000);
});

describe('template --skeleton advertises only resolvable components', () => {
  // Regression guard for #4677: template skeletons previously advertised
  // every JSX tag found in the source (local helpers like TimelineSection
  // -> Timeline, third-party tags like recharts Line/Bar, type-only names,
  // undocumented exports like HStack/VStack) even when `astryx component
  // <Name>` could not resolve them. Now filtered against the exact
  // resolution index (listResolvableComponentNames), which mirrors
  // `astryx component <Name>`: core/integration/external docs plus
  // parent-doc subcomponents, no fuzzy suffix matching.
  it('no built-in template advertises unresolvable components', async () => {
    const {
      discoverTemplates,
      extractComponents,
      listResolvableComponentNames,
    } = await import('./template.mjs');
    const templates = await discoverTemplates();
    const builtin = templates.filter(t => !t.package);
    const registry = await listResolvableComponentNames();
    expect(registry).toBeTruthy();
    for (const tmpl of builtin) {
      const components = extractComponents(tmpl.filePath, registry);
      for (const comp of components) {
        expect(registry.has(comp)).toBe(true);
      }
    }
    // Sanity: the sweep is meaningful (registry + templates resolved).
    expect(registry.size).toBeGreaterThan(0);
    expect(builtin.length).toBeGreaterThan(0);
  });

  it('extractComponents keeps exact names: parent-doc subcomponents stay, locals are never rewritten', async () => {
    // The old registry path fuzzy-stripped suffixes (StackItem -> Stack,
    // TimelineSection -> Timeline). With the exact-resolution index a name is
    // advertised iff `astryx component <Name>` resolves it as-is, so
    // StackItem (a parent-doc subcomponent) must survive verbatim while a
    // local helper that merely contains a resolvable name must not masquerade
    // as that component.
    const {extractComponents} = await import('./template.mjs');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-extract-'));
    const file = path.join(dir, 'Page.tsx');
    fs.writeFileSync(
      file,
      [
        'function TimelineSection() { return null; }',
        'export default function Page() {',
        '  return <StackItem /><TimelineSection /><Timeline /><Badge />;',
        '}',
      ].join('\n'),
    );
    try {
      const known = new Set(['StackItem', 'Timeline', 'Badge']);
      const comps = extractComponents(file, known);
      expect(comps).toEqual(['Badge', 'StackItem', 'Timeline']);
      expect(comps).not.toContain('TimelineSection');
      // Unfiltered mode still reports everything (back-compat).
      expect(extractComponents(file)).toContain('TimelineSection');
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });
});

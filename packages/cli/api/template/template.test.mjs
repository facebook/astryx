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
    const src = "const data = [{src: '/template-assets/x.png', alt: 'X'}];";
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
    // Component names resolve per-name against the filesystem (no
    // whole-index build), so this stays fast under parallel test workers.
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
  }, 60000);
});

describe('template --skeleton advertises only resolvable components', () => {
  // Regression guard for #4677: template skeletons previously advertised
  // every JSX tag found in the source (local helpers like TimelineSection
  // -> Timeline, third-party tags like recharts Line/Bar, type-only names,
  // undocumented exports like HStack/VStack) even when `astryx component
  // <Name>` could not resolve them. Now filtered through the exact
  // resolvability oracle (isResolvableComponentName), which mirrors
  // `astryx component <Name>`: core/integration/external docs plus
  // source/parent-doc fallbacks, no fuzzy suffix matching.
  it('no built-in template advertises unresolvable components', async () => {
    const {discoverTemplates, extractComponents, isResolvableComponentName} =
      await import('./template.mjs');
    const {resolveComponentOwners} =
      await import('../../foundation/discovery/component-discovery.mjs');
    const {findCoreDir} = await import('../../foundation/fs/paths.mjs');
    const cwd = process.cwd();
    const coreDir = findCoreDir(cwd);
    if (coreDir === null) throw new Error(`core not found under ${cwd}`);
    const isResolvable = name =>
      isResolvableComponentName(name, {
        coreDir,
        loadedIntegrations: [],
        cwd,
      });
    const templates = await discoverTemplates();
    const builtin = templates.filter(t => !t.package);
    let advertised = 0;
    for (const tmpl of builtin) {
      const components = extractComponents(tmpl.filePath, isResolvable);
      for (const comp of components) {
        expect(isResolvable(comp)).toBe(true);
        // Response contract (template.doc.mjs): the advertised name resolves
        // through the same owner set `astryx component` uses — exactly one
        // owner, so no ambiguous name is ever advertised.
        expect(resolveComponentOwners(coreDir, comp, []).length).toBe(1);
        advertised += 1;
      }
    }
    // Sanity: the sweep is meaningful (templates resolved, names advertised).
    expect(builtin.length).toBeGreaterThan(0);
    expect(advertised).toBeGreaterThan(0);
  });

  it('ambiguous names are not advertised when an integration also owns them', async () => {
    // `astryx component Card` rejects as ambiguous when an integration owns
    // Card alongside core, so the skeleton list must not advertise it there.
    const {isResolvableComponentName} = await import('./template.mjs');
    const {findCoreDir} = await import('../../foundation/fs/paths.mjs');
    const cwd = process.cwd();
    const coreDir = findCoreDir(cwd);
    if (coreDir === null) throw new Error(`core not found under ${cwd}`);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-owners-'));
    fs.writeFileSync(
      path.join(dir, 'Card.doc.mjs'),
      'export default {name: "Card"};\n',
    );
    try {
      const integration = {name: 'test-integration', components: dir};
      expect(
        isResolvableComponentName('Card', {
          coreDir,
          loadedIntegrations: [integration],
          cwd,
        }),
      ).toBe(false);
      expect(
        isResolvableComponentName('Card', {
          coreDir,
          loadedIntegrations: [],
          cwd,
        }),
      ).toBe(true);
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });

  it('same-named integrations with different roots resolve independently', async () => {
    // One process can query two projects whose same-named integrations
    // resolve from different roots. The memo key carries the roots, so the
    // ambiguous answer for one project never leaks into the other.
    const {isResolvableComponentName} = await import('./template.mjs');
    const {findCoreDir} = await import('../../foundation/fs/paths.mjs');
    const cwd = process.cwd();
    const coreDir = findCoreDir(cwd);
    if (coreDir === null) throw new Error(`core not found under ${cwd}`);
    const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'template-roots-a-'));
    const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'template-roots-b-'));
    fs.writeFileSync(
      path.join(dirA, 'Card.doc.mjs'),
      'export default {name: "Card"};\n',
    );
    try {
      const ambiguous = {name: 'test-integration', components: dirA};
      const coreOnly = {name: 'test-integration', components: dirB};
      expect(
        isResolvableComponentName('Card', {
          coreDir,
          loadedIntegrations: [ambiguous],
          cwd,
        }),
      ).toBe(false);
      expect(
        isResolvableComponentName('Card', {
          coreDir,
          loadedIntegrations: [coreOnly],
          cwd,
        }),
      ).toBe(true);
    } finally {
      fs.rmSync(dirA, {recursive: true, force: true});
      fs.rmSync(dirB, {recursive: true, force: true});
    }
  });

  it('legacy externals resolve per cwd, not across projects', async () => {
    // Project A resolves TimelineSection from a legacy pkg.astryx.docs
    // package; project B shares the core but has no such package, so the
    // memoized answer for A must not leak into B.
    const {isResolvableComponentName} = await import('./template.mjs');
    const {findCoreDir} = await import('../../foundation/fs/paths.mjs');
    const coreDir = findCoreDir(process.cwd());
    if (coreDir === null) throw new Error('core not found');
    const projA = fs.mkdtempSync(path.join(os.tmpdir(), 'template-ext-a-'));
    const projB = fs.mkdtempSync(path.join(os.tmpdir(), 'template-ext-b-'));
    const pkgDir = path.join(projA, 'node_modules', 'fake-pkg');
    const docsDir = path.join(pkgDir, 'docs');
    fs.mkdirSync(docsDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name: 'fake-pkg', astryx: {docs: 'docs'}}),
    );
    fs.writeFileSync(
      path.join(docsDir, 'TimelineSection.doc.mjs'),
      'export default {name: "TimelineSection"};\n',
    );
    try {
      expect(
        isResolvableComponentName('TimelineSection', {
          coreDir,
          loadedIntegrations: [],
          cwd: projA,
        }),
      ).toBe(true);
      expect(
        isResolvableComponentName('TimelineSection', {
          coreDir,
          loadedIntegrations: [],
          cwd: projB,
        }),
      ).toBe(false);
    } finally {
      fs.rmSync(projA, {recursive: true, force: true});
      fs.rmSync(projB, {recursive: true, force: true});
    }
  });

  it('source/parent-doc resolvable names are kept, not omitted (#4677)', async () => {
    // Positive-omission guard: names the exact resolver serves must appear.
    // `AppShellMobileContext` has a source file but no doc of its own (the
    // parent AppShell.doc.mjs covers it); `NavHeadingMenuItem` likewise
    // resolves through the parent NavMenu doc. A filename-heuristic filter
    // dropped both; the exact oracle keeps them.
    const skeleton = await template('MobileNavToggleBasic', {skeleton: true});
    expect(skeleton.data.components).toContain('AppShellMobileContext');
    const show = await template('NavHeadingMenuShowcase', {show: true});
    expect(show.data.components).toContain('NavHeadingMenuItem');
    // ...while a local helper never masquerades as the resolvable base
    // name: detail-page renders a local TimelineSection, which must not
    // surface as Timeline.
    const detail = await template('detail-page', {skeleton: true});
    expect(detail.data.components).not.toContain('Timeline');
    expect(detail.data.components).not.toContain('TimelineSection');
  }, 60000);

  it('extractComponents keeps exact names: parent-doc subcomponents stay, locals are never rewritten', async () => {
    // The old registry path fuzzy-stripped suffixes (StackItem -> Stack,
    // TimelineSection -> Timeline). With the exact resolvability oracle a
    // name is advertised iff `astryx component <Name>` resolves it as-is, so
    // ResizeHandle (a parent-doc subcomponent) must survive verbatim while a
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
        '  return <ResizeHandle /><TimelineSection /><Timeline /><Badge />;',
        '}',
      ].join('\n'),
    );
    try {
      const known = new Set(['ResizeHandle', 'Timeline', 'Badge']);
      const comps = extractComponents(file, known);
      expect(comps).toEqual(['Badge', 'ResizeHandle', 'Timeline']);
      expect(comps).not.toContain('TimelineSection');
      // Unfiltered mode keeps upstream's base-name normalization
      // (TimelineSection -> Timeline, c6041cfd); the exact-name contract
      // above is what the filtered mode owns.
      expect(extractComponents(file)).toEqual([
        'Badge',
        'ResizeHandle',
        'Timeline',
      ]);
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });
});

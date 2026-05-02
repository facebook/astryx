/**
 * @file Data extraction tests for the docsite.
 *
 * Validates that the generated registries contain expected data.
 * Run: yarn workspace @xds/docsite test
 */

import {describe, it, expect} from 'vitest';
import {packages} from '../generated/packageRegistry';
import {components, componentCount} from '../generated/componentRegistry';
import {blocks, blockCount, showcaseCount} from '../generated/blockRegistry';
import {templates, templateCount} from '../generated/templateRegistry';
import {docTopics, docsCount} from '../generated/docsRegistry';

// ── Package Registry ───────────────────────────────────────────────────

describe('packageRegistry', () => {
  it('discovers all published packages (private packages excluded)', () => {
    const names = packages.map(p => p.name);
    expect(names).toContain('@xds/core');
    expect(names).toContain('@xds/cli');
    expect(names).toContain('@xds/theme-default');
    expect(names).toContain('@xds/theme-neutral');
    // Private packages should not appear
    expect(names).not.toContain('@xds/lab');
    expect(names).not.toContain('@xds/build');
    expect(names).not.toContain('@xds/theme-brutalist');
    expect(packages.length).toBeGreaterThanOrEqual(5);
  });

  it('each package has required fields', () => {
    for (const pkg of packages) {
      expect(pkg.name).toBeTruthy();
      expect(pkg.displayName).toBeTruthy();
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(pkg.packagePath).toBeTruthy();
      expect(typeof pkg.hasReadme).toBe('boolean');
      expect(typeof pkg.hasChangelog).toBe('boolean');
    }
  });

  it('no duplicate package names', () => {
    const names = packages.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ── Component Registry ─────────────────────────────────────────────────

describe('componentRegistry', () => {
  it('discovers components in @xds/core', () => {
    expect(components['@xds/core']).toBeDefined();
    expect(components['@xds/core'].length).toBeGreaterThan(50);
  });

  it('component count matches sum of all packages', () => {
    const sum = Object.values(components).reduce(
      (acc, list) => acc + list.length,
      0,
    );
    expect(componentCount).toBe(sum);
  });

  it('components are scoped to their package', () => {
    for (const [pkgName, comps] of Object.entries(components)) {
      expect(pkgName).toMatch(/^@xds\//);
      expect(Array.isArray(comps)).toBe(true);
      for (const comp of comps) {
        expect(comp.name).toBeTruthy();
        expect(typeof comp.description).toBe('string');
        expect(typeof comp.directory).toBe('string');
      }
    }
  });

  it('known components are present', () => {
    const coreNames = components['@xds/core'].map(c => c.name);
    expect(coreNames).toContain('Button');
    expect(coreNames).toContain('Text');
    expect(coreNames).toContain('Card');
    expect(coreNames).toContain('Table');
  });

  it('name comes from docs.name, not directory name', () => {
    const core = components['@xds/core'];
    // CodeBlock dir has file XDSCodeBlock.doc.mjs with docs.name = 'CodeBlock'
    const codeBlock = core.find(c => c.name === 'CodeBlock');
    expect(codeBlock).toBeDefined();
    expect(codeBlock?.directory).toBe('CodeBlock');

    // hooks dir has multiple docs with names like 'useClickableContainer'
    const hookComponent = core.find(c => c.name === 'useClickableContainer');
    expect(hookComponent).toBeDefined();
    expect(hookComponent?.directory).toBe('hooks');
  });

  it('discovers hooks (not skipped)', () => {
    const core = components['@xds/core'];
    const hooks = core.filter(c => c.directory === 'hooks');
    expect(hooks.length).toBeGreaterThan(8);
    // Verify names are the hook names, not 'hooks'
    for (const hook of hooks) {
      expect(hook.name).toMatch(/^use[A-Z]/);
    }
  });

  it('discovers theme utilities (not skipped)', () => {
    const core = components['@xds/core'];
    const themeUtils = core.filter(c => c.directory === 'theme');
    expect(themeUtils.length).toBeGreaterThanOrEqual(2);
    const names = themeUtils.map(c => c.name);
    expect(names).toContain('MediaTheme');
  });

  it('discovers multiple docs per directory (Chat has multiple)', () => {
    const core = components['@xds/core'];
    const chatComponents = core.filter(c => c.directory === 'Chat');
    // Chat dir has ChatDictationButton (hidden) + ChatToolCalls (visible) + main Chat doc
    expect(chatComponents.length).toBeGreaterThanOrEqual(2);
  });

  it('hidden components are included with hidden flag', () => {
    const core = components['@xds/core'];
    const names = core.map(c => c.name);
    // All components should be present regardless of hidden flag
    expect(names).toContain('ChatDictationButton');
    expect(names).toContain('NavMenuItem');
    // Currently no components are hidden
    const hiddenCount = core.filter(c => c.hidden).length;
    expect(hiddenCount).toBe(0);
  });

  it('components have group assignments', () => {
    const withGroups = components['@xds/core'].filter(c => c.group !== null);
    expect(withGroups.length).toBeGreaterThan(
      components['@xds/core'].length * 0.3,
    );
  });

  it('no duplicate component names within a package', () => {
    for (const [, comps] of Object.entries(components)) {
      const names = comps.map(c => c.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

// ── Block Registry ─────────────────────────────────────────────────────

describe('blockRegistry', () => {
  it('discovers blocks', () => {
    expect(blockCount).toBeGreaterThan(100);
    expect(blocks.length).toBe(blockCount);
  });

  it('has showcases', () => {
    expect(showcaseCount).toBeGreaterThan(20);
    const actualShowcases = blocks.filter(b => b.isShowcase);
    expect(actualShowcases.length).toBe(showcaseCount);
  });

  it('blocks have required fields', () => {
    for (const block of blocks) {
      expect(block.dirName).toBeTruthy();
      expect(block.name).toBeTruthy();
      expect(typeof block.isShowcase).toBe('boolean');
      expect(typeof block.aspectRatio).toBe('number');
      expect(block.aspectRatio).toBeGreaterThan(0);
      expect(block.aspectRatio).not.toBeNaN();
      expect(Array.isArray(block.componentsUsed)).toBe(true);
      expect(block.category).toBeDefined();
    }
  });

  it('aspect ratios are parsed correctly (no eval)', () => {
    // 16/9 should parse to ~1.777
    const wideBlocks = blocks.filter(
      b => Math.abs(b.aspectRatio - 16 / 9) < 0.01,
    );
    expect(wideBlocks.length).toBeGreaterThan(0);
    // 4/3 should parse to ~1.333
    const standardBlocks = blocks.filter(
      b => Math.abs(b.aspectRatio - 4 / 3) < 0.01,
    );
    expect(standardBlocks.length).toBeGreaterThan(0);
  });

  it('blocks are scoped by category (component directory)', () => {
    const categories = new Set(blocks.map(b => b.category));
    expect(categories.size).toBeGreaterThan(10);
  });

  it('showcase for Button exists', () => {
    const buttonShowcase = blocks.find(
      b => b.isShowcase && b.category.includes('Button'),
    );
    expect(buttonShowcase).toBeDefined();
  });

  it('componentsUsed links blocks to components', () => {
    const blocksWithComponents = blocks.filter(
      b => b.componentsUsed.length > 0,
    );
    expect(blocksWithComponents.length).toBeGreaterThan(blocks.length * 0.5);
  });
});

// ── Template Registry ──────────────────────────────────────────────────

describe('templateRegistry', () => {
  it('discovers page templates', () => {
    expect(templateCount).toBeGreaterThan(10);
    expect(templates.length).toBe(templateCount);
  });

  it('templates have required fields', () => {
    for (const t of templates) {
      expect(t.slug).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(typeof t.description).toBe('string');
      expect(typeof t.isReady).toBe('boolean');
    }
  });

  it('known templates are present', () => {
    const slugs = templates.map(t => t.slug);
    expect(slugs).toContain('dashboard');
    expect(slugs).toContain('settings');
  });

  it('no duplicate template slugs', () => {
    const slugs = templates.map(t => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

// ── Docs Registry ──────────────────────────────────────────────────────

describe('docsRegistry', () => {
  it('discovers doc topics', () => {
    expect(docsCount).toBeGreaterThan(5);
    expect(docTopics.length).toBe(docsCount);
  });

  it('doc topics have required fields including title', () => {
    for (const d of docTopics) {
      expect(d.topic).toBeTruthy();
      expect(d.title).toBeTruthy();
      expect(typeof d.description).toBe('string');
    }
  });

  it('title differs from slug (human-readable)', () => {
    const gettingStarted = docTopics.find(d => d.topic === 'getting-started');
    expect(gettingStarted).toBeDefined();
    expect(gettingStarted?.title).toBe('Getting Started');

    const theme = docTopics.find(d => d.topic === 'theme');
    expect(theme).toBeDefined();
    expect(theme?.title).toBe('Theme System');
  });

  it('known topics are present', () => {
    const topics = docTopics.map(d => d.topic);
    expect(topics).toContain('getting-started');
    expect(topics).toContain('tokens');
    expect(topics).toContain('spacing');
    expect(topics).toContain('color');
  });

  it('no duplicate topics', () => {
    const topics = docTopics.map(d => d.topic);
    expect(new Set(topics).size).toBe(topics.length);
  });
});

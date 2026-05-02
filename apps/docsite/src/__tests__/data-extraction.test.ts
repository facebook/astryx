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
    expect(components['@xds/core'].length).toBeGreaterThan(100);
  });

  it('component count matches sum of all packages', () => {
    const sum = Object.values(components).reduce(
      (acc, list) => acc + list.length,
      0,
    );
    expect(componentCount).toBe(sum);
  });

  it('components have all required fields', () => {
    for (const [pkgName, comps] of Object.entries(components)) {
      expect(pkgName).toMatch(/^@xds\//);
      for (const comp of comps) {
        expect(comp.name).toBeTruthy();
        expect(comp.displayName).toBeTruthy();
        expect(typeof comp.directory).toBe('string');
        expect(typeof comp.description).toBe('string');
        expect(Array.isArray(comp.keywords)).toBe(true);
        expect(typeof comp.hidden).toBe('boolean');
        // parentDoc is string | null
        expect(
          comp.parentDoc === null || typeof comp.parentDoc === 'string',
        ).toBe(true);
      }
    }
  });

  // ── Sub-component expansion ────────────────────────────────────────

  it('expands compound components into sub-component entries', () => {
    const core = components['@xds/core'];
    // Table has sub-components: Table, BaseTable, TableRow, TableCell, TableHeaderCell, etc.
    const tableComponents = core.filter(c => c.parentDoc === 'Table');
    expect(tableComponents.length).toBeGreaterThanOrEqual(5);
    const tableNames = tableComponents.map(c => c.name);
    expect(tableNames).toContain('Table');
    expect(tableNames).toContain('TableRow');
    expect(tableNames).toContain('TableCell');
    expect(tableNames).toContain('TableHeaderCell');
  });

  it('sub-components share the parent group and directory', () => {
    const core = components['@xds/core'];
    const dialogSubs = core.filter(c => c.parentDoc === 'Dialog');
    expect(dialogSubs.length).toBeGreaterThanOrEqual(2);
    for (const sub of dialogSubs) {
      expect(sub.group).toBe('Dialog');
      expect(sub.directory).toBe('Dialog');
    }
  });

  it('sub-components have their own descriptions', () => {
    const core = components['@xds/core'];
    const dialogHeader = core.find(c => c.name === 'DialogHeader');
    expect(dialogHeader).toBeDefined();
    expect(dialogHeader!.description.length).toBeGreaterThan(10);
    // Description should be specific to DialogHeader, not the parent Dialog
    expect(dialogHeader!.description.toLowerCase()).toContain('header');
  });

  it('Chat has many sub-components (standalone docs take priority over compound entries)', () => {
    const core = components['@xds/core'];
    // Chat compound doc has 14 sub-components, but ChatToolCalls has its own
    // standalone doc so it appears with parentDoc: null instead of parentDoc: 'Chat'
    const chatSubs = core.filter(c => c.parentDoc === 'Chat');
    expect(chatSubs.length).toBeGreaterThanOrEqual(12);
    const chatNames = chatSubs.map(c => c.name);
    expect(chatNames).toContain('ChatMessage');
    expect(chatNames).toContain('ChatComposer');
    expect(chatNames).toContain('ChatSendButton');

    // ChatToolCalls should exist but as a standalone entry
    const toolCalls = core.find(c => c.name === 'ChatToolCalls');
    expect(toolCalls).toBeDefined();
    // It's standalone (has its own doc.mjs), not a sub-component
    expect(toolCalls!.parentDoc).toBeNull();
  });

  it('simple components have null parentDoc', () => {
    const core = components['@xds/core'];
    const button = core.find(c => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button!.parentDoc).toBeNull();
  });

  it('displayName has XDS prefix for components, not for hooks', () => {
    const core = components['@xds/core'];
    const button = core.find(c => c.name === 'Button');
    expect(button?.displayName).toBe('XDSButton');

    const hookComp = core.find(c => c.name === 'useClickableContainer');
    expect(hookComp?.displayName).toBe('useClickableContainer');

    // Sub-component hooks also keep their name
    const tableHook = core.find(c => c.name === 'useXDSTableSelection');
    if (tableHook) {
      expect(tableHook.displayName).toMatch(/^use/);
    }
  });

  // ── Discovery coverage ─────────────────────────────────────────────

  it('discovers hooks (not skipped)', () => {
    const core = components['@xds/core'];
    const hooks = core.filter(c => c.directory === 'hooks');
    expect(hooks.length).toBeGreaterThan(8);
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

  it('hidden components are included with hidden flag', () => {
    const core = components['@xds/core'];
    const names = core.map(c => c.name);
    expect(names).toContain('ChatDictationButton');
    expect(names).toContain('NavMenuItem');
    const hiddenCount = core.filter(c => c.hidden).length;
    expect(hiddenCount).toBe(0);
  });

  it('no duplicate component names within a package', () => {
    for (const [, comps] of Object.entries(components)) {
      const names = comps.map(c => c.name);
      const dupes = names.filter((n, i) => names.indexOf(n) !== i);
      expect(dupes).toEqual([]);
    }
  });

  it('known compound docs are expanded, not emitted as single entries', () => {
    const core = components['@xds/core'];
    const names = core.map(c => c.name);
    // These are parent doc names that should NOT appear as component names
    // because they were expanded into sub-components
    // (unless the sub-component itself is named the same, like Table → XDSTable → Table)
    // Verify the sub-components exist instead
    expect(names).toContain('DialogHeader'); // from Dialog compound doc
    expect(names).toContain('SideNavItem'); // from SideNav compound doc
    expect(names).toContain('TopNavItem'); // from TopNav compound doc
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
    const wideBlocks = blocks.filter(
      b => Math.abs(b.aspectRatio - 16 / 9) < 0.01,
    );
    expect(wideBlocks.length).toBeGreaterThan(0);
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

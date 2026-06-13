// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Data extraction tests for the docsite.
 *
 * Validates that the generated registries contain expected data.
 * Run: pnpm -F @xds/docsite test
 */

import * as fs from 'node:fs';
import {describe, it, expect} from 'vitest';
import {packages} from '../generated/packageRegistry';
import {components, componentCount} from '../generated/componentRegistry';
import {blocks, blockCount, showcaseCount} from '../generated/blockRegistry';
import {templates, templateCount} from '../generated/templateRegistry';
import {docTopics, docsCount} from '../generated/docsRegistry';
import {showcaseRegistry} from '../generated/showcaseRegistry';
import {exampleRegistry} from '../generated/exampleRegistry';

// ── Package Registry ───────────────────────────────────────────────────

describe('packageRegistry', () => {
  it('discovers installed packages (private and uninstalled excluded)', () => {
    const names = packages.map(p => p.name);
    expect(names).toContain('@xds/core');
    expect(names).toContain('@xds/cli');
    expect(names).toContain('@xds/theme-default');
    expect(names).toContain('@xds/theme-neutral');
    expect(names).toContain('@xds/theme-gothic');
    expect(names).toContain('@xds/theme-stone');
    expect(names).not.toContain('@xds/theme-brutalist');
    expect(names).not.toContain('@xds/theme-chocolate');
    expect(names).not.toContain('@xds/theme-daily');
    expect(names).not.toContain('@xds/lab');
    expect(names).not.toContain('@xds/build');
    expect(packages.length).toBeGreaterThanOrEqual(5);
  });

  it('only includes packages listed in docsite dependencies', () => {
    const docsitePkg = JSON.parse(
      fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
    );
    const docsiteDeps = {
      ...docsitePkg.dependencies,
      ...docsitePkg.devDependencies,
    };
    for (const pkg of packages) {
      expect(docsiteDeps[pkg.name]).toBeDefined();
    }
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

  it('packages with READMEs have readme content', () => {
    for (const pkg of packages) {
      if (pkg.hasReadme) {
        expect(pkg.readme).toBeTruthy();
        expect(typeof pkg.readme).toBe('string');
        expect(pkg.readme!.length).toBeGreaterThan(50);
      } else {
        expect(pkg.readme).toBeNull();
      }
    }
  });

  it('packages with CHANGELOGs have changelog content', () => {
    for (const pkg of packages) {
      if (pkg.hasChangelog) {
        expect(pkg.changelog).toBeTruthy();
        expect(typeof pkg.changelog).toBe('string');
        expect(pkg.changelog!.length).toBeGreaterThan(50);
      } else {
        expect(pkg.changelog).toBeNull();
      }
    }
  });

  it('CLI package has a substantial README', () => {
    const cli = packages.find(p => p.name === '@xds/cli');
    expect(cli?.readme).toBeTruthy();
    expect(cli!.readme!.length).toBeGreaterThan(1000);
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
        expect(comp.moduleName).toBeTruthy();
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

  it('sub-components can override inherited playground defaults', () => {
    const core = components['@xds/core'];
    const avatarGroupOverflow = core.find(
      c => c.name === 'AvatarGroupOverflow',
    );
    expect(avatarGroupOverflow).toBeDefined();
    expect(avatarGroupOverflow!.playground?.defaults).toMatchObject({
      count: 2,
      children: '+2',
    });
  });

  it('Chat has many sub-components (standalone docs take priority over compound entries)', () => {
    const core = components['@xds/core'];
    // Chat compound doc has 14 sub-components, but ChatToolCalls and
    // ChatDictationButton have their own standalone docs so they appear
    // with parentDoc: null instead of parentDoc: 'Chat'
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

  it('moduleName has XDS prefix for components, not for hooks', () => {
    const core = components['@xds/core'];
    const button = core.find(c => c.name === 'Button');
    expect(button?.moduleName).toBe('XDSButton');

    const hookComp = core.find(c => c.name === 'useClickableContainer');
    expect(hookComp?.moduleName).toBe('useClickableContainer');

    // Sub-component hooks also keep their name
    const tableHook = core.find(c => c.name === 'useXDSTableSelection');
    if (tableHook) {
      expect(tableHook.moduleName).toMatch(/^use/);
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

  it('renders useXDS hook pages as hook docs with examples', () => {
    const core = components['@xds/core'];
    const hooks = core.filter(c => c.name.startsWith('useXDS'));
    expect(hooks.length).toBeGreaterThan(15);
    expect(hooks.map(h => h.name)).toContain('useXDSTheme');

    for (const hook of hooks) {
      expect(hook.params).not.toBeNull();
      expect(hook.returns).not.toBeNull();
      expect(hook.props).toHaveLength(0);
      expect(exampleRegistry[hook.name]?.length ?? 0).toBeGreaterThan(0);
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
    expect(names).toContain('NavHeadingMenu');
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

  // ── Full doc extraction ──────────────────────────────────────────

  it('extracts props for standalone components', () => {
    const core = components['@xds/core'];
    const button = core.find(c => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button!.props.length).toBeGreaterThan(5);
    const labelProp = button!.props.find(p => p.name === 'label');
    expect(labelProp).toBeDefined();
    expect(labelProp!.type).toBe('string');
    expect(labelProp!.required).toBe(true);
  });

  it('extracts props for sub-components in compound docs', () => {
    const core = components['@xds/core'];
    const dialog = core.find(c => c.name === 'Dialog');
    expect(dialog).toBeDefined();
    expect(dialog!.props.length).toBeGreaterThan(3);
    const isOpenProp = dialog!.props.find(p => p.name === 'isOpen');
    expect(isOpenProp).toBeDefined();
    expect(isOpenProp!.required).toBe(true);
  });

  it('extracts usage with bestPractices and anatomy', () => {
    const core = components['@xds/core'];
    const button = core.find(c => c.name === 'Button');
    expect(button!.usage).toBeDefined();
    expect(button!.usage!.description.length).toBeGreaterThan(20);
    expect(button!.usage!.bestPractices).toBeDefined();
    expect(button!.usage!.bestPractices!.length).toBeGreaterThanOrEqual(3);
    expect(button!.usage!.anatomy).toBeDefined();
    expect(button!.usage!.anatomy!.length).toBeGreaterThanOrEqual(2);
  });

  it('extracts theming data', () => {
    const core = components['@xds/core'];
    const button = core.find(c => c.name === 'Button');
    expect(button!.theming).toBeDefined();
    expect(button!.theming!.targets.length).toBeGreaterThanOrEqual(1);
    expect(button!.theming!.targets[0].className).toBe('xds-button');
    expect(button!.theming!.vars).toBeDefined();
    expect(button!.theming!.vars!.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts hook params and returns', () => {
    const core = components['@xds/core'];
    const hook = core.find(c => c.name === 'useMediaQuery');
    expect(hook).toBeDefined();
    expect(hook!.params).toBeDefined();
    expect(hook!.params!.length).toBeGreaterThanOrEqual(1);
    expect(hook!.params![0].name).toBe('query');
    expect(hook!.returns).toBeDefined();
    expect(hook!.returns!.length).toBeGreaterThanOrEqual(1);
  });

  it('components without props have empty props array', () => {
    const core = components['@xds/core'];
    for (const comp of core) {
      expect(Array.isArray(comp.props)).toBe(true);
    }
  });

  it('most standalone components have usage data', () => {
    const core = components['@xds/core'];
    const standalone = core.filter(c => c.parentDoc === null);
    const withUsage = standalone.filter(c => c.usage != null);
    // At least 80% should have usage docs
    expect(withUsage.length / standalone.length).toBeGreaterThan(0.8);
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
      expect(typeof block.exampleFor).toBe('string');
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
      b => b.isShowcase && b.exampleFor === 'Button',
    );
    expect(buttonShowcase).toBeDefined();
  });

  it('every block has exampleFor set', () => {
    const missing = blocks.filter(b => !b.exampleFor);
    expect(missing.map(b => b.dirName)).toEqual([]);
  });

  it('showcase blocks have unique exampleFor (one showcase per component)', () => {
    const showcases = blocks.filter(b => b.isShowcase);
    const seen = new Map<string, string[]>();
    for (const s of showcases) {
      if (!seen.has(s.exampleFor)) {
        seen.set(s.exampleFor, []);
      }
      seen.get(s.exampleFor)!.push(s.dirName);
    }
    const dupes = [...seen.entries()].filter(([, v]) => v.length > 1);
    // Some components may legitimately have multiple showcases, but flag them
    // so we're aware. Most should have exactly one.
    expect(dupes.length).toBeLessThan(showcases.length * 0.1);
  });

  it('componentsUsed links blocks to components', () => {
    const blocksWithComponents = blocks.filter(
      b => b.componentsUsed.length > 0,
    );
    expect(blocksWithComponents.length).toBeGreaterThan(blocks.length * 0.5);
  });

  it('blocks include TSX source code', () => {
    for (const block of blocks) {
      expect(typeof block.source).toBe('string');
      expect(block.source.length).toBeGreaterThan(0);
    }
  });

  it('decodes unicode escapes in block titles', () => {
    const block = blocks.find(b => b.dirName === 'TabListTabsWithBadge');
    expect(block).toBeDefined();
    expect(block!.name).toBe('TabList — With Badge');
    expect(block!.displayName).toBe('TabList — With Badge');
    expect(block!.name).not.toContain('\\u2014');
  });

  it('showcase sources contain valid JSX', () => {
    const showcases = blocks.filter(b => b.isShowcase);
    for (const s of showcases) {
      // Every showcase should have an export default function
      expect(s.source).toMatch(/export default function/);
    }
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

  it('doc topics have category (guide or foundations)', () => {
    for (const d of docTopics) {
      expect(d.category === 'guide' || d.category === 'foundations').toBe(true);
    }
    const guide = docTopics.filter(d => d.category === 'guide');
    const foundations = docTopics.filter(d => d.category === 'foundations');
    expect(guide.length).toBeGreaterThanOrEqual(4);
    expect(foundations.length).toBeGreaterThanOrEqual(7);
  });

  it('no duplicate topics', () => {
    const topics = docTopics.map(d => d.topic);
    expect(new Set(topics).size).toBe(topics.length);
  });
});

// ── Theme Registry ─────────────────────────────────────────────────────

describe('themeRegistry', () => {
  const registryPath = new URL(
    '../generated/themeRegistry.ts',
    import.meta.url,
  );
  const registrySource = fs.readFileSync(registryPath, 'utf-8');

  it('generates a themeRegistry file', () => {
    expect(registrySource).toContain('themeObjects');
  });

  it('has an import and entry for every theme package', () => {
    const themePackages = packages.filter(p =>
      p.name.startsWith('@xds/theme-'),
    );
    expect(themePackages.length).toBeGreaterThan(0);
    for (const pkg of themePackages) {
      const slug = pkg.name.replace('@xds/theme-', '');
      expect(registrySource).toContain(`from '${pkg.name}/built'`);
      expect(registrySource).toContain(`'${pkg.name}': ${slug}Theme`);
    }
  });

  it('has no entries for non-theme packages', () => {
    const nonTheme = packages.filter(p => !p.name.startsWith('@xds/theme-'));
    for (const pkg of nonTheme) {
      expect(registrySource).not.toContain(`'${pkg.name}':`);
    }
  });
});

// ── Showcase Registry ──────────────────────────────────────────────────

describe('showcaseRegistry', () => {
  it('has showcase loaders for many components', () => {
    const keys = Object.keys(showcaseRegistry);
    expect(keys.length).toBeGreaterThan(100);
  });

  it('every entry is a function (dynamic import loader)', () => {
    for (const [_key, loader] of Object.entries(showcaseRegistry)) {
      expect(typeof loader).toBe('function');
    }
  });

  it('has showcases for known components', () => {
    expect(showcaseRegistry['Button']).toBeDefined();
    expect(showcaseRegistry['Dialog']).toBeDefined();
    expect(showcaseRegistry['Table']).toBeDefined();
    expect(showcaseRegistry['Card']).toBeDefined();
  });

  it('no duplicate keys (one showcase per component)', () => {
    const keys = Object.keys(showcaseRegistry);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('showcase files exist on disk', () => {
    const showcaseDir = new URL('../generated/showcases', import.meta.url);
    const files = fs.readdirSync(showcaseDir);
    expect(files.length).toBeGreaterThan(100);
    expect(files.every(f => f.endsWith('.tsx'))).toBe(true);
  });

  it('showcase file count matches registry entries', () => {
    const showcaseDir = new URL('../generated/showcases', import.meta.url);
    const files = fs.readdirSync(showcaseDir);
    const keys = Object.keys(showcaseRegistry);
    // Files may be more than keys due to dedup, but keys should not exceed files
    expect(keys.length).toBeLessThanOrEqual(files.length);
  });
});

// ── Example Registry ───────────────────────────────────────────────────

describe('exampleRegistry', () => {
  it('has examples for many components', () => {
    const keys = Object.keys(exampleRegistry);
    expect(keys.length).toBeGreaterThan(50);
  });

  it('every entry is an array of example objects', () => {
    for (const [, examples] of Object.entries(exampleRegistry)) {
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);
      for (const ex of examples) {
        expect(typeof ex.name).toBe('string');
        expect(ex.name.length).toBeGreaterThan(0);
        expect(typeof ex.description).toBe('string');
        expect(typeof ex.load).toBe('function');
      }
    }
  });

  it('has examples for known components', () => {
    expect(exampleRegistry['Button']).toBeDefined();
    expect(exampleRegistry['Table']).toBeDefined();
    expect(exampleRegistry['Dialog']).toBeDefined();
  });

  it('Button has multiple examples', () => {
    const buttonExamples = exampleRegistry['Button'];
    expect(buttonExamples.length).toBeGreaterThanOrEqual(3);
  });

  it('example files exist on disk', () => {
    const examplesDir = new URL('../generated/examples', import.meta.url);
    const files = fs.readdirSync(examplesDir);
    expect(files.length).toBeGreaterThan(200);
    expect(files.every(f => f.endsWith('.tsx'))).toBe(true);
  });

  it('does not include showcases as primary component examples', () => {
    // Hook pages can reuse authored component examples/showcases through
    // explicit block metadata. Count unique authored example sources so those
    // hook aliases don't make the registry look larger than the block set.
    const showcaseCount = Object.keys(showcaseRegistry).length;
    const examples = Object.values(exampleRegistry).flat();
    const uniqueExampleSourceCount = new Set(examples.map(e => e.source)).size;
    expect(uniqueExampleSourceCount).toBeLessThanOrEqual(blockCount);
    expect(examples.length).toBeGreaterThan(showcaseCount);
  });

  // Regression: the description extractor used to truncate at the first
  // interior quote (e.g. 'Swap the default "/"...') and drop any
  // description longer than 200 characters entirely — surfacing as
  // "No description available." in the docsite. Every authored doc has a
  // description, so the registry should never carry an empty one.
  it('every example has a non-empty description', () => {
    const missing: string[] = [];
    for (const examples of Object.values(exampleRegistry)) {
      for (const ex of examples) {
        if (!ex.description || ex.description.trim().length === 0) {
          missing.push(ex.name);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  // Regression: descriptions containing interior double quotes must be
  // preserved in full rather than cut off at the first quote.
  it('preserves descriptions with interior quotes', () => {
    const breadcrumbs = exampleRegistry['Breadcrumbs'] ?? [];
    const separators = breadcrumbs.find(e => /Separator/i.test(e.name));
    expect(separators).toBeDefined();
    expect(separators!.description).toContain('"/"');
    // Full sentence survives past the interior quote.
    expect(separators!.description).toMatch(/separator\.?$/i);
  });

  it('decodes unicode escapes in example titles', () => {
    const tabList = exampleRegistry['TabList'] ?? [];
    const withBadge = tabList.find(e => /With Badge/i.test(e.name));
    expect(withBadge).toBeDefined();
    expect(withBadge!.name).toBe('TabList — With Badge');
    expect(withBadge!.name).not.toContain('\\u2014');
  });

  // Regression: long descriptions (>200 chars) must not be dropped.
  it('keeps long descriptions intact', () => {
    const longest = Object.values(exampleRegistry)
      .flat()
      .reduce((max, e) => Math.max(max, e.description.length), 0);
    expect(longest).toBeGreaterThan(200);
  });
});

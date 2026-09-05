// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Registry serializer contract tests.
 * @input Minimal component, block, page, and StyleX fixtures.
 * @output Regression coverage for schema, package boundaries, names, and output.
 * @position Node test lane for the draft shadcn compatibility experiment.
 */

import {execFile} from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import {describe, expect, it} from 'vitest';
import {
  buildShadcnRegistry,
  generateShadcnRegistry,
} from '../../apps/docsite/scripts/generate-shadcn-registry.mjs';
import {
  blockRegistryIdentity,
  componentRegistryIdentity,
  pageRegistryIdentity,
  resolveShadcnRegistryOrigin,
} from '../../apps/docsite/src/lib/shadcnRegistry.mjs';

const execFileAsync = promisify(execFile);

const packages = [{name: '@astryxdesign/core', version: '0.5.2'}];

function fixture(overrides = {}) {
  return {
    packages,
    allComponents: {
      '@astryxdesign/core': [
        {
          name: 'Button',
          displayName: 'Button',
          description: 'Runs an action.',
          importPath: '@astryxdesign/core/Button',
          hidden: false,
          params: null,
        },
      ],
    },
    blocks: [
      {
        dirName: 'ButtonShowcase',
        name: 'Button — Variants',
        displayName: 'Button — Variants',
        description: 'Shows a primary button.',
        exampleFor: 'Button',
        isShowcase: true,
        category: 'components/Button',
        componentsUsed: ['Button'],
        source:
          "import {Button} from '@astryxdesign/core/Button';\n" +
          'export default function ButtonShowcase() { return <Button label="Save" />; }\n',
      },
    ],
    templates: [
      {
        slug: 'dashboard',
        name: 'Dashboard',
        description: 'A metrics dashboard.',
        category: 'Dashboard',
        isReady: true,
        isHiddenFromOverview: false,
        source:
          "import {Card} from '@astryxdesign/core/Card';\n" +
          'export default function Page() { return <Card />; }\n',
      },
    ],
    externalDependencySpecs: {
      '@stylexjs/stylex': '@stylexjs/stylex@0.19.0',
    },
    ...overrides,
  };
}

describe('resolveShadcnRegistryOrigin', () => {
  it('prefers an explicit registry origin', () => {
    expect(
      resolveShadcnRegistryOrigin({
        NEXT_PUBLIC_ASTRYX_REGISTRY_ORIGIN: 'https://example.com/custom/',
        VERCEL_URL: 'ignored.vercel.app',
      }),
    ).toBe('https://example.com/custom');
  });

  it('uses the Vercel deployment URL for preview builds', () => {
    expect(
      resolveShadcnRegistryOrigin({
        VERCEL_URL: 'astryx-git-example.vercel.app',
      }),
    ).toBe('https://astryx-git-example.vercel.app/r');
  });
});

describe('registry identities', () => {
  it('derives organized paths from stable doc identity', () => {
    expect(
      componentRegistryIdentity('@astryxdesign/core', 'Button'),
    ).toMatchObject({name: 'component-button', path: 'components/button'});
    expect(
      componentRegistryIdentity(
        '@astryxdesign/core',
        'useAppShellMobile',
        true,
      ),
    ).toMatchObject({
      name: 'hook-use-app-shell-mobile',
      path: 'hooks/use-app-shell-mobile',
    });
    expect(
      blockRegistryIdentity('Button — Leading Icon', 'Button', false),
    ).toMatchObject({
      name: 'example-button-leading-icon',
      path: 'examples/button/leading-icon',
    });
    expect(blockRegistryIdentity('Filter Toolbar', null, false)).toMatchObject({
      kind: 'block',
      name: 'block-filter-toolbar',
      path: 'blocks/filter-toolbar',
    });
    expect(pageRegistryIdentity('analytics-dashboard')).toMatchObject({
      name: 'template-analytics-dashboard',
      path: 'templates/analytics-dashboard',
    });
  });

  it('supports an explicit stable slug and prior path aliases', () => {
    expect(
      blockRegistryIdentity('Button — Icon', 'Button', false, {
        slug: 'leading-icon',
        aliases: ['button/icon'],
      }),
    ).toEqual({
      kind: 'example',
      name: 'example-button-leading-icon',
      path: 'examples/button/leading-icon',
      aliases: ['examples/button/icon'],
    });
  });

  it('rejects a standalone block marked as a component showcase', () => {
    expect(() => blockRegistryIdentity('Hero Layout', null, true)).toThrow(
      /requires exampleFor/,
    );
  });

  it('rejects malformed or unknown registry identity fields', () => {
    expect(() =>
      pageRegistryIdentity('dashboard', {slug: 'Dashboard'}),
    ).toThrow(/lowercase kebab-case/);
    expect(() => pageRegistryIdentity('dashboard', {owner: 'docs'})).toThrow(
      /unknown field/,
    );
  });
});

describe('buildShadcnRegistry', () => {
  it('creates standard component, showcase, and page items', () => {
    const {registry, items, counts} = buildShadcnRegistry(fixture());

    expect(counts).toEqual({
      components: 1,
      hooks: 0,
      showcases: 1,
      examples: 0,
      blocks: 0,
      skippedUnpublishedComponents: 0,
      skippedUnpublishedBlocks: 0,
      pages: 1,
      skippedUnpublishedPages: 0,
      total: 3,
    });
    expect(registry.items).toHaveLength(3);
    expect(items.map(item => item.name)).toEqual([
      'component-button',
      'showcase-button-variants',
      'template-dashboard',
    ]);
    expect(items.map(item => item.astryx.path)).toEqual([
      'components/button',
      'showcases/button/variants',
      'templates/dashboard',
    ]);
  });

  it('writes canonical nested paths and compatibility aliases', () => {
    const outDir = mkdtempSync(path.join(tmpdir(), 'astryx-shadcn-routes-'));
    try {
      const input = fixture();
      input.blocks[0].registry = {
        slug: 'button-styles',
        aliases: ['button/variants'],
      };
      input.blocks.push({
        ...input.blocks[0],
        dirName: 'FilterToolbar',
        name: 'Filter Toolbar',
        displayName: 'Filter Toolbar',
        exampleFor: null,
        isShowcase: false,
        registry: null,
      });
      const result = generateShadcnRegistry({
        ...input,
        outDir,
        cliRoot: outDir,
      });

      expect(existsSync(path.join(outDir, 'components', 'button.json'))).toBe(
        true,
      );
      expect(
        existsSync(
          path.join(outDir, 'showcases', 'button', 'button-styles.json'),
        ),
      ).toBe(true);
      expect(
        existsSync(path.join(outDir, 'showcases', 'button', 'variants.json')),
      ).toBe(true);
      expect(
        existsSync(path.join(outDir, 'blocks', 'filter-toolbar.json')),
      ).toBe(true);
      expect(existsSync(path.join(outDir, 'templates', 'dashboard.json'))).toBe(
        true,
      );
      expect(result.routes).toContain('showcases/button/variants');
      expect(result.routes).toContain('blocks/filter-toolbar');
    } finally {
      rmSync(outDir, {recursive: true, force: true});
    }
  });

  it('creates a first-class standalone block item', () => {
    const standalone = {
      ...fixture().blocks[0],
      dirName: 'FilterToolbar',
      name: 'Filter Toolbar',
      displayName: 'Filter Toolbar',
      exampleFor: null,
      isShowcase: false,
    };
    const {items} = buildShadcnRegistry(fixture({blocks: [standalone]}));
    const block = items.find(item => item.name === 'block-filter-toolbar');

    expect(block.astryx).toMatchObject({
      kind: 'block',
      path: 'blocks/filter-toolbar',
      exampleFor: null,
    });
    expect(block.files[0].target).toBe(
      'components/astryx/blocks/FilterToolbar.tsx',
    );
  });

  it('keeps component implementation inside the package', () => {
    const {items} = buildShadcnRegistry(fixture());
    const component = items.find(item => item.name === 'component-button');

    expect(component.dependencies).toEqual([
      '@astryxdesign/core@^0.5.2',
      '@stylexjs/stylex@0.19.0',
    ]);
    expect(component.css).toEqual({
      '@import "@astryxdesign/core/reset.css"': {},
      '@import "@astryxdesign/core/astryx.css"': {},
    });
    expect(component.files).toEqual([
      expect.objectContaining({
        target: 'components/astryx/Button.ts',
        content: "export * from '@astryxdesign/core/Button';\n",
      }),
    ]);
  });

  it('uses the shadcn page-file workaround without changing item semantics', () => {
    const {items} = buildShadcnRegistry(fixture());
    const page = items.find(item => item.name === 'template-dashboard');

    expect(page.type).toBe('registry:page');
    expect(page.files[0].type).toBe('registry:block');
    expect(page.files[0].target).toBe('app/astryx/dashboard/page.tsx');
  });

  it('writes a page through the pinned shadcn CLI workaround', async () => {
    const project = mkdtempSync(path.join(tmpdir(), 'astryx-shadcn-page-'));
    try {
      mkdirSync(path.join(project, 'src'), {recursive: true});
      writeFileSync(
        path.join(project, 'package.json'),
        JSON.stringify({
          name: 'registry-page-test',
          private: true,
          version: '0.0.0',
        }),
      );
      writeFileSync(
        path.join(project, 'components.json'),
        JSON.stringify({
          $schema: 'https://ui.shadcn.com/schema.json',
          style: 'nova',
          rsc: false,
          tsx: true,
          tailwind: {
            config: '',
            css: 'src/index.css',
            baseColor: '',
            cssVariables: true,
            prefix: '',
          },
          aliases: {
            components: '@/components',
            utils: '@/lib/utils',
            ui: '@/components/ui',
            lib: '@/lib',
            hooks: '@/hooks',
          },
          iconLibrary: 'lucide',
        }),
      );
      writeFileSync(
        path.join(project, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            baseUrl: '.',
            paths: {'@/*': ['./src/*']},
          },
        }),
      );
      writeFileSync(path.join(project, 'src', 'index.css'), '');

      const page = {
        $schema: 'https://ui.shadcn.com/schema/registry-item.json',
        name: 'astryx-page-test',
        type: 'registry:page',
        files: [
          {
            path: 'registry/astryx-page-test/page.tsx',
            type: 'registry:block',
            target: 'app/astryx/test/page.tsx',
            content: 'export default function Page() { return null; }\n',
          },
        ],
      };
      const itemPath = path.join(project, 'page.json');
      writeFileSync(itemPath, JSON.stringify(page));
      await execFileAsync(
        path.resolve('node_modules/.bin/shadcn'),
        ['add', itemPath, '--yes'],
        {cwd: project, timeout: 30_000},
      );

      expect(
        existsSync(
          path.join(project, 'src', 'app', 'astryx', 'test', 'page.tsx'),
        ),
      ).toBe(true);
    } finally {
      rmSync(project, {recursive: true, force: true});
    }
  });

  it('rejects composition source that escapes through a relative import', () => {
    const bad = fixture({
      blocks: [
        {
          ...fixture().blocks[0],
          source:
            "import {fixture} from '../fixture';\nexport default fixture;\n",
        },
      ],
    });

    expect(() => buildShadcnRegistry(bad)).toThrow(/relative import/);
  });

  it('targets canary packages in preview registries', () => {
    const {items} = buildShadcnRegistry({
      ...fixture(),
      dependencyTag: 'canary',
    });
    const component = items.find(item => item.name === 'component-button');
    expect(component.dependencies).toEqual([
      '@astryxdesign/core@canary',
      '@stylexjs/stylex@0.19.0',
    ]);
  });

  it('precompiles local StyleX with runtime CSS injection', () => {
    const styled = fixture({
      blocks: [
        {
          ...fixture().blocks[0],
          source:
            "import * as stylex from '@stylexjs/stylex';\n" +
            "import {Button} from '@astryxdesign/core/Button';\n" +
            "const styles = stylex.create({root: {width: '100%'}});\n" +
            'export default function Styled() { return <div {...stylex.props(styles.root)}><Button label="Save" /></div>; }\n',
        },
      ],
    });

    const {items} = buildShadcnRegistry(styled);
    const block = items.find(item => item.name === 'showcase-button-variants');
    expect(block.files[0].content).toContain('stylex-inject');
    expect(block.files[0].content).not.toContain('stylex.create');
    expect(block.files[0].target).toMatch(/\.jsx$/);
    expect(block.dependencies).toContain('@stylexjs/stylex@0.19.0');
  });

  it('keeps Astryx metadata in raw JSON while standard clients can strip it', () => {
    const {items} = buildShadcnRegistry(fixture());

    expect(items[0].astryx).toEqual(
      expect.objectContaining({kind: 'component'}),
    );
  });
});

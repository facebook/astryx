// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ComponentCatalog,
  CORE_PACKAGE,
  discoverIntegrationComponentContributions,
} from './component-catalog.mjs';
import {discoverIntegrationComponents} from './component-discovery.mjs';

const CORE_DIR = path.resolve(import.meta.dirname, '..', '..', '..', 'core');

/** @type {string[]} */
const roots = [];

/** @param {string} name @param {string} [pkg] */
function record(name, pkg = CORE_PACKAGE) {
  return {
    name,
    package: pkg,
    group: null,
    category: null,
    docPath: `/${name}.doc.mjs`,
    sourcePath: `/${name}.tsx`,
    issuesUrl: undefined,
  };
}

/** @param {Record<string, unknown>} fields */
function integrationWithDoc(fields) {
  const root = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-component-catalog-'),
  );
  roots.push(root);
  const component = String(fields.name ?? 'AcmeSideNav');
  fs.writeFileSync(
    path.join(root, `${component}.doc.mjs`),
    `export const docs = ${JSON.stringify({
      name: component,
      displayName: String(fields.displayName ?? component),
      usage: {description: 'Integration navigation.'},
      props: [],
      ...fields,
    })};\n`,
  );
  fs.writeFileSync(
    path.join(root, `${component}.tsx`),
    `export function ${component}() { return null; }\n`,
  );
  return {
    name: '@acme/meta',
    version: '1.0.0',
    components: root,
    __packageDir: root,
  };
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

describe('discoverIntegrationComponentContributions', () => {
  it('loads a valid replacement declaration through the ComponentDoc parser', async () => {
    const integration = integrationWithDoc({
      name: 'AcmeSideNav',
      replaces: 'SideNav',
    });

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(errors).toEqual([]);
    expect(records).toEqual([
      expect.objectContaining({
        name: 'AcmeSideNav',
        package: '@acme/meta',
        replaces: 'SideNav',
      }),
    ]);
  });

  it('loads a stamped multi-component replacement', async () => {
    const integration = integrationWithDoc({
      type: 'component',
      name: 'AcmeNavigation',
      displayName: 'Acme Navigation',
      replaces: 'SideNav',
      import: '@acme/widgets/Navigation',
      props: undefined,
      components: [],
    });

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(errors).toEqual([]);
    expect(records).toEqual([
      expect.objectContaining({
        name: 'AcmeNavigation',
        replaces: 'SideNav',
        import: '@acme/widgets/Navigation',
      }),
    ]);
  });

  it('rejects malformed legacy multi-component replacements', async () => {
    const integration = integrationWithDoc({
      name: 'BadNavigation',
      replaces: 'SideNav',
      props: undefined,
      components: [null],
    });

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(records).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('components.0');
  });

  it('rejects present but malformed replacement and import metadata', async () => {
    for (const fields of [
      {name: 'NullReplacement', replaces: null},
      {name: 'BadImport', import: 42},
    ]) {
      const integration = integrationWithDoc(fields);
      const {records, errors} =
        await discoverIntegrationComponentContributions(integration);

      expect(records).toEqual([]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/replaces|import/);
    }
  });

  it('loads a named ComponentDoc export from a TypeScript doc file', async () => {
    const integration = integrationWithDoc({
      name: 'TypedNavigation',
      replaces: 'SideNav',
    });
    fs.renameSync(
      path.join(integration.components, 'TypedNavigation.doc.mjs'),
      path.join(integration.components, 'TypedNavigation.doc.ts'),
    );

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(errors).toEqual([]);
    expect(records).toEqual([
      expect.objectContaining({name: 'TypedNavigation', replaces: 'SideNav'}),
    ]);
  });

  it('rejects HookDoc metadata but trims valid component imports', async () => {
    const hook = integrationWithDoc({
      name: 'useNavigation',
      props: undefined,
      usage: undefined,
      import: '@acme/widgets/hooks',
      params: [],
      returns: [],
    });
    const hookResult = await discoverIntegrationComponentContributions(hook);
    expect(hookResult.records).toEqual([]);
    expect(hookResult.errors[0].message).toContain('only valid on a ComponentDoc');

    const component = integrationWithDoc({
      name: 'TrimmedImport',
      import: '  @acme/widgets/Navigation  ',
    });
    const componentResult =
      await discoverIntegrationComponentContributions(component);
    expect(componentResult.errors).toEqual([]);
    expect(componentResult.records[0].import).toBe(
      '@acme/widgets/Navigation',
    );
  });

  it('keeps the pre-existing stamped import-only component shape permissive', async () => {
    const integration = integrationWithDoc({
      name: 'AcmeCarousel',
      import: '@acme/widgets/Carousel',
    });
    fs.writeFileSync(
      path.join(integration.components, 'AcmeCarousel.doc.mjs'),
      "export default {type: 'component', name: 'AcmeCarousel', import: '@acme/widgets/Carousel', description: 'Carousel.', props: []};\n",
    );
    fs.writeFileSync(
      path.join(integration.components, 'AcmeOther.doc.mjs'),
      "export const docs = {name: 'AcmeOther', props: []};\n",
    );

    const result = await discoverIntegrationComponentContributions(integration);

    expect(result.errors).toEqual([]);
    expect(result.records.map(record => record.name).sort()).toEqual([
      'AcmeCarousel',
      'AcmeOther',
    ]);
  });

  it('reports an invalid declaration while the legacy scanner still finds the component', async () => {
    const integration = integrationWithDoc({
      name: 'AcmeSideNav',
      replaces: 42,
    });

    expect(
      discoverIntegrationComponents(integration).map(item => item.name),
    ).toEqual(['AcmeSideNav']);
    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(records).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('replaces');
  });

  it('rejects an otherwise malformed component doc before it can replace Core', async () => {
    const integration = integrationWithDoc({
      name: 'BrokenNavigation',
      replaces: 'SideNav',
      props: undefined,
      usage: undefined,
    });

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(records).toEqual([]);
    expect(errors).toHaveLength(1);
  });

  it('rejects a stamped reference doc with a replacement declaration', async () => {
    const integration = integrationWithDoc({
      type: 'generic',
      name: 'NavigationGuide',
      replaces: 'SideNav',
      props: undefined,
      usage: undefined,
      title: 'Navigation guide',
      description: 'A guide, not a component.',
      sections: [],
    });

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(records).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('only valid on a ComponentDoc');
  });

  it('rejects a legacy hook doc with a replacement declaration', async () => {
    const integration = integrationWithDoc({
      name: 'useNavigation',
      replaces: 'SideNav',
      props: undefined,
      usage: undefined,
      params: [],
      returns: [],
    });

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(records).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('only valid on a ComponentDoc');
  });

  it('uses the authored ComponentDoc name instead of the file stem', async () => {
    const integration = integrationWithDoc({name: 'AuthoredNavigation'});
    fs.renameSync(
      path.join(integration.components, 'AuthoredNavigation.doc.mjs'),
      path.join(integration.components, 'FileStem.doc.mjs'),
    );
    fs.renameSync(
      path.join(integration.components, 'AuthoredNavigation.tsx'),
      path.join(integration.components, 'FileStem.tsx'),
    );

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(errors).toEqual([]);
    expect(records).toEqual([
      expect.objectContaining({
        name: 'AuthoredNavigation',
        docPath: expect.stringContaining('FileStem.doc.mjs'),
      }),
    ]);
  });

  it('uses the parser-normalized replacement name', async () => {
    const integration = integrationWithDoc({
      name: 'AcmeSideNav',
      replaces: '  SideNav  ',
    });

    const {records, errors} =
      await discoverIntegrationComponentContributions(integration);

    expect(errors).toEqual([]);
    expect(records[0].replaces).toBe('SideNav');
  });
});

describe('ComponentCatalog', () => {
  it('uses a replacement for the Core name and keeps both packages addressable', async () => {
    const catalog = new ComponentCatalog([
      record('Button'),
      record('SideNav'),
      record('TopNav'),
    ]);
    expect(
      await catalog.addIntegration([
        {...record('AcmeSideNav', '@acme/meta'), replaces: 'SideNav'},
      ]),
    ).toEqual([]);

    expect(catalog.resolve('SideNav')).toMatchObject({
      name: 'AcmeSideNav',
      package: '@acme/meta',
    });
    expect(catalog.resolve('AcmeSideNav')).toMatchObject({
      package: '@acme/meta',
    });
    expect(catalog.resolvePackage('SideNav', CORE_PACKAGE)).toMatchObject({
      name: 'SideNav',
    });
    expect(catalog.resolvePackage('SideNav', '@acme/meta')).toMatchObject({
      name: 'AcmeSideNav',
    });
    expect(catalog.entries().map(item => item.name)).toEqual([
      'Button',
      'AcmeSideNav',
      'TopNav',
    ]);
  });

  it('leaves an undeclared same-name overlap ambiguous', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    expect(await catalog.addIntegration([record('SideNav', '@acme/meta')])).toEqual(
      [],
    );

    expect(catalog.resolve('SideNav')).toBeUndefined();
    expect(catalog.owners('SideNav')).toHaveLength(2);
  });

  it.each([
    ['replacement first', ['replacement', 'native']],
    ['native owner first', ['native', 'replacement']],
  ])('resolves documented Core targets independently of %s', async (_label, order) => {
    const catalog = ComponentCatalog.fromCore(CORE_DIR);
    const replacement = {
      ...record('AcmeHeading', '@acme/replacement'),
      replaces: 'Heading',
    };
    const native = record('Heading', '@acme/native');
    const issues = [];
    for (const item of order) {
      issues.push(
        ...await catalog.addIntegration([
          item === 'replacement' ? replacement : native,
        ]),
      );
    }

    expect(
      issues.some(issue => issue.code === 'missing_component_replacement'),
    ).toBe(false);
    expect(catalog.resolve('Heading')).toMatchObject({
      name: 'AcmeHeading',
      package: '@acme/replacement',
    });
    expect(catalog.entries()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'AcmeHeading',
          replaces: 'Heading',
        }),
      ]),
    );
  });

  it('keeps same-package target validity tied to the Core doc', async () => {
    const catalog = ComponentCatalog.fromCore(CORE_DIR);
    const issues = await catalog.addIntegration([
      {...record('AcmeHeading', '@acme/meta'), replaces: 'Heading'},
      record('Heading', '@acme/meta'),
    ]);

    expect(
      issues.some(issue => issue.code === 'missing_component_replacement'),
    ).toBe(false);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'ambiguous_component_name',
          severity: 'warning',
        }),
      ]),
    );
    expect(catalog.resolve('Heading')).toMatchObject({name: 'AcmeHeading'});
    expect(catalog.resolvePackage('Heading', '@acme/meta')).toMatchObject({
      name: 'Heading',
    });
  });

  it('rejects a documented HookDoc as a component replacement target', async () => {
    const catalog = ComponentCatalog.fromCore(CORE_DIR);
    const issues = await catalog.addIntegration([
      {...record('AcmeMedia', '@acme/meta'), replaces: 'useMediaQuery'},
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'missing_component_replacement',
        severity: 'error',
      }),
    ]);
    expect(catalog.resolve('AcmeMedia')).toBeUndefined();
  });

  it('rejects a replacement whose Core target is missing', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    const issues = await catalog.addIntegration([
      {...record('MetaRail', '@acme/meta'), replaces: 'NavigationRail'},
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'missing_component_replacement',
        severity: 'error',
      }),
    ]);
    expect(catalog.resolve('MetaRail')).toBeUndefined();
  });

  it('rejects a replacement whose own name is a different Core identity', async () => {
    const catalog = new ComponentCatalog([record('Button'), record('SideNav')]);
    const issues = await catalog.addIntegration([
      {...record('Button', '@acme/meta'), replaces: 'SideNav'},
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'ambiguous_component_replacement',
        severity: 'error',
      }),
    ]);
    expect(catalog.resolve('Button')).toMatchObject({package: CORE_PACKAGE});
    expect(catalog.resolve('SideNav')).toMatchObject({package: CORE_PACKAGE});
    expect(catalog.entries().map(item => item.name)).toEqual([
      'Button',
      'SideNav',
    ]);
  });

  it('rejects two replacement declarations for one target in a package', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    const issues = await catalog.addIntegration([
      {...record('AcmeSideNav', '@acme/meta'), replaces: 'SideNav'},
      {...record('MetaRail', '@acme/meta'), replaces: 'SideNav'},
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'ambiguous_component_replacement',
        severity: 'error',
      }),
    ]);
    expect(catalog.resolve('SideNav')).toMatchObject({package: CORE_PACKAGE});
  });

  it('uses configured order when separate integrations replace one target', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    await catalog.addIntegration([
      {...record('AcmeSideNav', '@acme/one'), replaces: 'SideNav'},
    ]);
    const issues = await catalog.addIntegration([
      {...record('PartnerSideNav', '@acme/two'), replaces: 'SideNav'},
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'ambiguous_component_replacement',
        severity: 'warning',
      }),
    ]);
    expect(catalog.resolve('SideNav')).toMatchObject({
      name: 'PartnerSideNav',
      package: '@acme/two',
    });
    expect(catalog.resolvePackage('SideNav', '@acme/one')).toMatchObject({
      name: 'AcmeSideNav',
    });
    expect(catalog.resolve('AcmeSideNav')).toMatchObject({package: '@acme/one'});
    expect(catalog.entries()).toEqual([
      expect.objectContaining({name: 'PartnerSideNav', package: '@acme/two'}),
      expect.objectContaining({name: 'AcmeSideNav', package: '@acme/one'}),
    ]);
  });

  it('prefers an exact package-owned name over a replacement alias', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    const issues = await catalog.addIntegration([
      {...record('AcmeSideNav', '@acme/meta'), replaces: 'SideNav'},
      record('SideNav', '@acme/meta'),
    ]);
    expect(issues).toEqual([
      expect.objectContaining({
        code: 'ambiguous_component_name',
        severity: 'warning',
      }),
    ]);
    expect(catalog.resolvePackage('SideNav', '@acme/meta')).toMatchObject({
      name: 'SideNav',
      package: '@acme/meta',
    });
    expect(catalog.resolvePackage('AcmeSideNav', '@acme/meta')).toMatchObject({
      name: 'AcmeSideNav',
      package: '@acme/meta',
    });
  });

  it('rejects duplicate authored names inside one package', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    const issues = await catalog.addIntegration([
      record('Duplicate', '@acme/meta'),
      {...record('Duplicate', '@acme/meta'), docPath: '/other/Duplicate.doc.mjs'},
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'ambiguous_component_name',
        severity: 'error',
      }),
    ]);
    expect(catalog.resolve('Duplicate')).toBeUndefined();
  });

  it('keeps and warns about a native owner shadowed by an active replacement', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    await catalog.addIntegration([record('SideNav', '@acme/legacy')]);
    const issues = await catalog.addIntegration([
      {...record('ZSideNav', '@acme/replacement'), replaces: 'SideNav'},
    ]);

    expect(catalog.resolve('SideNav')).toMatchObject({name: 'ZSideNav'});
    expect(catalog.entries().map(item => item.name)).toEqual([
      'ZSideNav',
      'SideNav',
    ]);
    expect(catalog.owners('SideNav')).toHaveLength(3);
    expect(issues).toEqual([
      expect.objectContaining({
        code: 'ambiguous_component_name',
        severity: 'warning',
        message: expect.stringContaining('@acme/legacy'),
      }),
    ]);
  });

  it('lets an active replacement own its canonical name too', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    await catalog.addIntegration([record('AliasNav', '@acme/legacy')]);
    await catalog.addIntegration([
      {...record('AliasNav', '@acme/replacement'), replaces: 'SideNav'},
    ]);

    expect(catalog.resolve('AliasNav')).toMatchObject({
      package: '@acme/replacement',
    });
    expect(catalog.entries().filter(item => item.name === 'AliasNav')).toEqual([
      expect.objectContaining({package: '@acme/replacement'}),
    ]);
  });

  it('keeps an explicit replacement ahead of a later autolinked one', async () => {
    const catalog = new ComponentCatalog([record('SideNav')]);
    await catalog.addIntegration([
      {
        ...record('ConfiguredSideNav', '@acme/configured'),
        replaces: 'SideNav',
        integration: /** @type {any} */ ({__autolinked: false}),
      },
    ]);
    const issues = await catalog.addIntegration([
      {
        ...record('InstalledSideNav', '@acme/installed'),
        replaces: 'SideNav',
        integration: /** @type {any} */ ({__autolinked: true}),
      },
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'ambiguous_component_replacement',
        severity: 'warning',
      }),
    ]);
    expect(catalog.resolve('SideNav')).toMatchObject({
      name: 'ConfiguredSideNav',
      package: '@acme/configured',
    });
  });
});

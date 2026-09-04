// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {
  composeKnowledgeSchemas,
  discoverKnowledgeRecords,
  parseAnatomyThemingBlock,
  parseKnowledgeDocument,
  validateAnatomyThemingMap,
  validateDelegations,
  validateKnowledgeRoot,
  validateSchemaEvolution,
} from './check-knowledge.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const roots = [];

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-knowledge-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'docs/schemas/knowledge'), {recursive: true});
  fs.mkdirSync(path.join(root, 'docs/templates'), {recursive: true});
  fs.cpSync(
    path.join(repoRoot, 'docs/templates/knowledge'),
    path.join(root, 'docs/templates/knowledge'),
    {recursive: true},
  );
  for (const version of ['v1.json', 'v2.json', 'v3.json']) {
    fs.copyFileSync(
      path.join(repoRoot, `docs/schemas/knowledge/${version}`),
      path.join(root, `docs/schemas/knowledge/${version}`),
    );
  }
  for (const relative of [
    'docs/specs',
    'docs/families',
    'docs/architecture',
    'docs/themes',
    'packages/core/src',
    'packages/lab/src',
  ]) {
    fs.mkdirSync(path.join(root, relative), {recursive: true});
  }
  for (const relative of [
    'packages/themes/neutral',
    'packages/themes/duplicate',
  ]) {
    fs.mkdirSync(path.join(root, relative), {recursive: true});
  }
  fs.mkdirSync(path.join(root, '.github'), {recursive: true});
  for (const ownerFile of ['DESIGNOWNERS', 'ENGOWNERS']) {
    fs.copyFileSync(
      path.join(repoRoot, `.github/${ownerFile}`),
      path.join(root, `.github/${ownerFile}`),
    );
  }
  return root;
}

function addSchemaVersion(root, version) {
  const latest = JSON.parse(
    fs.readFileSync(path.join(root, 'docs/schemas/knowledge/v1.json'), 'utf8'),
  );
  latest.schemaVersion = version;
  fs.writeFileSync(
    path.join(root, `docs/schemas/knowledge/v${version}.json`),
    `${JSON.stringify(latest, null, 2)}\n`,
  );
}

function componentRecord(overrides = {}) {
  const values = {
    schema_version: '3',
    template_version: '1',
    kind: 'component',
    id: 'component:Button',
    authority: 'draft',
    archive_reason: 'null',
    superseded_by: 'null',
    approved_by: 'null',
    approved_at: 'null',
    owners: '[owner]',
    review_triggers: '[behavior]',
    verified_by: '[Button.test.tsx]',
    modules: '[]',
    families: '[family:actions]',
    design_specs: '[design:actions]',
    architecture: '[architecture:components]',
    contributing: '[contributing:api]',
    system_specs: '[]',
    ...overrides,
  };
  const frontmatter = Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const sections = [
    'Intent',
    'Compatibility and migration',
    'Ownership boundary',
    'Public concepts',
    'Behavioral and layout contract',
    'Accessibility contract',
    'Design relationships',
    'Family and system relationships',
    'Verification map',
    'Decision log',
    'Open questions',
    'Content boundary',
  ]
    .map(section => `## ${section}\n\nBody.`)
    .join('\n\n');
  return `---\n${frontmatter}\n---\n\n# Button component contract\n\n${sections}\n`;
}

function moduleRecord(overrides = {}) {
  const values = {
    schema_version: '3',
    template_version: '1',
    kind: 'module',
    id: 'module:Button/useButtonThing',
    authority: 'draft',
    archive_reason: 'null',
    superseded_by: 'null',
    approved_by: 'null',
    approved_at: 'null',
    owners: '[owner]',
    review_triggers: '[public-api,behavior,accessibility]',
    verified_by: '[useButtonThing.test.ts]',
    parent_component: 'component:Button',
    references: '[]',
    ...overrides,
  };
  const frontmatter = Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const sections = [
    'Intent',
    'Compatibility and migration',
    'Ownership boundary',
    'Public API and concepts',
    'Behavioral contract',
    'Accessibility contract',
    'Design relationships',
    'Parent and system relationships',
    'Verification map',
    'Decision log',
    'Open questions',
    'Content boundary',
  ]
    .map(section => `## ${section}\n\nBody.`)
    .join('\n\n');
  return `---\n${frontmatter}\n---\n\n# Button module contract\n\n${sections}\n`;
}

function themeRecord(overrides = {}) {
  const values = {
    schema_version: '2',
    template_version: '1',
    kind: 'theme',
    id: 'theme:neutral',
    authority: 'draft',
    approved_by: 'null',
    approved_at: 'null',
    review_triggers: '[tokens]',
    verified_by: '[theme.test.ts]',
    package: "'@astryxdesign/theme-neutral'",
    source_theme: 'packages/themes/neutral/src/neutralTheme.ts',
    references: '[architecture:theme-test]',
    ...overrides,
  };
  const frontmatter = Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const sections = [
    'Intent and audience',
    'Inheritance and base',
    'Portable token overrides',
    'Theme-local role definitions',
    'Tonal palette definitions',
    'Component and state mappings',
    'Compatibility and migration',
    'Accessibility and contrast evidence',
    'Build and artifact contract',
    'Verification map',
    'Decision log',
    'Open questions',
    'Content boundary',
  ]
    .map(section => `## ${section}\n\nBody.`)
    .join('\n\n');
  return `---\n${frontmatter}\n---\n\n# Neutral theme specification\n\n${sections}\n`;
}

function systemSpecRecord(overrides = {}) {
  const values = {
    schema_version: '1',
    template_version: '1',
    kind: 'system-spec',
    id: 'spec:AST-900',
    authority: 'current',
    archive_reason: 'null',
    superseded_by: 'null',
    approved_by: 'cixzhang',
    approved_at: '2026-08-31',
    phase: 'accepted',
    owners: '[cixzhang]',
    affects_architecture: '[]',
    affects_families: '[]',
    affects_contributing: '[]',
    affects_consumer_docs: '[]',
    ...overrides,
  };
  const frontmatter = Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const sections = [
    'Intent',
    'Non-goals',
    'Requirements',
    'Current-state impact',
    'Verification',
    'Decision log',
    'Open questions',
  ]
    .map(section => `## ${section}\n\nBody.`)
    .join('\n\n');
  return `---\n${frontmatter}\n---\n\n# Fixture system spec\n\n${sections}\n`;
}

function writeSystemSpec(root, directoryName, record) {
  const directory = path.join(root, `docs/specs/${directoryName}`);
  fs.mkdirSync(directory);
  fs.writeFileSync(path.join(directory, 'spec.md'), record);
}

function writeCurrentArchitecture(root) {
  const template = fs.readFileSync(
    path.join(root, 'docs/templates/knowledge/architecture.md'),
    'utf8',
  );
  fs.writeFileSync(
    path.join(root, 'docs/architecture/theme-test.md'),
    template
      .replace('id: architecture:<surface>', 'id: architecture:theme-test')
      .replace('authority: draft', 'authority: current')
      .replace('approved_by: null', 'approved_by: cixzhang')
      .replace('approved_at: null', 'approved_at: 2026-08-31'),
  );
}

function anatomyThemingBlock(mapping) {
  return `### Theming anatomy\n\n<!-- anatomy-theming:v1 -->\n\`\`\`json\n${JSON.stringify(mapping, null, 2)}\n\`\`\``;
}

function withAnatomyTheming(record, mapping) {
  return record.replace(
    '## Design relationships\n\nBody.',
    `## Design relationships\n\nBody.\n\n${anatomyThemingBlock(mapping)}`,
  );
}

function writeButtonDoc(directory) {
  const content = `export const docs = {
  name: 'Button',
  displayName: 'Button',
  category: 'Actions',
  keywords: ['button'],
  props: [],
  usage: {
    anatomy: [
      {name: 'Root', required: true, description: 'Painted surface.'},
      {name: 'Label', required: true, description: 'Visible label.'},
      {name: 'Icon', required: false, description: 'Shared icon.'},
      {name: 'Content', required: false, description: 'Consumer content.'},
    ],
    description: 'A button triggers an action. Use it for a discrete action.',
    bestPractices: [],
  },
  theming: {
    targets: [{className: 'astryx-button'}],
  },
};\n`;
  fs.writeFileSync(path.join(directory, 'Button.doc.mjs'), content);
  return content;
}

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

describe('schema evolution', () => {
  it('tracks latest schema versions per kind', () => {
    const raw = new Map([
      [
        1,
        {
          schema: {schemaVersion: 1, kinds: {component: {marker: 'v1'}}},
          schemaPath: 'v1.json',
        },
      ],
      [
        2,
        {
          schema: {
            schemaVersion: 2,
            extends: 1,
            kinds: {theme: {marker: 'v2'}},
          },
          schemaPath: 'v2.json',
        },
      ],
      [
        3,
        {
          schema: {
            schemaVersion: 3,
            extends: 2,
            kinds: {component: {marker: 'v3'}},
          },
          schemaPath: 'v3.json',
        },
      ],
    ]);
    const {schemas, latestKindVersions} = composeKnowledgeSchemas(raw);
    expect(schemas.get(2).schema.kinds.component.marker).toBe('v1');
    expect(schemas.get(2).schema.kinds.theme.marker).toBe('v2');
    expect(latestKindVersions.get('theme')).toBe(2);
    expect(latestKindVersions.get('component')).toBe(3);
  });

  it('allows appending a higher schema version', () => {
    expect(
      validateSchemaEvolution(
        new Map([['docs/schemas/knowledge/v1.json', 'one']]),
        new Map([
          ['docs/schemas/knowledge/v1.json', 'one'],
          ['docs/schemas/knowledge/v2.json', 'two'],
        ]),
      ),
    ).toEqual([]);
  });

  it('rejects rewriting or deleting a published schema version', () => {
    expect(
      validateSchemaEvolution(
        new Map([
          ['docs/schemas/knowledge/v1.json', 'one'],
          ['docs/schemas/knowledge/v2.json', 'two'],
        ]),
        new Map([['docs/schemas/knowledge/v1.json', 'changed']]),
      ).join('\n'),
    ).toMatch(/immutable.*append-only/s);
  });
});

describe('component theming anatomy metadata', () => {
  const contract = {
    anatomy: ['Root', 'Label', 'Icon', 'Content'],
    targets: ['button'],
  };
  const valid = {
    Root: {target: 'button'},
    Label: {inherits: 'button'},
    Icon: {delegatesTo: {owner: 'component:Icon', target: 'icon'}},
    Content: {
      none: {reason: 'intentional: The consumer owns this content.'},
    },
  };

  it('parses the optional versioned JSON block under Design relationships', () => {
    expect(
      parseAnatomyThemingBlock(
        `## Design relationships\n\n${anatomyThemingBlock(valid)}`,
      ).mapping,
    ).toEqual(valid);
    expect(parseAnatomyThemingBlock('## Design relationships\n').mapping).toBe(
      null,
    );
  });

  it('rejects the structured block outside its existing level-two section', () => {
    expect(
      parseAnatomyThemingBlock(
        `## Public concepts\n\n${anatomyThemingBlock(valid)}`,
      ).problems.join('\n'),
    ).toMatch(/subsection of "Design relationships"/);
  });

  it('accepts exactly one complete disposition per documented anatomy part', () => {
    expect(validateAnatomyThemingMap(valid, contract)).toEqual([]);
  });

  it('accepts every classified none reason', () => {
    for (const classification of [
      'intentional',
      'reachability-gap',
      'unsettled',
    ]) {
      expect(
        validateAnatomyThemingMap(
          {
            ...valid,
            Content: {
              none: {reason: `${classification}: Current factual state.`},
            },
          },
          contract,
        ),
      ).toEqual([]);
    }
  });

  it.each([
    [
      'multiple dispositions',
      {...valid, Root: {target: 'button', inherits: 'button'}},
      /exactly one/,
    ],
    [
      'missing delegated owner',
      {...valid, Icon: {delegatesTo: {target: 'icon'}}},
      /requires exactly owner and target/,
    ],
    [
      'missing delegated target',
      {...valid, Icon: {delegatesTo: {owner: 'component:Icon'}}},
      /requires exactly owner and target/,
    ],
    [
      'missing none reason',
      {...valid, Content: {none: {}}},
      /requires a non-empty reason/,
    ],
    [
      'unclassified none reason',
      {...valid, Content: {none: {reason: 'The consumer owns this content.'}}},
      /must start with intentional:, reachability-gap:, or unsettled:/,
    ],
    [
      'prefixed target',
      {...valid, Root: {target: 'astryx-button'}},
      /omit the "astryx-" prefix/,
    ],
    [
      'non-kebab target',
      {...valid, Root: {target: 'Button_Root'}},
      /use kebab-case/,
    ],
  ])('rejects %s', (_name, mapping, expected) => {
    expect(validateAnatomyThemingMap(mapping, contract).join('\n')).toMatch(
      expected,
    );
  });

  it('requires exact anatomy names and coverage of current local targets', () => {
    const result = validateAnatomyThemingMap(
      {
        Label: {inherits: 'button'},
        Icon: {delegatesTo: {owner: 'component:Icon', target: 'icon'}},
        Content: {none: {reason: 'intentional: Consumer owned.'}},
        Unknown: {none: {reason: 'unsettled: Not real.'}},
      },
      contract,
    ).join('\n');
    expect(result).toMatch(/missing Root/);
    expect(result).toMatch(/unknown Unknown/);
    expect(result).toMatch(/current target "button" has no anatomy entry/);
  });

  it('validates an opted-in spec without changing consumer doc bytes', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    const consumerDoc = writeButtonDoc(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      withAnatomyTheming(componentRecord(), {
        ...valid,
        Icon: {none: {reason: 'intentional: Fixture-owned icon.'}},
      }),
    );

    expect(await validateKnowledgeRoot(root)).toEqual([]);
    expect(
      fs.readFileSync(path.join(directory, 'Button.doc.mjs'), 'utf8'),
    ).toBe(consumerDoc);
  });

  it('keeps the block optional while existing specs migrate', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'Button.spec.md'), componentRecord());
    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });
});

describe('component delegation ownership', () => {
  const canonicalTargets = [
    {component: 'Button', key: 'button'},
    {component: 'Icon', key: 'icon'},
    {component: 'Indicator', key: 'radio'},
    {component: 'RadioList', key: 'radio'},
    {component: 'Table', key: 'table-header'},
  ];
  const valid = {
    filePath: 'packages/core/src/Example/Example.spec.md',
    anatomy: 'Icon',
    owner: 'component:Icon',
    target: 'icon',
  };

  it('rejects an unknown owner with the complete delegation location', () => {
    const problems = validateDelegations(
      [{...valid, owner: 'component:Missing'}],
      canonicalTargets,
    ).join('\n');
    expect(problems).toContain(valid.filePath);
    expect(problems).toContain('theming anatomy "Icon".delegatesTo');
    expect(problems).toContain('owner "component:Missing"');
    expect(problems).toContain('target "icon"');
  });

  it('rejects a missing active target under an existing owner', () => {
    const problems = validateDelegations(
      [{...valid, target: 'glyph'}],
      canonicalTargets,
    ).join('\n');
    expect(problems).toContain('target "glyph"');
    expect(problems).toContain('owned by "component:Icon"');
    expect(problems).toContain('active targets for that owner: "icon"');
  });

  it('accepts a parent-owned member target only under its canonical owner', () => {
    expect(
      validateDelegations(
        [
          {
            ...valid,
            anatomy: 'Header',
            owner: 'component:Table',
            target: 'table-header',
          },
        ],
        canonicalTargets,
      ),
    ).toEqual([]);
    const problems = validateDelegations(
      [
        {
          ...valid,
          anatomy: 'Header',
          owner: 'component:TableHeader',
          target: 'table-header',
        },
      ],
      canonicalTargets,
    ).join('\n');
    expect(problems).toContain('"component:TableHeader"');
    expect(problems).toContain('target "table-header"');
    expect(problems).toContain(
      'canonical owner for target "table-header": "component:Table"',
    );
  });

  it('does not accept a target merely because unrelated owners share its name', () => {
    expect(
      validateDelegations(
        [
          {...valid, owner: 'component:Indicator', target: 'radio'},
          {...valid, owner: 'component:RadioList', target: 'radio'},
        ],
        canonicalTargets,
      ),
    ).toEqual([]);
    expect(
      validateDelegations(
        [{...valid, owner: 'component:Button', target: 'radio'}],
        canonicalTargets,
      ).join('\n'),
    ).toMatch(
      /radio.*component:Button.*button.*component:Indicator.*component:RadioList/,
    );
  });

  it('accepts a target owned by a member of an active family', () => {
    const families = new Map([
      [
        'family:actions',
        {
          filePath: 'docs/families/actions.md',
          members: ['component:Button', 'component:Icon'],
        },
      ],
    ]);
    expect(
      validateDelegations(
        [{...valid, owner: 'family:actions'}],
        canonicalTargets,
        families,
      ),
    ).toEqual([]);
  });

  it('rejects an unknown or inactive family owner', () => {
    const problems = validateDelegations(
      [{...valid, owner: 'family:missing'}],
      canonicalTargets,
      new Map(),
    ).join('\n');
    expect(problems).toContain('owner "family:missing"');
    expect(problems).toContain('active family record');
    expect(problems).toContain('target "icon"');
  });

  it('rejects a family target that none of its members owns', () => {
    const families = new Map([
      [
        'family:actions',
        {
          filePath: 'docs/families/actions.md',
          members: ['component:Button'],
        },
      ],
    ]);
    const problems = validateDelegations(
      [{...valid, owner: 'family:actions'}],
      canonicalTargets,
      families,
    ).join('\n');
    expect(problems).toContain('target "icon"');
    expect(problems).toContain('family:actions');
    expect(problems).toContain('docs/families/actions.md');
    expect(problems).toContain(
      'canonical owner for target "icon": "component:Icon"',
    );
  });

  it('matches shared target names only to members of the named family', () => {
    const families = new Map([
      [
        'family:selection',
        {
          filePath: 'docs/families/selection.md',
          members: ['component:Indicator'],
        },
      ],
      [
        'family:actions',
        {
          filePath: 'docs/families/actions.md',
          members: ['component:Button'],
        },
      ],
    ]);
    expect(
      validateDelegations(
        [{...valid, owner: 'family:selection', target: 'radio'}],
        canonicalTargets,
        families,
      ),
    ).toEqual([]);
    const problems = validateDelegations(
      [{...valid, owner: 'family:actions', target: 'radio'}],
      canonicalTargets,
      families,
    ).join('\n');
    expect(problems).toContain('family:actions');
    expect(problems).toContain('"component:Indicator", "component:RadioList"');
  });

  it.each([
    ['draft', {}],
    [
      'current',
      {
        authority: 'current',
        approved_by: 'cixzhang',
        approved_at: '2026-08-30',
      },
    ],
  ])(
    'rejects an invalid delegation from an active %s record end to end',
    async (authority, overrides) => {
      const root = fixtureRoot();
      const directory = path.join(root, 'packages/core/src/Button');
      fs.mkdirSync(directory);
      writeButtonDoc(directory);
      fs.writeFileSync(
        path.join(directory, 'Button.spec.md'),
        withAnatomyTheming(componentRecord(overrides), {
          Root: {target: 'button'},
          Label: {inherits: 'button'},
          Icon: {
            delegatesTo: {
              owner:
                authority === 'draft' ? 'component:Missing' : 'family:missing',
              target: 'icon',
            },
          },
          Content: {
            none: {reason: 'intentional: Consumer-owned content.'},
          },
        }),
      );

      const problems = (await validateKnowledgeRoot(root)).join('\n');
      expect(problems).toContain('theming anatomy "Icon".delegatesTo');
      expect(problems).toContain(
        authority === 'draft' ? 'component:Missing' : 'family:missing',
      );
    },
  );

  it('does not validate delegations from archived records', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    writeButtonDoc(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      withAnatomyTheming(
        componentRecord({
          authority: 'archived',
          archive_reason: 'historical',
        }),
        {
          Root: {target: 'button'},
          Label: {inherits: 'button'},
          Icon: {
            delegatesTo: {owner: 'family:missing', target: 'icon'},
          },
          Content: {
            none: {reason: 'intentional: Consumer-owned content.'},
          },
        },
      ),
    );

    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('accepts every authored delegation in the existing records', async () => {
    expect(await validateKnowledgeRoot(repoRoot)).toEqual([]);
  }, 60_000);
});

describe('knowledge validation', () => {
  it('parses only top-level frontmatter and level-two sections', () => {
    const document = parseKnowledgeDocument(
      '---\nschema_version: 1\nowners:\n  [\n    one,\n    two,\n  ]\n---\n\n## Intent\n',
    );
    expect(document.frontmatter.get('schema_version')).toBe(1);
    expect(document.frontmatter.get('owners')).toEqual(['one', 'two']);
    expect(document.sections).toEqual(['Intent']);
  });

  it('accepts aligned templates with no records', async () => {
    expect(await validateKnowledgeRoot(fixtureRoot())).toEqual([]);
  });

  it('rejects a structural template change without a schema update', async () => {
    const root = fixtureRoot();
    const template = path.join(
      root,
      'docs/templates/knowledge/component-spec.md',
    );
    fs.appendFileSync(template, '\n## Undeclared section\n');
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /template section order must exactly match the schema/,
    );
  });

  it('rejects a schema whose filename and declared version disagree', async () => {
    const root = fixtureRoot();
    const schemaPath = path.join(root, 'docs/schemas/knowledge/v1.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    schema.schemaVersion = 2;
    fs.writeFileSync(schemaPath, `${JSON.stringify(schema)}\n`);
    await expect(validateKnowledgeRoot(root)).rejects.toThrow(
      /declares schemaVersion 2/,
    );
  });

  it('accepts a draft component record on the current schema', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'Button.spec.md'), componentRecord());
    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('accepts a flat public member record backed by the root consumer doc', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/NavMenu');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'NavMenu.doc.mjs'),
      "export const docs = {name: 'NavHeadingMenu'};\n",
    );
    fs.writeFileSync(
      path.join(directory, 'NavHeadingMenu.spec.md'),
      componentRecord({id: 'component:NavHeadingMenu'}),
    );

    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('accepts a flat public member record backed by a full inline consumer entry', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Table');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Table.doc.mjs'),
      `export const docs = {
  name: 'Table',
  components: [{name: 'TableRow', description: 'A public row.', props: []}],
};\n`,
    );
    fs.writeFileSync(
      path.join(directory, 'TableRow.spec.md'),
      componentRecord({id: 'component:TableRow'}),
    );

    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('rejects a flat component record unrelated to its component root', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    const parentDoc = writeButtonDoc(directory).replace(
      '  usage: {',
      "  components: [{name: 'Wrong', projection: {anatomy: []}}],\n  usage: {",
    );
    fs.writeFileSync(path.join(directory, 'Button.doc.mjs'), parentDoc);
    fs.writeFileSync(
      path.join(directory, 'Wrong.spec.md'),
      componentRecord({id: 'component:Wrong'}),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /flat component record component:Wrong must match component root "Button" or an exact public component entry/,
    );
  });

  it('discovers a nested module beside its flat parent and ignores non-record trees', async () => {
    const root = fixtureRoot();
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    const modulePath = path.join(
      componentDirectory,
      'plugins/thing/useButtonThing.spec.md',
    );
    fs.mkdirSync(path.dirname(modulePath), {recursive: true});
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord({modules: '[module:Button/useButtonThing]'}),
    );
    fs.writeFileSync(modulePath, moduleRecord());

    const ignored = [
      '__fixtures__/fixture.spec.md',
      '__generated__/generated.spec.md',
      '__tests__/test.spec.md',
      '.hidden/hidden.spec.md',
      '.hidden.spec.md',
      'fixtures/fixture.spec.md',
      'generated/generated.spec.md',
      'node_modules/dependency.spec.md',
      'plugins/thing/snapshot.generated.spec.md',
    ];
    for (const relative of ignored) {
      const ignoredPath = path.join(componentDirectory, relative);
      fs.mkdirSync(path.dirname(ignoredPath), {recursive: true});
      fs.writeFileSync(ignoredPath, moduleRecord());
    }
    const topLevelIgnored = path.join(
      root,
      'packages/core/src/__tests__/TopLevel.spec.md',
    );
    fs.mkdirSync(path.dirname(topLevelIgnored), {recursive: true});
    fs.writeFileSync(topLevelIgnored, moduleRecord());

    const discovered = discoverKnowledgeRecords(root).map(filePath =>
      path.relative(root, filePath).split(path.sep).join('/'),
    );
    expect(discovered).toContain('packages/core/src/Button/Button.spec.md');
    expect(discovered).toContain(
      'packages/core/src/Button/plugins/thing/useButtonThing.spec.md',
    );
    for (const relative of ignored) {
      expect(discovered).not.toContain(`packages/core/src/Button/${relative}`);
    }
    expect(discovered).not.toContain(
      'packages/core/src/__tests__/TopLevel.spec.md',
    );
    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('rejects a nested component record instead of treating it as a module', async () => {
    const root = fixtureRoot();
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    const nestedPath = path.join(componentDirectory, 'notes/Extra.spec.md');
    fs.mkdirSync(path.dirname(nestedPath), {recursive: true});
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord(),
    );
    fs.writeFileSync(nestedPath, componentRecord({id: 'component:Extra'}));

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /nested records use kind: module/,
    );
  });

  it('rejects a direct-child module record', async () => {
    const root = fixtureRoot();
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(componentDirectory, {recursive: true});
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord({modules: '[module:Button/useButtonThing]'}),
    );
    fs.writeFileSync(
      path.join(componentDirectory, 'useButtonThing.spec.md'),
      moduleRecord(),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /module records must be nested beneath their component root/,
    );
  });

  it('rejects missing parent links and orphan module records', async () => {
    const root = fixtureRoot();
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    const modulePath = path.join(
      componentDirectory,
      'plugins/orphan/useOrphan.spec.md',
    );
    fs.mkdirSync(path.dirname(modulePath), {recursive: true});
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord({modules: '[module:Button/useMissing]'}),
    );
    fs.writeFileSync(
      modulePath,
      moduleRecord({
        id: 'module:Button/useOrphan',
        parent_component: 'component:Button',
      }),
    );

    const problems = (await validateKnowledgeRoot(root)).join('\n');
    expect(problems).toMatch(
      /modules reference module:Button\/useMissing does not resolve/,
    );
    expect(problems).toMatch(/module module:Button\/useOrphan is orphaned/);
  });

  it('rejects mismatched parent declarations and component roots', async () => {
    const root = fixtureRoot();
    const buttonDirectory = path.join(root, 'packages/core/src/Button');
    const otherDirectory = path.join(root, 'packages/core/src/Other');
    const modulePath = path.join(
      otherDirectory,
      'plugins/thing/useButtonThing.spec.md',
    );
    fs.mkdirSync(buttonDirectory, {recursive: true});
    fs.mkdirSync(path.dirname(modulePath), {recursive: true});
    fs.writeFileSync(
      path.join(buttonDirectory, 'Button.spec.md'),
      componentRecord({modules: '[module:Other/useButtonThing]'}),
    );
    fs.writeFileSync(
      path.join(otherDirectory, 'Other.spec.md'),
      componentRecord({
        id: 'component:Other',
        modules: '[module:Other/useButtonThing]',
      }),
    );
    fs.writeFileSync(
      modulePath,
      moduleRecord({
        id: 'module:Other/useButtonThing',
        parent_component: 'component:Other',
      }),
    );

    const problems = (await validateKnowledgeRoot(root)).join('\n');
    expect(problems).toMatch(
      /Button\.spec\.md: modules reference module:Other\/useButtonThing, but that module declares parent_component "component:Other"/,
    );
    expect(problems).toMatch(/must live in the same component root/);
  });

  it('requires parent_component to resolve to a component record', async () => {
    const root = fixtureRoot();
    const familyTemplate = fs.readFileSync(
      path.join(root, 'docs/templates/knowledge/family-contract.md'),
      'utf8',
    );
    fs.writeFileSync(
      path.join(root, 'docs/families/not-a-component.md'),
      familyTemplate.replace(
        'id: family:<family-name>',
        'id: component:Button',
      ),
    );
    const modulePath = path.join(
      root,
      'packages/core/src/Button/plugins/thing/useButtonThing.spec.md',
    );
    fs.mkdirSync(path.dirname(modulePath), {recursive: true});
    fs.writeFileSync(modulePath, moduleRecord());

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /parent_component component:Button must resolve to a component record, not family/,
    );
  });

  it('requires parent module links to resolve to module records', async () => {
    const root = fixtureRoot();
    const familyTemplate = fs.readFileSync(
      path.join(root, 'docs/templates/knowledge/family-contract.md'),
      'utf8',
    );
    fs.writeFileSync(
      path.join(root, 'docs/families/actions.md'),
      familyTemplate.replace('family:<family-name>', 'family:actions'),
    );
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(componentDirectory, {recursive: true});
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord({modules: '[family:actions]'}),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /modules reference family:actions must resolve to a module record, not family/,
    );
  });

  it('rejects duplicate module links and duplicate module ids', async () => {
    const root = fixtureRoot();
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(componentDirectory, {recursive: true});
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord({
        modules: '[module:Button/useButtonThing,module:Button/useButtonThing]',
      }),
    );
    for (const owner of ['first', 'second']) {
      const modulePath = path.join(
        componentDirectory,
        `plugins/${owner}/useButtonThing.spec.md`,
      );
      fs.mkdirSync(path.dirname(modulePath), {recursive: true});
      fs.writeFileSync(modulePath, moduleRecord());
    }

    const problems = (await validateKnowledgeRoot(root)).join('\n');
    expect(problems).toMatch(/duplicate id module:Button\/useButtonThing/);
    expect(problems).toMatch(
      /modules contains duplicate reference module:Button\/useButtonThing/,
    );
  });

  it('requires module ids and filenames to encode the same public name', async () => {
    const root = fixtureRoot();
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    const modulePath = path.join(
      componentDirectory,
      'plugins/thing/WrongName.spec.md',
    );
    fs.mkdirSync(path.dirname(modulePath), {recursive: true});
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord({modules: '[module:Button/useButtonThing]'}),
    );
    fs.writeFileSync(modulePath, moduleRecord());

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /module filename must be useButtonThing\.spec\.md/,
    );
  });

  it('validates module anatomy only against the module consumer doc', async () => {
    const root = fixtureRoot();
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    const modulePath = path.join(
      componentDirectory,
      'plugins/thing/useButtonThing.spec.md',
    );
    fs.mkdirSync(path.dirname(modulePath), {recursive: true});
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord({modules: '[module:Button/useButtonThing]'}),
    );
    fs.writeFileSync(
      path.join(componentDirectory, 'useButtonThing.doc.mjs'),
      `export const docs = {
  name: 'useButtonThing',
  usage: {
    anatomy: [
      {name: 'Generated control', required: true, description: 'Generated UI.'},
    ],
  },
  theming: {
    targets: [{className: 'astryx-button-thing'}],
  },
};\n`,
    );
    fs.writeFileSync(
      modulePath,
      withAnatomyTheming(moduleRecord(), {
        'Generated control': {target: 'button-thing'},
      }),
    );

    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('never validates a module map against parent aggregate anatomy', async () => {
    const root = fixtureRoot();
    const componentDirectory = path.join(root, 'packages/core/src/Button');
    const modulePath = path.join(
      componentDirectory,
      'plugins/thing/useButtonThing.spec.md',
    );
    fs.mkdirSync(path.dirname(modulePath), {recursive: true});
    const parentDoc = writeButtonDoc(componentDirectory).replace(
      '  usage: {',
      "  components: [{name: 'useButtonThing'}],\n  usage: {",
    );
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.doc.mjs'),
      parentDoc,
    );
    fs.writeFileSync(
      path.join(componentDirectory, 'Button.spec.md'),
      componentRecord({modules: '[module:Button/useButtonThing]'}),
    );
    fs.writeFileSync(
      modulePath,
      withAnatomyTheming(moduleRecord(), {Root: {target: 'button'}}),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /no exact consumer doc entry for module useButtonThing/,
    );
  });

  it('discovers only the exact canonical package-local theme record without placement errors', async () => {
    const root = fixtureRoot();
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord(),
    );
    fs.writeFileSync(
      path.join(root, 'docs/themes/README.md'),
      '# Guidance only\n',
    );

    const discovered = discoverKnowledgeRecords(root).map(filePath =>
      path.relative(root, filePath),
    );
    expect(discovered).toContain('packages/themes/neutral/neutral.spec.md');
    expect(discovered).not.toContain('docs/themes/README.md');
    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it.each([
    [
      'docs guidance directory',
      'docs/themes/neutral.md',
      /theme records must be placed at packages\/themes\/<theme>\/<theme>\.spec\.md/,
    ],
    [
      'wrong package filename',
      'packages/themes/neutral/Theme.spec.md',
      /theme record must be placed exactly at packages\/themes\/neutral\/neutral\.spec\.md/,
    ],
    [
      'nested package path',
      'packages/themes/neutral/subdir/neutral.spec.md',
      /theme record must be placed exactly at packages\/themes\/neutral\/neutral\.spec\.md/,
    ],
  ])(
    'rejects a theme-shaped record in the %s',
    async (_name, relative, error) => {
      const root = fixtureRoot();
      const absolute = path.join(root, relative);
      fs.mkdirSync(path.dirname(absolute), {recursive: true});
      fs.writeFileSync(absolute, themeRecord());

      const discovered = discoverKnowledgeRecords(root).map(filePath =>
        path.relative(root, filePath),
      );
      expect(discovered).toContain(relative);
      expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(error);
    },
  );

  it('accepts derived repo-owner approval on a current theme record', async () => {
    const root = fixtureRoot();
    writeCurrentArchitecture(root);
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        approved_by: 'rubyycheung',
        approved_at: '2026-08-31',
      }),
    );

    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('does not inherit v1 approvalOwners for theme approval', async () => {
    const root = fixtureRoot();
    writeCurrentArchitecture(root);
    for (const ownerFile of ['ENGOWNERS', 'DESIGNOWNERS']) {
      const filePath = path.join(root, `.github/${ownerFile}`);
      fs.writeFileSync(
        filePath,
        fs.readFileSync(filePath, 'utf8').replace(/@cixzhang\b/g, ''),
      );
    }
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        approved_by: 'cixzhang',
        approved_at: '2026-08-31',
      }),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /approved_by to name an authorized owner/,
    );
  });

  it('accepts an ENGOWNER approval on a current theme record', async () => {
    const root = fixtureRoot();
    writeCurrentArchitecture(root);
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        approved_by: 'czarandy',
        approved_at: '2026-08-31',
      }),
    );

    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('rejects a scalar references field on a current theme', async () => {
    const root = fixtureRoot();
    writeCurrentArchitecture(root);
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        approved_by: 'rubyycheung',
        approved_at: '2026-08-31',
        references: 'spec:AST-006',
      }),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /references must be a list/,
    );
  });

  it('does not let a self-declared theme owner approve a current record', async () => {
    const root = fixtureRoot();
    writeCurrentArchitecture(root);
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        additional_owners: '[self-declared-owner]',
        approved_by: 'self-declared-owner',
        approved_at: '2026-08-31',
      }),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /approved_by to name an authorized owner/,
    );
  });

  it('rejects an unresolved reference from a current theme record', async () => {
    const root = fixtureRoot();
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        approved_by: 'rubyycheung',
        approved_at: '2026-08-31',
        references: '[architecture:missing]',
      }),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /references reference architecture:missing does not resolve/,
    );
  });

  it('rejects an unresolved typed reference list from a current theme', async () => {
    const root = fixtureRoot();
    writeCurrentArchitecture(root);
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        approved_by: 'rubyycheung',
        approved_at: '2026-08-31',
        references: '[spec:missing]',
      }),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /references reference spec:missing does not resolve/,
    );
  });

  it('rejects a current theme that relies on a draft deciding spec', async () => {
    const root = fixtureRoot();
    writeCurrentArchitecture(root);
    const specDirectory = path.join(root, 'docs/specs/AST-006');
    fs.mkdirSync(specDirectory);
    const systemTemplate = fs.readFileSync(
      path.join(root, 'docs/templates/knowledge/system-spec.md'),
      'utf8',
    );
    fs.writeFileSync(
      path.join(specDirectory, 'spec.md'),
      systemTemplate.replace('id: spec:AST-000', 'id: spec:AST-006'),
    );
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        approved_by: 'rubyycheung',
        approved_at: '2026-08-31',
        references: '[spec:AST-006]',
      }),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /current records may not rely on non-current spec:AST-006/,
    );
  });

  it('accepts a current theme list reference to a current deciding spec', async () => {
    const root = fixtureRoot();
    writeCurrentArchitecture(root);
    writeSystemSpec(root, 'AST-006', systemSpecRecord({id: 'spec:AST-006'}));
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({
        authority: 'current',
        approved_by: 'rubyycheung',
        approved_at: '2026-08-31',
        references: '[spec:AST-006]',
      }),
    );

    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('rejects duplicate theme ids', async () => {
    const root = fixtureRoot();
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord(),
    );
    fs.writeFileSync(
      path.join(root, 'packages/themes/duplicate/duplicate.spec.md'),
      themeRecord(),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /duplicate id theme:neutral/,
    );
  });

  it('rejects a theme id outside the package-theme-name format', async () => {
    const root = fixtureRoot();
    fs.writeFileSync(
      path.join(root, 'packages/themes/neutral/neutral.spec.md'),
      themeRecord({id: 'theme:Neutral Theme'}),
    );

    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /id must match/,
    );
  });

  it('rejects duplicate authority fields', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord().replace(
        'authority: draft',
        'authority: draft\nauthority: "current"',
      ),
    );
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /duplicate authority fields|duplicate frontmatter field authority/,
    );
  });

  it('requires explicit approval for a current record', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({authority: 'current'}),
    );
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /require approved_by/,
    );
  });

  it('rejects an unauthorized current approval claim', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({
        authority: 'current',
        approved_by: 'someone-else',
        approved_at: '2026-08-30',
      }),
    );
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /authorized owner/,
    );
  });

  it('accepts a current record with an authorized dated approval', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({
        authority: 'current',
        approved_by: 'cixzhang',
        approved_at: '2026-08-30',
      }),
    );
    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('requires a replacement for a superseded archive', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({authority: 'archived', archive_reason: 'superseded'}),
    );
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /require superseded_by/,
    );
  });

  it('rejects a record claiming a future template version', async () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({template_version: '5'}),
    );
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /template_version 5 is newer than 4/,
    );
  });

  it('rejects active records on an old schema', async () => {
    const root = fixtureRoot();
    addSchemaVersion(root, 0);
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({schema_version: '0'}),
    );
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /active component records must use latest schema_version 3 for that kind/,
    );
  });

  it('allows archived records to retain an older available schema', async () => {
    const root = fixtureRoot();
    addSchemaVersion(root, 0);
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({
        schema_version: '0',
        authority: 'archived',
        archive_reason: 'historical',
      }),
    );
    expect(await validateKnowledgeRoot(root)).toEqual([]);
  });

  it('accepts a DESIGNOWNER approval claim on a current design record', async () => {
    const root = fixtureRoot();
    const template = fs.readFileSync(
      path.join(root, 'docs/templates/knowledge/design-spec.md'),
      'utf8',
    );
    const record = template
      .replace('id: design:<surface>', 'id: design:button')
      .replace('authority: draft', 'authority: current')
      .replace('approved_by: null', 'approved_by: rubyycheung')
      .replace('approved_at: null', 'approved_at: 2026-08-30');
    fs.mkdirSync(path.join(root, 'docs/design'), {recursive: true});
    fs.writeFileSync(path.join(root, 'docs/design/button.md'), record);
    expect((await validateKnowledgeRoot(root)).join('\n')).not.toMatch(
      /approved_by to name an authorized owner/,
    );
  });

  it('requires current design records to reference current architecture', async () => {
    const root = fixtureRoot();
    const template = fs.readFileSync(
      path.join(root, 'docs/templates/knowledge/design-spec.md'),
      'utf8',
    );
    const record = template
      .replace('id: design:<surface>', 'id: design:button')
      .replace('authority: draft', 'authority: current')
      .replace('approved_by: null', 'approved_by: cixzhang')
      .replace('approved_at: null', 'approved_at: 2026-08-30')
      .replace(
        'architecture: [architecture:<surface>]',
        'architecture: [architecture:missing]',
      );
    fs.mkdirSync(path.join(root, 'docs/design'), {recursive: true});
    fs.writeFileSync(path.join(root, 'docs/design/button.md'), record);
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /architecture reference architecture:missing does not resolve/,
    );
  });

  it('rejects duplicate logical ids', async () => {
    const root = fixtureRoot();
    for (const name of ['Button', 'Action']) {
      const directory = path.join(root, `packages/core/src/${name}`);
      fs.mkdirSync(directory);
      fs.writeFileSync(
        path.join(directory, `${name}.spec.md`),
        componentRecord(),
      );
    }
    expect((await validateKnowledgeRoot(root)).join('\n')).toMatch(
      /duplicate id component:Button/,
    );
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Hermetic integration authoring checks against the real Core catalogs.
 * @input Integration fixtures and the post-0.7 conflict projection.
 * @output Coverage for replacement validation and public diagnostics.
 * @position Unit coverage; the 0.6.x compatibility shape has its own fixture.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('../../foundation/discovery/template-conflict-release.mjs', () => ({
  expandedTemplateConflictSchemaActive: () => true,
}));
import * as fs from 'node:fs';
import * as path from 'node:path';
import {discoverCoreTemplates} from '../../foundation/discovery/template-adapter.mjs';
import {discoverOwnedComponents} from '../../foundation/discovery/component-discovery.mjs';
import {discoverBuiltinTopics} from '../../foundation/discovery/docs-discovery.mjs';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
import {
  builtinGuideFiles,
  loadTopicModule,
} from '../../foundation/discovery/docs-discovery.mjs';
import {proseWords} from '../../foundation/discovery/copied-passages.mjs';
import {
  integrationComponentConflicts,
  integrationDocConflicts,
  integrationTemplateConflicts,
  shellArg,
} from './authoring-checks.mjs';

let tmpDir;

function writeIntegration({
  id,
  name,
  type = 'block',
  root = tmpDir,
  replacements,
  withSource = true,
}) {
  fs.mkdirSync(root, {recursive: true});
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(root, 'astryx.integration.mjs'),
    `export default {templates: './templates'};\n`,
  );
  const stem = path.join(root, 'templates', id);
  fs.mkdirSync(path.dirname(stem), {recursive: true});
  fs.writeFileSync(
    `${stem}.doc.mjs`,
    `export default {type: '${type}', name: ${JSON.stringify(name)}, description: 'fixture'${replacements?.[id] == null ? '' : `, replaces: ${JSON.stringify(replacements[id])}`}};\n`,
  );
  if (!withSource) return;
  fs.writeFileSync(
    `${stem}.tsx`,
    'export default function Fixture() { return null; }\n',
  );
}

function writeComponentIntegration(componentName) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.integration.mjs'),
    `export default {components: './components'};\n`,
  );
  fs.mkdirSync(path.join(tmpDir, 'components'), {recursive: true});
  fs.writeFileSync(
    path.join(tmpDir, 'components', `${componentName}.doc.mjs`),
    `export default {type: 'component', name: ${JSON.stringify(componentName)}, displayName: ${JSON.stringify(componentName)}, description: 'Fixture component.', props: []};\n`,
  );
  fs.writeFileSync(
    path.join(tmpDir, 'components', `${componentName}.tsx`),
    'export default function Fixture() { return null; }\n',
  );
}

function writeDocIntegration({name, replaces, extendsTopic}) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.integration.mjs'),
    `export default {docs: './docs'};\n`,
  );
  fs.mkdirSync(path.join(tmpDir, 'docs'), {recursive: true});
  const relationship =
    replaces != null
      ? `, replaces: ${JSON.stringify(replaces)}`
      : extendsTopic != null
        ? `, extends: ${JSON.stringify(extendsTopic)}`
        : '';
  fs.writeFileSync(
    path.join(tmpDir, 'docs', `${name}.doc.mjs`),
    `export default {type: 'generic', name: ${JSON.stringify(name)}, title: 'Fixture', description: 'Fixture topic.'${relationship}, sections: [{title: 'Overview', content: [{type: 'prose', text: 'Fixture.'}]}]};\n`,
  );
}

/**
 * A docs-only package with one generic topic per entry: its prose, and
 * optionally a code block and the Core topic it replaces.
 * @param {{name: string, text: string, code?: string, replaces?: string}[]} topics
 */
function writeTopics(topics) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.integration.mjs'),
    `export default {docs: './docs'};\n`,
  );
  fs.mkdirSync(path.join(tmpDir, 'docs'), {recursive: true});
  for (const {name, text, code, replaces, extendsTopic} of topics) {
    const blocks = [{type: 'prose', text}];
    if (code != null) blocks.push({type: 'code', lang: 'text', code});
    const doc = {
      type: 'generic',
      name,
      title: 'Fixture',
      description: 'Fixture topic.',
      ...(replaces == null ? {} : {replaces}),
      ...(extendsTopic == null ? {} : {extends: extendsTopic}),
      sections: [{title: 'Overview', content: blocks}],
    };
    fs.writeFileSync(
      path.join(tmpDir, 'docs', `${name}.doc.mjs`),
      `export default ${JSON.stringify(doc)};\n`,
    );
  }
}

const PASSAGE =
  'Themes cannot style the layer that holds a menu or a popover, so a menu ' +
  'keeps the default surface color until the next release adds a token for it.';

beforeEach(() => {
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-template-conflicts-'),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integrationTemplateConflicts', () => {
  it('warns on an id shared with Core and gives the package-qualified command', async () => {
    const [core] = await discoverCoreTemplates();
    expect(core).toBeDefined();
    writeIntegration({
      id: core.dirName,
      name: 'Integration override',
      type: core.type,
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.type).toBe('integration.template-conflicts');
    expect(result.data.name).toBe('@acme/widgets');
    expect(result.data.issues).toEqual([]);
    expect(result.data.conflicts).toHaveLength(1);
    expect(result.data.conflicts[0]).toMatchObject({
      id: core.dirName,
      severity: 'warning',
      integrationPackage: '@acme/widgets',
      integrationName: 'Integration override',
    });
    expect(result.data.conflicts[0].message).toContain('Consider renaming');
    expect(result.data.conflicts[0].command).toContain(
      `template ${core.dirName} --package @acme/widgets`,
    );
  });

  it('does not flag a shared display name when the ids differ', async () => {
    const [core] = await discoverCoreTemplates();
    expect(core).toBeDefined();
    writeIntegration({
      id: 'integration-only-id',
      name: core.name,
      type: core.type,
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.data.conflicts).toEqual([]);
    expect(result.data.issues).toEqual([]);
  });

  it('loads an installed integration through the same conflict path', async () => {
    const [core] = await discoverCoreTemplates();
    expect(core).toBeDefined();
    const installed = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
    writeIntegration({
      id: core.dirName,
      name: 'Installed override',
      type: core.type,
      root: installed,
    });

    const result = await integrationTemplateConflicts('@acme/widgets', {
      cwd: tmpDir,
    });

    expect(result.data.name).toBe('@acme/widgets');
    expect(result.data.conflicts.map(conflict => conflict.id)).toContain(
      core.dirName,
    );
  });

  it('classifies a valid replacement and points to the Core original', async () => {
    const core = (await discoverCoreTemplates()).find(
      template => template.type === 'page',
    );
    expect(core).toBeDefined();
    writeIntegration({
      id: 'acme-app-shell',
      name: 'Acme app shell',
      type: core.type,
      replacements: {'acme-app-shell': core.dirName},
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual([]);
    expect(result.data.conflicts).toEqual([
      expect.objectContaining({
        id: 'acme-app-shell',
        severity: 'info',
        relationship: 'replaces',
        replaces: core.dirName,
      }),
    ]);
    expect(result.data.conflicts[0].command).toContain(
      `template ${core.dirName} --package @astryxdesign/core`,
    );
  });

  it('reports a replacement target that Core does not provide', async () => {
    writeIntegration({
      id: 'acme-app-shell',
      name: 'Acme app shell',
      type: 'page',
      replacements: {'acme-app-shell': 'missing-core-shell'},
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'missing_template_replacement_target',
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports a replacement declared by a template that cannot be used', async () => {
    const [core] = await discoverCoreTemplates();
    expect(core).toBeDefined();
    writeIntegration({
      id: 'broken-template',
      name: 'Broken template',
      type: core.type,
      replacements: {'broken-template': core.dirName},
      withSource: false,
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid_template_replacement',
          severity: 'error',
          message: expect.stringContaining('cannot be used'),
        }),
      ]),
    );
  });

  it('reports two templates that replace the same Core target as ambiguous', async () => {
    const [core] = await discoverCoreTemplates();
    expect(core).toBeDefined();
    const replacements = {
      'acme-app-shell-a': core.dirName,
      'acme-app-shell-b': core.dirName,
    };
    writeIntegration({
      id: 'acme-app-shell-a',
      name: 'Acme app shell A',
      type: core.type,
      replacements,
    });
    writeIntegration({
      id: 'acme-app-shell-b',
      name: 'Acme app shell B',
      type: core.type,
      replacements,
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'ambiguous_template_replacement',
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports a replacement whose template kind differs from Core', async () => {
    const corePage = (await discoverCoreTemplates()).find(
      template => template.type === 'page',
    );
    expect(corePage).toBeDefined();
    writeIntegration({
      id: 'acme-app-shell',
      name: 'Acme app shell',
      type: 'block',
      replacements: {'acme-app-shell': corePage.dirName},
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid_template_replacement',
          severity: 'error',
          message: expect.stringContaining('same type'),
        }),
      ]),
    );
  });

  it('does not recommend an impossible replacement for a different Core kind', async () => {
    const corePage = (await discoverCoreTemplates()).find(
      template => template.type === 'page',
    );
    expect(corePage).toBeDefined();
    writeIntegration({
      id: corePage.dirName,
      name: 'Acme block with a page id',
      type: 'block',
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});
    const conflict = result.data.conflicts.find(
      item => item.id === corePage.dirName,
    );

    expect(conflict?.relationship).toBe('accidental');
    expect(conflict?.message).toContain(
      'cannot replace a different template kind',
    );
    expect(conflict?.message).toContain('Rename');
    expect(conflict?.message).not.toContain('set replaces');
  });

  it('shell-quotes unusual ids instead of allowing command substitution', () => {
    expect(shellArg('safe/id')).toBe('safe/id');
    expect(shellArg('my$thing')).toBe("'my$thing'");
    expect(shellArg("a'b")).toBe("'a'\\''b'");
    expect(shellArg('foo`id`')).toBe("'foo`id`'");
  });

  it('returns a malformed template once as an invalid_template issue', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      `export default {templates: './templates'};\n`,
    );
    fs.mkdirSync(path.join(tmpDir, 'templates'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'broken.doc.mjs'),
      `throw new Error('broken fixture');\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'broken.tsx'),
      'export default function Broken() { return null; }\n',
    );

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});
    const invalid = result.data.issues.filter(
      issue => issue.code === 'invalid_template',
    );

    expect(result.data.conflicts).toEqual([]);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].message).toContain('broken fixture');
  });

  it('returns structural issues instead of claiming a broken integration is clean', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      `export default {templates: './missing'};\n`,
    );

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.data.conflicts).toEqual([]);
    expect(
      result.data.issues.some(issue => issue.code === 'missing_root'),
    ).toBe(true);
  });
});

describe('integrationComponentConflicts', () => {
  it('warns on a Core component name and gives the package-qualified command', async () => {
    const coreDir = findCoreDir(tmpDir);
    expect(coreDir).not.toBeNull();
    const [core] = discoverOwnedComponents(coreDir, []);
    expect(core).toBeDefined();
    writeComponentIntegration(core.name);

    const result = await integrationComponentConflicts(undefined, {
      cwd: tmpDir,
    });

    expect(result.type).toBe('integration.component-conflicts');
    expect(result.data.issues).toEqual([]);
    expect(result.data.conflicts).toEqual([
      expect.objectContaining({
        name: core.name,
        severity: 'warning',
        integrationPackage: '@acme/widgets',
        command: expect.stringContaining(
          `component ${core.name} --package @acme/widgets`,
        ),
      }),
    ]);
  });

  it('does not flag an integration-only component name', async () => {
    writeComponentIntegration('AcmeOnlyWidget');

    const result = await integrationComponentConflicts(undefined, {
      cwd: tmpDir,
    });

    expect(result.data.conflicts).toEqual([]);
    expect(result.data.issues).toEqual([]);
  });

  it("compares each component doc's props with the component's TypeScript props, as warnings", async () => {
    writeComponentIntegration('AcmeBadge');
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeBadge.doc.mjs'),
      `export default {type: 'component', name: 'AcmeBadge', displayName: 'AcmeBadge', description: 'Fixture component.', props: [{name: 'label', type: 'string', description: 'Text.', required: true}, {name: 'size', type: "'sm' | 'md'", description: 'Size.'}]};\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeBadge.tsx'),
      'export function AcmeBadge(props: {label: string; count?: number}) { return null; }\n',
    );

    const result = await integrationComponentConflicts(undefined, {
      cwd: tmpDir,
    });

    expect(result.data.issues).toEqual([]);
    expect(result.data.propDrift).toMatchObject({
      status: 'checked',
      components: 1,
      unchecked: [],
    });
    expect(
      result.data.propDrift?.findings.map(f => [f.prop, f.kind, f.severity]),
    ).toEqual([
      ['count', 'not_in_doc', 'warning'],
      ['size', 'not_in_code', 'warning'],
    ]);
  });

  it('leaves propDrift out when the package has no components root', async () => {
    writeDocIntegration({name: 'acme-setup'});

    const result = await integrationComponentConflicts(undefined, {
      cwd: tmpDir,
    });

    expect(result.data).not.toHaveProperty('propDrift');
  });
});

describe('integrationDocConflicts', () => {
  it('marks an explicit Core replacement as intentional', async () => {
    const [coreTopic] = Object.keys(discoverBuiltinTopics());
    expect(coreTopic).toBeDefined();
    writeDocIntegration({name: 'acme-setup', replaces: coreTopic});

    const result = await integrationDocConflicts(undefined, {cwd: tmpDir});

    expect(result.type).toBe('integration.doc-conflicts');
    expect(result.data.issues).toEqual([]);
    expect(result.data.findings).toEqual([
      expect.objectContaining({
        topic: 'acme-setup',
        severity: 'info',
        relationship: 'replaces',
        coreTopic,
      }),
    ]);
  });

  it('marks an explicit Core extension as intentional', async () => {
    const [coreTopic] = Object.keys(discoverBuiltinTopics());
    expect(coreTopic).toBeDefined();
    writeDocIntegration({name: 'acme-extra', extendsTopic: coreTopic});

    const result = await integrationDocConflicts(undefined, {cwd: tmpDir});

    expect(result.data.findings).toEqual([
      expect.objectContaining({
        topic: 'acme-extra',
        severity: 'info',
        relationship: 'extends',
        coreTopic,
      }),
    ]);
  });

  it('reports a same-name Core topic without a relationship as accidental', async () => {
    const [coreTopic] = Object.keys(discoverBuiltinTopics());
    expect(coreTopic).toBeDefined();
    writeDocIntegration({name: coreTopic});

    const result = await integrationDocConflicts(undefined, {cwd: tmpDir});

    expect(result.data.findings).toEqual([
      expect.objectContaining({
        topic: coreTopic,
        severity: 'error',
        relationship: 'accidental',
        coreTopic,
      }),
    ]);
    expect(result.data.findings[0].message).toContain(
      `replaces: '${coreTopic}'`,
    );
    expect(result.data.findings[0].message).toContain(
      `extends: '${coreTopic}'`,
    );
  });

  it('reports a Core name as accidental when replacing a different topic', async () => {
    const [replacedCore, nameCore] = Object.keys(discoverBuiltinTopics());
    expect(replacedCore).toBeDefined();
    expect(nameCore).toBeDefined();
    writeDocIntegration({name: nameCore, replaces: replacedCore});

    const result = await integrationDocConflicts(undefined, {cwd: tmpDir});

    expect(result.data.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          topic: nameCore,
          severity: 'info',
          relationship: 'replaces',
          coreTopic: replacedCore,
        }),
        expect.objectContaining({
          topic: nameCore,
          severity: 'error',
          relationship: 'accidental',
          coreTopic: nameCore,
        }),
      ]),
    );
  });

  it('matches Core topic identity case-insensitively like docs lookup', async () => {
    const [coreTopic] = Object.keys(discoverBuiltinTopics());
    expect(coreTopic).toBeDefined();
    const mixedCase = coreTopic.toUpperCase();
    writeDocIntegration({name: mixedCase});

    const result = await integrationDocConflicts(undefined, {cwd: tmpDir});

    expect(result.data.findings).toEqual([
      expect.objectContaining({
        topic: mixedCase,
        severity: 'error',
        relationship: 'accidental',
        coreTopic,
      }),
    ]);
  });
});

describe('integrationDocConflicts copied passages', () => {
  const copied = (/** @type {any} */ result) => result.data.copiedPassages;

  it('lists a passage two of the package topics repeat, and warns about it', async () => {
    writeTopics([
      {name: 'acme-setup', text: `Read this first. ${PASSAGE}`},
      {name: 'acme-menus', text: `${PASSAGE} See the theme guide.`},
    ]);

    const result = await integrationDocConflicts(undefined, {cwd: tmpDir});
    const [issue, ...rest] = copied(result);
    expect(result.data.issues).toEqual([
      {code: 'copied_passage', severity: 'warning', message: issue.message},
    ]);

    expect(rest).toEqual([]);
    // The passage is about menus, so "acme-menus" keeps it.
    expect(issue).toMatchObject({
      topic: 'acme-setup',
      otherTopic: 'acme-menus',
      otherOwner: 'package',
      owner: 'acme-menus',
      section: 'Overview',
      line: 1,
      words: PASSAGE.split(' ').length,
      passages: 1,
    });
    expect(issue.message).toContain(`${PASSAGE.split(' ').length} words`);
    expect(issue.text).toBe(PASSAGE);
    expect(issue.message).toContain(`"${PASSAGE}"`);
    expect(issue.message).toContain(
      '"acme-menus" keeps it: its name, title or section fits the passage.',
    );
    expect(issue.message).toContain(
      'In "acme-setup", replace that whole passage, from its first word to its last, code ticks included, with {@link generic:acme-menus}.',
    );
  });

  it('reports a passage copied from a Core topic, except into the topic that replaces it', async () => {
    const [file] = builtinGuideFiles();
    const coreDoc = /** @type {any} */ (await loadTopicModule(file));
    const coreText = proseWords(coreDoc)
      .slice(0, 30)
      .map(each => each.word)
      .join(' ');

    writeTopics([{name: 'acme-copy', text: coreText}]);
    const [issue] = copied(
      await integrationDocConflicts(undefined, {cwd: tmpDir}),
    );
    expect(issue.otherOwner).toBe('core');
    expect(issue.message).toContain(`the Core topic "${coreDoc.name}"`);
    expect(issue.owner).toBe(coreDoc.name);
    expect(issue.message).toContain(
      `code ticks included, with {@link @astryxdesign/cli:generic:${coreDoc.name}}.`,
    );

    fs.rmSync(path.join(tmpDir, 'docs'), {recursive: true, force: true});
    writeTopics([{name: 'acme-own', text: coreText, replaces: coreDoc.name}]);
    expect(
      copied(await integrationDocConflicts(undefined, {cwd: tmpDir})).filter(
        (/** @type {any} */ each) => each.message.includes(`"${coreDoc.name}"`),
      ),
    ).toEqual([]);
  });

  it('leaves out boilerplate that three topics share', async () => {
    writeTopics([
      {name: 'acme-fonts', text: PASSAGE},
      {name: 'acme-icons', text: PASSAGE},
      {name: 'acme-media', text: PASSAGE},
    ]);

    expect(
      copied(await integrationDocConflicts(undefined, {cwd: tmpDir})),
    ).toEqual([]);
  });

  it('leaves out a run of function words, which states no fact', async () => {
    const glue = 'and it is in the way that you can do it for them';
    writeTopics([
      {name: 'acme-a', text: `Start here. ${glue} first.`},
      {name: 'acme-b', text: `Then ${glue} again.`},
    ]);

    expect(
      copied(await integrationDocConflicts(undefined, {cwd: tmpDir})),
    ).toEqual([]);
  });

  it('leaves out a shared phrase under 10 words, and code', async () => {
    const short = PASSAGE.split(' ').slice(0, 9).join(' ');
    writeTopics([
      {name: 'acme-a', text: PASSAGE},
      {name: 'acme-b', text: short},
      {name: 'acme-c', text: 'Run it.', code: PASSAGE},
    ]);

    expect(
      copied(await integrationDocConflicts(undefined, {cwd: tmpDir})),
    ).toEqual([]);
  });
});

describe('integrationDocConflicts copied passages and extensions', () => {
  const copied = (/** @type {any} */ result) => result.data.copiedPassages;

  it('links to the page an extension shows on, not to the extension', async () => {
    writeTopics([
      {name: 'acme-menus', text: PASSAGE, extendsTopic: 'theme'},
      {name: 'acme-setup', text: `${PASSAGE} Then run setup.`},
    ]);

    const [issue] = copied(
      await integrationDocConflicts(undefined, {cwd: tmpDir}),
    );

    expect(issue).toMatchObject({topic: 'acme-setup', owner: 'acme-menus'});
    expect(issue.message).toContain(
      'with {@link @astryxdesign/cli:generic:theme}.',
    );
  });

  it('says to delete a copy in a topic that extends its owner', async () => {
    writeTopics([
      {name: 'acme-base', text: PASSAGE},
      {name: 'acme-more', text: PASSAGE, extendsTopic: 'acme-base'},
    ]);

    const [issue] = copied(
      await integrationDocConflicts(undefined, {cwd: tmpDir}),
    );

    expect(issue).toMatchObject({topic: 'acme-more', owner: 'acme-base'});
    expect(issue.message).toContain(
      '"acme-more" extends "acme-base", so its sections show on that page: delete the passage from "acme-more"',
    );
    expect(issue.message).not.toContain('{@link');
  });
});

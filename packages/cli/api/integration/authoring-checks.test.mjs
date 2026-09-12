// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Hermetic integration authoring checks against the real Core catalogs.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {discoverCoreTemplates} from '../../foundation/discovery/template-adapter.mjs';
import {discoverOwnedComponents} from '../../foundation/discovery/component-discovery.mjs';
import {discoverBuiltinTopics} from '../../foundation/discovery/docs-discovery.mjs';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
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
}) {
  fs.mkdirSync(root, {recursive: true});
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(root, 'astryx.integration.mjs'),
    `export default {templates: './templates'${replacements == null ? '' : `, templateReplacements: ${JSON.stringify(replacements)}`}};\n`,
  );
  const stem = path.join(root, 'templates', id);
  fs.mkdirSync(path.dirname(stem), {recursive: true});
  fs.writeFileSync(
    `${stem}.template.mjs`,
    `export default {type: '${type}', name: ${JSON.stringify(name)}, description: 'fixture'};\n`,
  );
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

  it('reports a replacement declaration for a template the integration does not provide', async () => {
    const [core] = await discoverCoreTemplates();
    expect(core).toBeDefined();
    writeIntegration({
      id: 'provided-template',
      name: 'Provided template',
      type: core.type,
      replacements: {'missing-template': core.dirName},
    });

    const result = await integrationTemplateConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid_template_replacement',
          severity: 'error',
          message: expect.stringContaining('contributes no usable template'),
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
    expect(conflict?.message).not.toContain('templateReplacements');
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
      path.join(tmpDir, 'templates', 'broken.template.mjs'),
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

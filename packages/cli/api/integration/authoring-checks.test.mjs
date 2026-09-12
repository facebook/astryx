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
import {doc as integrationComponentConflictsDoc} from './integrationComponentConflicts.doc.mjs';

let tmpDir;

function writeIntegration({id, name, type = 'block', root = tmpDir}) {
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
    `${stem}.template.mjs`,
    `export default {type: '${type}', name: ${JSON.stringify(name)}, description: 'fixture'};\n`,
  );
  fs.writeFileSync(
    `${stem}.tsx`,
    'export default function Fixture() { return null; }\n',
  );
}

function writeComponentIntegration(componentName, {replaces, extra = []} = {}) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.integration.mjs'),
    `export default {components: './components'};\n`,
  );
  fs.mkdirSync(path.join(tmpDir, 'components'), {recursive: true});
  for (const component of [{name: componentName, replaces}, ...extra]) {
    const replacement = component.replaces === undefined
      ? ''
      : `, replaces: ${JSON.stringify(component.replaces)}`;
    fs.writeFileSync(
      path.join(tmpDir, 'components', `${component.name}.doc.mjs`),
      `export default {type: 'component', name: ${JSON.stringify(component.name)}, displayName: ${JSON.stringify(component.name)}, description: 'Fixture component.', usage: {description: 'Fixture component.'}, props: []${replacement}};\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'components', `${component.name}.tsx`),
      'export default function Fixture() { return null; }\n',
    );
  }
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

describe('integration component-conflict schema documentation', () => {
  it('documents replacement and stable conflict entry fields', () => {
    const response = integrationComponentConflictsDoc.returns?.find(
      item => item.type === 'integration.component-conflicts',
    );
    expect(response?.description).toContain('replacements');
    for (const field of [
      'name',
      'severity',
      'relationship',
      'target',
      'integrationPackage',
      'message',
      'command',
    ]) {
      expect(response?.description).toContain(field);
    }
  });
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

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

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

  it('warns for Core-documented symbols without top-level catalog records', async () => {
    writeComponentIntegration('Heading', {extra: [{name: 'Code'}]});

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual([]);
    expect(result.data.conflicts.map(conflict => conflict.name).sort()).toEqual([
      'Code',
      'Heading',
    ]);
  });

  it('reports a valid replacement as intentional and gives Core access', async () => {
    const coreDir = findCoreDir(tmpDir);
    const [core] = discoverOwnedComponents(coreDir, []);
    writeComponentIntegration('AcmeReplacement', {replaces: core.name});

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual([]);
    expect(result.data.conflicts).toEqual([]);
    expect(result.data.replacements).toEqual([
      expect.objectContaining({
        name: 'AcmeReplacement',
        relationship: 'replaces',
        target: core.name,
        command: expect.stringContaining(
          `component ${core.name} --package @astryxdesign/core`,
        ),
      }),
    ]);
  });

  it('reports only the configured winning replacement as active', async () => {
    const coreDir = findCoreDir(tmpDir);
    const [core] = discoverOwnedComponents(coreDir, []);
    for (const [packageName, componentName] of [
      ['@one/meta', 'OneReplacement'],
      ['@two/meta', 'TwoReplacement'],
    ]) {
      const packageDir = path.join(
        tmpDir,
        'node_modules',
        ...packageName.split('/'),
      );
      fs.mkdirSync(path.join(packageDir, 'components'), {recursive: true});
      fs.writeFileSync(
        path.join(packageDir, 'package.json'),
        JSON.stringify({name: packageName, version: '1.0.0'}),
      );
      fs.writeFileSync(
        path.join(packageDir, 'astryx.integration.mjs'),
        "export default {components: './components'};\n",
      );
      fs.writeFileSync(
        path.join(packageDir, 'components', `${componentName}.doc.mjs`),
        `export const docs = {name: '${componentName}', displayName: '${componentName}', replaces: '${core.name}', usage: {description: 'Replacement.'}, props: []};\n`,
      );
    }
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      "export default {integrations: ['@one/meta', '@two/meta']};\n",
    );

    const losing = await integrationComponentConflicts('@one/meta', {cwd: tmpDir});
    const winning = await integrationComponentConflicts('@two/meta', {cwd: tmpDir});

    expect(losing.data.replacements).toEqual([]);
    expect(winning.data.replacements).toEqual([
      expect.objectContaining({name: 'TwoReplacement', target: core.name}),
    ]);
  });

  it('does not recommend a second replacement for a same-package native owner', async () => {
    const coreDir = findCoreDir(tmpDir);
    const [core] = discoverOwnedComponents(coreDir, []);
    writeComponentIntegration('AcmeReplacement', {
      replaces: core.name,
      extra: [{name: core.name}],
    });

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});
    const conflict = result.data.conflicts.find(item => item.name === core.name);

    expect(conflict?.message).toContain('second replacement declaration');
    expect(conflict?.message).not.toContain('declaring `replaces');
  });

  it('rejects a replacement component whose own name is a different Core identity', async () => {
    const coreDir = findCoreDir(tmpDir);
    const [ownName, target] = discoverOwnedComponents(coreDir, []);
    writeComponentIntegration(ownName.name, {replaces: target.name});

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'ambiguous_component_replacement',
          severity: 'error',
        }),
      ]),
    );
    expect(result.data.conflicts).toEqual([]);
  });

  it('fails when a replacement target is missing', async () => {
    writeComponentIntegration('AcmeReplacement', {replaces: 'NotAComponent'});

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({code: 'missing_component_replacement', severity: 'error'}),
    ]));
  });

  it('fails when two components replace the same Core target', async () => {
    const coreDir = findCoreDir(tmpDir);
    const [core] = discoverOwnedComponents(coreDir, []);
    writeComponentIntegration('AcmeReplacement', {
      replaces: core.name,
      extra: [{name: 'OtherReplacement', replaces: core.name}],
    });

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({code: 'ambiguous_component_replacement', severity: 'error'}),
    ]));
    expect(result.data.conflicts).toEqual([]);
  });

  it('fails when replaces is not a non-empty string', async () => {
    writeComponentIntegration('AcmeReplacement', {replaces: 42});

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

    expect(result.data.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({code: 'invalid_component', severity: 'error'}),
    ]));
  });

  it('does not report a replacement as active when a malformed sibling withdraws the package', async () => {
    const coreDir = findCoreDir(tmpDir);
    const [core] = discoverOwnedComponents(coreDir, []);
    writeComponentIntegration('AcmeReplacement', {replaces: core.name});
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'Broken.doc.mjs'),
      "export const docs = {name: 'Broken', replaces: null, props: []};\n",
    );

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

    expect(result.data.replacements).toEqual([]);
    expect(result.data.conflicts).toEqual([]);
    expect(result.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({code: 'invalid_component', severity: 'error'}),
      ]),
    );
  });

  it('does not flag an integration-only component name', async () => {
    writeComponentIntegration('AcmeOnlyWidget');

    const result = await integrationComponentConflicts(undefined, {cwd: tmpDir});

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

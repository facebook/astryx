// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Command-level coverage for `astryx doctor integration` authoring checks.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {Command} from 'commander';
import {discoverCoreTemplates} from '../../../foundation/discovery/template-adapter.mjs';
import {discoverOwnedComponents} from '../../../foundation/discovery/component-discovery.mjs';
import {discoverBuiltinTopics} from '../../../foundation/discovery/docs-discovery.mjs';
import {findCoreDir} from '../../../foundation/fs/paths.mjs';
import {registerDoctor} from './doctor.mjs';

let tmpDir;
let previousCwd;
let previousExitCode;
let logCalls;

function createProgram() {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'Output as typed JSON');
  registerDoctor(program);
  return program;
}

function writeIntegration({
  id,
  name = 'Integration template',
  missingRoot = false,
}) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.integration.mjs'),
    `export default {templates: '${missingRoot ? './missing' : './templates'}'};\n`,
  );
  if (missingRoot || id == null) return;
  const stem = path.join(tmpDir, 'templates', id);
  fs.mkdirSync(path.dirname(stem), {recursive: true});
  fs.writeFileSync(
    `${stem}.template.mjs`,
    `export default {type: 'page', name: ${JSON.stringify(name)}, description: 'fixture'};\n`,
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
  previousCwd = process.cwd();
  previousExitCode = process.exitCode;
  process.exitCode = undefined;
  tmpDir = fs.mkdtempSync(
    path.join(previousCwd, '.astryx-doctor-integration-'),
  );
  logCalls = [];
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    logCalls.push(args.join(' '));
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  process.chdir(previousCwd);
  process.exitCode = previousExitCode;
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

describe('doctor integration — command', () => {
  it('prints the authoring subcommands when invoked without a leaf', async () => {
    const writes = [];
    vi.spyOn(process.stdout, 'write').mockImplementation(chunk => {
      writes.push(String(chunk));
      return true;
    });

    await createProgram().parseAsync(['node', 'astryx', 'doctor', 'integration']);

    const output = writes.join('');
    expect(output).toContain('validate [package]');
    expect(output).toContain('templates [package]');
    expect(output).toContain('components [package]');
    expect(output).toContain('docs [package]');
    expect(process.exitCode).toBeUndefined();
  });

  it('templates explains how to check an installed package when no local manifest exists', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({name: 'plain'}));
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'templates',
    ]);

    expect(logCalls.join('\n')).toContain(
      'astryx doctor integration templates <package>',
    );
    expect(process.exitCode).toBeUndefined();
  });

  it('validate keeps the integration.validate JSON contract', async () => {
    writeIntegration({id: 'integration-only'});
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      '--json',
      'doctor',
      'integration',
      'validate',
    ]);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.type).toBe('integration.validate');
    expect(parsed.data.name).toBe('@acme/widgets');
    expect(parsed.data.issues).toEqual([]);
    expect(process.exitCode).toBeUndefined();
  });

  it('templates warns on a Core id and writes the exact --package command', async () => {
    const [core] = await discoverCoreTemplates();
    expect(core).toBeDefined();
    writeIntegration({id: core.dirName});
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'templates',
    ]);

    const output = logCalls.join('\n');
    expect(output).toContain('[warn]');
    expect(output).toContain(core.dirName);
    expect(output).toContain('Consider renaming');
    expect(output).toContain(`--package @acme/widgets`);
    expect(process.exitCode).toBeUndefined();
  });

  it('templates exposes conflicts as structured JSON warnings', async () => {
    const [core] = await discoverCoreTemplates();
    expect(core).toBeDefined();
    writeIntegration({id: core.dirName});
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      '--json',
      'doctor',
      'integration',
      'templates',
    ]);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.type).toBe('integration.template-conflicts');
    expect(parsed.data.conflicts[0]).toMatchObject({
      id: core.dirName,
      severity: 'warning',
      integrationPackage: '@acme/widgets',
    });
    expect(parsed.data.conflicts[0].command).toContain(
      `--package @acme/widgets`,
    );
    expect(process.exitCode).toBeUndefined();
  });

  it('templates exits 1 when structural errors prevent a trustworthy check', async () => {
    writeIntegration({missingRoot: true});
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      '--json',
      'doctor',
      'integration',
      'templates',
    ]);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.data.conflicts).toEqual([]);
    expect(
      parsed.data.issues.some(issue => issue.code === 'missing_root'),
    ).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it('components warns with the exact package-qualified command', async () => {
    const coreDir = findCoreDir(tmpDir);
    expect(coreDir).not.toBeNull();
    const [core] = discoverOwnedComponents(coreDir, []);
    writeComponentIntegration(core.name);
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'components',
    ]);

    const output = logCalls.join('\n');
    expect(output).toContain('[warn]');
    expect(output).toContain(core.name);
    expect(output).toContain(
      `component ${core.name} --package @acme/widgets`,
    );
    expect(process.exitCode).toBeUndefined();
  });

  it('components exposes conflicts as structured JSON warnings', async () => {
    const coreDir = findCoreDir(tmpDir);
    expect(coreDir).not.toBeNull();
    const [core] = discoverOwnedComponents(coreDir, []);
    writeComponentIntegration(core.name);
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      '--json',
      'doctor',
      'integration',
      'components',
    ]);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.type).toBe('integration.component-conflicts');
    expect(parsed.data.conflicts[0]).toMatchObject({
      name: core.name,
      severity: 'warning',
      integrationPackage: '@acme/widgets',
    });
    expect(parsed.data.conflicts[0].command).toContain(
      `--package @acme/widgets`,
    );
    expect(process.exitCode).toBeUndefined();
  });

  it('docs reports an intentional replacement as info', async () => {
    const [coreTopic] = Object.keys(discoverBuiltinTopics());
    writeDocIntegration({name: 'acme-setup', replaces: coreTopic});
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'docs',
    ]);

    const output = logCalls.join('\n');
    expect(output).toContain('[info]');
    expect(output).toContain('Intentional override');
    expect(process.exitCode).toBeUndefined();
  });

  it('docs reports an intentional extension as info', async () => {
    const [coreTopic] = Object.keys(discoverBuiltinTopics());
    writeDocIntegration({name: 'acme-extra', extendsTopic: coreTopic});
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'docs',
    ]);

    const output = logCalls.join('\n');
    expect(output).toContain('[info]');
    expect(output).toContain('Intentional extension');
    expect(process.exitCode).toBeUndefined();
  });

  it('docs exits 1 for an accidental same-name Core topic', async () => {
    const [coreTopic] = Object.keys(discoverBuiltinTopics());
    writeDocIntegration({name: coreTopic});
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      '--json',
      'doctor',
      'integration',
      'docs',
    ]);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.type).toBe('integration.doc-conflicts');
    expect(parsed.data.findings[0]).toMatchObject({
      topic: coreTopic,
      severity: 'error',
      relationship: 'accidental',
    });
    expect(process.exitCode).toBe(1);
  });
});

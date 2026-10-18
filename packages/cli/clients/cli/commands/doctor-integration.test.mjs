// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Command-level coverage for `astryx doctor integration` authoring checks.
 * @input Integration fixtures and the post-0.7 conflict projection.
 * @output Assertions for human and typed command responses.
 * @position CLI adapter coverage; 0.6.x API shape is verified separately.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('../../../foundation/discovery/template-conflict-release.mjs', () => ({
  expandedTemplateConflictSchemaActive: () => true,
}));
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {Command} from 'commander';
import {discoverCoreTemplates} from '../../../foundation/discovery/template-adapter.mjs';
import {discoverOwnedComponents} from '../../../foundation/discovery/component-discovery.mjs';
import {discoverBuiltinTopics} from '../../../foundation/discovery/docs-discovery.mjs';
import {findCoreDir} from '../../../foundation/fs/paths.mjs';
import {registerDoctor} from './doctor.mjs';
import {expectRecordsCarry} from '../../../test-utils/text-projection.mjs';

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
  replacements,
  type = 'page',
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
    `${stem}.doc.mjs`,
    `export default {type: '${type}', name: ${JSON.stringify(name)}, description: 'fixture'${replacements?.[id] == null ? '' : `, replaces: ${JSON.stringify(replacements[id])}`}};\n`,
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

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
    ]);

    const output = writes.join('');
    expect(output).toContain('validate [package]');
    expect(output).toContain('templates [package]');
    expect(output).toContain('components [package]');
    expect(output).toContain('docs [package]');
    expect(process.exitCode).toBeUndefined();
  });

  it('explains the optional package argument in every leaf help', () => {
    const program = createProgram();
    const doctor = program.commands.find(
      command => command.name() === 'doctor',
    );
    const integration = doctor?.commands.find(
      command => command.name() === 'integration',
    );

    for (const leafName of ['validate', 'templates', 'components', 'docs']) {
      const leaf = integration?.commands.find(
        command => command.name() === leafName,
      );
      expect(leaf?.helpInformation(), leafName).toContain(
        'Installed integration package name; omit to',
      );
    }
  });

  it('templates explains how to check an installed package when no local manifest exists', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'plain'}),
    );
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

  it('validate warns about each doc field that does not match its authoring type, and still exits 0', async () => {
    writeIntegration({id: 'hero', name: 'Hero', type: 'block'});
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'validate',
    ]);

    const output = logCalls.join('\n');
    expect(output).toContain('[ok] No integration issues found.');
    expect(output).toMatch(
      /Checking 1 doc\(s\) against the authoring types \(TypeScript \d+\.\d+/,
    );
    expect(output).toContain('templates/hero.doc.mjs');
    expect(output).toMatch(/export:\s+default/);
    expect(output).toMatch(/type:\s+TemplateDoc/);
    expect(output).toContain(
      'Add `aspectRatio`: BlockTemplateDoc requires it.',
    );
    expect(output).toContain(
      'Add `displayName`: BlockTemplateDoc requires it.',
    );
    expect(output).toContain(
      '2 doc field(s) in 1 file(s) do not match the authoring types.',
    );
    expect(process.exitCode).toBeUndefined();
  });

  it('validate says there is no doc to type-check, rather than asking for TypeScript', async () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-no-docs-'));
    try {
      fs.writeFileSync(
        path.join(outside, 'package.json'),
        JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
      );
      fs.writeFileSync(
        path.join(outside, 'astryx.integration.mjs'),
        "export default {components: './components'};\n",
      );
      fs.mkdirSync(path.join(outside, 'components'));
      fs.writeFileSync(
        path.join(outside, 'components', 'Widget.tsx'),
        'export function Widget() { return null; }\n',
      );
      process.chdir(outside);

      await createProgram().parseAsync([
        'node',
        'astryx',
        'doctor',
        'integration',
        'validate',
      ]);

      const output = logCalls.join('\n');
      expect(output).toContain('[info] No doc files to type-check.');
      expect(output).not.toContain('Docs not type-checked');
      expect(output).not.toContain('against the authoring types');
    } finally {
      process.chdir(previousCwd);
      fs.rmSync(outside, {recursive: true, force: true});
    }
  });

  it('validate reports the doc type check as additive JSON', async () => {
    writeIntegration({id: 'hero', name: 'Hero', type: 'block'});
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
    expect(parsed.data.issues).toEqual([]);
    expect(parsed.data.docTypes).toMatchObject({
      status: 'checked',
      docs: 1,
      unchecked: [],
    });
    expect(parsed.data.docTypes.typescript).toMatch(/^\d+\.\d+/);
    expect(parsed.data.docTypes.findings).toEqual([
      expect.objectContaining({
        doc: 'templates/hero.doc.mjs',
        export: 'default',
        type: 'TemplateDoc',
        field: 'aspectRatio',
        problem: 'missing_field',
        severity: 'warning',
      }),
      expect.objectContaining({field: 'displayName', problem: 'missing_field'}),
    ]);
    expect(process.exitCode).toBeUndefined();
  });

  it('validate says, in one visible line, that docs were not type-checked when the project has no TypeScript', async () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-no-ts-'));
    const inside = tmpDir;
    try {
      // The fixture helpers write to tmpDir; point it outside the repository,
      // where no TypeScript resolves, and restore it for afterEach.
      tmpDir = outside;
      writeIntegration({id: 'hero', name: 'Hero', type: 'block'});
      tmpDir = inside;
      process.chdir(outside);

      await createProgram().parseAsync([
        'node',
        'astryx',
        'doctor',
        'integration',
        'validate',
      ]);

      const output = logCalls.join('\n');
      expect(output).toContain(
        '[skip] Docs not type-checked: TypeScript is not installed in this project',
      );
      expect(output).not.toContain('Checking docs against the authoring types');
      expect(process.exitCode).toBeUndefined();
    } finally {
      process.chdir(previousCwd);
      fs.rmSync(outside, {recursive: true, force: true});
    }
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

  it('templates reports an intentional replacement and the Core-original command', async () => {
    const core = (await discoverCoreTemplates()).find(
      template => template.type === 'page',
    );
    expect(core).toBeDefined();
    writeIntegration({
      id: 'acme-app-shell',
      type: core.type,
      replacements: {'acme-app-shell': core.dirName},
    });
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
    expect(parsed.data.issues).toEqual([]);
    expect(parsed.data.conflicts).toEqual([
      expect.objectContaining({
        id: 'acme-app-shell',
        relationship: 'replaces',
        replaces: core.dirName,
        severity: 'info',
      }),
    ]);
    expect(parsed.data.conflicts[0].command).toContain(
      `--package @astryxdesign/core`,
    );
    expect(process.exitCode).toBeUndefined();
  });

  it('templates exits 1 for a missing replacement target', async () => {
    writeIntegration({
      id: 'acme-app-shell',
      replacements: {'acme-app-shell': 'missing-core-shell'},
    });
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
    expect(parsed.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'missing_template_replacement_target',
          severity: 'error',
        }),
      ]),
    );
    expect(process.exitCode).toBe(1);
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

  it('components exits 1 when Core is missing, with no [ok] after the failure', async () => {
    // Outside the repo, so nothing above the package resolves Core.
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-no-core-'));
    const previousTmp = tmpDir;
    tmpDir = outside;
    try {
      writeComponentIntegration('AcmeCarousel');
      expect(findCoreDir(outside)).toBeNull();
      process.chdir(outside);

      await createProgram().parseAsync([
        'node',
        'astryx',
        'doctor',
        'integration',
        'components',
      ]);

      const printed = logCalls.join('\n');
      expect(printed).toContain('core_not_found');
      expect(printed).not.toContain('[ok]');
      // No TypeScript out here either: the props comparison says it skipped.
      expect(printed).toContain(
        '[skip] Props not compared: TypeScript is not installed in this project',
      );
      expect(process.exitCode).toBe(1);
    } finally {
      tmpDir = previousTmp;
      process.chdir(previousCwd);
      fs.rmSync(outside, {recursive: true, force: true});
    }
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
    expect(output).toContain(`component ${core.name} --package @acme/widgets`);
    expect(process.exitCode).toBeUndefined();
  });

  it('components prints each documented prop that differs from the code, and still exits 0', async () => {
    writeComponentIntegration('AcmeBadge');
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeBadge.doc.mjs'),
      `export default {type: 'component', name: 'AcmeBadge', displayName: 'AcmeBadge', description: 'Fixture component.', props: [{name: 'label', type: 'string', description: 'Text.'}]};\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeBadge.tsx'),
      'export function AcmeBadge(props: {label: string}) { return null; }\n',
    );
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'components',
    ]);

    const output = logCalls.join('\n');
    expect(output).toMatch(/^kind:\s+required_mismatch$/m);
    expect(output).toContain(
      '"label" is required in the code, but the doc does not mark it required.',
    );
    expect(output).toContain(
      '1 prop(s) differ between the docs and the code in 1 of 1 component(s) compared (TypeScript',
    );
    expect(output).not.toContain('[ok] Documented prop');
    expect(process.exitCode).toBeUndefined();
  });

  it('components compares a hidden doc and a family entry with no record, so their drift is never an [ok]', async () => {
    writeComponentIntegration('AcmeMenu');
    const dir = path.join(tmpDir, 'components');
    fs.writeFileSync(
      path.join(dir, 'AcmeMenu.doc.mjs'),
      `export default {type: 'component', name: 'AcmeMenuRoot', displayName: 'AcmeMenuRoot', description: 'Fixture component.', hiddenComponents: ['AcmeMenuItem'], components: [{name: 'AcmeMenuItem', displayName: 'AcmeMenuItem', description: 'Fixture item.', props: [{name: 'label', type: 'string', description: 'Text.'}]}]};\n`,
    );
    fs.writeFileSync(
      path.join(dir, 'AcmeMenu.tsx'),
      'export function AcmeMenuRoot() { return null; }\nexport function AcmeMenuItem(props: {value?: string}) { return null; }\n',
    );
    fs.writeFileSync(
      path.join(dir, 'AcmeSecret.doc.mjs'),
      `export default {type: 'component', name: 'AcmeSecret', displayName: 'AcmeSecret', description: 'Fixture component.', hidden: true, props: [{name: 'tone', type: 'string', description: 'Tone.'}]};\n`,
    );
    fs.writeFileSync(
      path.join(dir, 'AcmeSecret.tsx'),
      'export function AcmeSecret(props: {size?: number}) { return null; }\n',
    );
    process.chdir(tmpDir);
    const run = async (/** @type {string[]} */ flags) => {
      logCalls.length = 0;
      await createProgram().parseAsync([
        'node',
        'astryx',
        ...flags,
        'doctor',
        'integration',
        'components',
      ]);
      return logCalls.join('\n');
    };

    const report = JSON.parse(await run(['--json'])).data.propDrift;
    const output = await run([]);

    expect(
      report.findings.map(f => `${f.component}.${f.prop} ${f.kind}`),
    ).toEqual([
      'AcmeMenuItem.label not_in_code',
      'AcmeMenuItem.value not_in_doc',
      'AcmeSecret.size not_in_doc',
      'AcmeSecret.tone not_in_code',
    ]);
    expect(output).not.toContain('[ok] Documented prop');
    expect(process.exitCode).toBeUndefined();
  });

  it('components lists props a mapped type builds from keys it cannot trace, and says the [ok] leaves them out', async () => {
    writeComponentIntegration('AcmeChip');
    const dir = path.join(tmpDir, 'components');
    fs.writeFileSync(
      path.join(dir, 'AcmeChip.doc.mjs'),
      `export default {type: 'component', name: 'AcmeChip', displayName: 'AcmeChip', description: 'Fixture.', props: [{name: 'label', type: 'string', description: 'Text.'}]};\n`,
    );
    fs.writeFileSync(
      path.join(dir, 'AcmeChip.tsx'),
      "export function AcmeChip(props: {label?: string} & {[K in `on${Capitalize<'open'>}`]?: () => void}) { return null; }\n",
    );
    process.chdir(tmpDir);
    const run = async (/** @type {string[]} */ flags) => {
      logCalls.length = 0;
      await createProgram().parseAsync([
        'node',
        'astryx',
        ...flags,
        'doctor',
        'integration',
        'components',
      ]);
      return logCalls.join('\n');
    };

    const {propsNotChecked} = JSON.parse(await run(['--json'])).data.propDrift;
    const output = await run([]);

    expect(propsNotChecked).toEqual([
      expect.objectContaining({component: 'AcmeChip', props: ['onOpen']}),
    ]);
    expect(output).toContain(
      '[info] Props not checked for a doc entry in 1 component(s):',
    );
    expect(output).toContain(
      'in 1 component(s), apart from the props not checked (TypeScript',
    );
  });

  it('components compares the entries of a family doc whose own source is missing', async () => {
    writeComponentIntegration('AcmeTabs');
    const dir = path.join(tmpDir, 'components');
    const entry = (/** @type {string} */ name, /** @type {string} */ prop) =>
      `{name: '${name}', displayName: '${name}', description: 'Fixture.', props: [{name: '${prop}', type: 'string', description: 'Text.'}]}`;
    fs.writeFileSync(
      path.join(dir, 'AcmeTabs.doc.mjs'),
      `export default {type: 'component', name: 'AcmeTabs', displayName: 'AcmeTabs', description: 'Fixture.', props: [], hiddenComponents: ['AcmeTabsPanel'], components: [${entry('AcmeTabsItem', 'label')}, ${entry('AcmeTabsPanel', 'ghost')}]};\n`,
    );
    fs.rmSync(path.join(dir, 'AcmeTabs.tsx'), {force: true});
    // The package's entry exports the members, so discovery records the
    // listed one, though the family's own file is missing.
    for (const name of ['AcmeTabsItem', 'AcmeTabsPanel']) {
      fs.writeFileSync(
        path.join(dir, `${name}.tsx`),
        `export function ${name}(props: {label?: string; open?: boolean}) { return null; }\n`,
      );
      fs.appendFileSync(
        path.join(tmpDir, 'index.ts'),
        `export {${name}} from './components/${name}';\n`,
      );
    }
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      '--json',
      'doctor',
      'integration',
      'components',
    ]);
    const report = JSON.parse(logCalls.join('\n')).data.propDrift;

    expect(
      report.findings.map(
        (/** @type {any} */ f) => `${f.component}.${f.prop} ${f.kind}`,
      ),
    ).toEqual([
      'AcmeTabsItem.open not_in_doc',
      'AcmeTabsPanel.ghost not_in_code',
      'AcmeTabsPanel.label not_in_doc',
      'AcmeTabsPanel.open not_in_doc',
    ]);
    expect(report.unchecked).toEqual([
      {
        component: 'AcmeTabs',
        doc: 'components/AcmeTabs.doc.mjs',
        reason: 'no source file for AcmeTabs',
      },
    ]);
  });

  it('components counts two docs of one name as two components, and compares a .doc.ts beside a .doc.mjs', async () => {
    writeComponentIntegration('AcmeTwin');
    const dir = path.join(tmpDir, 'components');
    const doc = (/** @type {string} */ name, /** @type {string} */ prop) =>
      `export default {type: 'component', name: '${name}', displayName: '${name}', description: 'Fixture.', props: [{name: '${prop}', type: 'string', description: 'Text.'}]};\n`;
    fs.writeFileSync(
      path.join(dir, 'AcmeTwin.doc.mjs'),
      doc('AcmeTwin', 'tone'),
    );
    fs.writeFileSync(
      path.join(dir, 'AcmeTwin.doc.ts'),
      doc('AcmeTwin', 'size'),
    );
    fs.writeFileSync(
      path.join(dir, 'AcmeTwin.tsx'),
      'export function AcmeTwin(props: {label?: string}) { return null; }\n',
    );
    for (const folder of ['a', 'b']) {
      fs.mkdirSync(path.join(dir, folder));
      fs.writeFileSync(
        path.join(dir, folder, 'AcmeX.doc.mjs'),
        doc('AcmeX', folder),
      );
      fs.writeFileSync(
        path.join(dir, folder, 'AcmeX.tsx'),
        'export function AcmeX() { return null; }\n',
      );
    }
    process.chdir(tmpDir);
    const run = async (/** @type {string[]} */ flags) => {
      logCalls.length = 0;
      await createProgram().parseAsync([
        'node',
        'astryx',
        ...flags,
        'doctor',
        'integration',
        'components',
      ]);
      return logCalls.join('\n');
    };

    const report = JSON.parse(await run(['--json'])).data.propDrift;
    const output = await run([]);

    expect(
      report.findings
        .filter(f => f.kind === 'not_in_code')
        .map(f => `${f.doc} ${f.prop}`)
        .sort(),
    ).toEqual([
      'components/AcmeTwin.doc.mjs tone',
      'components/AcmeTwin.doc.ts size',
      'components/a/AcmeX.doc.mjs a',
      'components/b/AcmeX.doc.mjs b',
    ]);
    expect(output).toMatch(/ in 4 of 4 component\(s\) compared /);
  });

  it('components prints every field of the props comparison that JSON carries', async () => {
    writeComponentIntegration('AcmeBadge');
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeBadge.doc.mjs'),
      `export default {type: 'component', name: 'AcmeBadge', displayName: 'AcmeBadge', description: 'Fixture component.', props: [${[
        "{name: 'label', type: 'string', description: 'Text.'}",
        "{name: 'elevation', type: 'number', description: 'Shadow.'}",
      ].join(', ')}]};\n`,
    );
    // `key` is a prop a doc never needs, though the component declares it.
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeBadge.tsx'),
      "export function AcmeBadge(props: {label: string; tone?: 'neutral' | 'info'; key?: string}) { return null; }\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeLonely.doc.mjs'),
      `export default {type: 'component', name: 'AcmeLonely', displayName: 'AcmeLonely', description: 'Fixture component.', props: []};\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeLonely.tsx'),
      'export function Other() { return null; }\n',
    );
    process.chdir(tmpDir);
    const run = async (/** @type {string[]} */ flags) => {
      logCalls.length = 0;
      await createProgram().parseAsync([
        'node',
        'astryx',
        ...flags,
        'doctor',
        'integration',
        'components',
      ]);
      return logCalls.join('\n');
    };

    const report = JSON.parse(await run(['--json'])).data.propDrift;
    const output = await run([]);

    expect(report.findings.map(f => `${f.prop} ${f.kind}`)).toEqual([
      'elevation not_in_code',
      'label required_mismatch',
      'tone not_in_doc',
    ]);
    expectRecordsCarry(output, report.findings, ['component', 'prop', 'kind']);
    expectRecordsCarry(output, report.unchecked, ['component', 'reason']);
    expect(output).toContain(
      `in 1 of ${report.components} component(s) compared (TypeScript ${report.typescript}).`,
    );
  });

  it('components says documented props match when they do', async () => {
    writeComponentIntegration('AcmeOnlyWidget');
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'components',
    ]);

    expect(logCalls.join('\n')).toMatch(
      /\[ok\] Documented prop names and required flags match the code in 1 component\(s\) \(TypeScript \d/,
    );
  });

  it('components prints no [ok] for props it could not compare', async () => {
    writeComponentIntegration('AcmeLonely');
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeLonely.tsx'),
      'export function Other() { return null; }\n',
    );
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'components',
    ]);

    const output = logCalls.join('\n');
    expect(output).toContain(
      '[info] Props not compared for 1 documented component(s):',
    );
    expect(output).not.toContain('[ok] Documented prop');
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

  it('docs resolves a link to a component or a template, its own or Core’s, and still flags one that names no doc', async () => {
    const page = (await discoverCoreTemplates()).find(
      template => template.type === 'page',
    );
    expect(page).toBeDefined();
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      "export default {components: './components', templates: './templates', docs: './docs'};\n",
    );
    for (const dir of ['components', 'templates', 'docs']) {
      fs.mkdirSync(path.join(tmpDir, dir), {recursive: true});
    }
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeButton.doc.mjs'),
      "export default {type: 'component', name: 'AcmeButton', displayName: 'Acme Button', description: 'A button.', props: []};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeButton.tsx'),
      'export function AcmeButton() { return null; }\n',
    );
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'acme-card.doc.mjs'),
      "export default {type: 'block', name: 'Acme card', description: 'A card.'};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'acme-card.tsx'),
      'export default function Fixture() { return null; }\n',
    );
    const text =
      'Start with {@link component:AcmeButton} or {@link block:acme-card}, ' +
      'built on {@link @astryxdesign/core:component:Button} and ' +
      `{@link @astryxdesign/core:page:${page?.dirName}}. Not {@link component:AcmeMissing}.`;
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'using-widgets.doc.mjs'),
      `export default ${JSON.stringify({
        type: 'generic',
        name: 'using-widgets',
        title: 'Using widgets',
        description: 'Fixture topic.',
        sections: [{title: 'Overview', content: [{type: 'prose', text}]}],
      })};\n`,
    );
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
    const unresolved = parsed.data.issues
      .filter(issue => issue.code === 'invalid_doc_graph')
      .map(issue => issue.message);
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0]).toContain('"component:AcmeMissing" names no doc');
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

  it('docs exits 1 for a placement that hides a guide, with no [ok] after the failure', async () => {
    writeDocIntegration({name: 'deploying'});
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'deploying.doc.mjs'),
      "export default {type: 'generic', name: 'deploying', title: 'Deploying', description: 'Deploy.', placement: {parent: 'namespace:nope', slot: 'guides'}, sections: [{title: 'Deploy', content: [{type: 'prose', text: 'Deploy.'}]}]};\n",
    );
    process.chdir(tmpDir);

    await createProgram().parseAsync([
      'node',
      'astryx',
      'doctor',
      'integration',
      'docs',
    ]);

    const printed = logCalls.join('\n');
    expect(printed).toContain('[fail]');
    expect(printed).toContain('invalid_doc_graph');
    expect(printed).not.toContain('[ok]');
    expect(process.exitCode).toBe(1);
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

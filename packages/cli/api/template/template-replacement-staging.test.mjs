// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Final-0.6.x compatibility coverage for staged template replacements.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {integrationTemplateConflicts} from '../integration/authoring-checks.mjs';
import {template} from './template.mjs';
import {discoverCoreTemplates} from '../../foundation/discovery/template-adapter.mjs';

let cwd;

function writeTemplate(pkgDir, id, type, replaces) {
  const stem = path.join(pkgDir, 'templates', id);
  fs.mkdirSync(path.dirname(stem), {recursive: true});
  fs.writeFileSync(
    `${stem}.doc.mjs`,
    `export default {type: ${JSON.stringify(type)}, name: ${JSON.stringify(id)}, description: 'fixture'${replaces == null ? '' : `, replaces: ${JSON.stringify(replaces)}`}};\n`,
  );
  fs.writeFileSync(
    `${stem}.tsx`,
    `export default function Fixture() { return ${JSON.stringify(id)}; }\n`,
  );
}

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(process.cwd(), '.astryx-template-staging-'));
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({
      name: 'consumer',
      dependencies: {'@acme/widgets': '1.0.0'},
    }),
  );
  fs.writeFileSync(
    path.join(cwd, 'astryx.config.mjs'),
    `export default {integrations: ['@acme/widgets']};\n`,
  );
});

afterEach(() => {
  fs.rmSync(cwd, {recursive: true, force: true});
});

describe('staged integration template replacements on 0.6.x', () => {
  it('preserves lookup, list output, and the released conflict schema', async () => {
    const corePages = (await discoverCoreTemplates()).filter(
      candidate => candidate.type === 'page',
    );
    const target = corePages[0];
    const accidental = corePages[1];
    expect(target).toBeDefined();
    expect(accidental).toBeDefined();

    const pkgDir = path.join(cwd, 'node_modules', '@acme', 'widgets');
    fs.mkdirSync(path.join(pkgDir, 'templates'), {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        peerDependencies: {'@astryxdesign/cli': '>=0.7.0'},
      }),
    );
    fs.writeFileSync(
      path.join(pkgDir, 'astryx.integration.mjs'),
      `export default {templates: './templates'};\n`,
    );
    writeTemplate(pkgDir, 'acme-future-shell', target.type, target.dirName);
    writeTemplate(pkgDir, accidental.dirName, accidental.type);

    const listed = await template(undefined, {list: true, cwd});
    expect(
      listed.data.find(
        entry =>
          entry.id === target.dirName && entry.package === '@astryxdesign/core',
      ),
    ).toBeDefined();
    expect(
      listed.data.find(entry => entry.id === 'acme-future-shell'),
    ).not.toHaveProperty('replaces');

    const selectedTarget = await template(target.dirName, {show: true, cwd});
    expect(selectedTarget.data.template).toBe(target.dirName);
    expect(selectedTarget.data.source).not.toContain('acme-future-shell');
    const selectedOwnId = await template('acme-future-shell', {
      show: true,
      cwd,
    });
    expect(selectedOwnId.data.source).toContain('acme-future-shell');

    const report = await integrationTemplateConflicts(undefined, {cwd: pkgDir});
    expect(report.data.issues).toEqual([]);
    expect(report.data.conflicts).toHaveLength(1);
    expect(report.data.conflicts[0]).toMatchObject({
      id: accidental.dirName,
      severity: 'warning',
    });
    expect(report.data.conflicts[0]).not.toHaveProperty('relationship');
    expect(report.data.conflicts[0]).not.toHaveProperty('replaces');
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {loadConfig} from './config.mjs';
import {discover} from '../api/discover.mjs';
import {loadGapReportConfig} from '../utils/github.mjs';
import {getTemplateById} from '../api/template.mjs';

let tmpDir;
let originalCwd;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-integration-test-'),
  );
  fs.mkdirSync(path.join(tmpDir, 'node_modules', '@acme', 'widgets'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    `export default { integrations: '@acme/widgets' };\n`,
  );
  fs.writeFileSync(
    path.join(tmpDir, 'node_modules', '@acme', 'widgets', 'package.json'),
    JSON.stringify({
      name: '@acme/widgets',
      version: '1.2.3',
      displayName: 'Acme Widgets',
      astryx: {integration: './astryx.integration.mjs'},
    }),
  );
  fs.writeFileSync(
    path.join(
      tmpDir,
      'node_modules',
      '@acme',
      'widgets',
      'astryx.integration.mjs',
    ),
    `export default {
      name: '@acme/widgets',
      version: '1.2.3',
      displayName: 'Acme Widgets',
      docs: './docs',
      category: 'Acme',
      gapReport: {command: './scripts/report-gap.sh'},
      template: {get: './template.mjs#getTemplate'},
      codemods: [{name: 'noop', from: '0.0.0', to: '9.0.0', transform: './codemod.mjs'}],
    };\n`,
  );
  fs.mkdirSync(path.join(tmpDir, 'node_modules', '@acme', 'widgets', 'docs'));
  fs.writeFileSync(
    path.join(
      tmpDir,
      'node_modules',
      '@acme',
      'widgets',
      'docs',
      'Widget.doc.mjs',
    ),
    `export const doc = {
      name: 'Widget',
      usage: {description: 'Acme widget'},
      props: [],
    };\n`,
  );
  fs.mkdirSync(
    path.join(tmpDir, 'node_modules', '@acme', 'widgets', 'scripts'),
  );
  fs.writeFileSync(
    path.join(
      tmpDir,
      'node_modules',
      '@acme',
      'widgets',
      'scripts',
      'report-gap.sh',
    ),
    '#!/bin/sh\ncat >/dev/null\necho ok\n',
  );
  fs.writeFileSync(
    path.join(tmpDir, 'node_modules', '@acme', 'widgets', 'template.mjs'),
    `export async function getTemplate(id) { return 'template:' + id; }\n`,
  );
  fs.writeFileSync(
    path.join(tmpDir, 'node_modules', '@acme', 'widgets', 'codemod.mjs'),
    `export default function transform() { return undefined; }\n`,
  );
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('configured integrations', () => {
  it('load docs/gap/template/codemod metadata from integration manifests', async () => {
    const config = await loadConfig(tmpDir);
    expect(config.integrations).toEqual(['@acme/widgets']);
    expect(config.loadedIntegrations[0].name).toBe('@acme/widgets');
    expect(config.loadedIntegrations[0].package).toMatchObject({
      name: '@acme/widgets',
      category: 'Acme',
    });
    expect(config.loadedIntegrations[0].codemods[0].transform).toEqual(
      expect.any(Function),
    );
    expect(config.gapReport.command).toBe(
      path.join(
        tmpDir,
        'node_modules',
        '@acme',
        'widgets',
        'scripts',
        'report-gap.sh',
      ),
    );
    await expect(config.template.get('P123')).resolves.toBe('template:P123');
  });

  it('makes integration docs discoverable without packages config', async () => {
    const result = await discover(undefined, {});
    expect(result.type).toBe('discover.list');
    expect(result.data).toEqual([
      expect.objectContaining({
        name: '@acme/widgets',
        category: 'Acme',
        components: ['Widget'],
      }),
    ]);
  });

  it('uses integration gap-report and template hooks', async () => {
    await expect(loadGapReportConfig()).resolves.toMatchObject({
      enabled: true,
      command: path.join(
        tmpDir,
        'node_modules',
        '@acme',
        'widgets',
        'scripts',
        'report-gap.sh',
      ),
    });
    await expect(getTemplateById('P123', {cwd: tmpDir})).resolves.toEqual({
      type: 'template.get',
      data: {id: 'P123', source: 'template:P123'},
    });
  });
});

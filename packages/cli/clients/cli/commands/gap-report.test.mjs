// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {describe, expect, it} from 'vitest';
import {gapReport} from '../../../api/gap-report/gap-report.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

describe('gap-report CLI and API parity', () => {
  it('returns the same category catalog', async () => {
    const api = await gapReport(undefined, {listCategories: true});
    const cli = await runCli(['gap-report', '--list-categories', '--json']);

    expect(cli.status).toBe(0);
    const envelope = JSON.parse(cli.stdout);
    expect({type: envelope.type, data: envelope.data}).toEqual(api);
  });

  it('keeps the global --detail option separate from gap-report context', async () => {
    for (const args of [
      ['--detail', 'compact', 'gap-report', '--list-categories', '--json'],
      ['gap-report', '--list-categories', '--detail', 'compact', '--json'],
    ]) {
      const cli = await runCli(args);
      expect(cli.status).toBe(0);
      expect(JSON.parse(cli.stdout)).toMatchObject({
        type: 'gap-report.categories',
      });
    }
  });

  it('maps --additional-context to the API detail field', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-gap-context-'));
    try {
      fs.writeFileSync(
        path.join(cwd, 'package.json'),
        JSON.stringify({name: 'fixture-app'}),
      );
      fs.writeFileSync(
        path.join(cwd, 'astryx.config.mjs'),
        `export default {
  gapReport: {
    audience: 'internal',
    handle(report) {
      return {status: 'filed', message: report.detail};
    },
  },
};\n`,
      );

      const cli = await runCli(
        [
          'gap-report',
          'Button',
          '--category',
          'docs_gap',
          '--reason',
          'Need a keyboard example',
          '--additional-context',
          'The example must show focus order.',
          '--json',
        ],
        {cwd},
      );

      expect(cli.status).toBe(0);
      expect(JSON.parse(cli.stdout)).toMatchObject({
        type: 'gap-report.file',
        data: {
          deliveries: [
            {
              handler: 'project',
              status: 'filed',
              message: 'The example must show focus order.',
            },
          ],
        },
      });
    } finally {
      fs.rmSync(cwd, {recursive: true, force: true});
    }
  });

  it('returns the same consent-required Core receipt without writing', async () => {
    const options = {
      category: 'docs_gap',
      reason: 'Need a keyboard example',
      cwd: process.cwd(),
    };
    const api = await gapReport('Button', options);
    const cli = await runCli([
      'gap-report',
      'Button',
      '--category',
      'docs_gap',
      '--reason',
      'Need a keyboard example',
      '--json',
    ]);

    expect(cli.status).toBe(0);
    const envelope = JSON.parse(cli.stdout);
    expect({type: envelope.type, data: envelope.data}).toEqual(api);
    expect(envelope.data.status).toBe('consent_required');
  });

  it('keeps the JSON receipt and exits nonzero for a partial fan-out', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-gap-cli-'));
    try {
      fs.writeFileSync(
        path.join(cwd, 'package.json'),
        JSON.stringify({name: 'fixture-app'}),
      );
      fs.writeFileSync(
        path.join(cwd, 'astryx.config.mjs'),
        `export default {
  integrations: ['@test/receiver'],
  gapReport: {
    audience: 'internal',
    handle() { throw new Error('project failed'); },
  },
};\n`,
      );
      const integrationDir = path.join(
        cwd,
        'node_modules',
        '@test',
        'receiver',
      );
      fs.mkdirSync(integrationDir, {recursive: true});
      fs.writeFileSync(
        path.join(integrationDir, 'package.json'),
        JSON.stringify({name: '@test/receiver', version: '1.0.0'}),
      );
      fs.writeFileSync(
        path.join(integrationDir, 'astryx.integration.mjs'),
        `export const gapReport = {
  audience: 'internal',
  handle() { return {status: 'filed', message: 'received'}; },
};
export default {};\n`,
      );

      const cli = await runCli(
        [
          'gap-report',
          'Button',
          '--category',
          'docs_gap',
          '--reason',
          'Need a keyboard example',
          '--json',
        ],
        {cwd},
      );

      expect(cli.status).toBe(1);
      expect(JSON.parse(cli.stdout)).toMatchObject({
        type: 'gap-report.file',
        data: {
          status: 'partial',
          filedCount: 1,
          deliveries: [
            {handler: 'project', status: 'failed'},
            {handler: '@test/receiver', status: 'filed'},
          ],
        },
      });
    } finally {
      fs.rmSync(cwd, {recursive: true, force: true});
    }
  });

  it('reports missing required fields through the JSON error contract', async () => {
    const cli = await runCli(['gap-report', 'Button', '--json']);
    expect(cli.status).toBe(1);
    expect(JSON.parse(cli.stdout)).toMatchObject({
      code: 'ERR_MISSING_ARGUMENT',
    });
  });

  it('uses the existing unknown-category error code', async () => {
    const cli = await runCli([
      'gap-report',
      'Button',
      '--category',
      'not_real',
      '--reason',
      'Need something else',
      '--json',
    ]);
    expect(cli.status).toBe(1);
    expect(JSON.parse(cli.stdout)).toMatchObject({
      code: 'ERR_UNKNOWN_CATEGORY',
    });
  });
});

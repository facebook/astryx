// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {ASTRYX_VANILLA_CDN_REF} from '../../../api/template/html/html.mjs';

const FIXTURE = path.resolve(
  import.meta.dirname,
  '../../../test/fixtures/vanilla-project',
);
const SLOW = 30_000;

async function json(args) {
  const result = await runCli(['--json', ...args], FIXTURE);
  return {...result, payload: JSON.parse(result.stdout)};
}

describe('vanilla HTML CLI forms', () => {
  it(
    'prints one component markup file',
    async () => {
      const result = await runCli(['component', 'Button', '--html'], FIXTURE);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain(
        '<!-- docs: A button triggers an action. -->',
      );
      expect(result.stdout).toContain('<!-- variant: primary -->');
    },
    SLOW,
  );

  it(
    'lists component markup files',
    async () => {
      const result = await json(['component', '--list', '--html']);
      expect(result.code).toBe(0);
      expect(result.payload).toMatchObject({
        type: 'component.html.list',
        data: [{name: 'Button', file: 'Button.html'}],
      });
    },
    SLOW,
  );

  it(
    'prints one standalone template with the pinned default ref',
    async () => {
      const result = await json(['template', 'dashboard', '--html']);
      expect(result.code).toBe(0);
      expect(result.payload.type).toBe('template.html');
      expect(result.payload.data.cdnRef).toBe(ASTRYX_VANILLA_CDN_REF);
      expect(result.payload.data.source).not.toContain(
        '__ASTRYX_VANILLA_CDN__',
      );
      expect(result.payload.data.source).toContain(
        `https://cdn.jsdelivr.net/gh/facebook/astryx@${ASTRYX_VANILLA_CDN_REF}/packages/vanilla/dist`,
      );
    },
    SLOW,
  );

  it(
    'lists standalone template files',
    async () => {
      const result = await json(['template', '--list', '--html']);
      expect(result.code).toBe(0);
      expect(result.payload).toMatchObject({
        type: 'template.html.list',
        data: [{id: 'dashboard', file: 'dashboard.html'}],
      });
    },
    SLOW,
  );

  it(
    'explains an empty standalone template list',
    async () => {
      const empty = fs.mkdtempSync(
        path.join(os.tmpdir(), 'astryx-vanilla-empty-'),
      );
      fs.mkdirSync(path.join(empty, 'packages/vanilla/templates'), {
        recursive: true,
      });
      try {
        const result = await runCli(['template', '--list', '--html'], empty);
        expect(result.code).toBe(0);
        expect(result.stdout).toContain('No vanilla HTML templates found');
      } finally {
        fs.rmSync(empty, {recursive: true, force: true});
      }
    },
    SLOW,
  );

  it(
    'overrides the CDN ref for one template',
    async () => {
      const result = await json([
        'template',
        'dashboard',
        '--html',
        '--cdn-ref',
        'abc1234',
      ]);
      expect(result.payload.data.cdnRef).toBe('abc1234');
      expect(result.payload.data.source).toContain(
        '@abc1234/packages/vanilla/dist',
      );
    },
    SLOW,
  );
});

describe('vanilla HTML CLI validation', () => {
  it.each([
    [['component', '--html'], /requires a component name or --list/],
    [
      ['component', 'Button', '--list', '--html'],
      /cannot be combined with a component name/,
    ],
    [
      ['component', 'Button', '--html', '--source'],
      /cannot be combined with --source/,
    ],
    [['template', '--html'], /requires a template id or --list/],
    [
      ['template', 'dashboard', 'out.html', '--html'],
      /cannot be combined with <path>/,
    ],
    [
      ['template', 'dashboard', '--html', '--cdn'],
      /cannot be combined with --cdn/,
    ],
    [
      ['template', 'dashboard', '--html', '--skeleton'],
      /cannot be combined with --skeleton/,
    ],
    [['template', 'dashboard', '--cdn-ref', 'abc1234'], /requires --html/],
    [
      ['template', '--list', '--html', '--cdn-ref', 'abc1234'],
      /only valid with a named --html template/,
    ],
  ])(
    'rejects %j clearly',
    async (args, message) => {
      const result = await json(args);
      expect(result.code).toBe(1);
      expect(result.payload.code).toBe('ERR_INVALID_ARGUMENT');
      expect(result.payload.error).toMatch(message);
    },
    SLOW,
  );
});

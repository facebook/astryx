// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression coverage for component docs in no-build/CDN projects where
 * @astryxdesign/core is intentionally not installed.
 */

import {describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {component} from '../api/component/component.mjs';
import {search} from '../api/search/search.mjs';
import {runCli} from '../test-utils/run-cli.mjs';

const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');
const CORE_VERSION = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'packages/core/package.json'), 'utf8'),
).version;
const SLOW = 30_000;

function withoutCore(run) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-no-core-'));
  return Promise.resolve(run(cwd)).finally(() => {
    fs.rmSync(cwd, {recursive: true, force: true});
  });
}

describe('bundled component documentation fallback', () => {
  it('serves versioned component details, props, and lists without Core', async () => {
    await withoutCore(async cwd => {
      const detail = await component('Button', {cwd});
      expect(detail).toMatchObject({
        type: 'component.detail',
        meta: {
          componentDocs: {
            source: 'bundled',
            package: '@astryxdesign/core',
            version: CORE_VERSION,
          },
        },
        data: {
          name: 'Button',
          package: '@astryxdesign/core',
          import: '@astryxdesign/core/Button',
          sourceAvailable: false,
        },
      });

      const props = await component('Button', {cwd, props: true});
      expect(props.type).toBe('component.detail.props');
      expect(props.data.some(prop => prop.name === 'label')).toBe(true);

      const list = await component(undefined, {cwd, list: true});
      expect(Object.values(list.data.components).flat()).toContainEqual(
        expect.objectContaining({name: 'Button', package: '@astryxdesign/core'}),
      );
    });
  }, SLOW);

  it('searches bundled component docs but keeps source views behind Core', async () => {
    await withoutCore(async cwd => {
      const result = await search('button', {cwd, type: 'component'});
      expect(result.data.results[0]).toMatchObject({
        domain: 'component',
        name: 'Button',
        import: '@astryxdesign/core/Button',
      });
      expect(result.meta?.componentDocs.version).toBe(CORE_VERSION);

      await expect(
        component('Button', {cwd, source: true}),
      ).rejects.toMatchObject({code: 'ERR_CORE_NOT_FOUND'});
      await expect(search('button', {cwd, type: 'hook'})).rejects.toMatchObject({
        code: 'ERR_CORE_NOT_FOUND',
      });
    });
  }, SLOW);

  it('states bundled version provenance in text and JSON', async () => {
    await withoutCore(async cwd => {
      const text = await runCli(['component', 'Button', '--detail', 'brief'], cwd);
      expect(text.code).toBe(0);
      expect(text.stdout).toContain(
        `Component docs: @astryxdesign/core@${CORE_VERSION} (bundled with the CLI`,
      );

      const json = await runCli(
        ['--json', 'search', 'button', '--type', 'component'],
        cwd,
      );
      expect(json.code).toBe(0);
      expect(JSON.parse(json.stdout)).toMatchObject({
        type: 'search',
        meta: {
          componentDocs: {
            source: 'bundled',
            package: '@astryxdesign/core',
            version: CORE_VERSION,
          },
        },
      });
    });
  }, SLOW);

  it('leaves installed Core mode unchanged', async () => {
    const detail = await component('Button', {cwd: REPO_ROOT});
    const result = await search('button', {
      cwd: REPO_ROOT,
      type: 'component',
      limit: 1,
    });
    expect(detail.meta).toBeUndefined();
    expect(detail.data.sourceAvailable).toBe(true);
    expect(result.meta).toBeUndefined();
  }, SLOW);
});

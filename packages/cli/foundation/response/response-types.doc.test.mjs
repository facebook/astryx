// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The response-types EnumDoc names every field of the responses below,
 * nested entry fields included. Fields come from real responses where one is
 * cheap to produce, else from the canonical typedef.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {describe, it, expect} from 'vitest';
import {doc} from './response-types.doc.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

/** @param {string} type */
const describedAs = (type) => doc.members.find((m) => m.value === type)?.description ?? '';

/** @param {string} text @param {string} field */
const names = (text, field) => new RegExp(`(^|\\W)${field}(\\W|$)`).test(text);

/**
 * Keys of an object, plus the keys of each nested object or array entry, `depth`
 * levels down.
 * @param {unknown} value @param {number} depth @returns {Set<string>}
 */
function fieldsOf(value, depth = 2) {
  const out = new Set();
  const visit = (/** @type {unknown} */ v, /** @type {number} */ d) => {
    if (Array.isArray(v)) return v.forEach((item) => visit(item, d));
    if (!v || typeof v !== 'object' || d < 0) return;
    for (const [key, child] of Object.entries(v)) {
      out.add(key);
      visit(child, d - 1);
    }
  };
  visit(value, depth);
  return out;
}

/** @param {string[]} args @param {string} [cwd] */
async function data(args, cwd) {
  const {status, stdout} = await runCli(['--json', ...args], cwd ? {cwd} : undefined);
  expect(status, stdout).toBe(0);
  return JSON.parse(stdout);
}

/** @param {string} type @param {Iterable<string>} fields */
function expectNamed(type, fields) {
  const text = describedAs(type);
  const missing = [...fields].filter((f) => !names(text, f));
  expect(missing, `${type} omits`).toEqual([]);
}

describe('response-types EnumDoc names every field', () => {
  it('component.detail: the ownership fields and parentDoc', async () => {
    const res = await data(['component', 'HStack']);
    expect(res.type).toBe('component.detail');
    const ownership = ['package', 'import', 'sourceAvailable', 'parentDoc'];
    for (const f of ownership) expect(Object.keys(res.data)).toContain(f);
    expectNamed('component.detail', ownership);
    // The canonical response type declares parentDoc too.
    const types = fs.readFileSync(
      new URL('../../api/component/component.type.mjs', import.meta.url),
      'utf8',
    );
    expect(types).toMatch(/@property \{string\} \[parentDoc\]/);
  });

  it('docs.index', async () => {
    const res = await data(['docs', 'theme', '--index']);
    expect(res.type).toBe('docs.index');
    expectNamed('docs.index', fieldsOf(res.data));
  });

  it('search, across component, hook, template, and doc results', async () => {
    const mixed = await data(['search', 'dashboard', '--limit', '50']);
    const docsOnly = await data(['search', 'tokens', '--type', 'doc']);
    expect(new Set(mixed.data.results.map((r) => r.domain))).toContain('template');
    expectNamed('search', new Set([...fieldsOf(mixed.data), ...fieldsOf(docsOnly.data)]));
  });

  it('build.kit, including the hint a thin kit carries', async () => {
    const res = await data(['build', 'zzqx-nothing-matches']);
    expect(res.type).toBe('build.kit');
    expect(res.data.hint).toBeDefined();
    const fields = fieldsOf(res.data, 0);
    for (const f of Object.keys(res.data.hint)) fields.add(f);
    expectNamed('build.kit', fields);
  });

  it('theme.targets', async () => {
    const res = await data(['theme', 'targets']);
    expectNamed('theme.targets', fieldsOf(res.data));
  });

  it('gap-report.file, including each delivery', async () => {
    const res = await data(['gap-report', 'Button', '--category', 'docs_gap', '--reason', 'probe']);
    expect(res.type).toBe('gap-report.file');
    expect(res.data.deliveries.length).toBeGreaterThan(0);
    expectNamed('gap-report.file', fieldsOf(res.data));
  });

  it('theme.build, including notices', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-response-types-'));
    fs.writeFileSync(path.join(cwd, 'package.json'), '{"name":"app","version":"1.0.0"}');
    await data(['theme', 'template', 'starter.ts'], cwd);
    const res = await data(['theme', 'build', 'starter.ts', '--out', 'starter.css'], cwd);
    expect(res.type).toBe('theme.build');
    expectNamed('theme.build', fieldsOf(res.data));
  });

  it('integration.pack-check (fields from api/integration/pack-check.type.mjs)', () => {
    expectNamed('integration.pack-check', [
      // PackCheckData
      'name',
      'version',
      'packable',
      'tarball',
      'inventory',
      'contributions',
      'issues',
      // PackCheckTarball
      'filename',
      'fileCount',
      'size',
      'unpackedSize',
      // PackCheckInventory and PackCheckInventoryRoot
      'manifest',
      'roots',
      'kind',
      'path',
      'expectedFiles',
      'missingFiles',
      'complete',
      'packedFiles',
      // contributions, each ContributionIdentities
      'local',
      'packed',
      'themes',
      'slug',
      'exportName',
      'components',
      'templates',
      'id',
      'type',
      'codemods',
      'docs',
      'agentDocsAppend',
      // issues, each AstryxIntegrationIssue
      'code',
      'severity',
      'message',
    ]);
  });
});

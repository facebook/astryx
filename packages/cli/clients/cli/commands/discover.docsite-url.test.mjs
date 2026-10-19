// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx discover` shows the docs site an integration names in its
 * manifest's `docsiteUrl`, in text and JSON, and an invalid value costs only
 * the link: the package and its components still load.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {runCli} from '../../../test-utils/run-cli.mjs';

const DOCSITE = 'https://kit.example.com/docs';

let tmpDir;
let project;

/** @param {Record<string, unknown>} manifest */
function writeKit(manifest) {
  const pkgDir = path.join(project, 'node_modules', '@test', 'kit');
  fs.mkdirSync(path.join(pkgDir, 'components'), {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@test/kit', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default ${JSON.stringify({components: './components', ...manifest})};\n`,
  );
  fs.writeFileSync(
    path.join(pkgDir, 'components', 'Part.doc.mjs'),
    `export const docs = {name: 'Part', usage: {description: 'A part.'}};\n`,
  );
  fs.writeFileSync(
    path.join(pkgDir, 'components', 'Part.tsx'),
    `export function Part() { return null; }\n`,
  );
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-discover-docsite-'));
  project = path.join(tmpDir, 'project');
  fs.mkdirSync(project, {recursive: true});
  fs.writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({name: 'proj', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(project, 'astryx.config.mjs'),
    `export default {integrations: ['@test/kit']};\n`,
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('astryx discover with a docsiteUrl', () => {
  it('carries docsiteUrl in the list and package JSON', async () => {
    writeKit({docsiteUrl: DOCSITE});

    const listed = await runCli(['discover', '--json'], {cwd: project});
    expect(listed.status).toBe(0);
    expect(JSON.parse(listed.stdout).data[0]).toMatchObject({
      name: '@test/kit',
      components: ['Part'],
      docsiteUrl: DOCSITE,
    });

    const shown = await runCli(['discover', '@test/kit', '--json'], {
      cwd: project,
    });
    expect(shown.status).toBe(0);
    const {type, data} = JSON.parse(shown.stdout);
    expect(type).toBe('discover.detail');
    expect(data).toMatchObject({installed: true, docsiteUrl: DOCSITE});
  });

  it('prints the docs site on the text package page', async () => {
    writeKit({docsiteUrl: DOCSITE});

    const {status, stdout} = await runCli(['discover', '@test/kit'], {
      cwd: project,
    });

    expect(status).toBe(0);
    expect(stdout).toMatch(
      /^docsiteUrl:\s+https:\/\/kit\.example\.com\/docs$/m,
    );
  });

  it('shows nothing new for a manifest without the field', async () => {
    writeKit({});

    const {stdout} = await runCli(['discover', '@test/kit', '--json'], {
      cwd: project,
    });

    expect(JSON.parse(stdout).data).not.toHaveProperty('docsiteUrl');
  });

  it('carries feedback in JSON and prints its destination as text', async () => {
    writeKit({feedback: {destination: 'acme-kit'}});

    const json = await runCli(['discover', '@test/kit', '--json'], {
      cwd: project,
    });
    expect(JSON.parse(json.stdout).data.feedback).toEqual({
      destination: 'acme-kit',
    });
    const listed = await runCli(['discover', '--json'], {cwd: project});
    expect(JSON.parse(listed.stdout).data[0].feedback).toEqual({
      destination: 'acme-kit',
    });

    const page = await runCli(['discover', '@test/kit'], {cwd: project});
    expect(page.stdout).toMatch(/^feedback:\s+acme-kit$/m);
    const list = await runCli(['discover'], {cwd: project});
    expect(list.stdout).toMatch(/^feedback:\s+acme-kit$/m);
    expect(list.stdout).not.toContain('[object Object]');
  });

  it('leaves out an invalid docsiteUrl and keeps the package', async () => {
    writeKit({docsiteUrl: 'javascript:alert(1)'});

    const {status, stdout} = await runCli(['discover', '@test/kit', '--json'], {
      cwd: project,
    });

    expect(status).toBe(0);
    const {data} = JSON.parse(stdout);
    expect(data.components).toEqual(['Part']);
    expect(data).not.toHaveProperty('docsiteUrl');
  });
});

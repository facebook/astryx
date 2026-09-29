// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx template` documents which of its flags win when they are
 * combined, and behaves as documented. Option text is read from the generated
 * manifest, the same strings `--help` prints.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {runCli} from '../../../test-utils/run-cli.mjs';

const SLOW = 30_000;

/** @type {string} */
let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-template-flags-'));
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({name: 'consumer'}));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/** @param {string} rel */
const exists = rel => fs.existsSync(path.join(tmpDir, rel));

/** Files in the project, ignoring package.json. */
const written = () => fs.readdirSync(tmpDir).filter(f => f !== 'package.json');

/**
 * template's option descriptions from the manifest, keyed by long flag.
 * @returns {Promise<Record<string, string>>}
 */
async function templateOptions() {
  const {stdout} = await runCli(['--json', 'manifest'], tmpDir);
  const template = JSON.parse(stdout).data.commands.find(
    (/** @type {{name: string}} */ c) => c.name === 'template',
  );
  return Object.fromEntries(
    template.options.map((/** @type {{flag: string, description: string}} */ o) => [
      o.flag.match(/--[a-z-]+/)?.[0],
      o.description,
    ]),
  );
}

/** @param {string[]} args */
async function templateJson(args) {
  const result = await runCli(['--json', 'template', ...args], tmpDir);
  return {status: result.status, envelope: JSON.parse(result.stdout)};
}

describe('astryx template flag precedence', () => {
  it('--list: help says <name>, <path>, --skeleton and --overwrite are ignored, and they are', async () => {
    const help = (await templateOptions())['--list'];
    for (const ignored of ['<name>', '<path>', '--skeleton', '--overwrite']) {
      expect(help).toContain(ignored);
    }
    expect(help).toMatch(/are ignored/);

    const {status, envelope} = await templateJson([
      'dashboard',
      './src/page.tsx',
      '--list',
      '--skeleton',
      '--overwrite',
    ]);
    expect(status).toBe(0);
    expect(envelope.type).toBe('template.list');
    expect(written()).toEqual([]);
  }, SLOW);

  it('--skeleton: help says it needs <name> and writes nothing, and it does', async () => {
    const help = (await templateOptions())['--skeleton'];
    expect(help).toMatch(/Needs <name>/);
    expect(help).toMatch(/writes nothing, so <path> and --overwrite are ignored/);
    expect(help).toMatch(/--list and --cdn take precedence/);

    const shown = await templateJson(['dashboard', './src/page.tsx', '--skeleton', '--overwrite']);
    expect(shown.status).toBe(0);
    expect(shown.envelope.type).toBe('template.skeleton');
    expect(written()).toEqual([]);

    const nameless = await templateJson(['--skeleton']);
    expect(nameless.status).toBe(1);
    expect(nameless.envelope.code).toBe('ERR_UNKNOWN_TEMPLATE');
  }, SLOW);

  it('--cdn: help says it overrides everything and where the page goes, and the CLI does that', async () => {
    const help = (await templateOptions())['--cdn'];
    for (const ignored of ['<name>', '--list', '--skeleton', '--type', '--package']) {
      expect(help).toContain(ignored);
    }
    expect(help).toMatch(/--cdn value, else to <path>, else cdn\.template\.html/);
    expect(help).toMatch(/always the file itself/);
    expect(help).toMatch(/value right after --cdn/);

    const everything = await templateJson(['dashboard', '--list', '--skeleton', '--type', 'bogus', '--cdn']);
    expect(everything.envelope.type).toBe('template.cdn');
    expect(everything.envelope.data.path).toBe('cdn.template.html');

    // A bare --cdn writes to <path>, and a path with no extension is still the file.
    const positional = await templateJson(['dashboard', 'demo', '--cdn']);
    expect(positional.envelope.data.path).toBe('demo');
    expect(fs.statSync(path.join(tmpDir, 'demo')).isFile()).toBe(true);

    // The word after --cdn is its value, not the template name.
    const value = await templateJson(['--cdn', 'dashboard']);
    expect(value.envelope.data.path).toBe('dashboard');
    expect(exists('dashboard')).toBe(true);
  }, SLOW);
});

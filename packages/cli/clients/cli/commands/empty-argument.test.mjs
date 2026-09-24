// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file An empty-string argument must not be mistaken for an omitted one.
 *
 * `astryx template "" src/zzz.tsx` used to exit 0, print the whole template
 * list, and throw away the write target the user named: `""` is falsy, so the
 * `if (name)` that routes between "scaffold this" and "list everything" could
 * not tell it from an argument that was never typed. `swizzle ""` and
 * `discover ""` listed the same way. One space already failed correctly
 * (ERR_INVALID_ARGUMENT); zero characters has to fail the same way.
 *
 * `layout` is the deliberate exception and is asserted here as such: its
 * expression can also arrive via --file or stdin, so an empty positional there
 * really does mean "not given as an argument" and keeps its own
 * ERR_MISSING_ARGUMENT.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {runCli} from '../../../test-utils/run-cli.mjs';

let dir;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-empty-arg-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: 'scratch',
      version: '1.0.0',
      dependencies: {'@astryxdesign/core': '0.6.3'},
    }),
  );
  fs.mkdirSync(path.join(dir, 'src'), {recursive: true});
  const core = path.join(dir, 'node_modules', '@astryxdesign', 'core');
  fs.mkdirSync(core, {recursive: true});
  fs.writeFileSync(
    path.join(core, 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version: '0.6.3'}),
  );
});

afterEach(() => fs.rmSync(dir, {recursive: true, force: true}));

/** @param {string[]} args */
const json = async args => {
  const {status, stdout} = await runCli(['--json', ...args], {cwd: dir});
  return {status, body: JSON.parse(stdout)};
};

describe('an empty-string argument is rejected, not ignored', () => {
  it.each([
    ['template', ['template', '', 'src/zzz.tsx'], 'name'],
    ['template target path', ['template', 'ai-chat', ''], 'path'],
    ['swizzle', ['swizzle', ''], 'component'],
    ['discover', ['discover', ''], 'query'],
  ])('%s', async (_label, args, argName) => {
    const {status, body} = await json(args);

    expect(status).toBe(1);
    expect(body.code).toBe('ERR_INVALID_ARGUMENT');
    expect(body.error).toContain(`<${argName}>`);
    expect(body.type).toBeUndefined();
  });

  it('writes nothing when the write target is the empty argument', async () => {
    const before = fs.readdirSync(path.join(dir, 'src'));
    await json(['template', 'ai-chat', '']);
    expect(fs.readdirSync(path.join(dir, 'src'))).toEqual(before);
  });

  it('exits the same way without --json', async () => {
    const {status, stderr} = await runCli(['template', '', 'src/zzz.tsx'], {cwd: dir});
    expect(status).toBe(1);
    expect(stderr).toContain('<name>');
  });

  it('still lists when the argument is genuinely omitted', async () => {
    for (const [args, type] of [
      [['template', '--list'], 'template.list'],
      [['discover'], 'discover.list'],
      [['swizzle', '--list'], 'swizzle.list'],
    ]) {
      const {status, body} = await json(args);
      expect(status, JSON.stringify(body).slice(0, 200)).toBe(0);
      expect(body.type).toBe(type);
    }
  });

  it('leaves layout alone — its expression has other sources', async () => {
    for (const sub of ['expand', 'check']) {
      const {status, body} = await json(['layout', sub, '']);
      expect(status).toBe(1);
      expect(body.code).toBe('ERR_MISSING_ARGUMENT');
    }
  });
});

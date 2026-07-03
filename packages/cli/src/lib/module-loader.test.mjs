// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {z} from 'zod';
import {
  findPresentFiles,
  importUserModule,
  loadModuleWithSchema,
} from './module-loader.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-module-loader-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('findPresentFiles', () => {
  const basenames = ['a.ts', 'b.mjs', 'c.js'];

  it('returns [] when none of the basenames are present', () => {
    expect(findPresentFiles(tmpDir, basenames)).toEqual([]);
  });

  it('returns only the present files, in basenames precedence order', () => {
    // Create out of order to prove the result follows `basenames`, not disk order.
    fs.writeFileSync(path.join(tmpDir, 'c.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'a.ts'), '');
    const present = findPresentFiles(tmpDir, basenames);
    expect(present.map(p => path.basename(p))).toEqual(['a.ts', 'c.js']);
  });

  it('returns absolute paths joined to the given directory', () => {
    fs.writeFileSync(path.join(tmpDir, 'b.mjs'), '');
    const present = findPresentFiles(tmpDir, basenames);
    expect(present).toEqual([path.join(tmpDir, 'b.mjs')]);
    expect(path.isAbsolute(present[0])).toBe(true);
  });

  it('does not match files in nested subdirectories', () => {
    const nested = path.join(tmpDir, 'nested');
    fs.mkdirSync(nested);
    fs.writeFileSync(path.join(nested, 'a.ts'), '');
    expect(findPresentFiles(tmpDir, basenames)).toEqual([]);
  });
});

describe('importUserModule', () => {
  it('imports a .mjs file and returns its module namespace', async () => {
    const file = path.join(tmpDir, 'mod.mjs');
    fs.writeFileSync(
      file,
      `export default {answer: 42};\nexport const named = 'hi';\n`,
    );
    const mod = await importUserModule(file);
    expect(mod.default).toEqual({answer: 42});
    expect(mod.named).toBe('hi');
  });
});

describe('loadModuleWithSchema', () => {
  // Temp module files live under a repo-local dir (not /tmp): Vite's dynamic
  // import blocks /tmp, so we mirror the existing repo-local temp pattern.
  const schema = z
    .object({
      name: z.string(),
      count: z.number().optional(),
    })
    .strict();

  it('returns the parsed default export when it satisfies the schema', async () => {
    const file = path.join(tmpDir, 'valid.mjs');
    fs.writeFileSync(file, `export default {name: 'ok', count: 3};\n`);
    const value = await loadModuleWithSchema(file, schema, {label: 'thing'});
    expect(value).toEqual({name: 'ok', count: 3});
  });

  it('throws a readable error when there is no default export', async () => {
    const file = path.join(tmpDir, 'no-default.mjs');
    fs.writeFileSync(file, `export const named = {name: 'x'};\n`);
    await expect(
      loadModuleWithSchema(file, schema, {label: 'thing'}),
    ).rejects.toThrow(/thing is invalid/i);
  });

  it('throws a readable error when the default export fails the schema', async () => {
    const file = path.join(tmpDir, 'invalid.mjs');
    fs.writeFileSync(file, `export default {count: 'not-a-number'};\n`);
    await expect(
      loadModuleWithSchema(file, schema, {label: 'thing'}),
    ).rejects.toThrow(/thing is invalid:.*name/i);
  });

  it('falls back to the file path in the message when no label is given', async () => {
    const file = path.join(tmpDir, 'unlabeled.mjs');
    fs.writeFileSync(file, `export default {bogus: true};\n`);
    await expect(loadModuleWithSchema(file, schema)).rejects.toThrow(
      new RegExp(`${path.basename(file)} is invalid`),
    );
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {z} from 'zod';
import {
  findPresentFiles,
  importUserModule,
  loadModuleWithParser,
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

  it.each(['mjs', 'js', 'ts'])(
    'freshly reloads a changed .%s module while normal loading stays cached',
    async extension => {
      const file = path.join(tmpDir, `fresh.${extension}`);
      fs.writeFileSync(file, `export default {answer: 1};\n`);
      const first = await importUserModule(file);
      expect(first.default).toEqual({answer: 1});

      fs.writeFileSync(file, `export default {answer: 2};\n`);
      const fresh = await importUserModule(file, {fresh: true});
      expect(fresh.default).toEqual({answer: 2});
    },
  );

  const probeFreshJavaScript = (dir, firstSource, secondSource) => {
    const file = path.join(dir, 'fresh.js');
    fs.writeFileSync(file, firstSource);
    const loaderUrl = pathToFileURL(
      path.join(process.cwd(), 'packages/cli/foundation/fs/module-loader.mjs'),
    ).href;
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import fs from 'node:fs';
import {importUserModule} from ${JSON.stringify(loaderUrl)};
const first = await importUserModule(process.env.TEST_MODULE);
fs.writeFileSync(process.env.TEST_MODULE, ${JSON.stringify(secondSource)});
const fresh = await importUserModule(process.env.TEST_MODULE, {fresh: true});
process.stdout.write(JSON.stringify({first: first.default?.answer, fresh: fresh.default?.answer}));`,
      ],
      {
        encoding: 'utf-8',
        env: {...process.env, TEST_MODULE: file},
      },
    );
    return JSON.parse(output);
  };

  it('freshly reloads a changed CommonJS .js module in a real Node process', () => {
    const commonjsDir = path.join(tmpDir, 'commonjs');
    fs.mkdirSync(commonjsDir);
    fs.writeFileSync(
      path.join(commonjsDir, 'package.json'),
      JSON.stringify({type: 'commonjs'}),
    );
    expect(
      probeFreshJavaScript(
        commonjsDir,
        `module.exports = {answer: 1};\n`,
        `module.exports = {answer: 2};\n`,
      ),
    ).toEqual({first: 1, fresh: 2});
  });

  it('freshly reloads a changed ESM .js module in a real Node process', () => {
    const esmDir = path.join(tmpDir, 'esm');
    fs.mkdirSync(esmDir);
    fs.writeFileSync(
      path.join(esmDir, 'package.json'),
      JSON.stringify({type: 'module'}),
    );
    expect(
      probeFreshJavaScript(
        esmDir,
        `export default {answer: 1};\n`,
        `export default {answer: 2};\n`,
      ),
    ).toEqual({first: 1, fresh: 2});
  });

  it('defaults .js to CommonJS when no package.json exists', () => {
    const noPackageDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'astryx-commonjs-no-package-'),
    );
    try {
      expect(
        probeFreshJavaScript(
          noPackageDir,
          `module.exports = {answer: 1};\n`,
          `module.exports = {answer: 2};\n`,
        ),
      ).toEqual({first: 1, fresh: 2});
    } finally {
      fs.rmSync(noPackageDir, {recursive: true, force: true});
    }
  });
});

describe('loadModuleWithParser', () => {
  // Temp module files live under a repo-local dir (not /tmp): Vite's dynamic
  // import blocks /tmp, so we mirror the existing repo-local temp pattern.
  const schema = z
    .object({
      name: z.string(),
      count: z.number().optional(),
    })
    .strict();

  /**
   * A stand-in authoring parser: validates via a sealed schema and, on failure,
   * throws the same `<label> is invalid: …` line the real parsers throw. Zod
   * stays inside the parser — `loadModuleWithParser` never sees it.
   * @param {unknown} input
   * @param {string} [label]
   */
  function parse(input, label = 'value') {
    const result = schema.safeParse(input);
    if (!result.success) {
      const issues = result.error.issues
        .map(i => `${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`)
        .join('; ');
      throw new Error(`${label} is invalid: ${issues}`);
    }
    return result.data;
  }

  it('returns the parsed default export when it satisfies the parser', async () => {
    const file = path.join(tmpDir, 'valid.mjs');
    fs.writeFileSync(file, `export default {name: 'ok', count: 3};\n`);
    const value = await loadModuleWithParser(file, parse, {label: 'thing'});
    expect(value).toEqual({name: 'ok', count: 3});
  });

  it('throws a readable error when there is no default export', async () => {
    const file = path.join(tmpDir, 'no-default.mjs');
    fs.writeFileSync(file, `export const named = {name: 'x'};\n`);
    await expect(
      loadModuleWithParser(file, parse, {label: 'thing'}),
    ).rejects.toThrow(/thing is invalid/i);
  });

  it('throws a readable error when the default export fails the parser', async () => {
    const file = path.join(tmpDir, 'invalid.mjs');
    fs.writeFileSync(file, `export default {count: 'not-a-number'};\n`);
    await expect(
      loadModuleWithParser(file, parse, {label: 'thing'}),
    ).rejects.toThrow(/thing is invalid:.*name/i);
  });

  it('falls back to the file path in the message when no label is given', async () => {
    const file = path.join(tmpDir, 'unlabeled.mjs');
    fs.writeFileSync(file, `export default {bogus: true};\n`);
    await expect(loadModuleWithParser(file, parse)).rejects.toThrow(
      new RegExp(`${path.basename(file)} is invalid`),
    );
  });
});

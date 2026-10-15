// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';
import {subsetStylesheet} from './stylesheet';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

const SHEET = [
  '/* Fixture */',
  '/* Auto-generated. Do not edit manually. */',
  '',
  '@layer astryx-base {',
  '  :root, .xvars{--ink:black;}',
  '  .xa{color:var(--ink)}',
  '  .xb:not(#\\#){padding:4px}',
  '}',
  '',
].join('\n');

/** A package directory holding SHEET and the data the build writes for it. */
function writePackage(css = SHEET) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-subset-'));
  roots.push(root);
  const dist = path.join(root, 'dist');
  fs.mkdirSync(dist);
  const sheet = path.join(dist, 'astryx.css');
  fs.writeFileSync(sheet, css);
  fs.writeFileSync(
    `${sheet}.json`,
    JSON.stringify({
      stylesheet: 'astryx.css',
      sha256: createHash('sha256').update(SHEET).digest('hex'),
      rules: {start: 4, count: 3},
      modules: {'A/A.js': [0, 1], 'B/B.js': [2], 'theme/vars.stylex.js': [0]},
    }),
  );
  return {root, dist, sheet, module: (name: string) => path.join(dist, name)};
}

const rules = (css: string) =>
  css.split('\n').filter(line => line.startsWith('  '));

describe('subsetStylesheet', () => {
  it('returns the stylesheet unchanged for every module', () => {
    const {sheet, module} = writePackage();

    expect(
      subsetStylesheet(sheet, [
        module('A/A.js'),
        module('B/B.js'),
        module('theme/vars.stylex.js'),
      ]),
    ).toBe(SHEET);
  });

  it('removes the rules no listed module uses and keeps the rest in order', () => {
    const {sheet, module} = writePackage();

    expect(rules(subsetStylesheet(sheet, [module('B/B.js')]))).toEqual([
      '  .xb:not(#\\#){padding:4px}',
    ]);
    expect(subsetStylesheet(sheet, [module('B/B.js'), module('A/A.js')])).toBe(
      SHEET,
    );
    expect(subsetStylesheet(sheet, [])).toBe(
      '/* Fixture */\n/* Auto-generated. Do not edit manually. */\n\n@layer astryx-base {\n}\n',
    );
  });

  it('ignores paths outside the package and modules that use no styles', () => {
    const {root, sheet, module} = writePackage();

    expect(
      subsetStylesheet(sheet, [
        module('B/B.js'),
        module('Plain/Plain.js'),
        path.join(root, 'src/A/A.tsx'),
        path.join(os.tmpdir(), 'app/src/main.js'),
        '\0virtual:module',
      ]),
    ).toBe(subsetStylesheet(sheet, [module('B/B.js')]));
  });

  it('takes file URLs and paths relative to the working directory', () => {
    const {sheet, module} = writePackage();
    const expected = subsetStylesheet(sheet, [module('A/A.js')]);

    expect(
      subsetStylesheet(pathToFileURL(sheet), [pathToFileURL(module('A/A.js'))]),
    ).toBe(expected);
    expect(
      subsetStylesheet(pathToFileURL(sheet).href, [
        path.relative(process.cwd(), module('A/A.js')),
      ]),
    ).toBe(expected);
  });

  it('matches modules reported through a symlink or by their real path', () => {
    const {root, dist, sheet} = writePackage();
    const linked = path.join(root, 'linked');
    fs.symlinkSync(dist, linked, 'dir');
    const expected = subsetStylesheet(sheet, [path.join(dist, 'A/A.js')]);

    expect(
      subsetStylesheet(path.join(linked, 'astryx.css'), [
        path.join(dist, 'A/A.js'),
      ]),
    ).toBe(expected);
    fs.mkdirSync(path.join(dist, 'A'));
    fs.writeFileSync(path.join(dist, 'A/A.js'), '');
    const elsewhere = path.join(root, 'elsewhere');
    fs.symlinkSync(dist, elsewhere, 'dir');
    expect(subsetStylesheet(sheet, [path.join(elsewhere, 'A/A.js')])).toBe(
      expected,
    );
  });

  it('fails, naming the stylesheet, when it cannot be read', () => {
    const {dist} = writePackage();
    const missing = path.join(dist, 'missing.css');

    expect(() => subsetStylesheet(missing, [])).toThrow(missing);
  });

  it('fails when the package ships no subset data for the stylesheet', () => {
    const {sheet} = writePackage();
    fs.rmSync(`${sheet}.json`);

    expect(() => subsetStylesheet(sheet, [])).toThrow(/no subset data/);
  });

  it('fails when the stylesheet differs from the one its data describes', () => {
    const {sheet, module} = writePackage(
      SHEET.replace('padding:4px', 'padding:8px'),
    );

    expect(() => subsetStylesheet(sheet, [module('B/B.js')])).toThrow(
      /differs from the stylesheet its subset data describes/,
    );
  });

  it('refuses a single path where a list of modules belongs', () => {
    const {sheet, module} = writePackage();

    expect(() =>
      subsetStylesheet(sheet, module('A/A.js') as unknown as string[]),
    ).toThrow(TypeError);
  });
});

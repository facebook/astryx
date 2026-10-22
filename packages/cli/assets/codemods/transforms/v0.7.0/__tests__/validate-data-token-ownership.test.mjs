// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';
import transform, {
  compilesAstryxSource,
} from '../validate-data-token-ownership.mjs';

const tempRoots = [];

/**
 * A project folder (a repository root) whose package.json declares the given
 * dependencies.
 * @param {Record<string, Record<string, string>>} pkg
 */
function project(pkg = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-data-token-'));
  tempRoots.push(root);
  fs.mkdirSync(path.join(root, '.git'));
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({name: 'app', ...pkg}),
  );
  return root;
}

const prebuilt = () => project({dependencies: {'@astryxdesign/core': '0.7.3'}});
const sourceBuilt = () =>
  project({
    dependencies: {'@astryxdesign/core': '0.7.3'},
    devDependencies: {'@astryxdesign/build': '0.7.3'},
  });

afterAll(() => {
  for (const root of tempRoots) fs.rmSync(root, {recursive: true, force: true});
});

async function run(source, file) {
  const jscodeshift = (await import('jscodeshift')).default;
  const parser =
    file.endsWith('.ts') || file.endsWith('.tsx') ? 'tsx' : 'babel';
  const api = {
    jscodeshift: jscodeshift.withParser(parser),
    stats: () => {},
    report: () => {},
  };
  return transform({source, path: file}, api);
}

const TODO =
  /TODO\(astryx upgrade\): var\(--color-data-\*\) without a fallback/;

const DIRECT_USES = [
  `const fill = 'var(--color-data-categorical-green)';`,
  'const fill = `var(--color-data-categorical-green)`;',
  `const border = '1px solid var(--color-data-categorical-green)';`,
  'const border = `${width}px solid var(--color-data-categorical-green)`;',
];

describe('validate-data-token-ownership', () => {
  it('leaves fallback-less uses unchanged in a prebuilt project', async () => {
    const root = prebuilt();
    for (const source of DIRECT_USES) {
      expect(
        await run(source, path.join(root, 'src/chart.tsx')),
      ).toBeUndefined();
    }
    expect(
      await run(
        '.bar { fill: var(--color-data-categorical-blue); }',
        path.join(root, 'src/chart.css'),
      ),
    ).toBeUndefined();
  });

  it('marks direct string and static-template uses in a source-built project without failing', async () => {
    const root = sourceBuilt();
    for (const source of DIRECT_USES) {
      const output = await run(source, path.join(root, 'src/chart.tsx'));
      expect(output).toMatch(TODO);
      expect(output).toMatch(
        /@astryxdesign\/build.*astryx\.css.*dataVars.*resolveThemeToken/s,
      );
      expect(output.endsWith(source)).toBe(true);
    }
  });

  it('puts the JS TODO on the enclosing statement, not inside JSX', async () => {
    const root = sourceBuilt();
    const source = `export function Bar() {
  return <rect fill="var(--color-data-categorical-green)" />;
}`;
    const output = await run(source, path.join(root, 'src/Bar.tsx'));
    expect(output).toMatch(
      /\/\* TODO\(astryx upgrade\)[^]*?\*\/\n\s*return <rect/,
    );
  });

  it('marks the first use in the file, whatever kind of literal holds it', async () => {
    const root = sourceBuilt();
    const source = `export function Bar({width}) {
  const border = \`\${width}px solid var(--color-data-categorical-green)\`;
  return <rect fill="var(--color-data-categorical-red)" style={{border}} />;
}`;
    const output = await run(source, path.join(root, 'src/Bar.tsx'));
    expect(output).toMatch(
      /\/\* TODO\(astryx upgrade\)[^]*?\*\/\n\s*const border/,
    );
  });

  it('marks a file once, so a second run changes nothing', async () => {
    const root = sourceBuilt();
    const file = path.join(root, 'src/chart.tsx');
    const source = `const a = 'var(--color-data-categorical-green)';
const b = 'var(--color-data-categorical-red)';`;
    const once = await run(source, file);
    expect(once.match(new RegExp(TODO, 'g'))).toHaveLength(1);
    expect(await run(once, file)).toBeUndefined();

    const cssFile = path.join(root, 'src/chart.css');
    const css = '.bar { fill: var(--color-data-categorical-green); }';
    const cssOnce = await run(css, cssFile);
    expect(await run(cssOnce, cssFile)).toBeUndefined();
  });

  it('marks raw stylesheet uses on their own line in a source-built project', async () => {
    const root = sourceBuilt();
    const output = await run(
      `.bar {
  stroke: red;
  fill: var(--color-data-categorical-green);
}`,
      path.join(root, 'src/chart.css'),
    );
    expect(output).toMatch(
      /stroke: red;\n {2}\/\* TODO\(astryx upgrade\)[^]*?\*\/\n {2}fill: var\(--color-data-categorical-green\);/,
    );
  });

  it('marks a stylesheet use directly when a comment ends on its line', async () => {
    const root = sourceBuilt();
    const output = await run(
      `/* note
   */ .bar { fill: var(--color-data-categorical-green); }`,
      path.join(root, 'src/chart.css'),
    );
    expect(output).toMatch(
      /\*\/ \.bar \{ fill: \/\* TODO\(astryx upgrade\)[^]*?\*\/ var\(--color-data/,
    );
  });

  it('finds the source build in an ancestor package.json up to the repository root', async () => {
    const root = sourceBuilt();
    const member = path.join(root, 'apps/web');
    fs.mkdirSync(member, {recursive: true});
    fs.writeFileSync(
      path.join(member, 'package.json'),
      JSON.stringify({dependencies: {'@astryxdesign/core': '0.7.3'}}),
    );
    expect(compilesAstryxSource(path.join(member, 'src/chart.tsx'))).toBe(true);

    const outer = sourceBuilt();
    const repo = path.join(outer, 'nested-repo');
    fs.mkdirSync(path.join(repo, '.git'), {recursive: true});
    fs.writeFileSync(path.join(repo, 'package.json'), '{}');
    expect(compilesAstryxSource(path.join(repo, 'src/chart.tsx'))).toBe(false);
  });

  it('leaves fallbacks, dataVars access, and comments unchanged', async () => {
    const root = sourceBuilt();
    const source = `
// var(--color-data-categorical-green)
const fallback = 'var(--color-data-categorical-green, #008000)';
const fill = dataVars['--color-data-categorical-green'];
`;
    expect(await run(source, path.join(root, 'src/chart.tsx'))).toBeUndefined();
    expect(
      await run(
        `/* var(--color-data-categorical-green) */
.bar { fill: var(--color-data-categorical-green, #008000); }`,
        path.join(root, 'src/chart.css'),
      ),
    ).toBeUndefined();
  });

  it('fails on stale generated theme CSS with root data defaults in either mode', async () => {
    const source = `/* @generated by \`astryx theme build\` */
@layer astryx-base {
  :root { --color-data-categorical-green: #008000; }
}`;
    for (const root of [prebuilt(), sourceBuilt()]) {
      await expect(
        run(source, path.join(root, 'src/theme.css')),
      ).rejects.toThrow(/Rebuild it with `astryx theme build`/);
    }
  });

  it('does not claim ownership of hand-authored CSS or sparse theme overrides', async () => {
    const root = sourceBuilt();
    expect(
      await run(
        ':root { --color-data-categorical-green: #008000; }',
        path.join(root, 'src/app.css'),
      ),
    ).toBeUndefined();
    expect(
      await run(
        `/* @generated by \`astryx theme build\` */
@scope ([data-astryx-theme="ocean"]) {
  :scope { --color-data-categorical-green: #008000; }
}`,
        path.join(root, 'src/theme.css'),
      ),
    ).toBeUndefined();
  });
});

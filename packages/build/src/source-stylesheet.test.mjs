// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file source-stylesheet.test.mjs
 * @input The real Core and Lab source, their prebuilt stylesheets as
 *   scripts/build-css.mjs builds them, and a synthetic Astryx-shaped package
 * @output Proves a source build of every module prints each prebuilt
 *   stylesheet byte for byte (spec:AST-080 FR7), and covers the `@astryx`
 *   PostCSS plugin
 * @position Unit and parity tests for the Turbopack half of @astryxdesign/build
 */

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const {
  compileRules,
  packageModules,
  renderPackage,
  sourcePackages,
  sourceStylesheet,
  stylexOptions,
} = require('./source-stylesheet.js');
const astryxPostcss = require('./next-postcss.js');
const {processStylexRules} = require('@stylexjs/babel-plugin');

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const roots = [];

function tempDir() {
  const dir = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-source-')),
  );
  roots.push(dir);
  return dir;
}

function writeFiles(root, files) {
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    fs.writeFileSync(path.join(root, file), content);
  }
}

afterAll(() => {
  for (const dir of roots) fs.rmSync(dir, {recursive: true, force: true});
});

describe('a source build against the prebuilt stylesheets', () => {
  let app;
  let buildCss;
  const src = name => path.join(repoRoot, `packages/${name}/src`);
  const coreTarget = {src: src('core'), aliases: {}};

  /** A package's prebuilt rules, as scripts/build-css.mjs builds them. */
  async function prebuilt(name) {
    const target =
      name === 'core'
        ? coreTarget
        : {
            src: src(name),
            aliases: {
              '@astryxdesign/core/*': [path.join(src('core'), '*')],
              '@astryxdesign/core': [src('core')],
            },
            provider: coreTarget,
          };
    const rules = await buildCss.collectStyleXCSS(target);
    const sheet = buildCss.composePackageStylesheet(
      '',
      processStylexRules(rules, false),
    );
    return sheet.slice(sheet.indexOf('@layer astryx-base {'));
  }

  beforeAll(async () => {
    app = tempDir();
    fs.mkdirSync(path.join(app, 'node_modules/@astryxdesign'), {
      recursive: true,
    });
    for (const name of ['core', 'lab']) {
      fs.symlinkSync(
        path.join(repoRoot, 'packages', name),
        path.join(app, 'node_modules/@astryxdesign', name),
        'junction',
      );
    }
    buildCss = await import(
      pathToFileURL(path.join(repoRoot, 'scripts/build-css.mjs')).href
    );
  });

  it.each(['core', 'lab'])(
    'compiles every %s module to its prebuilt stylesheet byte for byte',
    async name => {
      const packages = sourcePackages(app);
      const pkg = packages.find(({name: n}) => n === `@astryxdesign/${name}`);
      // Lab relies on astryx.css for the Core variable groups it reads.
      const provided = new Set(
        name === 'core'
          ? []
          : [...packageModules(packages[0], packages)].filter(file =>
              /\.stylex\.ts$/.test(file),
            ),
      );
      const options = stylexOptions(pkg, packages);
      const rules = [];
      for (const file of packageModules(pkg, packages, provided)) {
        rules.push(...(await compileRules(file, options)));
      }
      expect(renderPackage(rules)).toBe(await prebuilt(name));
    },
    180_000,
  );
});

describe('the @astryx PostCSS plugin', () => {
  /** Run the plugin over a root holding `count` bare `@astryx` rules. */
  async function run(cwd, count = 1) {
    const result = {opts: {from: path.join(cwd, 'a.css')}, messages: []};
    const rules = Array.from({length: count}, () => ({
      params: '',
      replaceWith(css) {
        this.css = css;
      },
      error: message => new Error(message),
    }));
    const root = {walkAtRules: (_, visit) => rules.forEach(visit)};
    await astryxPostcss({cwd}).Once(root, {result});
    return {css: rules[0].css, messages: result.messages};
  }

  it('replaces @astryx with every compiled rule', async () => {
    const app = tempDir();
    writeFiles(app, {
      'node_modules/@astryxdesign/core/package.json': JSON.stringify({
        name: '@astryxdesign/core',
        exports: {'.': {source: './src/index.ts'}},
      }),
      'node_modules/@astryxdesign/core/src/index.ts':
        "import * as stylex from '@stylexjs/stylex';\nconst s = stylex.create({root: {color: 'red'}});\nexport const Box = () => stylex.props(s.root);",
    });
    const {css, messages} = await run(app);
    expect(css).toMatch(
      /^@layer astryx-base \{\n {2}\.x[a-z0-9]+\{color:red\}/,
    );
    // It depends on the package's source, never on an app file.
    expect(messages).toEqual([
      expect.objectContaining({
        type: 'dir-dependency',
        dir: path.join(app, 'node_modules/@astryxdesign/core/src'),
        glob: '**/*.{ts,tsx}',
      }),
    ]);
    await expect(run(app, 2)).rejects.toThrow(/Only one @astryx/);
  });

  it('fails when no Astryx package ships source', async () => {
    await expect(run(tempDir())).rejects.toThrow(/No Astryx package/);
  });
});

describe('a source build across packages', () => {
  it("names another package's use of a Core marker as Core does, with Core's dist installed", async () => {
    const app = tempDir();
    const core = 'node_modules/@astryxdesign/core';
    const marker =
      "import * as stylex from '@stylexjs/stylex';\nexport const scope = stylex.defineMarker();";
    const hover = from =>
      `import * as stylex from '@stylexjs/stylex';\nimport {scope} from '${from}';\nconst s = stylex.create({root: {color: {default: 'red', [stylex.when.ancestor(':hover', scope)]: 'blue'}}});\nexport const Box = () => stylex.props(s.root);`;
    writeFiles(app, {
      [`${core}/package.json`]: JSON.stringify({
        name: '@astryxdesign/core',
        exports: {
          '.': {source: './src/index.ts', default: './dist/index.js'},
          './scope.stylex': {
            source: './src/scope.stylex.ts',
            default: './dist/scope.stylex.js',
          },
        },
      }),
      [`${core}/src/scope.stylex.ts`]: marker,
      // Published Core ships its build, where Node resolves the request.
      [`${core}/dist/scope.stylex.js`]: marker,
      [`${core}/src/index.ts`]: hover('./scope.stylex'),
      'node_modules/@astryxdesign/lab/package.json': JSON.stringify({
        name: '@astryxdesign/lab',
        exports: {'.': {source: './src/index.ts'}},
      }),
      'node_modules/@astryxdesign/lab/src/index.ts': hover(
        '@astryxdesign/core/scope.stylex',
      ),
    });
    const packages = sourcePackages(app);
    const markers = [];
    for (const pkg of packages) {
      const rules = await compileRules(
        path.join(pkg.srcDir, 'index.ts'),
        stylexOptions(pkg, packages),
      );
      markers.push(
        rules.map(([, {ltr}]) => /\.(x\w+):hover/.exec(ltr)?.[1]).find(Boolean),
      );
    }
    // Lab names the marker after Core's source, as scripts/build-css.mjs does.
    expect(markers).toEqual([expect.any(String), markers[0]]);
  });
});

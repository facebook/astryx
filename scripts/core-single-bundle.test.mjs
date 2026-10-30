// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file core-single-bundle.test.mjs
 * @input Core's built package (packages/core/dist and its package.json
 *   `sideEffects`), bundled by esbuild into one file without code splitting
 * @output Pins that an app bundled as one esbuild file renders Core
 *   components. Core's lazy `import()`s make esbuild wrap the modules they
 *   reach in lazy initializers; if a barrel `index.js` is declared
 *   side-effect-free, esbuild drops its initializer call and a component such
 *   as List runs before its module is initialized ("reading 'useId' of
 *   undefined"). The barrels are declared side-effectful to keep that order,
 *   and so hold only imports and re-exports.
 * @position Node test over Core's build output; CI builds Core before the Node
 *   tests run
 */

import fs from 'node:fs';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';

const REPO = path.resolve(import.meta.dirname, '..');
const CORE = path.join(REPO, 'packages/core');
const require = createRequire(path.join(CORE, 'package.json'));
const esbuild = require('esbuild');
const {JSDOM} = createRequire(path.join(REPO, 'package.json'))('jsdom');

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-single-bundle-'));
afterAll(() => {
  fs.rmSync(scratch, {recursive: true, force: true});
});

/** Bundles a tiny app the way a no-build page is bundled: one file. */
async function bundleApp(source) {
  const entry = path.join(scratch, 'main.jsx');
  fs.writeFileSync(entry, source);
  const result = await esbuild.build({
    entryPoints: [entry],
    absWorkingDir: CORE,
    nodePaths: [path.join(CORE, 'node_modules')],
    alias: {'@astryxdesign/core': path.join(CORE, 'dist/index.js')},
    bundle: true,
    format: 'iife',
    jsx: 'automatic',
    define: {'process.env.NODE_ENV': '"production"'},
    loader: {'.css': 'empty'},
    write: false,
    logLevel: 'silent',
  });
  return result.outputFiles[0].text;
}

/** Runs the bundle in a DOM and reports the first error or the root's HTML. */
async function render(bundle) {
  const dom = new JSDOM('<div id="root"></div>', {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const errors = [];
  dom.window.addEventListener('error', event => {
    errors.push(String(event.error ?? event.message));
  });
  dom.window.console.error = (...args) => errors.push(args.join(' '));
  try {
    dom.window.eval(bundle);
  } catch (error) {
    errors.push(String(error));
  }
  await new Promise(resolve => setTimeout(resolve, 50));
  const html = dom.window.document.getElementById('root').innerHTML;
  dom.window.close();
  return {errors, html};
}

describe('Core in a single esbuild bundle', () => {
  it.skipIf(!fs.existsSync(path.join(CORE, 'dist/index.js')))(
    'renders List and Item without module-initialization errors',
    async () => {
      const bundle = await bundleApp(`
        import {Item, List} from '@astryxdesign/core';
        import {createRoot} from 'react-dom/client';
        createRoot(document.getElementById('root')).render(
          <List><Item label="One" /></List>,
        );
      `);
      const {errors, html} = await render(bundle);
      expect(errors).toEqual([]);
      expect(html).toContain('role="list"');
      expect(html).toContain('One');
    },
    60_000,
  );

  it('keeps every barrel to imports and re-exports, since barrels are kept whole', () => {
    // A barrel declared side-effectful stays in every bundle that reaches it,
    // so any value it computes is paid for by every app.
    const ts = require('typescript');
    const offenders = [];
    const walk = dir => {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(file);
        } else if (/^index\.tsx?$/.test(entry.name)) {
          const source = ts.createSourceFile(
            file,
            fs.readFileSync(file, 'utf8'),
            ts.ScriptTarget.Latest,
          );
          for (const statement of source.statements) {
            const allowed =
              ts.isExportDeclaration(statement) ||
              ts.isImportDeclaration(statement) ||
              ts.isTypeAliasDeclaration(statement) ||
              ts.isInterfaceDeclaration(statement) ||
              (ts.isExpressionStatement(statement) &&
                ts.isStringLiteral(statement.expression));
            if (!allowed) offenders.push(path.relative(CORE, file));
          }
        }
      }
    };
    walk(path.join(CORE, 'src'));
    expect(offenders).toEqual([]);
  });

  it('declares the barrel modules side-effectful in the published package', () => {
    const {sideEffects} = JSON.parse(
      fs.readFileSync(path.join(CORE, 'package.json'), 'utf8'),
    );
    expect(sideEffects).toContain('**/index.js');
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touch-support-bundle.test.mjs
 * @input Core's source, bundled with the PR size report's esbuild options
 *   (.github/scripts/lib/component-size.js); core's package.json; core's and
 *   the CLI's docs; core's and Lab's component source
 * @output Pins architecture:react-component-runtime INV13's bundle and
 *   boundary claims: Core's public entries carry none of the touch module
 *   until an app installs TouchSupport; a component that reads the module
 *   through useTouchSupport or useTouchLayer carries none of it, nor the
 *   gesture core and motion math it gathers; the install entry carries all of
 *   it;
 *   no export map entry, `.doc.mjs`, or component `import()` reaches the
 *   internals
 * @position Node test over source, so it needs no build
 */

import fs from 'node:fs';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';

const REPO = path.resolve(import.meta.dirname, '..');
const CORE_SRC = path.join(REPO, 'packages/core/src');
const require = createRequire(path.join(REPO, 'package.json'));
const esbuild = require('esbuild');

/**
 * The touch module: the file that gathers its primitives. An entry that
 * imports it, directly or through TouchSupport, carries the whole module.
 */
const MODULE_INPUT = /^packages\/core\/src\/touch-support\/touchModule\.ts$/;

/** The module and what it gathers: the gesture core, the motion math and tables. */
const PRIMITIVE_INPUT =
  /^packages\/core\/src\/(gestures\/|motion\/|touch-support\/touchModule\.ts$)/;

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-touch-support-'));
afterAll(() => {
  fs.rmSync(scratch, {recursive: true, force: true});
});

/**
 * Bytes each source module contributes to everything `entry` can load, eager
 * chunks and import() targets alike, built as the size report builds a
 * component import. React and StyleX stay external: they hold no touch code.
 */
function bytesByInput(entry) {
  const result = esbuild.buildSync({
    absWorkingDir: REPO,
    entryPoints: [entry],
    outdir: path.join(scratch, 'out'),
    bundle: true,
    splitting: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    define: {'process.env.NODE_ENV': '"production"'},
    loader: {'.css': 'empty'},
    external: [
      'react',
      'react/*',
      'react-dom',
      'react-dom/*',
      '@stylexjs/stylex',
    ],
    metafile: true,
    write: false,
    logLevel: 'silent',
  });
  const bytes = {};
  for (const output of Object.values(result.metafile.outputs)) {
    for (const [input, {bytesInOutput}] of Object.entries(output.inputs)) {
      bytes[input] = (bytes[input] ?? 0) + bytesInOutput;
    }
  }
  return bytes;
}

/** A scratch entry module with `source`. */
function entryWith(name, source) {
  const file = path.join(scratch, name);
  fs.writeFileSync(file, source);
  return file;
}

/** The inputs matching `pattern` that put bytes in the bundle. */
function bytesOf(bytes, pattern = MODULE_INPUT) {
  return Object.entries(bytes).filter(
    ([input, size]) => pattern.test(input) && size > 0,
  );
}

/** Every file under `dir` whose name matches `pattern`. */
function filesUnder(dir, pattern) {
  const found = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        found.push(...filesUnder(full, pattern));
      }
    } else if (pattern.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

describe('the touch module in bundles', () => {
  it.each([
    ['the root entry', 'index.ts'],
    ['the hooks entry', 'hooks/index.ts'],
    ['the utils entry', 'utils/index.ts'],
  ])('is absent from %s', (_name, entry) => {
    expect(bytesOf(bytesByInput(path.join(CORE_SRC, entry)))).toEqual([]);
  });

  it.each([
    [
      'useTouchSupport',
      'useTouchSupport.ts',
      `export function Glue() {
  return useTouchSupport() === null ? 'plain' : 'touch';
}`,
    ],
    [
      'useTouchLayer',
      'useTouchLayer.ts',
      `export function Glue(props: {target: {current: Element | null}}) {
  useTouchLayer(props.target, touch => {
    const recognizer = new touch.TapGestureRecognizer();
    return recognizer.addListener(() => {});
  });
  return null;
}`,
    ],
  ])(
    'is absent from a component that reads it through %s',
    (name, file, body) => {
      const glue = entryWith(
        `glue-${name}.tsx`,
        `import {${name}} from ${JSON.stringify(
          path.join(CORE_SRC, 'touch-support', file),
        )};
${body}
`,
      );
      const bytes = bytesByInput(glue);
      expect(bytes[`packages/core/src/touch-support/${file}`]).toBeGreaterThan(
        0,
      );
      expect(bytesOf(bytes, PRIMITIVE_INPUT)).toEqual([]);
    },
  );

  it('is present once the app installs TouchSupport', () => {
    const app = entryWith(
      'app.ts',
      `import TouchSupport from ${JSON.stringify(
        path.join(CORE_SRC, 'touch-support/index.ts'),
      )};
TouchSupport.install();
`,
    );
    const present = Object.fromEntries(
      bytesOf(bytesByInput(app), PRIMITIVE_INPUT),
    );
    for (const input of [
      'packages/core/src/touch-support/touchModule.ts',
      'packages/core/src/gestures/GestureArena.ts',
      'packages/core/src/gestures/GestureRecognizer.ts',
      'packages/core/src/gestures/TapGestureRecognizer.ts',
      'packages/core/src/gestures/LongPressGestureRecognizer.ts',
      'packages/core/src/gestures/PanGestureRecognizer.ts',
      'packages/core/src/gestures/VelocityTracker.ts',
      'packages/core/src/motion/spring.ts',
      'packages/core/src/motion/decay.ts',
      'packages/core/src/motion/projection.ts',
      'packages/core/src/motion/rubberBand.ts',
      'packages/core/src/motion/roles.ts',
      'packages/core/src/motion/uikit/gestures.ts',
      'packages/core/src/motion/uikit/springs.ts',
    ]) {
      expect(present[input], input).toBeGreaterThan(0);
    }
  });
});

describe('the touch module internals', () => {
  it('have no entry in the exports map beside the public TouchSupport entry', () => {
    const {exports} = JSON.parse(
      fs.readFileSync(path.join(REPO, 'packages/core/package.json'), 'utf8'),
    );
    expect(exports['./touch-support']?.source).toBe(
      './src/touch-support/index.ts',
    );
    const internal = Object.keys(exports).filter(key =>
      /^\.\/(gestures|motion)(\/|$)|^\.\/touch-support\//.test(key),
    );
    expect(internal).toEqual([]);
  });

  it('are named by no consumer doc', () => {
    const docs = [
      ...filesUnder(CORE_SRC, /\.doc(\.[a-z]+)?\.mjs$/),
      ...filesUnder(path.join(REPO, 'packages/cli/assets/docs'), /\.mjs$/),
    ];
    const naming = docs.filter(file =>
      /\b(GestureArena|GestureRecognizer|useTouchSupport|touchModule|touchSupportRegistry)\b/.test(
        fs.readFileSync(file, 'utf8'),
      ),
    );
    expect(naming.map(file => path.relative(REPO, file))).toEqual([]);
  });

  it('are never loaded through an import() in Core or Lab source', () => {
    const sources = [
      ...filesUnder(CORE_SRC, /\.(ts|tsx)$/),
      ...filesUnder(path.join(REPO, 'packages/lab/src'), /\.(ts|tsx)$/),
    ].filter(file => !/\.(test|spec)\.(ts|tsx)$|__tests__/.test(file));
    const dynamic = sources.filter(file =>
      /\bimport\(\s*['"][^'"]*(\/gestures\/|\/motion\/|touch-support)/.test(
        fs.readFileSync(file, 'utf8'),
      ),
    );
    expect(dynamic.map(file => path.relative(REPO, file))).toEqual([]);
  });
});

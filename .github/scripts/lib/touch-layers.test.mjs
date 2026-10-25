// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touch-layers.test.mjs
 * Pins the build without touch layers: an entry whose touch layer is imported
 * through the guard documented in packages/core/src/utils/touchLayers.ts,
 * built with the size report's esbuild options (component-size.js), carries 0
 * bytes of the gesture host, the gesture arena, the animator and the touch
 * module when `__ASTRYX_TOUCH__` is defined as false, and carries them
 * without the define.
 */

import fs from 'node:fs';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

/** The guard, spelled as touchLayers.ts documents it. */
const GUARD =
  "typeof __ASTRYX_TOUCH__ === 'undefined' || __ASTRYX_TOUCH__ !== false";

const FLAG_SOURCE = fs.readFileSync(
  path.join(
    import.meta.dirname,
    '../../../packages/core/src/utils/touchLayers.ts',
  ),
  'utf8',
);

/** The touch layer's modules, as core lays them out. */
const LAYER_MODULES = [
  'gestures/GestureHost.js',
  'gestures/GestureArena.js',
  'motion/animator.js',
  'Switch/useSwitchTouch.js',
];

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-touch-layers-'));
const files = {
  // Core's JavaScript is side-effect free; so is the fixture's.
  'package.json': JSON.stringify({type: 'module', sideEffects: false}),
  'gestures/GestureHost.js': `export class GestureHost {
  attach(element) { this.element = element; return 'gesture host'; }
}`,
  'gestures/GestureArena.js': `export class GestureArena {
  claim(recognizer) { this.winner = recognizer; return 'gesture arena'; }
}`,
  'motion/animator.js': `export function animate(element, keyframes) {
  return element.animate(keyframes, {duration: 300, easing: 'linear'});
}`,
  'Switch/useSwitchTouch.js': `import {GestureArena} from '../gestures/GestureArena.js';
import {GestureHost} from '../gestures/GestureHost.js';
import {animate} from '../motion/animator.js';
export function useSwitchTouch(element) {
  const host = new GestureHost();
  new GestureArena().claim(host);
  host.attach(element);
  return animate(element, [{translate: '0'}, {translate: '20px'}]);
}`,
  'Switch/Switch.js': `import {useSwitchTouch} from './useSwitchTouch.js';
function useNoSwitchTouch() {
  return null;
}
const useTouchLayer =
  ${GUARD}
    ? useSwitchTouch
    : useNoSwitchTouch;
export function Switch(element) {
  return {element, touch: useTouchLayer(element)};
}`,
  'entry.js': "export {Switch} from './Switch/Switch.js';",
};
for (const [file, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
  fs.writeFileSync(path.join(root, file), content);
}

afterAll(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

/**
 * Bytes each module contributes to what importing the entry loads eagerly
 * (the entry chunk and the chunks it imports statically), built as the size
 * report builds a component import, plus the given defines.
 */
function eagerBytesByModule(define) {
  const result = esbuild.buildSync({
    absWorkingDir: root,
    entryPoints: [path.join(root, 'entry.js')],
    outdir: path.join(root, 'out'),
    metafile: true,
    bundle: true,
    splitting: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    define: {'process.env.NODE_ENV': '"production"', ...define},
    loader: {'.css': 'empty'},
    write: false,
    logLevel: 'silent',
  });
  const {outputs} = result.metafile;
  const entry = Object.keys(outputs).find(key =>
    outputs[key].entryPoint?.endsWith('entry.js'),
  );
  const seen = new Set();
  const pending = [entry];
  const bytes = {};
  while (pending.length > 0) {
    const key = pending.pop();
    if (seen.has(key)) continue;
    seen.add(key);
    for (const [input, {bytesInOutput}] of Object.entries(
      outputs[key].inputs,
    )) {
      bytes[input] = (bytes[input] ?? 0) + bytesInOutput;
    }
    for (const imported of outputs[key].imports) {
      if (imported.kind === 'import-statement' && !imported.external) {
        pending.push(imported.path);
      }
    }
  }
  return bytes;
}

describe('a build without touch layers', () => {
  it('spells the guard touchLayers.ts documents and evaluates', () => {
    expect(FLAG_SOURCE).toContain(`*     ${GUARD}\n`);
    expect(FLAG_SOURCE).toContain(
      `export const TOUCH_LAYERS: boolean =\n  ${GUARD};`,
    );
  });

  it('carries 0 bytes of the gesture host, arena, animator and touch module', () => {
    const bytes = eagerBytesByModule({__ASTRYX_TOUCH__: 'false'});
    for (const module of LAYER_MODULES) {
      expect(bytes[module] ?? 0, module).toBe(0);
    }
    expect(bytes['Switch/Switch.js']).toBeGreaterThan(0);
  });

  it('carries them without the define, or with it true', () => {
    for (const define of [{}, {__ASTRYX_TOUCH__: 'true'}]) {
      const bytes = eagerBytesByModule(define);
      for (const module of LAYER_MODULES) {
        expect(bytes[module] ?? 0, module).toBeGreaterThan(0);
      }
    }
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-fully-specified.test.mjs
 * Unit tests for the fully-specified-dist gate: every relative specifier in
 * emitted ESM must carry an explicit extension (#4569 shipped a dist whose
 * dynamic `import()` specifiers had none, breaking strict-ESM consumers).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {scanSource, findOffenders} from './check-fully-specified.mjs';

describe('scanSource', () => {
  it('flags an extensionless static import specifier', () => {
    expect(scanSource(`import {x} from './XDSButton';`)).toEqual([
      './XDSButton',
    ]);
  });

  it('flags an extensionless re-export specifier', () => {
    expect(scanSource(`export * from '../utils';`)).toEqual(['../utils']);
  });

  it('flags an extensionless side-effect import', () => {
    expect(scanSource(`import './componentStyles';`)).toEqual([
      './componentStyles',
    ]);
  });

  it('flags an extensionless dynamic import() specifier', () => {
    // The exact emitted shape that broke Rspack consumers in #4569.
    const line = `const LazyXDSTooltip = /*#__PURE__*/lazy(async () => import("../Tooltip/Tooltip").then(mod => ({`;
    expect(scanSource(line)).toEqual(['../Tooltip/Tooltip']);
  });

  it('accepts fully specified and non-relative specifiers', () => {
    const source = [
      `import {jsx} from "react/jsx-runtime";`,
      `import {Tooltip} from "../Tooltip/Tooltip.js";`,
      `import "./reset.css";`,
      `import data from "./data.json";`,
      `const p = import("../Tooltip/Tooltip.js");`,
      `const q = import(someVariable);`,
    ].join('\n');
    expect(scanSource(source)).toEqual([]);
  });

  it('ignores specifiers on comment lines', () => {
    // dist keeps JSDoc usage examples, e.g. layerAnimations.stylex.js and
    // globalIconRegistry.js — those must not fail the gate.
    const source = [
      `/**`,
      ` * import {layerAnimations} from '../Layer/layerAnimations.stylex';`,
      ` * import { brandIcons } from './brand-icons';`,
      ` */`,
      `// import {x} from './commented-out';`,
      `export const ok = 1;`,
    ].join('\n');
    expect(scanSource(source)).toEqual([]);
  });
});

describe('findOffenders', () => {
  let distDir;

  beforeAll(() => {
    distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fully-specified-'));
    fs.writeFileSync(
      path.join(distDir, 'clean.js'),
      `import {x} from './other.js';\nexport const y = 1;\n`,
    );
    fs.mkdirSync(path.join(distDir, 'Text'));
    fs.writeFileSync(
      path.join(distDir, 'Text', 'Text.js'),
      `const L = lazy(() => import('../Tooltip/Tooltip'));\n`,
    );
    // Non-runtime files are not scanned.
    fs.writeFileSync(
      path.join(distDir, 'Text', 'Text.d.ts'),
      `export * from '../types';\n`,
    );
  });

  afterAll(() => {
    fs.rmSync(distDir, {recursive: true, force: true});
  });

  it('reports offending runtime files with their bad specifiers', () => {
    expect(findOffenders(distDir)).toEqual([
      {
        file: path.join('Text', 'Text.js'),
        specifiers: ['../Tooltip/Tooltip'],
      },
    ]);
  });
});

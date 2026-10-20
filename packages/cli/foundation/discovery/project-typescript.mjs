// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Find the project's own TypeScript compiler.
 *
 * @input Directories to resolve `typescript` from, in order.
 * @output The compiler module and its version; or, when the only TypeScript
 *   installed has no JavaScript compiler API to read types with, its version
 *   alone; or null when none is installed.
 * @position Shared by the author checks that read source with the project's
 *   compiler, so each finds it, and says why it cannot use it, the same way.
 */

import * as path from 'node:path';
import {createRequire} from 'node:module';

/**
 * Resolve the project's own `typescript`, trying each directory in order.
 * @param {Array<string | null | undefined>} dirs
 * @returns {{ts: any, version: string} | {ts: null, version: string} | null}
 *   `ts: null` when a TypeScript is installed but has no `createProgram`
 */
export function resolveProjectTypeScript(dirs) {
  /** @type {string | null} */
  let unusable = null;
  for (const dir of dirs) {
    if (!dir) continue;
    const require = createRequire(path.join(path.resolve(dir), 'package.json'));
    /** The version of the `typescript` package installed here, or null. */
    const installed = () => {
      try {
        const {version} = require('typescript/package.json');
        return typeof version === 'string' && version !== '' ? version : null;
      } catch {
        return null;
      }
    };
    try {
      const ts = require('typescript');
      if (ts && typeof ts.createProgram === 'function') {
        return {ts, version: String(ts.version)};
      }
      unusable ??= installed();
    } catch {
      // Not installed from here, or installed without an entry this CLI can
      // load; try the next directory.
      unusable ??= installed();
    }
  }
  return unusable ? {ts: null, version: unusable} : null;
}

/**
 * Why a check that needs the compiler did not run, when the TypeScript
 * installed has no JavaScript compiler API.
 * @param {string} version
 * @param {string} outcome what was not done, such as `docs were not checked`
 */
export function unusableTypeScriptReason(version, outcome) {
  return `TypeScript ${version} is installed in this project, but it has no JavaScript compiler API (\`createProgram\`) to read types with, so ${outcome}.`;
}

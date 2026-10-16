// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Find the project's own TypeScript compiler.
 *
 * @input Directories to resolve `typescript` from, in order.
 * @output The compiler module and its version, or null when none resolves.
 * @position Shared by the author checks that read source with the project's
 *   compiler, so each finds it the same way.
 */

import * as path from 'node:path';
import {createRequire} from 'node:module';

/**
 * Resolve the project's own `typescript`, trying each directory in order.
 * @param {Array<string | null | undefined>} dirs
 * @returns {{ts: any, version: string} | null}
 */
export function resolveProjectTypeScript(dirs) {
  for (const dir of dirs) {
    if (!dir) continue;
    try {
      const require = createRequire(
        path.join(path.resolve(dir), 'package.json'),
      );
      const ts = require('typescript');
      if (ts && typeof ts.createProgram === 'function') {
        return {ts, version: String(ts.version)};
      }
    } catch {
      // Not installed from here; try the next directory.
    }
  }
  return null;
}

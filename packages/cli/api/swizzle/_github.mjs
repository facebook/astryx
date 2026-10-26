// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file GitHub utilities for Astryx CLI
 *
 * Shared helpers for the GitHub CLI (`gh`).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Whether the `gh` CLI is available: an executable `gh` on `PATH` (with a
 * `PATHEXT` extension on Windows), found without running it. A swizzle only
 * offers a ready `gh issue create` line, and running `gh` would make every
 * copy wait on a process start, and for `gh auth status` on GitHub, before it
 * can report what it wrote.
 * @param {NodeJS.ProcessEnv} [env]
 * @param {NodeJS.Platform} [platform]
 * @returns {boolean}
 */
export function checkGhCli(env = process.env, platform = process.platform) {
  const windows = platform === 'win32';
  const names = windows
    ? (env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD')
        .split(';')
        .filter(Boolean)
        .map(extension => `gh${extension.toLowerCase()}`)
    : ['gh'];
  const delimiter = windows ? ';' : path.delimiter;
  for (const dir of (env.PATH ?? env.Path ?? '').split(delimiter)) {
    if (!dir) continue;
    for (const name of names) {
      try {
        const stat = fs.statSync(path.join(dir, name));
        if (stat.isFile() && (windows || (stat.mode & 0o111) !== 0)) {
          return true;
        }
      } catch {
        // Not here.
      }
    }
  }
  return false;
}

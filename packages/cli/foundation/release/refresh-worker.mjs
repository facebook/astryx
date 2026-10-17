// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The background check, as its own detached process.
 *
 * Started by `maybeStartCheck` (global-state.mjs) with one argument, the
 * cache directory. It writes nothing to any stream and never reaches a
 * person: it is not a command and takes no options. Its whole job is
 * `runCheck`.
 *
 * @input  argv[2]: the cache directory
 * @output the updated global state on disk
 * @position foundation/release — the only detached process the CLI starts.
 */

import {runCheck} from './global-state.mjs';

const cacheDir = process.argv[2];
if (cacheDir) {
  try {
    runCheck({cacheDir});
  } catch {
    // A failed check leaves the current release answering.
  }
}

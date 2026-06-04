#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import {program} from '../src/index.mjs';
import {isJsonMode, toErrorEnvelope} from '../src/lib/json.mjs';
import {handleCommanderError} from '../src/lib/json-shim.mjs';

/**
 * Top-level error boundary (contract guarantee #4): an uncaught throw must
 * never reach a --json consumer as a raw stack trace. If we're in JSON mode,
 * convert it to the contract's error envelope on stdout and exit 1; otherwise
 * preserve the normal human-facing behavior.
 *
 * We detect JSON mode two ways: the global flag (set once root options are
 * parsed) and a raw argv check, since a throw can occur during parsing/command
 * load — before the preAction hook engages the flag.
 */
function inJsonMode() {
  return isJsonMode() || process.argv.slice(2).includes('--json');
}

function handleFatal(err) {
  // CommanderError (parse errors, --help, unknown command) routes
  // through the JSON shim so that a --json consumer always gets a
  // valid envelope and the right exit code. handleCommanderError
  // calls process.exit when it owns the error.
  if (handleCommanderError(err)) return;

  if (inJsonMode()) {
    // Only emit if a command didn't already produce an envelope.
    if (!process.__xdsJsonHandled) {
      process.__xdsJsonHandled = true;
      console.log(JSON.stringify(toErrorEnvelope(err), null, 2));
    }
    process.exit(1);
  }
  // Human mode: preserve Commander/Node default-ish behavior.
  console.error(err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
}

process.on('unhandledRejection', handleFatal);
process.on('uncaughtException', handleFatal);

try {
  await program.parseAsync(process.argv);
} catch (err) {
  handleFatal(err);
}

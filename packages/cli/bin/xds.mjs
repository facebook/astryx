#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

// ---------------------------------------------------------------------------
// Node.js version preflight gate.
//
// The CLI and its dependencies use `styleText` from `node:util`, added in Node
// 22.13.0. On older runtimes the lazy-loaded subcommands die with a cryptic
// ESM error ("...does not provide an export named 'styleText'"). To give users
// a clear message instead, we check the running version FIRST, using only
// built-ins, and exit early before importing anything that touches styleText.
//
// `node-version.mjs` is intentionally dependency-free so it loads on the
// unsupported runtimes this guard protects against.
import {
  isNodeVersionSupported,
  unsupportedNodeMessage,
} from '../src/lib/node-version.mjs';

if (!isNodeVersionSupported(process.versions.node)) {
  const msg = unsupportedNodeMessage(process.versions.node);
  // Honor the --json contract even at this pre-import gate. We can't import
  // json.mjs here (it transitively loads styleText, the very thing this gate
  // protects against), so emit a minimal hand-rolled envelope. The shape and
  // the stable `code` (ERR_NODE_VERSION) match error-codes.mjs.
  if (process.argv.slice(2).includes('--json')) {
    console.log(
      JSON.stringify(
        {apiVersion: 1, error: msg, code: 'ERR_NODE_VERSION'},
        null,
        2,
      ),
    );
  } else {
    console.error(msg);
  }
  process.exit(1);
}

// Imports that transitively load `styleText` must happen AFTER the gate above,
// so they are dynamically imported here rather than at the top of the module.
const {program} = await import('../src/index.mjs');
const {isJsonMode, toErrorEnvelope} = await import('../src/lib/json.mjs');
const {handleCommanderError} = await import('../src/lib/json-shim.mjs');

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

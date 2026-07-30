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
//
// Sibling package modules (e.g. `cli/`, `lib/`) are resolved by this bin's REAL
// path. When the CLI is installed as a package, `npx astryx` runs this file
// through the `node_modules/.bin/astryx` symlink, and some Node versions resolve
// relative specifiers from the symlink's directory rather than the real package
// — breaking bare `../…` imports with a cryptic ERR_MODULE_NOT_FOUND.
// realpath-ing `import.meta.url` makes these imports resolve correctly however
// the bin is invoked (symlink, copy, or Windows shim). Uses only built-ins, so
// the version gate below still runs first.
import {fileURLToPath, pathToFileURL} from 'node:url';
import {realpathSync} from 'node:fs';
import {dirname, join} from 'node:path';

const binDir = dirname(realpathSync(fileURLToPath(import.meta.url)));
/** @param {string} rel */
const importSrc = rel =>
  import(pathToFileURL(join(binDir, '..', rel)).href);

const {isNodeVersionSupported, unsupportedNodeMessage} =
  await importSrc('lib/node-version.mjs');

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
const {program} = await importSrc('cli/index.mjs');
const {isJsonMode, toErrorEnvelope} = await importSrc('lib/json.mjs');
const {handleCommanderError} = await importSrc('lib/json-shim.mjs');

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

/** @param {unknown} err */
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

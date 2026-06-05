// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Commander shim that extends the --json contract to cover
 * Commander's parse-time short-circuits (parse errors, unknown options,
 * --help display, unknown subcommands).
 *
 * Background: PR #2467 set up the --json envelope and a `preAction` gate.
 * That works for the normal command-execution path, but Commander's own
 * error and help paths run BEFORE preAction:
 *
 *   - Missing required argument / unknown option → `_displayError`
 *     writes "error: ..." to stderr and calls `_exit(1)` synchronously.
 *   - `--help` → `outputHelp()` writes raw "Usage:" text to stdout
 *     and calls `_exit(0)`.
 *
 * Neither path emits the JSON envelope, and neither throws (so the
 * try/catch in `bin/xds.mjs` never sees them). The result: a --json
 * consumer receives empty stdout + raw stderr, breaking the contract.
 *
 * The shim closes the gap by:
 *   1. Calling `exitOverride()` so Commander throws CommanderError
 *      instead of calling `process.exit` synchronously.
 *   2. Routing those errors through a single handler that emits a
 *      JSON error envelope when --json is in argv.
 *   3. Overriding each command's `outputHelp` so --help emits a
 *      structured JSON help envelope (instead of raw text) when
 *      --json is set.
 *   4. Routing unknown-subcommand attempts through the same error
 *      envelope path (so `xds bogus-cmd --json` gets exit 1 + envelope
 *      instead of exit 0 + help envelope).
 *
 * Non-JSON behavior is preserved exactly: every code path that printed
 * to stderr before still prints to stderr. Commander writes its
 * "error: ..." line via configureOutput.writeErr, which we pass
 * through verbatim outside of --json mode.
 */

import {API_VERSION, isJsonMode, toErrorEnvelope} from './json.mjs';

/**
 * Cheap argv check used before preAction has had a chance to engage
 * `setJsonMode`. We can't rely on `program.opts().json` here because
 * Commander throws during parse — opts may not be populated yet.
 * @returns {boolean}
 */
function argvHasJson() {
  return process.argv.slice(2).includes('--json');
}

/** @returns {boolean} */
function jsonActive() {
  return isJsonMode() || argvHasJson();
}

/**
 * Build a structured JSON help envelope for a given Commander command.
 * Mirrors the existing root help envelope shape, but works for any
 * subcommand (e.g. `xds component --help --json`).
 *
 * @param {import('commander').Command} cmd
 * @returns {{apiVersion: number, type: 'help', data: object}}
 */
export function buildHelpEnvelope(cmd) {
  // Reconstruct the fully-qualified command name (e.g. "xds theme build").
  const nameParts = [];
  let c = cmd;
  while (c) {
    nameParts.unshift(c.name());
    c = c.parent;
  }

  /** @type {Array<{flags: string, description: string, defaultValue?: unknown, choices?: string[]}>} */
  const options = cmd.options.map((o) => {
    /** @type {any} */
    const opt = {flags: o.flags, description: o.description || ''};
    if (o.defaultValue !== undefined) opt.defaultValue = o.defaultValue;
    if (Array.isArray(o.argChoices) && o.argChoices.length) opt.choices = o.argChoices;
    return opt;
  });

  const subcommands = cmd.commands
    .filter((s) => !s._hidden)
    .map((s) => ({name: s.name(), description: s.description() || ''}));

  return {
    apiVersion: API_VERSION,
    type: 'help',
    data: {
      command: nameParts.join(' '),
      description: cmd.description() || '',
      usage: `${nameParts.join(' ')} ${cmd.usage()}`.trim(),
      options,
      subcommands,
    },
  };
}

/**
 * Emit a JSON error envelope to stdout (the JSON contract uses stdout
 * for both success and error).
 *
 * @param {string} message
 * @param {Array<{name: string, reason: string}>} [suggestions]
 */
function emitJsonError(message, suggestions) {
  if (process.__xdsJsonHandled) return;
  process.__xdsJsonHandled = true;
  const env = toErrorEnvelope(message, suggestions);
  process.stdout.write(`${JSON.stringify(env, null, 2)}\n`);
}

/**
 * Install the shim on a Commander program. Idempotent — safe to call
 * once at program-construction time.
 *
 * @param {import('commander').Command} program
 */
export function installJsonShim(program) {
  // exitOverride() and configureOutput() do NOT auto-cascade to
  // subcommands that were registered BEFORE the shim runs (Commander
  // copies these settings from parent at command-creation time, not
  // at parse time). So we walk the whole tree and apply them
  // explicitly to every node.
  applyShimRecursively(program);

  // Don't tack the help text onto error output. We render help
  // ourselves (or as JSON) and don't want Commander's stderr help dump
  // interleaving with our error envelope.
  program.showHelpAfterError(false);

  // Patch outputHelp on every command (root + subcommands) so
  // `--help` emits a JSON envelope when --json is active. Commander
  // creates subcommands lazily, so wrap recursively + patch any
  // new ones added later by walking after registration.
  patchHelpRecursively(program);
}

/**
 * Apply exitOverride and JSON-aware configureOutput to a command and
 * all of its descendants. We do this recursively because Commander
 * only copies these settings to children created AFTER the parent is
 * configured — and our subcommands were already registered by the
 * time installJsonShim runs.
 *
 * @param {import('commander').Command} cmd
 */
function applyShimRecursively(cmd) {
  cmd.exitOverride();
  cmd.configureOutput({
    writeOut: (str) => process.stdout.write(str),
    writeErr: (str) => {
      // Suppress Commander's "error: ..." stderr line when --json is
      // active, so a JSON consumer parsing both streams doesn't see
      // it alongside the envelope. Non-JSON callers are unaffected.
      if (jsonActive()) return;
      process.stderr.write(str);
    },
  });
  for (const sub of cmd.commands) {
    applyShimRecursively(sub);
  }
}

/**
 * Walk the command tree and override outputHelp on every command so that
 * `--help --json` emits a structured help envelope instead of raw text.
 *
 * @param {import('commander').Command} cmd
 */
function patchHelpRecursively(cmd) {
  patchOutputHelp(cmd);
  for (const sub of cmd.commands) {
    patchHelpRecursively(sub);
  }
  // If new subcommands are added later (via commands.push or
  // .command(...)), patch them on first .help()/--help. Commander
  // doesn't fire an event for command registration, so we hook into
  // Command.prototype here (one-time, idempotent).
  if (!Command_outputHelp_patched) {
    patchPrototype(cmd.constructor);
    Command_outputHelp_patched = true;
  }
}

let Command_outputHelp_patched = false;

/**
 * Replace outputHelp on a single Command instance.
 * @param {import('commander').Command} cmd
 */
function patchOutputHelp(cmd) {
  if (cmd.__xdsHelpPatched) return;
  cmd.__xdsHelpPatched = true;
  const original = cmd.outputHelp.bind(cmd);
  cmd.outputHelp = function patchedOutputHelp(contextOptions) {
    if (jsonActive()) {
      if (!process.__xdsJsonHandled) {
        process.__xdsJsonHandled = true;
        const env = buildHelpEnvelope(cmd);
        process.stdout.write(`${JSON.stringify(env, null, 2)}\n`);
      }
      return;
    }
    return original(contextOptions);
  };
}

/**
 * Patch Command.prototype so that any subcommand created after install
 * also gets the JSON help override. Belt-and-suspenders for late-bound
 * commands.
 * @param {Function} CommandCtor
 */
function patchPrototype(CommandCtor) {
  const proto = CommandCtor.prototype;
  if (proto.__xdsHelpPatched) return;
  proto.__xdsHelpPatched = true;
  const original = proto.outputHelp;
  proto.outputHelp = function patchedProtoOutputHelp(contextOptions) {
    if (jsonActive()) {
      if (!process.__xdsJsonHandled) {
        process.__xdsJsonHandled = true;
        const env = buildHelpEnvelope(this);
        process.stdout.write(`${JSON.stringify(env, null, 2)}\n`);
      }
      return;
    }
    return original.call(this, contextOptions);
  };
}

/**
 * Convert a CommanderError thrown during parse into either a JSON
 * envelope (under --json) or the legacy stderr behavior, then exit
 * with the right code.
 *
 * Codes we care about (Commander 14):
 *   commander.helpDisplayed       — `--help` was used (exit 0)
 *   commander.help                — same family (exit 0)
 *   commander.version             — `--version` was used (exit 0)
 *   commander.unknownCommand      — `xds bogus-cmd`
 *   commander.unknownOption       — `--bogus-flag`
 *   commander.missingArgument     — `xds theme build` (no <file>)
 *   commander.invalidArgument     — bad value for argParser
 *   commander.invalidOptionArgument
 *   commander.excessArguments
 *
 * @param {unknown} err
 * @returns {boolean} true if handled (caller should not re-throw)
 */
export function handleCommanderError(err) {
  if (!err || typeof err !== 'object' || !('code' in err)) return false;
  const code = /** @type {{code?: string, exitCode?: number, message?: string}} */ (err).code;
  if (typeof code !== 'string' || !code.startsWith('commander.')) return false;

  const exitCode = /** @type {{exitCode?: number}} */ (err).exitCode ?? 1;
  const message = /** @type {{message?: string}} */ (err).message ?? '';

  // Help / version success paths — Commander already wrote the output
  // (via our patched outputHelp for help; via its own writer for version,
  // which we handle separately in index.mjs argv preflight). Just exit
  // with the right code.
  if (
    code === 'commander.helpDisplayed' ||
    code === 'commander.help' ||
    code === 'commander.version'
  ) {
    process.exit(exitCode);
  }

  // Real error paths.
  if (jsonActive()) {
    // Strip Commander's "error: " prefix — the envelope key is `error`
    // already, doubled "error" is noise.
    const cleaned = message.replace(/^error:\s*/i, '');
    emitJsonError(cleaned);
  } else {
    // Non-JSON mode: Commander already wrote the "error: ..." line
    // to stderr via configureOutput.writeErr before throwing the
    // CommanderError. Nothing to do — exit with the original code.
  }
  process.exit(exitCode || 1);
}

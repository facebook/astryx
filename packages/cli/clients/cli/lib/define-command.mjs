// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The CommandDoc -> Commander converter. One place turns a typed
 * `CommandDoc` (+ the FunctionDoc it wraps, for inherited param descriptions)
 * into a configured Commander command, so `--help` and the manifest can be
 * sourced from the same colocated docs that feed `astryx docs` and the docsite.
 *
 * The CommandDoc type lives in `@astryxdesign/cli/authoring` with no Commander
 * dependency; this converter is the CLI-side adapter. Only the metadata is
 * generic — each command still supplies its own action (the thin wrapper that
 * calls the api function and renders).
 *
 * It is also where a run's RESULT is recorded. Every command that ships passes
 * through here, so an action returns a {@link CommandResult} and this converter
 * stamps it onto the run's debug event — one place, for all of them. That is
 * deliberate: reporting used to be a call each command made on its way out, and
 * a command that forgot simply reported nothing. Now the return type asks the
 * question at authoring time and the converter answers it at runtime, so a new
 * command is logged correctly without doing anything at all.
 *
 * @input a CommandDoc (+ optional FunctionDoc) + an action returning a result
 * @output a configured commander Command added to the given parent
 * @position packages/cli/clients/cli/lib — CLI command converter
 */

import {recordCommandResult} from '../../../foundation/debug/index.mjs';

/**
 * Marks a Commander command that reports what it answered with, and says HOW:
 * `converter` for the contract path below (the action's return type), `manual`
 * for the few hand-registered commands that record for themselves.
 *
 * Read by the coverage test that walks the assembled program, so a command
 * registered by hand — bypassing the contract — is caught in CI rather than
 * discovered as a column of nulls months later. The two values are what let
 * that test PIN the hand-registered set instead of trusting the mark.
 */
export const REPORTS_RESULT = Symbol.for('astryx.command.reportsResult');

/**
 * Does this command report what it answered with?
 * @param {import('commander').Command} cmd
 * @returns {boolean}
 */
export function reportsResult(cmd) {
  return reportsResultVia(cmd) !== null;
}

/**
 * How this command reports, or null if it does not.
 * @param {import('commander').Command} cmd
 * @returns {'converter' | 'manual' | null}
 */
export function reportsResultVia(cmd) {
  const via = /** @type {any} */ (cmd)?.[REPORTS_RESULT];
  return via === 'converter' || via === 'manual' ? via : null;
}

/**
 * Mark a hand-registered command as reporting its result.
 *
 * For the handful of commands that cannot come from a CommandDoc — the root
 * program, `manifest` (it introspects the live program, so it cannot be
 * declared by one), `postinstall`, and the stub left behind when a command
 * module fails to load. They call {@link recordCommandResult} themselves; this
 * says so, and the coverage test pins the set of commands allowed to, so the
 * mark cannot become a quiet way around the contract.
 *
 * @param {import('commander').Command} cmd
 * @returns {import('commander').Command} the same command, for chaining.
 */
export function markReportsResult(cmd) {
  Object.defineProperty(cmd, REPORTS_RESULT, {
    value: 'manual',
    configurable: true,
  });
  return cmd;
}

/**
 * Build a Commander command from a CommandDoc and attach it to `parent`.
 *
 * @param {import('commander').Command} parent - program or a group command.
 * @param {import('@astryxdesign/cli/authoring').CommandDoc} doc
 * @param {{
 *   fn?: import('@astryxdesign/cli/authoring').FunctionDoc,
 *   action?: (...args: any[]) => import('../../../foundation/debug/command-result.mjs').CommandResult
 *     | Promise<import('../../../foundation/debug/command-result.mjs').CommandResult>,
 * }} [impl]
 * @returns {import('commander').Command} the created command.
 */
export function defineCommand(parent, doc, {fn, action} = {}) {
  // The command token is the last path segment ("theme build" -> "build"),
  // since subcommands are added to their group command, not the program.
  const token = doc.name.split(' ').pop() ?? doc.name;
  const argSpec = (doc.args ?? [])
    .map(a => {
      const inner = a.variadic ? `${a.name}...` : a.name;
      return a.required ? `<${inner}>` : `[${inner}]`;
    })
    .join(' ');

  const cmd = parent.command(argSpec ? `${token} ${argSpec}` : token);
  if (doc.summary) cmd.description(doc.summary);

  const paramDesc = (/** @type {string | undefined} */ name) =>
    (fn?.params ?? []).find(p => p.name === name)?.description ?? '';

  for (const arg of doc.args ?? []) {
    // Only set an arg description when the doc gives one explicitly. Commander
    // renders an "Arguments:" help section only for described args; inheriting
    // the FunctionDoc param description here would add that section where the
    // current CLI has none. (Docsite/`astryx docs` read the arg's `param` for
    // its description instead.)
    if (arg.description) {
      const argument = cmd.registeredArguments?.find(a => a.name() === arg.name);
      if (argument) argument.description = arg.description;
    }
  }

  for (const o of doc.options ?? []) {
    const desc = o.description ?? (o.param ? paramDesc(o.param) : '');
    const option = cmd.createOption(o.flag, desc);
    if (o.default != null) option.default(o.default);
    cmd.addOption(option);
  }

  // `choices` and `examples` are doc metadata surfaced by `astryx docs` and the
  // doc site; they are intentionally NOT injected into `--help` here. Choices
  // stay described in the option text (Commander `.choices()` would also change
  // validation from the api layer's ERR_INVALID_ARGUMENT), and the current CLI
  // help carries no per-command examples epilog. Keeping both out preserves the
  // exact `--help`/manifest surface as registrations migrate to this converter.

  if (action) {
    // The recording seam. An action's job ends at "here is what I answered
    // with"; getting that onto the event is this converter's job, and doing it
    // here means every command is covered by construction — including the ones
    // written next month.
    cmd.action(async (/** @type {any[]} */ ...args) => {
      const result = await action(...args);
      recordCommandResult(result);
    });
    Object.defineProperty(cmd, REPORTS_RESULT, {
      value: 'converter',
      configurable: true,
    });
  }
  return cmd;
}

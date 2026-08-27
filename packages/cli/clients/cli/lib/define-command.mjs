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
 * @input a CommandDoc (+ optional FunctionDoc) + an action
 * @output a configured commander Command added to the given parent
 * @position packages/cli/clients/cli/lib — CLI command converter
 */

/**
 * Build a Commander command from a CommandDoc and attach it to `parent`.
 *
 * @param {import('commander').Command} parent - program or a group command.
 * @param {import('@astryxdesign/cli/authoring').CommandDoc} doc
 * @param {{fn?: import('@astryxdesign/cli/authoring').FunctionDoc, action?: (...args: any[]) => unknown}} [impl]
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

  if (action) cmd.action(/** @type {(...args: any[]) => void | Promise<void>} */ (action));
  return cmd;
}

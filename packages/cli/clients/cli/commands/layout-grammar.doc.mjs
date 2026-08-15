// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx layout grammar`. The terminal binding of the
 * `layoutGrammar()` function (referenced via `fn`); it carries only CLI-surface
 * facts so a converter can build Commander config + --help from one source of
 * truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'layout grammar',
  displayName: 'astryx layout grammar',
  namespace: 'cli',
  summary:
    'Print the XLE/XLO cheatsheet (alias table generated from this branch)',
  description:
    'Prints the XLE/XLO grammar cheatsheet for writing layout expressions, with the alias ' +
    "table generated from this install's registry so short names always reflect the " +
    'components actually available.',
  fn: 'layoutGrammar',
  examples: [{label: 'Get the cheatsheet', cli: 'astryx layout grammar'}],
  exitCodes: [
    {code: 0, when: 'success'},
    {code: 1, when: 'the component registry cannot be read'},
  ],
  related: ['layout expand', 'layout check'],
};

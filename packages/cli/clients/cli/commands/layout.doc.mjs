// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for the `astryx layout` command group. A parent group with no
 * behavior of its own; it dispatches to the expand/check/grammar subcommands,
 * which carry the actual args, flags, and wrapped functions.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'layout',
  displayName: 'astryx layout',
  namespace: 'cli',
  summary: 'Generate XDS layouts from compressed expressions (XLE/XLO)',
  description:
    'The layout command group. Running astryx layout with no subcommand prints the ' +
    'subcommand list; the work happens in the subcommands: expand an expression into ' +
    'TSX (expand), validate one (check), or print the grammar cheatsheet (grammar).',
  subcommands: ['expand', 'check', 'grammar'],
  examples: [
    {label: 'Print the grammar', cli: 'astryx layout grammar'},
    {
      label: 'Expand to TSX',
      cli: "astryx layout expand 'V[g6] > C{card-callout}*4' ./src/Page.tsx",
    },
  ],
  exitCodes: [
    {code: 0, when: 'success (help shown, or a subcommand succeeded)'},
    {code: 1, when: 'an unknown subcommand'},
  ],
  related: ['template', 'build'],
};

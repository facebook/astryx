// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for the `astryx experimental` command group: the one
 * namespace for experimental CLI commands (spec:AST-017 FR27). Each
 * experiment is a subcommand of it; none is added to a stable command.
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'experimental',
  displayName: 'astryx experimental',
  namespace: 'cli/commands',
  stability: 'experimental',
  summary: 'Try features that may change or be removed in a patch release',
  description:
    'The experimental command group. Every command under it is experimental: its arguments, options, output, and JSON may change or be removed in any patch release, with no deprecation period. A feature leaves this group when it becomes stable. Nothing here changes what any other command does unless you use it.',
  subcommands: ['icon'],
  examples: [
    {label: 'List the experiments', cli: 'astryx experimental'},
    {label: 'Find an icon by meaning', cli: 'astryx experimental icon delete'},
  ],
  exitCodes: [
    {code: 0, when: 'help is shown or a subcommand succeeds'},
    {code: 1, when: 'an unknown subcommand or a subcommand failure'},
  ],
};

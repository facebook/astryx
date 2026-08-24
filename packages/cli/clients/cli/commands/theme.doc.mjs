// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for the `astryx theme` command group. A parent group with no
 * behavior of its own; it dispatches to the build/add/list subcommands, which
 * carry the actual args, flags, and wrapped functions.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme',
  displayName: 'astryx theme',
  namespace: 'cli',
  summary: 'Theme tools: build, export, and manage themes',
  description:
    'The theme command group. Running astryx theme with no subcommand prints the ' +
    'subcommand list; the work happens in the subcommands: compile a theme (build), ' +
    'scaffold one into your project (add), start a custom one from the annotated template (template), ' +
    'list the bundled themes (list), or list the component theming targets a theme can override (targets).',
  subcommands: ['build', 'add', 'list', 'template', 'targets'],
  examples: [
    {label: 'List bundled themes', cli: 'astryx theme list'},
    {label: 'Scaffold a theme', cli: 'astryx theme add matcha'},
    {label: 'See what a theme can override', cli: 'astryx theme targets'},
  ],
  exitCodes: [
    {code: 0, when: 'success (help shown, or a subcommand succeeded)'},
    {code: 1, when: 'an unknown subcommand'},
  ],
  related: ['init'],
};

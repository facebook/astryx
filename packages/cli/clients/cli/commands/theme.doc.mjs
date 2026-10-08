// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for the `astryx theme` command group. It is a real group,
 * not a compatibility alias. Its subcommands own the work.
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme',
  displayName: 'astryx theme',
  namespace: 'cli/commands',
  summary: 'Add, switch, build, and author themes',
  description:
    'The theme command group. Import built themes into an app, choose its default, remove them, list available and added themes, or eject source to make a local fork. Plain theme add still copies source while that default is deprecated. The authoring commands build themes, generate palettes, write the annotated template, and list component theme targets.',
  subcommands: [
    'build',
    'list',
    'add',
    'remove',
    'use',
    'eject',
    'template',
    'palette',
    'targets',
  ],
  examples: [
    {label: 'List available and added themes', cli: 'astryx theme list'},
    {label: 'Import a theme into the app', cli: 'astryx theme add ocean --import'},
    {label: 'Choose the default', cli: 'astryx theme use ocean'},
    {label: 'Fork source to customize', cli: 'astryx theme eject ocean'},
    {
      label: 'Generate a palette candidate',
      cli: 'astryx theme palette generate palette.config.json',
    },
    {label: 'See what a theme can override', cli: 'astryx theme targets'},
  ],
  exitCodes: [
    {code: 0, when: 'help is shown or a subcommand succeeds'},
    {code: 1, when: 'an unknown subcommand or a subcommand failure'},
  ],
  related: ['init'],
};

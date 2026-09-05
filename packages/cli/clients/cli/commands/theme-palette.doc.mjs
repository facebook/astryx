// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme palette',
  displayName: 'astryx theme palette',
  namespace: 'cli',
  summary: 'Create and work with theme-owned color palettes',
  description:
    'Palette authoring tools. The initial generate command creates reviewable candidates. ' +
    'Palette inspection and diagnostic commands are intentionally deferred to follow-up work.',
  subcommands: ['generate'],
  examples: [
    {
      label: 'Generate a candidate',
      cli: 'astryx theme palette generate palette.config.json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'help is shown or a subcommand succeeds'},
    {code: 1, when: 'an unknown subcommand is provided'},
  ],
  related: ['theme build', 'theme template'],
};

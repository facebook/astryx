// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'integration',
  displayName: 'astryx integration',
  namespace: 'cli',
  summary: 'Author and verify an Astryx integration package',
  description:
    'Add contributions that are valid on arrival, then prove the packed package exposes the same contributions a consumer will receive.',
  subcommands: ['add', 'pack'],
  examples: [
    {
      label: 'Add a component',
      cli: 'astryx integration add component AcmeWidget',
    },
    {
      label: 'Check the package tarball',
      cli: 'astryx integration pack --check',
    },
  ],
  exitCodes: [
    {code: 0, when: 'help is shown or a subcommand succeeds'},
    {code: 1, when: 'an unknown subcommand is provided'},
  ],
  related: ['doctor integration', 'theme add'],
};

// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'integration pack',
  displayName: 'astryx integration pack',
  namespace: 'cli/commands',
  summary: 'Deprecated: the old name of `integration verify`',
  description:
    '`astryx integration pack --check` is the name this check had before {@link command:integration verify}. It still runs the same check, with the same output, JSON, and exit codes, and prints a note that names `integration verify`. It will be removed in a later release.',
  fn: 'integrationPackCheck',
  options: [
    {
      flag: '--check',
      description: 'Run the check. Required, as before.',
    },
  ],
  examples: [
    {label: 'The old spelling', cli: 'astryx integration pack --check'},
  ],
  exitCodes: [
    {code: 0, when: 'the packed package exposes the same valid contributions'},
    {
      code: 1,
      when: '--check is omitted or the tarball is incomplete or invalid',
    },
  ],
  related: ['integration verify'],
};

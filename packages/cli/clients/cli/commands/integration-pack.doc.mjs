// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'integration pack',
  displayName: 'astryx integration pack',
  namespace: 'cli',
  summary: 'Prove the packed integration is what consumers receive',
  description:
    'Runs the package lifecycle, packs with npm, checks every required contribution file against the real tarball, extracts it into a scratch consumer, and compares the local and packed contribution inventories through one shared contract.',
  fn: 'integrationPackCheck',
  options: [
    {
      flag: '--check',
      description: 'Run the packed-package verification gate',
    },
  ],
  examples: [
    {label: 'Verify before publishing', cli: 'astryx integration pack --check'},
    {
      label: 'Machine-readable result',
      cli: 'astryx integration pack --check --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the packed package exposes the same valid contributions'},
    {
      code: 1,
      when: '--check is omitted or the tarball is incomplete or invalid',
    },
  ],
  related: ['integration add', 'doctor integration validate'],
};

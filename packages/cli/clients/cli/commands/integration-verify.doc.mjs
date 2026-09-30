// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'integration verify',
  displayName: 'astryx integration verify',
  namespace: 'cli/commands',
  summary: 'Check the package the way npm will publish it, before you publish',
  description:
    'Packs the package with npm, installs the tarball into a temporary app, and checks that the app sees the same components, templates, themes, docs, and codemods as the package, that every public import resolves, and that the package declares a CLI new enough to read it. It publishes nothing and leaves no tarball behind. It runs the package\'s own pack lifecycle scripts, as `npm pack` does.',
  fn: 'integrationPackCheck',
  examples: [
    {label: 'Check before publishing', cli: 'astryx integration verify'},
    {label: 'Machine-readable result', cli: 'astryx integration verify --json'},
  ],
  exitCodes: [
    {code: 0, when: 'the packed package exposes the same valid contributions'},
    {code: 1, when: 'the tarball is incomplete or invalid'},
  ],
  related: ['integration add', 'doctor integration validate'],
};

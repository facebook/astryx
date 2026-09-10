// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx doctor integration docs`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'doctor integration docs',
  displayName: 'astryx doctor integration docs',
  namespace: 'cli',
  summary: 'Classify integration doc overlaps with Core topics',
  description:
    'Reports intentional Core topic replacements and extensions as information. ' +
    'A same-name topic without `replaces` or `extends` is an accidental conflict ' +
    'and fails until the author declares the relationship or renames it.',
  fn: 'integrationDocConflicts',
  args: [
    {
      name: 'package',
      param: 'pkg',
      required: false,
      description:
        'Installed integration package name; omit to check the package in the current directory.',
    },
  ],
  examples: [
    {label: 'Check the local integration', cli: 'astryx doctor integration docs'},
    {
      label: 'Check an installed integration',
      cli: 'astryx doctor integration docs @acme/widgets --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'all Core overlaps are explicitly declared or no overlap exists'},
    {code: 1, when: 'an overlap is accidental or the integration docs are invalid'},
  ],
  related: ['doctor integration validate', 'docs'],
};
